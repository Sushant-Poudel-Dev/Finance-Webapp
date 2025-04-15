# Expense Tracker

Expense Tracker is a full-stack application designed to help users manage their personal finances. It allows users to track expenses, incomes, savings, and financial goals, and provides visualizations for better financial planning.

## Features

### Frontend

- Built with React and Vite for a fast and modern user experience.
- Responsive design with a clean and intuitive interface.
- Features include:
  - Dashboard for an overview of finances.
  - Expense and income tracking.
  - Financial goal planning.
  - Data visualization with charts (Pie, Line, and Bar charts).
  - Bill reminders.
  - Export financial data to Excel.

### Backend

- Built with FastAPI for a robust and scalable API.
- MongoDB for data storage.
- Features include:
  - CRUD operations for expenses, incomes, savings, and goals.
  - Data export functionality.
  - CORS support for seamless frontend-backend communication.

## Tech Stack

### Frontend

- React
- Vite
- Chart.js
- Material-UI
- React Router
- Sass for styling

### Backend

- FastAPI
- MongoDB
- Pydantic for data validation
- Pandas and OpenPyXL for data export

## Installation

### Prerequisites

- Node.js and npm
- Python 3.10+
- MongoDB

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file and configure the following variables:
   ```env
   MONGO_URI=mongodb://localhost:27017
   DATABASE_NAME=ExpenseTracker
   ADMIN_SECRET_KEY=your_secret_key
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Usage

1. Open the frontend in your browser at `http://localhost:5173`.
2. Use the dashboard to view your financial overview.
3. Navigate to different sections to add expenses, incomes, and goals.
4. Export your financial data from the backend endpoint `/export/data`.

## Folder Structure

### Frontend

- `src/components`: Reusable React components.
- `src/pages`: Page-level components for routing.
- `src/styles`: SCSS files for styling.
- `src/utils`: Utility functions.

### Backend

- `app/routes`: API routes for different resources.
- `app/models`: Database models.
- `app/database.py`: MongoDB connection and initialization.
- `app/main.py`: FastAPI application entry point.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.
