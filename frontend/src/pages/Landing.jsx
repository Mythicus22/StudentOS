import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Landing.css'

const features = [
  { icon: '🌤️', title: 'Weather App', desc: 'Real-time weather for any city with feels-like, humidity & pressure' },
  { icon: '🔐', title: 'Password Generator', desc: 'Secure, customizable passwords with strength meter' },
  { icon: '✅', title: 'To-Do List', desc: 'Track tasks with filters, progress bar & cloud sync' },
  { icon: '📏', title: 'Unit Converter', desc: 'Length, weight & temperature conversions instantly' },
  { icon: '📝', title: 'Notes', desc: 'Rich notes with search, word count & Ctrl+S save' },
  { icon: '🔗', title: 'URL Shortener', desc: 'Shorten links and track click counts per URL' },
  { icon: '🍅', title: 'Pomodoro Timer', desc: 'Focus sessions with auto-switch & session tracking' },
  { icon: '🎓', title: 'GPA Calculator', desc: 'IPU grading system — SGPA & CGPA across semesters' },
]

const stats = [
  { value: '8', label: 'Built-in Tools' },
  { value: '100%', label: 'Free Forever' },
  { value: '0', label: 'Email Required' },
  { value: '∞', label: 'Data Stored' },
]

// Validation rules matching backend Zod schema
const validateUsername = (v) => {
  if (!v) return 'Username is required'
  if (v.length < 1) return 'Username too short'
  if (v.length > 12) return 'Max 12 characters'
  if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Only letters, numbers and underscore'
  return ''
}

const validatePassword = (v) => {
  if (!v) return 'Password is required'
  if (v.length < 8) return 'Minimum 8 characters'
  if (v.length > 20) return 'Maximum 20 characters'
  return ''
}

const AuthModal = ({ onClose, initialMode = 'login' }) => {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState(initialMode)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const switchMode = (m) => { setMode(m); setErrors({}); setServerError('') }

  const validate = () => {
    const e = {}
    const uErr = validateUsername(username)
    const pErr = validatePassword(password)
    if (uErr) e.username = uErr
    if (pErr) e.password = pErr
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === 'login') await login(username, password)
      else await signup(username, password)
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
    if (errors.username) setErrors(prev => ({ ...prev, username: validateUsername(e.target.value) }))
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    if (errors.password) setErrors(prev => ({ ...prev, password: validatePassword(e.target.value) }))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal auth-modal" onClick={e => e.stopPropagation()}>
        <div className="auth-modal-header">
          <span className="auth-modal-brand">🎓 StudentOS</span>
          <button className="auth-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="auth-tabs">
          <button className={`tab-button ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>Sign In</button>
          <button className={`tab-button ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>Create Account</button>
        </div>

        <form onSubmit={handleSubmit} noValidate style={{ marginTop: '24px' }}>
          <div className="auth-field">
            <label>Username</label>
            <input
              type="text"
              placeholder="e.g. john_doe"
              value={username}
              onChange={handleUsernameChange}
              className={errors.username ? 'input-error' : ''}
              autoFocus
              autoComplete="username"
              maxLength={12}
            />
            {errors.username
              ? <span className="field-error">{errors.username}</span>
              : mode === 'signup' && <span className="field-hint">1–12 chars, letters/numbers/underscore</span>
            }
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'signup' ? '8–20 characters' : 'Your password'}
                value={password}
                onChange={handlePasswordChange}
                className={errors.password ? 'input-error' : ''}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                maxLength={20}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {serverError && <div className="auth-server-error">{serverError}</div>}

          <button type="submit" className="primary auth-submit" disabled={loading}>
            {loading ? '⏳ Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>

          {mode === 'login' && (
            <p className="auth-switch-hint">
              No account? <button type="button" className="link-btn" onClick={() => switchMode('signup')}>Create one free →</button>
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

const Landing = () => {
  const { isAuthenticated, loading, toggleTheme, darkMode } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const openAuth = (mode = 'login') => { setAuthMode(mode); setShowAuth(true) }

  if (loading) return <div className="landing-loading"><div className="loading"></div></div>
  if (isAuthenticated) return <Navigate to="/app" replace />

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">🎓 StudentOS</div>
        <div className="landing-header-actions">
          <button className="theme-toggle" onClick={toggleTheme} title={darkMode ? 'Light mode' : 'Dark mode'}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="ghost-btn" onClick={() => openAuth('login')}>Sign In</button>
          <button className="primary" style={{ padding: '8px 20px', fontSize: '14px' }} onClick={() => openAuth('signup')}>Get Started Free</button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-badge">✨ Built for IPU students</div>
          <h1 className="hero-title">
            Your all-in-one<br />
            <span className="hero-accent">student toolkit</span>
          </h1>
          <p className="hero-subtitle">
            8 productivity tools in one dashboard — weather, notes, todos, GPA calculator,
            Pomodoro timer and more. All synced to your account, free forever.
          </p>
          <div className="hero-actions">
            <button className="primary hero-cta" onClick={() => openAuth('signup')}>Get started free →</button>
            <button className="ghost-btn hero-cta-ghost" onClick={() => openAuth('login')}>Sign in</button>
          </div>
        </section>

        {/* Stats bar */}
        <div className="stats-bar">
          {stats.map(s => (
            <div key={s.label} className="stat-item">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        <section className="features-section">
          <h2 className="features-title">Everything you need to stay productive</h2>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-strip">
          <h2>Ready to boost your productivity?</h2>
          <p>Create a free account in seconds — no email, no credit card.</p>
          <button className="primary hero-cta" onClick={() => openAuth('signup')}>Get started free →</button>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© 2025 StudentOS · Built for students · Free forever</p>
      </footer>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} initialMode={authMode} />}
    </div>
  )
}

export default Landing
