import { useState, useEffect } from 'react'

import '../App.css'
import Sidebar, { SidebarItem, SidebarNameplate } from '../components/Sidebar'
import header from '../assets/backgrounds/header_background_img.png'
import logo from '../assets/logos/usapp_logo_medium.png'
import { Home, User, LibraryBig, UserCog, ChartNoAxesCombined, SquarePlus, Users, MessageSquarePlus } from 'lucide-react'

import MyBoards from './MyBoards'
import CreateBoard from './CreateBoard'
import AccountSettings from './Account'
import CreateWord from './CreateWord'
import { useNavigate } from 'react-router-dom'
import AccountLinking from './AccountLinking'
import UserFeedback from './UserFeedback'
import axios from 'axios'

function UserDashboard() {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("My Boards");
  const [userName, setUserName] = useState("User");

  const getUserInfo = async () => {
    try {
      const response = await axios.get(`https://usapp-backend.vercel.app/api/users/${sessionStorage.getItem('userId')}`);
      setUserName(response.data.firstName || "User");
    } catch (error) {

    }
  }

  useEffect(() => {
    getUserInfo();
  }, []);

  const handleSidebarItemClick = (item) => {
    setActiveItem(item);
  };

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {(sessionStorage.getItem("userId") == null || sessionStorage.getItem("userId") === undefined) ? (
        <div>
          <div className="flex flex-col items-center justify-center h-screen bg-[#fff6eb]">
            <img src={logo} alt="USApp Logo" className="h-16 mb-6" />
            <h2 className="text-2xl font-semibold mb-2 text-gray-800">Please log in to access the User Dashboard</h2>
            <button
              className="mt-4 px-6 py-2 bg-[#ffe0b2] text-gray-900 rounded shadow hover:bg-[#ffd699] transition"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={`flex-row md:flex hidden bg-[#fff6eb] h-screen max-w-screen transition-transform duration-500 ease-in-out ${activeItem ? "translate-x-0" : "-translate-x-full"}`}>
            <div>
              <Sidebar>
                <SidebarNameplate name={userName} />
                <SidebarItem
                  icon={<LibraryBig />}
                  text="My Boards"
                  active={activeItem === "My Boards"}
                  onClick={() => handleSidebarItemClick("My Boards")}
                />
                <SidebarItem
                  icon={<SquarePlus />}
                  text="Create Board"
                  active={activeItem === "Create Board"}
                  onClick={() => handleSidebarItemClick("Create Board")} />
                <SidebarItem
                  icon={<ChartNoAxesCombined />}
                  text="Create Button"
                  active={activeItem === "Create Word"}
                  onClick={() => handleSidebarItemClick("Create Word")} />
                <SidebarItem
                  icon={<UserCog />}
                  text="Account"
                  active={activeItem === "Account"}
                  onClick={() => handleSidebarItemClick("Account")}
                />
                <SidebarItem
                  icon={<Users />}
                  text="Account Linking"
                  active={activeItem === "Account Linking"}
                  onClick={() => handleSidebarItemClick("Account Linking")}
                />
                <div className='flex-grow'>

                </div>

                <SidebarItem
                  icon={<MessageSquarePlus />}
                  text="User Feedback"
                  active={activeItem === "User Feedback"}
                  onClick={() => handleSidebarItemClick("User Feedback")}
                />
              </Sidebar>
            </div>
            <div className='flex-grow flex-1 bg-[#fff6eb] overflow-y-auto'>
              {activeItem === "My Boards" && <MyBoards />}
              {activeItem === "Create Board" && <CreateBoard />}
              {activeItem === "Account" && <AccountSettings />}
              {activeItem === "Create Word" && <CreateWord />}
              {activeItem === "Account Linking" && <AccountLinking />}
              {activeItem === "User Feedback" && <UserFeedback />}
            </div>
          </div>
          {/* Mobile popup menu */}
          <div>
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#fff6eb] shadow">
              <div className="flex items-center">
                <img src={logo} alt="USApp Logo" className="h-8 w-auto mr-2" />

              </div>
              <button
                className="p-2 rounded bg-[#ffe0b2]"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Open Menu"
              >
                <User size={22} />
              </button>
            </div>
            {/* Sliding mobile menu */}
            <div className={`md:hidden fixed inset-0 z-50 backdrop-brightness-50 flex justify-end transition-all duration-500 ${menuOpen ? "visible" : "invisible pointer-events-none"}`}>
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
                  className={`flex items-center p-2 rounded mb-2 ${activeItem === "My Boards" ? "bg-[#ffe0b2]" : ""}`}
                  onClick={() => { setActiveItem("My Boards"); setMenuOpen(false); }}
                >
                  <LibraryBig size={22} className="mr-2" /> My Boards
                </button>
                <button
                  className={`flex items-center p-2 rounded mb-2 ${activeItem === "Create Board" ? "bg-[#ffe0b2]" : ""}`}
                  onClick={() => { setActiveItem("Create Board"); setMenuOpen(false); }}
                >
                  <SquarePlus size={22} className="mr-2" /> Create Board
                </button>
                <button
                  className={`flex items-center p-2 rounded mb-2 ${activeItem === "Create Word" ? "bg-[#ffe0b2]" : ""}`}
                  onClick={() => { setActiveItem("Create Word"); setMenuOpen(false); }}
                >
                  <ChartNoAxesCombined size={22} className="mr-2" /> Create Button
                </button>
                <button
                  className={`flex items-center p-2 rounded mb-2 ${activeItem === "Account" ? "bg-[#ffe0b2]" : ""}`}
                  onClick={() => { setActiveItem("Account"); setMenuOpen(false); }}
                >
                  <UserCog size={22} className="mr-2" /> Account
                </button>
                <button
                  className={`flex items-center p-2 rounded mb-2 ${activeItem === "Account Linking" ? "bg-[#ffe0b2]" : ""}`}
                  onClick={() => { setActiveItem("Account Linking"); setMenuOpen(false); }}
                >
                  <Users size={22} className="mr-2" /> Account Linking
                </button>
                <button
                  className={`flex items-center p-2 rounded mb-2 ${activeItem === "User Feedback" ? "bg-[#ffe0b2]" : ""}`}
                  onClick={() => { setActiveItem("User Feedback"); setMenuOpen(false); }}
                >
                  <Users size={22} className="mr-2" /> User Feedback
                </button>
                <button
                  className="flex items-center p-2 rounded mb-2 text-red-500 hover:bg-red-100"
                  onClick={() => {
                    sessionStorage.clear();
                    navigate(-1)

                  }}
                >
                  <Home size={22} className="mr-2" /> Logout
                </button>

              </div>
            </div>
            <div className="md:hidden transition-transform duration-500 ease-in-out">
              {activeItem === "My Boards" && <MyBoards />}
              {activeItem === "Create Board" && <CreateBoard />}
              {activeItem === "Account" && <AccountSettings />}
              {activeItem === "Create Word" && <CreateWord />}
              {activeItem === "Account Linking" && <AccountLinking />}
              {activeItem === "User Feedback" && <UserFeedback />}
            </div>
          </div>
        </>)}
    </>
  )
}

export default UserDashboard
