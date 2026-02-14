import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const Signup = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signup, setUsername: setAuthUsername } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!username || !password || !confirmPassword) {
        throw new Error('Please fill in all fields')
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      if (username.length < 1 || username.length > 12) {
        throw new Error('Username must be between 1 and 12 characters')
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, and underscores')
      }

      await signup(username, password)
      setAuthUsername(username)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎓 StudentOS</h1>
          <p>Join our learning community</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Sign Up</h2>

          {error && <div className="error-message" style={{padding: '12px', background: 'rgba(220, 38, 38, 0.1)', borderRadius: '6px', marginBottom: '16px'}}>{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="primary" style={{width: '100%'}} disabled={loading}>
            {loading && <span className="loading"></span>}
            {loading ? ' Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
