import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Transition } from '@headlessui/react';
import { FIREBASE_STORAGE } from '../../../firebaseConfig'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
const API_URL = '/api/default-buttonList';

const DefaultButtons = () => {
    const [buttonList, setButtonList] = useState([]);
    const [form, setForm] = useState({ buttonName: '', buttonImagePath: '' });
    const [buttonCategory, setbuttonCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [buttonsLoading, setbuttonsLoading] = useState(false);
    const [imageFile, setimageFile] = useState();
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showDeletePopup, setshowDeletePopup] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleting, setdeleting] = useState(false);
    const [selectedButton, setselectedButton] = useState({
        buttonCategory: '',
        buttonImagePath: '',
        buttonName: '',
        id: ''
    });
    const [pageSize] = useState(8);


    useEffect(() => {
        fetchButtons();
    }, []);

    const fetchButtons = async () => {
        try {
            setbuttonsLoading(true);
            const res = await axios.get('https://usapp-backend.vercel.app/api/default/buttonsall');
            setButtonList(res.data.buttons);
        } catch (error) {

        }
        finally {
            setbuttonsLoading(false);
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        setimageFile(file);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (editingId) {
            try {
                if (!imageFile) {
                    try {
                        const response = await axios.post(
                            `https://usapp-backend.vercel.app/api/default/buttons/${editingId}`,
                            {
                                buttonName: form.buttonName,
                                buttonCategory: buttonCategory,
                            },
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            }
                        );
                        alert('Word updated successfully!');
                        console.log('Updated Word:', response.data);
                    } catch (err) {
                        alert('Error updating word: ' + (err.response?.data?.error || err.message));

                        return;
                    }

                }
                else {
                    const fileName = `${Date.now()}_${imageFile.name}`;
                    const photoRef = ref(FIREBASE_STORAGE, `default/photos/${fileName}`);
                    // Upload file to Firebase Storage
                    await uploadBytes(photoRef, imageFile);
                    const url = await getDownloadURL(photoRef);
                    console.log('File uploaded successfully:', url);
                    try {
                        const response = await axios.post(
                            `https://usapp-backend.vercel.app/api/default/buttons/${editingId}`,
                            {
                                buttonName: form.buttonName,
                                buttonCategory: buttonCategory,
                                buttonImagePath: url,
                                buttonImageRef: photoRef.fullPath
                            },
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            }
                        );
                        alert('Word updated successfully!');
                        console.log('Updated Word:', response.data);
                    } catch (err) {
                        alert('Error updating word: ' + (err.response?.data?.error || err.message));

                        return;
                    }

                }
            } catch (error) {
                alert('Error uploading photo: ' + error.message);
            }
            finally {
                setLoading(false);
            }
        } else {
            const fileName = `${Date.now()}_${imageFile.name}`;
            const photoRef = ref(FIREBASE_STORAGE, `default/photos/${fileName}`);
            try {
                // Upload file to Firebase Storage
                await uploadBytes(photoRef, imageFile);
                const url = await getDownloadURL(photoRef);
                console.log('File uploaded successfully:', url);

            } catch (uploadErr) {
                alert('Error uploading photo: ' + uploadErr.message);
                setLoading(false);
                return;
            }
            finally {
                const payload = {
                    buttonName: form.buttonName,
                    buttonCategory: buttonCategory,
                    buttonImagePath: await getDownloadURL(photoRef),
                    buttonImageRef: photoRef.fullPath
                };
                try {
                    const response = await axios.post(
                        `https://usapp-backend.vercel.app/api/default/button`,
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
                setLoading(false);
            }



        }
        setForm({ buttonName: '', buttonImagePath: '', buttonCategory: '' });
        setEditingId(null);
        fetchButtons();
    };

    const handleEdit = (button) => {
        console.log(button);
        setbuttonCategory(button.buttonCategory);
        setForm({
            buttonName: button.buttonName,
        });
        setimageFile(null);

        setEditingId(button.id);
    };

    const handleDelete = async (id) => {
        try {
            setdeleting(true);
            await axios.post(`https://usapp-backend.vercel.app/api/default/delete-buttons/${id}`);
            alert('Button deleted successfully!');
        } catch (error) {
            alert('Error deleting button: ' + (error.response?.data?.error || error.message));
        }
        finally {
            setdeleting(false);
        }
        fetchButtons();
    };

    // Get unique categories for filter dropdown
    // Fixed categories list
    const categories = [
        "Nouns",
        "Pronouns",
        "Verbs",
        "Adjectives",
        "Prepositions & Social Words",
        "Questions",
        "Negation & Important Words",
        "Adverbs",
        "Conjunctions",
        "Determiners"
    ];

    // Filter and search logic
    const filteredButtons = buttonList.filter(button => {
        const matchesSearch = button.buttonName.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter ? button.buttonCategory === categoryFilter : true;
        return matchesSearch && matchesCategory;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredButtons.length / pageSize);
    const paginatedButtons = Array.from(filteredButtons.slice((currentPage - 1) * pageSize, currentPage * pageSize))

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };



    return (
        <div className="max-w-6xl z-10 mx-auto p-6">
            <Transition
                show={loading}
                enter="transition-opacity duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
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
                show={buttonsLoading}
                enter="transition-opacity duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
                    <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
                        <svg className="animate-spin h-8 w-8 text-blue-900 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span className="text-blue-900 font-semibold text-lg">Loading Default Buttons...</span>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
                    <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
                        <svg className="animate-spin h-8 w-8 text-blue-900 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                        <span className="text-blue-900 font-semibold text-lg">Deleting Button...</span>
                    </div>
                </div>
            </Transition>
            <Transition
                show={showDeletePopup}
                enter="transition-opacity duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50">
                    <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Are you sure you want to delete this button?</h2>
                        <div className="relative w-[60%] flex z-10">
                            <div
                                className="border-2 border-gray-500 w-full m-4 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                            >
                                <img src={selectedButton.buttonImagePath} alt={selectedButton.buttonName} className="w-full h-32 object-fit rounded mb-2" />
                                <h3 className="text-lg font-semibold text-gray-800">{selectedButton.buttonName}</h3>
                                <p className="text-gray-600">{selectedButton.buttonCategory}</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                                onClick={() => {
                                    handleDelete(selectedButton.id);
                                    setshowDeletePopup(false);
                                }}
                            >
                                Yes, Delete
                            </button>
                            <button
                                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                                onClick={() => setshowDeletePopup(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
            <h1 className="text-2xl font-bold mb-6 px-3 bg-blue-900 text-white">MANAGE DEFAULT BUTTONS</h1>
            <form onSubmit={handleSubmit} className={`flex flex-col  md:flex-row p-5 rounded-md gap-4 mb-8 ${editingId ? 'bg-blue-100 ' : 'border-2 border-gray-300'}`}>
                <input
                    name="buttonName"
                    placeholder="Button Name"
                    value={form.buttonName}
                    onChange={handleChange}
                    maxLength={15}
                    required
                    className="border border-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                />
                <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    required={!editingId}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                />
                <select
                    value={buttonCategory}
                    onChange={(e) => { setbuttonCategory(e.target.value) }}
                    name='buttonCategory'
                    className="border rounded-lg p-2"
                    required
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
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    {editingId ? 'Update' : 'Add'}
                </button>
                {editingId && (
                    <button
                        type="button"
                        onClick={() => { setEditingId(null); setForm({ buttonName: '', buttonImagePath: '', buttonCategory: '' }); }}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                    >
                        Cancel
                    </button>
                )}
            </form>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                />
                <select
                    value={categoryFilter}
                    onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                    className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Button Name</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Button Image Path</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Button Category</th>
                        <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedButtons.map((button) => (
                        <tr key={button.id} className="border-t border-gray-200">
                            <td className="py-2 px-4">{button.buttonName}</td>
                            <td className="py-2 px-4">
                                <img src={button.buttonImagePath} alt={button.buttonName} className="w-16 border-2 h-16 object-cover rounded" />
                            </td>
                            <td className="py-2 px-4">{button.buttonCategory || '-'}</td>
                            <td className="py-2 px-4 flex gap-2">
                                <button
                                    onClick={() => handleEdit(button)}
                                    className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => { setselectedButton(button); setshowDeletePopup(true); }}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    {paginatedButtons.length === 0 && (
                        <tr>
                            <td colSpan={4} className="py-4 px-4 text-center text-gray-500">No buttonList found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6 gap-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                >
                    Prev
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                    <button
                        key={idx + 1}
                        onClick={() => handlePageChange(idx + 1)}
                        className={`px-3 py-1 rounded ${currentPage === idx + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        {idx + 1}
                    </button>
                ))}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default DefaultButtons;