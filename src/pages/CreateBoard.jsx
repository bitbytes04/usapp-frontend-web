import React, { useState } from 'react';
import { ArrowBigLeft } from 'lucide-react';

export default function CreateBoard() {
    const [boardName, setBoardName] = useState('');
    const [boardCategory, setBoardCategory] = useState('');
    const [selectedButtons, setSelectedButtons] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const testButtons = [
        { buttonCategory: "People", buttonImagePath: "images/mama.png", buttonName: "Mama" },
        { buttonCategory: "People", buttonImagePath: "images/papa.png", buttonName: "Papa" },
        { buttonCategory: "People", buttonImagePath: "images/ako.png", buttonName: "Ako" },
        { buttonCategory: "People", buttonImagePath: "images/ikaw.png", buttonName: "Ikaw" },
        { buttonCategory: "Actions", buttonImagePath: "images/kain.png", buttonName: "Kain" },
        { buttonCategory: "Actions", buttonImagePath: "images/inom.png", buttonName: "Inom" },
        { buttonCategory: "Actions", buttonImagePath: "images/tulog.png", buttonName: "Tulog" },
        { buttonCategory: "Actions", buttonImagePath: "images/laro.png", buttonName: "Laro" },
        { buttonCategory: "Feelings", buttonImagePath: "images/masaya.png", buttonName: "Masaya" },
        { buttonCategory: "Feelings", buttonImagePath: "images/malungkot.png", buttonName: "Malungkot" },
        { buttonCategory: "Feelings", buttonImagePath: "images/galit.png", buttonName: "Galit" },
        { buttonCategory: "Feelings", buttonImagePath: "images/takot.png", buttonName: "Takot" },
        { buttonCategory: "Things", buttonImagePath: "images/tubig.png", buttonName: "Tubig" },
        { buttonCategory: "Things", buttonImagePath: "images/gatas.png", buttonName: "Gatas" },
        { buttonCategory: "Things", buttonImagePath: "images/bola.png", buttonName: "Bola" },
        { buttonCategory: "Things", buttonImagePath: "images/laruan.png", buttonName: "Laruan" },
        { buttonCategory: "Places", buttonImagePath: "images/bahay.png", buttonName: "Bahay" },
        { buttonCategory: "Places", buttonImagePath: "images/eskwelahan.png", buttonName: "Eskwelahan" },
        { buttonCategory: "Places", buttonImagePath: "images/CR.png", buttonName: "CR" },
        { buttonCategory: "Places", buttonImagePath: "images/labas.png", buttonName: "Labas" },
    ];

    const handleSelectButton = (button) => {
        const isSelected = selectedButtons.find(b => b.buttonName === button.buttonName);
        if (isSelected) {
            setSelectedButtons(prev => prev.filter(b => b.buttonName !== button.buttonName));
        } else {
            setSelectedButtons(prev => [...prev, button]);
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'People': return 'bg-yellow-400';
            case 'Actions': return 'bg-red-500';
            case 'Feelings': return 'bg-green-500';
            case 'Things': return 'bg-blue-500';
            case 'Places': return 'bg-purple-500';
            default: return 'bg-gray-300';
        }
    };

    const handleSubmit = () => {
        if (!boardName || !boardCategory || selectedButtons.length === 0) {
            alert('Please complete all fields and select at least one button.');
            return;
        }

        const newBoard = {
            boardName,
            boardCategory,
            buttons: selectedButtons,
        };

        console.log('Created Board:', newBoard);
        alert('Board created successfully!');
    };

    const filteredButtons = testButtons.filter(button =>
        button.buttonName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen w-full bg-[#fff6eb] p-6 flex flex-col">
            <div className=" bg-[#305a7a] flex items-center mb-6 p-2">
                <h1 className="text-3xl font-bold text-white mx-auto">Create New Board</h1>
            </div>

            <div className="bg-white border-2 border-dashed p-6 rounded-lg shadow-md flex flex-col gap-4">
                <div className="flex flex-col">
                    <label className="text-gray-700 font-semibold mb-1">Board Name</label>
                    <input
                        type="text"
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        className="border rounded-lg p-2"
                        placeholder="Enter board name"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 font-semibold mb-1">Board Category</label>
                    <select
                        value={boardCategory}
                        onChange={(e) => setBoardCategory(e.target.value)}
                        className="border rounded-lg p-2"
                    >
                        <option value="">Select category</option>
                        <option value="People">People</option>
                        <option value="Actions">Actions</option>
                        <option value="Feelings">Feelings</option>
                        <option value="Things">Things</option>
                        <option value="Places">Places</option>
                    </select>
                </div>
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-blue-900 mb-4 ">Selected Buttons</h2>
                <div className="flex bg-white border-black p-2 rounded-lg border-2 border-dashed min-h-40 flex-row flex-wrap w-full justify-start gap-6">
                    {selectedButtons.map((button, index) => (
                        <div
                            key={index}
                            className={`cursor-pointer h-fit w-fit p-1 rounded-lg border-2 ${getCategoryColor(button.buttonCategory)}`}
                        >
                            <div className=" bg-white text-center font-semibold text-black text-lg rounded px-4">{button.buttonName}</div>
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
                        className="bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-lg mt-4"
                    >
                        Clear All
                    </button>
                )}
            </div>
            <div>
                <h2 className="text-2xl font-bold text-blue-900 my-4">Select Buttons</h2>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search buttons..."
                    className="border rounded-lg p-2 mb-4 w-full"
                />
                <div className="flex bg-white border-black p-2 rounded-lg border-2 border-dashed flex-row flex-wrap w-full justify-center gap-6 max-h-[400px] overflow-y-auto">
                    {filteredButtons.map((button, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelectButton(button)}
                            className={`relative cursor-pointer w-50 aspect-square p-2 rounded-lg border-2 ${getCategoryColor(button.buttonCategory)} ${selectedButtons.some(b => b.buttonName === button.buttonName) ? 'border-black border-6' : 'border-transparent'
                                }`}
                        >
                            {selectedButtons.some(b => b.buttonName === button.buttonName) && (
                                <div className="absolute top-2 right-2 bg-white rounded-full p-1 text-green-600 font-bold">
                                    ✔
                                </div>
                            )}
                            <img
                                src={button.buttonImagePath}
                                alt={button.buttonName}
                                className="w-full h-3/4 object-cover rounded-lg mb-2 bg-white"
                            />
                            <div className="bg-white text-center font-semibold text-black py-2 text-lg">{button.buttonName}</div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={handleSubmit}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg mt-8 w-full"
            >
                Create Board
            </button>
        </div>
    );
}
