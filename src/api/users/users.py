"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity


users = Blueprint('users', __name__)

# Allow CORS requests to this API
CORS(users)


@users.route('/', methods=['GET'])
def get_all_users():
    users = User.query.all()
    
    # Serializa cada objeto en la lista de usuarios
    serialized_users = [user.serialize() for user in users]

    return jsonify(serialized_users), 200

@users.route('/register', methods=['POST'])
def create_user():
    data = request.get_json()
    
    # Verificar si el usuario ya existe
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'error': 'El usuario ya existe'}), 400

    # Crear un nuevo usuario
    new_user = User(
        name=data.get('name'),
        surname=data.get('surname'),
        gender=data.get('gender'),
        address=data.get('address'),
        postal_code=data.get('postalCode'),
        email=data.get('email'),
        upper_size=data.get('upperSize'),
        lower_size=data.get('lowerSize'),
        cup_size=data.get('cupSize'),
        shoe_size=data.get('shoeSize'),
        not_colors=','.join(data.get('notColors', [])),
        stamps=data.get('stamps'),
        fit=data.get('fit'),
        not_clothes=','.join(data.get('notClothes', [])),
        categories=','.join(data.get('categories', [])),
        profession=data.get('profession')
    )
    new_user.set_password(data.get('password'))

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al crear el usuario: ' + str(e)}), 500

@users.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=email)
        return jsonify(access_token=access_token), 200
    return jsonify({'error': 'Credenciales inválidas'}), 401

@users.route('/private', methods=['GET'])
@jwt_required()
def private():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

@users.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(user.serialize()), 200

@users.route('/profile', methods=['PATCH'])
@jwt_required()
def update_profile():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    data = request.json
    
    for field, value in data.items():
        if field in ['not_colors', 'not_clothes', 'categories']:
            if isinstance(value, list):
                value = ','.join(value)
            setattr(user, field, value)
        elif hasattr(user, field) and field not in ['id', 'email', 'password_hash']:
            setattr(user, field, value)
    
    try:
        db.session.commit()
        return jsonify(user.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


