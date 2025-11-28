# Backend API

MERN Stack Login API Server

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
MONGO_DB_CONN_STRING=mongodb://127.0.0.1:27017/practice_mern
PORT=3001
FRONTEND_URL=http://localhost:5173
```

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- **GET** `/health` - Check if server is running

### Login
- **POST** `/login`
  - Body: `{ "phoneNumber": "string", "password": "string" }`
  - Response: `{ "message": "Success" }`
  - Creates user if doesn't exist, updates if exists

## Environment Variables

- `MONGO_DB_CONN_STRING` - MongoDB connection string (required)
- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (optional)

## Deployment

1. Set environment variables in your hosting platform
2. Run `npm install --production` to install only production dependencies
3. Start with `npm start`

