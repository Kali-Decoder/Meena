import { useState, useRef } from 'react';
import axios from 'axios';

const Login = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const pinInputRefs = useRef([]);
    
    // Simple API URL: use env variable if available, otherwise default to localhost:8080
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Check if PIN is entered
        const pinString = pin.join('');
        if (pinString.length !== 6) {
            setShowPinModal(true);
            // Focus first PIN input
            setTimeout(() => {
                if (pinInputRefs.current[0]) {
                    pinInputRefs.current[0].focus();
                }
            }, 100);
            return;
        }
        
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        
        try {
            const result = await axios.post(`${API_URL}/login`, {
                phoneNumber,
                password,
                pin: pinString
            });
            
            if(result.data.success){
                alert('Login successful!');
                setPhoneNumber('');
                setPassword('');
                setPin(['', '', '', '', '', '']);
                setShowPinModal(false);
            }
        } catch (err) {
            console.error('Login error:', err);
            alert(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    const handlePinChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) {
            return;
        }
        
        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);
        
        // Auto-focus next input
        if (value && index < 5) {
            pinInputRefs.current[index + 1]?.focus();
        }
    };

    const handlePinKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            pinInputRefs.current[index - 1]?.focus();
        }
    };

    const handlePinPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newPin = [...pin];
            pastedData.split('').forEach((digit, index) => {
                if (index < 6) {
                    newPin[index] = digit;
                }
            });
            setPin(newPin);
            // Focus the next empty input or the last one
            const nextEmptyIndex = newPin.findIndex(val => !val);
            const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
            pinInputRefs.current[focusIndex]?.focus();
        }
    };

    const handlePinSubmit = () => {
        const pinString = pin.join('');
        
        if (pinString.length !== 6) {
            alert('Please enter a complete 6-digit PIN');
            return;
        }

        // Close modal and submit the form
        setShowPinModal(false);
        // Trigger form submission
        const form = document.querySelector('form');
        if (form) {
            form.requestSubmit();
        }
    };


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
                        <button 
                            type="submit" 
                            className="w-full bg-blue-400 hover:bg-blue-500 text-white font-bold py-3 sm:py-4 px-4 rounded-lg transition duration-200 uppercase text-sm sm:text-base"
                        >
                            LOG IN
                        </button>
                    </form>
                </div>
            </div>

            {/* PIN Entry Modal */}
            {showPinModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 sm:p-8 relative">
                        <button
                            onClick={() => {
                                setShowPinModal(false);
                                setPin(['', '', '', '', '', '']);
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                        <div className="text-center">
                            <h3 className="text-xl sm:text-2xl font-bold text-blue-500 mb-6 sm:mb-8">
                                Please enter PIN
                            </h3>
                            <div className="flex justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                                {pin.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (pinInputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handlePinChange(index, e.target.value)}
                                        onKeyDown={(e) => handlePinKeyDown(index, e)}
                                        onPaste={handlePinPaste}
                                        className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50"
                                        autoComplete="off"
                                    />
                                ))}
                            </div>
                            <button
                                onClick={handlePinSubmit}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 uppercase text-sm sm:text-base"
                            >
                                Submit PIN
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Login