import { Link, useLocation } from 'react-router-dom'
import { BarChart3, Globe, ShoppingBag, LayoutDashboard, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_LINKS = [
  { to: '/assessment', label: 'Assessment', icon: BarChart3 },
  { to: '/benchmark', label: 'Benchmark', icon: Globe },
  { to: '/market', label: 'Market', icon: ShoppingBag },
]

export default function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header style={{ background: 'var(--brand-navy)' }} className="sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-xs font-black text-white"
                style={{ background: 'var(--brand-cyan)' }}
              >
                ND
              </div>
              <div>
                <div className="text-white font-bold text-sm leading-none">NetDiscover</div>
                <div className="text-white/50 text-xs leading-none mt-0.5">ONE for Regulators · UPU</div>
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-3">
            <Link
              to="/assessment"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded transition-all hover:opacity-90"
              style={{ background: 'var(--brand-red)' }}
            >
              Start Assessment
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-white/70 hover:text-white p-1"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1">
            {NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded text-sm text-white/80 hover:text-white hover:bg-white/10"
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/10">
              <Link
                to="/assessment"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white rounded"
                style={{ background: 'var(--brand-red)' }}
              >
                Start Assessment
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
