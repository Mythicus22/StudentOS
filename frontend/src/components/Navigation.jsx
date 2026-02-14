import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navigation.css'

const Navigation = () => {
  const { logout, username, toggleTheme, darkMode, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      setMobileMenuOpen(false)
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!isAuthenticated) return null

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">🎓</span>
          Student Hub
        </Link>
        
        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          ☰
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/weather" className="nav-link">Weather</Link>
          <Link to="/password" className="nav-link">Password Gen</Link>
          <Link to="/todo" className="nav-link">Todo</Link>
          <Link to="/converter" className="nav-link">Converter</Link>
          <Link to="/notes" className="nav-link">Notes</Link>
          <Link to="/url" className="nav-link">URL Shortener</Link>
          <Link to="/analytics" className="nav-link">Analytics</Link>
          <Link to="/settings" className="nav-link">Settings</Link>
        </div>

        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title={darkMode ? 'Light mode' : 'Dark mode'}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <span className="user-name">@{username}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
