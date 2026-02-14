import React, { useState, useEffect } from 'react'
import { toolsAPI } from '../api'
import './Tools.css'

const Weather = () => {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastCity, setLastCity] = useState('')

  useEffect(() => {
    loadLastCity()
  }, [])

  const loadLastCity = async () => {
    try {
      const prefs = await toolsAPI.getPreferences()
      const defaultCity = prefs.data.data.preferences.defaultCity
      if (defaultCity) {
        setCity(defaultCity)
        setLastCity(defaultCity)
        fetchWeather(defaultCity)
      }
    } catch (err) {
      console.error('Failed to load preferences')
    }
  }

  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) {
      setError('Please enter a city name')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // Using Open-Meteo API (free, no API key required)
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`
      )
      const geoData = await response.json()

      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found')
      }

      const location = geoData.results[0]
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=celsius`
      )
      const weatherData = await weatherRes.json()

      setWeather({
        city: `${location.name}, ${location.country}`,
        temperature: weatherData.current.temperature_2m,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        description: getWeatherDescription(weatherData.current.weather_code),
        icon: getWeatherIcon(weatherData.current.weather_code)
      })

      // Save city preference
      await toolsAPI.updateWeatherCity(cityName)
      setLastCity(cityName)
    } catch (err) {
      setError(err.message || 'Failed to fetch weather')
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️'
    if (code === 1 || code === 2) return '🌤️'
    if (code === 3) return '☁️'
    if (code === 45 || code === 48) return '🌫️'
    if (code >= 51 && code <= 67) return '🌧️'
    if (code >= 71 && code <= 85) return '❄️'
    if (code === 80 || code === 81 || code === 82) return '⛈️'
    return '🌤️'
  }

  const getWeatherDescription = (code) => {
    const descriptions = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light drizzle',
      53: 'Drizzle',
      55: 'Heavy drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers'
    }
    return descriptions[code] || 'Unknown'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchWeather(city)
  }

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>🌤️ Weather App</h1>
          <p>Check the weather for any city</p>
        </div>

        <div className="tool-content">
          <form onSubmit={handleSubmit} className="tool-form">
            <div className="form-group">
              <label htmlFor="city">City Name</label>
              <div style={{display: 'flex', gap: '8px'}}>
                <input
                  type="text"
                  id="city"
                  placeholder="Enter city name (e.g., London, New York)"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={loading}
                  style={{flex: 1}}
                />
                <button type="submit" className="primary" disabled={loading}>
                  {loading ? '⏳' : '🔍'}
                </button>
              </div>
            </div>
          </form>

          {error && <div className="error-message" style={{background: 'rgba(220, 38, 38, 0.1)', padding: '12px', borderRadius: '6px'}}>{error}</div>}

          {weather && (
            <div className="weather-card">
              <div className="weather-header">
                <h2>{weather.city}</h2>
                <div className="weather-icon">{weather.icon}</div>
              </div>
              <div className="weather-details">
                <div className="weather-temp">
                  <span className="value">{weather.temperature}°C</span>
                  <span className="label">Temperature</span>
                </div>
                <div className="weather-stat">
                  <span className="label">Condition</span>
                  <span className="value">{weather.description}</span>
                </div>
                <div className="weather-stat">
                  <span className="label">Humidity</span>
                  <span className="value">{weather.humidity}%</span>
                </div>
                <div className="weather-stat">
                  <span className="label">Wind Speed</span>
                  <span className="value">{weather.windSpeed.toFixed(1)} km/h</span>
                </div>
              </div>
            </div>
          )}

          {!weather && !error && (
            <div className="placeholder">
              <p>🌍 Search for a city to view its weather</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Weather
