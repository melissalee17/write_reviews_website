import os
from reviews_website_api.config import Config
from flask import Flask 
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__, static_folder=os.environ['SITE_BUILD_PATH'], static_url_path='/')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000
app.config['UPLOAD_EXTENSIONS'] = ['.jpg', '.png']
app.config['UPLOAD_PATH'] = 'uploads'
cors = CORS()
cors.init_app(app)
app.config["SQLALCHEMY_DATABASE_URI"] = Config.SQLALCHEMY_DATABASE_URI
app.config.from_object(Config)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
from reviews_website_api import models, routes 