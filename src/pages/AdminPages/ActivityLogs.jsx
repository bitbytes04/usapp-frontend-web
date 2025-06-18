import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('timestamp');
    const [sortOrder, setSortOrder] = useState('desc');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get('https://usapp-backend.vercel.app/api/admin/activity-logs');
            setLogs(Array.isArray(res.data.logs) ? res.data.logs : []);
        } catch (err) {
            setLogs([]);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };


    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const filteredLogs = logs
        .filter(log =>
            Object.values(log)
                .join(' ')
                .toLowerCase()
                .includes(search.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'timestamp') {
                const getMillis = (ts) => {
                    if (ts && typeof ts === 'object' && '_seconds' in ts) {
                        return ts._seconds * 1000 + Math.floor((ts._nanoseconds || 0) / 1e6);
                    }
                    return new Date(ts).getTime();
                };
                const millisA = getMillis(a.timestamp);
                const millisB = getMillis(b.timestamp);
                return sortOrder === 'asc' ? millisA - millisB : millisB - millisA;
            } else {
                if (a[sortBy] < b[sortBy]) return sortOrder === 'asc' ? -1 : 1;
                if (a[sortBy] > b[sortBy]) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            }
        });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 15;

    // Calculate paginated logs
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="p-6 bg-[#fff6eb] min-h-screen w-full">
            <h2 className="text-2xl font-bold w-full mb-6 text-gray-800">Activity Logs</h2>
            <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={handleSearch}
                className="mb-6 p-2 w-full border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
            ) : (
                <div className="overflow-x-auto ">
                    <table className="min-w-full bg-white border border-gray-200 rounded shadow">
                        <thead>
                            <tr className="bg-gray-100">
                                <th
                                    onClick={() => handleSort('timestamp')}
                                    className="py-3 px-4 cursor-pointer text-left font-semibold text-gray-700 select-none"
                                >
                                    Timestamp {sortBy === 'timestamp' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th
                                    onClick={() => handleSort('action')}
                                    className="py-3 px-4 cursor-pointer text-left font-semibold text-gray-700 select-none"
                                >
                                    Action {sortBy === 'action' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th
                                    onClick={() => handleSort('details')}
                                    className="py-3 px-4 cursor-pointer text-left font-semibold text-gray-700 select-none"
                                >
                                    Details {sortBy === 'details' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                                <th
                                    onClick={() => handleSort('userId')}
                                    className="py-3 px-4 cursor-pointer text-left font-semibold text-gray-700 select-none"
                                >
                                    User ID {sortBy === 'userId' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-6 text-center text-gray-500">No logs found.</td>
                                </tr>
                            ) : (
                                currentLogs.map(log => {
                                    // Convert Firestore timestamp to JS Date
                                    let dateObj;
                                    if (log.timestamp && typeof log.timestamp === 'object' && '_seconds' in log.timestamp) {
                                        dateObj = new Date(log.timestamp._seconds * 1000 + Math.floor((log.timestamp._nanoseconds || 0) / 1e6));
                                    } else {
                                        dateObj = new Date(log.timestamp);
                                    }
                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50 transition">
                                            <td className="py-2 px-4 border-t">{dateObj.toLocaleString()}</td>
                                            <td className="py-2 px-4 border-t">{log.action}</td>
                                            <td className="py-2 px-4 border-t">{log.details}</td>
                                            <td className="py-2 px-4 border-t">{log.userId}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-4 space-x-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`px-3 py-1 rounded border ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded border bg-gray-100 text-gray-700 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityLogs;