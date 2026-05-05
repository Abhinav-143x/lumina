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
    { path: '/', icon: '🏠', label: 'Dashboard', description: 'Overview & quick actions' },
    { path: '/notes', icon: '📝', label: 'Notes', description: 'Capture & organize ideas' },
    { path: '/habits', icon: '✅', label: 'Habits', description: 'Track your progress' },
    { path: '/calendar', icon: '📅', label: 'Calendar', description: 'Schedule & events' },
    { path: '/ai', icon: '🤖', label: 'AI Assistant', description: 'Smart conversations' },
    { path: '/reminders', icon: '🔔', label: 'Reminders', description: 'Never miss anything' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="flex h-screen bg-primary">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-t z-sticky ${
          sidebarOpen ? 'w-56' : 'w-16'
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-t">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-accent to-secondary flex items-center justify-center text-sm font-bold text-white">
              L
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-sm">Lumina</h1>
                <p className="text-xs text-tertiary">Your Second Brain</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                isActive(item.path)
                  ? 'bg-accent/10 text-accent'
                  : 'text-secondary hover:bg-secondary'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && (
                <div className="font-medium text-sm">{item.label}</div>
              )}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-t">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 p-2 rounded bg-secondary">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center font-bold text-white text-sm">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user?.username || 'User'}</div>
                <div className="text-xs text-tertiary truncate">{user?.email || ''}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 rounded hover:bg-tertiary"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-2 rounded hover:bg-tertiary flex items-center justify-center"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all ${
          sidebarOpen ? 'ml-56' : 'ml-16'
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-sticky bg-white border-b border-t">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded hover:bg-secondary"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                )}
              </svg>
            </button>

            <div className="flex items-center gap-4">
              <div className="text-xs text-tertiary">
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
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout