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

// CORS configuration
const corsOptions = {
    origin: true, 
    credentials: true,
};

app.use(cors(corsOptions));


connDB();

// Wait for database connection before handling requests
mongoose.connection.on('connected', () => {
  console.log('Database connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('Database connection error:', err);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Login endpoint
app.post('/login', async (req, res)=>{
    try {
        const {phoneNumber, password} = req.body;
        console.log(phoneNumber, password);
        // Validation
        if (!phoneNumber || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Phone number and password are required' 
            });
        }
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

// Export the app for Vercel serverless functions
// Only use app.listen() in local development (not on Vercel)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

module.exports = app;
