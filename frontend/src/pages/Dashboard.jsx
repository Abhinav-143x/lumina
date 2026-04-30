import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'

function StatCard({ label, value, sub, icon, color = 'accent', trend }) {
  const colorClasses = {
    accent: 'from-accent to-secondary',
    success: 'from-success to-emerald-600',
    warning: 'from-warning to-amber-600',
    info: 'from-info to-blue-600',
  }

  return (
    <div className="card group hover:scale-105 transition-transform duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity flex items-center justify-center text-2xl">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-success' : 'text-error'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-3xl font-bold mb-1">{value ?? '—'}</div>
      <div className="text-sm font-medium text-secondary">{label}</div>
      {sub && <div className="text-xs text-tertiary mt-1">{sub}</div>}
    </div>
  )
}

function QuickAction({ to, icon, label, description, color }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 p-4 rounded-xl bg-tertiary/50 border border-subtle hover:border-accent/30 hover:bg-tertiary transition-all duration-200"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-medium text-sm group-hover:text-accent transition-colors">{label}</div>
        <div className="text-xs text-tertiary">{description}</div>
      </div>
      <svg className="w-5 h-5 text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {greeting}, {user.username || 'User'} 👋
          </h1>
          <p className="text-secondary">
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
          color="success"
          trend={stats?.completion_rate_change}
        />
        <StatCard
          label="Best Streak"
          value={stats?.best_streak ?? 0}
          sub="days"
          icon="🔥"
          color="warning"
        />
        <StatCard
          label="30-Day Rate"
          value={stats ? `${stats.overall_completion_rate_30d}%` : '—'}
          sub="completion"
          icon="📊"
          color="info"
        />
        <StatCard
          label="Recent Notes"
          value={recentNotes.length}
          sub="activity"
          icon="📝"
          color="accent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Day Plan */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <h3 className="font-semibold">AI Day Plan</h3>
                <p className="text-xs text-tertiary">Personalized schedule</p>
              </div>
            </div>
            <button
              onClick={loadPlan}
              disabled={planLoading}
              className="btn btn-primary btn-sm"
            >
              {planLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : plan ? (
                'Refresh'
              ) : (
                'Generate'
              )}
            </button>
          </div>

          {plan ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{plan}</div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-secondary text-sm mb-4">
                Get an AI-powered plan for today based on your habits and calendar
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info/20 to-blue-600/20 flex items-center justify-center text-xl">
                📅
              </div>
              <div>
                <h3 className="font-semibold">Upcoming Events</h3>
                <p className="text-xs text-tertiary">Next 5 events</p>
              </div>
            </div>
            <Link to="/calendar" className="text-accent text-sm hover:underline">
              View all →
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-secondary text-sm mb-4">No upcoming events</p>
              <Link to="/calendar" className="btn btn-secondary btn-sm">
                Add Event
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-tertiary/30 border border-subtle hover:border-accent/20 transition-colors"
                >
                  <div
                    className="w-1 rounded-full self-stretch"
                    style={{ background: `var(--${event.color || 'accent'})` }}
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center text-xl">
                📝
              </div>
              <div>
                <h3 className="font-semibold">Recent Notes</h3>
                <p className="text-xs text-tertiary">Latest activity</p>
              </div>
            </div>
            <Link to="/notes" className="text-accent text-sm hover:underline">
              View all →
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-secondary text-sm mb-4">No notes yet</p>
              <Link to="/notes" className="btn btn-secondary btn-sm">
                Create Note
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <Link
                  key={note.id}
                  to={`/notes/${note.id}`}
                  className="block p-3 rounded-lg bg-tertiary/30 border border-subtle hover:border-accent/20 transition-colors group"
                >
                  <div className="font-medium text-sm truncate group-hover:text-accent transition-colors">
                    {note.title}
                  </div>
                  {note.summary && (
                    <div className="text-xs text-tertiary mt-1 line-clamp-2">{note.summary}</div>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {note.tags?.map((tag) => (
                      <span key={tag.id} className="tag-pill text-xs">
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
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <h3 className="font-semibold">Quick Actions</h3>
              <p className="text-xs text-tertiary">Get things done</p>
            </div>
          </div>

          <div className="space-y-3">
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