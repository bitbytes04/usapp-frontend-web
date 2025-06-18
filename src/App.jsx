import React from 'react'
import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UserDashboard from './pages/UserDashboard'
import Login from './pages/Login'
import GuestBoard from './pages/GuestBoard'
import EditBoard from './pages/EditBoard'
import Landing from './pages/Landing'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminPages/AdminDashboard'
const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Landing />} />
                <Route path='/slp/login' element={<AdminLogin />} />
                <Route path='/admin/dashboard' element={<AdminDashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/guestboard" element={<GuestBoard />} />
                <Route path="/editboard" element={<EditBoard />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App