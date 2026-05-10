import { Link, useLocation } from 'react-router-dom'

function MobileNav() {
  const location = useLocation()

  const navItems = [
    { icon: '🏠', label: 'Home', path: '/' },
    { icon: '📝', label: 'Notes', path: '/notes' },
    { icon: '✅', label: 'Habits', path: '/habits' },
    { icon: '📅', label: 'Calendar', path: '/calendar' },
    { icon: '🤖', label: 'AI', path: '/ai' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="mobile-nav desktop-hidden">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
        >
          <span className="mobile-nav-icon">{item.icon}</span>
          <span className="mobile-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default MobileNav
