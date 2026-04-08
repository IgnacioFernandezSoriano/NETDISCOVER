import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CheckCircle, Info, Loader2, AlertCircle, Save, Mail, BookmarkCheck, X } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAssessment } from '../hooks/useAssessment'
import { useI18n } from '../lib/i18n'
import { supabase } from '../lib/supabase'
import { getLocalizedText } from '../lib/i18n'
import { notifySurveyInProcess, notifySurveyComplete } from '../lib/email'
import type { Question, Phase, OptionItem } from '../lib/supabase'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getOptionLabel(opt: OptionItem, lang: string): string {
  if (lang === 'es') return opt.label_es || opt.label_en || String(opt.value)
  if (lang === 'fr') return opt.label_fr || opt.label_en || opt.label_es || String(opt.value)
  if (lang === 'ar') return opt.label_ar || opt.label_en || opt.label_es || String(opt.value)
  if (lang === 'ru') return opt.label_ru || opt.label_en || opt.label_es || String(opt.value)
  return opt.label_en || opt.label_es || String(opt.value)
}

function getOptionDesc(opt: OptionItem, lang: string): string {
  if (lang === 'es') return opt.desc_es || opt.desc_en || ''
  return opt.desc_en || opt.desc_es || ''
}

// ── Components ────────────────────────────────────────────────────────────────

function BarrierQuestion({ question, value, onChange, lang }: any) {
  const { t } = useI18n()
  const title = getLocalizedText(question, 'text', lang) || question.text_en
  const options = question.options_json || [
    { value: 1, label_en: 'Yes', label_es: 'Sí', label_fr: 'Oui' },
    { value: 0, label_en: 'No', label_es: 'No', label_fr: 'Non' }
  ]

  return (
    <div className="mb-10 animate-fade-in">
      <div className="flex items-start gap-3 mb-4">
        <div className="mt-1 p-1.5 rounded-lg bg-amber-50 text-amber-600">
          <Info size={16} />
        </div>
        <h3 className="text-lg font-bold text-gray-800 leading-tight">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 ml-11">
        {options.map((opt: any) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-4 py-3 rounded-xl border-2 font-semibold transition-all text-sm ${
              value === opt.value
                ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
            }`}
          >
            {getLocalizedText(opt, 'label', lang) || opt.label_en}
          </button>
        ))}
      </div>
    </div>
  )
}

function MultipleChoiceQuestion({ question, value = [], onChange, lang }: any) {
  const { t } = useI18n()
  const title = getLocalizedText(question, 'text', lang) || question.text_en
  const options = question.options_json || []

  const toggleOption = (optValue: string | number) => {
    const current = Array.isArray(value) ? value : []
    if (current.includes(String(optValue))) {
      onChange(current.filter(v => v !== String(optValue)))
    } else {
      onChange([...current, String(optValue)])
    }
  }

  return (
    <div className="mb-10 animate-fade-in">
      <h3 className="text-lg font-bold text-gray-800 mb-2 leading-tight">{title}</h3>
      <p className="text-xs text-gray-400 mb-4">{lang === 'es' ? 'Puede seleccionar varias opciones' : 'You may select multiple options'}</p>
      <div className="space-y-2">
        {options.map((opt: any) => {
          const isSelected = Array.isArray(value) && value.includes(String(opt.value))
          const label = getOptionLabel(opt, lang)
          const desc = getOptionDesc(opt, lang)
          return (
            <button
              key={opt.value}
              onClick={() => toggleOption(opt.value)}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-50 bg-gray-50/50 text-gray-600 hover:border-gray-200'
              }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${
                isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
              }`}>
                {isSelected && <CheckCircle size={12} className="text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                  {label}
                </p>
                {desc && (
                  <p className={`text-xs mt-0.5 leading-relaxed ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                    {desc}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SingleChoiceQuestion({ question, value, onChange, lang }: any) {
  const title = getLocalizedText(question, 'text', lang) || question.text_en
  const options = question.options_json || []

  return (
    <div className="mb-10 animate-fade-in">
      <h3 className="text-lg font-bold text-gray-800 mb-4 leading-tight">{title}</h3>
      <div className="space-y-2">
        {options.map((opt: any) => {
          const isSelected = value === opt.value
          const label = getOptionLabel(opt, lang)
          const desc = getOptionDesc(opt, lang)
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-50 bg-gray-50/50 text-gray-600 hover:border-gray-200'
              }`}
            >
              <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
              }`}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                  {label}
                </p>
                {desc && (
                  <p className={`text-xs mt-0.5 leading-relaxed ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                    {desc}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ScaleQuestion({ question, value, onChange, lang }: any) {
  const { t } = useI18n()
  const [showHelp, setShowHelp] = useState(false)
  const title = getLocalizedText(question, 'text', lang) || question.text_en
  const help = getLocalizedText(question, 'help', lang) || question.help_en
  const options = question.options_json || []

  return (
    <div className="mb-12 animate-fade-in">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 leading-tight mb-1">{title}</h3>
        </div>
        {help && (
          <button
            onClick={() => setShowHelp(!showHelp)}
            className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
              showHelp ? 'bg-blue-100 text-blue-600' : 'text-gray-300 hover:text-blue-500'
            }`}
          >
            <Info size={18} />
          </button>
        )}
      </div>

      {showHelp && help && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800 leading-relaxed animate-slide-down">
          {help}
        </div>
      )}

      {options && options.length > 0 ? (
        <div className="space-y-2">
          {options.map((opt: any) => {
            const numVal = typeof opt.value === 'number' ? opt.value : parseInt(String(opt.value))
            const label = getOptionLabel(opt, lang)
            const desc = getOptionDesc(opt, lang)
            const isSelected = value === numVal
            return (
              <button
                key={opt.value}
                onClick={() => onChange(numVal)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-50 bg-gray-50/50 text-gray-600 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                      isSelected ? 'text-white' : 'text-gray-500'
                    }`}
                    style={isSelected ? { background: 'var(--brand-navy)' } : { background: '#E5E7EB' }}
                  >
                    {numVal}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                      {label}
                    </p>
                    {desc && (
                      <p className={`text-xs mt-0.5 leading-relaxed ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                        {desc}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(num => (
            <button
              key={num}
              onClick={() => onChange(num)}
              className={`h-14 rounded-xl border-2 font-bold transition-all ${
                value === num
                  ? 'border-blue-600 bg-blue-600 text-white shadow-lg'
                  : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PhaseTab({ phase, isActive, isCompleted, completionRate, onClick, lang }: any) {
  const title = getLocalizedText(phase, 'title', lang) || phase.title_en
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-5 py-3 border-b-2 transition-all flex items-center gap-2 ${
        isActive
          ? 'border-blue-600 text-blue-600 bg-blue-50/30'
          : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      }`}
    >
      <span className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${
        isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
      }`}>
        {isCompleted ? '✓' : phase.order_index}
      </span>
      <span className="text-xs font-bold whitespace-nowrap">{title}</span>
      {completionRate > 0 && completionRate < 100 && (
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
      )}
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

// ── Main Component ────────────────────────────────────────────────────────────

export default function Assessment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { t, lang } = useI18n()
  const {
    phases, questions, loading, error,
    answers, currentPhaseIndex,
    saveAnswer, goToPhase, completeAssessment,
    restoreFromToken, questionsForPhase, phaseCompletionRate,
    token, updateSessionEmail
  } = useAssessment()

  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveEmailInput, setSaveEmailInput] = useState('')
  const [saveEmailSent, setSaveEmailSent] = useState(false)
  
  const [profile, setProfile] = useState<ProfileForm>({
    name: '', organization: '', country: '', entityType: 'regulator', email: ''
  })
  const [tokenInput, setTokenInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [restoreError, setRestoreError] = useState('')
  const [restoreMode, setRestoreMode] = useState<'token' | 'email'>('token')

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

  const handleAnswer = async (questionId: number, value: number | string[]) => {
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

  const handleSaveAndExit = () => {
    setShowSaveModal(true)
  }

  const handleConfirmSaveEmail = async () => {
    if (!saveEmailInput.trim()) return
    setSaving(true)
    try {
      await updateSessionEmail(saveEmailInput)
      // Notificación silenciosa solicitada
      await notifySurveyInProcess(saveEmailInput)
      setSaveEmailSent(true)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
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
      
      // Notificación de finalización con reporte resumido
      const summary = `Scores: ${JSON.stringify(scores.byPhase)}\nTotal Score: ${scores.global}`;
      await notifySurveyComplete(profile, scores, summary);
      
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
    if (!ok) setRestoreError(t('assessment.resume.error'))
  }

  const handleRestoreEmail = async () => {
    setRestoreError('')
    if (!emailInput.trim()) return
    const { data } = await supabase
      .from('guest_sessions')
      .select('token')
      .eq('email', emailInput.trim().toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (!data?.token) {
      setRestoreError(t('assessment.resume.error'))
      return
    }
    const ok = await restoreFromToken(data.token)
    if (!ok) setRestoreError(t('assessment.resume.error'))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: 'var(--brand-cyan)' }} />
            <p className="text-gray-500">{t('assessment.loading')}</p>
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
            <h2 className="font-bold text-lg mb-2 text-gray-800">{t('assessment.error')}</h2>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <p className="text-xs text-gray-400">{t('assessment.error.hint')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentPhase) return null

  const totalScoredQuestions = questions.filter(q => q.question_type !== 'barrier' && phases.find(p => p.id === q.phase_id && !p.scoring_excluded)).length
  const answeredScored = questions.filter(q => q.question_type !== 'barrier' && answers[String(q.id)] !== undefined && phases.find(p => p.id === q.phase_id && !p.scoring_excluded)).length
  const overallProgress = totalScoredQuestions > 0 ? Math.round((answeredScored / totalScoredQuestions) * 100) : 0

  const phaseTitle = getLocalizedText(currentPhase as unknown as Record<string, unknown>, 'title', lang as 'en' | 'es' | 'fr') || currentPhase.title_en
  const phaseDesc = getLocalizedText(currentPhase as unknown as Record<string, unknown>, 'description', lang as 'en' | 'es' | 'fr') || currentPhase.description_en

  const saveLabel = lang === 'es' ? 'Guardar y continuar después' :
    lang === 'fr' ? 'Sauvegarder et continuer plus tard' :
    lang === 'ar' ? 'حفظ والمتابعة لاحقاً' :
    lang === 'ru' ? 'Сохранить и продолжить позже' :
    'Save & continue later'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Progress header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-sm font-bold" style={{ color: 'var(--brand-navy)' }}>
                {t('assessment.title')}
              </h1>
              <p className="text-xs text-gray-400">
                {lang === 'es' ? `Fase ${currentPhase.order_index}` : `Phase ${currentPhase.order_index}`}: {phaseTitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {saving && <Loader2 size={14} className="animate-spin text-gray-400" />}
              <span className="text-xs text-gray-400">{overallProgress}{t('assessment.complete')}</span>
              {/* Save & Exit button */}
              <button
                onClick={handleSaveAndExit}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <BookmarkCheck size={13} />
                {saveLabel}
              </button>
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
                lang={lang}
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
                {phaseTitle}
              </h2>
              {currentPhase.scoring_excluded && (
                <span className="text-xs text-gray-400">{t('assessment.context')}</span>
              )}
            </div>
          </div>
          {phaseDesc && (
            <p className="text-sm text-gray-500 ml-11">{phaseDesc}</p>
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
                  value={answers[String(q.id)] as number | undefined}
                  onChange={(v: any) => handleAnswer(q.id, v)}
                  lang={lang}
                />
              )
            }
            if (q.question_type === 'multiple_choice') {
              return (
                <MultipleChoiceQuestion
                  key={q.id}
                  question={q}
                  value={answers[String(q.id)] as string[] | undefined}
                  onChange={(v: any) => handleAnswer(q.id, v)}
                  lang={lang}
                />
              )
            }
            if (q.question_type === 'single_choice') {
              return (
                <SingleChoiceQuestion
                  key={q.id}
                  question={q}
                  value={answers[String(q.id)] as number | undefined}
                  onChange={(v: any) => handleAnswer(q.id, v)}
                  lang={lang}
                />
              )
            }
            return (
              <ScaleQuestion
                key={q.id}
                question={q}
                value={answers[String(q.id)] as number | undefined}
                onChange={(v: any) => handleAnswer(q.id, v)}
                lang={lang}
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
            {t('assessment.prev')}
          </button>

          <div className="flex gap-1">
            {phases.map((_, i) => (
              <div
                key={i}
                className={`wizard-dot ${i === currentPhaseIndex ? 'active' : ''} ${phaseCompletionRate(phases[i].id) === 100 ? 'completed' : ''}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile save button */}
            <button
              onClick={handleSaveAndExit}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <BookmarkCheck size={13} />
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-sm transition-all hover:opacity-90"
              style={{ background: isLastPhase ? 'var(--brand-green)' : 'var(--brand-navy)' }}
            >
              {isLastPhase ? t('assessment.finish') : t('assessment.next')}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Restore section — only when no active session */}
        {!token && (
          <div className="mt-8 p-5 rounded-xl border border-dashed border-gray-200 bg-white">
            <p className="text-xs font-semibold text-gray-600 mb-3">{t('assessment.resume.title')}</p>

            {/* Toggle */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setRestoreMode('token')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  restoreMode === 'token' ? 'text-white' : 'text-gray-500 hover:text-gray-700 bg-gray-100'
                }`}
                style={restoreMode === 'token' ? { background: 'var(--brand-navy)' } : {}}
              >
                <Save size={12} />
                Token
              </button>
              <button
                onClick={() => setRestoreMode('email')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  restoreMode === 'email' ? 'text-white' : 'text-gray-500 hover:text-gray-700 bg-gray-100'
                }`}
                style={restoreMode === 'email' ? { background: 'var(--brand-navy)' } : {}}
              >
                <Mail size={12} />
                Email
              </button>
            </div>

            <div className="flex gap-2">
              {restoreMode === 'token' ? (
                <>
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                    placeholder={t('assessment.resume.token.placeholder')}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={handleRestoreToken}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
                    style={{ background: 'var(--brand-navy)' }}
                  >
                    {t('assessment.resume.button')}
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder={t('assessment.resume.email.placeholder')}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={handleRestoreEmail}
                    className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
                    style={{ background: 'var(--brand-navy)' }}
                  >
                    {t('assessment.resume.button')}
                  </button>
                </>
              )}
            </div>
            {restoreError && <p className="mt-2 text-[10px] text-red-500 font-medium">{restoreError}</p>}
          </div>
        )}

        {/* Active token display */}
        {token && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="text-xs text-green-700">
              <strong>{t('assessment.saved')}</strong>{' '}
              <code className="font-mono bg-green-100 px-1.5 py-0.5 rounded text-xs">{token}</code>
              <br />
              <span className="text-green-600 mt-1 block">{t('assessment.saved.hint')}</span>
            </p>
          </div>
        )}
      </main>

      {/* ── Save & Continue Later Modal ─────────────────────────────────────── */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in relative">
            <button 
              onClick={() => setShowSaveModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'var(--brand-light)' }}
            >
              <BookmarkCheck size={20} style={{ color: 'var(--brand-navy)' }} />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--brand-navy)' }}>
              {lang === 'es' ? 'Guardar progreso' : 'Save progress'}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {lang === 'es' ? 'Introduce tu email para poder retomar la evaluación más tarde desde cualquier dispositivo.' :
               'Enter your email to resume the assessment later from any device.'}
            </p>

            {!saveEmailSent ? (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={saveEmailInput}
                    onChange={e => setSaveEmailInput(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                    placeholder="you@organization.org"
                  />
                </div>
                <button
                  onClick={handleConfirmSaveEmail}
                  disabled={!saveEmailInput.trim() || saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--brand-navy)' }}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {lang === 'es' ? 'Guardar y recibir enlace' : 'Save & get link'}
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-green-50 border border-green-100 mb-6 text-center">
                <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
                <p className="text-sm text-green-800 font-medium mb-1">
                  {lang === 'es' ? '¡Progreso guardado!' : 'Progress saved!'}
                </p>
                <p className="text-xs text-green-600">
                  {lang === 'es' ? 'Podrás retomar usando tu email.' : 'You can resume using your email.'}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {lang === 'es' ? 'Volver a la encuesta' : 'Back to survey'}
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90"
                style={{ background: 'var(--brand-navy)' }}
              >
                {lang === 'es' ? 'Salir al inicio' : 'Exit to home'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile / Complete Modal ─────────────────────────────────────────── */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in relative">
            <button 
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: 'var(--brand-light)' }}
            >
              <CheckCircle size={20} style={{ color: 'var(--brand-navy)' }} />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--brand-navy)' }}>
              {t('profile.title')}
            </h3>
            <p className="text-sm text-gray-500 mb-5">{t('profile.sub')}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('profile.name')} *</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('profile.org')} *</label>
                <input
                  type="text"
                  value={profile.organization}
                  onChange={e => setProfile(p => ({ ...p, organization: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('profile.country')} *</label>
                <input
                  type="text"
                  value={profile.country}
                  onChange={e => setProfile(p => ({ ...p, country: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('profile.type')} *</label>
                <select
                  value={profile.entityType}
                  onChange={e => setProfile(p => ({ ...p, entityType: e.target.value as 'regulator' | 'designated_operator' }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="regulator">{t('profile.type.regulator')}</option>
                  <option value="designated_operator">{t('profile.type.operator')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">{t('profile.email')}</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  placeholder="you@organization.org"
                />
                <p className="text-xs text-gray-400 mt-1">{t('profile.email.hint')}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t('profile.back')}
              </button>
              <button
                onClick={handleComplete}
                disabled={!profile.name || !profile.organization || !profile.country || completing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:opacity-90"
                style={{ background: 'var(--brand-navy)' }}
              >
                {completing ? <Loader2 size={14} className="animate-spin" /> : null}
                {completing ? t('profile.processing') : t('profile.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  )
}
