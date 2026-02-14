import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toolsAPI } from '../api'
import './Dashboard.css'

const Dashboard = () => {
  const [recentTools, setRecentTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRecentTools()
  }, [])

  const fetchRecentTools = async () => {
    try {
      const { data } = await toolsAPI.getRecentlyUsedTools(6)
      setRecentTools(data.data.tools || [])
    } catch (err) {
      setError('Failed to load recent tools')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toolIcons = {
    'Weather App': '🌤️',
    'Password Generator': '🔐',
    'To-Do List': '✓',
    'Unit Converter': '📏',
    'Notes App': '📝',
    'URL Shortener': '🔗'
  }

  const toolColors = {
    'Weather App': '#3b82f6',
    'Password Generator': '#8b5cf6',
    'To-Do List': '#10b981',
    'Unit Converter': '#f59e0b',
    'Notes App': '#ec4899',
    'URL Shortener': '#06b6d4'
  }

  const allTools = [
    { name: 'Weather App', path: '/weather', icon: '🌤️', desc: 'Check weather forecasts' },
    { name: 'Password Generator', path: '/password', icon: '🔐', desc: 'Generate secure passwords' },
    { name: 'To-Do List', path: '/todo', icon: '✓', desc: 'Manage your tasks' },
    { name: 'Unit Converter', path: '/converter', icon: '📏', desc: 'Convert units' },
    { name: 'Notes App', path: '/notes', icon: '📝', desc: 'Take quick notes' },
    { name: 'URL Shortener', path: '/url', icon: '🔗', desc: 'Shorten long URLs' }
  ]

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome to Your Dashboard</h1>
          <p>Access all your tools in one place</p>
        </div>

        {recentTools.length > 0 && (
          <section className="dashboard-section">
            <h2 className="section-title">📊 Recently Used Tools</h2>
            <div className="recent-tools">
              {recentTools.map((tool) => (
                <Link key={tool.name} to={`/${tool.name.toLowerCase().replace(/ /g, '-').replace('app', '').replace('list', '').replace('generator', 'password').trim()}`} className="recent-tool-card">
                  <div className="tool-icon">{toolIcons[tool.name] || '⚙️'}</div>
                  <div className="tool-info">
                    <h3>{tool.name}</h3>
                    <p>{tool.usageCount} uses</p>
                    <span className="last-used">Last used: {new Date(tool.lastUsed).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="dashboard-section">
          <h2 className="section-title">🛠️ All Tools</h2>
          <div className="tools-grid">
            {allTools.map((tool) => (
              <Link key={tool.name} to={tool.path} className="tool-card">
                <div className="tool-card-icon">{tool.icon}</div>
                <h3>{tool.name}</h3>
                <p>{tool.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2 className="section-title">⚡ Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{recentTools.length}</div>
              <div className="stat-label">Tools Used</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{recentTools.reduce((sum, t) => sum + t.usageCount, 0)}</div>
              <div className="stat-label">Total Actions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{recentTools.length > 0 ? recentTools[0].name : 'None'}</div>
              <div className="stat-label">Most Used Tool</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
