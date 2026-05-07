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
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-accent to-secondary mb-8 shadow-glow animate-scale-in">
            <span className="text-5xl font-bold text-white">L</span>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-primary">Create your account</h1>
          <p className="text-lg text-secondary">Start building your second brain</p>
        </div>

        {/* Register Form */}
        <div className="card animate-slide-up">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="animate-slide-in stagger-1">
              <label className="block text-sm font-semibold text-secondary mb-3">
                Username
              </label>
              <input
                type="text"
                placeholder="Choose a username"
                value={data.username}
                onChange={handleChange('username')}
                required
                minLength={3}
                className="transition-all duration-200"
              />
            </div>

            <div className="animate-slide-in stagger-2">
              <label className="block text-sm font-semibold text-secondary mb-3">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={data.email}
                onChange={handleChange('email')}
                required
                className="transition-all duration-200"
              />
            </div>

            <div className="animate-slide-in stagger-3">
              <label className="block text-sm font-semibold text-secondary mb-3">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={data.password}
                onChange={handleChange('password')}
                required
                minLength={6}
                className="transition-all duration-200"
              />
            </div>

            <div className="animate-slide-in stagger-4">
              <label className="block text-sm font-semibold text-secondary mb-3">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={data.confirmPassword}
                onChange={handleChange('confirmPassword')}
                required
                minLength={6}
                className="transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full animate-slide-in stagger-5"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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

          <div className="mt-8 text-center text-sm text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-semibold hover:text-accent-light transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-10 grid grid-cols-3 gap-4 text-center animate-fade-in">
          <div className="p-5 rounded-xl bg-tertiary/30 border border-primary/50 hover:border-accent/40 transition-all group hover-lift">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📝</div>
            <div className="text-sm text-tertiary font-semibold">Smart Notes</div>
          </div>
          <div className="p-5 rounded-xl bg-tertiary/30 border border-primary/50 hover:border-accent/40 transition-all group hover-lift">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">✅</div>
            <div className="text-sm text-tertiary font-semibold">Habit Tracking</div>
          </div>
          <div className="p-5 rounded-xl bg-tertiary/30 border border-primary/50 hover:border-accent/40 transition-all group hover-lift">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🤖</div>
            <div className="text-sm text-tertiary font-semibold">AI Assistant</div>
          </div>
        </div>
      </div>
    </div>
  )
}