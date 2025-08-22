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
    const [showPopup, setshowPopup] = useState(false);
    const [selectedButton, setselectedButton] = useState();
    const [downloadURL, setdownloadURL] = useState('');
    const [deleting, setdeleting] = useState(false);
    const [EditPopup, setEditPopup] = useState(false);

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        setWordPhoto(file);
    };
    const handleDelete = async () => {
        try {
            console.log(selectedButton)
            setdeleting(true)
            const uid = sessionStorage.getItem('userId');
            await axios.post(`https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}/${selectedButton.id}/deletebutton`);
            alert('Board deleted successfully!');
            fetchUserButtons(); // Refresh the list
            setshowPopup(false);
        } catch (error) {
            alert('Error deleting board: ' + (error.response?.data?.error || error.message));
        }
        finally {
            setdeleting(false)
        }
    }

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


    const handleEdit = () => {
        console.log('Edit button clicked:', selectedButton);
        setEditPopup(true);
    }
    const handleSubmit = async () => {
        if (!wordName || !wordCategory || !wordPhoto) {
            alert('Please complete all fields and upload a photo.');
            return;
        }
        if (wordName.length < 2) {
            alert('Word name must be at least 2 characters.');
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
                buttonImageRef: photoRef.fullPath,
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
                        <span className="text-blue-900 font-semibold text-lg">Deleting...</span>
                    </div>
                </div>
            </Transition>
            <Transition
                show={EditPopup}
                enter="transition-opacity duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
                    <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg min-w-[320px]">
                        <h2 className="text-xl font-bold mb-4 text-blue-900">Edit Button</h2>
                        <input
                            type="text"
                            className="border rounded-lg p-2 mb-2 w-full"
                            value={selectedButton?.editName ?? selectedButton?.buttonName ?? ''}
                            onChange={e => {
                                setselectedButton({
                                    ...selectedButton,
                                    editName: e.target.value,
                                });
                            }}
                            placeholder="Button Name"
                        />
                        <select
                            className="border rounded-lg p-2 mb-2 w-full"
                            value={selectedButton?.editCategory ?? selectedButton?.buttonCategory ?? ''}
                            onChange={e => {
                                setselectedButton({
                                    ...selectedButton,
                                    editCategory: e.target.value,
                                });
                            }}
                        >
                            <option value="Nouns">Nouns</option>
                            <option value="Pronouns">Pronouns</option>
                            <option value="Verbs">Verbs</option>
                            <option value="Adjectives">Adjectives</option>
                            <option value="Prepositions & Social Words">Prepositions & Social Words</option>
                            <option value="Questions">Questions</option>
                            <option value="Negation & Important Words">Negation & Important Words</option>
                            <option value="Adverbs">Adverbs</option>
                            <option value="Conjunctions">Conjunctions</option>
                            <option value="Determiners">Determiners</option>
                        </select>
                        <div className="flex gap-2 mt-4">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                                onClick={async () => {
                                    // Validation
                                    const newName = selectedButton.editName ?? selectedButton.buttonName;
                                    const newCategory = selectedButton.editCategory ?? selectedButton.buttonCategory;
                                    if (!newName || newName.length < 2) {
                                        alert('Button name must be at least 2 characters.');
                                        return;
                                    }
                                    if (!newCategory) {
                                        alert('Please select a button category.');
                                        return;
                                    }
                                    try {
                                        await axios.post(
                                            `https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}/${selectedButton.id}/editbutton`,
                                            {
                                                buttonName: newName,
                                                buttonCategory: newCategory,
                                            },
                                            {
                                                headers: { 'Content-Type': 'application/json' },
                                            }
                                        );
                                        alert('Button updated!');
                                        fetchUserButtons();
                                        setshowPopup(false);
                                        setselectedButton(undefined);
                                    } catch (err) {
                                        alert('Error updating button: ' + (err.response?.data?.error || err.message));
                                    }
                                }}
                            >
                                Save
                            </button>
                            <button
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition text-sm"
                                onClick={() => {
                                    setEditPopup(false);
                                    setshowPopup(false);
                                    setselectedButton(undefined);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>

            <div className="bg-[#305a7a] flex items-center mb-6 p-2">
                <h1 className="text-3xl font-bold text-white mx-auto">CREATE NEW BUTTON</h1>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col gap-4">
                <div className="flex flex-col">
                    <label className="text-gray-700 font-semibold mb-1">Button Name<span className='text-red-500'>*</span></label>
                    <input
                        type="text"
                        value={wordName}
                        onChange={(e) => setWordName(e.target.value)}
                        className="border rounded-lg p-2"
                        placeholder="Enter word name"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="text-gray-700 font-semibold mb-1">Button Category<span className='text-red-500'>*</span></label>
                    <select
                        value={wordCategory}
                        onChange={(e) => setWordCategory(e.target.value)}
                        className="border rounded-lg p-2"
                    >
                        <option value="Nouns">Nouns</option>
                        <option value="Pronouns">Pronouns</option>
                        <option value="Verbs">Verbs</option>
                        <option value="Adjectives">Adjectives</option>
                        <option value="Prepositions & Social Words">Prepositions & Social Words</option>
                        <option value="Questions">Questions</option>
                        <option value="Negation & Important Words">Negation & Important Words</option>
                        <option value="Adverbs">Adverbs</option>
                        <option value="Conjunctions">Conjunctions</option>
                        <option value="Determiners">Determiners</option>
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
                    <h1 className="text-3xl font-bold text-white mx-auto">USER CREATED WORDS</h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {userButtons.map((button) => (
                        <div key={button.id} className="relative flex">
                            <div
                                className="bg-white w-100 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                                onClick={() => {
                                    setselectedButton(button);
                                    setshowPopup(true);
                                }}
                            >
                                <img src={button.buttonImagePath} alt={button.buttonName} className="w-full h-32 object-cover rounded mb-2" />
                                <h3 className="text-lg font-semibold text-gray-800">{button.buttonName}</h3>
                                <p className="text-gray-600">{button.buttonCategory}</p>
                            </div>
                            {showPopup && selectedButton.buttonName === button.buttonName && (
                                <>
                                    {/* Popup for desktop */}
                                    <div
                                        className="hidden sm:flex absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 bg-white rounded-xl shadow-xl p-3 sm:p-4 min-w-[140px] sm:min-w-[160px] flex-col gap-2 border border-gray-100"
                                    >
                                        <button
                                            onClick={handleEdit}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm"
                                        >
                                            Delete
                                        </button>
                                        <button
                                            onClick={() => { setshowPopup(false); setselectedButton(undefined); }}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    {/* Popup for mobile with darkened backdrop */}
                                    <div className="sm:hidden fixed inset-0 z-50 flex items-center justify-center">
                                        <div
                                            className="absolute inset-0 backdrop-brightness-50"
                                            onClick={() => setshowPopup(false)}
                                        />
                                        <div
                                            className="relative w-[90svw] bg-white backdrop-brightness-50 shadow-xl p-4 flex flex-col gap-2 border-b border-gray-100 z-10"
                                        >
                                            <button
                                                onClick={handleEdit}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={handleDelete}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => { setshowPopup(false); setselectedButton(undefined); }}
                                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
}
