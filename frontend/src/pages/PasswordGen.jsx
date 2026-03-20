import React, { useState } from 'react'
import { toolsAPI } from '../api'
import './Tools.css'

const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 12) score++
  if (pwd.length >= 16) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++
  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' }
  if (score <= 2) return { score, label: 'Fair', color: '#f59e0b' }
  if (score <= 3) return { score, label: 'Good', color: '#3b82f6' }
  return { score, label: 'Strong', color: '#10b981' }
}

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
    setLoading(true)
    setError('')
    try {
      const { data } = await toolsAPI.generatePassword({ length, includeSymbols, includeNumbers, includeUppercase })
      setPassword(data.data.password)
      setCopied(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate password')
    } finally { setLoading(false) }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const strength = getStrength(password)

  const CheckOption = ({ label, checked, onChange }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: checked ? 'var(--primary-light)' : 'var(--light-surface-2)', border: `2px solid ${checked ? 'var(--primary)' : 'var(--light-border)'}`, borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.15s', fontSize: '14px', fontWeight: 500 }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} />
      {label}
    </label>
  )

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
              <label>Password Length — <strong style={{ color: 'var(--primary)' }}>{length} characters</strong></label>
              <input
                type="range" min="6" max="50" value={length}
                onChange={e => setLength(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', height: '6px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--light-text-secondary)', marginTop: '4px' }}>
                <span>6</span><span>50</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginTop: '4px' }}>
              <CheckOption label="Uppercase (A-Z)" checked={includeUppercase} onChange={e => setIncludeUppercase(e.target.checked)} />
              <CheckOption label="Numbers (0-9)" checked={includeNumbers} onChange={e => setIncludeNumbers(e.target.checked)} />
              <CheckOption label="Symbols (!@#$...)" checked={includeSymbols} onChange={e => setIncludeSymbols(e.target.checked)} />
            </div>

            <button onClick={generatePassword} className="primary" style={{ width: '100%', marginTop: '20px', padding: '13px' }} disabled={loading}>
              {loading ? '⏳ Generating...' : '🔄 Generate Password'}
            </button>
          </div>

          {error && <div className="error-message" style={{ marginBottom: '12px' }}>{error}</div>}

          {password && (
            <div className="password-display">
              <p style={{ margin: '0 0 10px', fontSize: '13px', color: 'var(--light-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Generated Password</p>
              <div className="password-value">{password}</div>

              {/* Strength meter */}
              <div style={{ margin: '12px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                  <span style={{ color: 'var(--light-text-secondary)' }}>Strength</span>
                  <span style={{ fontWeight: 700, color: strength.color }}>{strength.label}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--light-border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(strength.score / 5) * 100}%`, background: strength.color, borderRadius: '3px', transition: 'width 0.3s, background 0.3s' }} />
                </div>
              </div>

              <button onClick={copyToClipboard} className="primary" style={{ width: '100%', padding: '11px' }}>
                {copied ? '✓ Copied to clipboard!' : '📋 Copy to Clipboard'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PasswordGen
