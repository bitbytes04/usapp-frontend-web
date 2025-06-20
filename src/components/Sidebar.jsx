import { MoreVertical, ChevronLast, ChevronFirst } from "lucide-react"
import { useContext, createContext, useState } from "react"
import logo from '../assets/logos/usapp_logo_medium.png'
import { useNavigate } from "react-router-dom"
import "../index.css"

const SidebarContext = createContext()

export default function Sidebar({ children }) {
    const [expanded, setExpanded] = useState(true)
    const navigate = useNavigate()

    return (
        <aside className="h-full">
            <nav className="h-full flex flex-col bg-[#fff6eb] border-r shadow-sm">
                <div className="p-4 pb-2 flex justify-between items-center">
                    <img
                        src={logo}
                        className={`overflow-hidden transition-all ${expanded ? "w-32" : "w-0"
                            }`}
                        alt=""
                    />
                    <button
                        onClick={() => setExpanded((curr) => !curr)}
                        className="p-1.5 rounded-lg g-[#fff6eb] hover:bg-amber-100 transition-colors duration-200"
                    >
                        {expanded ? <ChevronFirst /> : <ChevronLast />}
                    </button>
                </div>

                <SidebarContext.Provider value={{ expanded }}>
                    <ul className="flex-1 px-3 flex flex-col">{children}</ul>
                </SidebarContext.Provider>

                <div className="border-t flex p-3">

                    <div
                        className={`
                                        flex justify-center items-center
                                        w-full
                                        overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
                            `}
                    >
                        <button
                            onClick={() => navigate(-1)}
                            className={`${expanded ? "block" : "hidden"} w-full bg-red-900 hover:bg-red-700 delay-150 duration-300 text-white py-2 rounded`} >
                            Log out
                        </button>
                    </div>
                </div>
            </nav>
        </aside>
    )
}

export function SidebarItem({ icon, text, active, alert, onClick }) {
    const handleClick = () => {
        if (onClick) {
            onClick()
        }
    }
    const { expanded } = useContext(SidebarContext)

    return (
        <li
            onClick={handleClick}
            className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${active
                    ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
                    : "hover:bg-indigo-50 text-gray-600"
                }
    `}
        >
            {icon}
            <span
                className={`overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"
                    }`}
            >
                {text}
            </span>
            {alert && (
                <div
                    className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"
                        }`}
                />
            )}

            {!expanded && (
                <div
                    className={`
          absolute left-full rounded-md px-2 py-1 ml-6
          bg-indigo-100 text-indigo-800 text-sm
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
      `}
                >
                    {text}
                </div>
            )}
        </li>
    )
}