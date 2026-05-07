import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

function StatCard({ label, value, sub, icon, trend }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ fontSize: '1.5rem' }}>{icon}</div>
        {trend && (
          <span style={{
            fontSize: '0.875rem',
            color: trend > 0 ? 'var(--success)' : 'var(--error)'
          }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{value ?? '—'}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  )
}

function QuickAction({ to, icon, label, description }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        borderRadius: '0.375rem',
        background: 'rgba(51, 65, 85, 0.3)',
        border: '1px solid var(--border-color)',
        textDecoration: 'none',
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)'
        e.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-color)'
        e.currentTarget.style.background = 'rgba(51, 65, 85, 0.3)'
      }}
    >
      <div style={{ fontSize: '1.5rem' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>{label}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{description}</div>
      </div>
      <svg style={{ width: '20px', height: '20px', color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [stats, setStats] = useState(null)
  const [upcoming, setUpcoming] = useState([])
  const [recentNotes, setRecentNotes] = useState([])
  const [plan, setPlan] = useState('')
  const [planLoading, setPlanLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, upcomingRes, notesRes] = await Promise.all([
          api.get('/habits/dashboard/').catch(() => ({ data: null })),
          api.get('/calendar/upcoming/').catch(() => ({ data: [] })),
          api.get('/notes/?ordering=-updated_at').catch(() => ({ data: { results: [] } })),
        ])
        setStats(statsRes.data)
        setUpcoming(upcomingRes.data)
        setRecentNotes(notesRes.data.results?.slice(0, 5) || [])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const loadPlan = async () => {
    setPlanLoading(true)
    try {
      const { data } = await api.get('/ai/plan-day/')
      setPlan(data.plan)
    } catch {
      setPlan('Could not generate plan. Make sure your AI API key is configured.')
    } finally {
      setPlanLoading(false)
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid var(--primary)',
            borderTop: 'transparent',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>{greeting}, {user.username || 'User'} 👋</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard
          label="Habits Today"
          value={`${stats?.completed_today ?? 0}/${stats?.total_habits ?? 0}`}
          sub="completed"
          icon="✅"
          trend={stats?.completion_rate_change}
        />
        <StatCard
          label="Best Streak"
          value={stats?.best_streak ?? 0}
          sub="days"
          icon="🔥"
        />
        <StatCard
          label="30-Day Rate"
          value={stats ? `${stats.overall_completion_rate_30d}%` : '—'}
          sub="completion"
          icon="📊"
        />
        <StatCard
          label="Recent Notes"
          value={recentNotes.length}
          sub="activity"
          icon="📝"
        />
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* AI Day Plan */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '1.5rem' }}>🤖</div>
              <div>
                <h3>AI Day Plan</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Personalized schedule</p>
              </div>
            </div>
            <button
              onClick={loadPlan}
              disabled={planLoading}
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
            >
              {planLoading ? 'Generating...' : plan ? 'Refresh' : 'Generate'}
            </button>
          </div>

          {plan ? (
            <div style={{
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              background: 'rgba(51, 65, 85, 0.3)',
              borderRadius: '0.375rem',
              padding: '1rem'
            }}>
              {plan}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎯</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Get an AI-powered plan for today based on your habits and calendar
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '1.5rem' }}>📅</div>
              <div>
                <h3>Upcoming Events</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Next 5 events</p>
              </div>
            </div>
            <Link to="/calendar" style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
              View all →
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No upcoming events</p>
              <Link to="/calendar" style={{ display: 'inline-block', marginTop: '1rem' }} className="btn-secondary">
                Add Event
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {upcoming.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    background: 'rgba(51, 65, 85, 0.3)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div
                    style={{
                      width: '4px',
                      borderRadius: '2px',
                      background: event.color || 'var(--primary)',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {event.title}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.25rem'
                    }}>
                      {new Date(event.start_datetime).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notes */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '1.5rem' }}>📝</div>
              <div>
                <h3>Recent Notes</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Latest activity</p>
              </div>
            </div>
            <Link to="/notes" style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
              View all →
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No notes yet</p>
              <Link to="/notes" style={{ display: 'inline-block', marginTop: '1rem' }} className="btn-secondary">
                Create Note
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentNotes.map((note) => (
                <Link
                  key={note.id}
                  to={`/notes/${note.id}`}
                  style={{
                    display: 'block',
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    background: 'rgba(51, 65, 85, 0.3)',
                    border: '1px solid var(--border-color)',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                  }}
                >
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {note.title}
                  </div>
                  {note.summary && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.25rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {note.summary}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {note.tags?.map((tag) => (
                      <span key={tag.id} style={{
                        fontSize: '0.75rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        color: 'var(--primary)',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '0.25rem',
                        border: '1px solid rgba(99, 102, 241, 0.2)'
                      }}>
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.5rem' }}>⚡</div>
            <div>
              <h3>Quick Actions</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Get things done</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <QuickAction
              to="/notes"
              icon="📝"
              label="New Note"
              description="Capture an idea"
            />
            <QuickAction
              to="/habits"
              icon="✅"
              label="Check-in Habits"
              description="Mark today's progress"
            />
            <QuickAction
              to="/calendar"
              icon="📅"
              label="Add Event"
              description="Schedule something"
            />
            <QuickAction
              to="/ai"
              icon="🤖"
              label="Ask AI"
              description="Chat with assistant"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
