import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CheckCircle, Info, Loader2, AlertCircle, Save } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAssessment } from '../hooks/useAssessment'
import type { Question, Phase } from '../lib/supabase'

const SCALE_LABELS = ['Does not exist', 'Initial / Basic', 'Established', 'Advanced / Optimized']

function ScaleQuestion({ question, value, onChange }: {
  question: Question
  value: number | undefined
  onChange: (v: number) => void
}) {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="mb-8 animate-fade-in-up">
      <div className="flex items-start gap-3 mb-4">
        <p className="text-base font-medium text-gray-800 flex-1 leading-relaxed">
          {question.text_en}
        </p>
        {question.help_en && (
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="flex-shrink-0 p-1 rounded text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Info size={16} />
          </button>
        )}
      </div>

      {showHelp && question.help_en && (
        <div className="mb-4 p-3 rounded-lg text-sm text-gray-600 leading-relaxed"
          style={{ background: 'var(--brand-light)', borderLeft: '3px solid var(--brand-cyan)' }}>
          {question.help_en}
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(v => (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all text-center ${
              value === v
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                value === v
                  ? 'text-white'
                  : 'text-gray-500'
              }`}
              style={value === v ? { background: 'var(--brand-navy)' } : { background: '#F3F4F6' }}
            >
              {v}
            </div>
            <span className="text-xs text-gray-500 leading-tight">{SCALE_LABELS[v - 1]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function BarrierQuestion({ question, value, onChange }: {
  question: Question
  value: number | undefined
  onChange: (v: number) => void
}) {
  const options = question.options ?? []

  return (
    <div className="mb-8 animate-fade-in-up">
      <p className="text-base font-medium text-gray-800 mb-4 leading-relaxed">
        {question.text_en}
      </p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={opt.value}
            onClick={() => onChange(i + 1)}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm ${
              value === i + 1
                ? 'border-blue-600 bg-blue-50 font-medium text-blue-900'
                : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            {opt.labelEn}
          </button>
        ))}
      </div>
    </div>
  )
}

function PhaseTab({ phase, isActive, isCompleted, completionRate, onClick }: {
  phase: Phase
  isActive: boolean
  isCompleted: boolean
  completionRate: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`phase-tab flex-shrink-0 ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
    >
      <div className="flex items-center gap-2">
        {isCompleted && <CheckCircle size={13} className="text-emerald-500" />}
        <span>Phase {phase.order_index}</span>
        {completionRate > 0 && completionRate < 100 && (
          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
            {completionRate}%
          </span>
        )}
      </div>
    </button>
  )
}

interface ProfileForm {
  name: string
  organization: string
  country: string
  entityType: 'regulator' | 'designated_operator'
  email: string
}

export default function Assessment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    phases, questions, loading, error,
    answers, currentPhaseIndex,
    saveAnswer, goToPhase, completeAssessment,
    restoreFromToken, questionsForPhase, phaseCompletionRate,
    token,
  } = useAssessment()

  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profile, setProfile] = useState<ProfileForm>({
    name: '', organization: '', country: '', entityType: 'regulator', email: ''
  })
  const [tokenInput, setTokenInput] = useState('')
  const [restoreError, setRestoreError] = useState('')

  // Restore from URL token
  useEffect(() => {
    const urlToken = searchParams.get('token')
    if (urlToken) {
      restoreFromToken(urlToken)
    }
  }, [searchParams, restoreFromToken])

  const currentPhase = phases[currentPhaseIndex]
  const currentQuestions = currentPhase ? questionsForPhase(currentPhase.id) : []
  const isLastPhase = currentPhaseIndex === phases.length - 1

  const handleAnswer = async (questionId: number, value: number) => {
    setSaving(true)
    await saveAnswer(questionId, value)
    setSaving(false)
  }

  const handleNext = async () => {
    if (currentPhaseIndex < phases.length - 1) {
      await goToPhase(currentPhaseIndex + 1)
    } else {
      setShowProfileModal(true)
    }
  }

  const handlePrev = async () => {
    if (currentPhaseIndex > 0) {
      await goToPhase(currentPhaseIndex - 1)
    }
  }

  const handleComplete = async () => {
    if (!profile.name || !profile.organization || !profile.country) return
    setCompleting(true)
    try {
      const { scores, gaps, actionPlan } = await completeAssessment({
        name: profile.name,
        organization: profile.organization,
        country: profile.country,
        entityType: profile.entityType,
        email: profile.email || undefined,
      })
      navigate('/results', { state: { scores, gaps, actionPlan, token } })
    } catch (e) {
      console.error(e)
    } finally {
      setCompleting(false)
    }
  }

  const handleRestoreToken = async () => {
    setRestoreError('')
    const ok = await restoreFromToken(tokenInput.trim())
    if (!ok) setRestoreError('Token not found. Please check and try again.')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: 'var(--brand-cyan)' }} />
            <p className="text-gray-500">Loading assessment...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="card p-8 max-w-md w-full text-center">
            <AlertCircle size={32} className="mx-auto mb-4 text-red-500" />
            <h2 className="font-bold text-lg mb-2 text-gray-800">Failed to load assessment</h2>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <p className="text-xs text-gray-400">Make sure Supabase environment variables are configured correctly.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentPhase) return null

  const totalScoredQuestions = questions.filter(q => q.question_type !== 'barrier' && phases.find(p => p.id === q.phase_id && !p.scoring_excluded)).length
  const answeredScored = questions.filter(q => q.question_type !== 'barrier' && answers[String(q.id)] !== undefined && phases.find(p => p.id === q.phase_id && !p.scoring_excluded)).length
  const overallProgress = totalScoredQuestions > 0 ? Math.round((answeredScored / totalScoredQuestions) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Progress header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-sm font-bold" style={{ color: 'var(--brand-navy)' }}>
                Postal Quality Maturity Assessment
              </h1>
              <p className="text-xs text-gray-400">
                Phase {currentPhase.order_index}: {currentPhase.title_en}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {saving && <Loader2 size={14} className="animate-spin text-gray-400" />}
              <span className="text-xs text-gray-400">{overallProgress}% complete</span>
              {token && (
                <div className="hidden md:flex items-center gap-1 text-xs text-gray-400">
                  <Save size={12} />
                  <span className="font-mono">{token.slice(0, 8)}...</span>
                </div>
              )}
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        {/* Phase tabs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-0 -mb-px scrollbar-hide">
            {phases.map((phase, i) => (
              <PhaseTab
                key={phase.id}
                phase={phase}
                isActive={i === currentPhaseIndex}
                isCompleted={phaseCompletionRate(phase.id) === 100}
                completionRate={phaseCompletionRate(phase.id)}
                onClick={() => goToPhase(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Phase header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: currentPhase.color ?? 'var(--brand-navy)' }}
            >
              {currentPhase.order_index}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--brand-navy)' }}>
                {currentPhase.title_en}
              </h2>
              {currentPhase.scoring_excluded && (
                <span className="text-xs text-gray-400">Context phase — not scored</span>
              )}
            </div>
          </div>
          {currentPhase.description_en && (
            <p className="text-sm text-gray-500 ml-11">{currentPhase.description_en}</p>
          )}
        </div>

        {/* Questions */}
        <div className="card p-6 md:p-8">
          {currentQuestions.map(q => {
            if (q.question_type === 'barrier') {
              return (
                <BarrierQuestion
                  key={q.id}
                  question={q}
                  value={answers[String(q.id)]}
                  onChange={v => handleAnswer(q.id, v)}
                />
              )
            }
            return (
              <ScaleQuestion
                key={q.id}
                question={q}
                value={answers[String(q.id)]}
                onChange={v => handleAnswer(q.id, v)}
              />
            )
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={currentPhaseIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="flex gap-1">
            {phases.map((_, i) => (
              <div
                key={i}
                className={`wizard-dot ${i === currentPhaseIndex ? 'active' : ''} ${phaseCompletionRate(phases[i].id) === 100 ? 'completed' : ''}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-sm transition-all hover:opacity-90"
            style={{ background: isLastPhase ? 'var(--brand-green)' : 'var(--brand-navy)' }}
          >
            {isLastPhase ? 'Complete & View Results' : 'Next Phase'}
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Token restore */}
        {!token && (
          <div className="mt-8 p-4 rounded-lg border border-dashed border-gray-200">
            <p className="text-xs text-gray-500 mb-2 font-medium">Resume a previous assessment</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder="Enter your session token..."
                className="flex-1 text-xs border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
              />
              <button
                onClick={handleRestoreToken}
                className="px-3 py-2 text-xs font-medium text-white rounded"
                style={{ background: 'var(--brand-navy)' }}
              >
                Restore
              </button>
            </div>
            {restoreError && <p className="text-xs text-red-500 mt-1">{restoreError}</p>}
          </div>
        )}

        {token && (
          <div className="mt-6 p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-xs text-green-700">
              <strong>Progress saved.</strong> Your token: <code className="font-mono bg-green-100 px-1 rounded">{token}</code>
              <br />
              <span className="text-green-600">Save this token to resume your assessment later.</span>
            </p>
          </div>
        )}
      </main>

      {/* Profile modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--brand-navy)' }}>
              Complete Your Profile
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              This information personalizes your analysis report.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Organization *</label>
                <input
                  type="text"
                  value={profile.organization}
                  onChange={e => setProfile(p => ({ ...p, organization: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Your organization"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Country *</label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={e => setProfile(p => ({ ...p, country: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="Country"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Entity Type *</label>
                <select
                  value={profile.entityType}
                  onChange={e => setProfile(p => ({ ...p, entityType: e.target.value as 'regulator' | 'designated_operator' }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="regulator">Postal Regulator</option>
                  <option value="designated_operator">Designated Operator</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  placeholder="To receive your report"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!profile.name || !profile.organization || !profile.country || completing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--brand-navy)' }}
              >
                {completing ? <Loader2 size={14} className="animate-spin" /> : null}
                {completing ? 'Processing...' : 'View My Results'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
