import { Outlet, NavLink, useNavigate } from 'react-router-dom'

const NAV = [
  { to: '/',        label: 'Dashboard', icon: '◈' },
  { to: '/notes',   label: 'Notes',     icon: '◎' },
  { to: '/habits',  label: 'Habits',    icon: '◉' },
  { to: '/calendar',label: 'Calendar',  icon: '◷' },
  { to: '/ai',      label: 'AI Chat',   icon: '◆' },
  { to: '/reminders', label: 'Reminders', icon: '◐' },
]

export default function Layout() {
  const nav = useNavigate()
  const logout = () => { localStorage.clear(); nav('/login') }
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh'
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent)', letterSpacing: '-.5px' }}>◈ Lumina</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Second Brain</div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 8, marginBottom: 2, fontSize: 13, fontWeight: 500,
              color: isActive ? 'var(--accent)' : 'var(--muted)',
              background: isActive ? 'var(--accent-light)' : 'transparent',
              transition: 'all .15s',
            })}>
              <span style={{ fontSize: 16, width: 18, textAlign: 'center' }}>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
            {user.username || 'User'}
          </div>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', maxWidth: 1100 }}>
        <Outlet />
      </main>
    </div>
  )
}
