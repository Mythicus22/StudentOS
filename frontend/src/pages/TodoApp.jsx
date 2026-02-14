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

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const { data } = await todoAPI.getAll()
      setTodos(data.data.todos || [])
    } catch (err) {
      setError('Failed to load todos')
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    try {
      const { data } = await todoAPI.add(newTodo)
      setTodos([...todos, data.data.todo])
      setNewTodo('')
    } catch (err) {
      setError('Failed to add todo')
    }
  }

  const toggleTodo = async (todo) => {
    try {
      await todoAPI.update(todo._id, todo.title, !todo.isMarked)
      setTodos(todos.map(t => t._id === todo._id ? {...t, isMarked: !t.isMarked} : t))
    } catch (err) {
      setError('Failed to update todo')
    }
  }

  const startEdit = (todo) => {
    setEditingId(todo._id)
    setEditText(todo.title)
  }

  const saveEdit = async (todo) => {
    if (!editText.trim()) return

    try {
      await todoAPI.update(todo._id, editText, todo.isMarked)
      setTodos(todos.map(t => t._id === todo._id ? {...t, title: editText} : t))
      setEditingId(null)
    } catch (err) {
      setError('Failed to update todo')
    }
  }

  const deleteTodo = async (id) => {
    try {
      await todoAPI.delete(id)
      setTodos(todos.filter(t => t._id !== id))
    } catch (err) {
      setError('Failed to delete todo')
    }
  }

  const completedCount = todos.filter(t => t.isMarked).length
  const pendingCount = todos.length - completedCount

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>✓ To-Do List</h1>
          <p>Manage your tasks and stay productive</p>
        </div>

        <div className="tool-content">
          <div className="tool-form">
            <form onSubmit={addTodo}>
              <div className="form-group">
                <label htmlFor="newTodo">Add New Task</label>
                <div style={{display: 'flex', gap: '8px'}}>
                  <input
                    type="text"
                    id="newTodo"
                    placeholder="What do you want to accomplish?"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    style={{flex: 1}}
                  />
                  <button type="submit" className="primary">Add</button>
                </div>
              </div>
            </form>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '20px'}}>
              <div className="stat-card">
                <div className="stat-value">{pendingCount}</div>
                <div className="stat-label">Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{completedCount}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
          </div>

          {error && <div className="error-message" style={{background: 'rgba(220, 38, 38, 0.1)', padding: '12px', borderRadius: '6px'}}>{error}</div>}

          <div className="list-items">
            {loading ? (
              <div className="placeholder"><p>Loading todos...</p></div>
            ) : todos.length === 0 ? (
              <div className="placeholder"><p>No tasks yet. Add one to get started! 🚀</p></div>
            ) : (
              todos.map((todo) => (
                <div key={todo._id} className={`list-item ${todo.isMarked ? 'completed' : ''}`}>
                  <input
                    type="checkbox"
                    checked={todo.isMarked}
                    onChange={() => toggleTodo(todo)}
                    style={{cursor: 'pointer'}}
                  />
                  {editingId === todo._id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      style={{flex: 1, marginLeft: '12px'}}
                      onBlur={() => saveEdit(todo)}
                      onKeyPress={(e) => e.key === 'Enter' && saveEdit(todo)}
                      autoFocus
                    />
                  ) : (
                    <span className="item-text">{todo.title}</span>
                  )}
                  <div className="item-actions">
                    {editingId !== todo._id && (
                      <button onClick={() => startEdit(todo)} className="secondary" style={{fontSize: '12px', padding: '6px 12px'}}>
                        ✏️
                      </button>
                    )}
                    <button onClick={() => deleteTodo(todo._id)} className="danger" style={{fontSize: '12px', padding: '6px 12px'}}>
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

export default TodoApp
