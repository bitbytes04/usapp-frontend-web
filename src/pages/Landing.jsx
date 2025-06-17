import React from 'react'
import logo from '../assets/logos/usapp_logo_medium.png';
const Landing = () => {
    return (
        <div style={{

        }} className="min-h-screen  bg-beige flex flex-col">
            <header className="py-4 px-3 usapp-bg md:py-6 md:px-8 bg-[#043b64]  text-white flex flex-col md:flex-row justify-between items-center shadow-lg relative overflow-hidden">

                <h1 className="m-0 text-xl md:text-2xl font-bold flex items-center gap-3">
                    USAPP
                </h1>

            </header>
            <main className="flex-1 flex flex-col items-center justify-center p-3 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:gap-8 w-full max-w-6xl">
                    <div className="flex flex-col flex-1 items-center">
                        <img src={logo} alt="USAPP Logo" className="mb-4 h-28 md:h-40 w-auto" />
                        <h2 className="text-xl md:text-3xl font-semibold mb-3 text-center text-[#043b64]">Filipino AAC Communication Board</h2>
                        <p className="text-sm md:text-md indent-6 md:indent-10 text-justify max-w-xs md:max-w-xl mb-4 md:mb-6 text-[#17616e]">
                            USAPP is an Augmentative and Alternative Communication (AAC) board designed specifically for Filipinos.
                            It empowers individuals with speech or language difficulties to communicate more effectively using symbols, words, and phrases in Filipino (Tagalog).
                            Our mission is to make communication accessible, inclusive, and culturally relevant for everyone in the Philippines.
                        </p>
                        <a
                            href="/login"
                            className="mt-2 md:mt-4 px-6 py-2 rounded bg-[#043b64] text-white font-bold text-2xl shadow hover:bg-[#17616e] transition"
                        >
                            Get Started
                        </a>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center bg-white rounded-lg shadow-md p-6 md:p-8">
                        <h3 className="text-lg md:text-2xl font-bold text-[#043b64] mb-4 text-center">Why Use USAPP?</h3>
                        <ul className="space-y-3 text-[#17616e] text-sm md:text-base list-disc list-inside">
                            <li>
                                <span className="font-semibold">Culturally Relevant:</span> Uses Filipino language and symbols tailored for local context.
                            </li>
                            <li>
                                <span className="font-semibold">User-Friendly:</span> Simple, intuitive interface for all ages and abilities.
                            </li>
                            <li>
                                <span className="font-semibold">Accessible Anywhere:</span> Works on any device with a web browser.
                            </li>
                            <li>
                                <span className="font-semibold">Customizable:</span> Personalize boards to fit individual needs.
                            </li>
                            <li>
                                <span className="font-semibold">Free to Use:</span> No cost, no hidden fees—communication for everyone.
                            </li>
                        </ul>
                    </div>

                </div>

            </main>
            <footer className="py-3 md:py-4 bg-[#17616e] text-white text-center text-xs md:text-base">
                &copy; {new Date().getFullYear()} USAPP. All rights reserved.
                <button
                    onClick={() => window.location.href = '/slp/login'}
                    className="ml-4 px-4 py-1 rounded bg-white text-[#17616e] font-semibold shadow hover:bg-gray-100 transition"
                >
                    SLP PORTAL
                </button>
            </footer>
        </div>
    )
}

export default Landing