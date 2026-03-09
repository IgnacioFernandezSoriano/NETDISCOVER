import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle, BarChart3, Globe, Shield, Zap, FileText, TrendingUp } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const PHASES = [
  { num: 0, title: 'Regulator Context', desc: 'Institutional profile, strategic priorities and relationship with the designated operator.', color: '#6B7280' },
  { num: 1, title: 'Measurement System Design', desc: 'Methodology, panelist panel, technology platform and team technical capacity.', color: '#0077C8' },
  { num: 2, title: 'Ecosystem Mapping', desc: 'Actor inventory, postal network documentation, volumes and topology.', color: '#7C3AED' },
  { num: 3, title: 'SLA Establishment', desc: 'Baseline, SLA definition, legal formalization and periodic review.', color: '#059669' },
  { num: 4, title: 'Network Diagnosis', desc: 'Critical node identification, capture technology and automatic diagnosis.', color: '#D97706' },
  { num: 5, title: 'Continuous Improvement', desc: 'Improvement plans, root cause analysis and indicator monitoring.', color: '#DC2626' },
  { num: 6, title: 'Regulation & Enforcement', desc: 'Regulatory framework, binding SLAs, sanctions and transparency.', color: '#0891B2' },
  { num: 7, title: 'Maturity & Benchmarking', desc: 'International benchmarking, coverage expansion and continuous system improvement.', color: '#7C3AED' },
]

const FEATURES = [
  { icon: BarChart3, title: '7-Phase Assessment', desc: 'Structured evaluation across the full postal quality maturity roadmap.' },
  { icon: Zap, title: 'Instant Scoring', desc: 'Automatic calculation of global and per-phase maturity scores.' },
  { icon: FileText, title: 'AI Analysis', desc: 'Deep technical and commercial analysis powered by LLM.' },
  { icon: Globe, title: 'Global Benchmark', desc: 'Compare your scores against anonymized global data.' },
  { icon: Shield, title: 'No Registration', desc: 'Start immediately. Save progress with a unique token.' },
  { icon: TrendingUp, title: 'Action Plan', desc: 'Prioritized roadmap with effort, impact and timeline.' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-24 lg:py-32"
        style={{ background: 'var(--brand-navy)' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 30% 50%, #00AEEF 0%, transparent 60%), radial-gradient(circle at 80% 20%, #78BE20 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'rgba(0,174,239,0.15)', color: '#00AEEF', border: '1px solid rgba(0,174,239,0.3)' }}
            >
              ONE for Regulators · Universal Postal Union Framework
            </div>
            <h1
              className="text-4xl lg:text-6xl font-extrabold text-white mb-6 leading-tight"
              style={{ letterSpacing: '-0.02em' }}
            >
              Postal Quality
              <br />
              <span style={{ color: 'var(--brand-cyan)' }}>Maturity Assessment</span>
            </h1>
            <p className="text-lg text-white/60 mb-10 leading-relaxed max-w-xl">
              Evaluate your organization's readiness to measure, regulate and improve postal service quality.
              Based on the UPU regulatory roadmap — 7 phases, instant results, AI-powered analysis.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/assessment')}
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-sm transition-all hover:opacity-90"
                style={{ background: 'var(--brand-red)' }}
              >
                Begin Assessment
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate('/benchmark')}
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-sm border-2 border-white/20 text-white/80 hover:border-white/40 hover:text-white transition-all"
              >
                View Benchmark
              </button>
            </div>
            <div className="flex items-center gap-6 mt-10">
              {[
                { label: '7 Phases', sub: 'structured evaluation' },
                { label: '~10 min', sub: 'to complete' },
                { label: 'Free', sub: 'no registration' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <CheckCircle size={16} style={{ color: 'var(--brand-green)' }} />
                  <div>
                    <span className="text-white font-semibold text-sm">{item.label}</span>
                    <span className="text-white/40 text-xs ml-1">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Platform capabilities</p>
            <h2
              className="text-3xl font-bold"
              style={{ color: 'var(--brand-navy)', letterSpacing: '-0.02em' }}
            >
              Everything you need to assess postal maturity
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 transition-all">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: 'var(--brand-light)' }}
                >
                  <Icon size={20} style={{ color: 'var(--brand-navy)' }} />
                </div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--brand-navy)' }}>{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Phases ── */}
      <section className="py-20" style={{ background: 'var(--brand-light)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="section-label mb-4">Assessment structure</p>
          <h2
            className="text-3xl font-bold mb-12"
            style={{ color: 'var(--brand-navy)', letterSpacing: '-0.02em' }}
          >
            Eight phases of postal quality maturity
          </h2>
          <div className="relative">
            <div
              className="absolute left-5 top-0 bottom-0 w-px hidden md:block"
              style={{ background: '#D1D5DB' }}
            />
            <div className="space-y-0">
              {PHASES.map((phase) => (
                <div key={phase.num} className="flex gap-8 items-start group">
                  <div className="flex-shrink-0 relative">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white relative z-10"
                      style={{ background: phase.color }}
                    >
                      {phase.num}
                    </div>
                  </div>
                  <div className="flex-1 pb-10">
                    <h3 className="font-bold mb-1" style={{ color: 'var(--brand-navy)' }}>
                      Phase {phase.num} — {phase.title}
                    </h3>
                    <p className="text-sm text-gray-500">{phase.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Maturity levels ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="section-label mb-3">Maturity framework</p>
            <h2
              className="text-3xl font-bold"
              style={{ color: 'var(--brand-navy)', letterSpacing: '-0.02em' }}
            >
              Five levels of maturity
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[
              { level: 'Initial', range: '0–19%', desc: 'No systematic approach. Depends entirely on operator-reported data.', cls: 'maturity-initial' },
              { level: 'Developing', range: '20–39%', desc: 'Basic processes exist but are inconsistent and undocumented.', cls: 'maturity-developing' },
              { level: 'Defined', range: '40–59%', desc: 'Standardized processes defined and partially implemented.', cls: 'maturity-defined' },
              { level: 'Managed', range: '60–79%', desc: 'Processes are measured, controlled and continuously monitored.', cls: 'maturity-managed' },
              { level: 'Optimized', range: '80–100%', desc: 'Continuous improvement embedded in organizational culture.', cls: 'maturity-optimized' },
            ].map(item => (
              <div key={item.level} className="card p-5">
                <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold mb-3 ${item.cls}`}>
                  {item.level}
                </div>
                <div className="text-2xl font-black mb-2" style={{ color: 'var(--brand-navy)' }}>
                  {item.range}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'var(--brand-navy)' }} className="py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2
            className="text-3xl font-bold text-white mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            Ready to assess your maturity?
          </h2>
          <p className="text-white/50 mb-8 leading-relaxed">
            10 minutes. 40 questions. Instant results. No registration required to start.
          </p>
          <button
            onClick={() => navigate('/assessment')}
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-sm transition-all hover:opacity-90"
            style={{ background: 'var(--brand-red)', color: 'white' }}
          >
            Begin the Assessment
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
