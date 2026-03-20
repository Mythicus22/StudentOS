import React, { useState, useEffect, useRef } from 'react'
import { toolsAPI } from '../api'
import './Tools.css'
import './Weather.css'

const FAMOUS_CITIES = [
  'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata',
  'London', 'New York', 'Tokyo', 'Paris', 'Dubai',
  'Singapore', 'Sydney', 'Toronto', 'Berlin', 'Bangkok',
]

const getWeatherIcon = (code) => {
  if (code === 0) return '☀️'
  if (code <= 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '❄️'
  if (code <= 82) return '⛈️'
  if (code <= 86) return '🌨️'
  return '⛈️'
}

const getWeatherDescription = (code) => {
  const d = { 0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Foggy',48:'Icy fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Slight rain',63:'Moderate rain',65:'Heavy rain',71:'Slight snow',73:'Moderate snow',75:'Heavy snow',77:'Snow grains',80:'Rain showers',81:'Moderate showers',82:'Violent showers',85:'Snow showers',86:'Heavy snow showers',95:'Thunderstorm',96:'Thunderstorm w/ hail',99:'Thunderstorm w/ heavy hail' }
  return d[code] || 'Unknown'
}

const convertTemp = (celsius, unit) => {
  if (unit === 'F') return ((celsius * 9/5) + 32).toFixed(1)
  if (unit === 'K') return (celsius + 273.15).toFixed(1)
  return celsius.toFixed(1)
}

const Weather = () => {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState('')
  const [tempUnit, setTempUnit] = useState('C')
  const suggestTimer = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    toolsAPI.getPreferences()
      .then(res => {
        const prefs = res.data.data.preferences
        const unit = prefs.preferredTemperatureUnit || 'C'
        setTempUnit(unit)
        if (prefs.defaultCity) {
          setInputValue(prefs.defaultCity)
          fetchWeather(prefs.defaultCity, unit)
        }
      })
      .catch(() => {})
      .finally(() => setInitialLoading(false))
  }, [])

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSuggestions(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced autocomplete from geocoding API
  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    setError('')
    clearTimeout(suggestTimer.current)
    if (val.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    suggestTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=6&language=en&format=json`)
        const data = await res.json()
        if (data.results?.length) {
          setSuggestions(data.results.map(r => ({ label: `${r.name}, ${r.admin1 ? r.admin1 + ', ' : ''}${r.country}`, name: r.name })))
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch { setSuggestions([]); setShowSuggestions(false) }
    }, 350)
  }

  const fetchWeather = async (cityName, unit = tempUnit) => {
    if (!cityName?.trim()) { setError('Please enter a city name'); return }
    setLoading(true)
    setError('')
    setShowSuggestions(false)
    setSuggestions([])
    try {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`)
      const geoData = await geoRes.json()
      if (!geoData.results?.length) throw new Error(`City "${cityName}" not found. Check the spelling or try a nearby city.`)

      const loc = geoData.results[0]
      // Update input to the corrected/canonical city name
      setInputValue(loc.name)

      const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure&temperature_unit=celsius&wind_speed_unit=kmh`)
      const wData = await wRes.json()
      const c = wData.current

      setWeather({
        city: `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}, ${loc.country}`,
        tempC: c.temperature_2m,
        feelsLikeC: c.apparent_temperature,
        humidity: c.relative_humidity_2m,
        windSpeed: c.wind_speed_10m,
        pressure: c.surface_pressure,
        description: getWeatherDescription(c.weather_code),
        icon: getWeatherIcon(c.weather_code),
      })

      await toolsAPI.updateWeatherCity(loc.name)
      console.log(`[Weather] Fetched weather for: ${loc.name}`)
    } catch (err) {
      console.error('[Weather] Error:', err.message)
      setError(err.message || 'Failed to fetch weather')
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => { e.preventDefault(); fetchWeather(inputValue) }

  const handleSuggestionClick = (s) => {
    setInputValue(s.name)
    setShowSuggestions(false)
    fetchWeather(s.name)
  }

  const handleFamousCity = (city) => {
    setInputValue(city)
    fetchWeather(city)
  }

  const unitLabel = tempUnit === 'F' ? '°F' : tempUnit === 'K' ? 'K' : '°C'

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>🌤️ Weather App</h1>
          <p>Real-time weather powered by Open-Meteo</p>
        </div>

        <div className="tool-content">
          {/* Famous cities */}
          <div className="city-chips">
            {FAMOUS_CITIES.map(c => (
              <button key={c} className="city-chip" onClick={() => handleFamousCity(c)} disabled={loading}>
                {c}
              </button>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSubmit} className="tool-form" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label htmlFor="city">Search City</label>
              <div className="city-search-wrap" ref={wrapRef}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      id="city"
                      placeholder="Type a city name..."
                      value={inputValue}
                      onChange={handleInputChange}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      disabled={loading || initialLoading}
                      autoComplete="off"
                      style={{ width: '100%' }}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="city-suggestions">
                        {suggestions.map((s, i) => (
                          <li key={i} onMouseDown={() => handleSuggestionClick(s)}>
                            📍 {s.label}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button type="submit" className="primary" disabled={loading || initialLoading}>
                    {loading ? '⏳' : '🔍 Search'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {error && (
            <div className="error-message" style={{ background: 'rgba(220,38,38,0.1)', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
              {error}
            </div>
          )}

          {weather && (
            <div className="weather-card">
              <div className="weather-header">
                <div>
                  <h2 style={{ margin: 0 }}>{weather.city}</h2>
                  <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: '14px' }}>{weather.description}</p>
                </div>
                <div className="weather-icon">{weather.icon}</div>
              </div>

              <div className="weather-temp-main">
                <span className="weather-temp-value">{convertTemp(weather.tempC, tempUnit)}{unitLabel}</span>
                <span className="weather-feels-like">Feels like {convertTemp(weather.feelsLikeC, tempUnit)}{unitLabel}</span>
              </div>

              <div className="weather-details">
                <div className="weather-stat">
                  <span className="label">💧 Humidity</span>
                  <span className="value">{weather.humidity}%</span>
                </div>
                <div className="weather-stat">
                  <span className="label">💨 Wind</span>
                  <span className="value">{weather.windSpeed.toFixed(1)} km/h</span>
                </div>
                <div className="weather-stat">
                  <span className="label">🔵 Pressure</span>
                  <span className="value">{weather.pressure.toFixed(0)} hPa</span>
                </div>
              </div>

              <p style={{ margin: '16px 0 0', fontSize: '12px', opacity: 0.7, textAlign: 'right' }}>
                Unit: {unitLabel} · Change in Settings
              </p>
            </div>
          )}

          {!weather && !error && !loading && !initialLoading && (
            <div className="placeholder">
              <p>🌍 Pick a city above or search to view weather</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Weather
