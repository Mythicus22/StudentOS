import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('[Login] Form submitted');
    setError('')
    setLoading(true)

    try {
      if (!username || !password) {
        throw new Error('Please fill in all fields')
      }
      
      console.log('[Login] Attempting login for:', username);
      await login(username, password)
      console.log('[Login] Login successful, navigating to dashboard');
      navigate('/')
    } catch (err) {
      console.error('[Login] Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎓 Student Hub</h1>
          <p>Your all-in-one utility dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Login</h2>

          {error && <div className="error-message" style={{padding: '12px', background: 'rgba(220, 38, 38, 0.1)', borderRadius: '6px', marginBottom: '16px'}}>{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="primary" style={{width: '100%'}} disabled={loading}>
            {loading && <span className="loading"></span>}
            {loading ? ' Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
