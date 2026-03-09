export default function Footer() {
  return (
    <footer style={{ background: '#0A0F1E' }} className="py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-xs font-black text-white"
                style={{ background: 'var(--brand-cyan)' }}
              >
                ND
              </div>
              <span className="text-white/40 text-sm font-medium">NetDiscover</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-white/30 text-xs">ONE for Regulators</span>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-white/30 text-xs">Universal Postal Union</span>
          </div>
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} ONE for Regulators · UPU Framework · Postal Quality Maturity Assessment
          </p>
        </div>
      </div>
    </footer>
  )
}
