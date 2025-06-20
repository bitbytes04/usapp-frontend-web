import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, getIdToken } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { Transition } from '@headlessui/react';
import axios from 'axios';

function SignupForm(props) {

    const navigate = useNavigate();
    const auth = FIREBASE_AUTH;
    const [currentStep, setCurrentStep] = useState(1);
    const [userType, setUserType] = useState('');
    const [age, setAge] = useState('');
    const [endName, setEndName] = useState('');
    const [endAge, setEndAge] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isConditionsRead, setIsConditionsRead] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { showTerms, setShowTerms } = props
    const [isLoading, setIsLoading] = useState(false);
    const toggleView = props.toggleView;
    const [showVerificationScreen, setshowVerificationScreen] = useState(false);
    const [currentUser, setcurrentUser] = useState();
    const userTypeOptions = [
        { label: 'Guardian', value: 'Guardian' },
        { label: 'End-User', value: 'End-User' },
    ];

    const validateInputs = () => {
        if (firstName.length < 5 || lastName.length < 5 || username.length < 5 || email.length < 5) {
            window.alert("Please complete all information properly.");
            return false;
        }
        if (userType === 'Guardian' && (endName.length < 5 || endAge.length === 0)) {
            window.alert("Guardian must provide End-User's name and age.");
            return false;
        }
        if (parseInt(age) < 18) {
            window.alert("Guardian must be an adult (18+ years old).");
            return false;
        }
        if (!isConditionsRead) {
            window.alert("Please read and agree to the terms and conditions")
        }
        return true;
    };

    const deleteUserFromFirebase = async () => {
        if (currentUser) {
            try {
                await currentUser.user.delete();
                window.alert('Account Verification Cancelled')
            } catch (err) {
                console.error("Error deleting user:", err);
            }
        }
    };

    const SignupUser = async () => {
        if (!validateInputs()) {
            return;
        }
        if (password !== confirmPassword) {
            window.alert("Passwords do not match");
            return;
        }


        setshowVerificationScreen(true);

        // Send email verification before proceeding
        try {
            const tempUserCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(tempUserCredential.user)

            setcurrentUser(tempUserCredential)

            const checkEmailVerified = setInterval(async () => {

                if (tempUserCredential.user.emailVerified) {
                    clearInterval(checkEmailVerified);
                    setshowVerificationScreen(false);
                    setIsLoading(true);
                    const uid = tempUserCredential.user.uid;
                    const userData = {
                        uid,
                        firstName,
                        lastName,
                        username,
                        email,
                        userType,
                        age,
                        ...(userType === 'Guardian' && { endName, endAge }),
                    };
                    try {
                        await axios.post('https://usapp-backend.vercel.app/api/users/create', userData);
                        window.alert("User created successfully!");
                        navigate("/UserEntry/Login");
                    } catch (err) {
                        window.alert("Error creating user: " + (err instanceof Error ? err.message : "Unknown error"));
                    } finally {
                        setIsLoading(false);
                    }
                }
            }, 3000);

        } catch (error) {
            console.error(error);
            window.alert("Error sending verification email: " + (error instanceof Error ? error.message : "Unknown error"));
            setIsLoading(false);
            return;
        }
        finally {
            setIsLoading(false)
        }



    };
    const renderStep = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-40">
                    <p className="text-lg">Creating your account...</p>
                </div>
            );
        }

        switch (currentStep) {
            case 1:
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-4">User Type Information</h2>
                        <label className="block mb-1 font-medium">
                            User Type <span className="text-red-600">*</span>
                        </label>
                        <select
                            className="w-full mb-4 p-2 border rounded"
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                        >
                            <option value="" disabled>Select user type</option>
                            {userTypeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {userType === "" && (
                            <p className="text-red-600 text-xs mb-2">User type is required.</p>
                        )}

                        <label className="block mb-1 font-medium">
                            Age <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="number"
                            placeholder="Age"
                            className="w-full mb-1 p-2 border rounded"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            min={0}
                        />
                        {age !== "" && (isNaN(Number(age)) || Number(age) < 0) && (
                            <p className="text-red-600 text-xs mb-2">Please enter a valid age.</p>
                        )}
                        {age !== "" && Number(age) < 13 && (
                            <p className="text-red-600 text-xs mb-2">You must be at least 13 years old to sign up.</p>
                        )}
                        {userType === "Guardian" && age !== "" && Number(age) < 18 && (
                            <p className="text-red-600 text-xs mb-2">Guardian must be at least 18 years old.</p>
                        )}
                        {userType === 'Guardian' && (
                            <>
                                <label className="block mb-1 font-medium">
                                    End-User's Name <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="End-User's Name"
                                    className="w-full mb-1 p-2 border rounded"
                                    value={endName}
                                    onChange={(e) => setEndName(e.target.value)}
                                />
                                {endName !== "" && endName.length < 5 && (
                                    <p className="text-red-600 text-xs mb-2">Name must be at least 5 characters.</p>
                                )}
                                <label className="block mb-1 font-medium">
                                    End-User's Age <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="number"
                                    placeholder="End-User's Age"
                                    className="w-full mb-1 p-2 border rounded"
                                    value={endAge}
                                    onChange={(e) => setEndAge(e.target.value)}
                                    min={0}
                                />
                                {endAge !== "" && (isNaN(Number(endAge)) || Number(endAge) < 0) && (
                                    <p className="text-red-600 text-xs mb-2">Please enter a valid age.</p>
                                )}
                                {endAge !== "" && Number(endAge) < 13 && (
                                    <p className="text-red-600 text-xs mb-2">End-User must be at least 13 years old.</p>
                                )}
                            </>
                        )}
                        <p className="mt-4 text-sm">
                            Already have an account?{' '}
                            <button
                                onClick={toggleView}
                                className="text-blue-500 underline mb-5"
                            >
                                Log In!
                            </button>
                        </p>
                        <button
                            onClick={() => setCurrentStep(2)}
                            className="w-full bg-blue-900 border-black border-2 border-r-4 border-b-4 hover:bg-blue-700 transition duration-300 text-white py-2 rounded"
                            disabled={
                                !userType ||
                                !age ||
                                isNaN(Number(age)) ||
                                Number(age) < 13 ||
                                (userType === "Guardian" && (endName.length < 5 || !endAge || isNaN(Number(endAge)) || Number(endAge) < 13))
                            }
                        >
                            Next
                        </button>
                    </>
                );

            case 2:
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
                        <label className="block mb-1 font-medium">
                            First Name <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="First Name"
                            className="w-full mb-1 p-2 border rounded"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                        {firstName !== "" && firstName.length < 5 && (
                            <p className="text-red-600 text-xs mb-2">First name must be at least 5 characters.</p>
                        )}

                        <label className="block mb-1 font-medium">
                            Last Name <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Last Name"
                            className="w-full mb-1 p-2 border rounded"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                        {lastName !== "" && lastName.length < 5 && (
                            <p className="text-red-600 text-xs mb-2">Last name must be at least 5 characters.</p>
                        )}

                        <label className="block mb-1 font-medium">
                            Username <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full mb-1 p-2 border rounded"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        {username !== "" && username.length < 5 && (
                            <p className="text-red-600 text-xs mb-2">Username must be at least 5 characters.</p>
                        )}

                        <div className="flex justify-between gap-2 mt-4">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="w-full bg-gray-300 hover:bg-gray-400 transition duration-300 text-black py-2 rounded"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setCurrentStep(3)}
                                className="w-full bg-blue-900 border-black border-2 border-r-4 border-b-4 hover:bg-blue-700 transition duration-300 text-white py-2 rounded"
                                disabled={
                                    firstName.length < 5 ||
                                    lastName.length < 5 ||
                                    username.length < 5
                                }
                            >
                                Next
                            </button>
                        </div>
                    </>
                );

            case 3:
                return (
                    <>

                        <h2 className="text-2xl font-bold mb-4">Account Credentials</h2>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full mb-4 p-2 border rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            className="w-full mb-4 p-2 border rounded"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm Password"
                            className="w-full mb-4 p-2 border rounded"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        {password.length > 0 && (
                            <p className={`
                                w-4/5 self-center mb-2 text-[13px] font-bold
                                ${password.length < 8 ||
                                    !/[A-Z]/.test(password) ||
                                    !/[a-z]/.test(password) ||
                                    !/[0-9]/.test(password) ||
                                    !/[^A-Za-z0-9]/.test(password)
                                    ? 'text-red-600'
                                    : 'text-green-600'}
                            `}>
                                {password.length < 8
                                    ? 'Password must be at least 8 characters. '
                                    : ''}
                                {!/[A-Z]/.test(password)
                                    ? 'Include an uppercase letter. '
                                    : ''}
                                {!/[a-z]/.test(password)
                                    ? 'Include a lowercase letter. '
                                    : ''}
                                {!/[0-9]/.test(password)
                                    ? 'Include a number. '
                                    : ''}
                                {!/[^A-Za-z0-9]/.test(password)
                                    ? 'Include a special character. '
                                    : ''}
                                {password.length >= 8 &&
                                    /[A-Z]/.test(password) &&
                                    /[a-z]/.test(password) &&
                                    /[0-9]/.test(password) &&
                                    /[^A-Za-z0-9]/.test(password)
                                    ? 'Strong password!'
                                    : ''}
                            </p>
                        )}
                        <div className="flex items-center justify-between text-sm mb-4">
                            <label className="flex flex-col md:flex-row text-center justify-center items-center">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    checked={isConditionsRead}
                                    onChange={() => setIsConditionsRead(!isConditionsRead)}
                                />
                                I agree to&nbsp;
                                <span

                                    onClick={() => setShowTerms(true)}
                                    className="text-blue-500 text-center underline cursor-pointer"
                                >
                                    Terms and Conditions
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    checked={showPassword}
                                    onChange={() => setShowPassword(!showPassword)}
                                />
                                Show Password
                            </label>
                        </div>
                        <div className="flex justify-between gap-2">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="w-full bg-gray-300 hover:bg-gray-400 transition duration-300 text-black py-2 rounded"
                            >
                                Back
                            </button>
                            <button
                                onClick={SignupUser}
                                className="w-full bg-green-700 border-black border-2 border-r-4 border-b-4 hover:bg-green-600 transition duration-300 text-white py-2 rounded"
                            >
                                Sign Up
                            </button>
                        </div>

                        <Transition
                            show={showVerificationScreen}
                            enter="transition-opacity duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md backdrop-brightness-50 animate-fade-in">
                                <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
                                    <h3 className="text-xl font-semibold mb-4">Verify Your Email</h3>
                                    <p className="mb-6">
                                        A verification link has been sent to <span className="font-medium">{email}</span>.<br />
                                        Please check your inbox
                                    </p>
                                    <div className="flex flex-col gap-3">

                                        <button
                                            className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
                                            onClick={async () => {
                                                if (currentUser && currentUser.user) {
                                                    try {
                                                        deleteUserFromFirebase();
                                                        setshowVerificationScreen(false);
                                                        setcurrentUser(undefined);

                                                    } catch (err) {
                                                        window.alert(err.message);
                                                    }
                                                    finally {
                                                        setshowVerificationScreen(false)
                                                    }
                                                } else {
                                                    setshowVerificationScreen(false);
                                                }
                                            }}
                                        >
                                            Cancel Verification
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Transition>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <>

            <div className='p-5 overflow-y-auto'>
                <h1 className="text-3xl font-bold mb-6 text-center">Signup</h1>
                {renderStep()}
            </div>
        </>


    );
}

export default SignupForm;
