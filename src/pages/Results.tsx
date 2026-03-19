import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts'
import { Download, Loader2, AlertCircle, ChevronDown, ChevronUp, Zap, TrendingUp, ArrowRight, Clock, Target, Edit3, CheckCircle2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { getMaturityLevel, getMaturityColor, getNextMaturityLevel, PHASE_DESCRIPTIONS } from '../lib/scoring'
import type { ScoreResult, Gap, ActionItem, GuestSession, LLMAnalysis } from '../lib/supabase'

const PHASE_COLORS: Record<string, string> = {
  phase0: '#64748B',
  phase1: '#0077C8',
  phase2: '#7C3AED',
  phase3: '#059669',
  phase4: '#D97706',
  phase5: '#DC2626',
  phase6: '#0891B2',
  phase7: '#7C3AED',
}

// Maturity levels in order
const MATURITY_LEVELS = ['Initial', 'Developing', 'Defined', 'Managed', 'Optimized']
const MATURITY_COLORS: Record<string, string> = {
  Initial: '#EF4444',
  Developing: '#F97316',
  Defined: '#EAB308',
  Managed: '#22C55E',
  Optimized: '#0077C8',
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
  const colors: Record<string, string> = {
    high: 'bg-red-50 text-red-700',
    medium: 'bg-amber-50 text-amber-700',
    low: 'bg-green-50 text-green-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${colors[priority] ?? 'bg-gray-50 text-gray-600'}`}>
      {priority.toUpperCase()}
    </span>
  )
}

function HorizonBadge({ horizon }: { horizon: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    short: { bg: '#EFF6FF', text: '#1D4ED8', label: '0–6 months' },
    medium: { bg: '#F5F3FF', text: '#6D28D9', label: '6–18 months' },
    long: { bg: '#F0FDF4', text: '#15803D', label: '18+ months' },
  }
  const s = styles[horizon] ?? styles.long
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: s.bg, color: s.text }}
    >
      <Clock size={10} />
      {s.label}
    </span>
  )
}

// ── Horizontal Maturity Timeline ─────────────────────────────────────────────
function MaturityTimeline({ currentLevel, t }: { currentLevel: string; t: (k: string) => string }) {
  const currentIdx = MATURITY_LEVELS.indexOf(currentLevel)

  return (
    <div className="card p-6 overflow-x-auto">
      <h2 className="section-heading text-base font-bold mb-2" style={{ color: 'var(--brand-navy)' }}>
        Maturity Roadmap
      </h2>
      <p className="text-xs text-gray-400 mb-6">{t('results.roadmap.sub')}</p>

      {/* Timeline track */}
      <div className="relative min-w-[600px]">
        {/* Connector line */}
        <div className="absolute top-8 left-[10%] right-[10%] h-1 rounded-full" style={{ background: '#E5E7EB' }} />
        {/* Filled progress */}
        <div
          className="absolute top-8 left-[10%] h-1 rounded-full transition-all duration-700"
          style={{
            background: 'linear-gradient(90deg, #EF4444, #F97316, #EAB308, #22C55E, #0077C8)',
            width: `${(currentIdx / (MATURITY_LEVELS.length - 1)) * 80}%`,
          }}
        />

        {/* Nodes */}
        <div className="flex justify-between relative z-10">
          {MATURITY_LEVELS.map((level, idx) => {
            const isPast = idx < currentIdx
            const isCurrent = idx === currentIdx
            const isFuture = idx > currentIdx
            const color = MATURITY_COLORS[level]

            return (
              <div key={level} className="flex flex-col items-center gap-2 flex-1">
                {/* Node circle */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-sm"
                  style={{
                    borderColor: isFuture ? '#E5E7EB' : color,
                    background: isCurrent ? color : isPast ? `${color}20` : '#F9FAFB',
                    boxShadow: isCurrent ? `0 0 0 6px ${color}25` : undefined,
                  }}
                >
                  {isPast ? (
                    <CheckCircle2 size={24} style={{ color }} />
                  ) : isCurrent ? (
                    <span className="text-white font-black text-sm">NOW</span>
                  ) : (
                    <span className="text-xs font-bold" style={{ color: '#D1D5DB' }}>{idx + 1}</span>
                  )}
                </div>

                {/* Label */}
                <div className="text-center">
                  <p
                    className="text-xs font-bold"
                    style={{ color: isFuture ? '#9CA3AF' : color }}
                  >
                    {level}
                  </p>
                  {isCurrent && (
                    <span
                      className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-semibold text-white"
                      style={{ background: color }}
                    >
                      {t('results.roadmap.current')}
                    </span>
                  )}
                  {isFuture && idx === currentIdx + 1 && (
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                      {t('results.roadmap.next')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── LLM Analysis Section ─────────────────────────────────────────────────────
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

// ── Main Component ────────────────────────────────────────────────────────────
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
  const [analysisTriggered, setAnalysisTriggered] = useState(false)
  const forceRegenerate = location.state?.forceRegenerate === true

  const token = location.state?.token ?? searchParams.get('token') ?? localStorage.getItem('nd_token')

  // Load session + scores from Supabase if not in state
  useEffect(() => {
    if ((scores && session) || !token) return
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('guest_sessions')
        .select('*')
        .eq('token', token)
        .single()
      if (data) {
        setSession(data)
        if (!scores) {
          setScores(data.scores)
          setGaps(data.gaps ?? [])
          setActionPlan(data.action_plan ?? [])
        }
        if (!forceRegenerate && data.llm_analysis) {
          setLlmAnalysis(data.llm_analysis)
        }
      }
      setLoading(false)
    }
    load()
  }, [token])

  const handleGenerateAnalysis = useCallback(async (currentScores: ScoreResult, currentSession: GuestSession) => {
    setLoadingAnalysis(true)
    setAnalysisError(null)
    try {
      const res = await fetch('/.netlify/functions/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores: currentScores,
          gaps,
          institution: currentSession.organization ?? currentSession.name ?? 'Unknown',
          entityType: currentSession.entity_type ?? 'regulator',
          country: currentSession.country,
          respondentName: currentSession.name,
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
  }, [gaps, lang, t, token])

  // Auto-generate analysis once session and scores are both ready
  useEffect(() => {
    if (analysisTriggered || loadingAnalysis || !scores || !session) return
    if (llmAnalysis && !forceRegenerate) return
    setAnalysisTriggered(true)
    handleGenerateAnalysis(scores, session)
  }, [scores, session, llmAnalysis, loadingAnalysis, analysisTriggered, forceRegenerate, handleGenerateAnalysis])

  const handleDownloadPDF = useCallback(() => {
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
  const reportDate = new Date().toLocaleDateString(
    lang === 'ar' ? 'ar-SA' : lang === 'ru' ? 'ru-RU' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-GB',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

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
  const allActionsAreUnsectioned = actionPlan.every(a => !a.section)
  const displayNextLevel = allActionsAreUnsectioned ? actionPlan : nextLevelActions
  const displayQualityTotal = allActionsAreUnsectioned ? [] : qualityTotalActions

  // Organization name: prefer organization field, fallback to name
  const orgName = session?.organization || session?.name || 'Your Organization'
  const respondentName = session?.organization ? session?.name : null

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
                {orgName}
              </h1>
              {respondentName && (
                <p className="text-white/60 text-sm mb-1">{respondentName}</p>
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

        {/* Maturity Timeline */}
        <MaturityTimeline currentLevel={maturityLevel} t={t} />

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
              const descText = phaseDesc ? (lang === 'es' ? phaseDesc.es : phaseDesc.en) : ''
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
                        <HorizonBadge horizon={action.horizon} />
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
                <ArrowRight size={16} className="text-white" />
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
                        <HorizonBadge horizon={action.horizon} />
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

        {/* Analysis */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-navy)' }}>
              <Zap size={16} className="text-white" />
            </div>
            <h2 className="section-heading text-base font-bold" style={{ color: 'var(--brand-navy)' }}>
              Analysis
            </h2>
          </div>

          {analysisError && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 mb-4">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <AlertCircle size={14} />
                {analysisError}
              </p>
            </div>
          )}

          {loadingAnalysis && !llmAnalysis && (
            <div className="card p-8 text-center">
              <Loader2 size={24} className="mx-auto mb-3 animate-spin" style={{ color: 'var(--brand-cyan)' }} />
              <p className="text-sm text-gray-500">{t('results.ai.generating')}</p>
            </div>
          )}

          {llmAnalysis && (
            <LLMSection analysis={llmAnalysis} t={t} lang={lang} />
          )}
        </div>

        {/* Review & Edit Answers — final section */}
        <div className="card p-6 border-2 print:hidden" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-light)' }}>
                <Edit3 size={18} style={{ color: 'var(--brand-navy)' }} />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--brand-navy)' }}>
                  {t('results.review.title')}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-lg">
                  {t('results.review.desc')}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/assessment', { state: { token, editMode: true } })}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded border-2 transition-all hover:bg-gray-50 flex-shrink-0"
              style={{ borderColor: 'var(--brand-navy)', color: 'var(--brand-navy)' }}
            >
              <Edit3 size={14} />
              {t('results.review.btn')}
            </button>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  )
}
