import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navigation.css'

const navLinks = [
  { to: '/app', label: 'Dashboard' },
  { to: '/app/weather', label: 'Weather' },
  { to: '/app/password', label: 'Passwords' },
  { to: '/app/todo', label: 'Todo' },
  { to: '/app/converter', label: 'Converter' },
  { to: '/app/notes', label: 'Notes' },
  { to: '/app/url', label: 'URL Shortener' },
  { to: '/app/pomodoro', label: 'Pomodoro' },
  { to: '/app/gpa', label: 'GPA Calc' },
  { to: '/app/analytics', label: 'Analytics' },
  { to: '/app/settings', label: 'Settings' },
]

const Navigation = () => {
  const { logout, username, toggleTheme, darkMode, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    await logout()
    navigate('/')
  }

  if (!isAuthenticated) return null

  const isActive = (to) => to === '/app' ? location.pathname === '/app' : location.pathname.startsWith(to)

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/app" className="nav-brand">
          <span className="brand-icon">🎓</span>
          StudentOS
        </Link>

        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link ${isActive(to) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          <button className="theme-toggle" onClick={toggleTheme} title={darkMode ? 'Light mode' : 'Dark mode'}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <div className="user-chip">
            <div className="user-avatar">{username?.[0]?.toUpperCase() || 'U'}</div>
            <span>@{username}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
