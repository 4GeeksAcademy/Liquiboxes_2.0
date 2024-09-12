from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db, Sale, SaleDetail, ItemChangeRequest, ShopSale, MysteryBox, Shop, Notification, BoxItem
from sqlalchemy.exc import SQLAlchemyError
import logging
import stripe
import os
import random


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
            return jsonify({'error': 'Total amount mismatch'}), 400
            ## TODO: Aquí se podría añadir un aviso a los admins para detectar usuarios maliciosos.

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

            logging.info(f"Processing mystery box {mystery_box.id}: {mystery_box.name}")
            logging.info(f"Number of possible items: {len(mystery_box.possible_items)}")
            logging.info(f"Number of items per box: {mystery_box.number_of_items}")
            logging.info(f"Quantity ordered: {quantity}")

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

            logging.info(f"Created SaleDetail with id: {sale_detail.id}")


            shop_sale = ShopSale(
                sale_id=new_sale.id,
                shop_id=mystery_box.shop_id,
                subtotal=subtotal,
                status="pending"
            )
            db.session.add(shop_sale)
            db.session.flush()  # Esto asigna un ID a shop_sale sin hacer commit
            
            logging.info(f"Created ShopSale with id: {shop_sale.id}")


            # Create BoxItem for each selected item
            for selected_item in selected_items:
                box_item = BoxItem(
                    sale_detail_id=sale_detail.id,
                    item_name=selected_item,
                )
                db.session.add(box_item)

            # Create notification for the shop
            shop_notification = Notification(
                shop_id=mystery_box.shop_id,
                sale_id=new_sale.id,
                type="new_sale",
                content=f"New sale of {quantity} {mystery_box.name} box(es)"
            )
            db.session.add(shop_notification)

        # Create notification for the user
        user_notification = Notification(
            recipient_id=current_user['id'],
            sale_id=new_sale.id,
            type="purchase_confirmation",
            content="Su compra ha sido aprobada"
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
    
@sales.route('/shop/<int:sale_id>/change-request', methods=['POST'])
@jwt_required()
def request_item_change(sale_id):
    current_user = get_jwt_identity()
    sale = Sale.query.get(sale_id)

    if not sale:
        return  jsonify({"error": "Unauthorized or Sale not found"}), 403
    
    shop_sale = sale.shop_sales.filter_by(shop_id=current_user['id']).first()
    if not shop_sale:
        return jsonify({"error": "Unauthorized or ShopSale not found"}), 403
    
    if not shop_sale or shop_sale.shop_id != current_user['id']:
        return jsonify({"error": "Unauthorized or ShopSale not found"}), 403
    
    data = request.json
    box_item_id = data.get('box_item_id')
    
    if not box_item_id:
        return jsonify({"error": "box_item_id is required"}), 400
    
    shop_sale.status = 'pending_confirmation'
    
    change_request = ItemChangeRequest(
        box_item_id=box_item_id,
        shop_id=shop_sale.shop_id,
        sale_id=shop_sale.sale_id,
        shop_sale_id=shop_sale.id
    )
    
    db.session.add(change_request)
    db.session.commit()
    
    # Crear notificación para los admins
    admin_notification = Notification(
        type='admin_change_request',
        content=f"Shop {shop_sale.shop.name} has requested a change for order #{shop_sale.sale_id} (ShopSale #{shop_sale.id}).",
        sale_id=shop_sale.sale_id,
        shop_sale_id=shop_sale.id
    )
    db.session.add(admin_notification)
    db.session.commit()
    
    return jsonify({"message": "Change request submitted successfully"}), 200

@sales.route('/shop/<int:sale_id>/confirm', methods=['POST'])
@jwt_required()
def confirm_shop_sale(sale_id):
    current_user = get_jwt_identity()
    sale = Sale.query.get(sale_id)

    if not sale:
        return  jsonify({"error": "Unauthorized or Sale not found"}), 403
    
    shop_sale = sale.shop_sales.filter_by(shop_id=current_user['id']).first()
    if not shop_sale:
        return jsonify({"error": "Unauthorized or ShopSale not found"}), 403
    
    if not shop_sale or shop_sale.shop_id != current_user['id']:
        return jsonify({"error": "Unauthorized or ShopSale not found"}), 403
    
    shop_sale.status = 'confirmed'
    db.session.commit()
    
    # Crear notificaciones para el usuario y los admins
    user_notification = Notification(
        recipient_id=shop_sale.sale.user_id,
        type='order_confirmed',
        content=f"Your order from {shop_sale.shop.name} has been confirmed.",
        sale_id=shop_sale.sale_id
    )
    
    admin_notification = Notification(
        type='admin_order_confirmed',
        content=f"{shop_sale.shop.name} with ID: {shop_sale.shop_id} has confirmed order #{shop_sale.sale_id} (ShopSale #{shop_sale.id}).",
        sale_id=shop_sale.sale_id
    )
    
    db.session.add(user_notification)
    db.session.add(admin_notification)
    db.session.commit()
    
    return jsonify({"message": "ShopSale confirmed successfully"}), 200