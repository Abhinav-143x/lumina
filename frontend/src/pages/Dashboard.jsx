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

  const bgGradient = {
    accent: 'bg-accent/10',
    success: 'bg-success/10',
    warning: 'bg-warning/10',
    info: 'bg-accent/10',
  }

  return (
    <div className="card group hover:scale-105 transition-all duration-300 hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-2xl ${bgGradient[color]} bg-gradient-to-br ${colorClasses[color]} opacity-20 group-hover:opacity-30 transition-all duration-300 flex items-center justify-center text-3xl shadow-glow-sm`}>
          {icon}
        </div>
        {trend && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${trend > 0 ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{value ?? '—'}</div>
      <div className="text-sm font-semibold text-secondary">{label}</div>
      {sub && <div className="text-xs text-tertiary mt-2">{sub}</div>}
    </div>
  )
}

function QuickAction({ to, icon, label, description, color }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 p-5 rounded-2xl bg-tertiary/30 border border-primary/50 hover:border-accent/40 hover:bg-tertiary/50 transition-all duration-300 hover-lift press-effect"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-secondary/20 group-hover:from-accent/30 group-hover:to-secondary/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-all duration-300 shadow-glow-sm">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-base group-hover:text-accent transition-colors">{label}</div>
        <div className="text-sm text-tertiary mt-1">{description}</div>
      </div>
      <svg className="w-6 h-6 text-tertiary group-hover:text-accent group-hover:translate-x-2 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            {greeting}, {user.username || 'User'} 👋
          </h1>
          <p className="text-lg text-secondary font-medium">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
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
        <div className="card animate-slide-up stagger-1 hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-3xl animate-glow shadow-glow-sm">
                🤖
              </div>
              <div>
                <h3 className="font-bold text-xl">AI Day Plan</h3>
                <p className="text-sm text-tertiary">Personalized schedule</p>
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
            <div className="text-sm leading-relaxed whitespace-pre-wrap bg-tertiary/30 rounded-xl p-5 border border-primary/50">{plan}</div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-5 animate-float">🎯</div>
              <p className="text-secondary text-base mb-6">
                Get an AI-powered plan for today based on your habits and calendar
              </p>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card animate-slide-up stagger-2 hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-3xl shadow-glow-sm">
                📅
              </div>
              <div>
                <h3 className="font-bold text-xl">Upcoming Events</h3>
                <p className="text-sm text-tertiary">Next 5 events</p>
              </div>
            </div>
            <Link to="/calendar" className="text-accent text-sm font-semibold hover:text-accent-light transition-colors">
              View all →
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-5">📭</div>
              <p className="text-secondary text-base mb-6">No upcoming events</p>
              <Link to="/calendar" className="btn btn-secondary btn-sm">
                Add Event
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((event, index) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-tertiary/30 border border-primary/50 hover:border-accent/40 hover:bg-tertiary/50 transition-all duration-300 animate-slide-in stagger-${index + 1} hover-lift"
                >
                  <div
                    className="w-2 rounded-full self-stretch shadow-glow-sm"
                    style={{ background: `var(--${event.color || 'accent'})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base truncate">{event.title}</div>
                    <div className="text-sm text-tertiary mt-2">
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
        <div className="card animate-slide-up stagger-3 hover-lift">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-3xl shadow-glow-sm">
                📝
              </div>
              <div>
                <h3 className="font-bold text-xl">Recent Notes</h3>
                <p className="text-sm text-tertiary">Latest activity</p>
              </div>
            </div>
            <Link to="/notes" className="text-accent text-sm font-semibold hover:text-accent-light transition-colors">
              View all →
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-5">📄</div>
              <p className="text-secondary text-base mb-6">No notes yet</p>
              <Link to="/notes" className="btn btn-secondary btn-sm">
                Create Note
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note, index) => (
                <Link
                  key={note.id}
                  to={`/notes/${note.id}`}
                  className="block p-4 rounded-xl bg-tertiary/30 border border-primary/50 hover:border-accent/40 hover:bg-tertiary/50 transition-all duration-300 animate-slide-in stagger-${index + 1} hover-lift"
                >
                  <div className="font-semibold text-base truncate">{note.title}</div>
                  {note.summary && (
                    <div className="text-sm text-tertiary mt-2 line-clamp-2">{note.summary}</div>
                  )}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
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
        <div className="card animate-slide-up stagger-4 hover-lift">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-3xl shadow-glow-sm">
              ⚡
            </div>
            <div>
              <h3 className="font-bold text-xl">Quick Actions</h3>
              <p className="text-sm text-tertiary">Get things done</p>
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