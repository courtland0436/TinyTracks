import os
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from flask_cors import CORS

# 1. Setup Metadata for Naming Conventions (important for migrations)
metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})

# 2. Initialize the Flask App
app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'dev_key_123') # For session security
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tinytracks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.json.compact = False

# 3. Initialize Extensions
db = SQLAlchemy(metadata=metadata)
migrate = Migrate(app, db) # This line "unlocks" the flask db command
db.init_app(app)

bcrypt = Bcrypt(app)
api = Api(app)
CORS(app)