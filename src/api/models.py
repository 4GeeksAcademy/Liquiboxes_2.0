from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.postgresql import ARRAY

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "user"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    surname = db.Column(db.String(120), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(300), nullable=False)
    upper_size = db.Column(db.String(10), nullable=False)
    lower_size = db.Column(db.String(10), nullable=False)
    cup_size = db.Column(db.String(10))
    shoe_size = db.Column(db.String(10), nullable=False)
    not_colors = db.Column(db.String(100))
    stamps = db.Column(db.String(20), nullable=False)
    fit = db.Column(db.String(20), nullable=False)
    not_clothes = db.Column(db.String(100))
    categories = db.Column(db.String(200), nullable=False)
    profession = db.Column(db.String(100), nullable=False)
    is_active = db.Column(db.Boolean(), default=True, nullable=False)
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "surname": self.surname,
            "email": self.email,
            "gender": self.gender,
            "address": self.address,
            "postal_code": self.postal_code,
            "upper_size": self.upper_size,
            "lower_size": self.lower_size,
            "cup_size": self.cup_size,
            "shoe_size": self.shoe_size,
            "not_colors": self.not_colors.split(',') if self.not_colors else [],
            "stamps": self.stamps,
            "fit": self.fit,
            "not_clothes": self.not_clothes.split(',') if self.not_clothes else [],
            "categories": self.categories.split(',') if self.categories else [],
            "profession": self.profession,
        }
    
    @classmethod
    def deserialize(cls, data):
        user = cls()
        for key, value in data.items():
            if key in ['not_colors', 'not_clothes', 'categories']:
                if isinstance(value, list):
                    setattr(user, key, ','.join(value) if value else None)
                else:
                    setattr(user, key, value)
            elif hasattr(user, key):
                setattr(user, key, value)
        return user

class Shop(db.Model):
    __tablename__ = "shop"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(300), nullable=False)
    categories = db.Column(ARRAY(db.String), nullable=False)
    business_core = db.Column(db.Text, nullable=False)
    shop_description = db.Column(db.Text, nullable=False)
    shop_summary = db.Column(db.String(200), nullable=False)
    image_shop_url = db.Column(db.String(200), nullable=False)
    owner_name = db.Column(db.String(120), nullable=False)
    owner_surname = db.Column(db.String(120), nullable=False)
    
    mystery_boxes = db.relationship('MysteryBox', backref='shop', lazy=True)

    def __repr__(self):
        return f'<Shop {self.name}>'
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "postal_code": self.postal_code,
            "email": self.email,
            "categories": self.categories,
            "business_core": self.business_core,
            "shop_description": self.shop_description,
            "shop_summary": self.shop_summary,
            "image_shop_url": self.image_shop_url,
            "owner_name": self.owner_name,
            "owner_surname": self.owner_surname
        }

class MysteryBox(db.Model):
    __tablename__ = "mystery_box"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    size = db.Column(db.String(20), nullable=False)
    possible_items = db.Column(ARRAY(db.String), nullable=False)
    image_url = db.Column(db.String(200), nullable=False)
    number_of_items = db.Column(db.Integer, nullable=False)
    shop_id = db.Column(db.Integer, db.ForeignKey('shop.id'), nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'size': self.size,
            'possible_items': self.possible_items,
            'image_url': self.image_url,
            'number_of_items': self.number_of_items,
            'shop_id': self.shop_id
        }