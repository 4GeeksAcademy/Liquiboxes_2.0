from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db, Notification, ItemChangeRequest, BoxItem, User, Shop, Admin_User
from sqlalchemy.exc import SQLAlchemyError
import logging

notifications = Blueprint('notifications', __name__)

@notifications.route('/create', methods=['POST'])
@jwt_required()
def create_notification():
    current_user = get_jwt_identity()
    data = request.json

    try:
        new_notification = Notification(
            recipient_id=data.get('recipient_id'),
            shop_id=data.get('shop_id'),
            sale_id=data.get('sale_id'),
            type=data['type'],
            content=data['content']
        )
        db.session.add(new_notification)
        db.session.commit()
        return jsonify(new_notification.serialize()), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500

@notifications.route('/user', methods=['GET'])
@jwt_required()
def get_user_notifications():
    current_user = get_jwt_identity()
    user = User.query.get(current_user['id'])
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    notifications = Notification.query.filter_by(recipient_id=user.id).order_by(Notification.created_at.desc()).all()
    return jsonify([notification.serialize_users() for notification in notifications]), 200

@notifications.route('/shop', methods=['GET'])
@jwt_required()
def get_shop_notifications():
    current_user = get_jwt_identity()
    shop = Shop.query.get(current_user['id'])
    if not shop:
        return jsonify({"error": "Shop not found"}), 404
    
    notifications = Notification.query.filter_by(shop_id=shop.id).order_by(Notification.created_at.desc()).all()
    return jsonify([notification.serialize_shops() for notification in notifications]), 200

@notifications.route('/all', methods=['GET'])
@jwt_required()
def get_all_notifications():
    current_user_id = get_jwt_identity()
    admin = Admin_User.query.get(current_user_id)
    if not admin:
        return jsonify({"error": "User not found or not an admin"}), 404
    if not admin.is_superuser:
        return jsonify({"error": "Unauthorized. Only superadmins can access all notifications."}), 403
    
    try:
        notifications = Notification.query.order_by(Notification.created_at.desc()).all()
        return jsonify([notification.serialize() for notification in notifications]), 200
    except SQLAlchemyError as e:
        logging.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500
    
@notifications.route('/all/backend', methods=['GET'])
def get_all_notifications_backend():

    try:
        notifications = Notification.query.order_by(Notification.created_at.desc()).all()
        return jsonify([notification.serialize() for notification in notifications]), 200
    except SQLAlchemyError as e:
        logging.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500

@notifications.route('/change-request', methods=['POST'])
@jwt_required()
def create_change_request():
    current_user = get_jwt_identity()
    shop = Shop.query.get(current_user['id'])
    if not shop:
        return jsonify({"error": "Shop not found"}), 404
    
    data = request.json
    try:
        new_request = ItemChangeRequest(
            box_item_id=data['box_item_id'],
            shop_id=shop.id,
            original_item_name=data['original_item_name'],
            original_item_size=data['original_item_size'],
            original_item_category=data['original_item_category'],
            proposed_item_name=data['proposed_item_name'],
            proposed_item_size=data['proposed_item_size'],
            proposed_item_category=data['proposed_item_category'],
            reason=data['reason']
        )
        db.session.add(new_request)
        db.session.commit()

        # Create notification for admins
        admin_notification = Notification(
            type="change_request",
            content=f"New change request from shop {shop.name}",
            item_change_request_id=new_request.id
        )
        db.session.add(admin_notification)
        db.session.commit()

        return jsonify(new_request.serialize()), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500

@notifications.route('/change-request/<int:request_id>', methods=['PUT'])
@jwt_required()
def approve_change_request(request_id):
    current_user = get_jwt_identity()
    admin = Admin_User.query.get(current_user['id'])
    if not admin or not admin.is_superuser:
        return jsonify({"error": "Unauthorized"}), 403
    
    change_request = ItemChangeRequest.query.get(request_id)
    if not change_request:
        return jsonify({"error": "Change request not found"}), 404
    
    data = request.json
    try:
        change_request.status = data['status']
        change_request.admin_id = admin.id
        change_request.admin_comment = data.get('admin_comment')
        
        if change_request.status == 'approved':
            box_item = BoxItem.query.get(change_request.box_item_id)
            if box_item:
                box_item.item_name = change_request.proposed_item_name
                box_item.item_size = change_request.proposed_item_size
                box_item.item_category = change_request.proposed_item_category
        
        db.session.commit()

        # Create notifications for shop and user
        shop_notification = Notification(
            shop_id=change_request.shop_id,
            type="change_request_result",
            content=f"Your change request has been {change_request.status}",
            item_change_request_id=change_request.id
        )
        db.session.add(shop_notification)

        user_notification = Notification(
            recipient_id=box_item.sale_detail.sale.user_id,
            type="item_changed",
            content=f"An item in your order has been changed",
            item_change_request_id=change_request.id
        )
        db.session.add(user_notification)
        db.session.commit()

        return jsonify(change_request.serialize()), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500