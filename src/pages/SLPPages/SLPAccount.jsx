import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SLPAccount = () => {
    const [uid, setUid] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [clinicName, setClinicName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');



    const getUserInfo = async () => {

        try {
            const res = await axios.get(`https://usapp-backend.vercel.app/api/slp/get-slp/${sessionStorage.getItem("slpId")}`);
            setDisplayName(res.data.displayName || '');
            setClinicName(res.data.clinicName || '');
            setMessage('User info loaded');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Error fetching user info');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (sessionStorage.getItem("slpId")) {
            getUserInfo();
        }
    }, []);


    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!uid.trim()) newErrors.uid = "User ID is required";
        if (!displayName.trim()) newErrors.displayName = "Display Name is required";
        if (!clinicName.trim()) newErrors.clinicName = "Clinic Name is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setMessage('');
        try {
            await axios.put(`https://usapp-backend.vercel.app/api/slp/edit-slp/${sessionStorage.getItem("slpId")}`, {
                displayName, clinicName
            });
            setIsEditing(false);
            setMessage('User updated successfully');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Error updating user');
        }
        setLoading(false);
    };

    return (
        <div className="w-full mx-auto p-6 ">
            <h2 className="text-2xl font-bold mb-4">Edit SLP User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Display Name</label>
                    <input
                        type="text"
                        className={`w-full border rounded px-3 py-2 ${errors.displayName ? 'border-red-500' : ''}`}
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        disabled={!isEditing}
                    />
                    {errors.displayName && <div className="text-red-500 text-xs">{errors.displayName}</div>}
                </div>
                <div>
                    <label className="block mb-1 font-medium">Clinic Name</label>
                    <input
                        type="text"
                        className={`w-full border rounded px-3 py-2 ${errors.clinicName ? 'border-red-500' : ''}`}
                        value={clinicName}
                        onChange={e => setClinicName(e.target.value)}
                        disabled={!isEditing}
                    />
                    {errors.clinicName && <div className="text-red-500 text-xs">{errors.clinicName}</div>}
                </div>
                {isEditing ? (
                    <div className="flex justify-between">
                        <button
                            type="button"
                            className="w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-200 ml-2"
                            onClick={() => setIsEditing(false)}> Cancel</button>
                        <button
                            type="submit"
                            className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Update User'}
                        </button>

                    </div>
                ) : (
                    <button
                        type="button"
                        className="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-600"
                        onClick={handleEditClick}
                    >
                        Edit
                    </button>
                )}
            </form>
            {message && (
                <div className="mt-4 text-center text-sm text-gray-700">{message}</div>
            )}
        </div>
    );
};

export default SLPAccount;