from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from api.models import db, User, Notification
from marshmallow import Schema, fields, validate
import json
from sqlalchemy.exc import IntegrityError


users = Blueprint('users', __name__)

## Todo lo que está dentro de este Blueprint lleva delante /api/users

@users.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'El usuario ya existe'}), 400

    new_user = User(
        name=data.get('name'),
        surname=data.get('surname'),
        gender=data.get('gender'),
        address=data.get('address'),
        postal_code=data.get('postalCode'),
        email=data.get('email'),
        upper_size=data.get('upperSize'),
        lower_size=data.get('lowerSize'),
        cap_size=data.get('capSize'),
        shoe_size=data.get('shoeSize'),
        not_colors=data.get('notColors', []),
        stamps=data.get('stamps'),
        fit=data.get('fit'),
        not_clothes=data.get('notClothes', []),
        categories=data.get('categories', []),
        profession=data.get('profession')
    )
    new_user.set_password(data.get('password'))

    db.session.add(new_user)
    db.session.flush()

    if new_user.gender == 'masculino':
        welcome = 'Bienvenido'
    elif  new_user.gender == 'femenino':
        welcome = 'Bienvenida'
    else:
        welcome = 'Bienvenide'


    new_notification = Notification(
        type='welcome_notification',
        recipient_type='user',
        sender_type='Admin',
        content=f'{welcome} {new_user.name} a Liquiboxes. No dudes en echarle un ojo a nuestra gran variadad de Mystery Boxes.',
        recipient_id=new_user.id,
    )
    db.session.add(new_notification)

    try:
        
        db.session.commit()
        return jsonify(new_user.serialize()), 201
    except IntegrityError as e:
        db.session.rollback()
        # Capturar errores específicos de integridad
        if 'unique constraint' in str(e.orig).lower():
            if 'email' in str(e.orig).lower():
                return jsonify({'error': 'Este email ya está registrado'}), 400
        return jsonify({'error': 'Error de integridad en la base de datos'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al crear el usuario: ' + str(e)}), 500

@users.route('/profile', methods=['GET'])
@jwt_required() ## DECORADOR JWT
def get_user_profile():
    current_user = get_jwt_identity()
    if current_user['type'] != 'user':
        return jsonify({'error': 'You are not a normal user'}), 403
    
    user = User.query.get(current_user['id'])
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(user.serialize()), 200

@users.route('/profile', methods=['PATCH'])
@jwt_required()
def update_user_profile():
    current_user = get_jwt_identity()
    if current_user['type'] != 'user':
        return jsonify({'error': 'You are not a normal user'}), 403

    user = User.query.get(current_user['id'])
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    data = request.json

    # Definir un esquema de validación
    class UserUpdateSchema(Schema):
        name = fields.Str(validate=validate.Length(min=1, max=120))
        surname = fields.Str(validate=validate.Length(min=1, max=120))
        gender = fields.Str(validate=validate.OneOf(['masculino', 'femenino', 'no_especificado']))
        address = fields.Str(validate=validate.Length(min=1, max=200))
        postal_code = fields.Str(validate=validate.Regexp(r'^\d{5}$'))
        upper_size = fields.Str(validate=validate.OneOf(['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']))
        lower_size = fields.Str(validate=validate.OneOf([str(i) for i in range(26, 61)]))
        cup_size = fields.Str(validate=validate.OneOf(['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']))
        shoe_size = fields.Str(validate=validate.OneOf([str(i) for i in range(28, 55)]))
        not_colors = fields.List(fields.Str(), validate=validate.Length(max=3))
        stamps = fields.Str(validate=validate.OneOf(['estampados', 'lisos']))
        fit = fields.Str(validate=validate.OneOf(['ajustado', 'holgado']))
        not_clothes = fields.List(fields.Str(), validate=validate.Length(max=3))
        categories = fields.List(fields.Str(), validate=validate.Length(min=1, max=5))
        profession = fields.Str(validate=validate.OneOf(['Salud', 'Informática', 'Educación', 'Ingeniería', 'Artes', 'Finanzas', 'Ventas', 'Administración', 'Construcción', 'Hostelería', 'Estudiante', 'Otro']))

    schema = UserUpdateSchema()
    errors = schema.validate(data)
    if errors:
        return jsonify({"error": "Datos de entrada inválidos", "details": errors}), 400

    for field, value in data.items():
        if hasattr(user, field) and field not in ['id', 'email', 'password_hash']:
            if field in ['not_colors', 'not_clothes', 'categories']:
                if isinstance(value, str):
                    try:
                        value = json.loads(value)
                    except json.JSONDecodeError:
                        return jsonify({"error": f"Formato inválido para {field}"}), 400
                if not isinstance(value, list):
                    return jsonify({"error": f"{field} debe ser una lista"}), 400
            setattr(user, field, value)

    try:
        db.session.commit()
        return jsonify(user.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@users.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_sizes(user_id):
    user = User.query.get(user_id)
    if user:
        return jsonify(user.serialize_sizes()), 200
    else:
        return jsonify({'error': 'User not found'}), 404
    
@users.route('/<int:user_id>/shipment', methods=['GET'])
@jwt_required()
def get_user_shipment(user_id):
    current_user = get_jwt_identity()
    if current_user['type'] != 'shop':
        ## TODO: Manejar avisos y registro de usuarios maliciosos.
        return jsonify({'error': 'You must be logged in as a shop'}), 403
    
    user = User.query.get(user_id)
    if user:
        return jsonify(user.serialize_shipment()), 200
    else:
        return jsonify({'error': 'User not found'}), 404