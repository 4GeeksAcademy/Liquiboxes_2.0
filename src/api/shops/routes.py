from flask import Blueprint, request, jsonify
from werkzeug.exceptions import BadRequest
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from api.models import db, Shop, MysteryBox
from flask_cors import CORS
import cloudinary
import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError
import os


shops = Blueprint('shops', __name__)

CORS(shops)

cloudinary.config(
    cloud_name = os.getenv("cloud_name"),
    api_key = os.getenv("api_key"),
    api_secret = os.getenv("api_secret")
)


def upload_image_to_cloudinary(image_file):
    if image_file:
        try:
            upload_result = cloudinary.uploader.upload(image_file)
            return upload_result['secure_url']
        except CloudinaryError as e:
            print(f"Cloudinary Error: {str(e)}")
            return None
        except Exception as e:
            print(f"Unexpected error during image upload: {str(e)}")
            return None
    return None

@shops.route('/register', methods=['POST'])
def register_shop():
    try:
        data = request.form
        required_fields = ['shop_name', 'shop_address', 'postal_code', 'email', 'password', 
                           'categories', 'business_core', 'shop_description', 'shop_summary', 
                           'owner_name', 'owner_surname']
        
        for field in required_fields:
            if field not in data:
                raise BadRequest(f"Missing required field: {field}")

        existing_shop = Shop.query.filter_by(email=data['email']).first()
        if existing_shop:
            return jsonify({'error': 'Email already registered'}), 400

        image_file = request.files.get('image_shop_url')
        if not image_file:
            return jsonify({'error': 'No image file provided'}), 400

        image_url = upload_image_to_cloudinary(image_file)
        if not image_url:
            return jsonify({'error': 'Failed to upload image to Cloudinary'}), 500

        if not image_url:
            return jsonify({'error': 'Failed to upload image'}), 500

        categories = data.get('categories', '').split(',')
        if not categories:
            return jsonify({'error': 'At least one category is required'}), 400

        new_shop = Shop(
            name=data['shop_name'],
            address=data['shop_address'],
            postal_code=data['postal_code'],
            email=data['email'],
            categories=categories,
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
            'shop': new_shop.serialize()
        }), 201
    except BadRequest as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        print(f"Error in shop registration: {str(e)}")
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500
    
@shops.route('/login', methods=['POST'])
def shop_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    shop = Shop.query.filter_by(email=email).first()
    if shop and shop.check_password(password):
        access_token = create_access_token(identity=shop.id)
        return jsonify({
            'access_token': access_token,
            'shop': shop.serialize()
        }), 200

@shops.route('/mystery-box', methods=['POST'])
@jwt_required()
def create_mystery_box():
    current_shop_id = get_jwt_identity()
    data = request.form
    
    try:
        # Cambiamos la consulta para buscar por ID en lugar de email
        shop = Shop.query.get(current_shop_id)
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
def get_all_users():
    users = Shop.query.all()
    
    # Serializa cada objeto en la lista de usuarios
    serialized_users = [user.serialize() for user in users]

    return jsonify(serialized_users), 200

@shops.route('/mystery-box', methods=['GET'])
def get_all_mystery_boxes():
    mysteryboxes = MysteryBox.query.all()
    
    # Serializa cada objeto en la lista de usuarios
    serialized_mysteryboxes = [mysterybox.serialize() for mysterybox in mysteryboxes]

    return jsonify(serialized_mysteryboxes), 200

@shops.route('/shop/<int:shop_id>', methods=['GET'])
def get_shop(shop_id):
    shop = Shop.query.get(shop_id)
    if shop:
        return jsonify(shop.serialize()), 200
    else:
        return jsonify({'error': 'Shop not found'}), 404

@shops.route('/mystery-box/<int:box_id>', methods=['GET'])
def get_mystery_box(box_id):
    mystery_box = MysteryBox.query.get(box_id)
    if mystery_box:
        return jsonify(mystery_box.serialize()), 200
    else:
        return jsonify({'error': 'Mystery box not found'}), 404

@shops.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'El archivo subido excede el tamaño máximo permitido'}), 413