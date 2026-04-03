from config import app, db
from models import User, Child, CareLog

# This ensures we are working within the Flask application context
with app.app_context():
    print("Deleting old database...")
    db.drop_all()
    
    print("Creating new database tables...")
    db.create_all()
    
    print("Database is ready!")