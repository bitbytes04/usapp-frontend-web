import React from 'react'
import { useState } from 'react';
import axios from 'axios';
import { Transition } from '@headlessui/react';

const SLPSignUp = (props) => {
    const { isLogin, setIsLogin, setEmail, setPassword } = props;
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
        displayName: '',
        firstName: '',
        lastName: '',
        clinicName: '',
        age: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setshowSuccess] = useState(false);
    const [success, setSuccess] = useState('');

    // Pagination state
    const [page, setPage] = useState(0);

    // Validation state
    const [touched, setTouched] = useState({});
    const [validation, setValidation] = useState({});

    // Validation rules
    const validateField = (name, value) => {
        switch (name) {
            case 'email':
                if (!value) return 'Email is required';
                if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) return 'Invalid email';
                break;
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 6) return 'Password must be at least 6 characters';
                if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
                if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain at least one special character';
                break;
            case 'displayName':
                if (!value) return 'Display Name is required';
                break;
            case 'firstName':
                if (!value) return 'First Name is required';
                break;
            case 'lastName':
                if (!value) return 'Last Name is required';
                break;
            case 'clinicName':
                if (!value) return 'Clinic Name is required';
                break;
            case 'age':
                if (!value) return 'Age is required';
                if (isNaN(value) || value < 21) return 'Must be 21 or older';
                break;
            default:
                break;
        }
        return '';
    };

    // Validate all fields
    const validateAll = () => {
        const errors = {};
        Object.keys(form).forEach((key) => {
            const error = validateField(key, form[key]);
            if (error) errors[key] = error;
        });
        setValidation(errors);
        return errors;
    };

    // Handle change and validate
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        setTouched({ ...touched, [name]: true });
        setValidation({ ...validation, [name]: validateField(name, value) });
    };

    // On blur, mark as touched and validate
    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        setValidation({ ...validation, [name]: validateField(name, value) });
    };

    // On submit, validate all
    const handleValidatedSubmit = async (e) => {
        e.preventDefault();
        const errors = validateAll();
        if (Object.keys(errors).length > 0) return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const res = await axios.post('https://usapp-backend.vercel.app/api/admin/slp', form, {
                headers: { 'Content-Type': 'application/json' }
            });
            const data = res.data;
            if (data.success) {
                setSuccess('Account created successfully!');
                setshowSuccess(true);
                setForm({
                    email: '',
                    password: '',
                    displayName: '',
                    firstName: '',
                    lastName: '',
                    clinicName: '',
                    age: ''
                });
                setEmail('');
                setPassword('');
                setIsLogin(true)
                setForm({
                    email: '',
                    password: '',
                    displayName: '',
                    firstName: '',
                    lastName: '',
                    clinicName: '',
                    age: ''
                })
                setPage(0);
                setTouched({});
                setValidation({});
            } else {
                setError(data.message || 'Failed to create account');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Server error');
        }
        setLoading(false);
    };

    // Pagination logic
    const pages = [
        // Page 0: Email & Password
        (
            <>
                <div className="mb-2">
                    <label className="block mb-1 font-medium" htmlFor="email">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${touched.email && validation.email ? 'border-red-500' : 'border-gray-300'}`}
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                    />
                    {touched.email && validation.email && (
                        <p className="text-red-500 text-sm mt-1">{validation.email}</p>
                    )}
                </div>
                <div className="mb-2">
                    <label className="block mb-1 font-medium" htmlFor="password">
                        Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${touched.password && validation.password ? 'border-red-500' : 'border-gray-300'}`}
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                    />
                    {touched.password && validation.password && (
                        <p className="text-red-500 text-sm mt-1">{validation.password}</p>
                    )}
                </div>
                <div className="">
                    <label className="block mb-1 font-medium" htmlFor="confirmPassword">
                        Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${touched.confirmPassword && validation.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            id="confirmPassword"
                            placeholder="Confirm Password"
                            value={form.confirmPassword || ''}
                            onChange={e => {
                                setForm({ ...form, confirmPassword: e.target.value });
                                setTouched({ ...touched, confirmPassword: true });
                                setValidation({
                                    ...validation,
                                    confirmPassword:
                                        !e.target.value
                                            ? "Confirm Password is required"
                                            : e.target.value !== form.password
                                                ? "Passwords do not match"
                                                : ""
                                });
                            }}
                            onBlur={e => {
                                setTouched({ ...touched, confirmPassword: true });
                                setValidation({
                                    ...validation,
                                    confirmPassword:
                                        !e.target.value
                                            ? "Confirm Password is required"
                                            : e.target.value !== form.password
                                                ? "Passwords do not match"
                                                : ""
                                });
                            }}
                            required
                        />

                    </div>
                    {touched.confirmPassword && validation.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{validation.confirmPassword}</p>
                    )}
                </div>
                <div className=" self-end">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4  text-blue-600"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Show Password</span>
                    </label>
                </div>
                <div className="text-center mt-4">
                    <p>
                        Already have an account?{' '}
                        <button
                            type="button"
                            className="text-blue-600 underline hover:text-blue-800"
                            onClick={() => setIsLogin(true)}
                        >
                            Log in
                        </button>
                    </p>
                </div>
            </>
        ),
        // Page 1: Display Name, First Name, Last Name
        (
            <>
                <div className="mb-4">
                    <label className="block mb-1 font-medium" htmlFor="displayName">
                        Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${touched.displayName && validation.displayName ? 'border-red-500' : 'border-gray-300'}`}
                        type="text"
                        name="displayName"
                        id="displayName"
                        placeholder="Display Name"
                        value={form.displayName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                    />
                    {touched.displayName && validation.displayName && (
                        <p className="text-red-500 text-sm mt-1">{validation.displayName}</p>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block mb-1 font-medium" htmlFor="firstName">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${touched.firstName && validation.firstName ? 'border-red-500' : 'border-gray-300'}`}
                        type="text"
                        name="firstName"
                        id="firstName"
                        placeholder="First Name"
                        value={form.firstName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                    />
                    {touched.firstName && validation.firstName && (
                        <p className="text-red-500 text-sm mt-1">{validation.firstName}</p>
                    )}
                </div>
                <div className="mb-4">
                    <label className="block mb-1 font-medium" htmlFor="lastName">
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${touched.lastName && validation.lastName ? 'border-red-500' : 'border-gray-300'}`}
                        type="text"
                        name="lastName"
                        id="lastName"
                        placeholder="Last Name"
                        value={form.lastName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                    />
                    {touched.lastName && validation.lastName && (
                        <p className="text-red-500 text-sm mt-1">{validation.lastName}</p>
                    )}
                </div>
            </>
        ),
        // Page 2: Clinic Name & Age
        (
            <>
                <div className="mb-4">
                    <label className="block mb-1 font-medium" htmlFor="clinicName">
                        Clinic Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${touched.clinicName && validation.clinicName ? 'border-red-500' : 'border-gray-300'}`}
                        type="text"
                        name="clinicName"
                        id="clinicName"
                        placeholder="Clinic Name"
                        value={form.clinicName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                    />
                    {touched.clinicName && validation.clinicName && (
                        <p className="text-red-500 text-sm mt-1">{validation.clinicName}</p>
                    )}
                </div>
                <div className="mb-6">
                    <label className="block mb-1 font-medium" htmlFor="age">
                        Age <span className="text-red-500">*</span>
                    </label>
                    <input
                        className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${touched.age && validation.age ? 'border-red-500' : 'border-gray-300'}`}
                        type="number"
                        name="age"
                        id="age"
                        placeholder="Age"
                        value={form.age}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                        min={18}
                    />
                    {touched.age && validation.age && (
                        <p className="text-red-500 text-sm mt-1">{validation.age}</p>
                    )}
                </div>
                <Transition
                    show={showSuccess}
                    enter="transition-opacity duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md backdrop-brightness-50 animate-fade-in z-50">
                        <div className="bg-white p-6 rounded-lg flex flex-col justify-center items-center shadow-lg w-80">
                            <h2 className="text-xl font-bold mb-4 text-[#feaf61]">ACCOUNT CREATED</h2>
                            <p className="mb-6 text-center text-gray-700">{success}</p>
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
                <Transition
                    show={loading}
                    enter="transition-opacity duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 bg-opacity-30">
                        <div className="bg-white rounded-xl p-8 flex flex-col items-center shadow-2xl">
                            <svg className="animate-spin h-10 w-10 text-blue-700 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            <span className="text-lg font-medium text-blue-700">Creating Account...</span>
                        </div>
                    </div>
                </Transition>
            </>
        )
    ];

    // Next/Prev button logic
    const canGoNext = () => {
        // Validate current page fields
        let fields = [];
        if (page === 0) fields = ['email', 'password'];
        if (page === 1) fields = ['displayName', 'firstName', 'lastName'];
        if (page === 2) fields = ['clinicName', 'age'];
        return fields.every(
            (field) => !validateField(field, form[field])
        );
    };

    const handleNext = (e) => {
        e.preventDefault();
        // Mark all fields on this page as touched and validate
        let fields = [];
        if (page === 0) fields = ['email', 'password'];
        if (page === 1) fields = ['displayName', 'firstName', 'lastName'];
        if (page === 2) fields = ['clinicName', 'age'];
        const newTouched = { ...touched };
        const newValidation = { ...validation };
        fields.forEach((field) => {
            newTouched[field] = true;
            newValidation[field] = validateField(field, form[field]);
        });
        setTouched(newTouched);
        setValidation(newValidation);
        if (fields.every((field) => !newValidation[field])) {
            setPage(page + 1);
        }
    };

    const handlePrev = (e) => {
        e.preventDefault();
        setPage(page - 1);
    };

    return (
        <div className="w-full h-full flex flex-col justify-center items-center px-8 py-8 pb-10">
            <h2 className="text-4xl font-bold mb-4">SIGN UP</h2>
            <form className='w-full h-full flex flex-col' onSubmit={page === 2 ? handleValidatedSubmit : handleNext} noValidate>
                {pages[page]}
                <div className='flex-grow'>

                </div>
                <div className="flex justify-between mt-6">
                    {page > 0 && (
                        <button
                            type="button"
                            onClick={handlePrev}
                            className="bg-gray-300 text-gray-700 font-bold w-30  py-2 px-4 rounded hover:bg-gray-400 transition usapp-border"
                        >
                            Previous
                        </button>
                    )}
                    <div className="flex-1" />
                    {page < pages.length - 1 && (
                        <button
                            type="button"
                            onClick={handleNext}
                            disabled={!canGoNext()}
                            className="bg-blue-800 text-white font-bold py-2 px-4 w-30 rounded hover:bg-blue-900 transition usapp-border disabled:opacity-50"
                        >
                            Next
                        </button>
                    )}
                    {page === pages.length - 1 && (
                        <button
                            type="submit"
                            disabled={loading || !canGoNext()}
                            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition usapp-border disabled:opacity-50"
                        >
                            Create Account
                        </button>
                    )}
                </div>


                {success && <div className="mt-4 text-green-600 text-center">{success}</div>}
            </form>

        </div>
    );
};

export default SLPSignUp