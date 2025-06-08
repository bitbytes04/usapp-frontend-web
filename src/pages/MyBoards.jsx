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
    const navigate = useNavigate();

    const filteredBoards = UserBoards
        ? UserBoards.filter(board =>
            board.boardName.toLowerCase().includes(searchTerm.toLowerCase())
        )
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
            <img className="w-full object-top h-15 " src={header} alt="Header Background" />
            <div className="container justify-center flex flex-col items-center mx-auto py-10 px-4">
                <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 drop-shadow-lg">
                    My Boards
                </h1>
                <input
                    type="text"
                    placeholder="Search boards..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="mb-6 w-11/12 px-4 py-2 border border-gray-300 rounded-lg outline-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                />
                {isDeleting && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-lg p-6 flex flex-col items-center shadow-lg">
                            <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            <span className="text-lg font-medium text-gray-700">Deleting board...</span>
                        </div>
                    </div>
                )}
                <div className="bg-white h-96 w-11/12 text-black p-6 rounded-lg shadow-lg border-dashed border-2 duration-300">
                    {
                        Loading ? (<></>) : (<>
                            <div className="flex flex-wrap justify-center items-center relative">
                                {filteredBoards && filteredBoards.map((board, index) => (
                                    <div key={index} className="relative m-1">
                                        <button
                                            onClick={e => {
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
                                            className="focus:outline-none"
                                        >
                                            <div className="w-[100px] h-[100px] p-2 rounded-lg flex flex-col items-center justify-center bg-blue-500">
                                                <div className="w-full h-1/2 bg-white rounded mb-2"></div>
                                                <div className="bg-white text-black font-semibold text-[18px] text-center w-full rounded px-1 flex-grow flex items-center justify-center">
                                                    {board.boardName}
                                                </div>
                                            </div>
                                        </button>
                                        {/* Inline popup for this board */}
                                        {showPopup && selectedBoard && selectedBoard.boardName === board.boardName && (
                                            <div
                                                className="absolute z-50 bg-white rounded shadow-lg p-2 min-w-[140px] flex flex-col gap-1"
                                                style={{
                                                    top: '50%',
                                                    left: '110%',
                                                    transform: 'translateY(-50%)',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                                                }}
                                            >
                                                <button
                                                    onClick={handleEdit}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => { handleDelete(board.id) }}
                                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => setShowPopup(false)}
                                                    className="bg-gray-300 text-black px-3 py-1 rounded hover:bg-gray-400 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>)
                    }
                </div>
            </div>
        </div>
    );
};

export default MyBoards;