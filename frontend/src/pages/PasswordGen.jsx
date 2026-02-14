import React, { useState, useEffect } from 'react'
import { toolsAPI } from '../api'
import './Tools.css'

const PasswordGen = () => {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(16)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const generatePassword = async () => {
    console.log('[PasswordGen] Generating password with config:', { length, includeSymbols, includeNumbers, includeUppercase });
    setLoading(true)
    setError('')
    try {
      const { data } = await toolsAPI.generatePassword({
        length,
        includeSymbols,
        includeNumbers,
        includeUppercase
      })
      console.log('[PasswordGen] Password generated:', data);
      setPassword(data.data.password)
      setCopied(false)
    } catch (err) {
      console.error('[PasswordGen] Error:', err);
      setError(err.response?.data?.message || 'Failed to generate password')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>🔐 Password Generator</h1>
          <p>Create strong and secure passwords</p>
        </div>

        <div className="tool-content">
          <div className="tool-form">
            <div className="form-group">
              <label>Password Length</label>
              <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                <input
                  type="range"
                  min="6"
                  max="50"
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  style={{flex: 1}}
                />
                <span style={{fontWeight: 'bold', minWidth: '40px'}}>{length}</span>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '20px'}}>
              <label style={{display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer'}}>
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  style={{marginRight: '8px'}}
                />
                Uppercase (A-Z)
              </label>
              <label style={{display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer'}}>
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  style={{marginRight: '8px'}}
                />
                Numbers (0-9)
              </label>
              <label style={{display: 'flex', alignItems: 'center', fontSize: '14px', cursor: 'pointer'}}>
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  style={{marginRight: '8px'}}
                />
                Symbols (!@#$...)
              </label>
            </div>

            <button
              onClick={generatePassword}
              className="primary"
              style={{width: '100%', marginTop: '20px'}}
              disabled={loading}
            >
              {loading ? '⏳ Generating...' : '🔄 Generate Password'}
            </button>
          </div>

          {error && <div className="error-message" style={{background: 'rgba(220, 38, 38, 0.1)', padding: '12px', borderRadius: '6px'}}>{error}</div>}

          {password && (
            <div className="password-display">
              <p style={{margin: '0 0 8px 0', fontSize: '14px', color: 'var(--light-text-secondary)'}}>Your Generated Password</p>
              <div className="password-value">{password}</div>
              <button
                onClick={copyToClipboard}
                className="primary"
                style={{marginTop: '12px'}}
              >
                {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PasswordGen
