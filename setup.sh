#!/bin/bash

# 1. Server Setup (Virtual Env & Dependencies)
echo "Setting up Python environment..."
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create a secret key if .env is missing
if [ ! -f .env ]; then
    echo "SECRET_KEY=$(python3 -c 'import os; print(os.urandom(16).hex())')" > .env
fi

# Database initialization
echo "Initializing database..."
flask db upgrade
# python seed.py 
cd ..

# 2. Frontend Setup
echo "Installing React dependencies..."
cd frontend
npm install
cd ..

# 3. Execution
echo "Launching TinyTracks..."

# Start Backend Server
cd server
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Start Frontend
cd frontend
npm run dev &
FRONTEND_PID=$!

# Wait for servers and open browser
sleep 5
URL="http://localhost:5173"

if command -v open > /dev/null; then
    open $URL
elif command -v xdg-open > /dev/null; then
    xdg-open $URL
fi

# Keep the script running to maintain the background processes
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait