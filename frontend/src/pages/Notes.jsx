import React, { useState, useEffect, useCallback } from 'react'
import { notesAPI, toolsAPI } from '../api'
import './Tools.css'
import './Notes.css'

const Notes = () => {
  const [notes, setNotes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isNew, setIsNew] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchNotes() }, [])

  const fetchNotes = async () => {
    try {
      const { data } = await notesAPI.getAll()
      setNotes(data.data.notes || [])
    } catch { setError('Failed to load notes') }
    finally { setLoading(false) }
  }

  const selectNote = async (note) => {
    setSelectedId(note._id)
    setTitle(note.title)
    setDescription(note.description)
    setIsNew(false)
    setDirty(false)
    setError('')
    try { await toolsAPI.updateLastNote(note._id) } catch {}
  }

  const createNew = () => {
    setSelectedId(null)
    setTitle('')
    setDescription('')
    setIsNew(true)
    setDirty(false)
    setError('')
  }

  const saveNote = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    try {
      if (isNew) {
        const { data } = await notesAPI.add(title, description)
        const n = data.data.note
        setNotes(ns => [...ns, n])
        setSelectedId(n._id)
        setIsNew(false)
        try { await toolsAPI.updateLastNote(n._id) } catch {}
      } else {
        await notesAPI.update(selectedId, title, description)
        setNotes(ns => ns.map(n => n._id === selectedId ? { ...n, title, description } : n))
      }
      setDirty(false)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const deleteNote = async (id) => {
    try {
      await notesAPI.delete(id)
      setNotes(ns => ns.filter(n => n._id !== id))
      if (selectedId === id) { setSelectedId(null); setTitle(''); setDescription(''); setIsNew(false) }
    } catch { setError('Failed to delete note') }
  }

  const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0
  const charCount = description.length

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>📝 Notes</h1>
          <p>Keep track of your ideas and thoughts</p>
        </div>

        <div className="notes-layout">
          {/* Sidebar */}
          <div className="notes-sidebar">
            <button onClick={createNew} className="primary" style={{ width: '100%', marginBottom: '12px' }}>
              + New Note
            </button>
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', marginBottom: '12px', fontSize: '13px' }}
            />
            <div className="notes-list">
              {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--light-text-secondary)', fontSize: '13px', padding: '20px 0' }}>Loading...</p>
              ) : filteredNotes.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--light-text-secondary)', fontSize: '13px', padding: '20px 0' }}>
                  {notes.length === 0 ? 'No notes yet' : 'No results'}
                </p>
              ) : (
                filteredNotes.map(note => (
                  <div
                    key={note._id}
                    onClick={() => selectNote(note)}
                    className={`note-item ${selectedId === note._id ? 'active' : ''}`}
                  >
                    <div className="note-item-title">{note.title}</div>
                    <div className="note-item-preview">{note.description}</div>
                  </div>
                ))
              )}
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--light-text-secondary)', textAlign: 'center' }}>
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Editor */}
          <div className="notes-editor">
            {selectedId || isNew ? (
              <>
                <div className="notes-editor-header">
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={title}
                    onChange={e => { setTitle(e.target.value); setDirty(true) }}
                    className="notes-title-input"
                  />
                  <div className="notes-editor-actions">
                    {dirty && <span className="unsaved-badge">Unsaved</span>}
                    {!isNew && (
                      <button onClick={() => deleteNote(selectedId)} className="danger" style={{ padding: '7px 12px', fontSize: '13px' }}>🗑️</button>
                    )}
                    <button onClick={saveNote} className="primary" disabled={saving} style={{ padding: '7px 16px', fontSize: '13px' }}>
                      {saving ? '...' : '💾 Save'}
                    </button>
                  </div>
                </div>

                <textarea
                  placeholder="Write your note here..."
                  value={description}
                  onChange={e => { setDescription(e.target.value); setDirty(true) }}
                  className="notes-textarea"
                  onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNote() } }}
                />

                <div className="notes-footer">
                  {error && <span className="error-message" style={{ padding: '4px 0' }}>{error}</span>}
                  <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--light-text-secondary)' }}>
                    {wordCount} words · {charCount} chars · Ctrl+S to save
                  </span>
                </div>
              </>
            ) : (
              <div className="placeholder" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>👈 Select a note or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notes
