import React, { useState, useEffect } from 'react'
import { todoAPI } from '../api'
import './Tools.css'

const TodoApp = () => {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchTodos() }, [])

  const fetchTodos = async () => {
    try {
      const { data } = await todoAPI.getAll()
      setTodos(data.data.todos || [])
    } catch { setError('Failed to load todos') }
    finally { setLoading(false) }
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    try {
      const { data } = await todoAPI.add(newTodo)
      setTodos(t => [...t, data.data.todo])
      setNewTodo('')
    } catch { setError('Failed to add todo') }
  }

  const toggleTodo = async (todo) => {
    try {
      await todoAPI.update(todo._id, todo.title, !todo.isMarked)
      setTodos(ts => ts.map(t => t._id === todo._id ? { ...t, isMarked: !t.isMarked } : t))
    } catch { setError('Failed to update todo') }
  }

  const saveEdit = async (todo) => {
    if (!editText.trim()) { setEditingId(null); return }
    try {
      await todoAPI.update(todo._id, editText, todo.isMarked)
      setTodos(ts => ts.map(t => t._id === todo._id ? { ...t, title: editText } : t))
      setEditingId(null)
    } catch { setError('Failed to update todo') }
  }

  const deleteTodo = async (id) => {
    try {
      await todoAPI.delete(id)
      setTodos(ts => ts.filter(t => t._id !== id))
    } catch { setError('Failed to delete todo') }
  }

  const completedCount = todos.filter(t => t.isMarked).length
  const progress = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.isMarked
    if (filter === 'done') return t.isMarked
    return true
  })

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>✅ To-Do List</h1>
          <p>Manage your tasks and stay productive</p>
        </div>

        <div className="tool-content">
          <div className="tool-form">
            <form onSubmit={addTodo}>
              <div className="form-group">
                <label htmlFor="newTodo">Add New Task</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    id="newTodo"
                    placeholder="What do you want to accomplish?"
                    value={newTodo}
                    onChange={e => setNewTodo(e.target.value)}
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <button type="submit" className="primary">Add</button>
                </div>
              </div>
            </form>

            {/* Stats + progress */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px' }}>
              <div className="stat-card">
                <div className="stat-value">{todos.length}</div>
                <div className="stat-label">Total</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--warning)' }}>{todos.length - completedCount}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--success)' }}>{completedCount}</div>
                <div className="stat-label">Done</div>
              </div>
            </div>

            {todos.length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--light-text-secondary)', marginBottom: '6px' }}>
                  <span>Progress</span><span>{progress}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--light-border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--primary), var(--success))', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            )}
          </div>

          {error && <div className="error-message" style={{ marginBottom: '12px' }}>{error}</div>}

          {/* Filter tabs */}
          {todos.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', background: 'var(--light-surface)', padding: '4px', borderRadius: '8px', border: '1px solid var(--light-border)', width: 'fit-content' }}>
              {['all', 'active', 'done'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{ padding: '5px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', background: filter === f ? 'var(--primary)' : 'transparent', color: filter === f ? 'white' : 'var(--light-text-secondary)', transition: 'all 0.15s' }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          )}

          <div className="list-items">
            {loading ? (
              <div className="placeholder"><p>Loading todos...</p></div>
            ) : filtered.length === 0 ? (
              <div className="placeholder"><p>{todos.length === 0 ? 'No tasks yet. Add one to get started! 🚀' : 'No tasks in this filter.'}</p></div>
            ) : (
              filtered.map(todo => (
                <div key={todo._id} className={`list-item ${todo.isMarked ? 'completed' : ''}`}>
                  <input type="checkbox" checked={todo.isMarked} onChange={() => toggleTodo(todo)} style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)', flexShrink: 0 }} />
                  {editingId === todo._id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      style={{ flex: 1 }}
                      onBlur={() => saveEdit(todo)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(todo); if (e.key === 'Escape') setEditingId(null) }}
                      autoFocus
                    />
                  ) : (
                    <span className="item-text" onDoubleClick={() => { setEditingId(todo._id); setEditText(todo.title) }}>{todo.title}</span>
                  )}
                  <div className="item-actions">
                    {editingId !== todo._id && (
                      <button onClick={() => { setEditingId(todo._id); setEditText(todo.title) }} className="secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>✏️</button>
                    )}
                    <button onClick={() => deleteTodo(todo._id)} className="danger" style={{ padding: '5px 10px', fontSize: '12px' }}>🗑️</button>
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

export default TodoApp
