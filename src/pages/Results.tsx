import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts'
import { Download, Loader2, AlertCircle, ChevronDown, ChevronUp, Zap, TrendingUp, ArrowRight, Clock, Target, Map } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { getMaturityLevel, getMaturityColor, getNextMaturityLevel, PHASE_DESCRIPTIONS } from '../lib/scoring'
import type { ScoreResult, Gap, ActionItem, GuestSession, LLMAnalysis } from '../lib/supabase'

const PHASE_COLORS: Record<string, string> = {
  phase1: '#0077C8',
  phase2: '#7C3AED',
  phase3: '#059669',
  phase4: '#D97706',
  phase5: '#DC2626',
  phase6: '#0891B2',
  phase7: '#7C3AED',
}

function MaturityBadge({ level }: { level: string }) {
  const cls = `maturity-${level.toLowerCase()}`
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${cls}`}>
      {level}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const cls = `priority-${priority}`
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {priority.toUpperCase()}
    </span>
  )
}

function HorizonBadge({ horizon, t }: { horizon: string; t: (k: string) => string }) {
  const colors: Record<string, string> = {
    short: 'bg-blue-50 text-blue-700',
    medium: 'bg-purple-50 text-purple-700',
    long: 'bg-gray-50 text-gray-600',
  }
  const labels: Record<string, string> = { short: '0–6 months', medium: '6–18 months', long: '18+ months' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors[horizon] ?? 'bg-gray-50 text-gray-600'}`}>
      <Clock size={10} />
      {labels[horizon] ?? horizon}
    </span>
  )
}

function LLMSection({ analysis, t, lang }: { analysis: LLMAnalysis; t: (k: string) => string; lang: string }) {
  const [expanded, setExpanded] = useState<string | null>('summary')

  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setExpanded(expanded === 'summary' ? null : 'summary')}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-light)' }}>
              <Zap size={16} style={{ color: 'var(--brand-navy)' }} />
            </div>
            <h3 className="font-bold" style={{ color: 'var(--brand-navy)' }}>{t('results.ai.summary')}</h3>
          </div>
          {expanded === 'summary' ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {expanded === 'summary' && (
          <div className="px-5 pb-5">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{analysis.executiveSummary}</p>
            {analysis.keyInsights?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Key Insights</h4>
                <ul className="space-y-2">
                  {analysis.keyInsights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5" style={{ background: 'var(--brand-cyan)' }}>{i + 1}</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Phase analyses */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setExpanded(expanded === 'phases' ? null : 'phases')}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-light)' }}>
              <TrendingUp size={16} style={{ color: 'var(--brand-navy)' }} />
            </div>
            <h3 className="font-bold" style={{ color: 'var(--brand-navy)' }}>{t('results.ai.phases')}</h3>
          </div>
          {expanded === 'phases' ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {expanded === 'phases' && (
          <div className="px-5 pb-5 space-y-5">
            {analysis.phaseAnalyses?.map(pa => (
              <div key={pa.slug} className="border-l-2 pl-4" style={{ borderColor: PHASE_COLORS[pa.slug] ?? '#D1D5DB' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-sm" style={{ color: 'var(--brand-navy)' }}>{pa.name}</span>
                  <MaturityBadge level={pa.level} />
                  <span className="text-xs text-gray-400">{pa.score}%</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{pa.narrative}</p>
                {pa.keyObstacles?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">{t('results.ai.obstacles')}: </span>
                    <span className="text-xs text-gray-500">{pa.keyObstacles.join(' · ')}</span>
                  </div>
                )}
                {pa.priorityActions?.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">{t('results.ai.actions')}: </span>
                    <span className="text-xs text-gray-500">{pa.priorityActions.join(' · ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Roadmap narrative */}
      {analysis.roadmapNarrative && (
        <div className="card overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === 'roadmap' ? null : 'roadmap')}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-light)' }}>
                <ArrowRight size={16} style={{ color: 'var(--brand-navy)' }} />
              </div>
              <h3 className="font-bold" style={{ color: 'var(--brand-navy)' }}>{t('results.ai.roadmap')}</h3>
            </div>
            {expanded === 'roadmap' ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {expanded === 'roadmap' && (
            <div className="px-5 pb-5">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{analysis.roadmapNarrative}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t, lang } = useI18n()

  const PHASE_NAMES_I18N: Record<string, Record<string, string>> = {
    en: { phase0: 'Context', phase1: 'Measurement', phase2: 'Ecosystem', phase3: 'SLAs', phase4: 'Network', phase5: 'Improvement', phase6: 'Enforcement', phase7: 'Maturity' },
    es: { phase0: 'Contexto', phase1: 'Medición', phase2: 'Ecosistema', phase3: 'SLAs', phase4: 'Red', phase5: 'Mejora', phase6: 'Cumplimiento', phase7: 'Madurez' },
    fr: { phase0: 'Contexte', phase1: 'Mesure', phase2: 'Écosystème', phase3: 'SLAs', phase4: 'Réseau', phase5: 'Amélioration', phase6: 'Application', phase7: 'Maturité' },
    ar: { phase0: 'السياق', phase1: 'القياس', phase2: 'النظام البيئي', phase3: 'SLAs', phase4: 'الشبكة', phase5: 'التحسين', phase6: 'التطبيق', phase7: 'النضج' },
    ru: { phase0: 'Контекст', phase1: 'Измерение', phase2: 'Экосистема', phase3: 'SLAs', phase4: 'Сеть', phase5: 'Улучшение', phase6: 'Применение', phase7: 'Зрелость' },
  }
  const phaseNames = PHASE_NAMES_I18N[lang] ?? PHASE_NAMES_I18N.en

  const [session, setSession] = useState<GuestSession | null>(null)
  const [scores, setScores] = useState<ScoreResult | null>(location.state?.scores ?? null)
  const [gaps, setGaps] = useState<Gap[]>(location.state?.gaps ?? [])
  const [actionPlan, setActionPlan] = useState<ActionItem[]>(location.state?.actionPlan ?? [])
  const [llmAnalysis, setLlmAnalysis] = useState<LLMAnalysis | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const token = location.state?.token ?? searchParams.get('token') ?? localStorage.getItem('nd_token')

  useEffect(() => {
    if (scores || !token) return
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('guest_sessions')
        .select('*')
        .eq('token', token)
        .single()
      if (data) {
        setSession(data)
        setScores(data.scores)
        setGaps(data.gaps ?? [])
        setActionPlan(data.action_plan ?? [])
        setLlmAnalysis(data.llm_analysis)
      }
      setLoading(false)
    }
    load()
  }, [token, scores])

  // Also load session info when we have scores from state but no session
  useEffect(() => {
    if (session || !token) return
    async function loadSession() {
      const { data } = await supabase
        .from('guest_sessions')
        .select('*')
        .eq('token', token)
        .single()
      if (data) setSession(data)
    }
    loadSession()
  }, [token, session])

  const handleGenerateAnalysis = async () => {
    if (!scores || !session) return
    setLoadingAnalysis(true)
    setAnalysisError(null)
    try {
      const res = await fetch('/.netlify/functions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores,
          gaps,
          institution: session.organization ?? 'Unknown',
          entityType: session.entity_type ?? 'regulator',
          country: session.country,
          respondentName: session.name,
          lang,
        }),
      })
      if (!res.ok) throw new Error(t('results.ai.error'))
      const data = await res.json()
      setLlmAnalysis(data.analysis)
      if (token) {
        await supabase
          .from('guest_sessions')
          .update({ llm_analysis: data.analysis })
          .eq('token', token)
      }
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : t('results.ai.error'))
    } finally {
      setLoadingAnalysis(false)
    }
  }

  const handleDownloadPDF = useCallback(() => {
    // Trigger browser print dialog which can save as PDF
    window.print()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brand-cyan)' }} />
        </div>
      </div>
    )
  }

  if (!scores) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="card p-8 max-w-md w-full text-center">
            <AlertCircle size={32} className="mx-auto mb-4 text-amber-500" />
            <h2 className="font-bold text-lg mb-2" style={{ color: 'var(--brand-navy)' }}>{t('results.no_results')}</h2>
            <p className="text-sm text-gray-500 mb-4">{t('results.no_results.sub')}</p>
            <button
              onClick={() => navigate('/assessment')}
              className="btn-primary mx-auto"
            >
              {t('results.start')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const maturityLevel = getMaturityLevel(scores.global)
  const maturityColor = getMaturityColor(maturityLevel)
  const nextLevel = getNextMaturityLevel(scores.global)
  const reportDate = new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'ru' ? 'ru-RU' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })

  const radarData = Object.entries(scores.byPhase).map(([slug, score]) => ({
    subject: phaseNames[slug] ?? slug,
    score,
    fullMark: 100,
  }))

  const barData = Object.entries(scores.byPhase).map(([slug, score]) => ({
    phase: phaseNames[slug] ?? slug,
    slug,
    score,
  }))

  const nextLevelActions = actionPlan.filter(a => a.section === 'next_level')
  const qualityTotalActions = actionPlan.filter(a => a.section === 'quality_total')
  // Fallback: if section is not set, show all in next_level
  const allActionsAreUnsectioned = actionPlan.every(a => !a.section)
  const displayNextLevel = allActionsAreUnsectioned ? actionPlan : nextLevelActions
  const displayQualityTotal = allActionsAreUnsectioned ? [] : qualityTotalActions

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero score */}
      <section style={{ background: 'var(--brand-navy)' }} className="py-12 print:py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Score circle */}
            <div className="flex-shrink-0 text-center">
              <div
                className="w-32 h-32 rounded-full flex flex-col items-center justify-center border-4"
                style={{ borderColor: maturityColor, background: 'rgba(255,255,255,0.05)' }}
              >
                <span className="text-4xl font-black text-white">{scores.global}</span>
                <span className="text-xs text-white/50 font-medium">/ 100</span>
              </div>
              <div className="mt-3">
                <MaturityBadge level={maturityLevel} />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <p className="section-label mb-2">{t('results.title')}</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1" style={{ letterSpacing: '-0.02em' }}>
                {session?.organization ?? session?.name ?? 'Your Organization'}
              </h1>
              {session?.name && (
                <p className="text-white/60 text-sm mb-1">{session.name}</p>
              )}
              <p className="text-white/50 text-sm mb-3">
                {session?.country && `${session.country} · `}
                {session?.entity_type === 'regulator' ? t('results.regulator') : t('results.operator')}
              </p>
              <p className="text-white/40 text-xs mb-4">
                {t('results.date')}: {reportDate}
              </p>

              {/* Current → Next level */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs text-white/40">{t('results.current_level')}:</span>
                <MaturityBadge level={maturityLevel} />
                {maturityLevel !== 'Optimized' && (
                  <>
                    <ArrowRight size={12} className="text-white/30" />
                    <span className="text-xs text-white/40">{t('results.next_level')}:</span>
                    <MaturityBadge level={nextLevel} />
                  </>
                )}
              </div>

              {/* Top gaps */}
              {gaps.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-white/40 self-center">{t('results.topgaps')}:</span>
                  {gaps.map(g => (
                    <span
                      key={g.phaseSlug}
                      className="text-xs px-2 py-1 rounded"
                      style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
                    >
                      {phaseNames[g.phaseSlug] ?? g.phaseSlug}: {g.score}%
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Download PDF button */}
            <div className="flex flex-col gap-2 print:hidden">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded transition-all"
                style={{ background: 'var(--brand-cyan)' }}
              >
                <Download size={14} />
                {t('results.download')}
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar */}
          <div className="card p-6">
            <h2 className="section-heading text-base font-bold mb-6" style={{ color: 'var(--brand-navy)' }}>
              {t('results.radar')}
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="var(--brand-navy)"
                  fill="var(--brand-cyan)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart */}
          <div className="card p-6">
            <h2 className="section-heading text-base font-bold mb-6" style={{ color: 'var(--brand-navy)' }}>
              {t('results.bar')}
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="phase" tick={{ fontSize: 11 }} width={80} />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, 'Score']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {barData.map((entry) => (
                    <Cell key={entry.slug} fill={PHASE_COLORS[entry.slug] ?? '#003087'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phase scores grid */}
        <div>
          <div className="mb-5">
            <h2 className="section-heading text-base font-bold" style={{ color: 'var(--brand-navy)' }}>
              {t('results.phases')}
            </h2>
            <p className="text-sm text-gray-400 mt-1">{t('results.phases.sub')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(scores.byPhase).map(([slug, score]) => {
              const level = getMaturityLevel(score)
              const phaseDesc = PHASE_DESCRIPTIONS[slug]
              const descText = phaseDesc ? (lang === 'es' ? phaseDesc.es : lang === 'fr' ? phaseDesc.en : lang === 'ar' ? phaseDesc.en : lang === 'ru' ? phaseDesc.en : phaseDesc.en) : ''
              return (
                <div key={slug} className="card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--brand-navy)' }}>{phaseNames[slug] ?? slug}</span>
                    <span className="text-xl font-black" style={{ color: PHASE_COLORS[slug] ?? 'var(--brand-navy)' }}>
                      {score}%
                    </span>
                  </div>
                  <div className="progress-bar mb-3">
                    <div
                      className="progress-fill"
                      style={{ width: `${score}%`, background: PHASE_COLORS[slug] ?? 'var(--brand-cyan)' }}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <MaturityBadge level={level} />
                  </div>
                  {descText && (
                    <p className="text-xs text-gray-500 leading-relaxed border-t pt-3 mt-1">{descText}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Plan — Next Level */}
        {displayNextLevel.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-navy)' }}>
                <Target size={16} className="text-white" />
              </div>
              <div>
                <h2 className="section-heading text-base font-bold" style={{ color: 'var(--brand-navy)' }}>
                  {t('results.action.next')}
                </h2>
                <p className="text-xs text-gray-400">{maturityLevel} → {nextLevel}</p>
              </div>
            </div>
            <div className="space-y-3">
              {displayNextLevel.map((action, i) => {
                const title = lang === 'es' ? action.titleEs : action.titleEn
                const rawDesc = lang === 'es' ? (action.descriptionEs ?? action.descriptionEn ?? '') : (action.descriptionEn ?? '')
                // Parse WHY and REQUIRES from description
                const whyMatch = rawDesc.match(/(?:WHY|POR QUÉ):\s*(.+?)(?:\s*\||\s*REQUIRES:|$)/i)
                const reqMatch = rawDesc.match(/(?:REQUIRES|REQUIERE):\s*(.+?)$/i)
                const why = whyMatch ? whyMatch[1].trim() : rawDesc
                const requires = reqMatch ? reqMatch[1].trim() : ''
                return (
                  <div key={action.id} className="card p-5 flex gap-4">
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'var(--brand-navy)' }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--brand-navy)' }}>{title}</h3>
                        <PriorityBadge priority={action.priority} />
                        <HorizonBadge horizon={action.horizon} t={t} />
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        {t('results.phase')}: {phaseNames[action.phaseSlug] ?? action.phaseSlug}
                      </p>
                      {why && (
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('results.action.why')}: </span>
                          <span className="text-sm text-gray-600">{why}</span>
                        </div>
                      )}
                      {requires && (
                        <div className="mt-1 p-2 rounded bg-blue-50">
                          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">{t('results.action.requires')}: </span>
                          <span className="text-xs text-blue-600">{requires}</span>
                        </div>
                      )}
                      <div className="flex gap-4 mt-2">
                        <span className="text-xs text-gray-400">
                          {t('results.effort')}: <span className="font-medium text-gray-600">{action.effort}</span>
                        </span>
                        <span className="text-xs text-gray-400">
                          {t('results.impact')}: <span className="font-medium text-gray-600">{action.impact}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Plan — Roadmap to Total Quality */}
        {displayQualityTotal.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-cyan)' }}>
                <Map size={16} className="text-white" />
              </div>
              <div>
                <h2 className="section-heading text-base font-bold" style={{ color: 'var(--brand-navy)' }}>
                  {t('results.action.total')}
                </h2>
                <p className="text-xs text-gray-400">{nextLevel} → Optimized</p>
              </div>
            </div>
            <div className="space-y-3">
              {displayQualityTotal.map((action, i) => {
                const title = lang === 'es' ? action.titleEs : action.titleEn
                const rawDesc = lang === 'es' ? (action.descriptionEs ?? action.descriptionEn ?? '') : (action.descriptionEn ?? '')
                const whyMatch = rawDesc.match(/(?:WHY|POR QUÉ):\s*(.+?)(?:\s*\||\s*REQUIRES:|$)/i)
                const reqMatch = rawDesc.match(/(?:REQUIRES|REQUIERE):\s*(.+?)$/i)
                const why = whyMatch ? whyMatch[1].trim() : rawDesc
                const requires = reqMatch ? reqMatch[1].trim() : ''
                return (
                  <div key={action.id} className="card p-5 flex gap-4 border-l-4" style={{ borderLeftColor: 'var(--brand-cyan)' }}>
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'var(--brand-cyan)' }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm" style={{ color: 'var(--brand-navy)' }}>{title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">Long-term</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        {t('results.phase')}: {phaseNames[action.phaseSlug] ?? action.phaseSlug}
                      </p>
                      {why && (
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('results.action.why')}: </span>
                          <span className="text-sm text-gray-600">{why}</span>
                        </div>
                      )}
                      {requires && (
                        <div className="mt-1 p-2 rounded bg-cyan-50">
                          <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">{t('results.action.requires')}: </span>
                          <span className="text-xs text-cyan-600">{requires}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* AI Analysis */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-heading text-base font-bold" style={{ color: 'var(--brand-navy)' }}>
              {t('results.ai.title')}
            </h2>
            {!llmAnalysis && (
              <button
                onClick={handleGenerateAnalysis}
                disabled={loadingAnalysis}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-sm disabled:opacity-50 print:hidden"
                style={{ background: 'var(--brand-cyan)' }}
              >
                {loadingAnalysis ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                {loadingAnalysis ? t('results.ai.generating') : t('results.ai.generate')}
              </button>
            )}
          </div>

          {analysisError && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 mb-4">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertCircle size={14} />
                {analysisError}
              </p>
            </div>
          )}

          {llmAnalysis ? (
            <LLMSection analysis={llmAnalysis} t={t} lang={lang} />
          ) : (
            <div className="card p-8 text-center border-dashed">
              <Zap size={24} className="mx-auto mb-3" style={{ color: 'var(--brand-cyan)' }} />
              <p className="text-sm text-gray-500 mb-1">
                {t('results.ai.placeholder')}
              </p>
              <p className="text-xs text-gray-400">
                {t('results.ai.placeholder.sub')}
              </p>
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  )
}
