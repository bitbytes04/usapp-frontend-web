import React, { use, useEffect, useState } from "react";
import axios from "axios";
import { Transition } from "@headlessui/react";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from 'recharts';



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
    const [deleting, setdeleting] = useState(false);
    const [boardLogs, setboardLogs] = useState([]);
    const [wordFrequencyInput, setwordFrequencyInput] = useState('');
    const [StartDate, setStartDate] = useState('');
    const [EndDate, setEndDate] = useState('');
    const [StatNumber, setStatNumber] = useState(10);
    const [wordFrequencyWords, setwordFrequencyWords] = useState([]);
    const [topButtonStats, settopButtonStats] = useState([]);
    const [IsLogsLoading, setIsLogsLoading] = useState(false);
    const [buttonSearchTerm, setButtonSearchTerm] = useState('');
    const [buttonSearchResult, setButtonSearchResult] = useState(null);
    const [IncludeAIReport, setIncludeAIReport] = useState(false);
    const [AIReport, setAIReport] = useState("");
    const [reportLoading, setReportLoading] = useState(false);
    const [reportContent, setReportContent] = useState("");
    const [logCount, setlogCount] = useState(0);
    const [IsGenerating, setIsGenerating] = useState(false);


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

    const loadLineChart = () => {
        const allDates = {};
        wordFrequencyWords.forEach(word => {
            getWordFrequencyPerDay(boardLogs, [word]).forEach(({ date, count }) => {
                if (!allDates[date]) allDates[date] = {};
                allDates[date][word] = count;
            });
        });
        return Object.entries(allDates)
            .map(([date, counts]) => {
                const entry = { date };
                wordFrequencyWords.forEach(word => {
                    entry[word] = counts[word] || 0;
                });
                return entry;
            })
            .sort((a, b) => a.date.localeCompare(b.date));
    }
    // Fetch linked users
    useEffect(() => {
        fetchLinkedUsers();
    }, []);


    useEffect(() => {

        getBoardLogsDateRange(boardLogs);
        setStartDate(getBoardLogsDateRange(boardLogs).earliest);
        setEndDate(getBoardLogsDateRange(boardLogs).latest);

    }, [boardLogs]);

    const generateLineChart = () => {
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
    }
    const getButtonPressCountPerLog = (logs, startDate, endDate) => {
        if (!Array.isArray(logs)) return [];
        const dailyCounts = {};
        logs
            .filter(log => {
                const logDate = new Date(log.timestamp || log.date || log.createdAt);
                if (startDate && logDate < new Date(startDate)) return false;
                if (endDate && logDate > new Date(new Date(endDate).setHours(23, 59, 59, 999))) return false;
                return true;
            })
            .forEach(log => {
                const dateStr = (new Date(log.timestamp || log.createdAt)).toISOString().slice(0, 10);
                let count = 0;
                if (Array.isArray(log.buttonPresses)) {
                    log.buttonPresses.forEach(bp => {
                        count += bp.count || 1;
                    });
                }
                dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + count;
            });
        return Object.entries(dailyCounts)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    };

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
        // Convert to sorted array for recharts
        return Object.entries(freqMap)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    };

    const getBoardLogsDateRange = (logs) => {
        if (!Array.isArray(logs) || logs.length === 0) return { earliest: null, latest: null };
        const dates = logs
            .map(log => new Date(log.timestamp || log.date || log.createdAt))
            .filter(date => !isNaN(date));
        if (dates.length === 0) return { earliest: null, latest: null };
        dates.sort((a, b) => a - b);
        return {
            earliest: dates[0].toISOString().slice(0, 10),
            latest: dates[dates.length - 1].toISOString().slice(0, 10)
        };
    };

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

    const getLogCount = (logs, startDate, endDate) => {
        console.log("Calculating log count with", { logs, startDate, endDate });
        if (!Array.isArray(logs)) return 0;
        let filteredLogs = logs;
        if (startDate) {
            filteredLogs = filteredLogs.filter(log => {
                const logDate = new Date(log.timestamp || log.date || log.createdAt);
                return logDate >= new Date(startDate);
            });
        }
        if (endDate) {
            filteredLogs = filteredLogs.filter(log => {
                const logDate = new Date(log.timestamp || log.date || log.createdAt);
                return logDate <= new Date(new Date(endDate).setHours(23, 59, 59, 999));
            });
        }
        return filteredLogs.length;
    };

    const getTopButtonStats = (logs, topN) => {
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


    useEffect(() => {
        settopButtonStats(getTopButtonStats(boardLogs, StatNumber).top);
        generateLineChart();
    }, [boardLogs, StartDate, EndDate, StatNumber]);


    useEffect(() => {
        console.log("Board Logs", boardLogs);
    }, [boardLogs]);

    useEffect(() => {
        const fetchBoardUsageSummary = async () => {
            try {
                setIsLogsLoading(true);
                await axios.get(`https://usapp-backend.vercel.app/api/slp/board-usage-summary/${SelectedUser.userId}/`).then(
                    res => {
                        setboardLogs(res.data.boardLogs || [])
                    }
                )


            } catch (err) {
                console.error("Failed to fetch board usage summary", err);

            } finally {
                setIsLogsLoading(false);
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
        setdeleting(true);
        if (!window.confirm("Remove this linked user?")) return;
        try {
            await axios.post(`https://usapp-backend.vercel.app/api/slp/remove-link/${sessionStorage.getItem("slpId")}/${linkedUserId}`);
            setLinkedUsers((prev) => prev.filter((u) => u.userId !== linkedUserId));
            fetchLinkedUsers(); // Refresh linked users
        } catch (err) {
            alert(err.response?.data?.error || "Failed to remove linked user.");
        }
        finally {
            setdeleting(false);
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


    const LoadButtonReport = async () => {
        const data = `start date: ${StartDate} end date: ${EndDate}` + "Frequency Date:" + JSON.stringify(loadLineChart()) + "Top Buttons:" + JSON.stringify(topButtonStats)
        console.log(loadLineChart());
        if (IncludeAIReport) {
            try {
                await generateWrittenReport(data);

            } catch (err) {
                console.log("Error generating AI report:", err);
            }
        } else {
            generateTopButtonPressesReport();
        }
    }

    // AI Report Generation
    const generateWrittenReport = async (data) => {

        console.log('Generating report with data:', data);

        if (!IncludeAIReport) return;
        else {
            try {
                setIsGenerating(true);
                if (!data || typeof data !== 'string' || data.trim() === '') {
                    throw new Error("No valid string data provided for report generation.");
                }
                const response = await axios.post('https://usapp-backend.vercel.app/api/admin/generate-written-report', { data });
                if (response.data && response.data.success) {
                    setAIReport(response.data.report);
                    generateTopButtonPressesReport(response.data.report);
                } else {
                    throw new Error(response.data.message || "Failed to generate report.");
                }
            } catch (error) {
                throw new Error(error.message || "Error generating written report.");
            } finally {
                setIsGenerating(false)
            }
        }
    };



    const generateTopButtonPressesReport = async (AIReport) => {
        const date = new Date().toLocaleString();
        let reportWindow = window.open('UsApp Usage Report', '_blank');
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
        const wfWords = wordFrequencyWords.length ? wordFrequencyWords : ['yes', 'no'];
        const allDates = {};
        wfWords.forEach(word => {
            getWordFrequencyPerDay(boardLogs, [word]).forEach(({ date, count }) => {
                if (!allDates[date]) allDates[date] = {};
                allDates[date][word] = count;
            });
        });
        const sortedDates = Object.keys(allDates).sort();
        const wordFreqChartData = [
            ['Date', ...wfWords],
            ...sortedDates.map(date => [
                date,
                ...wfWords.map(word => allDates[date][word] || 0)
            ])
        ];

        // ButtonPressesperlog line chart data
        const buttonPressesPerLogData = [
            ['Date', 'Total Button Presses'],
            ...getButtonPressCountPerLog(boardLogs, StartDate, EndDate).map(({ date, count }) => [date, count])
        ];

        // Remarks table
        const remarksRows = remarks.length
            ? remarks.map(r =>
                `<tr>
                    <td>${r.title}</td>
                    <td>${r.remark}</td>
                    <td>${r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</td>
                </tr>`
            ).join('')
            : `<tr><td colspan="3" style="text-align:center;">No remarks found.</td></tr>`;

        const html = `
            <html>
            <head>
                <title>Top Button Presses Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; display:flex; flex-direction:column; text-align:justify;  }
                    h1, h2 { color: #1e293b; }
                    table { border-collapse: collapse; width: 100%; flex:1 !important;}
                    th, td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
                    th { background: #f1f5f9; }
                    .chart-container { display: flex; flex-wrap: wrap; gap: 40px; padding:20px; page-break-inside: avoid; page-break-after: auto; }
                    .chart-box { width: 100%; max-width: 900px; margin-bottom: 40px; }
                    .topbuttons{ display: flex !important; gap: 10px !important; margin-bottom: 20px; flex-direction:row;  }
                    .remarks-table { margin-top: 30px; }
                    @media print {
                        .topbuttons{ display: flex !important; gap: 10px !important; margin-bottom: 20px; flex-direction:row;  }
                        table { border-collapse: collapse; width: 100%; flex:1 !important;}
                        .chart-box { width: 100%; max-width: 900px; margin-bottom: 40px; flex:1 !important; }
                    }
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
                                width: 400,
                                height: 400,
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

                            // ButtonPressesperlog Line Chart
                            var buttonPressesPerLogChartData = google.visualization.arrayToDataTable(${JSON.stringify(buttonPressesPerLogData)});
                            var buttonPressesPerLogOptions = {
                                title: 'Total Button Presses Per Day',
                                curveType: 'function',
                                legend: { position: 'top', maxLines: 3 },
                                height: 350,
                                hAxis: { title: 'Date' },
                                vAxis: { title: 'Total Button Presses', minValue: 0 }
                            };
                            var buttonPressesPerLogChart = new google.visualization.LineChart(document.getElementById('buttonPressesPerLogLineChart'));
                            buttonPressesPerLogChart.draw(buttonPressesPerLogChartData, buttonPressesPerLogOptions);
                        }
                    }
                </script>
            </head>
            <body>
                <h1>UsApp Usage Report</h1>
                <div>
                    <p><strong>Data Date Range: </strong>${StartDate || 'N/A'} to ${EndDate || 'N/A'}</p>  
                    <p><strong>Generated:</strong> ${date}</p>
                </div>
                ${(IncludeAIReport && AIReport) ? `
                    <div>
                        <h2>Generated Analysis</h2>
                        <p>${AIReport.replace(/\n/g, '<br/>')}</p>
                    </div>
                ` : ''}
                <div class="topbuttons">    
                    <div class="chart-box" style="align-self:center;">
                        <table>
                            <thead><tr><th>Button</th><th>Presses</th></tr></thead>
                            <tbody>${buttonStatsRows}</tbody>
                        </table>
                    </div>
                    <div class="chart-box" style="align-self:center; flex:1 !important;">
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
                <div class="chart-container">
                    <div class="chart-box" style="align-self:center;">
                        <div id="buttonPressesPerLogLineChart"></div>
                    </div>
                </div>
                <div class="remarks-table">
                    <h2>Remarks</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Remark</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${remarksRows}
                        </tbody>
                    </table>
                </div>
                <footer style="margin-top:20px; font-size:15px; color:#666;">Generated by UsApp SPL User</footer>
            </body>
            </html>
        `;
        reportWindow.document.write(html);
        reportWindow.document.close();
        reportWindow.focus();
        setTimeout(() => { reportWindow.print(); }, 500);
    };

    // REMARKS FEATURE

    const [remarks, setRemarks] = useState([]);
    const [remarkTitle, setRemarkTitle] = useState("");
    const [remarkText, setRemarkText] = useState("");
    const [remarksLoading, setRemarksLoading] = useState(false);
    const [postingRemark, setPostingRemark] = useState(false);
    const [remarkError, setRemarkError] = useState("");
    const [remarkSuccess, setRemarkSuccess] = useState("");
    const [deletingRemarkId, setDeletingRemarkId] = useState(null);
    const [IsPostingRemark, setIsPostingRemark] = useState(false);

    // Fetch remarks for selected user
    const fetchRemarks = async () => {
        if (!SelectedUser.userId) return;
        setRemarksLoading(true);
        setRemarkError("");
        try {
            const res = await axios.get(
                `https://usapp-backend.vercel.app/api/slp/${sessionStorage.getItem('slpId')}/linked-users/${SelectedUser.userId}/remarks`
            );
            setRemarks(res.data.remarks || []);
        } catch (err) {
            setRemarkError(err.response?.data?.error || "Failed to fetch remarks.");
            setRemarks([]);
        }
        setRemarksLoading(false);
    };

    // Post a new remark
    const postRemark = async (e) => {
        e.preventDefault();
        setPostingRemark(true);
        setRemarkError("");
        setRemarkSuccess("");
        if (!remarkTitle.trim()) {
            setRemarkError("Title is required.");
            setPostingRemark(false);
            return;
        }
        if (!remarkText.trim()) {
            setRemarkError("Remark is required.");
            setPostingRemark(false);
            return;
        }
        try {
            await axios.post(
                `https://usapp-backend.vercel.app/api/slp/${sessionStorage.getItem('slpId')}/linked-users/${SelectedUser.userId}/remark`,
                { title: remarkTitle, remark: remarkText }
            );
            setRemarkSuccess("Remark posted.");
            setRemarkTitle("");
            setRemarkText("");
            fetchRemarks();
        } catch (err) {
            setRemarkError(err.response?.data?.error || "Failed to post remark.");
        }
        setPostingRemark(false);
    };

    // Delete a remark
    const deleteRemark = async (remarkId) => {
        if (!window.confirm("Delete this remark?")) return;
        setDeletingRemarkId(remarkId);
        setRemarkError("");
        setRemarkSuccess("");
        try {
            await axios.delete(
                `https://usapp-backend.vercel.app/api/slp/${sessionStorage.getItem('slpId')}/linked-users/${SelectedUser.userId}/remarks/${remarkId}`
            );
            setRemarkSuccess("Remark deleted.");
            fetchRemarks();
        } catch (err) {
            setRemarkError(err.response?.data?.error || "Failed to delete remark.");
        }
        setDeletingRemarkId(null);
    };

    // Fetch remarks when SelectedUser changes
    useEffect(() => {
        if (SelectedUser.userId) {
            fetchRemarks();
        } else {
            setRemarks([]);
        }
    }, [SelectedUser]);


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
                <div>
                    <label className="font-medium mr-2">Search by name or email:</label>
                    <input
                        className="border rounded px-3 py-2 w-full max-w-xs"
                        placeholder="Search by name or email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    className="ml-2 bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
                    onClick={() => setshowLinkingPopUp(true)}
                > Send Link Request</button>
                <Transition
                    show={IsGenerating}
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
                                    <span className="text-lg font-semibold text-gray-700">Generating Report...</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </Transition>
                <Transition
                    show={IsPostingRemark}
                    enter="transition-opacity duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    className="z-20"
                >
                    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md backdrop-brightness-50 animate-fade-in">
                        <div className="p-6 flex flex-col justify-center w-[80%] items-center backdrop-blur-md backdrop-brightness-50 max-w-[600px]">
                            <div className="fixed inset-0 z-50 w-full flex items-center justify-center">
                                <div className="bg-white w-full   px-8 py-6 rounded-lg flex flex-col items-center shadow-lg">
                                    <form onSubmit={postRemark} className="flex w-full flex-col gap-2 mb-4">
                                        <h2 className="text-xl font-semibold mb-4">Post Remark</h2>
                                        <label className="font-medium">Title<span className="text-red-600">*</span></label>
                                        <input
                                            type="text"
                                            placeholder="Title"
                                            value={remarkTitle}
                                            onChange={e => setRemarkTitle(e.target.value)}
                                            className="border rounded px-3 py-2"
                                            disabled={postingRemark}
                                        />
                                        <label className="font-medium">Remark<span className="text-red-600">*</span></label>
                                        <textarea
                                            placeholder="Write your remark..."
                                            value={remarkText}
                                            onChange={e => setRemarkText(e.target.value)}
                                            className="border rounded px-3 py-2"
                                            rows={3}
                                            disabled={postingRemark}
                                        />
                                        <button
                                            type="submit"
                                            className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 disabled:opacity-50"
                                            disabled={postingRemark}
                                        >
                                            {postingRemark ? "Posting..." : "Post Remark"}
                                        </button>
                                        {remarkError && <span className="text-red-500 text-sm">{remarkError}</span>}
                                        {remarkSuccess && <span className="text-green-600 text-sm">{remarkSuccess}</span>}
                                        <button

                                            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-blue-800 disabled:opacity-50"
                                            onClick={() => setIsPostingRemark(false)}
                                        >CANCEL</button>
                                    </form>
                                </div>
                            </div>

                        </div>
                    </div>
                </Transition>
                <Transition
                    show={deleting}
                    enter="transition-opacity duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-50 bg-opacity-40">
                        <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
                            <svg className="animate-spin h-8 w-8 text-blue-900 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            <span className="text-blue-900 font-semibold text-lg">removing linked user...</span>
                        </div>
                    </div>
                </Transition>
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
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md backdrop-brightness-50 animate-fade-in">
                    <div className="p-6 flex flex-col justify-center items-center backdrop-blur-md backdrop-brightness-50 w-80">
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="bg-white px-8 py-6 rounded-lg flex flex-col items-center shadow-lg">
                                <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                                <span className="text-lg font-semibold text-gray-700">Loading...</span>
                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border rounded shadow">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border-b">No.</th>
                                    <th className="px-4 py-2 border-b">First Name</th>
                                    <th className="px-4 py-2 border-b">Last Name</th>
                                    <th className="px-4 py-2 border-b">Email</th>
                                    <th className="px-4 py-2 border-b">Board Preference</th>

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
                                    pagedUsers.map((u, idx) => (
                                        <tr key={u.id}>
                                            <td className="px-4 py-2 border-b text-center">
                                                {idx + 1}
                                            </td>
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
                        {totalPages > 0 && (
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
                        <>
                            <h2 className="px-3 bg-blue-900 text-xl font-semibold mt-5 mb-2 text-white">LINKED USER INFO</h2>
                            <div className=" w-full bg-gray-50 border rounded shadow p-5">

                                <div className="flex flex-col xl:flex-row gap-4">
                                    <div className="flex-3">
                                        <div className="flex flex-col flex-3 h-full ">
                                            <h2 className="px-3 bg-blue-900 text-xl font-semibold mb-2 text-white text-center">ACCOUNT DATA & PREFERENCES</h2>
                                            <div className="p-2 border-2 border-gray-500 rounded shadow bg-white">
                                                <table className="min-w-full  bg-white rounded">
                                                    <tbody>
                                                        <tr className="border-b">
                                                            <td className="font-medium w-48">First Name:</td>
                                                            <td>{SelectedUser.userData.firstName || "-"}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="font-medium w-48">Last Name:</td>
                                                            <td>{SelectedUser.userData.lastName || "-"}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="font-medium w-48">Username:</td>
                                                            <td>{SelectedUser.userData.username || "-"}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="font-medium w-48">Email:</td>
                                                            <td>{SelectedUser.userData.email || "-"}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="font-medium w-48">User Type:</td>
                                                            <td>{SelectedUser.userData.userType || "-"}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="font-medium w-48">Age:</td>
                                                            <td>{SelectedUser.userData.age || "-"}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="font-medium w-48">Preferred Pitch:</td>
                                                            <td>{getPitchLabel(SelectedUser.userData.preferredPitch)}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="font-medium w-48">Board User Name:</td>
                                                            <td>{SelectedUser.userData.endName || "-"}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="font-medium w-48">Board User Age:</td>
                                                            <td>{SelectedUser.userData.endAge || "-"}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="font-medium w-48">Board Preference:</td>
                                                            <td>{SelectedUser.userData.boardPreference || "-"}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="font-medium w-48">Preferred Voice:</td>
                                                            <td>{getVoiceLabel(SelectedUser.userData.preferredVoice)}</td>
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="font-medium w-48">Preferred Speed:</td>
                                                            <td>{getSpeedLabel(SelectedUser.userData.preferredSpeed)}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                            </div>
                                            <h2 className="px-3 mt-4  flex-grow bg-blue-900 text-xl font-semibold mb-2 text-white text-center">Remarks</h2>
                                            <div className=" p-2 h-full border-2 border-gray-500 rounded shadow bg-white">

                                                <div className="flex flex-col h-96">

                                                    <div className="flex-grow overflow-y-auto bg-white p-2">
                                                        {remarksLoading ? (
                                                            <div className="flex items-center justify-center py-4">
                                                                <svg className="animate-spin h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                                </svg>
                                                                <span>Loading remarks...</span>
                                                            </div>
                                                        ) : remarks.length === 0 ? (
                                                            <div className="text-gray-500 text-center py-2">No remarks found.</div>
                                                        ) : (
                                                            <ul className="space-y-3">
                                                                {remarks.map(r => (
                                                                    <li key={r._id || r.id} className="border-b pb-2">
                                                                        <div className="flex justify-between items-center">
                                                                            <div>
                                                                                <span className="font-semibold text-sm">{r.title}</span>
                                                                                <span className="ml-2 text-xs text-gray-500">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ""}</span>
                                                                            </div>
                                                                            <button
                                                                                className="text-red-500 hover:text-white hover:bg-red-600 transition-all duration-500 px-2 py-1 text-xs rounded disabled:opacity-50"
                                                                                onClick={() => deleteRemark(r._id || r.id)}
                                                                                disabled={deletingRemarkId === (r._id || r.id)}
                                                                            >
                                                                                {deletingRemarkId === (r._id || r.id) ? "Deleting..." : "Delete"}
                                                                            </button>
                                                                        </div>
                                                                        <div className="mt-1 text-gray-700 whitespace-pre-line">{r.remark}</div>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                    <button
                                                        className="mt-3 bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800"
                                                        onClick={() => setIsPostingRemark(true)}
                                                    >ADD REMARK</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-5 flex-col gap-2 justify-start">
                                        <div>
                                            <h2 className="px-3 bg-blue-900 text-xl font-semibold mb-2 text-white text-center">BOARD USAGE DATA</h2>
                                        </div>
                                        <div className="flex flex-col items-center px-2 pb-4 flex-1 border-2 border-gray-500 pt-2 rounded ">

                                            <div className=":flex-row w-full justify-between pb-2 flex-col flex gap-2">

                                                <div className="flex-grow min-w-50 xl:border-r-1 xl:pr-4 border-b-1 xl:border-b-0 pb-2 xl:pb-0 border-r-white xl:border-r-black ">
                                                    <label className="self-start mb-1 text-gray-700 font-semibold">Data Display Limit</label>
                                                    <input
                                                        name='Chart Display Limit'
                                                        type="number"
                                                        min={1} max={15}
                                                        placeholder="Enter chart limit "
                                                        value={StatNumber}
                                                        onChange={e => { if (e.target.value > 15) { setStatNumber(15) } else if (e.target.value < 0) { setStatNumber(1) } else { setStatNumber(e.target.value) } }}
                                                        className="w-full py-2  px-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                    />


                                                </div>

                                                <div className="flex gap-2 flex-col md:flex-row justify-between items-center mb-4">
                                                    <div className="flex flex-grow flex-col">
                                                        <label className="text-sm font-semibold mb-1 text-gray-700">Start Date</label>
                                                        <input
                                                            type="date"
                                                            value={StartDate || ''}
                                                            onChange={e => setStartDate(e.target.value)}
                                                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        />
                                                    </div>
                                                    <div className="flex items-center pt-3 h-full justify-center">
                                                        <p className=" text-center self-center">-</p>
                                                    </div>
                                                    <div className="flex flex-grow flex-col">
                                                        <label className="text-sm font-semibold mb-1 text-gray-700">End Date</label>
                                                        <input
                                                            type="date"
                                                            value={EndDate || ''}
                                                            onChange={e => setEndDate(e.target.value)}
                                                            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                                        />
                                                    </div>
                                                </div>

                                            </div>
                                            <label className="self-start mb-1 text-gray-700 font-semibold">Specific Word Search:</label>
                                            <div className="flex w-full gap-2 min-h-15">

                                                <div className="flex flex-col flex-1">
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
                                                    <div className='p-3 flex-1 rounded text-center border-1 border-gray-200'>
                                                        {buttonSearchResult && (
                                                            <div className="text-md capitalize mt-2">
                                                                <span className="font-semibold">{buttonSearchResult.name}:</span> {buttonSearchResult.value} usage{buttonSearchResult.value === 1 ? '' : 's'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1 rounded border-gray-200 border-2">
                                                    {getLogCount(boardLogs, StartDate, EndDate) === 0 ? (
                                                        <div className="h-full w-full flex justify-center items-center p-3 text-center">
                                                            No logs found for the selected date range.
                                                        </div>) : (
                                                        <div className="p-3 text-center">
                                                            <span className="font-semibold">Total Logs:</span> {getLogCount(boardLogs, StartDate, EndDate)}
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                            <button
                                                className="mt-4 px-4 py-2 bg-blue-900 w-full text-white rounded hover:bg-blue-700"
                                                onClick={LoadButtonReport}
                                            >GENERATE REPORT</button>
                                            <div className="flex items-center self-start ml-2 mt-2 gap-2">

                                                <input
                                                    type="checkbox"
                                                    id="includeAIReport"
                                                    checked={IncludeAIReport}
                                                    onChange={e => setIncludeAIReport(e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                                <label htmlFor="includeAIReport" className="text-sm md:text-md font-semibold text-gray-700">
                                                    Include AI-Assisted Analysis
                                                </label>
                                            </div>

                                        </div >

                                        <div className="flex flex-row mt-3 max-h-100 gap-2">
                                            <div className="flex-1 flex-col flex  border-2 border-gray-500 rounded-md shadow-md p-2">

                                                {
                                                    IsLogsLoading ? (
                                                        <div className="h-full w-full flex justify-center items-center">
                                                            <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                            </svg>

                                                        </div>
                                                    ) : (
                                                        <ResponsiveContainer width="100%">
                                                            <PieChart className='z-0'>
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
                                                        </ResponsiveContainer>
                                                    )
                                                }
                                            </div>
                                            <div className="flex-1 min-h-90 border-2 border-gray-500 p-2 overflow-y-auto rounded-md shadow-md">
                                                {
                                                    IsLogsLoading ? (
                                                        <div className="h-full w-full flex justify-center items-center">
                                                            <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                            </svg>

                                                        </div>
                                                    ) : (
                                                        <table className="min-w-full bg-white border rounded shadow">
                                                            <thead>
                                                                <tr className="border-y-1">
                                                                    <th className="px-2 py-1  text-left">Button</th>
                                                                    <th className="px-2 py-1  text-left">Press Count</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="">
                                                                {topButtonStats.length === 0 ? (
                                                                    <tr>
                                                                        <td colSpan={2} className="text-center py-2">No data</td>
                                                                    </tr>
                                                                ) : (
                                                                    topButtonStats.map((stat, idx) => (
                                                                        <tr key={stat.name}>
                                                                            <td className="px-2 border-y-1 py-1 ">{stat.name}</td>
                                                                            <td className="px-2 border-y-1 py-1 ">{stat.value}</td>
                                                                        </tr>
                                                                    ))
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    )
                                                }
                                            </div>

                                        </div>


                                    </div >

                                </div >
                                <div className="flex-1 min-h-90 border-2 mt-3 flex flex-col justify-center items-center border-gray-500 p-2 overflow-hidden rounded-md shadow-md">
                                    <h1 className="font-bold text-white bg-teal-800 w-full text-center py-1">TOP WORDS FREQUENCY PER DAY</h1>
                                    <div className="flex flex-col md:flex-row gap-2 mt-2 w-full items-end border-2 border-gray-300 rounded py-5 pt-3 justify-center mb-3">
                                        <div className='flex flex-col'>
                                            <label className='text-sm font-semibold ml-2'>Search Frequency Data of Specific Words:</label>
                                            <input
                                                type="text"
                                                placeholder="Enter comma-separated words (e.g. Mama,Papa,hello)"
                                                value={wordFrequencyInput}
                                                onChange={e => setwordFrequencyInput(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-96"
                                            />
                                        </div>
                                        <button
                                            className="px-4 py-2 bg-indigo-700 text-sm md:text-md font-bold text-white rounded hover:bg-blue-700"
                                            onClick={generateLineChart}
                                        >
                                            Show Frequency
                                        </button>

                                    </div>

                                    {
                                        IsLogsLoading ? (
                                            <div className="h-full w-full flex justify-center items-center">
                                                <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                </svg>

                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <LineChart
                                                    width={1000}
                                                    height={300}
                                                    data={loadLineChart()}
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
                                            </ResponsiveContainer>
                                        )
                                    }
                                </div>
                                <div className="flex-1 min-h-90 border-2 mt-3 flex flex-col justify-center items-center border-gray-500 p-2 overflow-y-auto rounded-md shadow-md">
                                    <h1 className="font-bold text-blue-900">TOTAL WORD FREQUENCY PER DAY</h1>
                                    {
                                        IsLogsLoading ? (
                                            <div className="h-full w-full flex justify-center items-center">
                                                <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                </svg>

                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <LineChart
                                                    width={1000}
                                                    height={250}
                                                    data={getButtonPressCountPerLog(boardLogs, StartDate, EndDate)}
                                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                                >
                                                    <XAxis dataKey="date" />
                                                    <YAxis allowDecimals={false} />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="count"
                                                        stroke="#8884d8"
                                                        strokeWidth={2}
                                                        dot={{ r: 3 }}
                                                        name="Total Button Presses"
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        )
                                    }
                                </div>
                                <button
                                    className="mt-6 bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                                    onClick={() => setSelectedUser({})}
                                >
                                    Close
                                </button>
                            </div >
                        </>
                    )}
                </>
            )}
        </div >
    );
};

export default LinkedUsers;