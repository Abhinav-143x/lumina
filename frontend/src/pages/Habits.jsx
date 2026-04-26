import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#14b8a6','#ec4899','#8b5cf6','#f97316']
const ICONS = ['💪','📚','🧘','🏃','💧','🥗','😴','✍️','🎯','🎸','🧹','💊']
const CATEGORIES = ['health','fitness','learning','mindfulness','productivity','social','other']

function HabitForm({ onSave, onClose }) {
  const [d, setD] = useState({ name:'', description:'', icon:'💪', color:'#6366f1', category:'health', frequency:'daily', target_count:1 })
  const [saving, setSaving] = useState(false)
  const set = k => v => setD(p => ({ ...p, [k]: v }))

  const save = async () => {
    if (!d.name.trim()) return
    setSaving(true)
    try { await api.post('/habits/', d); onSave() }
    catch (e) { alert(JSON.stringify(e.response?.data)) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, width:'100%', maxWidth:480, padding:28 }}>
        <div style={{ fontWeight:600, fontSize:16, marginBottom:20 }}>New Habit</div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:4 }}>Name *</label>
            <input placeholder="e.g. Morning run" value={d.name} onChange={e => set('name')(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:6 }}>Icon</label>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {ICONS.map(ic => (
                <button key={ic} onClick={() => set('icon')(ic)}
                  style={{ width:36, height:36, borderRadius:8, border: d.icon === ic ? '2px solid var(--accent)' : '1px solid var(--border)', background:'var(--surface2)', fontSize:18, cursor:'pointer' }}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:6 }}>Color</label>
            <div style={{ display:'flex', gap:6 }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => set('color')(c)}
                  style={{ width:28, height:28, borderRadius:'50%', background:c, border: d.color === c ? '3px solid white' : '2px solid transparent', cursor:'pointer' }} />
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:4 }}>Category</label>
            <select value={d.category} onChange={e => set('category')(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize:12, color:'var(--muted)', display:'block', marginBottom:4 }}>Frequency</label>
            <select value={d.frequency} onChange={e => set('frequency')(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays only</option>
              <option value="weekends">Weekends only</option>
            </select>
          </div>

          <div style={{ display:'flex', gap:16, marginTop:4 }}>
            <button className="btn btn-primary" onClick={save} disabled={saving} style={{ flex:1 }}>
              {saving ? 'Saving…' : 'Create Habit'}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
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
    try { await onCheckIn(habit.id, !habit.completed_today) }
    finally { setChecking(false) }
  }

  const streakColor = habit.streak?.current >= 7 ? 'var(--green)' : habit.streak?.current >= 3 ? 'var(--amber)' : 'var(--muted)'

  return (
    <div className="card" style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px' }}>
      {/* Check button */}
      <button onClick={checkIn} disabled={checking}
        style={{
          width:44, height:44, borderRadius:'50%', flexShrink:0,
          border: `2px solid ${habit.completed_today ? habit.color : 'var(--border)'}`,
          background: habit.completed_today ? habit.color : 'transparent',
          fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          transition: 'all .2s',
        }}>
        {habit.completed_today ? '✓' : habit.icon}
      </button>

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:14 }}>{habit.name}</div>
        <div style={{ fontSize:11, color:'var(--muted)', marginTop:2, display:'flex', gap:10, flexWrap:'wrap' }}>
          <span>{habit.category}</span>
          <span>·</span>
          <span style={{ color: streakColor }}>🔥 {habit.streak?.current ?? 0} day streak</span>
          <span>·</span>
          <span>{habit.completion_rate_30d}% last 30d</span>
        </div>
      </div>

      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <Link to={`/habits/${habit.id}`} className="btn btn-ghost btn-sm">Analytics</Link>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(habit.id)}>✕</button>
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
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

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
    } catch { setAiReport('AI report unavailable. Check your API key.') }
    finally { setReportLoading(false) }
  }

  const completedToday = habits.filter(h => h.completed_today).length

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:600 }}>◉ Habits</h1>
          <p style={{ fontSize:13, color:'var(--muted)', marginTop:2 }}>
            {completedToday}/{habits.length} done today
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost" onClick={getAiReport} disabled={reportLoading}>
            {reportLoading ? '◆ Generating…' : '◆ AI Insight'}
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Habit</button>
        </div>
      </div>

      {aiReport && (
        <div className="card" style={{ marginBottom:20, borderColor:'rgba(99,102,241,.4)', background:'var(--accent-light)' }}>
          <div style={{ fontSize:11, fontWeight:600, color:'var(--accent)', marginBottom:8 }}>◆ AI WEEKLY INSIGHT</div>
          <div style={{ fontSize:13, lineHeight:1.8 }}>{aiReport}</div>
        </div>
      )}

      {/* Progress bar */}
      {habits.length > 0 && (
        <div className="card" style={{ marginBottom:20, padding:'14px 20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--muted)', marginBottom:8 }}>
            <span>Today's progress</span>
            <span style={{ fontWeight:600, color:'var(--text)' }}>{completedToday}/{habits.length}</span>
          </div>
          <div style={{ height:6, background:'var(--surface2)', borderRadius:3, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:3, background:'var(--green)',
              width: `${habits.length ? (completedToday/habits.length*100) : 0}%`,
              transition: 'width .5s ease',
            }} />
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color:'var(--muted)', fontSize:13 }}>Loading habits…</div>
      ) : habits.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:48 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🎯</div>
          <div style={{ fontWeight:600, marginBottom:8 }}>No habits yet</div>
          <div style={{ fontSize:13, color:'var(--muted)', marginBottom:16 }}>Start building your first habit to track progress.</div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Create first habit</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {habits.map(h => (
            <HabitCard key={h.id} habit={h} onCheckIn={checkIn} onDelete={deleteHabit} />
          ))}
        </div>
      )}

      {showForm && <HabitForm onSave={() => { setShowForm(false); load() }} onClose={() => setShowForm(false)} />}
    </div>
  )
}
