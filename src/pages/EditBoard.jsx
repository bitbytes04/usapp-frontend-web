import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const fetchBoard = async () => {
    const res = await axios.get(`https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}/${sessionStorage.getItem('boardId')}/getboard`);
    return res.data;
};

const fetchButtons = async () => {
    const res = await axios.get(`https://usapp-backend.vercel.app/api/default/buttonsall`);
    return res.data;
};

const updateBoard = async (data) => {
    const res = await axios.post(`https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}/${sessionStorage.getItem('boardId')}/editboard`, data, {
        headers: { "Content-Type": "application/json" },
    });
    return res.data;
};

export default function EditBoard() {

    const navigate = useNavigate();

    const [boardName, setBoardName] = useState("");
    const [isFavorite, setIsFavorite] = useState(false);
    const [buttonIds, setButtonIds] = useState([]);
    const [allButtons, setAllButtons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const board = await fetchBoard();
                const buttons = await fetchButtons();

                setBoardName(board.boardName);
                setIsFavorite(board.isFavorite);
                setButtonIds(board.buttonIds);
                setAllButtons(buttons.buttons);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            await updateBoard({ boardName, isFavorite, buttonIds });
            navigate(-1);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const toggleButton = (id) => {
        setButtonIds((prev) =>
            prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
        );
    };

    // Filter buttons by search
    const filteredButtons = allButtons.filter(btn =>
        btn.buttonName.toLowerCase().includes(search.toLowerCase())
    );

    // Loading screen for initial configuration
    if (loading)
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-50 bg-opacity-40">
                <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
                    <svg className="animate-spin h-8 w-8 text-blue-900 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span className="text-blue-900 font-semibold text-lg">Loading Board...</span>
                </div>
            </div>
        );

    // Loading screen for submission
    if (saving)
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-50 bg-opacity-40">
                <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
                    <svg className="animate-spin h-8 w-8 text-blue-900 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <span className="text-blue-900 font-semibold text-lg">Saving Changes...</span>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-[#fff6eb]">
            {/* Optional: Add a header image if you have one */}
            {/* <img className="w-full object-top h-16" src={header} alt="Header Background" /> */}
            <div className="container flex flex-col items-center mx-auto py-10 px-4">
                <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 drop-shadow-lg">
                    Edit Board
                </h1>
                <div className="bg-white w-full max-w-2xl text-black p-8 rounded-lg shadow-lg border-dashed border-2 border-blue-200 duration-300">
                    {error && (
                        <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">{error}</div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block font-medium mb-1 text-lg">Board Name</label>
                            <input
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 outline-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
                                value={boardName}
                                onChange={(e) => setBoardName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2 text-lg">Buttons</label>
                            <input
                                type="text"
                                placeholder="Search buttons..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full mb-2 border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-gray-50">
                                {filteredButtons.map((btn) => (
                                    <label
                                        key={btn.id}
                                        className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors ${buttonIds.includes(btn.id)
                                            ? "bg-blue-100 border border-blue-400"
                                            : "hover:bg-gray-100"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={buttonIds.includes(btn.id)}
                                            onChange={() => toggleButton(btn.id)}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-base">{btn.buttonName}</span>
                                    </label>
                                ))}
                                {filteredButtons.length === 0 && (
                                    <div className="col-span-2 text-gray-500 text-center py-2">No buttons found.</div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-lg font-medium"
                                onClick={() => navigate(-1)}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-lg font-medium"
                                disabled={saving}
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}