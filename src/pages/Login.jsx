import React, { useState } from 'react';
import logo from '../assets/logos/usapp_logo_medium.png';
import header from '../assets/backgrounds/header_background_img.png'
import { Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { FourSquare } from 'react-loading-indicators';

const Login = () => {
    const auth = FIREBASE_AUTH;
    const [isLogin, setIsLogin] = useState(true);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setloginLoading] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState();
    const [LoadingReset, setLoadingReset] = useState(false);
    const navigate = useNavigate();

    const toggleView = () => {
        setIsLogin(!isLogin);
    };

    const toggleForgotPassword = () => {
        setShowForgotPassword(!showForgotPassword);
    };

    const handleLogin = async () => {
        if (email.length < 5 || password.length < 5) {
            window.alert("Email and password must be at least 5 characters long.");
            return;
        }

        setloginLoading(true);
        setErrorMessage('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;
            navigate('/dashboard');
        } catch (error) {
            setloginLoading(false);
            const errorMsg = error instanceof Error ? error.message : "Invalid credentials.";
            setErrorMessage(errorMsg);
            window.alert(errorMsg);
        } finally {
            setloginLoading(false);
        }
    };
    const handlePasswordReset = async () => {
        if (email.length < 5 || password.length < 5) {
            window.alert("Email and password must be at least 5 characters long.");
            return;
        }
        setLoadingReset(true);
        await sendPasswordResetEmail(auth, email)
            .then(() => {
                window.alert("Success", "Password reset email sent successfully.");
            })
            .catch((error) => {
                setLoadingReset(false);
                const errorMsg = error instanceof Error ? error.message : "Failed to send password reset email.";
                window.alert("Error", errorMsg);
            })
            .finally(() => {
                setLoadingReset(false);
                setShowForgotPassword(false);
            });
    }

    return (
        <>
            <div className="flex flex-col justify-start min-h-svh h-full items-center bg-[#fff6eb] p-4">
                <img className="absolute top-0 w-full object-top object-fill h-20" src={header} alt="Header Background" />

                <img className="mt-20 w-3/12 mb-4 min-w-60" src={logo} alt="Logo" />
                <div className="flex flex-col lg:flex-row justify-center items-center w-full gap-5 lg:gap-0 ">
                    <div className="flex-4 flex flex-row justify-center items-center w-full h-full p-6 border-dashed border-b-2 lg:border-b-0 border-r-0  lg:border-r-2 border-gray-700">
                        <div className="relative w-11/12 max-w-96 lg:max-w-full h-96 overflow-hidden bg-white rounded-lg shadow-lg ">
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
                                        onChange={(e) => setEmail(e.target.value)}
                                        value={email}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        className="w-full mb-4 p-2 border rounded"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button className="w-full bg-blue-900 border-black border-2 border-r-4 border-b-4 hover:bg-blue-700 delay-150 duration-300 text-white py-2 rounded"
                                        onClick={() => { handleLogin() }}>
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
                                    <button className="w-full bg-[#fe8917] text-white usapp-border py-2 rounded">
                                        Sign Up
                                    </button>
                                    <p className="mt-4 text-sm ">
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

                    <div className="flex-3 flex flex-col justify-center items-center">
                        {/* Enter as Guest Section */}
                        <div className="w-11/12 max-w-96 h-96 bg-white p-6 rounded-lg shadow-lg text-center">
                            <h2 className="text-2xl font-bold mb-4">Enter as Guest</h2>
                            <p className="mb-4 text-gray-600">
                                Ipahayag ang sarili gamit ang UsApp, isang Filipino Communication Board App. Katulong mo sa bawat salita
                            </p>
                            <button
                                onClick={() => navigate('/guestboard')}
                                className="w-full usapp-border bg-[#17616e] hover:bg-[#7697a0] text-white py-2 rounded transition duration-300"
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
                        <div className="bg-white p-6 rounded-lg flex flex-col justify-center items-center shadow-lg w-80">
                            <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
                            {LoadingReset ? (
                                <FourSquare color="#3d6887" size="medium" text="" textColor="" />
                            ) : (
                                <>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full mb-4 p-2 border rounded"
                                    />
                                    <button
                                        onClick={handlePasswordReset}
                                        className="w-full bg-blue-500 text-white py-2 rounded usapp-border mb-2"
                                    >
                                        Send Reset Password Link
                                    </button>
                                </>
                            )}
                            <button
                                onClick={toggleForgotPassword}
                                className="w-full bg-gray-300 text-black py-2 usapp-border rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Transition>
                <Transition
                    show={loginLoading}
                    enter="transition-opacity duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md backdrop-brightness-50 animate-fade-in">
                        <div className="bg-white p-6 flex flex-col justify-center items-center rounded-lg shadow-lg w-80">
                            <FourSquare color="#3d6887" size="medium" text="" textColor="" />
                            <h2 className="text-xl font-bold mb-4">Logging in user</h2>
                        </div>
                    </div>
                </Transition>
            </div>
        </>
    );
};

export default Login;
