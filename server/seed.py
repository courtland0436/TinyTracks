from config import app, db
from models import User, Child, CareLog

def setup_database():
    with app.app_context():
        print("Initializing a fresh database...")
        # This ensures the tables exist without needing pre-filled data
        db.create_all()
        print("Database is ready! You can now create an account on the Sign Up screen.")

if __name__ == "__main__":
    setup_database()