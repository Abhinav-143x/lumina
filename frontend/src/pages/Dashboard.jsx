import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

function StatCard({ label, value, sub, color = 'var(--accent)' }) {
  return (
    <div className="card" style={{ flex: 1 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value ?? '—'}</div>
      <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [stats, setStats] = useState(null)
  const [upcoming, setUpcoming] = useState([])
  const [recentNotes, setRecentNotes] = useState([])
  const [plan, setPlan] = useState('')
  const [planLoading, setPlanLoading] = useState(false)

  useEffect(() => {
    api.get('/habits/dashboard/').then(r => setStats(r.data)).catch(() => {})
    api.get('/calendar/upcoming/').then(r => setUpcoming(r.data)).catch(() => {})
    api.get('/notes/?ordering=-updated_at').then(r => setRecentNotes(r.data.results?.slice(0, 5) || [])).catch(() => {})
  }, [])

  const loadPlan = async () => {
    setPlanLoading(true)
    try {
      const { data } = await api.get('/ai/plan-day/')
      setPlan(data.plan)
    } catch { setPlan('Could not generate plan. Make sure your AI API key is set.') }
    finally { setPlanLoading(false) }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}>{greeting}, {user.username} 👋</h1>
        <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 14 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <StatCard label="Habits today" value={`${stats?.completed_today ?? 0}/${stats?.total_habits ?? 0}`} sub="completed" color="var(--green)" />
        <StatCard label="Best streak" value={stats?.best_streak ?? 0} sub="days" color="var(--amber)" />
        <StatCard label="30-day rate" value={stats ? `${stats.overall_completion_rate_30d}%` : '—'} sub="completion" color="var(--accent)" />
        <StatCard label="Notes" value={recentNotes.length > 0 ? '✓' : '0'} sub="recent activity" color="var(--teal)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* AI Day Plan */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>◆ AI Day Plan</div>
            <button className="btn btn-ghost btn-sm" onClick={loadPlan} disabled={planLoading}>
              {planLoading ? 'Generating…' : plan ? 'Refresh' : 'Generate'}
            </button>
          </div>
          {plan ? (
            <div style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{plan}</div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>Click Generate to get an AI-powered plan for today based on your habits and calendar.</div>
          )}
        </div>

        {/* Upcoming events */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>◷ Upcoming Events</div>
          {upcoming.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>No upcoming events. <Link to="/calendar" style={{ color: 'var(--accent)' }}>Add one →</Link></div>
          ) : upcoming.slice(0, 5).map(e => (
            <div key={e.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 3, borderRadius: 2, background: `var(--${e.color || 'accent'})`, alignSelf: 'stretch', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{e.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  {new Date(e.start_datetime).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <Link to="/calendar" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</Link>
        </div>

        {/* Recent notes */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>◎ Recent Notes</div>
          {recentNotes.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>No notes yet. <Link to="/notes" style={{ color: 'var(--accent)' }}>Create one →</Link></div>
          ) : recentNotes.map(n => (
            <div key={n.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{n.title}</div>
              {n.summary && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.summary}</div>}
              <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                {n.tags?.map(t => <span key={t.id} className="tag-pill">{t.name}</span>)}
              </div>
            </div>
          ))}
          <Link to="/notes" style={{ fontSize: 12, color: 'var(--accent)' }}>View all →</Link>
        </div>

        {/* Quick links */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { to: '/notes', icon: '◎', label: 'New note', sub: 'Capture an idea' },
              { to: '/habits', icon: '◉', label: 'Check in habits', sub: 'Mark today\'s progress' },
              { to: '/calendar', icon: '◷', label: 'Add event', sub: 'Schedule something' },
              { to: '/ai', icon: '◆', label: 'Ask AI', sub: 'Chat with your assistant' },
            ].map(a => (
              <Link key={a.to} to={a.to} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)',
                transition: 'border-color .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ fontSize: 18, color: 'var(--accent)' }}>{a.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{a.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
