import { useState, useEffect } from 'react'
import api from '../api/client'

const COLOR_MAP = {
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  purple: '#8b5cf6',
  amber: '#f59e0b',
  teal: '#14b8a6',
}

function EventForm({ date, event, onSave, onClose }) {
  const [data, setData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    start_datetime: event?.start_datetime
      ? event.start_datetime.slice(0, 16)
      : date
      ? `${date}T09:00`
      : '',
    end_datetime: event?.end_datetime ? event.end_datetime.slice(0, 16) : '',
    all_day: event?.all_day || false,
    color: event?.color || 'blue',
    location: event?.location || '',
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (field) => (value) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const save = async () => {
    if (!data.title.trim()) return
    setSaving(true)
    try {
      if (event?.id) {
        await api.patch(`/calendar/events/${event.id}/`, data)
      } else {
        await api.post('/calendar/events/', data)
      }
      onSave()
    } catch (e) {
      alert(JSON.stringify(e.response?.data))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-modal flex items-center justify-center p-4 backdrop-blur-xl animate-scale-in">
      <div className="bg-secondary border border-primary rounded-2xl w-full max-w-md p-8 shadow-2xl">
        <h2 className="text-2xl font-semibold mb-8">
          {event?.id ? 'Edit Event' : 'New Event'}
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              Title *
            </label>
            <input
              type="text"
              placeholder="Event title"
              value={data.title}
              onChange={(e) => handleChange('title')(e.target.value)}
              className="transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-3">
                Start
              </label>
              <input
                type="datetime-local"
                value={data.start_datetime}
                onChange={(e) => handleChange('start_datetime')(e.target.value)}
                className="transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-3">
                End
              </label>
              <input
                type="datetime-local"
                value={data.end_datetime}
                onChange={(e) => handleChange('end_datetime')(e.target.value)}
                className="transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              Location
            </label>
            <input
              type="text"
              placeholder="Optional"
              value={data.location}
              onChange={(e) => handleChange('location')(e.target.value)}
              className="transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              Color
            </label>
            <div className="flex gap-3">
              {Object.entries(COLOR_MAP).map(([name, hex]) => (
                <button
                  key={name}
                  onClick={() => handleChange('color')(name)}
                  className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                    data.color === name
                      ? 'border-white scale-110 shadow-glow'
                      : 'border-transparent hover:scale-110'
                  }`}
                  style={{ background: hex }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              Description
            </label>
            <textarea
              placeholder="Optional notes"
              value={data.description}
              onChange={(e) => handleChange('description')(e.target.value)}
              className="min-h-[100px] transition-all duration-200"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              onClick={save}
              disabled={saving}
              className="btn btn-primary flex-1"
            >
              {saving ? 'Saving...' : 'Save Event'}
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

export default function CalendarPage() {
  const today = new Date()
  const [current, setCurrent] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  })
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)

  const load = async () => {
    const start = new Date(current.year, current.month, 1).toISOString()
    const end = new Date(current.year, current.month + 1, 0, 23, 59).toISOString()
    try {
      const { data } = await api.get(
        `/calendar/events/?start=${start}&end=${end}`
      )
      setEvents(data.results || data)
    } catch {}
  }

  useEffect(() => {
    load()
  }, [current])

  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate()
  const firstDay = new Date(current.year, current.month, 1).getDay()
  const monthName = new Date(current.year, current.month).toLocaleDateString('en', {
    month: 'long',
    year: 'numeric',
  })

  const eventsForDay = (day) => {
    const key = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter((e) => e.start_datetime.startsWith(key))
  }

  const isToday = (day) =>
    today.getFullYear() === current.year &&
    today.getMonth() === current.month &&
    today.getDate() === day

  const prevMonth = () =>
    setCurrent((c) =>
      c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }
    )
  const nextMonth = () =>
    setCurrent((c) =>
      c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }
    )

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return
    await api.delete(`/calendar/events/${id}/`)
    load()
  }

  const dayClick = (day) => {
    const key = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(key)
    setEditing(null)
    setShowForm(true)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold mb-3">📅 Calendar</h1>
          <p className="text-lg text-secondary font-medium">Schedule and manage your events</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="btn btn-ghost btn-sm">
            ←
          </button>
          <span className="text-xl font-bold min-w-[200px] text-center">
            {monthName}
          </span>
          <button onClick={nextMonth} className="btn btn-ghost btn-sm">
            →
          </button>
          <button
            onClick={() => {
              setEditing(null)
              setSelectedDate(null)
              setShowForm(true)
            }}
            className="btn btn-primary"
          >
            <span className="text-2xl">+</span> Event
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="card overflow-hidden animate-slide-up hover-lift">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-primary/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="py-5 text-center text-sm font-bold text-tertiary uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-[140px] border-r border-b border-primary/50 bg-tertiary/30 opacity-40"
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayEvents = eventsForDay(day)
            const today = isToday(day)
            return (
              <div
                key={day}
                className={`min-h-[140px] p-4 border-r border-b border-primary/50 cursor-pointer transition-all duration-300 ${
                  today ? 'bg-accent/10' : 'hover:bg-tertiary/40'
                }`}
                onClick={() => dayClick(day)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm mb-4 transition-all ${
                    today
                      ? 'bg-accent text-white font-bold shadow-glow'
                      : 'text-primary font-semibold hover:bg-tertiary/50'
                  }`}
                >
                  {day}
                </div>
                <div className="space-y-2">
                  {dayEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      onClick={(ev) => {
                        ev.stopPropagation()
                        setEditing(e)
                        setShowForm(true)
                      }}
                      className="text-xs px-3 py-2 rounded-lg truncate border-l-3 transition-all hover:scale-105 hover:shadow-glow-sm"
                      style={{
                        background: (COLOR_MAP[e.color] || 'var(--accent)') + '20',
                        color: COLOR_MAP[e.color] || 'var(--accent)',
                        borderColor: COLOR_MAP[e.color] || 'var(--accent)',
                      }}
                    >
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-tertiary font-semibold">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showForm && (
        <EventForm
          date={selectedDate}
          event={editing}
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