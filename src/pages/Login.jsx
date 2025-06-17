import React, { useState } from 'react';
import logo from '../assets/logos/usapp_logo_medium.png';
import header from '../assets/backgrounds/header_background_img.png'
import { Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import SignIn from '../components/SignIn';

const Login = () => {
    const auth = FIREBASE_AUTH;
    const [isLogin, setIsLogin] = useState(true);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setloginLoading] = useState(false);
    const [ErrorMessage, setErrorMessage] = useState();
    const [LoadingReset, setLoadingReset] = useState(false);
    const [showTerms, setshowTerms] = useState(false);
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
            sessionStorage.setItem('userId', uid);
            navigate('/dashboard');
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Login failed.";
            if (typeof error === 'object' && error !== null && 'code' in error) {
                if (error.code === 'auth/user-not-found') {
                    window.alert("No user found with this email.");
                } else if (error.code === 'auth/wrong-password') {
                    window.alert("Wrong Password.");
                } else if (error.code === 'auth/invalid-email') {
                    window.alert("Invalid Email.");
                } else {
                    window.alert(errorMsg);
                }
            } else {
                window.alert("Login Error", errorMsg);
            }
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
                window.alert("Error sending forgot password email, Please make sure your email is correct");
            })
            .finally(() => {
                setLoadingReset(false);
                setShowForgotPassword(false);
            });
    }

    const handleSLPLogin = () => {

    }

    return (
        <>
            <div className="flex flex-col justify-center bg-[url('./assets/backgrounds/bg-revision.png')] min-h-svh max-w-[100svw] overflow-x-hidden items-center  p-4">



                <div className="h-[80%] max-h-[1000px] flex flex-col justify-center backdrop-blur-lg bg-white rounded-lg  w-11/12 max-w-96 lg:max-w-[900px] min-h-[400px] shadow-2xl items-center p-6">
                    <img className=" m-0 w-3/12 mb-0 min-w-60" src={logo} alt="Logo" />
                    <div className="relative w-full max-w-96 lg:max-w-[900px] border-2 rounded-lg border-dashed border-gray-400 min-h-[500px] overflow-y-auto overflow-x-hidden ">

                        <div
                            className={`absolute inset-0 transition-transform duration-500 ${isLogin ? 'translate-x-0' : '-translate-x-full'
                                }`}
                        >
                            {/* Login Form */}
                            <div className="w-full h-full flex flex-col justify-start gap-5 items-center p-6">
                                <h2 className="text-4xl font-bold mb-4">Login</h2>
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
                            <SignIn toggleView={toggleView} showTerms={showTerms} setShowTerms={setshowTerms} />
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
                    show={showTerms}
                    enter="transition-opacity duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md backdrop-brightness-50 animate-fade-in">
                        <div className="bg-white p-6 pt-20  overflow-y-auto max-h-[90svh] flex flex-col justify-center items-center shadow-lg w-80">
                            <p className='mt-10'>
                                Welcome to USAPP! Please read these Terms and Conditions carefully before using our app. By signing up, you agree to abide by all rules and policies.
                                <br /><br />
                                1. You must provide accurate information.
                                <br />
                                2. Guardians must be 18+ years old.
                                <br />
                                3. Respect privacy and community guidelines.
                                <br />
                                4. Your data is protected as per our privacy policy and the Philippine Data Privacy Act of 2012 (Republic Act No. 10173).
                                <br /><br />
                                By using this app and creating an account, you consent to the collection, use, and processing of your personal data in accordance with the Philippine Data Privacy Act. We are committed to safeguarding your information and ensuring your privacy rights.
                                <br /><br />
                                For full details, visit our website or contact support.
                            </p>
                            <button
                                onClick={showTerms ? () => { setshowTerms(false) } : () => { setshowTerms(true) }}
                                className="w-full bg-gray-300 mt-5 text-black py-2 usapp-border rounded"
                            >
                                Back to Signup
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
        </>
    );
};

export default Login;
