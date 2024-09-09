"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS


from api.users.routes import users
from api.shops.routes import shops
from api.google.routes import auth
from api.sales.routes import sales
from api.payment.routes import payment

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)

api.register_blueprint(users, url_prefix='/users')
api.register_blueprint(shops, url_prefix='/shops')
api.register_blueprint(auth, url_prefix='/auth')
api.register_blueprint(sales, url_prefix='/sales')
api.register_blueprint(payment, url_prefix='/payment')


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

