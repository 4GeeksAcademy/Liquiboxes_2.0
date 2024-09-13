from flask import Blueprint, request, jsonify
from api.models import db, Admin_User, ShopSale, ItemChangeRequest, BoxItem, Notification, Shop
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
from sqlalchemy.exc import SQLAlchemyError
from datetime import timedelta
import logging


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

        user_type = "SuperAdmin" if admin.is_superuser else "Admin"
        
        # Configura el tiempo de expiración en horas
        expires_delta = timedelta(hours=8)
        
        access_token = create_access_token(
            identity={
                'id': admin.id,
                'email': admin.email,
                'type': user_type
            },
            expires_delta=expires_delta
        )

        return jsonify({
            'access_token': access_token,
            'user_type': user_type,
            'user': admin.serialize()
        }), 200
    
    return jsonify({"error": "Invalid email or password"}), 401

@admins.route('/', methods=['GET'])
@jwt_required()
def get_all_admins():
    current_user = get_jwt_identity()
    if current_user['type'] != 'SuperAdmin':
        return jsonify({"error": "Unauthorized. Only superadmins can access admin list."}), 403
    
    try:
        admin_users = Admin_User.query.all()
        return jsonify([admin_user.serialize() for admin_user in admin_users]), 200
    except SQLAlchemyError as e:
        logging.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500

@admins.route('/<int:admin_id>', methods=['GET'])
@jwt_required()
def get_admin(admin_id):
    current_user = get_jwt_identity()
    if current_user['type'] != 'SuperAdmin' and current_user['id'] != admin_id:
        return jsonify({"message": "Access denied"}), 403
    
    admin_user = Admin_User.query.get(admin_id)
    if not admin_user:
        return jsonify({"message": "Admin not found"}), 404
    return jsonify(admin_user.serialize()), 200

@admins.route('/', methods=['POST'])
@jwt_required()
def create_admin():
    current_user = get_jwt_identity()
    if current_user['type'] != 'SuperAdmin':
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
    current_user = get_jwt_identity()
    if current_user['type'] != 'SuperAdmin' and current_user['id'] != admin_id:
        return jsonify({"error": "Unauthorized. Only SuperAdmins can update other admins."}), 403
    
    admin_user = Admin_User.query.get(admin_id)
    if not admin_user:
        return jsonify({"error": "Admin not found"}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400
    
    try:
        admin_user.name = data.get('name', admin_user.name)
        admin_user.surname = data.get('surname', admin_user.surname)
        admin_user.email = data.get('email', admin_user.email)
        
        if 'password' in data and data['password']:
            admin_user.set_password(data['password'])
        
        if current_user['type'] == 'SuperAdmin':
            admin_user.is_superuser = data.get('is_superuser', admin_user.is_superuser)
            admin_user.is_active = data.get('is_active', admin_user.is_active)
        
        db.session.commit()
        return jsonify(admin_user.serialize()), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@admins.route('/<int:admin_id>', methods=['DELETE'])
@jwt_required()
def delete_admin(admin_id):
    current_user = get_jwt_identity()
    if current_user['type'] != 'SuperAdmin':
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
    current_user = get_jwt_identity()
    if current_user['type'] != 'SuperAdmin':
        return jsonify({"message": "Access denied"}), 403
    
    admin_user = Admin_User.query.get(admin_id)
    if not admin_user:
        return jsonify({"message": "Admin not found"}), 404
    
    admin_user.is_superuser = not admin_user.is_superuser
    db.session.commit()
    return jsonify(admin_user.serialize()), 200

@admins.route('/change-requests', methods=['GET'])
@jwt_required()
def get_change_requests():
    current_user = get_jwt_identity()
    if current_user['type'] not in ['Admin', 'SuperAdmin']:
        return jsonify({"error": "Unauthorized. Only admins can access change requests."}), 403
    
    try:
        change_requests = ItemChangeRequest.query.filter_by(status='pending').all()
        return jsonify([request.serialize() for request in change_requests]), 200
    except SQLAlchemyError as e:
        logging.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500

@admins.route('/approve-change', methods=['POST'])
@jwt_required()
def approve_change():
    current_user = get_jwt_identity()
    admin = Admin_User.query.get(current_user['id'])
    if not admin or not admin.is_active:
        return jsonify({"message": "Access denied"}), 403
    
    data = request.get_json()
    try:
        change_request = ItemChangeRequest.query.get(data['requestId'])
        if not change_request:
            return jsonify({"error": "Change request not found"}), 404
        
        change_request.status = 'approved' if data['approved'] else 'rejected'
        change_request.admin_id = current_user.id
        change_request.admin_comment = data.get('comment', '')
        
        box_item = change_request.box_item
        
        if data['approved']:
            # Cambiar el nombre del artículo por el nuevo nombre aprobado
            old_item_name = box_item.item_name
            box_item.item_name = change_request.proposed_item_name
            
            # Actualizar el estado del ShopSale
            shop_sale = ShopSale.query.get(change_request.shop_sale_id)
            shop_sale.status = 'item_change_approved'
        
            # Notificar a la tienda
            shop_notification = Notification(
            shop_id=change_request.shop_id,
            type="item_change_approved",
            content=f"The change request of the item: {old_item_name} for item: {box_item.item_name} for order #{change_request.sale_id} (ShopSale #{change_request.shop_sale_id}) has been approved. Please confirm the updated order.",
            sale_id=change_request.sale_id,
            shop_sale_id=change_request.shop_sale_id
            )
            db.session.add(shop_notification)
        else:
            # Crear notificación de rechazo para la tienda
            shop_notification = Notification(
                shop_id=change_request.shop_id,
                type="item_change_rejected",
                content=f"The change request of the item: {old_item_name} for item: {box_item.item_name}, for order with ID: {box_item.sale_detail.sale_id} has been rejected. Admin message: {change_request.admin_comment}",
                item_change_request_id=change_request.id
            )
            db.session.add(shop_notification)
        
        db.session.commit()
        return jsonify({"message": "Change request processed successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@admins.route('/change-requests/stats', methods=['GET'])
@jwt_required()
def get_change_request_stats():
    current_user = get_jwt_identity()
    if current_user['type'] not in ['Admin', 'SuperAdmin']:
        return jsonify({"error": "Unauthorized. Only admins can access change request stats."}), 403
    
    try:
        total_requests = ItemChangeRequest.query.count()
        pending_requests = ItemChangeRequest.query.filter_by(status='pending').count()
        approved_requests = ItemChangeRequest.query.filter_by(status='approved').count()
        rejected_requests = ItemChangeRequest.query.filter_by(status='rejected').count()
        
        return jsonify({
            "total_requests": total_requests,
            "pending_requests": pending_requests,
            "approved_requests": approved_requests,
            "rejected_requests": rejected_requests
        }), 200
    except SQLAlchemyError as e:
        logging.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500

@admins.route('/change-request/<int:request_id>', methods=['GET'])
@jwt_required()
def get_change_request_details(request_id):
    current_user = get_jwt_identity()
    admin = Admin_User.query.get(current_user['id'])
    if not admin or not admin.is_active:
        return jsonify({"message": "Access denied"}), 403
    
    try:
        change_request = ItemChangeRequest.query.get(request_id)
        if not change_request:
            return jsonify({"error": "Change request not found"}), 404
        
        return jsonify(change_request.serialize()), 200
    except SQLAlchemyError as e:
        return jsonify({"error": str(e)}), 500