from flask import Blueprint, request, jsonify
from api.models import db, Admin_User
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity

admins = Blueprint('admins', __name__)


@admins.route('/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    admin = Admin_User.query.filter_by(email=email).first()

    if admin and admin.check_password(password):
        if not admin.is_active:
            return jsonify({"error": "This account is inactive"}), 403

        access_token = create_access_token(identity=admin.id)
        user_type = "SuperAdmin" if admin.is_superuser else "Admin"

        return jsonify({
            "message": "Login successful",
            "token": access_token,
            "user": admin.serialize(),
            "user_type": user_type
        }), 200

    return jsonify({"error": "Invalid email or password"}), 401

@admins.route('/', methods=['GET'])
@jwt_required()
def get_all_admins():
    current_user = Admin_User.query.get(get_jwt_identity())
    if not current_user.is_superuser:
        return jsonify({"message": "Access denied"}), 403
    
    admin_users = Admin_User.query.all()
    return jsonify([admin_user.serialize() for admin_user in admin_users]), 200

@admins.route('/<int:admin_id>', methods=['GET'])
@jwt_required()
def get_admin(admin_id):
    current_user = Admin_User.query.get(get_jwt_identity())
    if not current_user.is_superuser and current_user.id != admin_id:
        return jsonify({"message": "Access denied"}), 403
    
    admin_user = Admin_User.query.get(admin_id)
    if not admin_user:
        return jsonify({"message": "Admin not found"}), 404
    return jsonify(admin_user.serialize()), 200

@admins.route('/', methods=['POST'])
@jwt_required()
def create_admin():
    current_user = Admin_User.query.get(get_jwt_identity())
    if not current_user.is_superuser:
        return jsonify({"message": "Access denied"}), 403
    
    data = request.get_json()
    new_admin = Admin_User(
        name=data['name'],
        surname=data['surname'],
        email=data['email'],
        is_superuser=data.get('is_superuser', False)
    )
    new_admin.set_password(data['password'])
    
    db.session.add(new_admin)
    db.session.commit()
    
    return jsonify(new_admin.serialize()), 201

@admins.route('/<int:admin_id>', methods=['PUT'])
@jwt_required()
def update_admin(admin_id):
    current_user = Admin_User.query.get(get_jwt_identity())
    if not current_user.is_superuser and current_user.id != admin_id:
        return jsonify({"message": "Access denied"}), 403
    
    admin_user = Admin_User.query.get(admin_id)
    if not admin_user:
        return jsonify({"message": "Admin not found"}), 404
    
    data = request.get_json()
    admin_user.name = data.get('name', admin_user.name)
    admin_user.surname = data.get('surname', admin_user.surname)
    admin_user.email = data.get('email', admin_user.email)
    
    if 'password' in data:
        admin_user.set_password(data['password'])
    
    if current_user.is_superuser:
        admin_user.is_superuser = data.get('is_superuser', admin_user.is_superuser)
        admin_user.is_active = data.get('is_active', admin_user.is_active)
    
    db.session.commit()
    return jsonify(admin_user.serialize()), 200

@admins.route('/<int:admin_id>', methods=['DELETE'])
@jwt_required()
def delete_admin(admin_id):
    current_user = Admin_User.query.get(get_jwt_identity())
    if not current_user.is_superuser:
        return jsonify({"message": "Access denied"}), 403
    
    admin_user = Admin_User.query.get(admin_id)
    if not admin_user:
        return jsonify({"message": "Admin not found"}), 404
    
    db.session.delete(admin_user)
    db.session.commit()
    return jsonify({"message": "Admin deleted successfully"}), 200

@admins.route('/<int:admin_id>/toggle_superuser', methods=['POST'])
@jwt_required()
def toggle_superuser(admin_id):
    current_user = Admin_User.query.get(get_jwt_identity())
    if not current_user.is_superuser:
        return jsonify({"message": "Access denied"}), 403
    
    admin_user = Admin_User.query.get(admin_id)
    if not admin_user:
        return jsonify({"message": "Admin not found"}), 404
    
    admin_user.is_superuser = not admin_user.is_superuser
    db.session.commit()
    return jsonify(admin_user.serialize()), 200