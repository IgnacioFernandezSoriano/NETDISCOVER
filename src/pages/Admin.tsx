import { useState, useEffect } from 'react'
import { LayoutDashboard, Users, BarChart3, Mail, RefreshCw, Loader2, Lock, Eye, EyeOff } from 'lucide-react'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'netdiscover2024'

interface Stats {
  totalSessions: number
  completedSessions: number
  totalLeads: number
  avgScore: number
}

interface SessionRow {
  id: number
  token: string
  name: string | null
  organization: string | null
  country: string | null
  entity_type: string | null
  status: string
  scores: { global: number } | null
  created_at: string
  completed_at: string | null
}

interface LeadRow {
  id: number
  name: string
  email: string
  organization: string | null
  message: string | null
  created_at: string
  market_providers?: { name_en: string }
}

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'leads'>('overview')

  const [stats, setStats] = useState<Stats | null>(null)
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setAuthError('')
    } else {
      setAuthError('Incorrect password')
    }
  }

  useEffect(() => {
    if (!authenticated) return
    loadData()
  }, [authenticated])

  async function loadData() {
    setLoading(true)
    try {
      const [
        { data: allSessions },
        { data: completedSessions },
        { data: leadsData },
      ] = await Promise.all([
        supabase.from('guest_sessions').select('id, token, name, organization, country, entity_type, status, scores, created_at, completed_at').order('created_at', { ascending: false }).limit(100),
        supabase.from('guest_sessions').select('scores').eq('status', 'completed'),
        supabase.from('provider_leads').select('*, market_providers(name_en)').order('created_at', { ascending: false }).limit(100),
      ])

      setSessions((allSessions ?? []) as SessionRow[])
      setLeads((leadsData ?? []) as LeadRow[])

      const completed = completedSessions ?? []
      const avgScore = completed.length > 0
        ? Math.round(completed.reduce((acc, s) => acc + (s.scores?.global ?? 0), 0) / completed.length)
        : 0

      setStats({
        totalSessions: allSessions?.length ?? 0,
        completedSessions: completed.length,
        totalLeads: leadsData?.length ?? 0,
        avgScore,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="card p-8 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-navy)' }}>
                <Lock size={18} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold" style={{ color: 'var(--brand-navy)' }}>Admin Panel</h1>
                <p className="text-xs text-gray-400">NetDiscover Platform</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 pr-10"
                    placeholder="Enter admin password"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {authError && <p className="text-xs text-red-500 mt-1">{authError}</p>}
              </div>
              <button
                onClick={handleLogin}
                className="w-full py-2.5 text-sm font-semibold text-white rounded-lg"
                style={{ background: 'var(--brand-navy)' }}
              >
                Access Admin Panel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Header */}
      <section style={{ background: 'var(--brand-navy)' }} className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <LayoutDashboard size={20} style={{ color: 'var(--brand-cyan)' }} />
              <p className="section-label">Administration</p>
            </div>
            <h1 className="text-2xl font-bold text-white">Platform Dashboard</h1>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-white border border-white/20 rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </section>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'sessions', label: `Sessions (${stats?.totalSessions ?? 0})`, icon: Users },
            { id: 'leads', label: `Leads (${stats?.totalLeads ?? 0})`, icon: Mail },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'sessions' | 'leads')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-600 text-blue-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brand-cyan)' }} />
          </div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Sessions', value: stats.totalSessions, icon: Users, color: 'var(--brand-navy)' },
                    { label: 'Completed', value: stats.completedSessions, icon: BarChart3, color: 'var(--brand-green)' },
                    { label: 'Provider Leads', value: stats.totalLeads, icon: Mail, color: 'var(--brand-cyan)' },
                    { label: 'Avg Score', value: `${stats.avgScore}%`, icon: BarChart3, color: '#7C3AED' },
                  ].map(item => (
                    <div key={item.label} className="card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-gray-400">{item.label}</p>
                        <item.icon size={16} style={{ color: item.color }} />
                      </div>
                      <p className="text-3xl font-black" style={{ color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="card p-5">
                  <h3 className="font-bold mb-4" style={{ color: 'var(--brand-navy)' }}>Completion Rate</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="progress-bar h-3">
                        <div
                          className="progress-fill h-3"
                          style={{
                            width: `${stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}%`,
                            background: 'var(--brand-green)'
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-lg font-bold" style={{ color: 'var(--brand-green)' }}>
                      {stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Sessions */}
            {activeTab === 'sessions' && (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'var(--brand-light)' }}>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Organization</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Country</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Type</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Score</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {sessions.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-800">{s.organization ?? '—'}</p>
                              <p className="text-xs text-gray-400">{s.name ?? '—'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{s.country ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                              {s.entity_type ?? '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                              s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold" style={{ color: 'var(--brand-navy)' }}>
                            {s.scores?.global !== undefined ? `${s.scores.global}%` : '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-gray-400">
                            {new Date(s.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {sessions.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">No sessions yet.</div>
                  )}
                </div>
              </div>
            )}

            {/* Leads */}
            {activeTab === 'leads' && (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'var(--brand-light)' }}>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Contact</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Organization</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Provider</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Message</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{lead.name}</p>
                            <p className="text-xs text-gray-400">{lead.email}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{lead.organization ?? '—'}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                              {lead.market_providers?.name_en ?? '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">
                            {lead.message ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-right text-xs text-gray-400">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {leads.length === 0 && (
                    <div className="text-center py-12 text-gray-400 text-sm">No leads yet.</div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
