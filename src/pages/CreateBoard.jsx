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
        // You can replace this with API POST request here
    };

    const filteredButtons = testButtons.filter(button =>
        button.buttonName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen w-full bg-[#fff6eb] p-6 flex flex-col">
            <div className="flex items-center mb-6">
                <button onClick={() => window.history.back()} className="text-blue-900 p-2">
                    <ArrowBigLeft size={32} />
                </button>
                <h1 className="text-3xl font-bold text-blue-900 mx-auto">Create New Board</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col gap-4 mb-8">
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

            <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-4">Select Buttons</h2>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search buttons..."
                    className="border rounded-lg p-2 mb-4 w-full"
                />
                <div className="flex flex-row flex-wrap w-full justify-center gap-6 max-h-[400px] overflow-y-auto">
                    {filteredButtons.map((button, index) => (
                        <div
                            key={index}
                            onClick={() => handleSelectButton(button)}
                            className={`cursor-pointer w-50 aspect-square p-2 rounded-lg border-2 ${getCategoryColor(button.buttonCategory)} ${selectedButtons.some(b => b.buttonName === button.buttonName) ? 'border-black border-8' : 'border-transparent'
                                }`}
                        >
                            <img
                                src={button.buttonImagePath}
                                alt={button.buttonName}
                                className="w-full h-3/4 object-cover rounded-lg mb-2 bg-white"
                            />
                            <div className="text-center font-semibold text-white">{button.buttonName}</div>
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
