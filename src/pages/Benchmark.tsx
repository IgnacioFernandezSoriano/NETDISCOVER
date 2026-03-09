import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from 'recharts'
import { Globe, Loader2, TrendingUp, Users } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { getMaturityLevel } from '../lib/scoring'
import type { BenchmarkSnapshot } from '../lib/supabase'

const PHASE_NAMES: Record<string, string> = {
  phase1: 'Measurement',
  phase2: 'Ecosystem',
  phase3: 'SLAs',
  phase4: 'Network',
  phase5: 'Improvement',
  phase6: 'Enforcement',
  phase7: 'Maturity',
}

export default function Benchmark() {
  const location = useLocation()
  const userScore: number | undefined = location.state?.userScore

  const [snapshots, setSnapshots] = useState<BenchmarkSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedEntityType, setSelectedEntityType] = useState('all')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('benchmark_snapshots')
        .select('*')
        .order('snapshot_date', { ascending: false })
        .limit(20)
      setSnapshots(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const regions = ['all', ...Array.from(new Set(snapshots.map(s => s.region)))]
  const entityTypes = ['all', ...Array.from(new Set(snapshots.map(s => s.entity_type)))]

  const filtered = snapshots.filter(s => {
    if (selectedRegion !== 'all' && s.region !== selectedRegion) return false
    if (selectedEntityType !== 'all' && s.entity_type !== selectedEntityType) return false
    return true
  })

  // Aggregate benchmark data
  const aggregated = filtered.length > 0 ? filtered[0].data : null

  const globalAvg = aggregated?.globalAvg ?? 0
  const globalP25 = aggregated?.globalP25 ?? 0
  const globalP75 = aggregated?.globalP75 ?? 0
  const sampleSize = aggregated?.sampleSize ?? 0

  const phaseData = aggregated?.phaseAverages
    ? Object.entries(aggregated.phaseAverages).map(([slug, avg]) => ({
        phase: PHASE_NAMES[slug] ?? slug,
        slug,
        avg: Math.round(avg as number),
        userScore: userScore !== undefined ? (userScore) : undefined,
      }))
    : []

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Header */}
      <section style={{ background: 'var(--brand-navy)' }} className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={24} style={{ color: 'var(--brand-cyan)' }} />
            <p className="section-label">Global Benchmark</p>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3" style={{ letterSpacing: '-0.02em' }}>
            How does your organization compare?
          </h1>
          <p className="text-white/50 text-sm max-w-xl">
            Anonymous comparison of postal quality maturity scores from regulators and designated operators worldwide.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Region</label>
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r === 'all' ? 'All Regions' : r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Entity Type</label>
            <select
              value={selectedEntityType}
              onChange={e => setSelectedEntityType(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            >
              {entityTypes.map(t => (
                <option key={t} value={t}>{t === 'all' ? 'All Types' : t === 'regulator' ? 'Regulators' : 'Designated Operators'}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brand-cyan)' }} />
          </div>
        ) : snapshots.length === 0 ? (
          <div className="card p-12 text-center">
            <Users size={32} className="mx-auto mb-4 text-gray-300" />
            <h3 className="font-bold text-gray-600 mb-2">No benchmark data yet</h3>
            <p className="text-sm text-gray-400">
              Benchmark data will appear once enough assessments have been completed.
              Complete your assessment to contribute to the global dataset.
            </p>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Global Average', value: `${globalAvg}%`, sub: getMaturityLevel(globalAvg), icon: TrendingUp },
                { label: 'P25 (Bottom 25%)', value: `${globalP25}%`, sub: getMaturityLevel(globalP25), icon: TrendingUp },
                { label: 'P75 (Top 25%)', value: `${globalP75}%`, sub: getMaturityLevel(globalP75), icon: TrendingUp },
                { label: 'Sample Size', value: String(sampleSize), sub: 'organizations', icon: Users },
              ].map(item => (
                <div key={item.label} className="card p-5">
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className="text-2xl font-black" style={{ color: 'var(--brand-navy)' }}>{item.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Your position */}
            {userScore !== undefined && (
              <div className="card p-5" style={{ borderLeft: '4px solid var(--brand-cyan)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Your Score</p>
                    <p className="text-3xl font-black" style={{ color: 'var(--brand-navy)' }}>{userScore}%</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {userScore > globalAvg
                        ? `+${userScore - globalAvg}% above global average`
                        : `${globalAvg - userScore}% below global average`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">Percentile position</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--brand-cyan)' }}>
                      {userScore >= globalP75 ? 'Top 25%' : userScore >= globalAvg ? 'Above Average' : userScore >= globalP25 ? 'Below Average' : 'Bottom 25%'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Phase comparison chart */}
            {phaseData.length > 0 && (
              <div className="card p-6">
                <h2 className="section-heading text-base font-bold mb-6" style={{ color: 'var(--brand-navy)' }}>
                  Phase Average Scores
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={phaseData} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="phase" tick={{ fontSize: 11 }} width={90} />
                    <Tooltip
                      formatter={(v: number) => [`${v}%`]}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Bar dataKey="avg" name="Global Avg" radius={[0, 4, 4, 0]}>
                      {phaseData.map((entry, i) => (
                        <Cell key={i} fill="var(--brand-cyan)" opacity={0.7} />
                      ))}
                    </Bar>
                    {userScore !== undefined && (
                      <ReferenceLine x={userScore} stroke="var(--brand-red)" strokeDasharray="4 4" label={{ value: 'You', fontSize: 11, fill: 'var(--brand-red)' }} />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Distribution */}
            <div className="card p-6">
              <h2 className="section-heading text-base font-bold mb-5" style={{ color: 'var(--brand-navy)' }}>
                Maturity Distribution
              </h2>
              <div className="grid grid-cols-5 gap-3">
                {[
                  { level: 'Initial', range: '0–19', color: '#9CA3AF' },
                  { level: 'Developing', range: '20–39', color: '#F59E0B' },
                  { level: 'Defined', range: '40–59', color: '#3B82F6' },
                  { level: 'Managed', range: '60–79', color: '#10B981' },
                  { level: 'Optimized', range: '80–100', color: '#003087' },
                ].map(item => (
                  <div key={item.level} className="text-center p-3 rounded-lg" style={{ background: item.color + '15' }}>
                    <div className="text-lg font-black mb-1" style={{ color: item.color }}>—</div>
                    <div className="text-xs font-semibold" style={{ color: item.color }}>{item.level}</div>
                    <div className="text-xs text-gray-400">{item.range}%</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                Distribution data available once benchmark has sufficient entries.
              </p>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
