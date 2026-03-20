import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toolsAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

const allTools = [
  { name: 'Weather App', path: '/app/weather', icon: '🌤️', desc: 'Real-time weather', color: '#3b82f6' },
  { name: 'Password Generator', path: '/app/password', icon: '🔐', desc: 'Secure passwords', color: '#8b5cf6' },
  { name: 'To-Do List', path: '/app/todo', icon: '✅', desc: 'Manage tasks', color: '#10b981' },
  { name: 'Unit Converter', path: '/app/converter', icon: '📏', desc: 'Convert units', color: '#f59e0b' },
  { name: 'Notes App', path: '/app/notes', icon: '📝', desc: 'Quick notes', color: '#ec4899' },
  { name: 'URL Shortener', path: '/app/url', icon: '🔗', desc: 'Shorten links', color: '#06b6d4' },
  { name: 'Pomodoro Timer', path: '/app/pomodoro', icon: '🍅', desc: 'Focus sessions', color: '#ef4444' },
  { name: 'GPA Calculator', path: '/app/gpa', icon: '🎓', desc: 'Calculate GPA', color: '#6366f1' },
]

const toolPaths = Object.fromEntries(allTools.map(t => [t.name, t.path]))
const toolColors = Object.fromEntries(allTools.map(t => [t.name, t.color]))

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const Dashboard = () => {
  const { username } = useAuth()
  const [recentTools, setRecentTools] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      toolsAPI.getRecentlyUsedTools(4),
      toolsAPI.getAnalytics()
    ])
      .then(([rRes, aRes]) => {
        setRecentTools(rRes.data.data.tools || [])
        setAnalytics(aRes.data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="dashboard-container page-enter">
      <div className="container">

        {/* Greeting */}
        <div className="dashboard-greeting">
          <div>
            <h1>{getGreeting()}, <span className="greeting-name">@{username}</span> 👋</h1>
            <p>Here's your productivity hub. What are you working on today?</p>
          </div>
          <Link to="/app/analytics" className="view-analytics-btn">View Analytics →</Link>
        </div>

        {/* Quick stats */}
        {analytics && (
          <div className="dash-stats-row">
            <div className="dash-stat">
              <span className="dash-stat-value">{analytics.totalActions}</span>
              <span className="dash-stat-label">Total Actions</span>
            </div>
            <div className="dash-stat">
              <span className="dash-stat-value">{analytics.toolUsage?.length || 0}</span>
              <span className="dash-stat-label">Tools Used</span>
            </div>
            <div className="dash-stat">
              <span className="dash-stat-value">{analytics.mostUsedTool?.usageCount || 0}</span>
              <span className="dash-stat-label">Top Tool Uses</span>
            </div>
            <div className="dash-stat highlight">
              <span className="dash-stat-value" style={{ fontSize: analytics.mostUsedTool?.name?.length > 10 ? '14px' : '18px' }}>
                {analytics.mostUsedTool?.name || '—'}
              </span>
              <span className="dash-stat-label">Favourite Tool</span>
            </div>
          </div>
        )}

        {/* All tools — primary section */}
        <section className="dashboard-section">
          <h2 className="section-title">🛠️ All Tools</h2>
          <div className="tools-grid">
            {allTools.map((tool) => (
              <Link key={tool.name} to={tool.path} className="tool-card">
                <div className="tool-card-icon" style={{ background: `${tool.color}18`, color: tool.color }}>
                  {tool.icon}
                </div>
                <div className="tool-card-body">
                  <h3>{tool.name}</h3>
                  <p>{tool.desc}</p>
                </div>
                <span className="tool-card-arrow">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recently used */}
        {recentTools.length > 0 && (
          <section className="dashboard-section">
            <h2 className="section-title">🕐 Recently Used</h2>
            <div className="recent-tools-grid">
              {recentTools.map((tool) => (
                <Link key={tool.name} to={toolPaths[tool.name] || '/app'} className="recent-tool-card">
                  <div className="recent-tool-icon" style={{ background: `${toolColors[tool.name]}18`, color: toolColors[tool.name] }}>
                    {allTools.find(t => t.name === tool.name)?.icon || '⚙️'}
                  </div>
                  <div className="recent-tool-info">
                    <span className="recent-tool-name">{tool.name}</span>
                    <span className="recent-tool-meta">{tool.usageCount} uses · {new Date(tool.lastUsed).toLocaleDateString()}</span>
                  </div>
                  <span className="recent-tool-arrow">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}

export default Dashboard
