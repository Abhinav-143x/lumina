import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { ListSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#14b8a6', '#ec4899', '#8b5cf6', '#f97316']
const ICONS = ['💪', '📚', '🧘', '🏃', '💧', '🥗', '😴', '✍️', '🎯', '🎸', '🧹', '💊']
const CATEGORIES = ['health', 'fitness', 'learning', 'mindfulness', 'productivity', 'social', 'other']

function HabitForm({ onSave, onClose }) {
  const [data, setData] = useState({
    name: '',
    description: '',
    icon: '💪',
    color: '#6366f1',
    category: 'health',
    frequency: 'daily',
    target_count: 1
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (field) => (value) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const save = async () => {
    if (!data.name.trim()) return
    setSaving(true)
    try {
      await api.post('/habits/', data)
      onSave()
    } catch (e) {
      alert(JSON.stringify(e.response?.data))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '100%', maxWidth: '28rem' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>New Habit</h2>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              placeholder="e.g. Morning run"
              value={data.name}
              onChange={(e) => handleChange('name')(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Icon</label>
            <div className="icon-picker">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => handleChange('icon')(icon)}
                  className={`icon-option ${data.icon === icon ? 'icon-option-selected' : ''}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Color</label>
            <div className="color-picker">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleChange('color')(color)}
                  className={`color-option ${data.color === color ? 'color-option-selected' : ''}`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={data.category}
              onChange={(e) => handleChange('category')(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Frequency</label>
            <select
              value={data.frequency}
              onChange={(e) => handleChange('frequency')(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays only</option>
              <option value="weekends">Weekends only</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={save}
            disabled={saving}
            className="btn-primary"
            style={{ flex: 1 }}
          >
            {saving ? 'Saving...' : 'Create Habit'}
          </button>
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function HabitCard({ habit, onCheckIn, onDelete }) {
  const [checking, setChecking] = useState(false)

  const checkIn = async () => {
    setChecking(true)
    try {
      await onCheckIn(habit.id, !habit.completed_today)
    } finally {
      setChecking(false)
    }
  }

  const streakColor =
    habit.streak?.current >= 7
      ? 'var(--success)'
      : habit.streak?.current >= 3
      ? 'var(--warning)'
      : 'var(--text-muted)'

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Check button */}
        <button
          onClick={checkIn}
          disabled={checking}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '0.375rem',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            border: '2px solid',
            background: habit.completed_today ? habit.color : 'transparent',
            borderColor: habit.completed_today ? habit.color : 'var(--border-color)',
            cursor: 'pointer',
            color: habit.completed_today ? 'white' : 'inherit'
          }}
        >
          {habit.completed_today ? '✓' : habit.icon}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)' }}>{habit.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            <span style={{ textTransform: 'capitalize' }}>{habit.category}</span>
            <span>·</span>
            <span style={{ color: streakColor }}>
              🔥 {habit.streak?.current ?? 0} day streak
            </span>
            <span>·</span>
            <span>{habit.completion_rate_30d}% last 30d</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link to={`/habits/${habit.id}`} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
            Analytics
          </Link>
          <button
            onClick={() => onDelete(habit.id)}
            className="btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem', opacity: 0 }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [aiReport, setAiReport] = useState('')
  const [reportLoading, setReportLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/habits/?active=true')
      setHabits(data.results || data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const checkIn = async (id, doCheck) => {
    if (doCheck) {
      await api.post(`/habits/${id}/check-in/`)
    } else {
      await api.delete(`/habits/${id}/check-in/`)
    }
    load()
  }

  const deleteHabit = async (id) => {
    if (!confirm('Delete this habit? All history will be lost.')) return
    await api.delete(`/habits/${id}/`)
    load()
  }

  const getAiReport = async () => {
    setReportLoading(true)
    try {
      const { data } = await api.post('/habits/ai-report/')
      setAiReport(data.report)
    } catch {
      setAiReport('AI report unavailable. Check your API key.')
    } finally {
      setReportLoading(false)
    }
  }

  const completedToday = habits.filter((h) => h.completed_today).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>✅ Habits</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            {completedToday}/{habits.length} done today
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={getAiReport}
            disabled={reportLoading}
            className="btn-ghost"
          >
            {reportLoading ? (
              <>
                <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              '🤖 AI Insight'
            )}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <span style={{ fontSize: '1.25rem' }}>+</span> New Habit
          </button>
        </div>
      </div>

      {/* AI Report */}
      {aiReport && (
        <div className="card" style={{ background: 'var(--bg-active)', border: '1px solid var(--border-gold)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            🤖 AI WEEKLY INSIGHT
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{aiReport}</div>
        </div>
      )}

      {/* Progress Card */}
      {habits.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Today's progress</span>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
              {completedToday}/{habits.length}
            </span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                background: 'var(--success)',
                borderRadius: '4px',
                transition: 'all 0.3s ease',
                width: `${habits.length ? (completedToday / habits.length) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Habits List */}
      {loading ? (
        <ListSkeleton count={5} />
      ) : habits.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No habits yet"
          description="Start building your first habit to track progress"
          action={{ label: 'Create first habit', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onCheckIn={checkIn}
              onDelete={deleteHabit}
            />
          ))}
        </div>
      )}

      {showForm && (
        <HabitForm
          onSave={() => {
            setShowForm(false)
            load()
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
