import React, { useState } from 'react';
import logo from '../assets/logos/usapp_logo_medium.png';
import header from '../assets/backgrounds/header-landing.png';
import showcase from '../assets/backgrounds/showcase-landing.png';

const navItems = [
    { label: 'Login as Board User', href: '/login' },
    { label: 'Login as Speech Language Pathologist', href: '/slp/login' },

];

const Landing = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleNav = (href) => {
        window.location.href = href;
    };

    return (
        <>
            <div className='flex flex-col justify-start min-h-screen bg-[#fff6eb]'>
                <header className='relative flex flex-row items-center justify-center h-20 lg:h-30 shadow-2xl border-b-1 border-white object-fill bg-gray-50' role="banner">
                    <img src={header} alt="Header background with abstract shapes" className='w-full h-full object-cover absolute inset-0 z-0' aria-hidden="true" />
                    <img src={logo} alt="USAPP Logo" className='h-12 sm:h-15 lg:h-25 object-contain absolute top-2 left-4 sm:top-1 sm:left-20 z-10' />

                    {/* Dropdown Navigation */}
                    <nav className='absolute right-4 sm:right-5 lg:right-20 z-20' aria-label="Main navigation">
                        <button
                            className='bg-[#a3d7e0] text-black text-base sm:text-md font-bold py-2 usapp-border px-3 sm:px-10 rounded-lg hover:bg-[#3d6786] hover:text-white flex items-center'
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            id="dropdownMenuButton"
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                            aria-controls="dropdownMenu"
                        >
                            LOGIN
                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {dropdownOpen && (
                            <div
                                onMouseLeave={() => setDropdownOpen(false)}
                                className='absolute right-0 mt-2 w-40 sm:w-80 bg-white rounded-lg shadow-lg border'
                                tabIndex={-1}
                                id="dropdownMenu"
                                role="menu"
                                aria-labelledby="dropdownMenuButton"
                            >
                                {navItems.map((item) => (
                                    <React.Fragment key={item.label}>
                                        <button
                                            className='block w-full text-left px-1 sm:px-4 py-2 text-black hover:bg-[#a3d7e0] hover:text-white text-sm sm:text-base'
                                            onClick={() => handleNav(item.href)}
                                            role="menuitem"
                                        >
                                            {item.label}
                                        </button>
                                        <hr className='border-t border-gray-500 m-0' aria-hidden="true" />
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </nav>
                </header>
                <main className='flex-grow w-full flex flex-col-reverse lg:flex-row p-5' role="main">
                    <section className='flex-[10] h-full w-full flex flex-col items-center justify-start p-4 bg-[#fff6eb]' aria-labelledby="what-is-usapp">
                        <h1 id="what-is-usapp" className='text-2xl font-bold mb-4 text-white bg-[#035084] px-2 py-2 w-full lg:mt-2 usapp-border  rounded-sm '>WHAT IS USAPP?</h1>
                        <p className='text-base sm:text-sm lg:text-md text-justify mb-4 bg-white rounded p-4 w-full border border-gray-300 shadow-md'>
                            <strong>USAPP</strong> is an Augmentative and Alternative Communication (AAC) board mobile application designed specifically for Filipinos. It empowers individuals with speech or language difficulties to communicate more effectively using symbols, words, and phrases in Filipino (Tagalog). Our mission is to make communication accessible, inclusive, and innovative for everyone in the Philippines.
                        </p>
                        <h2 className='text-2xl font-bold mb-4 text-white bg-[#fe8917] usapp-border px-2 py-2 w-full lg:mt-2  rounded-sm '>KEY FEATURES</h2>

                        <ul className='list-none text-base sm:text-sm lg:text-md mb-4 bg-white rounded p-4 w-full border border-gray-300 shadow-md'>
                            <li className='mb-2'><strong>Easy-to-Use Communication Boards</strong> – Tap words, phrases, or symbols to build sentences quickly.</li>
                            <li className='mb-2'><strong>Personalized Vocabulary</strong> – Customize boards with words that matter most to you.</li>
                            <li className='mb-2'><strong>Tagalog Support</strong> – Communicate seamlessly in Tagalog.</li>
                            <li className='mb-2'><strong>Smart Suggestions</strong> – AI-powered predictions make communication faster and more natural.</li>
                            <li className='mb-2'><strong>Accessible Design</strong> – Built with color-coding, visuals, and user-friendly navigation for all ages.</li>
                        </ul>

                        <a
                            href='https://drive.google.com/file/d/1k1ZyVvo8AIWeYEmsoaolNsqp5AwNb2YZ/view?usp=sharing'
                            className='bg-[#12b2b5] w-full text-white text-center sm:text-md font-bold py-2 usapp-border px-3 sm:px-10 rounded-lg hover:bg-[#3d6786] hover:text-white mt-2'
                            aria-label="Download the USAPP AAC app for Filipinos"
                        >
                            DOWNLOAD THE APP
                        </a>
                    </section>
                    <aside className='flex-[12] flex flex-col items-center justify-center p-4 lg:pl-0 overflow-hidden' aria-label="App showcase">
                        <img src={showcase} alt='Screenshot of USAPP AAC app interface' className='w:[90%] lg:w-[85%]' />
                    </aside>
                </main>
            </div>
        </>
    );
};

export default Landing;