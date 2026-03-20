import React, { useState, useEffect } from 'react'
import { toolsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import './Tools.css'
import './Settings.css'

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={onChange}
    style={{
      background: checked ? 'var(--primary)' : 'var(--light-border)',
      width: '48px', height: '26px', borderRadius: '13px',
      border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0
    }}
  >
    <div style={{
      position: 'absolute', top: '3px',
      left: checked ? '25px' : '3px',
      width: '20px', height: '20px',
      background: 'white', borderRadius: '50%', transition: 'left 0.3s'
    }} />
  </button>
)

const Settings = () => {
  const { toggleTheme, darkMode, username } = useAuth()
  const [preferences, setPreferences] = useState(null)
  const [cityInput, setCityInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    toolsAPI.getPreferences()
      .then(({ data }) => {
        setPreferences(data.data.preferences)
        setCityInput(data.data.preferences.defaultCity || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const updatePref = async (newPrefs) => {
    setSaving(true)
    try {
      await toolsAPI.updatePreferences(newPrefs)
      setPreferences(p => ({ ...p, ...newPrefs }))
      showToast('✓ Saved')
    } catch {
      showToast('✗ Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleThemeToggle = () => {
    toggleTheme()
    updatePref({ darkMode: !darkMode })
  }

  const handleCitySubmit = (e) => {
    e.preventDefault()
    if (cityInput.trim()) updatePref({ defaultCity: cityInput.trim() })
  }

  if (loading) return (
    <div className="tool-container">
      <div className="container"><div className="placeholder"><p>Loading settings...</p></div></div>
    </div>
  )

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>⚙️ Settings</h1>
          <p>Customize your StudentOS experience</p>
        </div>

        {toast && (
          <div style={{
            position: 'fixed', top: '80px', right: '24px', zIndex: 999,
            background: toast.startsWith('✓') ? 'var(--success)' : 'var(--danger)',
            color: 'white', padding: '10px 20px', borderRadius: '8px',
            fontWeight: 600, fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>{toast}</div>
        )}

        <div className="settings-layout">
          {/* Appearance */}
          <div className="settings-card">
            <div className="settings-card-title">🎨 Appearance</div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Dark Mode</div>
                <div className="settings-row-desc">Easier on the eyes at night</div>
              </div>
              <Toggle checked={darkMode} onChange={handleThemeToggle} />
            </div>
          </div>

          {/* Weather */}
          <div className="settings-card">
            <div className="settings-card-title">🌍 Weather Defaults</div>
            <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
              <div>
                <div className="settings-row-label">Default City</div>
                <div className="settings-row-desc">Auto-loaded when you open the Weather app</div>
              </div>
              <form onSubmit={handleCitySubmit} style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <input
                  type="text"
                  value={cityInput}
                  onChange={e => setCityInput(e.target.value)}
                  placeholder="e.g. London, Mumbai, New York"
                  style={{ flex: 1 }}
                  disabled={saving}
                />
                <button type="submit" className="primary" disabled={saving || !cityInput.trim()}>Save</button>
              </form>
              {preferences?.defaultCity && (
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--light-text-secondary)' }}>
                  Current: <strong>{preferences.defaultCity}</strong>
                </p>
              )}
            </div>

            <div className="settings-divider" />

            <div className="settings-row">
              <div>
                <div className="settings-row-label">Temperature Unit</div>
                <div className="settings-row-desc">Used in Weather app display</div>
              </div>
              <div className="unit-toggle-group">
                {['C', 'F', 'K'].map(u => (
                  <button
                    key={u}
                    type="button"
                    className={preferences?.preferredTemperatureUnit === u ? 'unit-btn active' : 'unit-btn'}
                    onClick={() => updatePref({ preferredTemperatureUnit: u })}
                    disabled={saving}
                  >
                    {u === 'C' ? '°C' : u === 'F' ? '°F' : 'K'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Units */}
          <div className="settings-card">
            <div className="settings-card-title">📐 Unit Preferences</div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Length</div>
                <div className="settings-row-desc">Default unit in converter</div>
              </div>
              <select value={preferences?.preferredLengthUnit || 'km'} onChange={e => updatePref({ preferredLengthUnit: e.target.value })} disabled={saving}>
                <option value="m">Meters (m)</option>
                <option value="km">Kilometers (km)</option>
                <option value="mi">Miles (mi)</option>
                <option value="ft">Feet (ft)</option>
                <option value="cm">Centimeters (cm)</option>
                <option value="in">Inches (in)</option>
              </select>
            </div>
            <div className="settings-divider" />
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Weight</div>
                <div className="settings-row-desc">Default unit in converter</div>
              </div>
              <select value={preferences?.preferredWeightUnit || 'kg'} onChange={e => updatePref({ preferredWeightUnit: e.target.value })} disabled={saving}>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="lb">Pounds (lb)</option>
                <option value="oz">Ounces (oz)</option>
              </select>
            </div>
          </div>

          {/* Account */}
          <div className="settings-card">
            <div className="settings-card-title">👤 Account</div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Username</div>
                <div className="settings-row-desc">Your StudentOS identity</div>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '15px' }}>@{username}</span>
            </div>
            <div className="settings-divider" />
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Version</div>
                <div className="settings-row-desc">StudentOS</div>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--light-text-secondary)', fontWeight: 600 }}>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
