import React, { useState, useEffect } from 'react';
import header from '../assets/backgrounds/header_background_img.png';
import logo from '../assets/logos/usapp_logo_medium.png';
import axios from 'axios';
import { Transition } from '@headlessui/react';

const initialFormData = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    userType: 'Guardian',
    age: '',
    endName: '',
    endAge: '',
    boardPreference: 0,
    preferredVoice: 0,
    preferredPitch: 0,
};

const voiceOptions = ['Male', 'Female', 'Child'];
const pitchOptions = ['Low', 'Medium', 'High'];

const getVoiceValue = (pref) => {
    if (pref === 'male') {
        return 0;
    }
    else if (pref === 'female') {
        return 1;
    }
    else if (pref === 'child') {
        return 2;
    }
}

const getPitchValue = (pref) => {
    if (pref === 'low') {
        return 0;
    }
    else if (pref === 'medium') {
        return 1;
    }
    else if (pref === 'high') {
        return 2;
    }
}

const AccountSettings = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}`);
                const data = response.data;

                setFormData({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    username: data.username,
                    email: data.email,
                    userType: data.userType,
                    age: data.age,
                    endName: data.endName,
                    endAge: data.endAge,
                    boardPreference: data.boardPreference,
                    preferredVoice: parseInt(data.preferredVoice),
                    preferredPitch: parseInt(data.preferredPitch),
                });
            } catch (error) {
                alert(error.message)
            }
        };

        fetchUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleVoiceSliderChange = (e) => {
        const idx = parseInt(e.target.value, 10);
        setFormData({ ...formData, preferredVoice: idx });
    };

    const handlePitchSliderChange = (e) => {
        const idx = parseInt(e.target.value, 10);
        setFormData({ ...formData, preferredPitch: idx });
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsEditing(false);
        try {
            await axios.post(
                `https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}/edituser`,
                formData,
                { headers: { 'Content-Type': 'application/json' } }
            );
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='flex flex-col justify-start items-center bg-[#fff6eb] min-h-screen pb-20'>
            <Transition
                show={isSubmitting}
                enter="transition-opacity duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white px-8 py-6 rounded-lg flex flex-col items-center shadow-lg">
                        <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span className="text-lg font-semibold text-gray-700">Saving changes...</span>
                    </div>
                </div>
            </Transition>
            <img className="w-full object-top h-15" src={header} alt="Header Background" />
            <div className='flex w-full px-8 flex-row justify-center items-center'>
                <div className='flex flex-col justify-center items-start w-full h-full p-6'>
                    <h1 className='text-2xl font-bold'>Account Settings</h1>
                    <p className='text-lg'>Manage your account details below.</p>
                </div>
                <img className="w-1/12 mb-4 min-w-40" src={logo} alt="Logo" />
            </div>
            <form
                onSubmit={handleSubmit}
                className="bg-white w-11/12 text-black p-6 rounded-lg shadow-lg border-dashed border-2 duration-300"
            >
                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">User Type</label>
                    <select
                        name="userType"
                        value={formData.userType}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-lg"
                    >
                        <option value="Guardian">Guardian</option>
                        <option value="EndUser">End User</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Age</label>
                    <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                {formData.userType === "Guardian" && (
                    <>
                        <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">End User Name</label>
                            <input
                                type="text"
                                name="endName"
                                value={formData.endName}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-lg font-medium mb-2">End User Age</label>
                            <input
                                type="number"
                                name="endAge"
                                value={formData.endAge}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>
                    </>
                )}
                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Board Preference</label>
                    <select
                        name="boardPreference"
                        value={formData.boardPreference}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-2 border rounded-lg"
                    >
                        <option value="">Select</option>
                        <option value="Left">Left</option>
                        <option value="Right">Right</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Preferred Voice</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="1"
                            value={formData.preferredVoice}
                            onChange={handleVoiceSliderChange}
                            disabled={!isEditing}
                            className="w-full"
                        />
                        <span className="ml-2">{voiceOptions[formData.preferredVoice]}</span>
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Preferred Pitch</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="1"
                            value={formData.preferredPitch}
                            onChange={handlePitchSliderChange}
                            disabled={!isEditing}
                            className="w-full"
                        />
                        <span className="ml-2">{pitchOptions[formData.preferredPitch]}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <button
                        type="button"
                        onClick={toggleEdit}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                        {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                    {isEditing && (
                        <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded-lg"
                            disabled={isSubmitting}
                        >
                            Save Changes
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AccountSettings;
