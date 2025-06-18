import React from 'react'
import { Transition } from '@headlessui/react'
import logo from '../assets/logos/usapp_logo_medium.png'
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


const AdminLogin = () => {
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [showForgotPassword, setshowForgotPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [LoadingReset, setLoadingReset] = useState(false);
    const [ShowPassword, setShowPassword] = useState(false);
    const [UserType, setUserType] = useState('admin');
    const navigate = useNavigate();

    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
    }




    const handlePasswordReset = async () => {
        if (Email.length < 5 || Password.length < 5) {
            window.alert("Email and password must be at least 5 characters long.");
            return;
        }
        setLoadingReset(true);
        await sendPasswordResetEmail(auth, Email)
            .then(() => {
                window.alert("Success", "Password reset email sent successfully.");
            })
            .catch((error) => {
                setLoadingReset(false);
                const errorMsg = error instanceof Error ? error.message : "Failed to send password reset email.";
                window.alert("Error sending forgot password email, Please make sure your email is correct");
            })
            .finally(() => {
                setLoadingReset(false);
                setshowForgotPassword(false);
            });
    }

    const handleLogin = async () => {
        if (UserType === 'admin') {
            if (Email.length < 5 || Password.length < 5) {
                window.alert("Email and password must be at least 5 characters long.");
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
                    window.alert("Login successful");
                    navigate('/admin/dashboard');
                } else {
                    window.alert("Login failed: " + response.data.message);
                }


            } catch (error) {
                setLoginLoading(false);
                const errorMsg = error instanceof Error ? error.message : "Failed to login.";
                window.alert(errorMsg);
            }
        }
        else if (UserType == 'slp') {

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
                    <div className="w-full h-full flex flex-col justify-start gap-5 items-center p-6">
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
                        <p className="mt-4 text-sm">
                            <button
                                onClick={toggleForgotPassword}
                                className="text-blue-500 underline"
                            >
                                Forgot Password?
                            </button>
                        </p>
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
        </div>
    )
}

export default AdminLogin