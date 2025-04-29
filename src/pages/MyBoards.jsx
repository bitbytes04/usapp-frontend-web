import React from 'react'
import header from '../assets/backgrounds/header_background_img.png'

const MyBoards = () => {
    return (
        <div className="min-h-screen">
            <img className="w-full object-top h-15 " src={header} alt="Header Background" />
            <div className="container justify-center flex flex-col items-center mx-auto py-10 px-4">
                <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 drop-shadow-lg">
                    My Boards
                </h1>

                <div className="bg-white h-96 w-11/12 text-black p-6 rounded-lg shadow-lg border-dashed border-2 duration-300">

                </div>

            </div>

        </div>
    );
};

export default MyBoards;