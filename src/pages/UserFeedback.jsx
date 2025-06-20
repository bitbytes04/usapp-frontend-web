import React, { useState } from 'react';
import axios from 'axios';

const UserFeedback = ({ uid }) => {
    const [feedback, setFeedback] = useState('');
    const [rating, setRating] = useState(5);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        try {
            await axios.post(`https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}/feedback`, { feedback, rating });
            setMsg('Feedback submitted!');
            setFeedback('');
            setRating(5);
        } catch (err) {
            setMsg(err.response?.data?.error || 'Error submitting feedback');
        }
        setLoading(false);
    };

    return (
        <div className="w-full p-6 ">
            <div className=" bg-[#30555c] flex w-full items-center mb-6 p-2">
                <h1 className="text-3xl font-bold text-white mx-auto">SUBMIT FEEDBACK</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Rating</label>
                    <select
                        className="w-full border bg-white rounded p-2"
                        value={rating}
                        onChange={e => setRating(Number(e.target.value))}
                    >
                        {[1, 2, 3, 4, 5].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Your Feedback</label>
                    <textarea
                        className="w-full border bg-white rounded p-2"
                        rows={4}
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
                {msg && (
                    <div className="mt-2 text-center text-sm text-gray-700">{msg}</div>
                )}
            </form>
        </div>
    );
};

export default UserFeedback;