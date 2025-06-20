import React, { use, useEffect, useState } from "react";
import axios from "axios";
import { Transition } from "@headlessui/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";



const PAGE_SIZE = 10;

const LinkedUsers = ({ uid }) => {
    const [linkedUsers, setLinkedUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showLinkingPopUp, setshowLinkingPopUp] = useState(false);
    const [BoardUsageData, setBoardUsageData] = useState({});
    const [SelectedUser, setSelectedUser] = useState({});
    const [usageData, setusageData] = useState([]);


    // Fetch linked users
    useEffect(() => {
        const fetchLinkedUsers = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`https://usapp-backend.vercel.app/api/slp/${sessionStorage.getItem('slpId')}/linked-users`);
                setLinkedUsers(res.data.linkedUsers || []);
                setFilteredUsers(res.data.linkedUsers || []);
            } catch (err) {
                setLinkedUsers([]);
                setFilteredUsers([]);
            }
            setLoading(false);
        };



        fetchLinkedUsers();

    }, []);


    useEffect(() => {
        const fetchBoardUsageSummary = async () => {
            try {
                const res = await axios.get(`https://usapp-backend.vercel.app/api/slp/board-usage-summary/${SelectedUser.userId}/`);
                setBoardUsageData(res.data || {});
                // Set usageData here, only include top 10 buttons by count
                const usageDataArr = res.data.buttonTotals
                    ? Object.entries(res.data.buttonTotals)
                        .map(([buttonId, count]) => ({ buttonId, count }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 10)
                    : [];
                setusageData(usageDataArr);
            } catch (err) {
                console.error("Failed to fetch board usage summary", err);
                setusageData([]);
            }
        };
        fetchBoardUsageSummary();
    }, [SelectedUser]);
    // Search filter
    useEffect(() => {
        if (!search) {
            setFilteredUsers(linkedUsers);
        } else {
            setFilteredUsers(
                linkedUsers.filter(
                    (u) =>
                        u.userData?.name?.toLowerCase().includes(search.toLowerCase()) ||
                        u.userData?.email?.toLowerCase().includes(search.toLowerCase())
                )
            );
            setPage(1);
        }

    }, [search]);

    // Remove linked user
    const handleRemove = async (linkedUserId) => {
        if (!window.confirm("Remove this linked user?")) return;
        try {
            await axios.delete(`/api/slp/linked-users/${uid}/${linkedUserId}`);
            setLinkedUsers((prev) => prev.filter((u) => u.userId !== linkedUserId));
        } catch (err) {
            alert("Failed to remove linked user.");
        }
    };

    const [linkEmail, setLinkEmail] = useState("");
    const [linking, setLinking] = useState(false);
    const [linkError, setLinkError] = useState("");
    const [linkSuccess, setLinkSuccess] = useState("");

    const handleLinkRequest = async (e) => {
        e.preventDefault();
        setLinkError("");
        setLinkSuccess("");
        if (!linkEmail) {
            setLinkError("Please enter an email.");
            return;
        }
        setLinking(true);
        try {
            const res = await axios.post(`https://usapp-backend.vercel.app/api/slp/link-request/${sessionStorage.getItem('slpId')}`, {
                targetEmail: linkEmail,
            });
            setLinkSuccess(res.data.message || "Link request sent.");
            setLinkEmail("");
        } catch (err) {
            setLinkError(
                err.response?.data?.error ||
                "Failed to send link request."
            );
        }
        setLinking(false);
    };



    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
    const pagedUsers = filteredUsers.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    );

    // Option mappings
    const voiceOptions = ['Male', 'Female', 'Child'];
    const pitchOptions = ['Low', 'Medium', 'High'];
    const speedOptions = ['Slow', 'Moderate', 'Fast'];

    // Helper functions to map index to label
    const getVoiceLabel = (val) =>
        typeof val === "number" && voiceOptions[val] !== undefined ? voiceOptions[val] : "-";
    const getPitchLabel = (val) =>
        typeof val === "number" && pitchOptions[val] !== undefined ? pitchOptions[val] : "-";
    const getSpeedLabel = (val) =>
        typeof val === "number" && speedOptions[val] !== undefined ? speedOptions[val] : "-";

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Linked Users</h1>
            <div className="mb-4 flex items-center justify-between">
                <input
                    className="border rounded px-3 py-2 w-full max-w-xs"
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button
                    className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => setshowLinkingPopUp(true)}
                > Send Link Request</button>
                <Transition
                    show={showLinkingPopUp}
                    enter="transition-opacity duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md backdrop-brightness-50 animate-fade-in">
                        <div className="bg-white flex flex-col justify-center items-center p-6 gap-2 rounded shadow-lg w-96">
                            <h2 className="text-xl font-semibold  p-5">Send Link Request</h2>
                            <form onSubmit={handleLinkRequest} className="flex flex-col gap-2 w-full justify-center items-center space-x-2">
                                <input
                                    type="email"
                                    className="border w-full  rounded px-3 py-2"
                                    placeholder="Link user by email"
                                    value={linkEmail}
                                    onChange={(e) => setLinkEmail(e.target.value)}
                                    disabled={linking}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 w-full text-white px-3 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                                    disabled={linking}
                                >
                                    {linking ? "Linking..." : "Link"}
                                </button>
                                {linkError && <span className="text-red-500 text-sm ml-2">{linkError}</span>}
                                {linkSuccess && <span className="text-green-600 text-sm ml-2">{linkSuccess}</span>}
                            </form>
                            <button
                                type="button"
                                className="ml-auto w-full bg-gray-300 text-gray-800 px-3 py-2 rounded hover:bg-gray-400"
                                onClick={() => setshowLinkingPopUp(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border rounded shadow">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b">First Name</th>
                                    <th className="px-4 py-2 border-b">Last Name</th>
                                    <th className="px-4 py-2 border-b">Email</th>
                                    <th className="px-4 py-2 border-b">Board Preference</th>
                                    <th className="px-4 py-2 border-b">Emotion Toggle</th>
                                    <th className="px-4 py-2 border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="text-center py-4">
                                            No linked users found.
                                        </td>
                                    </tr>
                                ) : (
                                    pagedUsers.map((u) => (
                                        <tr key={u.id}>
                                            <td className="px-4 py-2 border-b text-center">
                                                {u.userData?.firstName || "-"}
                                            </td>
                                            <td className="px-4 py-2 border-b text-center">
                                                {u.userData?.lastName || "-"}
                                            </td>
                                            <td className="px-4 py-2 border-b text-center" >
                                                {u.userData?.email || "-"}

                                            </td>
                                            <td className="px-4 py-2 border-b text-center">
                                                {u.userData?.boardPreference || "-"}
                                            </td>
                                            <td className="px-4 py-2 border-b text-center">
                                                {u.userData?.emotionToggle || "-"}
                                            </td>
                                            <td className="px-4 py-2 border-b text-center">
                                                <button
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                    onClick={() => handleRemove(u.userId)}
                                                >
                                                    Remove
                                                </button>
                                                <button
                                                    className="ml-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                                    onClick={() => setSelectedUser(u)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-4 space-x-2">
                                <button
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Prev
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        className={`px-3 py-1 border rounded ${page === i + 1 ? "bg-blue-500 text-white" : ""
                                            }`}
                                        onClick={() => setPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Selected User Details UI */}
                    {SelectedUser.userData && (
                        <div className="mt-8 w-full mx-auto bg-gray-50 border rounded shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Selected User Details</h2>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 flex-1">
                                    <div className="font-medium">First Name:</div>
                                    <div>{SelectedUser.userData.firstName || "-"}</div>
                                    <div className="font-medium">Last Name:</div>
                                    <div>{SelectedUser.userData.lastName || "-"}</div>
                                    <div className="font-medium">Username:</div>
                                    <div>{SelectedUser.userData.username || "-"}</div>
                                    <div className="font-medium">Email:</div>
                                    <div>{SelectedUser.userData.email || "-"}</div>
                                    <div className="font-medium">User Type:</div>
                                    <div>{SelectedUser.userData.userType || "-"}</div>
                                    <div className="font-medium">Age:</div>
                                    <div>{SelectedUser.userData.age || "-"}</div>
                                    <div className="font-medium">Preferred Pitch:</div>
                                    <div>{getPitchLabel(SelectedUser.userData.preferredPitch)}</div>
                                    <div className="font-medium">End Name:</div>
                                    <div>{SelectedUser.userData.endName || "-"}</div>
                                    <div className="font-medium">End Age:</div>
                                    <div>{SelectedUser.userData.endAge || "-"}</div>
                                    <div className="font-medium">Board Preference:</div>
                                    <div>{SelectedUser.userData.boardPreference || "-"}</div>
                                    <div className="font-medium">Emotion Toggle:</div>
                                    <div>{SelectedUser.userData.emotionToggle || "-"}</div>
                                    <div className="font-medium">Preferred Voice:</div>
                                    <div>{getVoiceLabel(SelectedUser.userData.preferredVoice)}</div>
                                    <div className="font-medium">Preferred Speed:</div>
                                    <div>{getSpeedLabel(SelectedUser.userData.preferredSpeed)}</div>
                                </div>
                                <div className="flex-1">


                                    <div className="w-full h-64 flex flex-col items-center">
                                        <h3 className="text-lg font-semibold mb-2">Board Usage Data</h3>
                                        {usageData.length === 0 ? (
                                            <div className="text-gray-500">No usage data available.</div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={220}>
                                                <BarChart data={usageData}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="buttonId" />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="count" fill="#3b82f6" name="Press Count" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>

                                </div>
                            </div>
                            <button
                                className="mt-6 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                                onClick={() => setSelectedUser({})}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default LinkedUsers;