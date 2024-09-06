from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_jwt_extended import create_access_token
from api.models import db, Shop, MysteryBox
from werkzeug.exceptions import BadRequest
import cloudinary
import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError
import logging
import os

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

        new_shop = Shop(
            name=data['shop_name'],
            address=data['shop_address'],
            postal_code=data['postal_code'],
            email=data['email'],
            categories=data['categories'].split(','),  # Asumiendo que las categorías vienen como una cadena separada por comas
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

@shops.route('/<int:shop_id>', methods=['GET'])
def get_shop(shop_id):
    shop = Shop.query.get(shop_id)
    if shop:
        return jsonify(shop.serialize_detail()), 200
    else:
        return jsonify({'error': 'Shop not found'}), 404

@shops.route('/mystery-box/<int:box_id>', methods=['GET'])
def get_mystery_box(box_id):
    mystery_box = MysteryBox.query.get(box_id)
    if mystery_box:
        return jsonify(mystery_box.serialize_detail()), 200
    else:
        return jsonify({'error': 'Mystery box not found'}), 404