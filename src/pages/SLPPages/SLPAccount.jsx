import React, { useState } from 'react';
import axios from 'axios';

const SLPAccount = () => {
    const [uid, setUid] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [clinicName, setClinicName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await axios.put(`/api/slpusers/${uid}`, {
                displayName,
            });
            setMessage(res.data.message || 'SLP user updated!');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Error updating user');
        }
        setLoading(false);
    };

    return (
        <div className="w-full mx-auto mt-10 p-6 ">
            <h2 className="text-2xl font-bold mb-4">Edit SLP User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">User ID (uid)</label>
                    <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={uid}
                        onChange={e => setUid(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Display Name</label>
                    <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Clinic Name</label>
                    <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={clinicName}
                        onChange={e => setClinicName(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? 'Updating...' : 'Update User'}
                </button>
            </form>
            {message && (
                <div className="mt-4 text-center text-sm text-gray-700">{message}</div>
            )}
        </div>
    );
};

export default SLPAccount;