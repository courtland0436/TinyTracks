# TinyTracks: Pediatric Care & Health Analytics

## Description
TinyTracks is a full-stack application designed for parents and caregivers to monitor infant health trends and daily care routines. TinyTracks solves the challenge of high-frequency data entry in active care environments. The platform provides a dashboard for real-time logging of feedings, sleep, and diaper changes, while providing pediatric/parenting health tips.

## Key Features
* **Secure Session-Based Auth:** Implementation of Flask-Session and Bcrypt for secure, isolated user data management.
* **Multi-Profile Architecture:** A relational database schema linking users to multiple child profiles, each with individual, time-stamped care histories.
* **High-Accessibility Mobile UI:** Custom Tailwind CSS implementation featuring breakpoint-specific scaling to ensure a "one-handed" logging experience on mobile devices.
* **Dynamic Health Guidance:** A modular logic system that filters and surfaces pediatric health tips tailored to the child's exact age in months.
* **Comprehensive Care CRUD:** Full RESTful implementation for Feeding (volume), Sleep (duration), and Diaper resources.
* **Professional Data Export:** Integrated reporting tools to compile and export care history for pediatric consultations.

## Tech Stack

### Frontend
* **React 18** (Vite)
* **Tailwind CSS** (Advanced Responsive Utilities)
* **React Router DOM** (Client-Side Navigation)

### Backend
* **Python / Flask** (RESTful API Design)
* **SQLAlchemy** (ORM & Relationship Management)
* **Flask-Session** (Secure State Management)
* **SQLite** (Relational Data Storage)

## Quick Start (One-Command Setup)
To install all dependencies, initialize the database, and launch the application in your browser automatically, run the following command from the project root:
```
chmod +x setup.sh && ./setup.sh
```
*Note: This script automates virtual environment creation, pip/npm dependency installation, and concurrent server execution.*

### First Steps After Launching
Once the application opens in your browser:
1. Navigate to the **Sign Up** screen.
2. Create a new account with a username and a password.
3. Log in to begin adding child profiles and tracking care logs. 

*Note: The database starts empty to allow for a clean, personalized testing experience.*

## Manual Setup (If Script Fails)
If the automated script does not work on your system, you can launch the components manually:

### 1. Server Setup
```
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed.py  # Initializes the database tables
python app.py   # Starts backend on http://localhost:5555
```

### 2. Client Setup Open a second terminal window:
```
cd client
npm install
npm run dev
```
Start frontend in browser at http://localhost:5173

## API Endpoints Reference
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | /api/signup | Registers user and initializes encrypted session |
| POST | /api/login | Authenticates credentials and returns user context |
| GET | /api/children | Retrieves all profiles owned by the authenticated user |
| GET | /api/children/<id> | Fetches child data with nested activity logs |
| POST | /api/care_logs | Creates a new care record with detail-specific validation |
| PATCH | /api/care_logs/<id> | Updates existing log entries via localized state |
| DELETE | /api/care_logs/<id> | Authorizes and removes specific care records from the DB |

## Design Reflections
The primary engineering challenge of TinyTracks was balancing a data-rich dashboard with a mobile-first user experience. Unlike standard productivity tools, infant care tracking requires immediate, low-friction input. By utilizing custom grid scaling and a responsive "Quick-Log" interface, the application maintains usability across all device types. Furthermore, the backend is architected with strict ownership control and SQLAlchemy relationships to ensure data privacy and integrity—a critical requirement for health-related applications.