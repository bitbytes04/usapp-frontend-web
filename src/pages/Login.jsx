import React, { useState } from 'react';
import logo from '../assets/logos/usapp_logo_medium.png';
import header from '../assets/backgrounds/header_background_img.png'
import { Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const toggleView = () => {
        setIsLogin(!isLogin);
    };

    const toggleForgotPassword = () => {
        setShowForgotPassword(!showForgotPassword);
    };

    const handleForgotPasswordSubmit = () => {
        // Handle forgot password logic here
        console.log('Forgot password email:', email);
        setShowForgotPassword(false);
    };

    return (
        <>
            <div className="flex flex-col justify-start min-h-svh h-full items-center bg-[#fff6eb] p-4">
                <img className="absolute top-0 w-full object-top object-fill h-20" src={header} alt="Header Background" />

                <img className="mt-20 w-3/12 mb-4 min-w-60" src={logo} alt="Logo" />
                <div className="flex flex-col lg:flex-row justify-center items-center w-full gap-5 lg:gap-0 ">
                    <div className="flex-1 flex flex-row justify-center items-center w-full h-full p-6 border-dashed border-b-2 lg:border-b-0 border-r-0  lg:border-r-2 border-gray-700">
                        <div className="relative flex-1 w-11/12 max-w-96 h-96 overflow-hidden bg-white rounded-lg shadow-lg ">
                            <div
                                className={`absolute inset-0 transition-transform duration-500 ${isLogin ? 'translate-x-0' : '-translate-x-full'
                                    }`}
                            >
                                {/* Login Form */}
                                <div className="w-full h-full flex flex-col justify-center items-center p-6">
                                    <h2 className="text-2xl font-bold mb-4">Login</h2>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="w-full mb-4 p-2 border rounded"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="w-full mb-4 p-2 border rounded"
                                    />
                                    <button className="w-full bg-blue-900 hover:bg-blue-700 delay-150 duration-300 text-white py-2 rounded"
                                        onClick={() => { navigate('/dashboard') }}>
                                        Login
                                    </button>
                                    <p className="mt-4 text-sm">
                                        <button
                                            onClick={toggleForgotPassword}
                                            className="text-blue-500 underline"
                                        >
                                            Forgot Password?
                                        </button>
                                    </p>
                                    <p className="mt-4 text-sm">
                                        Don't have an account?{' '}
                                        <button
                                            onClick={toggleView}
                                            className="text-blue-500 underline"
                                        >
                                            Sign Up
                                        </button>
                                    </p>
                                </div>
                            </div>
                            <div
                                className={`absolute inset-0 transition-transform duration-500 ${isLogin ? 'translate-x-full' : 'translate-x-0'
                                    }`}
                            >
                                {/* Sign Up Form */}
                                <div className="w-full h-full flex flex-col justify-center items-center p-6">
                                    <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        className="w-full mb-4 p-2 border rounded"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="w-full mb-4 p-2 border rounded"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="w-full mb-4 p-2 border rounded"
                                    />
                                    <button className="w-full bg-[#fe8917] text-white py-2 rounded">
                                        Sign Up
                                    </button>
                                    <p className="mt-4 text-sm">
                                        Already have an account?{' '}
                                        <button
                                            onClick={toggleView}
                                            className="text-green-500 underline"
                                        >
                                            Login
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center">
                        {/* Enter as Guest Section */}
                        <div className="w-11/12 max-w-96 h-96 bg-white p-6 rounded-lg shadow-lg text-center">
                            <h2 className="text-2xl font-bold mb-4">Enter as Guest</h2>
                            <p className="mb-4 text-gray-600">
                                Ipahayag ang sarili gamit ang UsApp, isang Filipino Communication Board App. Katulong mo sa bawat salita
                            </p>
                            <button
                                onClick={() => navigate('/guestboard')}
                                className="w-full bg-green-500 hover:bg-green-700 text-white py-2 rounded transition duration-300"
                            >
                                Continue as Guest
                            </button>
                        </div>
                    </div>
                </div>

                <Transition
                    show={showForgotPassword}
                    enter="transition-opacity duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md backdrop-brightness-50 animate-fade-in">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                            <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mb-4 p-2 border rounded"
                            />
                            <button
                                onClick={handleForgotPasswordSubmit}
                                className="w-full bg-blue-500 text-white py-2 rounded mb-2"
                            >
                                Send Reset Password Link
                            </button>
                            <button
                                onClick={toggleForgotPassword}
                                className="w-full bg-gray-300 text-black py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </>
    );
};

export default Login;
