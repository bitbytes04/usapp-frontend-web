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
                `${API_BASE}/link-requests/${uid}/approve/${requestId}/${slpId}`
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
        <div className="w-full mx-auto p-6">

            <div className="bg-[#cb833d] flex items-center mb-6 p-2">
                <h1 className="text-3xl font-bold text-white mx-auto">Account Linking</h1>
            </div>
            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
                    {error}
                </div>
            )}
            {loading ? (
                <div className="text-gray-500">Loading...</div>
            ) : requests.length === 0 ? (
                <div className="text-gray-500">No link requests found.</div>
            ) : (
                <ul className="space-y-4">
                    {requests.map((req) => (
                        <li
                            key={req.id}
                            className="bg-white shadow rounded p-4 flex items-center justify-between"
                        >
                            <div>
                                <div className="font-semibold">SPEECH PATHOLOGIST: {req.fromDisplayName}</div>
                                <div className="text-sm text-gray-500">
                                    Status:{" "}
                                    <span
                                        className={
                                            req.status === "approved"
                                                ? "text-green-600"
                                                : "text-yellow-600"
                                        }
                                    >
                                        {req.status}
                                    </span>
                                </div>
                            </div>
                            {req.status !== "approved" && (
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
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