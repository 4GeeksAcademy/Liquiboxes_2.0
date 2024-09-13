from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from api.models import db, Notification, ItemChangeRequest, BoxItem, User, Shop, Admin_User, NotificationType
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
            recipient_type=data['recipient_type'],
            recipient_id=data['recipient_id'],
            sender_type=current_user['type'],
            sender_id=current_user['id'],
            type=NotificationType(data['type']),
            content=data['content'],
            extra_data=data.get('extra_data', {})
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
    
    notifications = Notification.query.filter_by(recipient_id=user.id, recipient_type='user').order_by(Notification.created_at.desc()).all()
    return jsonify([notification.serialize() for notification in notifications]), 200

@notifications.route('/shop', methods=['GET'])
@jwt_required()
def get_shop_notifications():
    current_user = get_jwt_identity()
    shop = Shop.query.get(current_user['id'])
    if not shop:
        return jsonify({"error": "Shop not found"}), 404
    
    notifications = Notification.query.filter_by(recipient_id=shop.id, recipient_type='shop').order_by(Notification.created_at.desc()).all()
    return jsonify([notification.serialize() for notification in notifications]), 200

@notifications.route('/<int:notification_id>/read', methods=['PATCH'])
@jwt_required()
def mark_notification_as_read(notification_id):
    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({"success": False, "error": "Notification not found"}), 404
    
    notification.is_read = True
    db.session.commit()
    return jsonify({"success": True, "message": "Notification marked as read"}), 200

@notifications.route('/<int:notification_id>/change_type', methods=['PATCH'])
@jwt_required()
def change_notification_type(notification_id):
    current_user = get_jwt_identity()
    if current_user['type'] != 'admin':
        return jsonify({"success": False, "error": "Only admins can change notification types"}), 403

    data = request.json
    new_type = data.get('type')

    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({"success": False, "error": "Notification not found"}), 404

    try:
        notification.type = NotificationType(new_type)
        db.session.commit()
        return jsonify({"success": True, "message": "Notification type updated successfully"}), 200
    except ValueError:
        return jsonify({"success": False, "error": "Invalid notification type"}), 400

@notifications.route('/all', methods=['GET'])
@jwt_required()
def get_all_notifications():
    current_user = get_jwt_identity()
    if current_user['type'] not in ['Admin', 'SuperAdmin']:
        return jsonify({"error": "Unauthorized. Only admins can access all notifications."}), 403
    
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
    
    if current_user['type'] != 'shop':
        return jsonify({'error': 'You must be logged in as a shop'}), 403
    
    current_shop = Shop.query.get(current_user['id'])
    
    if not current_shop:
        return jsonify({"error": "Shop not found"}), 404
    
    data = request.get_json()
    
    try:
        box_item = BoxItem.query.get(data['box_item_id'])
        if not box_item or box_item.sale_detail.shop_id != current_shop.id:
            return jsonify({"error": "Invalid box item"}), 400

        new_request = ItemChangeRequest(
            box_item_id=data['box_item_id'],
            shop_id=current_shop.id,
            original_item_name=box_item.item_name,
            proposed_item_name=data['proposed_item_name'],
            reason=data['reason']
        )
        db.session.add(new_request)
        db.session.flush()  # Asigna un ID a new_request sin hacer commit

        sale_id = box_item.sale_detail.sale_id
        if not sale_id:
            return jsonify({"error": "Sale not found"}), 400
        
        # Create notification for admins
        admin_notification = Notification(
            recipient_type='admin',
            recipient_id=None,  # Esto se asignará a un admin específico más tarde
            sender_type='shop',
            sender_id=current_shop.id,
            type=NotificationType.ITEM_CHANGE_REQUEST,
            content=f"New change request from shop {current_shop.name}",
            extra_data={
                'shop_id': current_shop.id,
                'sale_id': sale_id,
                'item_change_request_id': new_request.id
            }
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
    if not admin or current_user['type'] != 'SuperAdmin':
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
            recipient_type='shop',
            recipient_id=change_request.shop_id,
            sender_type='admin',
            sender_id=admin.id,
            type=NotificationType.CHANGE_REQUEST_RESULT,
            content=f"Your change request has been {change_request.status}",
            extra_data={'item_change_request_id': change_request.id}
        )
        db.session.add(shop_notification)

        user_notification = Notification(
            recipient_type='user',
            recipient_id=box_item.sale_detail.sale.user_id,
            sender_type='admin',
            sender_id=admin.id,
            type=NotificationType.ITEM_CHANGED,
            content=f"An item in your order has been changed",
            extra_data={'item_change_request_id': change_request.id}
        )
        db.session.add(user_notification)
        db.session.commit()

        return jsonify(change_request.serialize()), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        logging.error(f"Database error: {str(e)}")
        return jsonify({'error': 'Database error occurred'}), 500