import stripe
import os

from flask import Flask, render_template, jsonify, request, Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from dotenv import load_dotenv, find_dotenv


payment = Blueprint('payment', __name__)



load_dotenv(find_dotenv())

stripe.api_key =os.getenv('STRIPE_SK')

@payment.route('/')
def index():
    return 'Hello Stripe Devs'
    