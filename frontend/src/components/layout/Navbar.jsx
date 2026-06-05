import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Globe, MessageCircle, LayoutDashboard, FileText, Home, LogOut, User, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/chat', label: 'AI Assistant', icon: MessageCircle },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/officer', label: 'Officer', icon: ShieldCheck },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const filteredNavItems = navItems.filter(item => {
    if (item.path === '/officer') return isAdmin;
    return true;
  });

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-navy-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-navy-900">
              Saarthi<span className="text-saffron-500">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {filteredNavItems.map(item => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-navy-900 text-white'
                      : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="p-2 rounded-lg text-navy-500 hover:bg-navy-50 transition-colors">
              <Globe size={18} />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 bg-navy-50 hover:bg-navy-100 transition-colors rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-navy-200 flex items-center justify-center">
                    <User size={14} className="text-navy-600" />
                  </div>
                  <span className="text-sm font-medium text-navy-700 max-w-[100px] truncate">
                    {user?.full_name || 'User'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-navy-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 bg-saffron-500 text-white rounded-lg text-sm font-medium hover:bg-saffron-600 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-navy-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {filteredNavItems.map(item => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-navy-900 text-white'
                      : 'text-navy-600 hover:bg-navy-50'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              )
            })}

            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm text-navy-700 hover:bg-navy-50 rounded-lg">
                  <User size={18} />
                  {user?.full_name || 'User'} Profile
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-center px-4 py-2.5 bg-saffron-500 text-white rounded-lg text-sm font-medium hover:bg-saffron-600 transition-colors mt-2"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
