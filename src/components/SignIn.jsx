import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH } from '../../firebaseConfig';
import { Transition } from '@headlessui/react';

function SignupForm(props) {

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

    const SignupUser = async () => {
        if (!validateInputs()) {
            return;
        }
        if (password !== confirmPassword) {
            window.alert("Passwords do not match");
            return;
        }
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

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

            await axios.post('https://usapp-backend.vercel.app/api/users/create', userData);

            window.alert("User created successfully!");
            router.navigate("/UserEntry/Login");
        } catch (error) {
            console.error(error);
            window.alert("Error creating user: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setIsLoading(false);
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
                        <select
                            className="w-full mb-4 p-2 border rounded"
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                        >

                            {userTypeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="Age"
                            className="w-full mb-4 p-2 border rounded"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                        />
                        {userType === 'Guardian' && (
                            <>
                                <input
                                    type="text"
                                    placeholder="End-User's Name"
                                    className="w-full mb-4 p-2 border rounded"
                                    value={endName}
                                    onChange={(e) => setEndName(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="End-User's Age"
                                    className="w-full mb-4 p-2 border rounded"
                                    value={endAge}
                                    onChange={(e) => setEndAge(e.target.value)}
                                />
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
                        >
                            Next
                        </button>
                    </>
                );

            case 2:
                return (
                    <>
                        <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
                        <input
                            type="text"
                            placeholder="First Name"
                            className="w-full mb-4 p-2 border rounded"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            className="w-full mb-4 p-2 border rounded"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full mb-4 p-2 border rounded"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <div className="flex justify-between gap-2">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="w-full bg-gray-300 hover:bg-gray-400 transition duration-300 text-black py-2 rounded"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setCurrentStep(3)}
                                className="w-full bg-blue-900 border-black border-2 border-r-4 border-b-4 hover:bg-blue-700 transition duration-300 text-white py-2 rounded"
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
                        <div className="flex items-center justify-between text-sm mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    checked={isConditionsRead}
                                    onChange={() => setIsConditionsRead(!isConditionsRead)}
                                />
                                I agree to&nbsp;
                                <span
                                    onClick={() => setShowTerms(true)}
                                    className="text-blue-500 underline cursor-pointer"
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
