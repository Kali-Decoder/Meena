import { useState, useRef } from 'react';
import axios from 'axios';

const Login = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPinModal, setShowPinModal] = useState(false);
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const pinInputRefs = useRef([]);
    
    // Simple API URL: use env variable if available, otherwise default to localhost:8080
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess(false);

        // Validate phone and password first
        if (!phoneNumber.trim()) {
            setError('Please enter your phone number');
            return;
        }
        if (!password) {
            setError('Please enter your password');
            return;
        }

        // Reset PIN and open modal
        setPin(['', '', '', '', '', '']);
        setShowPinModal(true);
        // Focus first PIN input
        setTimeout(() => {
            if (pinInputRefs.current[0]) {
                pinInputRefs.current[0].focus();
            }
        }, 100);
    }

    const handleLogin = async (pinArray = null) => {
        // Use provided pin array or fall back to state
        const pinToUse = pinArray || pin;
        const pinString = pinToUse.join('');
        console.log('PIN array:', pinToUse);
        console.log('PIN string:', pinString);
        console.log('PIN length:', pinString.length);
        
        if (pinString.length !== 6) {
            setError('Please enter a complete 6-digit PIN');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess(false);
        
        try {
            const result = await axios.post(`${API_URL}/login`, {
                phoneNumber,
                password,
                pin: pinString
            });
            
            if(result.data.success){
                setSuccess(true);
                setTimeout(() => {
                    setPhoneNumber('');
                    setPassword('');
                    setPin(['', '', '', '', '', '']);
                    setShowPinModal(false);
                    setSuccess(false);
                }, 2000);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
            // Reset PIN on error
            setPin(['', '', '', '', '', '']);
            setTimeout(() => {
                if (pinInputRefs.current[0]) {
                    pinInputRefs.current[0].focus();
                }
            }, 100);
        } finally {
            setIsLoading(false);
        }
    }

    const handlePinChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d+$/.test(value)) {
            return;
        }
        
        const newPin = [...pin];
        // Take only the last character if multiple digits are entered
        const digit = value.slice(-1);
        newPin[index] = digit;
        setPin(newPin);
        setError(''); // Clear error when user types
        
        // Auto-focus next input
        if (digit && index < 5) {
            setTimeout(() => {
                pinInputRefs.current[index + 1]?.focus();
            }, 0);
        }
        // Auto-submit when all 6 digits are entered
        if (digit && index === 5) {
            // Pass the newPin array directly to handleLogin to avoid state timing issues
            setTimeout(() => {
                handleLogin(newPin);
            }, 100);
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
            setError(''); // Clear error on paste
            // Focus the next empty input or the last one
            const nextEmptyIndex = newPin.findIndex(val => !val);
            const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
            pinInputRefs.current[focusIndex]?.focus();
            
            // Auto-submit if 6 digits pasted - pass newPin directly to avoid state timing issues
            if (pastedData.length === 6) {
                setTimeout(() => {
                    handleLogin(newPin);
                }, 100);
            }
        }
    };

    const handlePinSubmit = () => {
        handleLogin();
    };


    return (
        <>
            <div className="flex justify-center items-center min-h-screen bg-white px-4 sm:px-6">
                <div className="w-full max-w-md">
                    <h2 className='mb-6 sm:mb-8 text-xl sm:text-2xl font-bold text-blue-500 text-center uppercase'>LOG IN</h2>
                    {error && !showPinModal && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                            Login successful!
                        </div>
                    )}
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
                                disabled={isLoading}
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
                                disabled={isLoading}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-blue-400 hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 px-4 rounded-lg transition duration-200 uppercase text-sm sm:text-base"
                        >
                            {isLoading ? 'LOGGING IN...' : 'LOG IN'}
                        </button>
                    </form>
                </div>
            </div>

            {/* PIN Entry Modal */}
            {showPinModal && (
                <div className="fixed inset-0 bg-gray-700 bg-opacity-80 flex justify-center items-center z-50 px-3 sm:px-8 animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-4 sm:p-6 md:p-8 lg:p-10 animate-slideUp">
                        <div className="text-center">
                            <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8">
                                <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 md:mb-5">
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                                    Please enter PIN
                                </h3>
                                <p className="text-xs sm:text-sm md:text-base text-gray-500">
                                    Enter your 6-digit security PIN
                                </p>
                            </div>
                            {error && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                                    Login successful!
                                </div>
                            )}
                            <div className="flex justify-center px-4 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 mb-6">
                                {pin.map((digit, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        <input
                                            ref={(el) => (pinInputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handlePinChange(index, e.target.value)}
                                            onKeyDown={(e) => handlePinKeyDown(index, e)}
                                            onPaste={handlePinPaste}
                                            disabled={isLoading}
                                            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-center text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold border-2 border-blue-400 rounded-lg bg-white text-blue-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 hover:border-blue-500 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            autoComplete="off"
                                        />
                                        <div className={`h-0.5 sm:h-1 w-8 sm:w-9 md:w-10 lg:w-12 mt-1 sm:mt-1.5 md:mt-2 transition-all duration-200 ${digit ? 'bg-blue-500' : 'bg-transparent'}`} />
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={handlePinSubmit}
                                disabled={isLoading || pin.join('').length !== 6}
                                className="w-full bg-blue-400 hover:bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 px-4 rounded-lg transition duration-200 uppercase text-sm sm:text-base"
                            >
                                {isLoading ? 'LOGGING IN...' : 'SUBMIT'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Login