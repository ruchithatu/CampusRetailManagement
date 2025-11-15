# Student Portal - Setup Instructions

## Prerequisites
- Node.js installed
- MongoDB installed and running locally (or MongoDB Atlas account)

## Backend Setup

1. **Install MongoDB locally** (if not already installed):
   - Download from: https://www.mongodb.com/try/download/community
   - Install and start MongoDB service

2. **Start MongoDB**:
   ```powershell
   # In a new terminal
   mongod
   ```

3. **Configure MongoDB Connection**:
   - Edit `backend/.env` file
   - Update `MONGODB_URI` if using MongoDB Atlas or different connection string

4. **Install Backend Dependencies**:
   ```powershell
   cd backend
   npm install
   ```

5. **Start Backend Server**:
   ```powershell
   npm start
   # or for development with auto-reload:
   npm run dev
   ```
   Backend will run on: http://localhost:5000

## Frontend Setup

1. **Install Frontend Dependencies** (already done):
   ```powershell
   npm install
   ```

2. **Start Frontend**:
   ```powershell
   npm run dev
   ```
   Frontend will run on: http://localhost:5173

## How to Use

1. **Start MongoDB** (in terminal 1)
2. **Start Backend Server** (in terminal 2): `cd backend && npm start`
3. **Start Frontend** (in terminal 3): `npm run dev`

4. **Register a new user**:
   - Go to http://localhost:5173
   - Click "Register" button
   - Fill in all fields
   - Submit - data will be saved to MongoDB

5. **Login**:
   - Use registered email and password
   - Backend will validate credentials from MongoDB
   - On success, you'll be logged in

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

## Features

✅ User registration with MongoDB storage
✅ Password hashing with bcrypt
✅ Login validation against MongoDB data
✅ JWT token generation
✅ Form validation (frontend & backend)
