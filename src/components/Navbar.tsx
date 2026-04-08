import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Globe, Menu, X, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useI18n, type Lang } from '../lib/i18n'

const LANG_OPTIONS: { code: Lang; label: string; flag: string; native: string }[] = [
  { code: 'en', label: 'EN', flag: '🇬🇧', native: 'English' },
  { code: 'es', label: 'ES', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', label: 'FR', flag: '🇫🇷', native: 'Français' },
  { code: 'ar', label: 'AR', flag: '🇸🇦', native: 'العربية' },
  { code: 'ru', label: 'RU', flag: '🇷🇺', native: 'Русский' },
]

export default function Navbar() {
  const location = useLocation()
  const { t, lang, setLang, isRTL } = useI18n()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)

  const startNewAssessment = () => {
    localStorage.removeItem('nd_token')
    localStorage.removeItem('nd_answers')
    localStorage.removeItem('nd_current_phase')
    setMobileOpen(false)
    navigate('/assessment')
  }

  // Close lang dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentLang = LANG_OPTIONS.find(l => l.code === lang) ?? LANG_OPTIONS[0]

  return (
    <header style={{ background: 'var(--brand-navy)', borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — ONE + UPU */}
          <Link to="/" className="flex items-center gap-4 group">
            {/* ONE for Regulators logo */}
            <img
              src="/one-logo-white.png"
              alt="ONE for Regulators"
              className="h-9 w-auto object-contain"
              style={{ maxWidth: '140px' }}
            />
            {/* Divider */}
            <div className="w-px h-8 bg-white/20" />
            {/* UPU logo */}
            <img
              src="/upu-logo-white.png"
              alt="Universal Postal Union"
              className="h-9 w-auto object-contain rounded"
              style={{ maxWidth: '140px' }}
            />
          </Link>

          {/* Right side: lang + CTA */}
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
              >
                <Globe size={14} />
                <span>{currentLang.label}</span>
                <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>

              {langOpen && (
                <div
                  className="absolute top-full mt-1 w-44 rounded-lg overflow-hidden shadow-xl border border-white/10 z-50"
                  style={{ background: '#001F5B', [isRTL ? 'left' : 'right']: 0 }}
                >
                  {LANG_OPTIONS.map(opt => (
                    <button
                      key={opt.code}
                      onClick={() => { setLang(opt.code); setLangOpen(false) }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors ${
                        lang === opt.code
                          ? 'text-white font-semibold bg-white/10'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                      dir={opt.code === 'ar' ? 'rtl' : 'ltr'}
                    >
                      <span className="text-base">{opt.flag}</span>
                      <span className="flex-1 text-left" dir="ltr">{opt.label}</span>
                      <span className="text-xs text-white/40">{opt.native}</span>
                      {lang === opt.code && (
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--brand-cyan)' }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={startNewAssessment}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded transition-all hover:opacity-90"
              style={{ background: 'var(--brand-red)' }}
            >
              {t('nav.start')}
            </button>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-white/70 hover:text-white p-1.5"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
                location.pathname === '/'
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {t('nav.home') || 'Home'}
            </Link>
            <div className="pt-2 border-t border-white/10 space-y-2">
              <button
                onClick={startNewAssessment}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-white rounded"
                style={{ background: 'var(--brand-red)' }}
              >
                {t('nav.start')}
              </button>
              {/* Mobile lang switcher */}
              <div className="grid grid-cols-5 gap-1 px-1">
                {LANG_OPTIONS.map(opt => (
                  <button
                    key={opt.code}
                    onClick={() => setLang(opt.code)}
                    className={`flex flex-col items-center gap-0.5 py-2 text-xs font-semibold rounded transition-colors ${
                      lang === opt.code
                        ? 'text-white'
                        : 'text-white/50 hover:text-white'
                    }`}
                    style={lang === opt.code ? { background: 'rgba(255,255,255,0.15)' } : {}}
                  >
                    <span>{opt.flag}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
