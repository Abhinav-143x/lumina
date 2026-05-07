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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        width: '100%',
        maxWidth: '28rem',
        padding: '1.5rem'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          {event?.id ? 'Edit Event' : 'New Event'}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Title *
            </label>
            <input
              type="text"
              placeholder="Event title"
              value={data.title}
              onChange={(e) => handleChange('title')(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Start
              </label>
              <input
                type="datetime-local"
                value={data.start_datetime}
                onChange={(e) => handleChange('start_datetime')(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                End
              </label>
              <input
                type="datetime-local"
                value={data.end_datetime}
                onChange={(e) => handleChange('end_datetime')(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Location
            </label>
            <input
              type="text"
              placeholder="Optional"
              value={data.location}
              onChange={(e) => handleChange('location')(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Color
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {Object.entries(COLOR_MAP).map(([name, hex]) => (
                <button
                  key={name}
                  onClick={() => handleChange('color')(name)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid',
                    background: hex,
                    borderColor: data.color === name ? 'white' : 'transparent',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Description
            </label>
            <textarea
              placeholder="Optional notes"
              value={data.description}
              onChange={(e) => handleChange('description')(e.target.value)}
              style={{ minHeight: '100px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem' }}>
            <button
              onClick={save}
              disabled={saving}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              {saving ? 'Saving...' : 'Save Event'}
            </button>
            <button onClick={onClose} className="btn-ghost">
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>📅 Calendar</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Schedule and manage your events</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={prevMonth} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
            ←
          </button>
          <span style={{ fontSize: '1rem', fontWeight: '500', minWidth: '180px', textAlign: 'center' }}>
            {monthName}
          </span>
          <button onClick={nextMonth} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
            →
          </button>
          <button
            onClick={() => {
              setEditing(null)
              setSelectedDate(null)
              setShowForm(true)
            }}
            className="btn-primary"
          >
            <span style={{ fontSize: '1.25rem' }}>+</span> Event
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border-color)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              style={{
                padding: '0.75rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                minHeight: '100px',
                borderRight: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                background: 'rgba(51, 65, 85, 0.3)',
                opacity: 0.4
              }}
            />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayEvents = eventsForDay(day)
            const today = isToday(day)
            return (
              <div
                key={day}
                style={{
                  minHeight: '100px',
                  padding: '0.5rem',
                  borderRight: '1px solid var(--border-color)',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  background: today ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  transition: 'background 0.15s ease'
                }}
                onClick={() => dayClick(day)}
                onMouseEnter={(e) => {
                  if (!today) e.currentTarget.style.background = 'rgba(51, 65, 85, 0.3)'
                }}
                onMouseLeave={(e) => {
                  if (!today) e.currentTarget.style.background = 'transparent'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem',
                    background: today ? 'var(--primary)' : 'transparent',
                    color: today ? 'white' : 'var(--text-primary)',
                    fontWeight: today ? '500' : '400'
                  }}
                >
                  {day}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {dayEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      onClick={(ev) => {
                        ev.stopPropagation()
                        setEditing(e)
                        setShowForm(true)
                      }}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        borderLeft: '2px solid',
                        background: (COLOR_MAP[e.color] || 'var(--primary)') + '20',
                        color: COLOR_MAP[e.color] || 'var(--primary)',
                        borderColor: COLOR_MAP[e.color] || 'var(--primary)'
                      }}
                    >
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
