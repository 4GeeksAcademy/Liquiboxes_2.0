from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db, Sale, SaleDetail, ShopSale, MysteryBox, Shop
from sqlalchemy.exc import SQLAlchemyError
import logging
import stripe
import os

stripe.api_key = os.getenv('STRIPE_SK')

sales = Blueprint('sales', __name__)

@sales.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    try:
        data = request.json
        
        amount = int(data['amount'])  # Hacer que el amount venga de un query a la tabla MysteryBox.
        
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency='eur'
        )
        
        return jsonify(clientSecret=intent.client_secret)
    except Exception as e:
        return jsonify(error=str(e)), 400
    

@sales.route('/create', methods=['POST'])
@jwt_required()
def create_sale():
    current_user = get_jwt_identity()
    data = request.json

    try:
        # Verificar que todos los datos necesarios estén presentes
        required_fields = ['total_amount', 'items', 'stripe_payment_intent_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Verificar el pago con Stripe
        try:
            payment_intent = stripe.PaymentIntent.retrieve(data['stripe_payment_intent_id'])
            if payment_intent.status != 'succeeded':
                return jsonify({'error': 'Payment not successful', 'status': payment_intent.status}), 400
        except stripe.error.StripeError as e:
            return jsonify({'error': 'Stripe error', 'details': str(e)}), 400

        # Crear la venta principal
        new_sale = Sale(
            user_id=current_user['id'],
            total_amount=data['total_amount'],
            commission_rate=0.05  # Asumiendo una tasa de comisión fija del 5%
        )
        db.session.add(new_sale)
        db.session.flush()  # Esto asigna un ID a new_sale sin hacer commit

        # Procesar los detalles de la venta
        shop_totals = {}
        for item in data['items']:
            mystery_box = MysteryBox.query.get(item['mystery_box_id'])
            if not mystery_box:
                raise ValueError(f"Mystery box with id {item['mystery_box_id']} not found")

            sale_detail = SaleDetail(
                sale_id=new_sale.id,
                shop_id=mystery_box.shop_id,
                mystery_box_id=mystery_box.id,
                quantity=item['quantity'],
                price=mystery_box.price,
                subtotal=mystery_box.price * item['quantity']
            )
            db.session.add(sale_detail)

            # Actualizar o crear el total para cada tienda
            if mystery_box.shop_id not in shop_totals:
                shop_totals[mystery_box.shop_id] = 0
            shop_totals[mystery_box.shop_id] += sale_detail.subtotal

        # Crear ShopSale para cada tienda involucrada
        for shop_id, subtotal in shop_totals.items():
            shop_sale = ShopSale(
                sale_id=new_sale.id,
                shop_id=shop_id,
                subtotal=subtotal,
                status='paid'
            )
            db.session.add(shop_sale)

        db.session.commit()
        return jsonify({
            'message': 'Sale created successfully',
            'sale_id': new_sale.id
        }), 201

    except ValueError as e:
        db.session.rollback()
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