import { useState, useEffect } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import MobileNav from './MobileNav'

function Layout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    <div className="layout">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="mobile-hidden"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9,
            display: window.innerWidth <= 768 ? 'block' : 'none'
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? '' : 'sidebar-collapsed'} ${window.innerWidth <= 768 && sidebarOpen ? 'sidebar-open' : ''}`}
        style={{
          transform: window.innerWidth <= 768 ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          width: window.innerWidth <= 768 ? '280px' : (sidebarOpen ? '224px' : '64px')
        }}
      >
        {/* Logo */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="avatar">
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
              className={`nav-item ${isActive(item.path) ? 'nav-item-active' : ''}`}
              onClick={() => {
                if (window.innerWidth <= 768) setSidebarOpen(false)
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
              background: 'var(--bg-tertiary)'
            }}>
              <div className="avatar">
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
                className="btn-ghost"
                style={{ padding: '0.5rem' }}
                title="Logout"
                aria-label="Logout"
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="btn-ghost"
              style={{ width: '100%', padding: '0.75rem' }}
              title="Logout"
              aria-label="Logout"
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
        id="main-content"
        style={{
          flex: 1,
          marginLeft: window.innerWidth <= 768 ? '0' : (sidebarOpen ? '224px' : '64px'),
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'margin-left 0.2s ease'
        }}
      >
        {/* Top Bar */}
        <header className="header">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem'
          }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-ghost"
              style={{ padding: '0.5rem' }}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
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

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}

export default Layout
