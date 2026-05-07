import { useState, useEffect } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'

function Layout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const navItems = [
    { path: '/', icon: '🏠', label: 'Dashboard' },
    { path: '/notes', icon: '📝', label: 'Notes' },
    { path: '/habits', icon: '✅', label: 'Habits' },
    { path: '/calendar', icon: '📅', label: 'Calendar' },
    { path: '/ai', icon: '🤖', label: 'AI Assistant' },
    { path: '/reminders', icon: '🔔', label: 'Reminders' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100%',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          width: sidebarOpen ? '224px' : '64px',
          transition: 'width 0.2s ease',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Logo */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '0.5rem',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: 'white'
            }}>
              L
            </div>
            {sidebarOpen && (
              <div>
                <h1 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>Lumina</h1>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Your Second Brain</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                color: isActive(item.path) ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive(item.path) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                border: isActive(item.path) ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              {sidebarOpen && (
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
          {sidebarOpen ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              background: 'rgba(51, 65, 85, 0.3)'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: 'white',
                fontSize: '0.875rem'
              }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user?.username || 'User'}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user?.email || ''}
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
                title="Logout"
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.375rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}
              title="Logout"
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? '224px' : '64px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'margin-left 0.2s ease'
        }}
      >
        {/* Top Bar */}
        <header style={{
          position: 'sticky',
          top: 0,
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-color)',
          zIndex: 5
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem'
          }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: '0.5rem',
                borderRadius: '0.375rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                )}
              </svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '1.5rem', overflow: 'auto', flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
