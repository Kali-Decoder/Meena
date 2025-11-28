import { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showActivationModal, setShowActivationModal] = useState(false);
    
    // Environment variables
    const IS_PRODUCTION = import.meta.env.VITE_IS_PRODUCTION === 'true' || import.meta.env.VITE_IS_PRODUCTION === true;
    
    // Check if we're on the deployed frontend
    const isDeployedFrontend = window.location.hostname.includes('vercel.app') || 
                                window.location.hostname.includes('app-showpay');
    
    // Determine API URL
    let API_URL;
    if (isDeployedFrontend) {
        // If deployed on Vercel, we MUST use a deployed backend URL (not localhost)
        API_URL = import.meta.env.VITE_API_URL;
        if (!API_URL || API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
            console.error('ERROR: VITE_API_URL must be set to a deployed backend URL when frontend is deployed!');
            API_URL = null; // Will show error to user
        }
    } else {
        // Local development - use localhost backend
        if (!IS_PRODUCTION) {
            API_URL = 'http://localhost:3001';
        } else {
            // Production mode but running locally - use VITE_API_URL if set
            const envApiUrl = import.meta.env.VITE_API_URL;
            // Prevent using frontend URL as API URL
            if (envApiUrl && !envApiUrl.includes('app-showpay.vercel.app') && !envApiUrl.includes('localhost:5173')) {
                API_URL = envApiUrl;
            } else {
                API_URL = 'http://localhost:3001';
            }
        }
    }
    
    // Final safeguard: never use frontend URL as API URL
    if (API_URL && (API_URL.includes('app-showpay.vercel.app') || API_URL.includes('localhost:5173'))) {
        console.warn('Invalid API URL detected (frontend URL), using localhost:3001 instead');
        if (!isDeployedFrontend) {
            API_URL = 'http://localhost:3001';
        } else {
            API_URL = null; // Will show error
        }
    }
    
    console.log('API URL:', API_URL, 'IS_PRODUCTION:', IS_PRODUCTION, 'isDeployedFrontend:', isDeployedFrontend);

    const handleSubmit = (event) => {
        event.preventDefault();
        
        // Clear previous errors
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
    
        
        // Validate API URL before making request
        if (!API_URL) {
            console.error('Invalid API URL:', API_URL);
            alert('Backend API URL is not configured. Please set VITE_API_URL environment variable to your deployed backend URL.');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            return;
        }
        
        if (isDeployedFrontend && (API_URL.includes('localhost') || API_URL.includes('127.0.0.1'))) {
            console.error('Invalid API URL for deployed frontend:', API_URL);
            alert('Cannot use localhost backend from deployed frontend. Please set VITE_API_URL to your deployed backend URL in Vercel environment variables.');
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            return;
        }
        
        console.log('API URL:', API_URL, 'IS_PRODUCTION:', IS_PRODUCTION);
        
        axios.post(`${API_URL}/login`, {phoneNumber, password})
        .then(result => {
            if(result.data.success){
                // Show activation modal on successful login
                setShowActivationModal(true);
                // Reset form
                setPhoneNumber('');
                setPassword('');
            }
        })
        .catch(err => {
            console.error('Login error:', err);
            // Log the full error for debugging
            if (err.response) {
                console.error('Response error:', err.response.status, err.response.data);
            } else if (err.request) {
                console.error('Request error:', err.request);
            }
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        });
    }


    return (
        <>
            <div className="flex justify-center items-center min-h-screen bg-white px-4 sm:px-6">
                <div className="w-full max-w-md">
                    <h2 className='mb-6 sm:mb-8 text-xl sm:text-2xl font-bold text-blue-500 text-center uppercase'>LOG IN</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" autoComplete="off">
                        <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-base sm:text-lg text-gray-400">📞</span>
                            <input 
                                type="tel" 
                                placeholder="Enter Your Phone Number"
                                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-5 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" 
                                value={phoneNumber}
                                onChange={(event) => setPhoneNumber(event.target.value)}
                                autoComplete="off"
                                required
                            /> 
                        </div>
                        <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-base sm:text-lg text-gray-400">🔒</span>
                            <input 
                                type="password" 
                                placeholder="Enter Password"
                                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-5 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" 
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 sm:py-4 px-4 rounded-lg transition duration-200 uppercase text-sm sm:text-base">LOG IN</button>
                    </form>
                </div>
            </div>

            {/* Activation Modal */}
            {showActivationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 sm:p-8 relative">
                        <button
                            onClick={() => setShowActivationModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                        <div className="text-center">
                            <div className="mb-4">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                                    <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                Your ID is Activated
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Your account has been successfully activated.
                            </p>
                            <button
                                onClick={() => setShowActivationModal(false)}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 uppercase text-sm sm:text-base"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Login