import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

export default function Register() {
  const nav = useNavigate()
  const [data, setData] = useState({ username: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = async e => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const { data: r } = await api.post('/auth/register/', data)
      localStorage.setItem('access', r.access)
      localStorage.setItem('refresh', r.refresh)
      localStorage.setItem('user', JSON.stringify(r.user))
      nav('/')
    } catch (e) {
      const d = e.response?.data
      setErr(typeof d === 'string' ? d : JSON.stringify(d) || 'Registration failed')
    } finally { setLoading(false) }
  }

  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="card" style={{ width: 380 }}>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 8, color: 'var(--accent)' }}>◈ Lumina</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Create your second brain</div>
        {err && <div style={{ background: 'rgba(239,68,68,.1)', color: 'var(--red)', padding: '8px 12px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{err}</div>}
        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { k: 'username', label: 'Username', type: 'text', ph: 'choose a username' },
            { k: 'email', label: 'Email', type: 'email', ph: 'you@example.com' },
            { k: 'password', label: 'Password', type: 'password', ph: 'min 6 characters' },
          ].map(f => (
            <div key={f.k}>
              <label style={{ fontSize: 12, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{f.label}</label>
              <input type={f.type} placeholder={f.ph} value={data[f.k]} onChange={set(f.k)} required />
            </div>
          ))}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}
