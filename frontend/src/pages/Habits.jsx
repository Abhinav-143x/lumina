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
    <div className="fixed inset-0 bg-black/60 z-modal flex items-center justify-center p-4 backdrop-blur-xl">
      <div className="bg-secondary border border-primary rounded-2xl w-full max-w-md p-8 shadow-2xl animate-scale-in">
        <h2 className="text-2xl font-semibold mb-8">New Habit</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Morning run"
              value={data.name}
              onChange={(e) => handleChange('name')(e.target.value)}
              className="transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              Icon
            </label>
            <div className="flex flex-wrap gap-3">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => handleChange('icon')(icon)}
                  className={`w-12 h-12 rounded-xl border-2 text-2xl transition-all duration-200 ${
                    data.icon === icon
                      ? 'border-accent bg-accent/10 shadow-glow'
                      : 'border-primary hover:border-accent hover:scale-110'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              Color
            </label>
            <div className="flex gap-3">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleChange('color')(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    data.color === color
                      ? 'border-white scale-110 shadow-glow'
                      : 'border-transparent hover:scale-110'
                  }`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              Category
            </label>
            <select
              value={data.category}
              onChange={(e) => handleChange('category')(e.target.value)}
              className="transition-all duration-200"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              Frequency
            </label>
            <select
              value={data.frequency}
              onChange={(e) => handleChange('frequency')(e.target.value)}
              className="transition-all duration-200"
            >
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays only</option>
              <option value="weekends">Weekends only</option>
            </select>
          </div>

          <div className="flex gap-4 pt-6">
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
    <div className="card group animate-slide-in hover-lift">
      <div className="flex items-center gap-5">
        {/* Check button */}
        <button
          onClick={checkIn}
          disabled={checking}
          className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-4xl transition-all duration-300 ${
            habit.completed_today
              ? 'bg-opacity-20 border-3 shadow-glow'
              : 'border-2 hover:border-accent hover:scale-110'
          }`}
          style={{
            borderColor: habit.completed_today ? habit.color : 'var(--border-primary)',
            background: habit.completed_today ? habit.color : 'transparent',
          }}
        >
          {habit.completed_today ? '✓' : habit.icon}
        </button>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-xl">{habit.name}</h3>
          <div className="flex items-center gap-3 text-sm text-tertiary mt-2 flex-wrap">
            <span className="capitalize font-semibold">{habit.category}</span>
            <span>·</span>
            <span className={streakColor}>
              🔥 {habit.streak?.current ?? 0} day streak
            </span>
            <span>·</span>
            <span>{habit.completion_rate_30d}% last 30d</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/habits/${habit.id}`} className="btn btn-ghost btn-sm">
            Analytics
          </Link>
          <button
            onClick={() => onDelete(habit.id)}
            className="btn btn-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-5xl font-bold mb-3">✅ Habits</h1>
          <p className="text-lg text-secondary font-medium">
            {completedToday}/{habits.length} done today
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={getAiReport}
            disabled={reportLoading}
            className="btn btn-ghost"
          >
            {reportLoading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
            <span className="text-2xl">+</span> New Habit
          </button>
        </div>
      </div>

      {/* AI Report */}
      {aiReport && (
        <div className="card bg-accent/5 border-accent/20 animate-fade-in">
          <div className="text-sm font-semibold text-accent mb-3">
            🤖 AI WEEKLY INSIGHT
          </div>
          <div className="text-sm leading-relaxed">{aiReport}</div>
        </div>
      )}

      {/* Progress Card */}
      {habits.length > 0 && (
        <div className="card animate-slide-up hover-lift">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg text-secondary font-semibold">Today's progress</span>
            <span className="text-lg font-bold">
              {completedToday}/{habits.length}
            </span>
          </div>
          <div className="h-4 bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-success to-emerald-600 rounded-full transition-all duration-500 shadow-glow"
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
          <div className="animate-spin w-12 h-12 border-3 border-accent border-t-transparent rounded-full" />
        </div>
      ) : habits.length === 0 ? (
        <div className="card text-center py-20 animate-fade-in">
          <div className="text-7xl mb-6">🎯</div>
          <h3 className="font-bold text-2xl mb-4">No habits yet</h3>
          <p className="text-secondary text-lg mb-8">
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
        <div className="space-y-4">
          {habits.map((habit, index) => (
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