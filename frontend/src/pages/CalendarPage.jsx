import { useState, useEffect } from 'react'
import api from '../api/client'

const COLOR_MAP = {
  blue: '#3b82f6', green: '#22c55e', red: '#ef4444',
  purple: '#8b5cf6', amber: '#f59e0b', teal: '#14b8a6',
}

function EventForm({ date, event, onSave, onClose }) {
  const [d, setD] = useState({
    title: event?.title || '',
    description: event?.description || '',
    start_datetime: event?.start_datetime ? event.start_datetime.slice(0,16) : (date ? `${date}T09:00` : ''),
    end_datetime: event?.end_datetime ? event.end_datetime.slice(0,16) : '',
    all_day: event?.all_day || false,
    color: event?.color || 'blue',
    location: event?.location || '',
  })
  const [saving, setSaving] = useState(false)
  const set = k => e => setD(p => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    if (!d.title.trim()) return
    setSaving(true)
    try {
      if (event?.id) await api.patch(`/calendar/events/${event.id}/`, d)
      else await api.post('/calendar/events/', d)
      onSave()
    } catch (e) { alert(JSON.stringify(e.response?.data)) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, width:'100%', maxWidth:440, padding:28 }}>
        <div style={{ fontWeight:600, fontSize:16, marginBottom:20 }}>{event?.id ? 'Edit Event' : 'New Event'}</div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:4 }}>Title *</label>
            <input placeholder="Event title" value={d.title} onChange={set('title')} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:4 }}>Start</label>
              <input type="datetime-local" value={d.start_datetime} onChange={set('start_datetime')} />
            </div>
            <div>
              <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:4 }}>End</label>
              <input type="datetime-local" value={d.end_datetime} onChange={set('end_datetime')} />
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:4 }}>Location</label>
            <input placeholder="Optional" value={d.location} onChange={set('location')} />
          </div>
          <div>
            <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:6 }}>Color</label>
            <div style={{ display:'flex', gap:8 }}>
              {Object.entries(COLOR_MAP).map(([name, hex]) => (
                <button key={name} onClick={() => setD(p => ({ ...p, color:name }))}
                  style={{ width:28, height:28, borderRadius:'50%', background:hex, border: d.color===name ? '3px solid white' : '2px solid transparent', cursor:'pointer' }} />
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:4 }}>Description</label>
            <textarea placeholder="Optional notes" value={d.description} onChange={set('description')} style={{ minHeight:70 }} />
          </div>
          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button className="btn btn-primary" onClick={save} disabled={saving} style={{ flex:1 }}>{saving?'Saving…':'Save Event'}</button>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const today = new Date()
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)

  const load = async () => {
    const start = new Date(current.year, current.month, 1).toISOString()
    const end = new Date(current.year, current.month + 1, 0, 23, 59).toISOString()
    try {
      const { data } = await api.get(`/calendar/events/?start=${start}&end=${end}`)
      setEvents(data.results || data)
    } catch {}
  }

  useEffect(() => { load() }, [current])

  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate()
  const firstDay = new Date(current.year, current.month, 1).getDay()
  const monthName = new Date(current.year, current.month).toLocaleDateString('en', { month: 'long', year: 'numeric' })

  const eventsForDay = day => {
    const key = `${current.year}-${String(current.month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return events.filter(e => e.start_datetime.startsWith(key))
  }

  const isToday = day => today.getFullYear()===current.year && today.getMonth()===current.month && today.getDate()===day
  const prevMonth = () => setCurrent(c => c.month===0 ? {year:c.year-1,month:11} : {year:c.year,month:c.month-1})
  const nextMonth = () => setCurrent(c => c.month===11 ? {year:c.year+1,month:0} : {year:c.year,month:c.month+1})

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return
    await api.delete(`/calendar/events/${id}/`)
    load()
  }

  const dayClick = (day) => {
    const key = `${current.year}-${String(current.month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    setSelectedDate(key)
    setEditing(null)
    setShowForm(true)
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:600 }}>◷ Calendar</h1>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button className="btn btn-ghost btn-sm" onClick={prevMonth}>←</button>
          <span style={{ fontSize:15, fontWeight:600, minWidth:180, textAlign:'center' }}>{monthName}</span>
          <button className="btn btn-ghost btn-sm" onClick={nextMonth}>→</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setSelectedDate(null); setShowForm(true) }}>+ Event</button>
        </div>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {/* Day headers */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', borderBottom:'1px solid var(--border)' }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} style={{ padding:'10px 0', textAlign:'center', fontSize:11, fontWeight:600, color:'var(--muted)' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
          {/* Empty cells before first day */}
          {Array.from({length:firstDay}).map((_,i) => (
            <div key={`empty-${i}`} style={{ minHeight:100, borderRight:'1px solid var(--border)', borderBottom:'1px solid var(--border)', background:'var(--surface2)', opacity:.4 }} />
          ))}

          {Array.from({length:daysInMonth}).map((_,i) => {
            const day = i+1
            const dayEvents = eventsForDay(day)
            const today_ = isToday(day)
            return (
              <div key={day}
                style={{
                  minHeight:100, padding:8,
                  borderRight:'1px solid var(--border)', borderBottom:'1px solid var(--border)',
                  background: today_ ? 'rgba(99,102,241,.06)' : 'transparent',
                  cursor:'pointer', transition:'background .15s',
                }}
                onMouseEnter={e => { if (!today_) e.currentTarget.style.background='var(--surface2)' }}
                onMouseLeave={e => { if (!today_) e.currentTarget.style.background='transparent' }}
                onClick={() => dayClick(day)}
              >
                <div style={{
                  width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                  background: today_ ? 'var(--accent)' : 'transparent',
                  color: today_ ? '#fff' : 'var(--text)',
                  fontSize:13, fontWeight: today_ ? 700 : 400,
                  marginBottom:4,
                }}>
                  {day}
                </div>
                {dayEvents.slice(0,3).map(e => (
                  <div key={e.id}
                    onClick={ev => { ev.stopPropagation(); setEditing(e); setShowForm(true) }}
                    style={{
                      fontSize:10, padding:'2px 5px', borderRadius:3,
                      background: (COLOR_MAP[e.color]||'var(--accent)')+'33',
                      color: COLOR_MAP[e.color]||'var(--accent)',
                      marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                      borderLeft:`2px solid ${COLOR_MAP[e.color]||'var(--accent)'}`,
                    }}>
                    {e.title}
                  </div>
                ))}
                {dayEvents.length > 3 && <div style={{ fontSize:9, color:'var(--muted)' }}>+{dayEvents.length-3} more</div>}
              </div>
            )
          })}
        </div>
      </div>

      {showForm && (
        <EventForm
          date={selectedDate}
          event={editing}
          onSave={() => { setShowForm(false); load() }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
