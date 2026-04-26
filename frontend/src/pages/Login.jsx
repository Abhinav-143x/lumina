import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

export default function Login() {
  const nav = useNavigate()
  const [data, setData] = useState({ username: '', password: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async e => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const { data: r } = await api.post('/auth/login/', data)
      localStorage.setItem('access', r.access)
      localStorage.setItem('refresh', r.refresh)
      const me = await api.get('/auth/me/')
      localStorage.setItem('user', JSON.stringify(me.data))
      nav('/')
    } catch (e) {
      setErr(e.response?.data?.detail || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="card" style={{ width: 380 }}>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>◈ Lumina</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Sign in to your second brain</div>
        {err && <div style={{ background: 'rgba(239,68,68,.1)', color: 'var(--red)', padding: '8px 12px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{err}</div>}
        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Username</label>
            <input type="text" placeholder="your username" value={data.username} onChange={set('username')} required />
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Password</label>
            <input type="password" placeholder="••••••" value={data.password} onChange={set('password')} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--muted)' }}>
          No account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register free</Link>
        </div>
      </div>
    </div>
  )
}
