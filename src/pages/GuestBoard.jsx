import React, { useEffect, useState } from 'react';
import ReactSwitch from 'react-switch';
import axios from 'axios';
import { FourSquare } from 'react-loading-indicators';
import { Speech, ArrowBigLeft, BrainCircuit } from 'lucide-react';
import logo from '../assets/logos/usapp_logo_medium.png';

export default function GuestBoard() {
    const [AISentence, setAISentence] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isSwitchOn, setIsSwitchOn] = useState(false);
    const [selectedWords, setSelectedWords] = useState([]);
    const [audio, setAudio] = useState(null);
    const [loadingModalVisible, setLoadingModalVisible] = useState(false);

    const testButtons = [
        { buttonCategory: "People", buttonImagePath: "images/mama.png", buttonName: "Mama" },
        { buttonCategory: "People", buttonImagePath: "images/papa.png", buttonName: "Papa" },
        { buttonCategory: "People", buttonImagePath: "images/ako.png", buttonName: "Ako" },
        { buttonCategory: "People", buttonImagePath: "images/ikaw.png", buttonName: "Ikaw" },

        // Actions
        { buttonCategory: "Actions", buttonImagePath: "images/kain.png", buttonName: "Kain" },
        { buttonCategory: "Actions", buttonImagePath: "images/inom.png", buttonName: "Inom" },
        { buttonCategory: "Actions", buttonImagePath: "images/tulog.png", buttonName: "Tulog" },
        { buttonCategory: "Actions", buttonImagePath: "images/laro.png", buttonName: "Laro" },

        // Feelings
        { buttonCategory: "Feelings", buttonImagePath: "images/masaya.png", buttonName: "Masaya" },
        { buttonCategory: "Feelings", buttonImagePath: "images/malungkot.png", buttonName: "Malungkot" },
        { buttonCategory: "Feelings", buttonImagePath: "images/galit.png", buttonName: "Galit" },
        { buttonCategory: "Feelings", buttonImagePath: "images/takot.png", buttonName: "Takot" },

        // Things
        { buttonCategory: "Things", buttonImagePath: "images/tubig.png", buttonName: "Tubig" },
        { buttonCategory: "Things", buttonImagePath: "images/gatas.png", buttonName: "Gatas" },
        { buttonCategory: "Things", buttonImagePath: "images/bola.png", buttonName: "Bola" },
        { buttonCategory: "Things", buttonImagePath: "images/laruan.png", buttonName: "Laruan" },

        // Places
        { buttonCategory: "Places", buttonImagePath: "images/bahay.png", buttonName: "Bahay" },
        { buttonCategory: "Places", buttonImagePath: "images/eskwelahan.png", buttonName: "Eskwelahan" },
        { buttonCategory: "Places", buttonImagePath: "images/CR.png", buttonName: "CR" },
        { buttonCategory: "Places", buttonImagePath: "images/labas.png", buttonName: "Labas" }
    ];

    const toggleSwitch = () => setIsSwitchOn(!isSwitchOn);

    const activateTextToSpeech = async (text) => {
        try {
            const response = await axios.post('https://usapp-backend.vercel.app/api/board/selected', {
                text,
            });
            const data = response.data;

            const audioBlob = new Blob([new Uint8Array(atob(data).split('').map((c) => c.charCodeAt(0)))], {
                type: 'audio/mp3',
            });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audioElement = new Audio(audioUrl);
            setAudio(audioElement);
            audioElement.play();
        } catch (error) {
            console.error(error);
        }
    };

    const handleBuildSentence = async (text) => {
        setLoading(true);
        setLoadingModalVisible(true);
        try {
            const response = await axios.post('https://usapp-backend.vercel.app/api/board/buildSentence', {
                text,
            });
            const data = response.data;
            setAISentence(data.message);
            activateTextToSpeech(data.message);
            setModalVisible(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setLoadingModalVisible(false);
        }
    };

    const handleBoardButtonPress = (button) => {
        if (!isSwitchOn) {
            setSelectedWords((prev) => [...prev, button]);
        }
    };

    const handleDeleteWord = (index) => {
        setSelectedWords((prev) => prev.filter((_, i) => i !== index));
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all selected words?')) {
            setSelectedWords([]);
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'People':
                return 'bg-yellow-400';
            case 'Actions':
                return 'bg-red-500';
            case 'Feelings':
                return 'bg-green-500';
            case 'Things':
                return 'bg-blue-500';
            case 'Places':
                return 'bg-purple-500';
            default:
                return 'bg-gray-300';
        }
    };

    useEffect(() => {
        return () => {
            if (audio) {
                audio.pause();
                audio.src = '';
            }
        };
    }, [audio]);

    return (
        <div className="flex flex-col items-center h-screen w-screen bg-[#fff6eb]">
            <div className="w-full bg-blue-900 flex flex-row items-center text-white py-2 text-2xl font-bold">
                <button
                    onClick={() => window.history.back()}
                    className="ml-4  text-white p-2 rounded-lg"
                >
                    <ArrowBigLeft size={32} />
                </button>
                <div className="flex flex-grow justify-center items-center">
                    <h1 className=" text-3xl font-extrabold text-white px-4 py-2 rounded-lg">USAPP BOARD</h1>
                </div>
            </div>
            <div className="flex flex-row w-full h-full">
                <div className="flex flex-col flex-grow bg-[#fff6eb] p-4">
                    <div className="flex items-center mb-4">
                        <div className="flex flex-grow border h-20 p-2 rounded-lg overflow-x-auto">
                            {selectedWords.map((word, index) => (
                                <div key={index} className="flex items-center bg-white border-2 border-r-4 border-b-4 p-4 text-xl rounded-lg mr-2">
                                    <span className="mr-2">{word.buttonName}</span>
                                    <button onClick={() => handleDeleteWord(index)} className="text-red-500 text-2xl">
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleClearAll} className="ml-4 min-w-20 h-20 w-1/12 bg-orange-500 text-white p-2 rounded-lg">
                            Clear
                        </button>
                    </div>
                    <div className="flex flex-wrap justify-between gap-4 max-h-full overflow-y-auto">
                        {testButtons.map((button, index) => (
                            <div
                                key={index}
                                className={`p-2 rounded-lg aspect-square border-black border-2 border-r-4 border-b-4 w-30 text-white ${getCategoryColor(button.buttonCategory)}`}
                                onClick={() => handleBoardButtonPress(button)}
                            >
                                <img className="w-full h-4/5 object-cover mb-2 bg-white" src={button.buttonImagePath} alt={button.buttonName} />
                                <span className="block text-center mb-2">{button.buttonName}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col items-center bg-[#aedfec] shadow-blue-900 rounded-l-xl p-4 w-1/4">
                    <h2 className="text-xl font-extrabold text-[#043b64] mb-4">CONTROLS</h2>
                    <button
                        onClick={() => {
                            if (selectedWords.length > 0) {
                                const textToSpeak = selectedWords.map((word) => word.buttonName).join(' ');
                                activateTextToSpeech(textToSpeak);
                            } else {
                                alert('Please select words to speak.');
                            }
                        }}
                        className="bg-[#043b64] flex-col flex items-center font-bold text-xl text-white p-4 rounded-lg mb-4 w-full"
                    >
                        <Speech color='white' size={40} />
                        TALK
                    </button>
                    <button
                        onClick={() => {
                            if (selectedWords.length > 0) {
                                const textToSpeak = selectedWords.map((word) => word.buttonName).join(' ');
                                handleBuildSentence(textToSpeak);
                            } else {
                                alert('Please select words to speak.');
                            }
                        }}
                        className="bg-[#043b64] flex-col flex items-center font-bold text-xl text-white p-4 rounded-lg mb-4 w-full"
                    >
                        <BrainCircuit color='white' size={40} />
                        {loading ? 'Loading...' : 'AI'}
                    </button>
                    <div className="bg-[#043b64] flex-col gap-5 flex items-center font-bold text-xl text-white p-4 rounded-lg mb-4 w-full">

                        <ReactSwitch
                            checked={isSwitchOn}
                            onChange={toggleSwitch}
                            onColor="#86d3ff"
                            onHandleColor="#2693e6"
                            handleDiameter={30}
                            uncheckedIcon={false}
                            checkedIcon={false}
                            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                            height={20}
                            width={48}
                        />
                        <label className="mr-2">AUTOSPEAK</label>
                    </div>
                </div>
            </div>

            {
                modalVisible && (
                    <div className="fixed inset-0 backdrop-opacity-75 backdrop-brightness-0 flex items-center justify-center">
                        <div className="bg-white p-4 rounded-lg">
                            <p className="mb-4">{AISentence}</p>
                            <button onClick={() => setModalVisible(false)} className="bg-blue-500 text-white p-2 rounded-lg">
                                Close
                            </button>
                        </div>
                    </div>
                )
            }

            {
                loadingModalVisible && (
                    <div className="fixed inset-0 flex items-center justify-center backdrop-opacity-75 backdrop-brightness-0">
                        <div className="bg-white p-4 rounded-lg">
                            <FourSquare color="#32cd32" size="medium" text="" textColor="" />
                            <p>Loading, please wait...</p>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
