import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Weather from './pages/Weather'
import PasswordGen from './pages/PasswordGen'
import TodoApp from './pages/TodoApp'
import UnitsConverter from './pages/UnitsConverter'
import Notes from './pages/Notes'
import URLShortener from './pages/URLShortener'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Pomodoro from './pages/Pomodoro'
import GPA from './pages/GPA'
import Navigation from './components/Navigation'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><div className="loading"></div></div>
  return isAuthenticated ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/app/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
        <Route path="/app/password" element={<ProtectedRoute><PasswordGen /></ProtectedRoute>} />
        <Route path="/app/todo" element={<ProtectedRoute><TodoApp /></ProtectedRoute>} />
        <Route path="/app/converter" element={<ProtectedRoute><UnitsConverter /></ProtectedRoute>} />
        <Route path="/app/notes" element={<ProtectedRoute><Notes /></ProtectedRoute>} />
        <Route path="/app/url" element={<ProtectedRoute><URLShortener /></ProtectedRoute>} />
        <Route path="/app/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/app/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/app/pomodoro" element={<ProtectedRoute><Pomodoro /></ProtectedRoute>} />
        <Route path="/app/gpa" element={<ProtectedRoute><GPA /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
