require('dotenv').config();
const cors = require('cors');
const express = require('express');
const FormDataModel = require ('./models/FormData');
const connDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Connect to database
connDB();

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Login endpoint
app.post('/login', (req, res)=>{
    try {
        const {phoneNumber, password} = req.body;
        
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
