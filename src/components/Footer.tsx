import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer style={{ background: '#001440' }} className="py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top divider */}
        <div className="divider-cyan mb-8 opacity-40" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo ONE — 3x larger */}
          <img
            src="/one-logo-white.png"
            alt="ONE for Regulators"
            className="h-28 w-auto object-contain"
            style={{ maxWidth: '420px' }}
          />

          {/* Links */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/30">
            <span>© {new Date().getFullYear()} {t('footer.rights')}</span>
            <span className="w-px h-3 bg-white/10" />
            <span>{t('footer.powered')}</span>
            <span className="w-px h-3 bg-white/10" />
            <Link to="/disclaimer" className="hover:text-white/60 transition-colors underline underline-offset-2">Disclaimer</Link>
            <span className="w-px h-3 bg-white/10" />
            <Link to="/copyright" className="hover:text-white/60 transition-colors underline underline-offset-2">Copyright</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
