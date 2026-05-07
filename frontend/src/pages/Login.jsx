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
    <div className="min-h-screen flex items-center justify-center bg-primary p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary mb-4">
            <span className="text-3xl font-bold text-white">L</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-sm text-secondary">Sign in to your second brain</p>
        </div>

        {/* Login Form */}
        <div className="card">
          {error && (
            <div className="mb-4 p-3 rounded bg-error/10 border border-error/20 text-error text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
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
              <label className="block text-sm font-medium text-secondary mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={data.password}
                onChange={handleChange('password')}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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

          <div className="mt-6 text-center text-sm text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium">
              Register free
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-tertiary">
          <p>Your AI-powered second brain for notes, habits, and more</p>
        </div>
      </div>
    </div>
  )
}
