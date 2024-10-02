from flask import Blueprint, request, jsonify, url_for, current_app
from flask_jwt_extended import create_access_token
from api.models import User, Shop, db
from google.oauth2 import id_token
from google.auth.transport import requests
import os
import logging
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
from datetime import timedelta

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

auth = Blueprint('auth', __name__)

# Configuración del serializador para el token
def get_serializer():
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'])

GOOGLE_CLIENT_ID = os.getenv("REACT_APP_ID_CLIENTE_GOOGLE")

def create_token_response(user_or_shop, user_type):
    
    identity = {
        'id': user_or_shop.id,
        'email': user_or_shop.email,
        'type': user_type
    }
    
    logger.debug(f"Creating token with identity: {identity}")
    
    try:
        access_token = create_access_token(
            identity=identity,
        )
        logger.debug("Token created successfully")
    except Exception as e:
        logger.error(f"Error creating token: {str(e)}")
        raise
    
    return jsonify({
        'access_token': access_token,
        'user_type': user_type,
        'user': user_or_shop.serialize()
    }), 200

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        return create_token_response(user, 'user')
    if user and not user.check_password(password):
        return jsonify({'error': 'Contraseña inválida'}), 401

    shop = Shop.query.filter_by(email=email).first()
    if shop and shop.check_password(password):
        return create_token_response(shop, 'shop')
    if shop and not shop.check_password(password):
        return jsonify({'error': 'Contraseña inválida'}), 401


    return jsonify({'error': 'No tenemos registrado tu email, inténtalo de nuevo o crea una cuenta.'}), 401

@auth.route('/google_login', methods=['POST'])
def google_login():
    if not GOOGLE_CLIENT_ID:
        logging.error("GOOGLE_CLIENT_ID no está configurado")
        return jsonify({'error': 'Configuración del servidor incompleta'}), 500

    token = request.json.get('token')
    if not token:
        return jsonify({'error': 'Token no proporcionado'}), 400

    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo['email']

        user = User.query.filter_by(email=email).first()
        if user:
            return create_token_response(user, 'user')

        shop = Shop.query.filter_by(email=email).first()
        if shop:
            return create_token_response(shop, 'shop')

        # New user
        return jsonify({
            'is_new_user': True,
            'google_data': {
                'email': email,
                'name': idinfo.get('given_name', ''),
                'surname': idinfo.get('family_name', '')
            }
        }), 200

    except ValueError as e:
        logging.error(f"Error al verificar el token: {str(e)}")
        return jsonify({'error': 'Token inválido'}), 400
    except Exception as e:
        logging.error(f"Error inesperado: {str(e)}")
        return jsonify({'error': 'Error del servidor', 'details': str(e)}), 500
    
@auth.route('/forgot-password', methods=['POST'])
def forgot_password():
    email = request.json.get('email')
    user = User.query.filter_by(email=email).first()
    if not user:
        user = Shop.query.filter_by(email=email).first()
    
    if user:
        serializer = get_serializer()
        token = serializer.dumps(email, salt='password-reset-salt')
        reset_url = url_for('auth.reset_password', token=token, _external=True)
        
        message = Mail(
            from_email=os.getenv('SENDGRID_DEFAULT_FROM'),
            to_emails=email,
            subject='Restablecimiento de contraseña',
            html_content=f'<strong>Para restablecer tu contraseña, visita el siguiente enlace:</strong><br>'
                         f'<a href="{reset_url}">{reset_url}</a><br>'
                         f'Este enlace es válido por 1 hora.'
        )
        
        try:
            sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
            response = sg.send(message)
            current_app.logger.info(f"SendGrid response: {response.status_code}")
            return jsonify({'message': 'Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.'}), 200
        except Exception as e:
            current_app.logger.error(f"Error al enviar el correo: {str(e)}")
            return jsonify({'error': 'Error al enviar el correo de recuperación'}), 500
    else:
        return jsonify({'error': 'No se encontró ninguna cuenta con ese correo electrónico.'}), 404
    
@auth.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    try:
        serializer = get_serializer()
        email = serializer.loads(token, salt='password-reset-salt', max_age=3600)  # 1 hora de validez
    except SignatureExpired:
        return jsonify({'error': 'El enlace de restablecimiento ha expirado.'}), 400
    
    new_password = request.json.get('new_password')
    
    if len(new_password) < 8:
        return jsonify({'error': 'La nueva contraseña debe tener al menos 8 caracteres.'}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        user = Shop.query.filter_by(email=email).first()
    
    if user:
        user.set_password(new_password)
        db.session.commit()
        return jsonify({'message': 'Tu contraseña ha sido actualizada correctamente.'}), 200
    else:
        return jsonify({'error': 'No se encontró ninguna cuenta con ese correo electrónico.'}), 404