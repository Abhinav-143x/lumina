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
        className={`fixed left-0 top-0 h-full bg-secondary border-r border-subtle transition-all duration-300 z-sticky ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold shadow-glow">
              L
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">Lumina</h1>
                <p className="text-xs text-tertiary">Your Second Brain</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-accent-light text-accent border border-accent/20'
                  : 'text-secondary hover:bg-tertiary hover:text-primary'
              }`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              {sidebarOpen && (
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.label}</div>
                  {!isActive(item.path) && (
                    <div className="text-xs text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.description}
                    </div>
                  )}
                </div>
              )}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-subtle">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-tertiary/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center font-bold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user?.username || 'User'}</div>
                <div className="text-xs text-tertiary truncate">{user?.email || ''}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-error/10 hover:text-error transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full p-3 rounded-lg hover:bg-error/10 hover:text-error transition-colors flex items-center justify-center"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-sticky bg-primary/80 backdrop-blur-xl border-b border-subtle">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-tertiary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                )}
              </svg>
            </button>

            <div className="flex items-center gap-4">
              <div className="text-sm text-tertiary">
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