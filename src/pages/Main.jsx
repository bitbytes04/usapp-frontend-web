import React from 'react'
import header from '../assets/backgrounds/header_background_img.png'
import logo from '../assets/logos/usapp_logo_medium.png'

const Main = () => {
    return (
        <>
            <div className='flex flex-col justify-start items-center bg-[#fff6eb] min-h-screen'>
                <img className="w-full object-top h-15 rounded-b-2xl " src={header} alt="Header Background" />
                <div className='flex flex-row justify-center items-center'>
                    <div className='flex flex-col justify-center items-start w-full h-full p-6'>
                        <h1 className='text-2xl font-bold'>Welcome to the User Dashboard</h1>
                        <p className='text-lg'>You are logged in as a user.</p>
                    </div>
                    <img className="w-1/12 mb-4 min-w-40" src={logo} alt="Logo" />


                </div>
                <div className="bg-white w-11/12 h-96 text-black p-6 rounded-lg shadow-lg border-dashed border-2 duration-300">

                </div>
            </div>
        </>
    )
}

export default Main
