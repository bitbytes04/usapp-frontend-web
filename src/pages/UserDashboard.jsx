import { useState } from 'react'

import '../App.css'
import Sidebar, { SidebarItem } from '../components/Sidebar'
import header from '../assets/backgrounds/header_background_img.png'
import logo from '../assets/logos/usapp_logo_medium.png'
import { Home, User, LibraryBig, UserCog, ChartNoAxesCombined, SquarePlus } from 'lucide-react'
import Main from './Main'
import MyBoards from './MyBoards'
import CreateBoard from './CreateBoard'

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
            <SidebarItem
              icon={<SquarePlus />}
              text="Create Board"
              active={activeItem === "Create Board"}
              onClick={() => handleSidebarItemClick("Create Board")} />
            <SidebarItem
              icon={<UserCog />}
              text="Account"
              active={activeItem === "Account"}
              onClick={() => handleSidebarItemClick("Account")}
            />
            <SidebarItem
              icon={<ChartNoAxesCombined />}
              text="Monitoring"
              active={activeItem === "Monitoring"}
              onClick={() => handleSidebarItemClick("Monitoring")} />
          </Sidebar>

        </div>
        <div className='flex-grow flex-1 bg-[#fff6eb] overflow-y-auto'>
          {activeItem === "Home" && <Main />}
          {activeItem === "My Boards" && <MyBoards />}
          {activeItem === "Create Board" && <CreateBoard />}
        </div>
      </div>
    </>
  )
}

export default UserDashboard
