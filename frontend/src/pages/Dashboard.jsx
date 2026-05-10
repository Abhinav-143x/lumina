import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { PageSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'

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
      className="card card-interactive"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        textDecoration: 'none',
        background: 'var(--bg-tertiary)'
      }}
    >
      <div style={{ fontSize: '1.5rem' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>{label}</div>
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
    return <PageSkeleton />
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
              background: 'var(--bg-tertiary)',
              borderRadius: '0.375rem',
              padding: '1rem',
              color: 'var(--text-secondary)'
            }}>
              {plan}
            </div>
          ) : (
            <EmptyState
              icon="🎯"
              title="No plan yet"
              description="Get an AI-powered plan for today based on your habits and calendar"
              action={{ label: 'Generate Plan', onClick: loadPlan }}
            />
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
            <EmptyState
              icon="📭"
              title="No upcoming events"
              description="You don't have any events scheduled"
              action={{ label: 'Add Event', onClick: () => window.location.href = '/calendar' }}
            />
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
                    background: 'var(--bg-tertiary)',
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
                      color: 'var(--text-primary)',
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
            <EmptyState
              icon="📄"
              title="No notes yet"
              description="Start capturing your ideas and thoughts"
              action={{ label: 'Create Note', onClick: () => window.location.href = '/notes' }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentNotes.map((note) => (
                <Link
                  key={note.id}
                  to={`/notes/${note.id}`}
                  className="card card-interactive"
                  style={{
                    padding: '0.75rem',
                    textDecoration: 'none',
                    background: 'var(--bg-tertiary)'
                  }}
                >
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)',
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
                      <span key={tag.id} className="badge badge-gold">
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
