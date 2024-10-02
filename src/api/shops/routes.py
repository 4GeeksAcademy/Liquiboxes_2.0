from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_jwt_extended import create_access_token
from api.models import db, Shop, MysteryBox, ItemChangeRequest, Notification
from werkzeug.exceptions import BadRequest
from sqlalchemy.exc import SQLAlchemyError
import cloudinary
import cloudinary.uploader
from cloudinary.exceptions import Error as CloudinaryError
import logging
import os
import json

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


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

        welcome_notification = Notification(
            recipient_type='shop',
            recipient_id=new_shop.id,
            sender_type='Admin',
            shop_id=new_shop.id,
            type="welcome_notification",
            content=f"Te damos la bienvenida a Liquiboxes {new_shop.owner_name}, tu tienda {new_shop.name} ha sido registrada. No dudes en crear tu primera mystery box. Si tienes cualquier duda contactanos en la pestaña de Contacto con soporte que tienes en el menú lateral.",
        )
        db.session.add(welcome_notification)

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
        return jsonify({'error': 'Deberías estar registrado como una tienda'}), 403

    data = request.form
    
    try:
        shop = Shop.query.get(current_user['id'])
        if not shop:
            return jsonify({'error': 'Lo sentimos no hemos encontrado esta tienda'}), 404

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
def get_shop_mystery_boxes(shop_id):
    
    shop = Shop.query.get(shop_id)
    if shop:
        mystery_boxes = MysteryBox.query.filter_by(shop_id=shop_id).all()
        result = [box.serialize_for_card() for box in mystery_boxes]
        return jsonify(result), 200
    else:
        return jsonify({'error': 'Tienda no encontrada'}), 404      
     

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
        return jsonify({"error": "No autorizado. Solo las tiendas pueden utilzar este recurso."}), 403
    
    try:
        shop = Shop.query.get(current_user['id'])
        if not shop:
            return jsonify({"error": "Shop not found"}), 404
        return jsonify(shop.serialize_detail()), 200
    
    except SQLAlchemyError as e:
        logging.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Error en la base de datos'}), 500

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
    

@shops.route('/change-requests', methods=['GET'])
@jwt_required()
def get_shop_change_requests():
    current_user = get_jwt_identity()
    
    # Verificar si el usuario es una tienda
    if current_user['type'] != 'shop':
        return jsonify({'error': 'You must be logged in as a shop'}), 403
    
    # Obtener la tienda usando el ID del usuario actual
    current_shop = Shop.query.get(current_user['id'])
    
    if not current_shop:
        return jsonify({"error": "Shop not found"}), 404
    
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

    mystery_box = MysteryBox.query.filter_by(id=box_id, shop_id=current_user['id']).first()
    if not mystery_box:
        return jsonify({'error': 'Mystery Box not found'}), 404

    data = request.form
    image_file = request.files.get('image_url')

    # Validamos los campos requeridos
    required_fields = ['name', 'description', 'price', 'size', 'possible_items', 'number_of_items']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    # Subimos la imagen a Cloudinary si existe
    if image_file:
        try:
            image_url = upload_image_to_cloudinary(image_file)
            mystery_box.image_url = image_url
        except Exception as e:
            return jsonify({'error': f'Failed to upload image to Cloudinary: {str(e)}'}), 500

    # Actualizamos el resto de los datos de la caja misteriosa
    try:
        mystery_box.name = data.get('name')
        mystery_box.description = data.get('description')
        mystery_box.price = float(data.get('price'))
        mystery_box.size = data.get('size')
        mystery_box.possible_items = data.get('possible_items').split(',')
        mystery_box.number_of_items = int(data.get('number_of_items'))

        db.session.commit()
        return jsonify({'message': 'Mystery Box updated successfully'}), 200
    except ValueError as e:
        db.session.rollback()
        return jsonify({'error': f'Invalid data format: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error updating Mystery Box: {str(e)}'}), 500
    
@shops.route('/mystery-box/<int:box_id>', methods=['DELETE']) #RUTA PARA ELIMINAR MYSTERY BOX
@jwt_required()
def delete_mystery_box(box_id):
    current_user = get_jwt_identity()

    #Verifica que el usuario es de tipo 'shop'
    if current_user['type'] != 'shop':
        return jsonify({'error': 'You must be logged in as a shop'}), 403

    #Verifica que la tienda existe
    shop = Shop.query.get(current_user['id'])
    if not shop:
        return jsonify({'error': 'Shop not found'}), 404

    #Verifica que la mystery box existe y pertenece a la tienda del usuario
    mystery_box = MysteryBox.query.filter_by(id=box_id, shop_id=shop.id).first()
    if not mystery_box:
        return jsonify({'error': 'Mystery Box not found'}), 404

    try:
        #Elimina la mystery box
        db.session.delete(mystery_box)
        db.session.commit()

        return jsonify({'message': 'Mystery Box deleted successfully'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
