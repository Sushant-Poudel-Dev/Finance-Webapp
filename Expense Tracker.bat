@echo off

start "" /min cmd /c "mongod --dbpath C:\Program Files\MongoDB\Server\8.0\bin"

start "" /min cmd /c "cd /d C:\Users\susha\OneDrive\Desktop\Expense Tracker\backend && venv\Scripts\activate && uvicorn app.main:app --reload"

echo Starting Frontend...
start cmd /k "cd /d C:\Users\susha\OneDrive\Desktop\Expense Tracker\frontend && npm run dev"

echo Opening browser...
start "" "http://localhost:5173/"

echo All services are starting...

exit