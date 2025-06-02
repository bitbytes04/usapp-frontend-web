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

    // Loading screen for initial configuration
    if (loading)
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                <div className="text-lg font-medium">Loading board configuration...</div>
            </div>
        );

    // Loading screen for submission
    if (saving)
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                <div className="text-lg font-medium">Saving your changes...</div>
            </div>
        );

    return (
        <div className="max-w-xl mx-auto mt-10 bg-[#fff6eb] shadow rounded p-8">
            <h1 className="text-2xl font-bold mb-6">Edit Board</h1>
            {error && (
                <div className="mb-4 text-red-600 bg-red-100 p-2 rounded">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block font-medium mb-1">Board Name</label>
                    <input
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-400"
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        required
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="favorite"
                        checked={isFavorite}
                        onChange={(e) => setIsFavorite(e.target.checked)}
                        className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="favorite" className="font-medium">
                        Favorite
                    </label>
                </div>
                <div>
                    <label className="block font-medium mb-2">Buttons</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                        {allButtons.map((btn) => (
                            <label
                                key={btn.id}
                                className={`flex items-center space-x-2 cursor-pointer p-1 rounded ${buttonIds.includes(btn.id)
                                    ? "bg-blue-100"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={buttonIds.includes(btn.id)}
                                    onChange={() => toggleButton(btn.id)}
                                    className="h-4 w-4"
                                />
                                <span>{btn.buttonName}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={() => navigate(-1)}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                        disabled={saving}
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
    );
}