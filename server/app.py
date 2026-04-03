import os
import random
import json
from flask import request, session, Response, send_from_directory, jsonify
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from config import app, db, api
from models import User, Child, CareLog
from datetime import datetime, date
import csv
from io import StringIO
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'static/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- USER & SESSION RESOURCES ---

class Signup(Resource):
    def post(self):
        json_data = request.get_json()
        try:
            new_user = User(username=json_data.get('username'))
            new_user.password_hash = json_data.get('password')
            db.session.add(new_user)
            db.session.commit()
            session['user_id'] = new_user.id
            return new_user.to_dict(), 201
        except IntegrityError:
            return {'error': 'Username already exists'}, 422

class Login(Resource):
    def post(self):
        json_data = request.get_json()
        user = User.query.filter_by(username=json_data.get('username')).first()
        if user and user.authenticate(json_data.get('password')):
            session['user_id'] = user.id
            return user.to_dict(), 200
        return {'error': 'Invalid username or password'}, 401

class Logout(Resource):
    def delete(self):
        session.pop('user_id', None)
        return {}, 204

class CheckSession(Resource):
    def get(self):
        user_id = session.get('user_id')
        if user_id:
            user = User.query.filter_by(id=user_id).first()
            if user:
                return user.to_dict(), 200
        return {'error': 'Not logged in'}, 401

# --- CHILD RESOURCES ---

class Children(Resource):
    def get(self):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        user = User.query.filter_by(id=user_id).first()
        return [c.to_dict() for c in user.children], 200

    def post(self):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        name = request.form.get('name')
        birthdate_str = request.form.get('birthdate')
        birthdate = None
        if birthdate_str:
            try:
                birthdate = datetime.strptime(birthdate_str, '%Y-%m-%d').date()
            except ValueError:
                birthdate = None
        image_file = request.files.get('image')
        image_url = None
        if image_file:
            filename = secure_filename(f"{datetime.now().timestamp()}_{image_file.filename}")
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            image_file.save(file_path)
            image_url = file_path
        new_child = Child(name=name, birthdate=birthdate, image_url=image_url, user_id=user_id)
        db.session.add(new_child)
        db.session.commit()
        return new_child.to_dict(), 201

class ChildById(Resource):
    def get(self, id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        child = Child.query.filter_by(id=id, user_id=user_id).first()
        if not child:
            return {'error': 'Child not found'}, 404
        return child.to_dict(rules=('logs',)), 200

    def patch(self, id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        child = Child.query.filter_by(id=id, user_id=user_id).first()
        if not child:
            return {'error': 'Child not found'}, 404
        if 'name' in request.form:
            child.name = request.form.get('name')
        if 'birthdate' in request.form:
            birthdate_str = request.form.get('birthdate')
            try:
                child.birthdate = datetime.strptime(birthdate_str, '%Y-%m-%d').date()
            except (ValueError, TypeError):
                pass 
        image_file = request.files.get('image')
        if image_file:
            filename = secure_filename(f"{datetime.now().timestamp()}_{image_file.filename}")
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            image_file.save(file_path)
            child.image_url = file_path
        db.session.commit()
        return child.to_dict(), 200

    def delete(self, id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        child = Child.query.filter_by(id=id, user_id=user_id).first()
        if not child:
            return {'error': 'Child not found'}, 404
        db.session.delete(child)
        db.session.commit()
        return {}, 204

# --- CARE LOG & EXPORT ---

class CareLogs(Resource):
    def post(self):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        json_data = request.get_json()
        date_str = json_data.get('date')
        try:
            log_time = datetime.now()
            if date_str:
                selected_date = date.fromisoformat(date_str)
                log_time = log_time.replace(year=selected_date.year, month=selected_date.month, day=selected_date.day)
            
            new_log = CareLog(
                activity_type=json_data.get('activity_type'),
                details=json_data.get('details'),
                child_id=int(json_data.get('child_id')),
                timestamp=log_time
            )
            db.session.add(new_log)
            db.session.commit()
            return new_log.to_dict(), 201
        except Exception as e:
            return {'error': str(e)}, 422

    def patch(self, id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        log = CareLog.query.get(id)
        if not log:
            return {'error': 'Log not found'}, 404
        json_data = request.get_json()
        if 'details' in json_data:
            log.details = json_data.get('details')
            db.session.commit()
            return log.to_dict(), 200
        return {'error': 'No updates provided'}, 400

    def delete(self, id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        log = CareLog.query.get(id)
        if not log:
            return {'error': 'Log not found'}, 404
        db.session.delete(log)
        db.session.commit()
        return {}, 204

class ExportLogs(Resource):
    def get(self, id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        child = Child.query.filter_by(id=id, user_id=user_id).first()
        if not child:
            return {'error': 'Child not found'}, 404

        start_str = request.args.get('start')
        end_str = request.args.get('end')
        query = CareLog.query.filter_by(child_id=id)
        
        try:
            if start_str and start_str != 'Start' and end_str and end_str != 'End':
                start_dt = datetime.fromisoformat(start_str).replace(hour=0, minute=0, second=0)
                end_dt = datetime.fromisoformat(end_str).replace(hour=23, minute=59, second=59)
                query = query.filter(CareLog.timestamp >= start_dt, CareLog.timestamp <= end_dt)
        except ValueError:
            pass

        logs = query.order_by(CareLog.timestamp.asc()).all()
        si = StringIO()
        cw = csv.writer(si)
        
        cw.writerow([f"TINYTRACKS PATIENT REPORT: {child.name.upper()}"])
        cw.writerow([f"Generated: {date.today().strftime('%m/%d/%Y')}"])
        cw.writerow([f"Date Range: {start_str} to {end_str}"])
        cw.writerow([])
        cw.writerow(['DATE', 'TIME', 'ACTIVITY', 'DETAILS/NOTES'])
        
        current_date = None
        for log in logs:
            log_date = log.timestamp.strftime('%m/%d/%Y')
            if current_date and log_date != current_date:
                cw.writerow(['---', '---', '---', '---'])
            
            cw.writerow([
                log_date,
                log.timestamp.strftime('%I:%M %p'),
                log.activity_type,
                log.details
            ])
            current_date = log_date

        response = Response(si.getvalue(), mimetype='text/csv')
        filename = f"{child.name}_Report_{start_str}_to_{end_str}.csv"
        response.headers.set("Content-Disposition", "attachment", filename=filename)
        return response

# --- HEALTH TIPS RESOURCE ---

class HealthTips(Resource):
    def get(self, id):
        # Look for the file in the same directory as app.py
        file_path = os.path.join(os.path.dirname(__file__), 'tips_data.json')
        
        # If it's not there, try the parent directory (sometimes helpful in development)
        if not os.path.exists(file_path):
             file_path = 'tips_data.json'

        try:
            with open(file_path, 'r') as f:
                tips_library = json.load(f)
            
            # Grab 2 random tips
            selected_tips = random.sample(tips_library, min(len(tips_library), 2))
            
            # Format cleanly for HealthGuidance.jsx
            formatted_tips = [
                {
                    "id": i,
                    "title": tip['title'],
                    "category": tip['category']
                } 
                for i, tip in enumerate(selected_tips)
            ]
            return formatted_tips, 200

        except Exception:
            # Fallback tips so the UI doesn't look broken if the JSON file is missing
            return [
                {"id": 1, "title": "Place baby on their back for every sleep.", "category": "Safety"},
                {"id": 2, "title": "Check diaper ruffles are pulled out to prevent leaks.", "category": "Hygiene"}
            ], 200

# --- ROUTES ---

api.add_resource(Signup, '/api/signup')
api.add_resource(Login, '/api/login')
api.add_resource(Logout, '/api/logout')
api.add_resource(CheckSession, '/api/check_session')
api.add_resource(Children, '/api/children')
api.add_resource(ChildById, '/api/children/<int:id>')
api.add_resource(CareLogs, '/api/care_logs', '/api/care_logs/<int:id>')
api.add_resource(ExportLogs, '/api/export/<int:id>')
api.add_resource(HealthTips, '/api/children/<int:id>/health_tips')

if __name__ == '__main__':
    app.run(port=5555, debug=True)