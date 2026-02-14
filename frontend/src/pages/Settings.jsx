import React, { useState, useEffect } from 'react'
import { toolsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import './Tools.css'

const Settings = () => {
  const { toggleTheme, darkMode } = useAuth()
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const { data } = await toolsAPI.getPreferences()
      setPreferences(data.data.preferences)
    } catch (err) {
      setError('Failed to load preferences')
    } finally {
      setLoading(false)
    }
  }

  const updatePref = async (newPrefs) => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await toolsAPI.updatePreferences(newPrefs)
      setPreferences({...preferences, ...newPrefs})
      setSuccess('Preferences updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleThemeToggle = async () => {
    toggleTheme()
    await updatePref({darkMode: !darkMode})
  }

  const handleCityChange = async (e) => {
    const city = e.target.value
    setPreferences({...preferences, defaultCity: city})
    await updatePref({defaultCity: city})
  }

  const handleTempUnitChange = async (e) => {
    const unit = e.target.value
    setPreferences({...preferences, preferredTemperatureUnit: unit})
    await updatePref({preferredTemperatureUnit: unit})
  }

  const handleLengthUnitChange = async (e) => {
    const unit = e.target.value
    setPreferences({...preferences, preferredLengthUnit: unit})
    await updatePref({preferredLengthUnit: unit})
  }

  const handleWeightUnitChange = async (e) => {
    const unit = e.target.value
    setPreferences({...preferences, preferredWeightUnit: unit})
    await updatePref({preferredWeightUnit: unit})
  }

  if (loading) {
    return (
      <div className="tool-container">
        <div className="container">
          <div className="placeholder"><p>Loading settings...</p></div>
        </div>
      </div>
    )
  }

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>⚙️ Settings</h1>
          <p>Customize your experience</p>
        </div>

        <div className="tool-content" style={{maxWidth: '600px', margin: '0 auto'}}>
          {error && <div className="error-message" style={{background: 'rgba(220, 38, 38, 0.1)', padding: '12px', borderRadius: '6px'}}>{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="settings-group">
            <h2>🎨 Appearance</h2>
            
            <div className="settings-item">
              <div className="setting-label">
                <span>Dark Mode</span>
                <p className="setting-desc">Use dark theme for easier reading at night</p>
              </div>
              <button
                onClick={handleThemeToggle}
                className="toggle-btn"
                style={{
                  background: darkMode ? 'var(--primary)' : 'var(--light-border)',
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: darkMode ? '26px' : '2px',
                  width: '24px',
                  height: '24px',
                  background: 'white',
                  borderRadius: '50%',
                  transition: 'left 0.3s'
                }}></div>
              </button>
            </div>
          </div>

          {preferences && (
            <>
              <div className="settings-group">
                <h2>🌍 Location</h2>
                
                <div className="settings-item">
                  <div className="setting-label">
                    <span>Default City</span>
                    <p className="setting-desc">City used for weather app by default</p>
                  </div>
                  <select
                    value={preferences.defaultCity || 'London'}
                    onChange={handleCityChange}
                    disabled={saving}
                  >
                    <option value="London">London</option>
                    <option value="New York">New York</option>
                    <option value="Tokyo">Tokyo</option>
                    <option value="Paris">Paris</option>
                    <option value="Dubai">Dubai</option>
                    <option value="Sydney">Sydney</option>
                    <option value="Toronto">Toronto</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                </div>
              </div>

              <div className="settings-group">
                <h2>🔧 Units Preferences</h2>
                
                <div className="settings-item">
                  <div className="setting-label">
                    <span>Temperature Unit</span>
                    <p className="setting-desc">Preferred temperature measurement</p>
                  </div>
                  <select
                    value={preferences.preferredTemperatureUnit || 'C'}
                    onChange={handleTempUnitChange}
                    disabled={saving}
                  >
                    <option value="C">Celsius (°C)</option>
                    <option value="F">Fahrenheit (°F)</option>
                    <option value="K">Kelvin (K)</option>
                  </select>
                </div>

                <div className="settings-item">
                  <div className="setting-label">
                    <span>Length Unit</span>
                    <p className="setting-desc">Preferred distance measurement</p>
                  </div>
                  <select
                    value={preferences.preferredLengthUnit || 'km'}
                    onChange={handleLengthUnitChange}
                    disabled={saving}
                  >
                    <option value="m">Meters (m)</option>
                    <option value="km">Kilometers (km)</option>
                    <option value="mi">Miles (mi)</option>
                    <option value="ft">Feet (ft)</option>
                  </select>
                </div>

                <div className="settings-item">
                  <div className="setting-label">
                    <span>Weight Unit</span>
                    <p className="setting-desc">Preferred weight measurement</p>
                  </div>
                  <select
                    value={preferences.preferredWeightUnit || 'kg'}
                    onChange={handleWeightUnitChange}
                    disabled={saving}
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="lb">Pounds (lb)</option>
                    <option value="oz">Ounces (oz)</option>
                  </select>
                </div>
              </div>

              <div className="settings-group">
                <h2>ℹ️ About</h2>
                <div className="settings-item">
                  <p style={{margin: 0, color: 'var(--light-text-secondary)', fontSize: '14px'}}>
                    <strong>StudentOS v1.0</strong><br/>
                    Your all-in-one utility dashboard for productivity<br/>
                    <span style={{fontSize: '12px'}}>© 2026 All rights reserved</span>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .settings-group {
          background-color: var(--light-surface);
          border-radius: 8px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .settings-group h2 {
          font-size: 18px;
          margin: 0 0 20px 0;
          color: var(--light-text);
          border-bottom: 2px solid var(--light-border);
          padding-bottom: 12px;
        }

        .settings-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--light-border);
        }

        .settings-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .setting-label {
          flex: 1;
        }

        .setting-label span {
          display: block;
          font-weight: 500;
          color: var(--light-text);
          margin-bottom: 4px;
        }

        .setting-desc {
          margin: 0;
          font-size: 12px;
          color: var(--light-text-secondary);
        }

        .settings-item select {
          min-width: 150px;
          padding: 8px 12px;
        }

        @media (max-width: 600px) {
          .settings-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .settings-item select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}

export default Settings
