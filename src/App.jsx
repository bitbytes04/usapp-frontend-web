import React from 'react'
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserDashboard from './pages/UserDashboard'
import Login from './pages/Login'
import GuestBoard from './pages/GuestBoard'
import EditBoard from './pages/EditBoard'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/guestboard" element={<GuestBoard />} />
                <Route path="/editboard" element={<EditBoard />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App