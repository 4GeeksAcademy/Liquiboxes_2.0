import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from google.oauth2 import id_token
from google.auth.transport import requests
from api.models import db, User, Shop
import logging
from flask_cors import cross_origin


google = Blueprint('google', __name__)

GOOGLE_CLIENT_ID = os.getenv("REACT_APP_ID_CLIENTE_GOOGLE")

@google.route('/login', methods=['POST'])
@cross_origin()
def google_login():
    if not GOOGLE_CLIENT_ID:
        logging.error("GOOGLE_CLIENT_ID no está configurado")
        return jsonify({'error': 'Configuración del servidor incompleta'}), 500

    token = request.json.get('token')
    logging.info(f"Recibida solicitud de login con Google. Token: {token[:10]}...")
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        logging.info(f"Token verificado correctamente. Email: {idinfo['email']}")

        user_email = idinfo['email']
        user_name = idinfo.get('given_name', 'Usuario')
        user_surname = idinfo.get('family_name', 'Google')

        user = User.query.filter_by(email=user_email).first()
        shop = Shop.query.filter_by(email=user_email).first()

        if user:
            logging.info(f"Usuario encontrado: {user.id}")
            user_type = "normal"
            identity = user.id
            is_new_user = False
        elif shop:
            logging.info(f"Tienda encontrada: {shop.id}")
            user_type = "shop"
            identity = shop.id
            is_new_user = False
        else:
            logging.info("Nuevo usuario detectado")
            user_type = "new"
            identity = user_email  # Usamos el email como identidad temporal
            is_new_user = True

        access_token = create_access_token(identity=identity)
        logging.info(f"Token JWT creado para {user_type} con id {identity}")

        return jsonify({
            'access_token': access_token,
            'user_type': user_type,
            'is_new_user': is_new_user,
            'google_data': {
                'email': user_email,
                'name': user_name,
                'surname': user_surname
            }
        }), 200

    except ValueError as e:
        logging.error(f"Error al verificar el token: {str(e)}")
        return jsonify({'error': 'Token inválido'}), 400
    except Exception as e:
        logging.error(f"Error inesperado: {str(e)}")
        return jsonify({'error': 'Error del servidor'}), 500