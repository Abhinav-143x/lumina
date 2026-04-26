import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, ReferenceLine } from 'recharts'
import api from '../api/client'

function HeatMap({ data }) {
  if (!data || data.length === 0) return <div style={{ color:'var(--muted)', fontSize:13 }}>No data yet.</div>

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
    if (count === 0) return 'var(--surface2)'
    const intensity = Math.min(count / maxCount, 1)
    if (intensity < 0.25) return '#1e3a5f'
    if (intensity < 0.5)  return '#1d4ed8'
    if (intensity < 0.75) return '#3b82f6'
    return '#93c5fd'
  }

  const DAYS = ['S','M','T','W','T','F','S']

  return (
    <div style={{ overflowX:'auto' }}>
      <div style={{ display:'flex', gap:2, alignItems:'flex-start' }}>
        {/* Day labels */}
        <div style={{ display:'flex', flexDirection:'column', gap:2, marginRight:4, paddingTop:18 }}>
          {DAYS.map((d,i) => (
            <div key={i} style={{ height:11, width:10, fontSize:9, color:'var(--muted)', lineHeight:'11px', textAlign:'right' }}>{d}</div>
          ))}
        </div>
        {/* Grid */}
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {wi % 4 === 0 && (
              <div style={{ height:14, fontSize:9, color:'var(--muted)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:26 }}>
                {week[0]?.date ? new Date(week[0].date+'T12:00:00').toLocaleDateString('en',{month:'short'}) : ''}
              </div>
            )}
            {wi % 4 !== 0 && <div style={{ height:14 }} />}
            {week.map((cell, di) => (
              <div key={di} title={`${cell.date}: ${cell.count} times`}
                style={{ width:11, height:11, borderRadius:2, background:cellColor(cell.count), cursor:'default' }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ fontSize:10, color:'var(--muted)', marginTop:6, display:'flex', alignItems:'center', gap:4 }}>
        <span>Less</span>
        {[0,0.25,0.5,0.75,1].map(i => (
          <div key={i} style={{ width:10, height:10, borderRadius:2, background:cellColor(i) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

function StatBadge({ label, value, color }) {
  return (
    <div className="card" style={{ textAlign:'center', flex:1 }}>
      <div style={{ fontSize:24, fontWeight:700, color: color || 'var(--accent)' }}>{value}</div>
      <div style={{ fontSize:11, color:'var(--muted)', marginTop:3 }}>{label}</div>
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

  if (loading) return <div style={{ color:'var(--muted)', fontSize:13, padding:40 }}>Loading analytics…</div>
  if (!habit) return <div style={{ color:'var(--red)', padding:40 }}>Habit not found.</div>

  const weeklyBars = analytics?.weekly_bars?.map(w => ({
    week: w.week_start.slice(5),
    completed: w.completed,
    target: Math.min(w.target, 7),
  })) || []

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
        <Link to="/habits" style={{ color:'var(--muted)', fontSize:13 }}>← Habits</Link>
        <div style={{ width:44, height:44, borderRadius:10, background: habit.color+'33', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
          {habit.icon}
        </div>
        <div>
          <h1 style={{ fontSize:20, fontWeight:600 }}>{habit.name}</h1>
          <div style={{ fontSize:12, color:'var(--muted)' }}>{habit.category} · {habit.frequency}</div>
        </div>
      </div>

      {/* Stat row */}
      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
        <StatBadge label="Current streak" value={`${analytics?.streak?.current ?? 0}d`} color="var(--amber)" />
        <StatBadge label="Longest streak" value={`${analytics?.streak?.longest ?? 0}d`} color="var(--green)" />
        <StatBadge label="Last 7 days" value={`${analytics?.completion_rate_7d ?? 0}%`} color="var(--accent)" />
        <StatBadge label="Last 30 days" value={`${analytics?.completion_rate_30d ?? 0}%`} color="var(--teal)" />
        <StatBadge label="Last 90 days" value={`${analytics?.completion_rate_90d ?? 0}%`} color="var(--pink)" />
      </div>

      {/* Heatmap */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontWeight:600, fontSize:14, marginBottom:16 }}>Activity Heatmap</div>
        <HeatMap data={analytics?.heatmap || []} />
      </div>

      {/* Weekly bar chart */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ fontWeight:600, fontSize:14, marginBottom:16 }}>Weekly Completions (last 12 weeks)</div>
        {weeklyBars.length === 0 ? (
          <div style={{ color:'var(--muted)', fontSize:13 }}>No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyBars} margin={{ top:4, right:8, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize:10, fill:'var(--muted)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize:10, fill:'var(--muted)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}
                labelStyle={{ color:'var(--text)' }}
              />
              <Bar dataKey="completed" fill={habit.color} radius={[4,4,0,0]} name="Completed" />
              <Bar dataKey="target" fill="var(--border)" radius={[4,4,0,0]} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Completion rate trend */}
      <div className="card">
        <div style={{ fontWeight:600, fontSize:14, marginBottom:16 }}>Completion Rate by Week</div>
        {weeklyBars.length === 0 ? (
          <div style={{ color:'var(--muted)', fontSize:13 }}>No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weeklyBars.map(w => ({ ...w, rate: w.target > 0 ? Math.round(w.completed/w.target*100) : 0 }))} margin={{ top:4, right:8, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize:10, fill:'var(--muted)' }} tickLine={false} axisLine={false} />
              <YAxis domain={[0,100]} tick={{ fontSize:10, fill:'var(--muted)' }} tickLine={false} axisLine={false} tickFormatter={v => v+'%'} />
              <ReferenceLine y={80} stroke="var(--green)" strokeDasharray="4 4" label={{ value:'80%', fill:'var(--green)', fontSize:10 }} />
              <Tooltip
                contentStyle={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 }}
                formatter={v => [v+'%', 'Completion rate']}
              />
              <Line type="monotone" dataKey="rate" stroke={habit.color} strokeWidth={2} dot={{ r:3, fill:habit.color }} activeDot={{ r:5 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
        <div style={{ fontSize:11, color:'var(--muted)', marginTop:8 }}>Dashed line = 80% target</div>
      </div>
    </div>
  )
}
