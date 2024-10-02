"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, jsonify, send_from_directory
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS


from api.utils import APIException, generate_sitemap
from api.models import db, Admin_User, User, Shop
from api.routes import api
from api.commands import setup_commands

from api.users.routes import users
from api.shops.routes import shops
from api.google.routes import auth
from api.sales.routes import sales
from api.admins.routes import admins
from api.notifications.routes import notifications

from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()  # Esto carga las variables del archivo .env


ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
app.url_map.strict_slashes = False

CORS(app)

app.config['JWT_SECRET_KEY'] = 'tu_clave_secreta_aqui'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=10)
jwt = JWTManager(app)


app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SENDGRID_API_KEY'] = os.getenv('SENDGRID_API_KEY')
app.config['SENDGRID_DEFAULT_FROM'] = os.getenv('SENDGRID_DEFAULT_FROM')


@jwt.user_identity_loader
def user_identity_lookup(user):
    return user

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    identity = jwt_data["sub"]
    user_type = identity['type']
    if user_type in ['user', 'shop']:
        return User.query.get(identity['id']) if user_type == 'user' else Shop.query.get(identity['id'])
    elif user_type in ['Admin', 'SuperAdmin']:
        return Admin_User.query.get(identity['id'])
    return None


# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)


# add the admin
setup_commands(app)

# Add all endpoints 
app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(users, url_prefix='/api/users')
app.register_blueprint(shops, url_prefix='/api/shops')
app.register_blueprint(auth, url_prefix='/api/auth')
app.register_blueprint(sales, url_prefix='/api/sales')
app.register_blueprint(admins, url_prefix='/api/admins')
app.register_blueprint(notifications, url_prefix='/api/notifications')


# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
