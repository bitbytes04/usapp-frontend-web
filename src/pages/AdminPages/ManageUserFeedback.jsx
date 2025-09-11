import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Transition } from '@headlessui/react';


const ManageUserFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);
    const [summarizing, setSummarizing] = useState(false);
    const [error, setError] = useState('');

    // Fetch all user feedbacks
    useEffect(() => {
        const fetchFeedbacks = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await axios.get('https://usapp-backend.vercel.app/api/admin/user-feedbacks');
                setFeedbacks(res.data.feedbacks || []);
            } catch (err) {
                setError('Failed to load feedbacks.');
            }
            setLoading(false);
        };
        fetchFeedbacks();
    }, []);

    // Summarize feedbacks
    const handleSummarize = async () => {
        setSummarizing(true);
        setError('');
        try {
            const res = await axios.post('https://usapp-backend.vercel.app/api/admin/summarize-feedback');
            setSummary(res.data.summary || '');
        } catch (err) {
            setError('Failed to summarize feedback.');
        }
        setSummarizing(false);
    };

    // Table sorting and searching
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState('timestamp');
    const [sortOrder, setSortOrder] = useState('desc');

    // Filter and sort feedbacks
    const filteredFeedbacks = feedbacks
        .filter(fb =>
            fb.feedback.toLowerCase().includes(search.toLowerCase()) ||
            String(fb.rating).includes(search)
        )
        .sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];
            if (sortKey === 'timestamp') {
                valA = new Date(valA);
                valB = new Date(valB);
            }
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    const handleSort = key => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    return (
        <div className="w-full mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Manage User Feedback</h1>
            {error && <div className="mb-4 text-red-500">{error}</div>}
            <div className="mb-6 flex items-center justify-between">
                <span className="text-lg font-semibold">All Feedbacks</span>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    onClick={handleSummarize}
                    disabled={summarizing || loading || feedbacks.length === 0}
                >
                    {summarizing ? 'Summarizing...' : 'Summarize Feedback'}
                </button>
            </div>
            <div className="mb-4 flex items-center gap-2">
                <input
                    type="text"
                    className="border rounded px-3 py-2 w-full max-w-xs"
                    placeholder="Search feedback or rating..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
            {loading ? (
                <div>Loading feedbacks...</div>
            ) : filteredFeedbacks.length === 0 ? (
                <div className="text-gray-500">No feedbacks found.</div>
            ) : (
                <div className="overflow-x-auto mb-8">
                    <table className="min-w-full  bg-white rounded-lg shadow border border-black-100">
                        <thead>
                            <tr>
                                <th
                                    className="px-4 py-2 cursor-pointer"
                                    onClick={() => handleSort('rating')}
                                >
                                    Rating
                                    {sortKey === 'rating' && (
                                        <span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>
                                    )}
                                </th>
                                <th
                                    className="px-4 py-2 cursor-pointer"
                                    onClick={() => handleSort('feedback')}
                                >
                                    Feedback
                                    {sortKey === 'feedback' && (
                                        <span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>
                                    )}
                                </th>
                                <th
                                    className="px-4 py-2 cursor-pointer"
                                    onClick={() => handleSort('timestamp')}
                                >
                                    Timestamp
                                    {sortKey === 'timestamp' && (
                                        <span>{sortOrder === 'asc' ? ' ▲' : ' ▼'}</span>
                                    )}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFeedbacks.map(fb => (
                                <tr key={fb.id} className="border-t">
                                    <td className="px-4 py-2 text-center text-blue-600 font-bold">{fb.rating}</td>
                                    <td className="px-4 py-2 text-center text-gray-800">{fb.feedback}</td>
                                    <td className="px-4 py-2 text-center text-xs text-gray-400">
                                        {fb.timestamp && new Date(fb.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {summary && (
                <div className="bg-gray-100 p-4 rounded shadow">
                    <div className="font-semibold mb-2">Summary:</div>
                    <div className="text-gray-700">{summary}</div>
                </div>
            )}
            <Transition
                show={summarizing}
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
                                <span className="text-lg font-semibold text-gray-700">Summarizing Feedback...</span>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold mb-4">Generating Summary</h2>
                    </div>
                </div>
            </Transition>
        </div>
    );
};

export default ManageUserFeedback;