import React, { useState, useEffect } from 'react'
import { notesAPI, toolsAPI } from '../api'
import './Tools.css'

const Notes = () => {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const { data } = await notesAPI.getAll()
      setNotes(data.data.notes || [])
    } catch (err) {
      setError('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const selectNote = async (note) => {
    setSelectedNote(note._id)
    setTitle(note.title)
    setDescription(note.description)
    setIsNew(false)
    try {
      await toolsAPI.updateLastNote(note._id)
    } catch (err) {
      console.error('Failed to update last note')
    }
  }

  const createNewNote = () => {
    setSelectedNote(null)
    setTitle('')
    setDescription('')
    setIsNew(true)
  }

  const saveNote = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Please fill in all fields')
      return
    }

    try {
      if (isNew) {
        const { data } = await notesAPI.add(title, description)
        const newNote = data.data.note
        setNotes([...notes, newNote])
        setSelectedNote(newNote._id)
        await toolsAPI.updateLastNote(newNote._id)
        setIsNew(false)
      } else {
        await notesAPI.update(selectedNote, title, description)
        setNotes(notes.map(n => n._id === selectedNote ? {_id: selectedNote, title, description} : n))
      }
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save note')
    }
  }

  const deleteNote = async (id) => {
    try {
      await notesAPI.delete(id)
      setNotes(notes.filter(n => n._id !== id))
      if (selectedNote === id) {
        setSelectedNote(null)
        setTitle('')
        setDescription('')
      }
    } catch (err) {
      setError('Failed to delete note')
    }
  }

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>📝 Notes</h1>
          <p>Keep track of your ideas and thoughts</p>
        </div>

        <div className="tool-content" style={{display: 'grid', gridTemplateColumns: '250px 1fr', gap: '20px', maxWidth: '1000px', margin: '0 auto'}}>
          {/* Sidebar */}
          <div style={{background: 'var(--light-surface)', borderRadius: '8px', padding: '16px', maxHeight: '600px', overflowY: 'auto'}}>
            <button onClick={createNewNote} className="primary" style={{width: '100%', marginBottom: '16px'}}>
              ➕ New Note
            </button>

            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {notes.length === 0 ? (
                <p style={{padding: '16px', textAlign: 'center', color: 'var(--light-text-secondary)', fontSize: '14px'}}>
                  No notes yet
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note._id}
                    onClick={() => selectNote(note)}
                    style={{
                      padding: '12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: selectedNote === note._id ? 'var(--primary)' : 'var(--light-border)',
                      color: selectedNote === note._id ? 'white' : 'var(--light-text)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <p style={{margin: 0, fontWeight: 500, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {note.title}
                    </p>
                    <p style={{margin: '4px 0 0 0', fontSize: '12px', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {note.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Editor */}
          <div style={{background: 'var(--light-surface)', borderRadius: '8px', padding: '20px'}}>
            {selectedNote || isNew ? (
              <>
                <div className="form-group">
                  <label htmlFor="noteTitle">Title</label>
                  <input
                    type="text"
                    id="noteTitle"
                    placeholder="Enter note title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="noteDesc">Description</label>
                  <textarea
                    id="noteDesc"
                    placeholder="Write your note here..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{minHeight: '300px', resize: 'vertical'}}
                  />
                </div>

                {error && <div className="error-message" style={{background: 'rgba(220, 38, 38, 0.1)', padding: '12px', borderRadius: '6px', marginBottom: '12px'}}>{error}</div>}

                <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
                  {!isNew && (
                    <button onClick={() => deleteNote(selectedNote)} className="danger">
                      🗑️ Delete
                    </button>
                  )}
                  <button onClick={saveNote} className="primary">
                    💾 Save
                  </button>
                </div>
              </>
            ) : (
              <div className="placeholder">
                <p>👈 Select a note to edit or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notes
