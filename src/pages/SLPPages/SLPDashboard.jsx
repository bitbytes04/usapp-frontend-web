import React from 'react'
import '../../App.css'
import Sidebar, { SidebarItem } from '../../components/Sidebar'
import header from '../../assets/backgrounds/header_background_img.png'
import logo from '../../assets/logos/usapp_logo_medium.png'
import { Home, User, LibraryBig, UserCog, ChartNoAxesCombined, SquarePlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LinkedUsers from './LinkedUsers'
import SLPAccount from './SLPAccount'

import { useState } from 'react'



const SLPDashboard = () => {

    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState("Manage Users");
    const [menuOpen, setMenuOpen] = useState(false);
    const handleSidebarItemClick = (item) => {
        setActiveItem(item);
    };

    return (
        <>


            <div className={`flex-row md:flex hidden bg-[#fff6eb] h-screen max-w-screen transition-transform duration-500 ease-in-out ${activeItem ? "translate-x-0" : "-translate-x-full"}`}>
                <div>
                    <Sidebar>
                        <SidebarItem
                            icon={<User />}
                            text="Linked Users"
                            active={activeItem === "Linked Users"}
                            onClick={() => handleSidebarItemClick("Linked Users")}
                        />
                        <SidebarItem
                            icon={<UserCog />}
                            text="SLP Account"
                            active={activeItem === "SLP Account"}
                            onClick={() => handleSidebarItemClick("SLP Account")}
                        />
                    </Sidebar>
                </div>
                <div className='flex-grow flex-1 bg-[#fff6eb] overflow-y-auto'>
                    {activeItem === "Linked Users" && <LinkedUsers />}
                    {activeItem === "SLP Account" && <SLPAccount />}
                </div>
            </div>

            <div className="md:hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#fff6eb] shadow">
                    <div className="flex items-center">
                        <img src={logo} alt="USApp Logo" className="h-8 w-auto mr-2" />
                    </div>
                    <button
                        className="p-2 rounded bg-[#ffe0b2]"
                        onClick={() => setMenuOpen(prev => !prev)}
                        aria-label="Open Menu"
                    >
                        <User size={22} />
                    </button>
                </div>
                {/* Sliding mobile menu */}
                <div className={`fixed inset-0 z-50 backdrop-brightness-50 flex justify-end transition-all duration-500 ${menuOpen ? "visible" : "invisible pointer-events-none"}`}>
                    <div
                        className={`bg-white w-64 h-full shadow-lg flex backdrop-opacity-40 flex-col p-4 transition-transform duration-500 ease-in-out
                                            ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
                    >
                        <button
                            className="self-end mb-4 text-gray-500"
                            onClick={() => setMenuOpen(false)}
                            aria-label="Close Menu"
                        >
                            ✕
                        </button>
                        <button
                            className={`flex items-center p-2 rounded mb-2 ${activeItem === "Linked Users" ? "bg-[#ffe0b2]" : ""}`}
                            onClick={() => { setActiveItem("Linked Users"); setMenuOpen(false); }}
                        >
                            <User size={22} className="mr-2" /> Linked Users
                        </button>
                        <button
                            className={`flex items-center p-2 rounded mb-2 ${activeItem === "SLP Account" ? "bg-[#ffe0b2]" : ""}`}
                            onClick={() => { setActiveItem("SLP Account"); setMenuOpen(false); }}
                        >
                            <UserCog size={22} className="mr-2" /> SLP Account
                        </button>
                        <button
                            className="flex items-center p-2 rounded mb-2 text-red-600 hover:bg-red-100"
                            onClick={() => {
                                navigate(-1)
                            }}
                        >
                            <Home size={22} className="mr-2" /> Logout
                        </button>
                    </div>
                </div>
                <div className="transition-transform duration-500 ease-in-out">
                    {activeItem === "Linked Users" && <LinkedUsers />}
                    {activeItem === "SLP Account" && <SLPAccount />}
                </div>
            </div>


        </>
    )
}

export default SLPDashboard