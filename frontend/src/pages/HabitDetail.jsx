import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, ReferenceLine } from 'recharts'
import api from '../api/client'

function HeatMap({ data }) {
  if (!data || data.length === 0) return <div className="text-tertiary text-sm">No data yet.</div>

  const byDate = {}
  data.forEach(d => { byDate[d.date] = d.count })

  // Build 52-week grid starting from 52 weeks ago
  const today = new Date()
  const weeks = []
  for (let w = 51; w >= 0; w--) {
    const week = []
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today)
      date.setDate(today.getDate() - w * 7 - d)
      const key = date.toISOString().split('T')[0]
      week.push({ date: key, count: byDate[key] || 0, day: date.getDay() })
    }
    weeks.push(week)
  }

  const maxCount = Math.max(...data.map(d => d.count), 1)

  const cellColor = (count) => {
    if (count === 0) return 'var(--bg-tertiary)'
    const intensity = Math.min(count / maxCount, 1)
    if (intensity < 0.25) return '#1e3a5f'
    if (intensity < 0.5)  return '#1d4ed8'
    if (intensity < 0.75) return '#3b82f6'
    return '#93c5fd'
  }

  const DAYS = ['S','M','T','W','T','F','S']

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-0.5 items-start">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1 pt-4">
          {DAYS.map((d,i) => (
            <div key={i} className="h-[11px] w-[10px] text-[9px] text-tertiary leading-[11px] text-right">{d}</div>
          ))}
        </div>
        {/* Grid */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {wi % 4 === 0 && (
              <div className="h-[14px] text-[9px] text-tertiary whitespace-hidden overflow-hidden text-ellipsis max-w-[26px]">
                {week[0]?.date ? new Date(week[0].date+'T12:00:00').toLocaleDateString('en',{month:'short'}) : ''}
              </div>
            )}
            {wi % 4 !== 0 && <div className="h-[14px]" />}
            {week.map((cell, di) => (
              <div key={di} title={`${cell.date}: ${cell.count} times`}
                className="w-[11px] h-[11px] rounded-sm cursor-default"
                style={{ background: cellColor(cell.count) }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="text-xs text-tertiary mt-1.5 flex items-center gap-1">
        <span>Less</span>
        {[0,0.25,0.5,0.75,1].map(i => (
          <div key={i} className="w-[10px] h-[10px] rounded-sm" style={{ background: cellColor(i) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

function StatBadge({ label, value, color }) {
  return (
    <div className="card text-center flex-1">
      <div className="text-2xl font-bold" style={{ color: color || 'var(--accent-primary)' }}>{value}</div>
      <div className="text-xs text-tertiary mt-1">{label}</div>
    </div>
  )
}

export default function HabitDetail() {
  const { id } = useParams()
  const [habit, setHabit] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/habits/${id}/`),
      api.get(`/habits/${id}/analytics/`),
    ]).then(([h, a]) => {
      setHabit(h.data)
      setAnalytics(a.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-tertiary text-sm p-10">Loading analytics…</div>
  if (!habit) return <div className="text-error p-10">Habit not found.</div>

  const weeklyBars = analytics?.weekly_bars?.map(w => ({
    week: w.week_start.slice(5),
    completed: w.completed,
    target: Math.min(w.target, 7),
  })) || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-7">
        <Link to="/habits" className="text-tertiary text-sm">← Habits</Link>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ background: habit.color + '33' }}>
          {habit.icon}
        </div>
        <div>
          <h1 className="text-xl font-bold">{habit.name}</h1>
          <div className="text-xs text-tertiary">{habit.category} · {habit.frequency}</div>
        </div>
      </div>

      {/* Stat row */}
      <div className="flex gap-3 flex-wrap">
        <StatBadge label="Current streak" value={`${analytics?.streak?.current ?? 0}d`} color="var(--warning)" />
        <StatBadge label="Longest streak" value={`${analytics?.streak?.longest ?? 0}d`} color="var(--success)" />
        <StatBadge label="Last 7 days" value={`${analytics?.completion_rate_7d ?? 0}%`} color="var(--accent-primary)" />
        <StatBadge label="Last 30 days" value={`${analytics?.completion_rate_30d ?? 0}%`} color="var(--info)" />
        <StatBadge label="Last 90 days" value={`${analytics?.completion_rate_90d ?? 0}%`} color="var(--accent-secondary)" />
      </div>

      {/* Heatmap */}
      <div className="card">
        <div className="font-semibold text-sm mb-4">Activity Heatmap</div>
        <HeatMap data={analytics?.heatmap || []} />
      </div>

      {/* Weekly bar chart */}
      <div className="card">
        <div className="font-semibold text-sm mb-4">Weekly Completions (last 12 weeks)</div>
        {weeklyBars.length === 0 ? (
          <div className="text-tertiary text-sm">No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyBars} margin={{ top:4, right:8, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize:10, fill:'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:10, fill:'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background:'var(--bg-tertiary)', border:'1px solid var(--border-default)', borderRadius:8, fontSize:12 }}
                labelStyle={{ color:'var(--text-primary)' }}
              />
              <Bar dataKey="completed" fill={habit.color} radius={[4,4,0,0]} name="Completed" />
              <Bar dataKey="target" fill="var(--border-default)" radius={[4,4,0,0]} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Completion rate trend */}
      <div className="card">
        <div className="font-semibold text-sm mb-4">Completion Rate by Week</div>
        {weeklyBars.length === 0 ? (
          <div className="text-tertiary text-sm">No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weeklyBars.map(w => ({ ...w, rate: w.target > 0 ? Math.round(w.completed/w.target*100) : 0 }))} margin={{ top:4, right:8, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize:10, fill:'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
              <YAxis domain={[0,100]} tick={{ fontSize:10, fill:'var(--text-tertiary)' }} tickLine={false} axisLine={false} tickFormatter={v => v+'%'} />
              <ReferenceLine y={80} stroke="var(--success)" strokeDasharray="4 4" label={{ value:'80%', fill:'var(--success)', fontSize:10 }} />
              <Tooltip
                contentStyle={{ background:'var(--bg-tertiary)', border:'1px solid var(--border-default)', borderRadius:8, fontSize:12 }}
                formatter={v => [v+'%', 'Completion rate']}
              />
              <Line type="monotone" dataKey="rate" stroke={habit.color} strokeWidth={2} dot={{ r:3, fill:habit.color }} activeDot={{ r:5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
        <div className="text-xs text-tertiary mt-2">Dashed line = 80% target</div>
      </div>
    </div>
  )
}
