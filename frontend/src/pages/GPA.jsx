import React, { useState } from 'react'
import './Tools.css'
import './GPA.css'

// IPU grading: marks out of 100 → grade points (10-point scale)
const getGradePoint = (marks) => {
  if (marks >= 90) return { gp: 10, letter: 'O' }
  if (marks >= 75) return { gp: 9, letter: 'A+' }
  if (marks >= 65) return { gp: 8, letter: 'A' }
  if (marks >= 55) return { gp: 7, letter: 'B+' }
  if (marks >= 50) return { gp: 6, letter: 'B' }
  if (marks >= 45) return { gp: 5, letter: 'C' }
  if (marks >= 40) return { gp: 4, letter: 'P' }
  return { gp: 0, letter: 'F' }
}

const emptyRow = () => ({ id: Date.now() + Math.random(), name: '', credits: 4, marks: '' })

const GPA = () => {
  const [courses, setCourses] = useState([emptyRow()])
  const [semesterHistory, setSemesterHistory] = useState([])
  const [semesterName, setSemesterName] = useState('')

  const updateCourse = (id, field, value) => {
    setCourses(cs => cs.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const addCourse = () => setCourses(cs => [...cs, emptyRow()])
  const removeCourse = (id) => { if (courses.length > 1) setCourses(cs => cs.filter(c => c.id !== id)) }

  const validCourses = courses.filter(c => c.credits > 0 && c.marks !== '' && Number(c.marks) >= 0 && Number(c.marks) <= 100)
  const totalCredits = validCourses.reduce((s, c) => s + Number(c.credits), 0)
  const totalPoints = validCourses.reduce((s, c) => s + getGradePoint(Number(c.marks)).gp * Number(c.credits), 0)
  const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0

  const getColor = (g) => {
    if (g >= 9) return '#10b981'
    if (g >= 7) return '#3b82f6'
    if (g >= 5) return '#f59e0b'
    return '#ef4444'
  }

  const getLabel = (g) => {
    if (g >= 9) return 'Outstanding'
    if (g >= 7) return 'Good'
    if (g >= 5) return 'Average'
    if (g > 0) return 'Needs Improvement'
    return '—'
  }

  const saveSemester = () => {
    if (totalCredits === 0) return
    const name = semesterName.trim() || `Semester ${semesterHistory.length + 1}`
    setSemesterHistory(h => [...h, { name, sgpa: sgpa.toFixed(2), credits: totalCredits, courses: courses.length }])
    setSemesterName('')
    setCourses([emptyRow()])
  }

  const cgpa = semesterHistory.length > 0
    ? semesterHistory.reduce((s, sem) => s + parseFloat(sem.sgpa) * sem.credits, 0) /
      semesterHistory.reduce((s, sem) => s + sem.credits, 0)
    : null

  return (
    <div className="tool-container">
      <div className="container">
        <div className="tool-header">
          <h1>🎓 GPA Calculator</h1>
          <p>IPU grading system — enter marks out of 100</p>
        </div>

        <div className="gpa-layout">
          <div className="gpa-card">
            <div className="gpa-card-header">
              <h2>Courses</h2>
              <button className="primary" onClick={addCourse} style={{ padding: '7px 14px', fontSize: '13px' }}>+ Add Course</button>
            </div>
            <div className="gpa-table">
              <div className="gpa-table-head">
                <span>Course Name</span>
                <span>Credits</span>
                <span>Marks /100</span>
                <span>Grade</span>
                <span></span>
              </div>
              {courses.map(course => {
                const { gp, letter } = course.marks !== '' ? getGradePoint(Number(course.marks)) : { gp: null, letter: '—' }
                return (
                  <div key={course.id} className="gpa-table-row">
                    <input
                      type="text"
                      placeholder="e.g. Mathematics"
                      value={course.name}
                      onChange={e => updateCourse(course.id, 'name', e.target.value)}
                    />
                    <input
                      type="number" min="1" max="6" step="1"
                      value={course.credits}
                      onChange={e => updateCourse(course.id, 'credits', e.target.value)}
                    />
                    <input
                      type="number" min="0" max="100" step="1"
                      placeholder="0–100"
                      value={course.marks}
                      onChange={e => updateCourse(course.id, 'marks', e.target.value)}
                    />
                    <span className="gpa-grade-badge" style={{ color: gp !== null ? getColor(gp) : 'var(--light-text-secondary)' }}>
                      {letter}{gp !== null ? ` (${gp})` : ''}
                    </span>
                    <button onClick={() => removeCourse(course.id)} className="danger" style={{ padding: '6px 10px', fontSize: '13px' }}>✕</button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="gpa-result-col">
            <div className="gpa-result-card" style={{ borderColor: getColor(sgpa) }}>
              <div className="gpa-result-label">Semester SGPA</div>
              <div className="gpa-result-value" style={{ color: getColor(sgpa) }}>
                {totalCredits > 0 ? sgpa.toFixed(2) : '—'}
              </div>
              <div className="gpa-result-badge" style={{ background: getColor(sgpa) }}>
                {getLabel(sgpa)}
              </div>
              <div className="gpa-result-meta">
                <span>{totalCredits} credits</span>
                <span>{validCourses.length} courses</span>
              </div>
            </div>

            <div className="gpa-save-card">
              <h3>Save Semester</h3>
              <input
                type="text" placeholder="e.g. Sem 1 — 2024"
                value={semesterName}
                onChange={e => setSemesterName(e.target.value)}
                style={{ width: '100%', marginBottom: '10px' }}
              />
              <button className="primary" onClick={saveSemester} disabled={totalCredits === 0} style={{ width: '100%' }}>
                Save & Start New Semester
              </button>
            </div>

            {cgpa !== null && (
              <div className="gpa-cumulative">
                <div className="gpa-cumulative-label">Cumulative CGPA</div>
                <div className="gpa-cumulative-value" style={{ color: getColor(cgpa) }}>
                  {cgpa.toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>

        {semesterHistory.length > 0 && (
          <div className="gpa-history">
            <h2 className="gpa-history-title">📚 Semester History</h2>
            <div className="gpa-history-grid">
              {semesterHistory.map((sem, i) => (
                <div key={i} className="gpa-history-card">
                  <div className="gpa-history-name">{sem.name}</div>
                  <div className="gpa-history-gpa" style={{ color: getColor(parseFloat(sem.sgpa)) }}>{sem.sgpa}</div>
                  <div className="gpa-history-meta">{sem.credits} credits · {sem.courses} courses</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="gpa-scale">
          <h3>IPU Grade Scale</h3>
          <div className="gpa-scale-grid">
            {[['O', '≥90', 10], ['A+', '75–89', 9], ['A', '65–74', 8], ['B+', '55–64', 7],
              ['B', '50–54', 6], ['C', '45–49', 5], ['P', '40–44', 4], ['F', '<40', 0]].map(([g, range, gp]) => (
              <div key={g} className="gpa-scale-item">
                <span className="gpa-scale-grade">{g}</span>
                <span className="gpa-scale-range">{range}</span>
                <span className="gpa-scale-points">GP {gp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GPA
