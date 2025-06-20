import React, { useEffect, useState } from 'react'
import header from '../assets/backgrounds/header_background_img.png'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';



const MyBoards = () => {

    const [UserData, setUserData] = useState();
    const [Loading, setLoading] = useState();
    const [isDeleting, setisDeleting] = useState(false);
    const [UserBoards, setUserBoards] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    const [DisplayName, setDisplayName] = useState();
    const [Category, setCategory] = useState();
    const navigate = useNavigate();

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Paaralan': return '#FACC15'; // yellow-400
            case 'Bahay': return '#EF4444'; // red-500
            case 'Pagkain': return '#22C55E'; // green-500
            case 'Kalusugan': return '#3B82F6'; // blue-500
            case 'Pamilya': return '#8B5CF6'; // purple-500
            case 'Pang-araw-araw na Gawain': return '#FB923C'; // orange-400
            case 'Sarili': return '#A3E635'; // lime-400
            case 'Laro at Libangan': return '#F472B6'; // pink-400
            case 'Panahon at Kalikasan': return '#38BDF8'; // sky-400
            default: return '#D1D5DB'; // gray-300
        }
    };


    const filteredBoards = UserBoards
        ? UserBoards.filter(board => {
            const matchesSearch = board.boardName.toLowerCase().includes(searchTerm.toLowerCase());
            if (!Category || Category === "") {
                return matchesSearch;
            }
            return matchesSearch && board.boardCategory === Category;
        })
        : [];

    const fetchDefaultButtons = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}/userboards`);
            setUserBoards(response.data); // Assuming the response contains an array of buttons
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching default buttons:', error);
            window.alert('Error', 'Failed to fetch user boards');
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}`);
                setUserData({ ...response.data, userId: sessionStorage.getItem('userId') });
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };



        fetchDefaultButtons();
        fetchUserData();
    }, []);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [showPopup, setShowPopup] = useState(false);


    const handleEdit = () => {
        sessionStorage.setItem('boardId', selectedBoard.id);
        navigate('/editboard');
        setShowPopup(false);

    };

    const handleDelete = async (bid) => {
        setisDeleting(true);
        if (!selectedBoard || !UserData?.userId) {
            console.error('No board selected or user ID not found');
            return;
        };
        try {
            const response = await axios.post(
                `https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}/${bid}/deleteboard`,
            );
            console.log('Board deleted:', response.data);
            fetchDefaultButtons();

        } catch (error) {

        } finally {
            setShowPopup(false);
            fetchDefaultButtons();
            setisDeleting(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto flex flex-col items-center p-2 sm:p-5">
                <div className="bg-blue-900 w-full flex items-center mb-4 sm:mb-6 p-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mx-auto">MY BOARDS</h1>
                </div>
                <div className="w-full mb-6 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-0">
                    <input
                        type="text"
                        placeholder="Search boards..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 sm:px-5 sm:py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base sm:text-lg bg-white"
                    />
                    <select
                        value={Category || ''}
                        onChange={e => setCategory(e.target.value)}
                        className="sm:ml-4 px-4 py-2 sm:py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-base sm:text-lg bg-white mt-2 sm:mt-0"
                    >
                        <option value="">All Boards</option>
                        {UserBoards &&
                            [...new Set(UserBoards.map(board => board.boardCategory || ''))]
                                .filter(name => name)
                                .map((name, idx) => (
                                    <option key={idx} value={name}>
                                        {name}
                                    </option>
                                ))}
                    </select>
                </div>
                {isDeleting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center shadow-2xl">
                            <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            <span className="text-base sm:text-lg font-medium text-gray-700">Deleting board...</span>
                        </div>
                    </div>
                )}
                <div className="w-full max-h-[80dvh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {Loading ? (
                        <div className="col-span-full w-full flex justify-center items-center py-12 sm:py-16">
                            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                        </div>
                    ) : (
                        filteredBoards && filteredBoards.length > 0 ? (
                            filteredBoards.map((board, index) => (
                                <div key={index} className="relative group">
                                    <button
                                        onClick={e => {
                                            console.log(getCategoryColor(board.boardCategory));
                                            const rect = e.currentTarget.getBoundingClientRect();
                                            setSelectedBoard({
                                                ...board,
                                                popupPosition: {
                                                    top: rect.top + window.scrollY,
                                                    left: rect.right + 8 + window.scrollX
                                                }
                                            });
                                            setShowPopup(true);

                                        }}
                                        style={{ backgroundColor: getCategoryColor(board.boardCategory) }}
                                        className="rounded p-2 shadow-lg flex gap-2 flex-col items-center justify-center h-40 border w-45 hover:shadow-2xl transition group"
                                    >
                                        <div className='flex-grow bg-white rounded w-full'>

                                        </div>

                                        <div className="text-blue-900 bg-white font-semibold rounded text-base sm:text-lg text-center truncate w-full px-2">
                                            {board.boardName}
                                        </div>
                                    </button>
                                    {showPopup && selectedBoard && selectedBoard.boardName === board.boardName && (
                                        <div
                                            className="absolute z-50 bg-white rounded-xl shadow-xl p-3 sm:p-4 min-w-[140px] sm:min-w-[160px] flex flex-col gap-2 right-0 top-1/2 -translate-y-1/2 border border-gray-100"
                                        >
                                            <button
                                                onClick={handleEdit}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => { handleDelete(board.id) }}
                                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => setShowPopup(false)}
                                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full w-full text-center text-gray-500 py-12 sm:py-16 text-base sm:text-lg">
                                No boards found.
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBoards;