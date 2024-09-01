from flask import Blueprint, request, jsonify
from api.models import db, MysteryBox, Shop
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
import os
import base64
import imghdr

shops = Blueprint('shops', __name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image(image_data):
    if len(image_data) > MAX_IMAGE_SIZE:
        raise ValueError(f"El tamaño de la imagen excede el límite de {MAX_IMAGE_SIZE / (1024 * 1024)} MB")
    
    image_type = imghdr.what(None, h=image_data)
    if image_type not in ALLOWED_EXTENSIONS:
        raise ValueError("Tipo de archivo no permitido. Use PNG, JPG, JPEG o GIF.")

def save_base64_image(base64_string):
    try:
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        image_data = base64.b64decode(base64_string)
        
        validate_image(image_data)
        
        filename = secure_filename(f"image_{os.urandom(8).hex()}.png")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        with open(filepath, "wb") as f:
            f.write(image_data)
        
        return f"/uploads/{filename}"
    except Exception as e:
        raise ValueError(str(e))

@shops.route('/mystery-box', methods=['POST'])
@jwt_required()
def create_mystery_box():
    current_user_id = get_jwt_identity()
    data = request.json
    
    try:
        # Verificar si el usuario tiene una tienda
        shop = Shop.query.filter_by(user_id=current_user_id).first()
        if not shop:
            return jsonify({'error': 'Debes tener una tienda para crear una caja misteriosa'}), 403

        image = data.pop('image', None)
        
        if image.startswith('http://') or image.startswith('https://'):
            image_url = image
        else:
            image_url = save_base64_image(image)
        
        new_box = MysteryBox(
            name=data['name'],
            description=data['description'],
            price=float(data['price']),
            size=data['size'],
            possible_items=data['possibleItems'],
            image_url=image_url,
            number_of_items=int(data['numberOfItems']),
            shop_id=shop.id  # Añadimos el shop_id aquí
        )
        
        db.session.add(new_box)
        db.session.commit()
        
        return jsonify(new_box.serialize()), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error interno del servidor'}), 500

@shops.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'El archivo subido excede el tamaño máximo permitido'}), 413