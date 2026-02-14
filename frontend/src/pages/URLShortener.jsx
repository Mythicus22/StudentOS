import React, { useState, useEffect } from 'react'
import { urlAPI } from '../api'
import './Tools.css'

const URLShortener = () => {
  const [urls, setUrls] = useState([])
  const [originalUrl, setOriginalUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    fetchUrls()
  }, [])

  const fetchUrls = async () => {
    try {
      const { data } = await urlAPI.getAll()
      setUrls(data.data.urls || [])
    } catch (err) {
      setError('Failed to load URLs')
    } finally {
      setLoading(false)
    }
  }

  const shortenUrl = async (e) => {
    e.preventDefault()
    if (!originalUrl.trim()) {
      setError('Please enter a URL')
      return
    }

    // Simple URL validation
    if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
      setError('URL must start with http:// or https://')
      return
    }

    setCreating(true)
    setError('')

    try {
      const { data } = await urlAPI.shorten(originalUrl)
      setUrls([...urls, {
        shortUrl: data.data.shortUrl,
        originalUrl: originalUrl,
        clicks: 0,
        _id: Math.random().toString()
      }])
      setOriginalUrl('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to shorten URL')
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  const deleteUrl = async (shortUrl) => {
    try {
      await urlAPI.remove(shortUrl)
      setUrls(urls.filter(u => u.shortUrl !== shortUrl))
    } catch (err) {
      setError('Failed to delete URL')
    }
  }

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>🔗 URL Shortener</h1>
          <p>Create short, shareable links</p>
        </div>

        <div className="tool-content">
          <div className="tool-form">
            <form onSubmit={shortenUrl}>
              <div className="form-group">
                <label htmlFor="url">Long URL</label>
                <div style={{display: 'flex', gap: '8px'}}>
                  <input
                    type="url"
                    id="url"
                    placeholder="https://example.com/very/long/url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    style={{flex: 1}}
                    disabled={creating}
                  />
                  <button type="submit" className="primary" disabled={creating}>
                    {creating ? '⏳' : '✂️'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {error && <div className="error-message" style={{background: 'rgba(220, 38, 38, 0.1)', padding: '12px', borderRadius: '6px'}}>{error}</div>}

          <div className="list-items">
            {loading ? (
              <div className="placeholder"><p>Loading URLs...</p></div>
            ) : urls.length === 0 ? (
              <div className="placeholder"><p>No shortened URLs yet. Create your first one! 🎯</p></div>
            ) : (
              urls.map((url) => (
                <div key={url._id} className="url-item">
                  <div className="url-original">
                    <p className="label">Original URL</p>
                    <p className="url-link" title={url.originalUrl}>{url.originalUrl}</p>
                  </div>
                  <div className="url-short">
                    <p className="label">Short URL</p>
                    <p className="url-link" title={url.shortUrl}>{url.shortUrl}</p>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <p className="label">Clicks</p>
                    <p style={{margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--primary)'}}>{url.clicks}</p>
                  </div>
                  <div className="item-actions">
                    <button
                      onClick={() => copyToClipboard(url.shortUrl)}
                      className="primary"
                      style={{fontSize: '12px', padding: '6px 12px'}}
                    >
                      {copied === url.shortUrl ? '✓' : '📋'}
                    </button>
                    <button
                      onClick={() => deleteUrl(url.shortUrl)}
                      className="danger"
                      style={{fontSize: '12px', padding: '6px 12px'}}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default URLShortener
