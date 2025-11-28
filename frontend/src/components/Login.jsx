import { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        
        // Clear previous errors
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        
        axios.post( 'http://localhost:3001/login', {phoneNumber, password})
        .then(result => {
            if(result.data.success){
                alert(result.data.message || 'Login successful!');
                // Reset form
                setPhoneNumber('');
                setPassword('');
            } else {
                alert(result.data.message || 'Login failed. Please try again.');
            }
        })
        .catch(err => {
            if(err.response && err.response.data && err.response.data.message) {
                alert(err.response.data.message);
            } else {
                alert('Network error. Please check your connection and try again.');
            }
            console.error('Login error:', err);
        })
        .finally(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        });
    }


    return (
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
    )
}

export default Login