import React from 'react'
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserDashboard from './pages/UserDashboard'
import Login from './pages/Login'
import GuestBoard from './pages/GuestBoard'

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/guestboard" element={<GuestBoard />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App