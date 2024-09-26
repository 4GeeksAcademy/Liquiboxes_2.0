from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db, Sale, SaleDetail, User, ShopSale, MysteryBox, Shop, Notification, BoxItem
from sqlalchemy.exc import SQLAlchemyError
import logging
import stripe
import os
import random
from datetime import datetime



stripe.api_key = os.getenv('STRIPE_SK')

sales = Blueprint('sales', __name__)

@sales.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    try:
        data = request.json
        
        if not data or not isinstance(data, list):
            return jsonify({'error': 'Invalid data format. Expected a list of items.'}), 400

        total_amount = 0

        for item in data:
            if 'mysterybox_id' not in item or 'quantity' not in item:
                return jsonify({'error': 'Each item must have mysterybox_id and quantity'}), 400

            mystery_box = MysteryBox.query.get(int(item['mysterybox_id']))
            if not mystery_box:
                return jsonify({'error': f"Mystery box with id {item['mysterybox_id']} not found"}), 404

            quantity = int(item['quantity'])
            subtotal = mystery_box.price * quantity
            total_amount += subtotal

        # Convertir a centavos para Stripe
        amount_in_cents = int(total_amount * 100)
        
        intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency='eur'
        )
        
        return jsonify({
            'clientSecret': intent.client_secret,
            'amount': amount_in_cents
        })
    except Exception as e:
        logging.error(f"Error creating PaymentIntent: {str(e)}")
        return jsonify({'error': str(e)}), 400

@sales.route('/create', methods=['POST'])
@jwt_required()
def create_sale():
    current_user = get_jwt_identity()
    data = request.json

    try:
        # Verificar que todos los datos necesarios estén presentes
        required_fields = ['items', 'stripe_payment_intent_id', 'total_amount']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Calcular el total de la venta en el backend
        total_amount = 0
        sale_items = []

        for item in data['items']:
            if 'mystery_box_id' not in item or 'quantity' not in item:
                return jsonify({'error': 'Each item must have mystery_box_id and quantity'}), 400

            mystery_box = MysteryBox.query.get(item['mystery_box_id'])
            if not mystery_box:
                return jsonify({'error': f"Mystery box with id {item['mystery_box_id']} not found"}), 404

            quantity = int(item['quantity'])
            subtotal = mystery_box.price * quantity
            total_amount += subtotal
            sale_items.append({
                'mystery_box': mystery_box,
                'quantity': quantity,
                'subtotal': subtotal
            })

        # Verificar que el total calculado coincide con el total enviado por el frontend
        if abs(total_amount - float(data['total_amount'])) > 0.01:  # Permitimos una pequeña diferencia por redondeo
            ## Aviso a los admins para detectar usuarios maliciosos.
            try:
                new_notification = Notification(
                    recipient_type='admin',
                    sender_type=current_user['type'],
                    sender_id=current_user['id'],
                    type="fraudulent_use",
                    content=f"Fraudulent use of the payment proccess from the user {current_user.name} with the ID: {current_user.id}. The total amount sent was {data[total_amount]} and the total amount calculated was {total_amount}. Check {sale_items.append} for more details.",
                )

                db.session.add(new_notification)
                db.session.commit()
                return jsonify(new_notification.serialize()), 201
            except SQLAlchemyError as e:
                db.session.rollback()
                logging.error(f"Database error: {str(e)}")
                return jsonify({'error': 'Database error occurred'}), 500



        # Verificar el pago con Stripe
        try:
            payment_intent = stripe.PaymentIntent.retrieve(data['stripe_payment_intent_id'])
            if payment_intent.status != 'succeeded':
                return jsonify({'error': 'Payment not successful', 'status': payment_intent.status}), 400
            
            # Verificar que el monto pagado coincide con el calculado
            if abs(payment_intent.amount - int(total_amount * 100)) > 1:  # Stripe usa centimos
                return jsonify({'error': 'Payment amount does not match order total'}), 400
        except stripe.error.StripeError as e:
            return jsonify({'error': 'Stripe error', 'details': str(e)}), 400

         # Crear la venta principal
        new_sale = Sale(
            user_id=current_user['id'],
            total_amount=total_amount,
            commission_rate=0.05  # Asumiendo una tasa de comisión fija del 5%
        )
        db.session.add(new_sale)
        db.session.flush()  # Esto asigna un ID a new_sale sin hacer commit

        # Procesar los detalles de la venta
        for item in sale_items:
            mystery_box = item['mystery_box']
            quantity = item['quantity']
            subtotal = item['subtotal']

            # Calcular cuántos artículos necesitamos en total
            total_items_needed = mystery_box.number_of_items * quantity

            # Si necesitamos más artículos de los disponibles, ajustamos
            if total_items_needed > len(mystery_box.possible_items):
                logging.warning(f"Not enough unique items in mystery box {mystery_box.id}. Adjusting selection.")
                selected_items = mystery_box.possible_items * (total_items_needed // len(mystery_box.possible_items) + 1)
                selected_items = selected_items[:total_items_needed]
            else:
                selected_items = random.sample(mystery_box.possible_items, total_items_needed)

            sale_detail = SaleDetail(
                sale_id=new_sale.id,
                shop_id=mystery_box.shop_id,
                mystery_box_id=mystery_box.id,
                quantity=quantity,
                price=mystery_box.price,
                subtotal=subtotal,

            )
            db.session.add(sale_detail)
            db.session.flush()  # Esto asigna un ID a sale_detail sin hacer commit


            shop_sale = ShopSale(
                sale_id=new_sale.id,
                shop_id=mystery_box.shop_id,
                subtotal=subtotal,
                status="pending"
            )
            db.session.add(shop_sale)
            db.session.flush()  # Esto asigna un ID a shop_sale sin hacer commit
            
            logging.info(f"Created ShopSale with id: {shop_sale.id}")


            # Crear lista de diccionarios para almacenar los items seleccionados
            box_items_data = []

            # Create BoxItem for each selected item
            for selected_item in selected_items:
                box_item = BoxItem(
                    sale_detail_id=sale_detail.id,
                    item_name=selected_item,
                )
                db.session.add(box_item)
    
                # Agregar el BoxItem al extra_data como diccionario
                box_items_data.append({
                    'sale_detail_id': sale_detail.id,
                    'item_name': selected_item
                })

            # Create notification for the shop
            shop_notification = Notification(
                recipient_type='shop',
                recipient_id=mystery_box.shop_id,
                sale_id = new_sale.id,
                shop_id=mystery_box.shop_id,
                sender_type='platform',
                type="new_sale",
                content=f'Enhorabuena alguién te ha comprado {quantity} cajas de: {mystery_box.name}, confirma que tienes stock de todos los artículos que le han tocado para poder enviar la caja.',
                extra_data={
                    'shop_sale_id' : shop_sale.id
                }
            )   
            db.session.add(shop_notification)

        # Create notification for the user
        user_notification = Notification(
            recipient_type=current_user['type'],
            recipient_id=current_user['id'],
            sender_type='platform',
            sale_id=new_sale.id,
            type="purchase_confirmation",
            content=f"Su compra con id: {new_sale.id} ha sido aprobada. Cuando la tienda confirme el stock de los elementos que te han tocado volveremos a contactar contigo."
        )
        
        db.session.add(user_notification)

        db.session.commit()
        logging.info(f"Sale created successfully with id: {new_sale.id}")
        return jsonify({
            'message': 'Sale created successfully',
            'sale_id': new_sale.id,
            'total_amount': total_amount
        }), 201

    except ValueError as e:
        db.session.rollback()
        logging.error(f"ValueError: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
    
@sales.route('/', methods = ['GET'])
def get_all_sales():
    sales = Sale.query.all()
    return jsonify([sale.serialize() for sale in sales]), 200

@sales.route('/saledetail', methods = ['GET'])
def get_all_sales_details():
    sales = SaleDetail.query.all()
    return jsonify([sale.serialize() for sale in sales]), 200


@sales.route('/<int:sale_id>', methods=['GET'])
@jwt_required()
def get_sale(sale_id):
    current_user = get_jwt_identity()
    sale = Sale.query.get(sale_id)

    if not sale:
        return jsonify({'error': 'Sale not found'}), 404

    # Verificar si el usuario es el propietario de la venta o es una tienda involucrada
    if current_user['type'] == 'user' and sale.user_id != current_user['id']:
        return jsonify({'error': 'Unauthorized'}), 403
    
    elif current_user['type'] == 'shop':
        shop_sale = ShopSale.query.filter_by(sale_id=sale_id, shop_id=current_user['id']).first()
        if not shop_sale:
            return jsonify({'error': 'Unauthorized'}), 403

    return jsonify(sale.serialize()), 200

@sales.route('/shop/<int:shop_id>', methods=['GET'])
@jwt_required()
def get_shop_sales(shop_id):
    current_user = get_jwt_identity()
    
    # Verificar si el usuario es el propietario de la tienda
    if current_user['type'] != 'shop' or current_user['id'] != shop_id:
        return jsonify({'error': 'Unauthorized'}), 403

    shop_sales = ShopSale.query.filter_by(shop_id=shop_id).all()
    return jsonify([sale.serialize() for sale in shop_sales]), 200

@sales.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_sales(user_id):
    current_user = get_jwt_identity()

    # Verificar si el usuario existe
    user = User.query.get(current_user['id'])
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    # Verificar si el usuario actual tiene permiso para ver estas ventas
    if current_user['type'] != 'admin' and current_user['id'] != user_id:
        return jsonify({'error': 'No autorizado'}), 403

    # Obtener las ventas del usuario
    user_sales = Sale.query.filter_by(user_id=user_id).order_by(Sale.created_at.desc()).all()
    
    # Serializar y devolver las ventas
    return jsonify([sale.serialize_for_user() for sale in user_sales]), 200

@sales.route('/update_status/<int:shop_sale_id>', methods=['PUT'])
@jwt_required()
def update_shop_sale_status(shop_sale_id):
    current_user = get_jwt_identity()
    data = request.json

    shop_sale = ShopSale.query.get(shop_sale_id)
    if not shop_sale:
        return jsonify({'error': 'Shop sale not found'}), 404

    # Verificar si el usuario es el propietario de la tienda
    if current_user['type'] != 'shop' or current_user['id'] != shop_sale.shop_id:
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        shop_sale.status = data['status']
        db.session.commit()
        return jsonify({'message': 'Status updated successfully'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500
    except Exception as e:
        db.session.rollback()
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

@sales.route('/shop/<int:sale_id>/confirm', methods=['POST'])
@jwt_required()
def confirm_shop_sale(sale_id):
    current_user = get_jwt_identity()
    
    if current_user['type'] != 'shop':
        return jsonify({'error': 'You must be logged in as a shop'}), 403
    
    current_shop = Shop.query.get(current_user['id'])
    
    if not current_shop:
        return jsonify({"error": "Shop not found"}), 403
    
    try:
        # Buscar la ShopSale correspondiente
        shop_sale = ShopSale.query.filter_by(sale_id=sale_id, shop_id=current_shop.id).first()

        if not shop_sale:
            return jsonify({"error": "Unauthorized or Sale not found"}), 403
       
        # Actualizar el estado de ShopSale
        shop_sale.status = 'confirmed'
        
        # Buscar la notificación original
        original_notification = Notification.query.filter_by(
            type="new_sale",
            recipient_type="shop",
            recipient_id=current_shop.id,
            extra_data={
                "shop_sale_id": shop_sale.id
            }
        ).first()

        if original_notification:
            original_notification.type = "confirmed"
            original_notification.is_read = False
            original_notification.updated_at = datetime.utcnow()
            original_notification.content = f"Has confirmado la venta con ID: {shop_sale.id}, del pedido con ID: {sale_id}. Por favor, prepara el pedido para su envío."
        else:
            # Si no se encuentra la notificación original, crear una nueva
            new_notification = Notification(
                type="confirmed",
                recipient_type="shop",
                recipient_id=current_shop.id,
                sender_type="platform",
                sale_id=sale_id,
                shop_id=current_shop.id,
                content=f"Has confirmado la orden con ID: {shop_sale.id}, del pedido (venta) con ID: {sale_id}. Por favor, prepara el pedido para su envío.",
                extra_data={
                "shop_sale_id": shop_sale.id
            }
            )
            db.session.add(new_notification)

        # Obtener la Sale completa
        sale = Sale.query.get(sale_id)

        # Crear notificaciones para el usuario y los admins
        user_notification = Notification(
            recipient_type='user',
            recipient_id=sale.user_id,
            sender_type='platform',
            shop_id=current_shop.id,
            sale_id=sale_id,
            type="confirmation",
            content=f"Su compra con id: {sale_id} ha sido confirmada por: {current_shop.name}. Cuando la tienda envíe tu caja volveremos a contactar contigo."
        )
        
        admin_notification = Notification(
            recipient_type='admin',
            sender_type='platform',
            shop_id=current_shop.id,
            sale_id=sale_id,
            type="confirmation",
            content=f"La compra con id: {sale_id} ha sido confirmada por: {current_shop.name}."
        )
        
        db.session.add(user_notification)
        db.session.add(admin_notification)
        
        db.session.commit()
        return jsonify({"message": "Sale confirmed successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500