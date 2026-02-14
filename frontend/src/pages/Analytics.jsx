import React, { useState, useEffect } from 'react'
import { toolsAPI } from '../api'
import './Tools.css'
import './Analytics.css'

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [activityHistory, setActivityHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const [analyticsRes, historyRes] = await Promise.all([
        toolsAPI.getAnalytics(),
        toolsAPI.getActivityHistory(20)
      ])
      setAnalytics(analyticsRes.data.data)
      setActivityHistory(historyRes.data.data.history || [])
    } catch (err) {
      setError('Failed to load analytics')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="tool-container">
        <div className="container">
          <div className="placeholder"><p>Loading analytics...</p></div>
        </div>
      </div>
    )
  }

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>📊 Analytics Dashboard</h1>
          <p>Track your usage and activity</p>
        </div>

        {error && <div className="error-message" style={{background: 'rgba(220, 38, 38, 0.1)', padding: '12px', borderRadius: '6px'}}>{error}</div>}

        <div className="analytics-container">
          {/* Top Stats */}
          <div className="stats-section">
            <h2 className="section-title">📈 Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{analytics?.totalActions || 0}</div>
                <div className="stat-label">Total Actions</div>
              </div>
              {analytics?.mostUsedTool && (
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-value">{analytics.mostUsedTool.name}</div>
                  <div className="stat-label">Most Used</div>
                </div>
              )}
              <div className="stat-card">
                <div className="stat-icon">🛠️</div>
                <div className="stat-value">{analytics?.toolUsage?.length || 0}</div>
                <div className="stat-label">Tools Used</div>
              </div>
            </div>
          </div>

          {/* Tool Usage Chart */}
          {analytics?.toolUsage && analytics.toolUsage.length > 0 && (
            <div className="chart-section">
              <h2 className="section-title">🔧 Tool Usage</h2>
              <div className="tool-chart">
                {analytics.toolUsage.map((tool, idx) => (
                  <div key={idx} className="chart-item">
                    <div className="chart-label">
                      <span>{tool.name}</span>
                      <span className="chart-value">{tool.usageCount} uses</span>
                    </div>
                    <div className="chart-bar-container">
                      <div
                        className="chart-bar"
                        style={{
                          width: `${(tool.usageCount / Math.max(...analytics.toolUsage.map(t => t.usageCount), 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity History */}
          {activityHistory.length > 0 && (
            <div className="history-section">
              <h2 className="section-title">📜 Recent Activity</h2>
              <div className="activity-timeline">
                {activityHistory.map((activity, idx) => (
                  <div key={idx} className="activity-item">
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <p className="activity-action">{activity.action}</p>
                      <p className="activity-time">{formatDate(activity.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!analytics?.toolUsage || analytics.toolUsage.length === 0 && (
            <div className="placeholder">
              <p>🎯 Start using tools to see your analytics here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics
