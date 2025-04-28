import { useState } from 'react'

import '../App.css'
import Sidebar, { SidebarItem } from '../components/Sidebar'
import header from '../assets/backgrounds/header_background_img.png'
import logo from '../assets/logos/usapp_logo_medium.png'
import { Home, User, LibraryBig } from 'lucide-react'
import Main from './Main'
import MyBoards from './MyBoards'

function UserDashboard() {
  const [activeItem, setActiveItem] = useState("Home");

  const handleSidebarItemClick = (item) => {
    setActiveItem(item);
  };

  return (
    <>
      <div className='flex flex-row bg-[#fff6eb] h-screen max-w-screen'>
        <div>
          <Sidebar>
            <SidebarItem
              icon={<Home />}
              text="Home"
              active={activeItem === "Home"}
              onClick={() => handleSidebarItemClick("Home")}
            />
            <SidebarItem
              icon={<LibraryBig />}
              text="My Boards"
              active={activeItem === "My Boards"}
              onClick={() => handleSidebarItemClick("My Boards")}
            />
          </Sidebar>
        </div>
        <div className='flex-grow flex-1 bg-[#fff6eb]'>
          {activeItem === "Home" && <Main />}
          {activeItem === "My Boards" && <MyBoards />}
        </div>
      </div>
    </>
  )
}

export default UserDashboard
