#!/bin/bash

# 1. Server Setup
echo "Setting up Python environment..."
cd server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create secret key if missing
if [ ! -f .env ]; then
    echo "SECRET_KEY=$(python3 -c 'import os; print(os.urandom(16).hex())')" > .env
fi

# Initialize database tables
echo "Preparing database..."
python seed.py 

cd ..

# 2. Client Setup
echo "Installing React dependencies..."
cd client
npm install
cd ..

# 3. Execution
echo "Launching TinyTracks..."

# Start Backend
cd server
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Start Client
cd client
npm run dev &
CLIENT_PID=$!

# Wait for servers and open browser
sleep 5
URL="http://localhost:5173"

if command -v open > /dev/null; then
    open $URL
elif command -v xdg-open > /dev/null; then
    xdg-open $URL
fi

trap "kill $BACKEND_PID $CLIENT_PID" EXIT
wait