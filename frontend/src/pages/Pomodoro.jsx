import React, { useState, useEffect, useRef } from 'react'
import { authAPI } from '../api'
import './Tools.css'
import './Pomodoro.css'

const MODES = {
  work: { label: 'Focus', duration: 25 * 60, color: '#ef4444' },
  short: { label: 'Short Break', duration: 5 * 60, color: '#10b981' },
  long: { label: 'Long Break', duration: 15 * 60, color: '#3b82f6' },
}

const Pomodoro = () => {
  const [mode, setMode] = useState('work')
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [customWork, setCustomWork] = useState(25)
  const [customShort, setCustomShort] = useState(5)
  const [customLong, setCustomLong] = useState(15)
  const [showSettings, setShowSettings] = useState(false)
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  const durations = {
    work: customWork * 60,
    short: customShort * 60,
    long: customLong * 60,
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            handleComplete()
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const handleComplete = () => {
    // Play a simple beep via Web Audio API
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.8)
    } catch {}

    if (mode === 'work') {
      const newSessions = sessions + 1
      setSessions(newSessions)
      authAPI.me().then(() => {
        fetch('/user/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action: `Completed a Pomodoro focus session.`, time: new Date().toISOString() })
        }).catch(() => {})
      }).catch(() => {})
      // Auto switch to break
      const nextMode = newSessions % 4 === 0 ? 'long' : 'short'
      switchMode(nextMode, newSessions)
    } else {
      switchMode('work', sessions)
    }
  }

  const switchMode = (newMode, currentSessions = sessions) => {
    setMode(newMode)
    setTimeLeft(newMode === 'work' ? customWork * 60 : newMode === 'short' ? customShort * 60 : customLong * 60)
    setRunning(false)
  }

  const handleModeClick = (m) => {
    clearInterval(intervalRef.current)
    setMode(m)
    setTimeLeft(durations[m])
    setRunning(false)
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setRunning(false)
    setTimeLeft(durations[mode])
  }

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const secs = String(timeLeft % 60).padStart(2, '0')
  const progress = 1 - timeLeft / durations[mode]
  const color = MODES[mode].color
  const circumference = 2 * Math.PI * 90

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>🍅 Pomodoro Timer</h1>
          <p>Stay focused with timed work sessions</p>
        </div>

        <div className="pomodoro-wrapper">
          {/* Mode tabs */}
          <div className="pomodoro-modes">
            {Object.entries(MODES).map(([key, val]) => (
              <button
                key={key}
                className={`pomo-mode-btn ${mode === key ? 'active' : ''}`}
                style={mode === key ? { background: color, color: 'white', borderColor: color } : {}}
                onClick={() => handleModeClick(key)}
              >
                {val.label}
              </button>
            ))}
          </div>

          {/* Timer circle */}
          <div className="pomodoro-circle-wrap">
            <svg width="220" height="220" className="pomodoro-svg">
              <circle cx="110" cy="110" r="90" fill="none" stroke="var(--light-border)" strokeWidth="10" />
              <circle
                cx="110" cy="110" r="90"
                fill="none"
                stroke={color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                transform="rotate(-90 110 110)"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="pomodoro-time-display">
              <span className="pomodoro-time">{mins}:{secs}</span>
              <span className="pomodoro-mode-label" style={{ color }}>{MODES[mode].label}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="pomodoro-controls">
            <button className="pomo-btn secondary" onClick={reset}>↺ Reset</button>
            <button
              className="pomo-btn primary"
              style={{ background: color, boxShadow: `0 4px 14px ${color}55` }}
              onClick={() => setRunning(r => !r)}
            >
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
            <button className="pomo-btn secondary" onClick={() => setShowSettings(s => !s)}>⚙ Settings</button>
          </div>

          {/* Session count */}
          <div className="pomodoro-sessions">
            {Array.from({ length: Math.max(sessions, 4) }).map((_, i) => (
              <div key={i} className={`session-dot ${i < sessions ? 'done' : ''}`} style={i < sessions ? { background: color } : {}} />
            ))}
            <span className="sessions-label">{sessions} session{sessions !== 1 ? 's' : ''} completed</span>
          </div>

          {/* Custom settings */}
          {showSettings && (
            <div className="pomodoro-settings">
              <h3>Customize Durations (minutes)</h3>
              <div className="pomo-settings-grid">
                <div>
                  <label>Focus</label>
                  <input type="number" min="1" max="60" value={customWork}
                    onChange={e => { setCustomWork(+e.target.value); if (mode === 'work') setTimeLeft(+e.target.value * 60) }} />
                </div>
                <div>
                  <label>Short Break</label>
                  <input type="number" min="1" max="30" value={customShort}
                    onChange={e => { setCustomShort(+e.target.value); if (mode === 'short') setTimeLeft(+e.target.value * 60) }} />
                </div>
                <div>
                  <label>Long Break</label>
                  <input type="number" min="1" max="60" value={customLong}
                    onChange={e => { setCustomLong(+e.target.value); if (mode === 'long') setTimeLeft(+e.target.value * 60) }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Pomodoro
