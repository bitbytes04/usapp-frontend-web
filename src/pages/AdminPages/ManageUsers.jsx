import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Transition } from '@headlessui/react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, LineChart, Line } from 'recharts';

const ManageUsers = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [slpUsers, setSlpUsers] = useState([]);
    const [boardLogs, setboardLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setisProcessing] = useState(false);
    const [wordFrequencyInput, setwordFrequencyInput] = useState('');
    const [StartDate, setStartDate] = useState('');
    const [EndDate, setEndDate] = useState('');
    const [StatNumber, setStatNumber] = useState(10);
    const [wordFrequencyWords, setwordFrequencyWords] = useState([]);

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

    const generateUserDistributionReport = () => {
        const date = new Date().toLocaleString();
        let reportWindow = window.open('', '_blank', 'width=900,height=700');
        if (!reportWindow) return;

        // User role distribution data
        const roleStats = Object.entries(
            allUsers.reduce((acc, user) => {
                const role = user.role || 'unknown';
                acc[role] = (acc[role] || 0) + 1;
                return acc;
            }, {})
        ).map(([role, value]) => ({ name: role, value }));

        const roleStatsRows = roleStats.map(
            stat => `<tr><td>${stat.name}</td><td>${stat.value}</td></tr>`
        ).join('');

        // Pie chart for roles
        const pieChartData = [
            ['Role', 'Count'],
            ...roleStats.map(stat => [stat.name, stat.value])
        ];

        const html = `
            <html>
            <head>
                <title>User Role Distribution Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    h1, h2 { color: #1e293b; }
                    table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
                    th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
                    th { background: #f1f5f9; }
                </style>
                <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
                <script type="text/javascript">
                    window.onload = function() {
                        google.charts.load('current', {'packages':['corechart']});
                        google.charts.setOnLoadCallback(drawChart);

                        function drawChart() {
                            var data = google.visualization.arrayToDataTable(${JSON.stringify(pieChartData)});
                            var options = {
                                title: 'User Role Distribution',
                                legend: { position: 'right' },
                                pieHole: 0.4,
                                width: 400,
                                height: 350
                            };
                            var chart = new google.visualization.PieChart(document.getElementById('rolePieChart'));
                            chart.draw(data, options);
                        }
                    }
                </script>
            </head>
            <body>
                <h1>User Role Distribution Report</h1>
                <p><strong>Generated:</strong> ${date}</p>
                <div id="rolePieChart"></div>
                <h2>User Role Distribution</h2>
                <table>
                    <thead><tr><th>Role</th><th>Count</th></tr></thead>
                    <tbody>${roleStatsRows}</tbody>
                </table>
            </body>
            </html>
        `;
        reportWindow.document.write(html);
        reportWindow.document.close();
        reportWindow.focus();
        reportWindow.print();
    };

    const generateTopButtonPressesReport = async () => {
        const date = new Date().toLocaleString();
        let reportWindow = window.open('UsApp Usage Report', '_blank',);
        if (!reportWindow) return;

        // Top button stats
        const buttonStatsRows = topButtonStats.map(
            stat => `<tr><td>${stat.name}</td><td>${stat.value}</td></tr>`
        ).join('');

        // Pie chart for top button presses
        const buttonPieChartData = [
            ['Button', 'Presses'],
            ...topButtonStats.map(stat => [stat.name, stat.value])
        ];
        // Bar chart for top button presses
        const buttonBarChartData = [
            ['Button', 'Presses'],
            ...topButtonStats.map(stat => [stat.name, stat.value])
        ];

        // Prepare word frequency data for Google Charts LineChart
        // Build columns: ['Date', 'word1', 'word2', ...]
        const wfWords = wordFrequencyWords.length ? wordFrequencyWords : ['yes', 'no'];
        // Build a map of date -> { word1: count, word2: count, ... }
        const allDates = {};
        wfWords.forEach(word => {
            getWordFrequencyPerDay(boardLogs, [word]).forEach(({ date, count }) => {
                if (!allDates[date]) allDates[date] = {};
                allDates[date][word] = count;
            });
        });
        // Fill missing words with 0
        const sortedDates = Object.keys(allDates).sort();
        const wordFreqChartData = [
            ['Date', ...wfWords],
            ...sortedDates.map(date => [
                date,
                ...wfWords.map(word => allDates[date][word] || 0)
            ])
        ];

        const html = `
            <html>
            <head>
                <title>Top Button Presses Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; display:flex; flex-direction:column;  }
                    h1, h2 { color: #1e293b; }
                    table { border-collapse: collapse; width: 100%; margin-bottom: 24px; }
                    th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
                    th { background: #f1f5f9; }
                    .chart-container { display: flex; flex-wrap: wrap; gap: 40px; padding:20px; page-break-inside: avoid; page-break-after: auto; }
                    .chart-box { width: 100%; max-width: 900px; margin-bottom: 40px; }
                </style>
                <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
                <script type="text/javascript">
                    window.onload = function() {
                        google.charts.load('current', {'packages':['corechart', 'bar']});
                        google.charts.setOnLoadCallback(drawCharts);

                        function drawCharts() {
                            // Button Pie Chart
                            var btnPieData = google.visualization.arrayToDataTable(${JSON.stringify(buttonPieChartData)});
                            var btnPieOptions = {
                                title: 'Top Button Presses (Pie)',
                                width: 700,
                                height: 500,
                                legend: { position: 'top', maxLines: 3 },
                                pieHole: 0.2,
                        
                            };
                            var btnPieChart = new google.visualization.PieChart(document.getElementById('buttonPieChart'));
                            btnPieChart.draw(btnPieData, btnPieOptions);

                            // Button Bar Chart
                            var btnBarData = google.visualization.arrayToDataTable(${JSON.stringify(buttonBarChartData)});
                            var btnBarOptions = {
                                title: 'Top Button Presses (Bar)',
                                legend: { position: 'none' },
                             
                                height: 500,
                                bars: 'vertical',
                                hAxis: { title: 'Button' },
                                vAxis: { title: 'Presses' }
                            };
                            var btnBarChart = new google.visualization.ColumnChart(document.getElementById('buttonBarChart'));
                            btnBarChart.draw(btnBarData, btnBarOptions);

                            // Word Frequency Line Chart
                            var wordFreqData = google.visualization.arrayToDataTable(${JSON.stringify(wordFreqChartData)});
                            var wordFreqOptions = {
                                title: 'Word Frequency Over Time',
                                curveType: 'function',
                                legend: { position: 'top', maxLines: 3 },
                               
                                height: 350,
                                hAxis: { title: 'Date' },
                                vAxis: { title: 'Frequency', minValue: 0 }
                            };
                            var wordFreqChart = new google.visualization.LineChart(document.getElementById('wordFreqLineChart'));
                            wordFreqChart.draw(wordFreqData, wordFreqOptions);
                        }
                    }
                </script>
            </head>
            <body>
                <h1>UsApp Usage Report</h1>
                <div>
                <h4>Date Range</h4>  
                <p><strong>Generated:</strong> ${date}</p>
                <p>${StartDate || 'N/A'} to ${EndDate || 'N/A'}</p>
                </div>
              
                    <table>
                        <thead><tr><th>Button</th><th>Presses</th></tr></thead>
                        <tbody>${buttonStatsRows}</tbody>
                    </table>
         
            
                <div class="chart-container">
                   <div class="chart-box" style="align-self:center;">
                        <div id="buttonPieChart"></div>
                    </div>
                </div>
                
                <div class="chart-container">
                   <div class="chart-box" style="align-self:center;">
                        <div id="buttonBarChart"></div>
                    </div>
                </div>
               
                 <div class="chart-container">
                   <div class="chart-box" style="align-self:center;">
                        <div id="wordFreqLineChart"></div>
                    </div>
                </div>
            
                <footer style="margin-top:20px; font-size:15px; color:#666;">Generated by UsApp Admin Panel: bitbytes.dev@gmail.com</footer>
            </body>
            </html>
        `;
        reportWindow.document.write(html);
        reportWindow.document.close();
        reportWindow.focus();
        setTimeout(() => { reportWindow.print(); }, 200);

    };

    /**
     * Generates daily frequency data for a word or group of words from boardLogs.
     * @param {Array} logs - The boardLogs array.
     * @param {string[]} words - Array of words to count (case-insensitive).
     * @returns {Array} - Array of { date: 'YYYY-MM-DD', count: number } for each day.
     */
    const getWordFrequencyPerDay = (logs, words) => {
        let searchWords = [];

        searchWords = words.map(w => w.toLowerCase());

        if (searchWords.length === 0) return [];
        // Map: date string => count
        const freqMap = {};
        logs.forEach(log => {
            const logDate = new Date(log.timestamp || log.date || log.createdAt);
            const dateStr = logDate.toISOString().slice(0, 10); // YYYY-MM-DD

            // Filter by StartDate and EndDate if provided
            if (StartDate && logDate < new Date(StartDate)) return;
            if (EndDate && logDate > new Date(new Date(EndDate).setHours(23, 59, 59, 999))) return;

            if (!Array.isArray(log.buttonPresses)) return;
            let count = 0;
            log.buttonPresses.forEach(bp => {
                const btnName = (bp.buttonId || bp.id || '').toString().toLowerCase();
                if (searchWords.some(word => btnName === word)) {
                    count += bp.count || 1;
                }
            });
            if (count > 0) {
                freqMap[dateStr] = (freqMap[dateStr] || 0) + count;
            }
        });
        console.log('Frequency Map:', freqMap);
        // Convert to sorted array for recharts
        return Object.entries(freqMap)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    };

    const getTopButtonStats = (logs, topN = 10) => {
        // Filter logs by StartDate and EndDate if provided
        let filteredLogs = logs;
        if (StartDate) {
            filteredLogs = filteredLogs.filter(log => {
                const logDate = new Date(log.timestamp || log.date || log.createdAt);
                return logDate >= new Date(StartDate);
            });
        }
        if (EndDate) {
            filteredLogs = filteredLogs.filter(log => {
                const logDate = new Date(log.timestamp || log.date || log.createdAt);
                // Add 1 day to EndDate to make it inclusive
                return logDate <= new Date(new Date(EndDate).setHours(23, 59, 59, 999));
            });
        }
        const stats = getButtonPressStats(filteredLogs);
        if (stats.length <= topN) return { top: stats, remaining: [] };
        const sorted = [...stats].sort((a, b) => b.value - a.value);
        const top = sorted.slice(0, topN);
        return {
            top: [...top],
            remaining: sorted.slice(topN)
        };
    };

    const { top: topButtonStats, remaining: remainingButtonStats } = getTopButtonStats(boardLogs, StatNumber);


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

                    </div>
                </div>
            </Transition>
            <h1 className="text-2xl font-bold mb-6 px-3 bg-blue-900 text-white">MONITOR USERS</h1>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
                <div className="flex flex-col flex-grow">
                    <label className="text-gray-700 font-semibold ml-2">Search & Filter:</label>
                    <input
                        type="text"
                        placeholder="Search by name, email, or UID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
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

                    <div className='overflow-x-auto shadow-xl mt-2'>



                        <div className="flex flex-col px-5 shadow-md rounded bg-white  mt-5 md:mt-0">

                            <div className="flex flex-col-reverse md:flex-row-reverse  overflow-x-auto">
                                <div className="border-2 border-gray-300 flex flex-col items-center justify-center rounded px-2 m-2">
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

                                <div className="border-2 border-gray-300 flex flex-col items-center justify-center rounded px-2 m-2">
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
                                        name='Chart Display Limit'
                                        type="number"
                                        min={1} max={15}
                                        placeholder="Enter chart limit "
                                        value={StatNumber}
                                        onChange={e => { if (e.target.value > 15) { setStatNumber(15) } else if (e.target.value < 0) { setStatNumber(1) } else { setStatNumber(e.target.value) } }}
                                        className="w-full py-2  px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />

                                    <h2 className="text-md font-semibold py-2 bg-cyan-700 text-white w-full text-center my-2">SEARCH BUTTON USAGE</h2>
                                    <div className="flex gap-5 flex-col md:flex-row justify-center items-center mb-4">
                                        <div className="flex flex-col">
                                            <label className="text-sm font-semibold mb-1 text-gray-700">Start Date</label>
                                            <input
                                                type="date"
                                                value={StartDate || ''}
                                                onChange={e => setStartDate(e.target.value)}
                                                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="text-sm font-semibold mb-1 text-gray-700">End Date</label>
                                            <input
                                                type="date"
                                                value={EndDate || ''}
                                                onChange={e => setEndDate(e.target.value)}
                                                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            />
                                        </div>
                                    </div>
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
                                    <button
                                        className="mt-4 px-4 py-2 bg-blue-900 w-full text-white rounded hover:bg-blue-700"
                                        onClick={generateTopButtonPressesReport}
                                    >Generate Report</button>


                                </div>

                            </div>
                            <h2 className="text-md font-semibold py-2 bg-teal-800 text-white w-full text-center my-2">TOP BUTTON PRESSES</h2>
                            <div className="flex flex-col items-center px-2 pb-4 flex-1 border-2 border-gray-300 rounded m-2 mt-6 overflow-x-auto">


                                <BarChart width={1000} height={300} data={topButtonStats}>
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
                            <h2 className="text-md font-semibold py-2 bg-[#bd6207] text-white w-full text-center my-2 ">Word Frequency Over Time</h2>
                            <div className="flex flex-col md:flex-row gap-2 mt-2 w-full items-center ml-2 justify-start">
                                <input
                                    type="text"
                                    placeholder="Enter comma-separated words (e.g. Mama,Papa,hello)"
                                    value={wordFrequencyInput}
                                    onChange={e => setwordFrequencyInput(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-96"
                                />
                                <button
                                    className="px-4 py-2 bg-indigo-700 text-sm md:text-md font-bold text-white rounded hover:bg-blue-700"
                                    onClick={() => {
                                        if (!wordFrequencyInput.trim()) {
                                            const stats = topButtonStats;
                                            const words = stats.slice(0, (StatNumber + 1)).map(stat => stat.name);
                                            setwordFrequencyWords(words.length ? words : ['yes', 'no']);
                                        }
                                        else {
                                            const words = wordFrequencyInput
                                                .split(',')
                                                .map(w => w.trim())
                                                .filter(Boolean);
                                            setwordFrequencyWords(words.length ? words : ['yes', 'no']);
                                        }
                                    }}
                                >
                                    Show Frequency
                                </button>
                            </div>
                            <div className="flex flex-col items-center px-2 pb-4 flex-1 border-2 border-gray-300 rounded m-2 mt-6">
                                <div className="w-full overflow-x-auto">
                                    <LineChart
                                        width={1000}
                                        height={300}
                                        data={(() => {
                                            // For each word, build a series of {date, [word]: count}
                                            // Merge all dates
                                            const allDates = {};
                                            wordFrequencyWords.forEach(word => {
                                                getWordFrequencyPerDay(boardLogs, [word]).forEach(({ date, count }) => {
                                                    if (!allDates[date]) allDates[date] = {};
                                                    allDates[date][word] = count;
                                                });
                                            });
                                            // Fill missing words with 0
                                            return Object.entries(allDates)
                                                .map(([date, counts]) => {
                                                    const entry = { date };
                                                    wordFrequencyWords.forEach(word => {
                                                        entry[word] = counts[word] || 0;
                                                    });
                                                    return entry;
                                                })
                                                .sort((a, b) => a.date.localeCompare(b.date));
                                        })()}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <XAxis dataKey="date" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        {wordFrequencyWords.map((word, idx) => (
                                            <Line
                                                key={word}
                                                type="monotone"
                                                dataKey={word}
                                                stroke={[
                                                    "#8884d8",
                                                    "#82ca9d",
                                                    "#ffc658",
                                                    "#ff8042",
                                                    "#8dd1e1",
                                                    "#a4de6c",
                                                    "#d0ed57",
                                                    "#d8854f"
                                                ][idx % 8]}
                                                strokeWidth={2}
                                                dot={{ r: 3 }}
                                            />
                                        ))}
                                    </LineChart>
                                </div>
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