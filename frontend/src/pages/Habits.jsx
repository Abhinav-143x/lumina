import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

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
    <div className="fixed inset-0 bg-black/60 z-modal flex items-center justify-center p-4">
      <div className="bg-secondary border border-primary rounded-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-6">New Habit</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Morning run"
              value={data.name}
              onChange={(e) => handleChange('name')(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => handleChange('icon')(icon)}
                  className={`w-10 h-10 rounded-lg border-2 text-xl ${
                    data.icon === icon
                      ? 'border-primary bg-accent/10'
                      : 'border-primary hover:border-accent/30'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Color
            </label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleChange('color')(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    data.color === color
                      ? 'border-white'
                      : 'border-transparent'
                  }`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Category
            </label>
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

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Frequency
            </label>
            <select
              value={data.frequency}
              onChange={(e) => handleChange('frequency')(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays only</option>
              <option value="weekends">Weekends only</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={save}
              disabled={saving}
              className="btn btn-primary flex-1"
            >
              {saving ? 'Saving...' : 'Create Habit'}
            </button>
            <button onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
          </div>
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
      ? 'text-success'
      : habit.streak?.current >= 3
      ? 'text-warning'
      : 'text-tertiary'

  return (
    <div className="card">
      <div className="flex items-center gap-4">
        {/* Check button */}
        <button
          onClick={checkIn}
          disabled={checking}
          className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl transition-colors ${
            habit.completed_today
              ? 'bg-opacity-20 border-2'
              : 'border-2 hover:border-accent/30'
          }`}
          style={{
            borderColor: habit.completed_today ? habit.color : 'var(--border-primary)',
            background: habit.completed_today ? habit.color : 'transparent',
          }}
        >
          {habit.completed_today ? '✓' : habit.icon}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg">{habit.name}</h3>
          <div className="flex items-center gap-2 text-sm text-tertiary mt-1 flex-wrap">
            <span className="capitalize">{habit.category}</span>
            <span>·</span>
            <span className={streakColor}>
              🔥 {habit.streak?.current ?? 0} day streak
            </span>
            <span>·</span>
            <span>{habit.completion_rate_30d}% last 30d</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/habits/${habit.id}`} className="btn btn-sm btn-ghost">
            Analytics
          </Link>
          <button
            onClick={() => onDelete(habit.id)}
            className="btn btn-sm btn-ghost opacity-0 group-hover:opacity-100"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>✅ Habits</h1>
          <p className="text-sm text-secondary">
            {completedToday}/{habits.length} done today
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={getAiReport}
            disabled={reportLoading}
            className="btn btn-ghost"
          >
            {reportLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
            className="btn btn-primary"
          >
            <span className="text-xl">+</span> New Habit
          </button>
        </div>
      </div>

      {/* AI Report */}
      {aiReport && (
        <div className="card bg-accent/5 border-accent/20">
          <div className="text-sm font-semibold text-primary mb-2">
            🤖 AI WEEKLY INSIGHT
          </div>
          <div className="text-sm">{aiReport}</div>
        </div>
      )}

      {/* Progress Card */}
      {habits.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-secondary">Today's progress</span>
            <span className="text-sm font-semibold">
              {completedToday}/{habits.length}
            </span>
          </div>
          <div className="h-2 bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-success rounded-full transition-all duration-300"
              style={{
                width: `${habits.length ? (completedToday / habits.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Habits List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <div className="text-secondary">Loading...</div>
          </div>
        </div>
      ) : habits.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="font-semibold text-lg mb-3">No habits yet</h3>
          <p className="text-secondary mb-6">
            Start building your first habit to track progress.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            Create first habit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
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
