import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

function StatCard({ label, value, sub, icon, trend }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        {trend && (
          <span className={`text-sm ${trend > 0 ? 'text-success' : 'text-error'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold mb-1">{value ?? '—'}</div>
      <div className="text-sm text-secondary">{label}</div>
      {sub && <div className="text-xs text-tertiary mt-1">{sub}</div>}
    </div>
  )
}

function QuickAction({ to, icon, label, description }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 rounded-lg bg-tertiary/30 border border-primary/50 hover:border-accent/30 hover:bg-tertiary/50 transition-colors"
    >
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-tertiary">{description}</div>
      </div>
      <svg className="w-5 h-5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <div className="text-secondary">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>{greeting}, {user.username || 'User'} 👋</h1>
          <p className="text-sm text-secondary">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Day Plan */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🤖</div>
              <div>
                <h3>AI Day Plan</h3>
                <p className="text-sm text-tertiary">Personalized schedule</p>
              </div>
            </div>
            <button
              onClick={loadPlan}
              disabled={planLoading}
              className="btn btn-sm btn-primary"
            >
              {planLoading ? 'Generating...' : plan ? 'Refresh' : 'Generate'}
            </button>
          </div>

          {plan ? (
            <div className="text-sm whitespace-pre-wrap bg-tertiary/30 rounded-lg p-4">{plan}</div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <p className="text-secondary text-sm">
                Get an AI-powered plan for today based on your habits and calendar
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📅</div>
              <div>
                <h3>Upcoming Events</h3>
                <p className="text-sm text-tertiary">Next 5 events</p>
              </div>
            </div>
            <Link to="/calendar" className="text-primary text-sm">
              View all →
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-secondary text-sm">No upcoming events</p>
              <Link to="/calendar" className="btn btn-sm btn-secondary mt-4">
                Add Event
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-tertiary/30 border border-primary/50"
                >
                  <div
                    className="w-1 rounded-full self-stretch"
                    style={{ background: event.color || 'var(--color-primary)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{event.title}</div>
                    <div className="text-xs text-tertiary mt-1">
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📝</div>
              <div>
                <h3>Recent Notes</h3>
                <p className="text-sm text-tertiary">Latest activity</p>
              </div>
            </div>
            <Link to="/notes" className="text-primary text-sm">
              View all →
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📄</div>
              <p className="text-secondary text-sm">No notes yet</p>
              <Link to="/notes" className="btn btn-sm btn-secondary mt-4">
                Create Note
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentNotes.map((note) => (
                <Link
                  key={note.id}
                  to={`/notes/${note.id}`}
                  className="block p-3 rounded-lg bg-tertiary/30 border border-primary/50 hover:border-accent/30"
                >
                  <div className="font-medium text-sm truncate">{note.title}</div>
                  {note.summary && (
                    <div className="text-xs text-tertiary mt-1 line-clamp-2">{note.summary}</div>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {note.tags?.map((tag) => (
                      <span key={tag.id} className="tag text-xs">
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
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">⚡</div>
            <div>
              <h3>Quick Actions</h3>
              <p className="text-sm text-tertiary">Get things done</p>
            </div>
          </div>

          <div className="space-y-2">
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
