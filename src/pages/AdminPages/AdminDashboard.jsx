import React from 'react'
import '../../App.css'
import Sidebar, { SidebarItem, SidebarNameplate } from '../../components/Sidebar'
import header from '../../assets/backgrounds/header_background_img.png'
import logo from '../../assets/logos/usapp_logo_medium.png'
import { Home, User, LibraryBig, UserCog, ChartNoAxesCombined, Blocks } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import ManageUsers from './ManageUsers'
import ManageUserFeedback from './ManageUserFeedback'
import DefaultButtons from './DefaultButtons'
import ActivityLogs from './ActivityLogs'
import { useState } from 'react'



const AdminDashboard = () => {

    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState("Manage Users");
    const [menuOpen, setMenuOpen] = useState(false);
    const handleSidebarItemClick = (item) => {
        setActiveItem(item);
    };

    return (
        <>
            {sessionStorage.getItem('admintoken') === 'Xbj293nhu394n4ud' ? (
                <>
                    <div className={`flex-row md:flex hidden bg-[#fff6eb] h-screen max-w-screen transition-transform duration-500 ease-in-out ${activeItem ? "translate-x-0" : "-translate-x-full"}`}>
                        <div>
                            <Sidebar>
                                <SidebarNameplate name='Admin' color="#3d6887" />
                                <SidebarItem
                                    icon={<User />}
                                    text="Monitor Users"
                                    active={activeItem === "Manage Users"}
                                    onClick={() => handleSidebarItemClick("Manage Users")}
                                />
                                <SidebarItem
                                    icon={<LibraryBig />}
                                    text="Monitor User Feedback"
                                    active={activeItem === "Manage User Feedback"}
                                    onClick={() => handleSidebarItemClick("Manage User Feedback")}
                                />
                                <SidebarItem
                                    icon={<UserCog />}
                                    text="Activity Logs"
                                    active={activeItem === "Activity Logs"}
                                    onClick={() => handleSidebarItemClick("Activity Logs")}
                                />
                                <SidebarItem
                                    icon={<Blocks />}
                                    text="Default Buttons"
                                    active={activeItem === "Default Buttons"}
                                    onClick={() => handleSidebarItemClick("Default Buttons")}
                                />
                            </Sidebar>
                        </div>
                        <div className='flex-grow flex-1 bg-[#fff6eb] overflow-y-auto'>
                            {activeItem === "Manage Users" && <ManageUsers />}
                            {activeItem === "Manage User Feedback" && <ManageUserFeedback />}
                            {activeItem === "Activity Logs" && <ActivityLogs />}
                            {activeItem === "Default Buttons" && <DefaultButtons />}
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
                                    className={`flex items-center p-2 rounded mb-2 ${activeItem === "Manage Users" ? "bg-[#ffe0b2]" : ""}`}
                                    onClick={() => { setActiveItem("Manage Users"); setMenuOpen(false); }}
                                >
                                    <User size={22} className="mr-2" /> Monitor Users
                                </button>
                                <button
                                    className={`flex items-center p-2 rounded mb-2 ${activeItem === "Manage User Feedback" ? "bg-[#ffe0b2]" : ""}`}
                                    onClick={() => { setActiveItem("Manage User Feedback"); setMenuOpen(false); }}
                                >
                                    <LibraryBig size={22} className="mr-2" /> Monitor User Feedback
                                </button>
                                <button
                                    className={`flex items-center p-2 rounded mb-2 ${activeItem === "Activity Logs" ? "bg-[#ffe0b2]" : ""}`}
                                    onClick={() => { setActiveItem("Activity Logs"); setMenuOpen(false); }}
                                >
                                    <UserCog size={22} className="mr-2" /> Activity Logs
                                </button>
                                <button
                                    className={`flex items-center p-2 rounded mb-2 ${activeItem === "Default Buttons" ? "bg-[#ffe0b2]" : ""}`}
                                    onClick={() => { setActiveItem("Default Buttons"); setMenuOpen(false); }}
                                >
                                    <Blocks size={22} className="mr-2" /> Default Buttons
                                </button>
                                <button
                                    className="flex items-center p-2 rounded mb-2 text-red-600 hover:bg-red-100"
                                    onClick={() => {
                                        sessionStorage.removeItem('admintoken');
                                        navigate(-1)
                                    }}
                                >
                                    <Home size={22} className="mr-2" /> Logout
                                </button>
                            </div>
                        </div>
                        <div className="transition-transform duration-500 ease-in-out">
                            {activeItem === "Manage Users" && <ManageUsers />}
                            {activeItem === "Manage User Feedback" && <ManageUserFeedback />}
                            {activeItem === "Activity Logs" && <ActivityLogs />}
                            {activeItem === "Default Buttons" && <DefaultButtons />}
                        </div>
                    </div>
                </>

            ) : (
                <div className="flex items-center justify-center h-screen">
                    <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                    <p className="text-gray-600">You do not have permission to access this page.</p>
                </div>
            )}
        </>
    )
}

export default AdminDashboard