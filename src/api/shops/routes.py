from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_jwt_extended import create_access_token
from api.models import db, Shop, MysteryBox, ItemChangeRequest, BoxItem
from werkzeug.exceptions import BadRequest
from sqlalchemy.exc import SQLAlchemyError
import cloudinary
import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError
import logging
import os
import json


shops = Blueprint('shops', __name__)

cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET")
)

def upload_image_to_cloudinary(image_file):
    if image_file:
        try:
            upload_result = cloudinary.uploader.upload(image_file)
            return upload_result['secure_url']
        except CloudinaryError as e:
            logging.error(f"Cloudinary Error: {str(e)}")
            return None
        except Exception as e:
            logging.error(f"Unexpected error during image upload: {str(e)}")
            return None
    return None

@shops.route('/register', methods=['POST'])
def register_shop():
    try:
        data = request.form
        required_fields = ['owner_name', 'owner_surname', 'shop_name', 'shop_address', 
                   'postal_code', 'email', 'password', 'categories', 
                   'business_core', 'shop_description', 'shop_summary']
        
        for field in required_fields:
            if field not in data:
                raise BadRequest(f"Missing required field: {field}")

        if Shop.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400

        image_file = request.files.get('image_shop_url')
        if not image_file:
            return jsonify({'error': 'No image file provided'}), 400

        image_url = upload_image_to_cloudinary(image_file)
        if not image_url:
            return jsonify({'error': 'Failed to upload image to Cloudinary'}), 500

        # Parseamos las categorías como JSON
        categories = json.loads(data['categories'])

        new_shop = Shop(
            name=data['shop_name'],
            address=data['shop_address'],
            postal_code=data['postal_code'],
            email=data['email'],
            categories=categories,  # Ahora es una lista de strings
            business_core=data['business_core'],
            shop_description=data['shop_description'],
            shop_summary=data['shop_summary'],
            image_shop_url=image_url,
            owner_name=data['owner_name'],
            owner_surname=data['owner_surname']
        )
        new_shop.set_password(data['password'])

        db.session.add(new_shop)
        db.session.commit()
        
        access_token = create_access_token(identity=new_shop.id)
        
        return jsonify({
            'message': 'Shop registered successfully',
            'access_token': access_token,
            'shop': new_shop.serialize_for_card()
        }), 201
    
    except BadRequest as e:
        return jsonify({'error': str(e)}), 400
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON for categories'}), 400
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error in shop registration: {str(e)}")
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

@shops.route('/mystery-box', methods=['POST'])
@jwt_required()
def create_mystery_box():
    current_user = get_jwt_identity()
    if current_user['type'] != 'shop':
        return jsonify({'error': 'You should have login as a shop'}), 403

    data = request.form
    
    try:
        shop = Shop.query.get(current_user['id'])
        if not shop:
            return jsonify({'error': 'Shop not found'}), 404

        image_file = request.files.get('image')
        if not image_file:
            return jsonify({'error': 'No image file provided'}), 400

        image_url = upload_image_to_cloudinary(image_file)
        if not image_url:
            return jsonify({'error': 'Failed to upload image to Cloudinary'}), 500

        new_box = MysteryBox(
            name=data['name'],
            description=data['description'],
            price=float(data['price']),
            size=data['size'],
            possible_items=data['possibleItems'].split(','),
            image_url=image_url,
            number_of_items=int(data['numberOfItems']),
            shop_id=shop.id
        )
        
        db.session.add(new_box)
        db.session.commit()
        
        return jsonify(new_box.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@shops.route('/', methods=['GET'])
def get_all_shops():
    shops = Shop.query.all()
    return jsonify([shop.serialize_for_card() for shop in shops]), 200

@shops.route('/mystery-box', methods=['GET'])
def get_all_mystery_boxes():
    mystery_boxes = MysteryBox.query.all()
    return jsonify([box.serialize_for_card() for box in mystery_boxes]), 200

@shops.route('/mystery-box/detail', methods=['GET'])
def get_all_mystery_boxes_details():
    mystery_boxes = MysteryBox.query.all()
    return jsonify([box.serialize_detail() for box in mystery_boxes]), 200

@shops.route('/<int:shop_id>', methods=['GET'])
def get_shop(shop_id):
    shop = Shop.query.get(shop_id)
    if shop:
        return jsonify(shop.serialize_detail()), 200
    else:
        return jsonify({'error': 'Shop not found'}), 404
    
@shops.route('/<int:shop_id>/mysteryboxes', methods=['GET'])
def  get_shop_mystery_boxes(shop_id):
    shop = Shop.query.get(shop_id)
    if shop:
        mystery_boxes = MysteryBox.query.filter_by(shop_id=shop_id).all()
        return jsonify([box.serialize_detail() for box in mystery_boxes]), 200
    else:
        return jsonify({'error': 'Shop not found'}), 404       
     

@shops.route('/mystery-box/<int:box_id>', methods=['GET'])
def get_mystery_box(box_id):
    mystery_box = MysteryBox.query.get(box_id)
    if mystery_box:
        return jsonify(mystery_box.serialize_detail()), 200
    else:
        return jsonify({'error': 'Mystery box not found'}), 404
    
@shops.route('/profile', methods=['GET'])
@jwt_required()
def get_shop_profile():
    current_user = get_jwt_identity()
    if current_user['type'] != 'shop':
        return jsonify({'error': 'You must be logged in as a shop'}), 403
    
    shop = Shop.query.get(current_user['id'])
    if not shop:
        return jsonify({"error": "Shop not found"}), 404
    
    if shop:
        return jsonify(shop.serialize_detail()), 200
    else:
        return jsonify({'error': 'Shop not found'}), 404

@shops.route('/profile', methods=['PATCH'])
@jwt_required()
def update_shop_profile():
    current_user = get_jwt_identity()
    if current_user['type'] != 'shop':
        return jsonify({'error': 'You must be logged in as a shop'}), 403

    shop = Shop.query.get(current_user['id'])
    if not shop:
        return jsonify({"error": "Shop not found"}), 404

    data = request.form

    updatable_fields = [
        'owner_name', 'owner_surname', 'shop_name', 'shop_address', 
        'postal_code', 'categories', 'business_core', 'shop_description', 
        'shop_summary'
    ]

    for field in updatable_fields:
        if field in data:
            if field == 'categories':
                setattr(shop, field, json.loads(data[field]))
            else:
                setattr(shop, field, data[field])

    if 'password' in data:
        shop.set_password(data['password'])

    image_file = request.files.get('image_shop_url')
    if image_file:
        image_url = upload_image_to_cloudinary(image_file)
        if image_url:
            shop.image_shop_url = image_url
        else:
            return jsonify({'error': 'Failed to upload image to Cloudinary'}), 500

    try:
        db.session.commit()
        return jsonify(shop.serialize_for_card()), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating shop profile: {str(e)}")
        return jsonify({"error": f"An error occurred while updating the profile: {str(e)}"}), 500
    
@shops.route('/create-change-request', methods=['POST'])
@jwt_required()
def create_change_request():
    current_shop = Shop.query.get(get_jwt_identity())
    data = request.get_json()
    
    try:
        box_item = BoxItem.query.get(data['box_item_id'])
        if not box_item or box_item.sale_detail.shop_id != current_shop.id:
            return jsonify({"error": "Invalid box item"}), 400

        new_request = ItemChangeRequest(
            box_item_id=data['box_item_id'],
            shop_id=current_shop.id,
            original_item_name=box_item.item_name,
            original_item_size=box_item.item_size,
            original_item_category=box_item.item_category,
            proposed_item_name=data['proposed_item_name'],
            proposed_item_size=data['proposed_item_size'],
            proposed_item_category=data['proposed_item_category'],
            reason=data['reason']
        )
        db.session.add(new_request)
        db.session.commit()
        
        return jsonify(new_request.serialize()), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@shops.route('/change-requests', methods=['GET'])
@jwt_required()
def get_shop_change_requests():
    current_shop = Shop.query.get(get_jwt_identity())
    
    try:
        change_requests = ItemChangeRequest.query.filter_by(shop_id=current_shop.id).all()
        return jsonify([request.serialize() for request in change_requests]), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500
    
    
@shops.route('/mystery-box/<int:box_id>', methods=['PUT']) 
@jwt_required()
def update_mystery_box(box_id):
    current_user = get_jwt_identity()
    if current_user['type'] != 'shop':
        return jsonify({'error': 'You must be logged in as a shop'}), 403
    shop = Shop.query.get(current_user['id'])
    if not shop:
        return jsonify({"error": "Shop not found"}), 404
    
    data = request.get_json()

    # Validamos que se reciban los datos obligatorios
    required_fields = ['name', 'description', 'price', 'size', 'possible_items', 'image_url', 'number_of_items']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    # Buscamos el "mystery box" en la base de datos
    mystery_box = MysteryBox.query.get(box_id)

    if not mystery_box:
        return jsonify({'error': 'Mystery Box not found'}), 404

    # Actualizamos los datos de la caja misteriosa
    mystery_box.name = data['name']
    mystery_box.description = data['description']
    mystery_box.price = data['price']
    mystery_box.size = data['size']
    mystery_box.possible_items = data['possible_items']
    mystery_box.image_url = data['image_url']
    mystery_box.number_of_items = data['number_of_items']

    try:
        db.session.commit()
        return jsonify({'message': 'Mystery Box updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 