import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/client'

export default function Register() {
  const navigate = useNavigate()
  const [data, setData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (data.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/register/', {
        username: data.username,
        email: data.email,
        password: data.password
      })

      // Auto login after registration
      const { data: response } = await api.post('/auth/login/', {
        username: data.username,
        password: data.password
      })

      localStorage.setItem('access', response.access)
      localStorage.setItem('refresh', response.refresh)

      const me = await api.get('/auth/me/')
      localStorage.setItem('user', JSON.stringify(me.data))

      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
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
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-secondary mb-4 shadow-glow">
            <span className="text-3xl font-bold">L</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-secondary">Start building your second brain</p>
        </div>

        {/* Register Form */}
        <div className="card animate-slide-in">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
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
                placeholder="Choose a username"
                value={data.username}
                onChange={handleChange('username')}
                required
                minLength={3}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={data.email}
                onChange={handleChange('email')}
                required
                className="w-full"
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
                minLength={6}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={data.confirmPassword}
                onChange={handleChange('confirmPassword')}
                required
                minLength={6}
                className="w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-tertiary/30">
            <div className="text-2xl mb-1">📝</div>
            <div className="text-xs text-tertiary">Smart Notes</div>
          </div>
          <div className="p-3 rounded-lg bg-tertiary/30">
            <div className="text-2xl mb-1">✅</div>
            <div className="text-xs text-tertiary">Habit Tracking</div>
          </div>
          <div className="p-3 rounded-lg bg-tertiary/30">
            <div className="text-2xl mb-1">🤖</div>
            <div className="text-xs text-tertiary">AI Assistant</div>
          </div>
        </div>
      </div>
    </div>
  )
}