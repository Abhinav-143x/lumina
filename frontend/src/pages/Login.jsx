import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

export default function Login() {
  const navigate = useNavigate()
  const [data, setData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data: response } = await api.post('/auth/login/', data)
      localStorage.setItem('access', response.access)
      localStorage.setItem('refresh', response.refresh)

      const me = await api.get('/auth/me/')
      localStorage.setItem('user', JSON.stringify(me.data))

      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field) => (e) => {
    setData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '1rem'
    }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        {/* Logo and Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '0.5rem',
            background: 'var(--primary)',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>L</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Welcome back</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Sign in to your second brain</p>
        </div>

        {/* Login Form */}
        <div className="card">
          {error && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--error)',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={data.username}
                onChange={handleChange('username')}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="•••••••••"
                value={data.password}
                onChange={handleChange('password')}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? (
                <>
                  <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '500' }}>
              Register free
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <p>Your AI-powered second brain for notes, habits, and more</p>
        </div>
      </div>
    </div>
  )
}
