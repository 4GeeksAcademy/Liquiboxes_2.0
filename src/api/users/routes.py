from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from api.models import db, User

users = Blueprint('users', __name__)

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

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.serialize()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error al crear el usuario: ' + str(e)}), 500

@users.route('/login', methods=['POST'])
def user_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity={
            'id': user.id,
            'email': user.email,
            'type': 'normal'
        })
        return jsonify({
            'access_token': access_token,
            'user': user.serialize()
        }), 200
    return jsonify({'error': 'Credenciales inválidas'}), 401

@users.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    current_user = get_jwt_identity()
    user = User.query.get(current_user['id'])
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    return jsonify(user.serialize()), 200

@users.route('/profile', methods=['PATCH'])
@jwt_required()
def update_user_profile():
    current_user = get_jwt_identity()
    user = User.query.get(current_user['id'])
    
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404
    
    data = request.json
    
    for field, value in data.items():
        if hasattr(user, field) and field not in ['id', 'email', 'password_hash']:
            setattr(user, field, value)
    
    try:
        db.session.commit()
        return jsonify(user.serialize()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@users.route('/', methods=['GET'])
def get_all_users():
    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 200