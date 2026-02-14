import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Weather from './pages/Weather'
import PasswordGen from './pages/PasswordGen'
import TodoApp from './pages/TodoApp'
import UnitsConverter from './pages/UnitsConverter'
import Notes from './pages/Notes'
import URLShortener from './pages/URLShortener'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Navigation from './components/Navigation'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="loading"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
        <Route path="/password" element={<ProtectedRoute><PasswordGen /></ProtectedRoute>} />
        <Route path="/todo" element={<ProtectedRoute><TodoApp /></ProtectedRoute>} />
        <Route path="/converter" element={<ProtectedRoute><UnitsConverter /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/url" element={<ProtectedRoute><URLShortener /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
