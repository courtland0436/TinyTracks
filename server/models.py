from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy_serializer import SerializerMixin
from config import db, bcrypt
from datetime import date

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column(db.String, nullable=False)

    children = db.relationship('Child', back_populates='user', cascade="all, delete-orphan")

    serialize_rules = ('-children.user', '-_password_hash',)

    @hybrid_property
    def password_hash(self):
        raise AttributeError('Password hashes may not be viewed.')

    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))

class Child(db.Model, SerializerMixin):
    __tablename__ = 'children'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    birthdate = db.Column(db.Date)
    image_url = db.Column(db.String) # New Column
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

    user = db.relationship('User', back_populates='children')
    logs = db.relationship('CareLog', back_populates='child', cascade="all, delete-orphan")

    serialize_rules = ('-user.children', '-logs.child', 'age_display', 'image_url',)

    @property
    def age_display(self):
        if not self.birthdate:
            return "Age unknown"
        
        today = date.today()
        years = today.year - self.birthdate.year - ((today.month, today.day) < (self.birthdate.month, self.birthdate.day))
        
        total_months = (today.year - self.birthdate.year) * 12 + today.month - self.birthdate.month
        if today.day < self.birthdate.day:
            total_months -= 1

        if years >= 2:
            return f"{years} years old"
        elif total_months >= 1:
            return f"{total_months} months old"
        else:
            diff = today - self.birthdate
            return f"{diff.days} days old"

class CareLog(db.Model, SerializerMixin):
    __tablename__ = 'care_logs'

    id = db.Column(db.Integer, primary_key=True)
    activity_type = db.Column(db.String, nullable=False) 
    details = db.Column(db.String)                        
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    child_id = db.Column(db.Integer, db.ForeignKey('children.id'))

    child = db.relationship('Child', back_populates='logs')

    serialize_rules = ('-child.logs',)