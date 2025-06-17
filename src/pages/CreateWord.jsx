import React, { useState } from 'react';
import axios from 'axios';
import { Transition } from '@headlessui/react';
import { FIREBASE_STORAGE } from '../../firebaseConfig'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useEffect } from 'react';


export default function CreateWord() {
    const [wordName, setWordName] = useState('');
    const [wordCategory, setWordCategory] = useState('');
    const [wordPhoto, setWordPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [userButtons, setuserButtons] = useState([]);
    const [showPopup, setshowPopup] = useState();
    const [selectedButton, setselectedButton] = useState();
    const [downloadURL, setdownloadURL] = useState('');

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        setWordPhoto(file);
    };

    const fetchUserButtons = async () => {
        try {
            const response = await axios.get(`https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}/userbuttons`);
            setuserButtons(response.data);
        }
        catch (error) {
            console.error('Error fetching user buttons:', error);
            alert('Failed to fetch user buttons');
        }
    }

    useEffect(() => {
        fetchUserButtons();
    }, []);

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


        const fileName = `${Date.now()}_${wordPhoto.name}`;
        const photoRef = ref(FIREBASE_STORAGE, `users/${sessionStorage.getItem('userId')}/photos/${wordName}`);


        try {
            // Upload file to Firebase Storage
            await uploadBytes(photoRef, wordPhoto);
            const url = await getDownloadURL(photoRef);
            console.log('File uploaded successfully:', url);
            setdownloadURL(url);
        } catch (uploadErr) {
            alert('Error uploading photo: ' + uploadErr.message);
            setLoading(false);
            return;
        }
        finally {
            const payload = {
                buttonName: wordName,
                buttonCategory: wordCategory,
                buttonImagePath: await getDownloadURL(photoRef),
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
        }




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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black-50 bg-opacity-40">
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

            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
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
            <div className="my-10 border-t-2 border-dashed border-gray-500 w-full"></div>
            <div className="">
                <div className="bg-[#305a7a] flex items-center mb-6 p-2">
                    <h1 className="text-3xl font-bold text-white mx-auto">User Created Words</h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {userButtons.map((button) => (
                        <div
                            key={button.id}
                            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                            onClick={() => {
                                setselectedButton(button);
                                setshowPopup(true);
                            }}
                        >
                            <img src={button.buttonImagePath} alt={button.buttonName} className="w-full h-32 object-cover rounded mb-2" />
                            <h3 className="text-lg font-semibold text-gray-800">{button.buttonName}</h3>
                            <p className="text-gray-600">{button.buttonCategory}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}
