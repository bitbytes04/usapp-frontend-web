import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Transition } from '@headlessui/react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

const ManageUsers = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [slpUsers, setSlpUsers] = useState([]);
    const [boardLogs, setboardLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setisProcessing] = useState(false);
    const [StatNumber, setStatNumber] = useState(10);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                // Replace URLs with your actual API endpoints
                const [allRes, slpRes, bLogsRes] = await Promise.all([
                    axios.get('https://usapp-backend.vercel.app/api/admin/users'),
                    axios.get('https://usapp-backend.vercel.app/api/admin/slp-users'),
                    axios.get('https://usapp-backend.vercel.app/api/admin/board-logs')
                ]);
                setAllUsers(allRes.data.users || []);
                setSlpUsers(slpRes.data.users || []);
                setboardLogs(bLogsRes.data.boardLogs || []);
            } catch (err) {
                setAllUsers([]);
                setSlpUsers([]);
                setboardLogs([]);
            }
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const handleUserStatusChange = async (uid, type, action) => {
        try {
            setisProcessing(true);
            const endpoint =
                action === 'disable'
                    ? `https://usapp-backend.vercel.app/api/admin/disable-user/${uid}`
                    : `https://usapp-backend.vercel.app/api/admin/enable-user/${uid}`;
            await axios.post(endpoint);
            // Refetch users after status change

            const [allRes, slpRes, bLogsRes] = await Promise.all([
                axios.get('https://usapp-backend.vercel.app/api/admin/users'),
                axios.get('https://usapp-backend.vercel.app/api/admin/slp-users'),
                axios.get('https://usapp-backend.vercel.app/api/admin/board-logs')
            ]);
            setAllUsers(allRes.data.users || []);
            setSlpUsers(slpRes.data.users || []);
            setboardLogs(bLogsRes.data.boardLogs || []);
            alert(`User ${action}d successfully.`);

        } catch (err) {
            alert('Failed to update user status.');
        }
        finally {
            setisProcessing(false);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all' or 'slp'

    // Filtered users based on search and filterType
    const filteredAllUsers = allUsers.filter(user =>
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.uid?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredSlpUsers = slpUsers.filter(user =>
    (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.uid?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 10;

    // Get current users for pagination
    const getCurrentUsers = (users) => {
        const indexOfLastUser = currentPage * usersPerPage;
        const indexOfFirstUser = indexOfLastUser - usersPerPage;
        return users.slice(indexOfFirstUser, indexOfLastUser);
    };

    // Reset to first page when filter/search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType]);

    // Pagination controls
    const getPageCount = (users) => Math.ceil(users.length / usersPerPage);

    const renderPagination = (users) => {
        const pageCount = getPageCount(users);
        if (pageCount <= 1) return null;
        return (
            <div className="flex justify-center mt-4 gap-2">
                <button
                    className="px-3 py-1 rounded bg-gray-200"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    Prev
                </button>
                {Array.from({ length: pageCount }, (_, i) => (
                    <button
                        key={i + 1}
                        className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
                <button
                    className="px-3 py-1 rounded bg-gray-200"
                    onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                    disabled={currentPage === pageCount}
                >
                    Next
                </button>
            </div>
        );
    };

    // Helper: Aggregate button presses from boardLogs
    const getButtonPressStats = (logs) => {
        const stats = {};
        logs.forEach(log => {
            if (Array.isArray(log.buttonPresses)) {
                log.buttonPresses.forEach(bp => {
                    const btn = bp.buttonId || bp.id || 'unknown';
                    stats[btn] = (stats[btn] || 0) + (bp.count || 1);
                });
            }
        });
        // Convert to array for recharts
        return Object.entries(stats).map(([name, value]) => ({ name, value }));
    };

    const getTopButtonStats = (logs, topN = 10) => {
        const stats = getButtonPressStats(logs);
        if (stats.length <= topN) return { top: stats, remaining: [] };
        const sorted = [...stats].sort((a, b) => b.value - a.value);
        const top = sorted.slice(0, topN);
        const remainingValue = sorted.slice(topN).reduce((sum, item) => sum + item.value, 0);
        const remainingNames = sorted.slice(topN).map(item => item.name);
        return {
            top: [...top],
            remaining: sorted.slice(topN)
        };
    };

    const { top: topButtonStats, remaining: remainingButtonStats } = getTopButtonStats(boardLogs, StatNumber);
    console.log('Top Button Stats:', topButtonStats);

    const [buttonSearchTerm, setButtonSearchTerm] = useState('');
    const [buttonSearchResult, setButtonSearchResult] = useState(null);

    const handleButtonSearch = () => {
        if (!buttonSearchTerm.trim()) {
            setButtonSearchResult(null);
            return;
        }
        const stats = getButtonPressStats(boardLogs);
        const found = stats.find(item =>
            item.name.toLowerCase().includes(buttonSearchTerm.toLowerCase())
        );
        setButtonSearchResult(found || { name: buttonSearchTerm, value: 0 });
    };

    return (
        <div className="p-6 bg-[#fff6eb] min-h-screen w-full">
            <Transition
                show={isProcessing}
                enter="transition-opacity duration-500"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-500"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="z-20"
            >
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md backdrop-brightness-50 animate-fade-in">
                    <div className="p-6 flex flex-col justify-center items-center backdrop-blur-md backdrop-brightness-50 w-80">
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="bg-white px-8 py-6 rounded-lg flex flex-col items-center shadow-lg">
                                <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                <span className="text-lg font-semibold text-gray-700">Processing Request...</span>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold mb-4">Generating Summary</h2>
                    </div>
                </div>
            </Transition>
            <h1 className="text-2xl font-bold mb-6 px-3 bg-blue-900 text-white">MONITOR USERS</h1>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by name, email, or UID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex gap-2">
                    <button
                        className={`px-4 py-2 rounded ${filterType === 'all' ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setFilterType('all')}
                    >
                        All Users
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${filterType === 'slp' ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setFilterType('slp')}
                    >
                        SLP Users
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                </div>
            ) : (
                <>
                    {filterType === 'all' ? (
                        <div className='transition-all duration-500'>
                            <h2 className="px-3 bg-blue-900 text-xl font-semibold text-white mb-2">USERS</h2>
                            <div className="overflow-x-auto rounded shadow">
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-700">
                                            {/* <th className="py-2 px-4 text-left">UID</th> */}
                                            <th className="py-2 px-4 text-left">Email</th>
                                            <th className="py-2 px-4 text-left">Full Name</th>
                                            <th className="py-2 px-4 text-left">Role</th>
                                            <th className="py-2 px-4 text-left">Status</th>
                                            <th className="py-2 px-4 text-left">Actions</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getCurrentUsers(filteredAllUsers).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-4 text-center text-gray-500">No users found.</td>
                                            </tr>
                                        ) : (
                                            getCurrentUsers(filteredAllUsers).map(user => (
                                                <tr key={user.uid} className="border-b hover:bg-blue-50">
                                                    {/* <td className="py-2 px-4">{user.uid}</td> */}
                                                    <td className="py-2 px-4">{user.email}</td>
                                                    <td className="py-2 px-4">{user.firstName || user.username} {user.lastName}</td>
                                                    <td className="py-2 px-4">
                                                        {user.role}
                                                    </td>
                                                    <td>
                                                        {user.status}
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        {user.status === 'active' ? (<>
                                                            <button className='px-3 py-1 bg-red-600 text-white rounded hover:bg-blue-700'
                                                                onClick={() => handleUserStatusChange(user.uid, 'all', 'disable')}>
                                                                disable
                                                            </button>
                                                        </>) : (
                                                            <button className='px-3 py-1 bg-green-600 text-white rounded hover:bg-blue-700'
                                                                onClick={() => handleUserStatusChange(user.uid, 'all', 'enable')}>
                                                                enable
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {renderPagination(filteredAllUsers)}
                        </div>
                    ) : (
                        <div>
                            <h2 className="px-3 bg-blue-900 text-xl font-semibold text-white mb-2">Speech Pathologist Users</h2>
                            <div className="overflow-x-auto rounded shadow">
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr className="bg-gray-100 text-gray-700">
                                            <th className="py-2 px-4 text-left">UID</th>
                                            <th className="py-2 px-4 text-left">Name</th>
                                            <th className="py-2 px-4 text-left">Email</th>
                                            <th className="py-2 px-4 text-left">Role</th>
                                            <th className="py-2 px-4 text-left">Status</th>
                                            <th className="py-2 px-4 text-left">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getCurrentUsers(filteredSlpUsers).length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="py-4 text-center text-gray-500">No SLP users found.</td>
                                            </tr>
                                        ) : (
                                            getCurrentUsers(filteredSlpUsers).map(user => (
                                                <tr key={user.uid} className="border-b hover:bg-blue-50">
                                                    <td className="py-2 px-4">{user.uid}</td>
                                                    <td className="py-2 px-4">{user.name || user.displayName || '-'}</td>
                                                    <td className="py-2 px-4">{user.email || '-'}</td>
                                                    <td className="py-2 px-4">
                                                        {user.role}
                                                    </td>
                                                    <td>
                                                        {user.status}
                                                    </td>
                                                    <td className="py-2 px-4">
                                                        {user.status === 'active' ? (<>
                                                            <button className='px-3 py-1 bg-red-600 text-white rounded hover:bg-blue-700'
                                                                onClick={() => handleUserStatusChange(user.uid, 'slp', 'disable')}>
                                                                disable
                                                            </button>
                                                        </>) : (
                                                            <button className='px-3 py-1 bg-green-600 text-white rounded hover:bg-blue-700'
                                                                onClick={() => handleUserStatusChange(user.uid, 'slp', 'enable')}>
                                                                enable
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {renderPagination(filteredSlpUsers)}
                        </div>
                    )}

                    <h2 className="px-3 bg-blue-900 text-xl font-semibold text-white mt-5">USER STATISTICS</h2>

                    <div className='overflow-x-auto'>



                        <div className="flex flex-col px-5 shadow-md rounded bg-white mt-5 md:mt-0">

                            <div className="flex flex-col md:flex-row-reverse justify-around">
                                <div className="border-2 border-gray-300 rounded px-2 m-2">
                                    <h2 className="text-md font-semibold py-2 bg-amber-800 text-white text-center w-full my-2">USER ROLE DISTRIBUTION</h2>
                                    <PieChart width={300} height={400} className='z-0'>
                                        <Pie
                                            dataKey="value"
                                            isAnimationActive={true}
                                            data={
                                                Object.entries(
                                                    allUsers.reduce((acc, user) => {
                                                        const role = user.role || 'unknown';
                                                        acc[role] = (acc[role] || 0) + 1;
                                                        return acc;
                                                    }, {})
                                                ).map(([role, value]) => ({ name: role, value }))
                                            }
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            label
                                        >
                                            {Object.entries(
                                                allUsers.reduce((acc, user) => {
                                                    const role = user.role || 'unknown';
                                                    acc[role] = (acc[role] || 0) + 1;
                                                    return acc;
                                                }, {})
                                            ).map(([role], idx) => (
                                                <Cell
                                                    key={role}
                                                    fill={
                                                        [
                                                            "#8884d8",
                                                            "#82ca9d",
                                                            "#ffc658",
                                                            "#ff8042",
                                                            "#8dd1e1",
                                                            "#a4de6c",
                                                            "#d0ed57",
                                                            "#d8854f"
                                                        ][idx % 8]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>

                                </div>

                                <div className="border-2 border-gray-300 px-2 rounded m-2">
                                    <h2 className="text-md font-semibold py-2 bg-teal-800 text-white w-full text-center my-2">TOP BUTTON PRESSES</h2>
                                    <PieChart width={300} height={400} className='z-0'>
                                        <Legend />
                                        <Pie
                                            dataKey="value"
                                            isAnimationActive={true}
                                            data={topButtonStats}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#82ca9d"
                                            label
                                        >
                                            {topButtonStats.map((entry, idx) => (
                                                <Cell
                                                    key={entry.name}
                                                    fill={
                                                        [
                                                            "#8884d8",
                                                            "#82ca9d",
                                                            "#ffc658",
                                                            "#ff8042",
                                                            "#8dd1e1",
                                                            "#a4de6c",
                                                            "#d0ed57",
                                                            "#d8854f"
                                                        ][idx % 8]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>

                                </div>



                                <div className="flex flex-col items-center px-2 pb-4 flex-1 border-2 border-gray-300 rounded m-2">
                                    <h2 className="text-md font-semibold py-2 bg-cyan-700 text-white w-full text-center my-2">CHART DISPLAY LIMIT</h2>

                                    <input
                                        type="number"
                                        min={1} max={15}
                                        placeholder="Enter button name/word..."
                                        value={StatNumber}
                                        onChange={e => setStatNumber(e.target.value)}
                                        className="w-full py-2  px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />


                                    <h2 className="text-md font-semibold py-2 bg-cyan-700 text-white w-full text-center my-2">SEARCH BUTTON USAGE</h2>
                                    <div className="flex gap-2 mb-2 w-full">
                                        <input
                                            type="text"
                                            placeholder="Enter button name/word..."
                                            value={buttonSearchTerm}
                                            onChange={e => setButtonSearchTerm(e.target.value)}
                                            className="px-3 flex-grow py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                        <button
                                            className="px-4 py-2 bg-cyan-700 text-white rounded hover:bg-blue-700"
                                            onClick={handleButtonSearch}
                                        >
                                            Search
                                        </button>


                                    </div>

                                    <div className='flex-grow bg-gray-100 w-full p-3 rounded text-center border-1 border-gray-200'>
                                        {buttonSearchResult && (
                                            <div className="text-lg capitalize mt-2">
                                                <span className="font-semibold">{buttonSearchResult.name}:</span> {buttonSearchResult.value} usage{buttonSearchResult.value === 1 ? '' : 's'}
                                            </div>
                                        )}
                                    </div>


                                </div>

                            </div>
                            <h2 className="text-md font-semibold py-2 bg-teal-800 text-white w-full text-center my-2">TOP BUTTON PRESSES</h2>
                            <div className='border-gray-300 p-5 self-center max-w-[100%] rounded m-2 overflow-x-auto'>


                                <BarChart width={800} height={300} data={topButtonStats}>
                                    <Bar dataKey="value" fill="#8884d8" className='z-0'>
                                        {topButtonStats.map((entry, idx) => (
                                            <Cell
                                                key={entry.name}
                                                fill={[
                                                    "#8884d8",
                                                    "#82ca9d",
                                                    "#ffc658",
                                                    "#ff8042",
                                                    "#8dd1e1",
                                                    "#a4de6c",
                                                    "#d0ed57",
                                                    "#d8854f"
                                                ][idx % 8]}
                                            />
                                        ))}
                                    </Bar>
                                    <Tooltip />

                                    <XAxis dataKey="name" />
                                    <YAxis />
                                </BarChart>
                            </div>
                        </div>
                    </div>

                </>
            )
            }

        </div >
    );
};

export default ManageUsers;