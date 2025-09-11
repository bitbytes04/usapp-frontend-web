import React, { useEffect, useState } from "react";
import axios from "axios";



const AccountLinking = ({ uid }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState({});
    const [error, setError] = useState("");
    const API_BASE = "https://usapp-backend.vercel.app/api/users";
    // Fetch all link requests for the user
    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axios.get(`https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}/linkrequests`);
                setRequests(res.data);
            } catch (err) {
                setError("Failed to load link requests.");
            }
            setLoading(false);
        };
        fetchRequests();
    }, []);

    // Approve a link request
    const approveRequest = async (requestId, slpId) => {
        setApproving((prev) => ({ ...prev, [requestId]: true }));
        setError("");
        try {
            await axios.post(
                `${API_BASE}/${sessionStorage.getItem('userId')}/linkrequests/${requestId}/approve/${slpId}`
            );
            setRequests((prev) =>
                prev.map((req) =>
                    req.id === requestId ? { ...req, status: "approved" } : req
                )
            );
        } catch (err) {
            setError("Failed to approve request.");
        }
        setApproving((prev) => ({ ...prev, [requestId]: false }));
    };

    return (
        <div className="w-full mx-auto p-4 sm:p-6">
            <div className="bg-[#cb833d] flex items-center mb-6 p-2 rounded sm:rounded-lg">
                <h1 className="text-2xl sm:text-3xl font-bold text-white mx-auto text-center">Account Linking</h1>
            </div>
            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm sm:text-base">
                    {error}
                </div>
            )}
            {loading ? (
                <div className="text-gray-500 text-center">Loading...</div>
            ) : requests.length === 0 ? (
                <div className="text-gray-500 text-center">No link requests found.</div>
            ) : (
                <ul className="space-y-4">
                    {requests.map((req) => (
                        <li
                            key={req.id}
                            className="bg-white shadow rounded p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                            <div className="w-full">
                                <div className="mb-2">
                                    <span className="uppercase text-xs font-bold text-gray-500 tracking-wider mr-2">
                                        Speech Pathologist:
                                    </span>
                                    <span className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                                        {req.fromDisplayName}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <span className="uppercase text-xs font-bold text-gray-500 tracking-wider mr-2">
                                        Status:
                                    </span>
                                    <span
                                        className={
                                            req.status === "approved"
                                                ? "text-green-600 font-bold"
                                                : "text-yellow-600 font-bold"
                                        }
                                    >
                                        {req.status}
                                    </span>
                                </div>
                            </div>
                            {req.status !== "approved" && (
                                <button
                                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50 text-sm sm:text-base"
                                    onClick={() => approveRequest(req.id, req.fromUserId)}
                                    disabled={approving[req.id]}
                                >
                                    {approving[req.id] ? "Approving..." : "Approve"}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AccountLinking;