import React, { useState } from 'react';
import axios from 'axios';
import { Transition } from '@headlessui/react';

export default function CreateWord() {
    const [wordName, setWordName] = useState('');
    const [wordCategory, setWordCategory] = useState('');
    const [wordPhoto, setWordPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        setWordPhoto(file);
    };

    const handleSubmit = async () => {
        if (!wordName || !wordCategory || !wordPhoto) {
            alert('Please complete all fields and upload a photo.');
            return;
        }
        if (wordName.length < 2) {
            alert('Word name must be at least 2 characters.');
            return;
        }
        if (!['People', 'Actions', 'Feelings', 'Things', 'Places'].includes(wordCategory)) {
            alert('Please select a valid category.');
            return;
        }
        if (!wordPhoto || !wordPhoto.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            return;
        }

        setLoading(true);

        // Convert image file to base64 (placeholder)
        const base64Image = 'url/example.png';

        const payload = {
            buttonName: wordName,
            buttonCategory: wordCategory,
            buttonImagePath: 'url/example.png'
        };

        try {
            const response = await axios.post(
                `https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}/addbutton`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            alert('Word created successfully!');
            console.log('Created Word:', response.data);
        } catch (err) {
            alert('Error creating word: ' + (err.response?.data?.error || err.message));
            setLoading(false);
            return;
        }

        setWordName('');
        setWordCategory('');
        setWordPhoto(null);
        setLoading(false);
    };

    return (
        <div className="min-h-screen w-full bg-[#fff6eb] p-6 flex flex-col">
            <Transition
                show={loading}
                enter="transition-opacity duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
                        <svg className="animate-spin h-8 w-8 text-blue-900 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span className="text-blue-900 font-semibold text-lg">Submitting...</span>
                    </div>
                </div>
            </Transition>

            <div className="bg-[#305a7a] flex items-center mb-6 p-2">
                <h1 className="text-3xl font-bold text-white mx-auto">Create New Word</h1>
            </div>

            <div className="bg-white border-2 border-dashed p-6 rounded-lg shadow-md flex flex-col gap-4">
                <div className="flex flex-col">
                    <label className="text-gray-700 font-semibold mb-1">Word Name</label>
                    <input
                        type="text"
                        value={wordName}
                        onChange={(e) => setWordName(e.target.value)}
                        className="border rounded-lg p-2"
                        placeholder="Enter word name"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 font-semibold mb-1">Word Category</label>
                    <select
                        value={wordCategory}
                        onChange={(e) => setWordCategory(e.target.value)}
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

                <div className="flex flex-col">
                    <label className="text-gray-700 font-semibold mb-1">Upload Photo</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="border rounded-lg p-2"
                    />
                </div>
            </div>

            <button
                onClick={handleSubmit}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 rounded-lg mt-8 w-full"
                disabled={loading}
            >
                Create Word
            </button>
        </div >
    );
}
