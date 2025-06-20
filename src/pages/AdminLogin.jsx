import React from 'react'
import { Transition } from '@headlessui/react'
import logo from '../assets/logos/usapp_logo_medium.png'
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'
import { FIREBASE_AUTH } from '../../firebaseConfig';

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { User } from 'lucide-react'
import SLPSignUp from './SLPSignUp'


const AdminLogin = () => {
    const auth = FIREBASE_AUTH;
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [showForgotPassword, setshowForgotPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [LoadingReset, setLoadingReset] = useState(false);
    const [ShowPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [UserType, setUserType] = useState('admin');
    const [showErrorMessage, setshowErrorMessage] = useState(false);
    const [ErrorText, setErrorText] = useState("");

    const navigate = useNavigate();

    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
    }

    const showError = (text) => {
        setErrorText(text);
        setshowErrorMessage(true);
    }


    const handlePasswordReset = async () => {
        if (Email.length < 5 || Password.length < 5) {
            showError("Email and password must be at least 5 characters long.");
            return;
        }
        setLoadingReset(true);
        await sendPasswordResetEmail(auth, Email)
            .then(() => {
                showError("Password reset email sent successfully.");
            })
            .catch((error) => {
                setLoadingReset(false);
                showError("Error sending forgot password email, Please make sure your email is correct");
            })
            .finally(() => {
                setLoadingReset(false);
                setshowForgotPassword(false);
            });
    }

    const handleLogin = async () => {
        if (UserType === 'admin') {
            if (Email.length < 5 || Password.length < 5) {
                showError("Email and password must be at least 5 characters long.");
                return;
            }
            setLoginLoading(true);
            try {
                const response = await axios.post('https://usapp-backend.vercel.app/api/admin/login', {
                    email: Email,
                    password: Password
                });
                if (response.data.success) {
                    sessionStorage.setItem('admintoken', response.data.uid);
                    showError("Login successful");
                    navigate('/admin/dashboard');
                } else {
                    showError("Login failed: " + response.data.message);
                }
            } catch (error) {
                setLoginLoading(false);
                const errorMsg = error instanceof Error ? error.message : "Failed to login.";
                showError(errorMsg);
            }
        }
        else if (UserType === 'slp') {
            try {
                setLoginLoading(true);
                const res = await signInWithEmailAndPassword(auth, Email, Password);
                if (res.user) {
                    const user = res.user;
                    // Get ID token result to check custom claims
                    const idTokenResult = await user.getIdTokenResult();
                    if (idTokenResult.claims && idTokenResult.claims.slp === true) {
                        sessionStorage.setItem('slpId', user.uid);
                        showError("Login successful");
                        navigate('/slp/dashboard');
                    } else {
                        setLoginLoading(false);
                        showError("You are not authorized as an SLP.");
                    }
                }
            } catch (error) {
                setLoginLoading(false);
                const errorMsg = error instanceof Error ? error.message : "Failed to login.";
                if (typeof error === 'object' && error !== null && 'code' in error) {
                    if (error.code === 'auth/user-not-found') {
                        showError("No user found with this email.");
                    } else if (error.code === 'auth/wrong-password') {
                        showError("Wrong Password.");
                    } else if (error.code === 'auth/invalid-email') {
                        showError("Invalid Email.");
                    } else {
                        showError(errorMsg);
                    }
                } else {
                    showError(errorMsg);
                }
            }
        }
        else {
            return;
        }
    }
    const toggleForgotPassword = () => {
        setshowForgotPassword((prev) => !prev);
    }
    return (
        <div className="flex flex-col justify-center usapp-bg min-h-svh max-w-[100svw] overflow-x-hidden items-center  p-4">
            <div className="h-[80%] max-h-[1000px] flex flex-col justify-center backdrop-blur-lg bg-white rounded-lg  w-11/12 max-w-96 lg:max-w-[900px] min-h-[400px] shadow-2xl items-center p-6">
                <img className=" m-0 w-3/12 mb-0 min-w-60" src={logo} alt="Logo" />
                <div className="relative w-full max-w-96 lg:max-w-[900px] border-2 rounded-lg border-dashed border-gray-400 min-h-[500px] overflow-y-auto overflow-x-hidden ">
                    {/* Login Form */}
                    <div
                        className={`absolute inset-0 transition-transform duration-500 ${isLogin ? 'translate-x-0' : '-translate-x-full'
                            }`}
                    >
                        <div className="w-full h-full flex flex-col justify-start gap-0 items-center p-6">
                            <h2 className="text-4xl font-bold mb-4">Login</h2>
                            <div className="w-full mb-4">
                                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    className="w-full p-2 border rounded"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={Email}
                                    aria-describedby="email-validation"
                                />
                                {Email.length > 0 && Email.length < 5 && (
                                    <p id="email-validation" className="text-xs text-red-500 mt-1">Email must be at least 5 characters long.</p>
                                )}
                            </div>
                            <div className="w-full mb-4">
                                <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                                <input
                                    id="password"
                                    type={(ShowPassword ? "text" : "password")}
                                    placeholder="Password"
                                    className="w-full p-2 border rounded"
                                    value={Password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    aria-describedby="password-validation"
                                />
                                {Password.length > 0 && Password.length < 5 && (
                                    <p id="password-validation" className="text-xs text-red-500 mt-1">Password must be at least 5 characters long.</p>
                                )}
                            </div>
                            <div className="w-full justify-end flex items-center">
                                <input
                                    id="show-password"
                                    type="checkbox"
                                    className="mr-2"
                                    checked={ShowPassword}
                                    onChange={e => setShowPassword(e.target.checked)}
                                />
                                <label htmlFor="show-password" className="text-sm select-none">Show Password</label>
                            </div>
                            <div className="w-full mb-4">
                                <label htmlFor="user-type" className="block text-sm font-medium mb-1">User Type</label>
                                <select
                                    id="user-type"
                                    className="w-full p-2 border rounded"
                                    defaultValue="admin"
                                    onChange={(e) => setUserType(e.target.value)}
                                    value={UserType}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="slp">Speech Language Pathologist</option>
                                </select>
                            </div>
                            <button className="w-full bg-blue-900 border-black border-2 border-r-4 border-b-4 hover:bg-blue-700 delay-150 duration-300 text-white py-2 rounded"
                                onClick={() => { handleLogin() }}>
                                Login
                            </button>
                            {UserType === 'slp' && (
                                <div className='w-full flex justify-between items-center mt-4 px-2'>
                                    <p className="mt-4 text-sm">
                                        <button
                                            onClick={toggleForgotPassword}
                                            className="text-blue-500 underline"
                                        >
                                            Forgot Password?
                                        </button>
                                    </p>
                                    <p>
                                        Don't have an account? <span className="text-blue-500 cursor-pointer" onClick={() => setIsLogin(false)}>Sign Up</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div
                        className={`absolute inset-0 transition-transform duration-500 ${isLogin ? 'translate-x-full' : 'translate-x-0'
                            }`}
                    >
                        {/* Sign Up Form */}
                        <SLPSignUp isLogin={isLogin} setIsLogin={setIsLogin} />
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
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                <div className="bg-white px-8 py-6 rounded-lg flex flex-col items-center shadow-lg">
                                    <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                    </svg>
                                    <span className="text-lg font-semibold text-gray-700">Logging In...</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="w-full mb-4">
                                    <label htmlFor="reset-email" className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        id="reset-email"
                                        type="email"
                                        placeholder="Enter your Email"
                                        value={Email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full p-2 border rounded"
                                        aria-describedby="reset-email-validation"
                                    />
                                    {Email.length > 0 && Email.length < 5 && (
                                        <p id="reset-email-validation" className="text-xs text-red-500 mt-1">Email must be at least 5 characters long.</p>
                                    )}
                                </div>
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
                    <div className="p-6 flex flex-col justify-center items-center backdrop-blur-md backdrop-brightness-50 w-80">
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="bg-white px-8 py-6 rounded-lg flex flex-col items-center shadow-lg">
                                <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                <span className="text-lg font-semibold text-gray-700">Logging In...</span>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold mb-4">Logging in user</h2>
                    </div>
                </div>
            </Transition>
            <Transition
                show={showErrorMessage && !!ErrorText}
                enter="transition-opacity duration-500"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-500"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md backdrop-brightness-50 animate-fade-in z-50">
                    <div className="bg-white p-6 rounded-lg flex flex-col justify-center items-center shadow-lg w-80">
                        <h2 className="text-xl font-bold mb-4 text-[#feaf61]">Alert</h2>
                        <p className="mb-6 text-center text-gray-700">{ErrorText}</p>
                        <button
                            onClick={() => {
                                setshowErrorMessage(false);
                                setErrorText('');
                            }}
                            className="w-full bg-[#5c7c93] text-white py-2 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Transition>

        </div>
    )
}

export default AdminLogin