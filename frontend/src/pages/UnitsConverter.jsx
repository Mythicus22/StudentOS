import React, { useState } from 'react'
import { toolsAPI } from '../api'
import './Tools.css'

const UnitsConverter = () => {
  const [conversionType, setConversionType] = useState('length')
  const [value, setValue] = useState('')
  const [fromUnit, setFromUnit] = useState('m')
  const [toUnit, setToUnit] = useState('km')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const unitOptions = {
    length: ['m', 'km', 'cm', 'mm', 'mi', 'yd', 'ft', 'in'],
    weight: ['kg', 'g', 'mg', 'lb', 'oz', 'ton'],
    temperature: ['C', 'F', 'K']
  }

  const unitLabels = {
    m: 'Meters (m)',
    km: 'Kilometers (km)',
    cm: 'Centimeters (cm)',
    mm: 'Millimeters (mm)',
    mi: 'Miles (mi)',
    yd: 'Yards (yd)',
    ft: 'Feet (ft)',
    in: 'Inches (in)',
    kg: 'Kilograms (kg)',
    g: 'Grams (g)',
    mg: 'Milligrams (mg)',
    lb: 'Pounds (lb)',
    oz: 'Ounces (oz)',
    ton: 'Metric Tons (ton)',
    C: 'Celsius (°C)',
    F: 'Fahrenheit (°F)',
    K: 'Kelvin (K)'
  }

  const handleTypeChange = (type) => {
    setConversionType(type)
    setFromUnit(unitOptions[type][0])
    setToUnit(unitOptions[type][1] || unitOptions[type][0])
    setValue('')
    setResult(null)
  }

  const convert = async (e) => {
    e.preventDefault()
    if (!value || isNaN(value)) {
      setError('Please enter a valid number')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data } = await toolsAPI.convertUnits(
        parseFloat(value),
        fromUnit,
        toUnit,
        conversionType
      )
      setResult(data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Conversion failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>📏 Unit Converter</h1>
          <p>Convert between different units easily</p>
        </div>

        <div className="tool-content">
          <div className="tool-form">
            {/* Conversion Type Tabs */}
            <div style={{display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid var(--light-border)', paddingBottom: '12px'}}>
              {['length', 'weight', 'temperature'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`tab-button ${conversionType === type ? 'active' : ''}`}
                  onClick={() => handleTypeChange(type)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    color: conversionType === type ? 'var(--primary)' : 'var(--light-text-secondary)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {type === 'length' && '📏 Length'}
                  {type === 'weight' && '⚖️ Weight'}
                  {type === 'temperature' && '🌡️ Temperature'}
                </button>
              ))}
            </div>

            <form onSubmit={convert}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="form-group">
                  <label htmlFor="value">Value</label>
                  <input
                    type="number"
                    id="value"
                    placeholder="Enter value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    step="any"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fromUnit">From</label>
                  <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
                    {unitOptions[conversionType].map((unit) => (
                      <option key={unit} value={unit}>{unitLabels[unit]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{marginTop: '20px'}}>
                <label htmlFor="toUnit">To</label>
                <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
                  {unitOptions[conversionType].map((unit) => (
                    <option key={unit} value={unit}>{unitLabels[unit]}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="primary" style={{width: '100%', marginTop: '20px'}} disabled={loading}>
                {loading ? '⏳ Converting...' : '🔄 Convert'}
              </button>
            </form>
          </div>

          {error && <div className="error-message" style={{background: 'rgba(220, 38, 38, 0.1)', padding: '12px', borderRadius: '6px'}}>{error}</div>}

          {result && (
            <div className="conversion-result">
              <p style={{margin: '0 0 12px 0', fontSize: '14px', opacity: 0.9}}>Conversion Result</p>
              <div className="conversion-value">
                {result.convertedValue}
              </div>
              <div className="conversion-units">
                {result.originalValue} {unitLabels[result.fromUnit]} = {result.convertedValue} {unitLabels[result.toUnit]}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UnitsConverter
