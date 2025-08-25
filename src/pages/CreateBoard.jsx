import React, { useState, useEffect } from 'react';
import { ArrowBigLeft } from 'lucide-react';
import axios from 'axios';
import { Transition } from '@headlessui/react';

export default function CreateBoard() {
    const [boardName, setBoardName] = useState('');
    const [boardCategory, setBoardCategory] = useState('');
    const [selectedButtons, setSelectedButtons] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [Loading, setLoading] = useState();
    const [testButtons, setTestButtons] = useState([]);
    const [UserData, setUserData] = useState();
    const [submitting, setSubmitting] = useState(false);
    const [showErrorMessage, setshowErrorMessage] = useState(false);
    const [ErrorText, setErrorText] = useState("");


    const showError = (message) => {
        setErrorText(message);
        setshowErrorMessage(true);
    };

    useEffect(() => {
        const fetchButtonsAndUserData = async () => {
            setLoading(true);
            try {
                const [defaultRes, userRes, userDataRes] = await Promise.all([
                    axios.get('https://usapp-backend.vercel.app/api/default/buttonsall'),
                    axios.get(`https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}/userbuttons`),
                    axios.get(`https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}`)
                ]);
                setTestButtons([
                    ...(defaultRes.data.buttons || []),
                    ...(userRes.data || [])
                ]);
                setUserData({ ...userDataRes.data, userId: userDataRes.data.userId });
            } catch (error) {
                showError('Failed to load buttons or user data.');
            } finally {
                setLoading(false);
            }
        };
        fetchButtonsAndUserData();
    }, []);

    const filteredButtons = testButtons.filter(button =>
        button.buttonName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async () => {
        if (!boardName || !boardCategory || selectedButtons.length < 5) {
            showError('Please fill in all required fields and select at least 5 button.');
            return;
        }

        const buttonIds = selectedButtons.map(button => button.id);

        setSubmitting(true);
        try {
            const response = await axios.post(`https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}/boards`, {
                boardName,
                isFavorite: false,
                buttonIds,
                boardCategory
            });

            console.log(response);
            window.alert('Success', 'Board created successfully!');
            setBoardName('');
            setBoardCategory('');
            setSelectedButtons([]);


        } catch (error) {
            console.error('Error creating board:', error);
            window.alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectButton = (button) => {
        const isSelected = selectedButtons.find(b => b.buttonName === button.buttonName);
        if (isSelected) {
            setSelectedButtons(prev => prev.filter(b => b.buttonName !== button.buttonName));
        } else {
            if (selectedButtons.length >= 40) {
                showError('You can select up to 40 buttons only.');
                return;
            }
            setSelectedButtons(prev => [...prev, button]);
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'People': return '#FACC15'; // yellow-400
            case 'Actions': return '#EF4444'; // red-500
            case 'Feelings': return '#22C55E'; // green-500
            case 'Things': return '#3B82F6'; // blue-500
            case 'Places': return '#8B5CF6';
            case 'Nouns': return '#FFA332'; // orange
            case 'Pronouns': return '#FFE777'; // light yellow
            case 'Verbs': return '#A3E264'; // light green
            case 'Adjectives': return '#63C4FF'; // sky blue
            case 'Prepositions & Social Words': return '#FF84C1'; // light pink
            case 'Questions': return '#B28BFF'; // lavender
            case 'Negation & Important Words': return '#FF4747'; // bright red
            case 'Adverbs': return '#B98A6A'; // brown/tan
            case 'Conjunctions': return '#FFFFFF'; // white
            case 'Determiners': return '#595959'; // dark gray
            default: return '#D3D3D3'; // fallback light gray// purple-500
        }
    };



    return (
        <div className="min-h-screen w-full p-6 flex flex-col">
            <Transition
                show={showErrorMessage && !!ErrorText}
                enter="transition-opacity duration-500"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-500"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md backdrop-brightness-50 animate-fade-in z-50">
                    <div className="bg-white p-6 rounded-lg flex flex-col justify-center items-center shadow-lg w-80">
                        <h2 className="text-xl font-bold mb-4 text-[#feaf61]">Error</h2>
                        <p className="mb-6 text-center text-gray-700">{ErrorText}</p>
                        <button
                            onClick={() => {
                                setshowErrorMessage(false);
                                setErrorText('');
                            }}
                            className="w-full bg-[#5c7c93] text-white py-2 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Transition>
            <Transition
                show={submitting}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 bg-opacity-30">
                    <div className="bg-white rounded-xl p-8 flex flex-col items-center shadow-2xl">
                        <svg className="animate-spin h-10 w-10 text-blue-700 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span className="text-lg font-medium text-blue-700">Creating board...</span>
                    </div>
                </div>
            </Transition>
            <div className=" bg-blue-900 w-full flex items-center mb-6 p-2">
                <h1 className="text-3xl font-bold text-white mx-auto">CREATE A BOARD { }</h1>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow flex flex-col gap-4">
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">Board Name<span className='text-red-500'>*</span></label>
                    <input
                        type="text"
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                        placeholder="Enter board name"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">Board Category<span className='text-red-500'>*</span></label>
                    <select
                        value={boardCategory}
                        onChange={(e) => setBoardCategory(e.target.value)}
                        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                    >
                        <option value="">Select category</option>
                        <option value="Paaralan">Paaralan</option>
                        <option value="Bahay">Bahay</option>
                        <option value="Pagkain">Pagkain</option>
                        <option value="Kalusugan">Kalusugan</option>
                        <option value="Pamilya">Pamilya</option>
                        <option value="Pang-araw-araw na Gawain">Pang-araw-araw na Gawain</option>
                        <option value="Sarili">Sarili</option>
                        <option value="Laro at Libangan">Laro at Libangan</option>
                        <option value="Panahon at Kalikasan">Panahon at Kalikasan</option>
                    </select>
                </div>
            </div>
            <div className="mt-8">
                <h2 className="text-xl font-semibold text-blue-900 mb-3">Selected Buttons</h2>
                <div className="flex bg-white border border-gray-200 p-3 rounded-xl min-h-20 flex-row flex-wrap w-full gap-4">
                    {selectedButtons.map((button, index) => (
                        <div
                            key={index}
                            className={`relative cursor-pointer px-1 py-0 rounded-lg border ${getCategoryColor(button.buttonCategory)} bg-opacity-80 flex items-center`}
                        >
                            <div className='bg-white py-1 rounded-md'>
                                <span className="text-black ml-2 text-base uppercase font-bold ">{button.buttonName}</span>
                                {/* Delete icon */}
                                <button
                                    onClick={() => setSelectedButtons(prev => prev.filter((b, i) => i !== index))}
                                    className="ml-2 p-1 rounded"
                                    title="Remove"
                                    type="button"
                                >
                                    <span className='font-bold bg-white px-3  rounded-full text-red-600 hover:text-white hover:bg-red-600 py-1'>X</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {selectedButtons.length > 0 && (
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to clear all selected buttons?')) {
                                setSelectedButtons([]);
                            }
                        }}
                        className="bg-red-500 hover:bg-red-400 text-white font-medium py-2 px-4 rounded-lg mt-4 transition"
                    >
                        Clear All
                    </button>
                )}
            </div>
            <div>
                <h2 className="text-xl font-semibold text-blue-900 my-4">Select Buttons</h2>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search buttons..."
                    className="border border-gray-300 rounded-lg p-2 mb-4 w-full focus:outline-none focus:ring-2 bg-white focus:ring-blue-400 transition"
                />
                <div className="flex bg-white border border-gray-200 p-3 rounded-xl flex-row flex-wrap w-full justify-center gap-4 max-h-[350px] overflow-y-auto">
                    {Loading ? (
                        <div className="col-span-full w-full flex justify-center items-center py-16">
                            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                        </div>
                    ) : (
                        filteredButtons.map((button, index) => (
                            <div
                                key={index}
                                onClick={() => handleSelectButton(button)}
                                className={`relative cursor-pointer w-36 h-36 p-2 rounded-lg border-2 ${getCategoryColor(button.buttonCategory)} bg-opacity-80 flex flex-col items-center justify-center transition hover:scale-105 ${selectedButtons.some(b => b.buttonName === button.buttonName) ? 'border-black border-5' : 'border-transparent'
                                    }`}
                            >
                                {selectedButtons.some(b => b.buttonName === button.buttonName) && (
                                    <span className="absolute  -top-3 -right-3 bg-black rounded-full text-white text-xl px-3 py-1  font-extrabold shadow">&#x2713;</span>
                                )}
                                <img
                                    src={button.buttonImagePath || undefined}
                                    alt={button.buttonName}
                                    className="w-full h-11/12 object-contain overflow-hidden rounded mb-2 bg-white"
                                />
                                <div className="bg-white w-full text-center font-medium text-black py-1 text-base rounded">{button.buttonName}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-xl mt-8 w-full shadow transition"
            >
                CREATE BOARD
            </button>
        </div>
    );
}
