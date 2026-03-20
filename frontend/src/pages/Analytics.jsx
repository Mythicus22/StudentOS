import React, { useState, useEffect } from 'react'
import { toolsAPI } from '../api'
import './Tools.css'
import './Analytics.css'

const toolIcons = {
  'Weather App': '🌤️', 'Password Generator': '🔐', 'To-Do List': '✓',
  'Unit Converter': '📏', 'Notes App': '📝', 'URL Shortener': '🔗'
}

const formatDate = (date) => new Date(date).toLocaleString('en-US', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
})

const formatRelative = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [recentTools, setRecentTools] = useState([])
  const [activityHistory, setActivityHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      toolsAPI.getAnalytics(),
      toolsAPI.getRecentlyUsedTools(6),
      toolsAPI.getActivityHistory(30)
    ])
      .then(([aRes, rRes, hRes]) => {
        setAnalytics(aRes.data.data)
        setRecentTools(rRes.data.data.tools || [])
        setActivityHistory(hRes.data.data.history || [])
      })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="tool-container">
      <div className="container"><div className="placeholder"><p>Loading analytics...</p></div></div>
    </div>
  )

  const mostUsed = analytics?.toolUsage || [] // already sorted by usageCount desc from backend
  const maxUsage = mostUsed[0]?.usageCount || 1

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>📊 Analytics</h1>
          <p>Your usage stats and activity history</p>
        </div>

        {error && <div className="error-message" style={{ background: 'rgba(220,38,38,0.1)', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>{error}</div>}

        <div className="analytics-container">

          {/* Overview stats */}
          <div className="analytics-stats-row">
            <div className="analytics-stat-card">
              <div className="analytics-stat-icon">⚡</div>
              <div className="analytics-stat-value">{analytics?.totalActions || 0}</div>
              <div className="analytics-stat-label">Total Actions</div>
            </div>
            <div className="analytics-stat-card">
              <div className="analytics-stat-icon">🛠️</div>
              <div className="analytics-stat-value">{mostUsed.length}</div>
              <div className="analytics-stat-label">Tools Used</div>
            </div>
            <div className="analytics-stat-card highlight">
              <div className="analytics-stat-icon">⭐</div>
              <div className="analytics-stat-value" style={{ fontSize: mostUsed[0]?.name?.length > 10 ? '16px' : '22px' }}>
                {mostUsed[0]?.name || '—'}
              </div>
              <div className="analytics-stat-label">Most Used Tool</div>
            </div>
            <div className="analytics-stat-card">
              <div className="analytics-stat-icon">🕐</div>
              <div className="analytics-stat-value" style={{ fontSize: recentTools[0]?.name?.length > 10 ? '16px' : '22px' }}>
                {recentTools[0]?.name || '—'}
              </div>
              <div className="analytics-stat-label">Last Used Tool</div>
            </div>
          </div>

          <div className="analytics-two-col">
            {/* Most Used — sorted by usageCount */}
            <div className="analytics-panel">
              <div className="analytics-panel-title">🏆 Most Used Tools</div>
              {mostUsed.length === 0 ? (
                <p style={{ color: 'var(--light-text-secondary)', fontSize: '14px', padding: '16px 0' }}>No tool usage yet</p>
              ) : (
                <div className="tool-bars">
                  {mostUsed.map((tool, i) => (
                    <div key={tool.name} className="tool-bar-item">
                      <div className="tool-bar-meta">
                        <span className="tool-bar-rank">#{i + 1}</span>
                        <span className="tool-bar-icon">{toolIcons[tool.name] || '⚙️'}</span>
                        <span className="tool-bar-name">{tool.name}</span>
                        <span className="tool-bar-count">{tool.usageCount}×</span>
                      </div>
                      <div className="tool-bar-track">
                        <div className="tool-bar-fill" style={{ width: `${(tool.usageCount / maxUsage) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recently Used — sorted by lastUsed */}
            <div className="analytics-panel">
              <div className="analytics-panel-title">🕐 Recently Used</div>
              {recentTools.length === 0 ? (
                <p style={{ color: 'var(--light-text-secondary)', fontSize: '14px', padding: '16px 0' }}>No recent activity</p>
              ) : (
                <div className="recent-tool-list">
                  {recentTools.map((tool) => (
                    <div key={tool.name} className="recent-tool-row">
                      <span className="recent-tool-icon">{toolIcons[tool.name] || '⚙️'}</span>
                      <div className="recent-tool-info">
                        <span className="recent-tool-name">{tool.name}</span>
                        <span className="recent-tool-time">{formatRelative(tool.lastUsed)}</span>
                      </div>
                      <span className="recent-tool-uses">{tool.usageCount} uses</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          {activityHistory.length > 0 && (
            <div className="analytics-panel" style={{ marginTop: '0' }}>
              <div className="analytics-panel-title">📜 Activity History</div>
              <div className="activity-timeline">
                {activityHistory.map((item, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-dot" />
                    <div className="activity-content">
                      <p className="activity-action">{item.action}</p>
                      <p className="activity-time">{formatDate(item.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mostUsed.length === 0 && activityHistory.length === 0 && (
            <div className="placeholder"><p>🎯 Start using tools to see your analytics here!</p></div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics
