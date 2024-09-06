from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.dialects.postgresql import ARRAY
from datetime import datetime
from sqlalchemy.orm import column_property
from sqlalchemy import select, func
from sqlalchemy.ext.hybrid import hybrid_property


db = SQLAlchemy()

class BaseModel(db.Model):
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

class User(BaseModel):
    __tablename__ = "users"
    
    name = db.Column(db.String(120), nullable=False)
    surname = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(300), nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    upper_size = db.Column(db.String(10), nullable=False)
    lower_size = db.Column(db.String(10), nullable=False)
    cap_size = db.Column(db.String(10))
    shoe_size = db.Column(db.String(10), nullable=False)
    not_colors = db.Column(ARRAY(db.String))
    stamps = db.Column(db.String(20), nullable=False)
    fit = db.Column(db.String(20), nullable=False)
    not_clothes = db.Column(ARRAY(db.String))
    categories = db.Column(ARRAY(db.String), nullable=False)
    profession = db.Column(db.String(100), nullable=False)
    is_active = db.Column(db.Boolean(), default=True, nullable=False)
    
    sales = db.relationship('Sale', backref='user', lazy='dynamic')
    ratings = db.relationship('Rating', backref='user', lazy='dynamic')
    
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
            "cap_size": self.cap_size,
            "shoe_size": self.shoe_size,
            "not_colors": self.not_colors,
            "stamps": self.stamps,
            "fit": self.fit,
            "not_clothes": self.not_clothes,
            "categories": self.categories,
            "profession": self.profession,
        }
    
class Sale(BaseModel):
    __tablename__ = "sales"

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    commission_rate = db.Column(db.Float, default=0.05, nullable=False)

    sale_details = db.relationship('SaleDetail', backref='sale', lazy='dynamic')
    shop_sales = db.relationship('ShopSale', backref='sale', lazy='dynamic')

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'date': self.created_at,
            'total_amount': self.total_amount,
            'commission_rate': self.commission_rate,
            'sale_details': [detail.serialize() for detail in self.sale_details],
            'shop_sales': [shop_sale.serialize() for shop_sale in self.shop_sales]
        }

class ShopSale(BaseModel):
    __tablename__ = "shop_sales"

    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'), nullable=False)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending', nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'sale_id': self.sale_id,
            'shop_id': self.shop_id,
            'subtotal': self.subtotal,
            'status': self.status
        }

class SaleDetail(BaseModel):
    __tablename__ = "sale_details"

    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'), nullable=False)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    mystery_box_id = db.Column(db.Integer, db.ForeignKey('mystery_boxes.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'sale_id': self.sale_id,
            'shop_id': self.shop_id,
            'mystery_box_id': self.mystery_box_id,
            'quantity': self.quantity,
            'price': self.price,
            'subtotal': self.subtotal
        }

class Shop(BaseModel):
    __tablename__ = "shops"
    
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(300), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    postal_code = db.Column(db.String(20), nullable=False)
    categories = db.Column(ARRAY(db.String), nullable=False)
    business_core = db.Column(db.Text, nullable=False)
    shop_description = db.Column(db.Text, nullable=False)
    shop_summary = db.Column(db.String(200), nullable=False)
    image_shop_url = db.Column(db.String(200), nullable=False)
    owner_name = db.Column(db.String(120), nullable=False)
    owner_surname = db.Column(db.String(120), nullable=False)
    
    mystery_boxes = db.relationship('MysteryBox', backref='shop', lazy='dynamic')
    shop_sales = db.relationship('ShopSale', backref='shop', lazy='dynamic')
    sale_details = db.relationship('SaleDetail', backref='shop', lazy='dynamic')
    ratings = db.relationship('Rating', backref='shop', lazy='dynamic')

    @hybrid_property
    def total_sales(self):
        return db.session.query(func.coalesce(func.sum(ShopSale.subtotal), 0)).filter(ShopSale.shop_id == self.id).scalar()
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "shop_summary": self.shop_summary,
            "image_shop_url": self.image_shop_url
        }

    def serialize_for_card(self):
        return {
            "id": self.id,
            "name": self.name,
            "categories": self.categories,
            "total_sales": float(self.total_sales),
            "address": self.address,
            "shop_summary": self.shop_summary,
            "image_shop_url": self.image_shop_url
        }

    def serialize_detail(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "address": self.address,
            "postal_code": self.postal_code,
            "categories": self.categories,
            "business_core": self.business_core,
            "shop_description": self.shop_description,
            "shop_summary": self.shop_summary,
            "image_shop_url": self.image_shop_url,
            "owner_name": self.owner_name,
            "owner_surname": self.owner_surname,
            "total_sales": float(self.total_sales),
            "total_orders": self.shop_sales.count(),
            "mystery_boxes": [box.serialize_for_card() for box in self.mystery_boxes],
            "average_rating": self.average_rating(),
            "ratings": [rating.serialize() for rating in self.ratings]
        }

    def average_rating(self):
        ratings = [r.rating for r in self.ratings]
        return sum(ratings) / len(ratings) if ratings else 0

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class MysteryBox(BaseModel):
    __tablename__ = "mystery_boxes"
    
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    size = db.Column(db.String(20), nullable=False)
    possible_items = db.Column(ARRAY(db.String), nullable=False)
    image_url = db.Column(db.String(200), nullable=False)
    number_of_items = db.Column(db.Integer, nullable=False)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    revenue = db.Column(db.Float, nullable=True)

    sale_details = db.relationship('SaleDetail', backref='mystery_box', lazy='dynamic')
    ratings = db.relationship('Rating', backref='rated_mystery_box', lazy='dynamic')

    @hybrid_property
    def total_sales(self):
        return db.session.query(func.coalesce(func.sum(SaleDetail.quantity), 0)).filter(SaleDetail.mystery_box_id == self.id).scalar()

    @hybrid_property
    def total_revenue(self):
        return db.session.query(func.coalesce(func.sum(SaleDetail.subtotal), 0)).filter(SaleDetail.mystery_box_id == self.id).scalar()
    
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'image_url': self.image_url,
            'shop_id': self.shop_id,
            'shop_name': self.shop.name,
        }

    def serialize_for_card(self):
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'image_url': self.image_url,
            'shop_id': self.shop_id,
            'shop_name': self.shop.name,
            'total_sales': int(self.total_sales),
            'shop_categories': self.shop.categories
        }

    def serialize_detail(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'size': self.size,
            'possible_items': self.possible_items,
            'image_url': self.image_url,
            'number_of_items': self.number_of_items,
            'shop_id': self.shop_id,
            'shop_name': self.shop.name,
            'total_sales': int(self.total_sales),
            'total_revenue': float(self.total_revenue),
            'shop_categories': self.shop.categories,
            'average_rating': self.average_rating()
        }

    def average_rating(self):
        ratings = [r.rating for r in self.ratings]
        return sum(ratings) / len(ratings) if ratings else 0

class Rating(BaseModel):
    __tablename__ = "ratings"

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    mystery_box_id = db.Column(db.Integer, db.ForeignKey('mystery_boxes.id'), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    comment = db.Column(db.String(450))
    is_anonymous = db.Column(db.Boolean, default=False, nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'shop_id': self.shop_id,
            'mystery_box_id': self.mystery_box_id,
            'rating': self.rating,
            'comment': self.comment,
            'date': self.created_at,
            'is_anonymous': self.is_anonymous
        }


