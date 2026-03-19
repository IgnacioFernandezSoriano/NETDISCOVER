import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { computeScores, computeGaps, generateActionPlan } from '../lib/scoring'
import type { Phase, Question, GuestSession, ScoreResult, Gap, ActionItem } from '../lib/supabase'
import { nanoid } from '../lib/nanoid'

export function useAssessment() {
  const [phases, setPhases] = useState<Phase[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Session state
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nd_token'))
  const [session, setSession] = useState<GuestSession | null>(null)
  const [answers, setAnswers] = useState<Record<string, number | string[]>>({})
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)

  // Load phases and questions
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [{ data: phasesData, error: pErr }, { data: questionsData, error: qErr }] = await Promise.all([
          supabase.from('phases').select('*').order('order_index'),
          supabase.from('questions').select('*').order('order_index'),
        ])
        if (pErr) throw pErr
        if (qErr) throw qErr
        setPhases(phasesData ?? [])
        setQuestions(questionsData ?? [])
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load assessment data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Load existing session if token exists
  useEffect(() => {
    if (!token) return
    async function loadSession() {
      const { data } = await supabase
        .from('guest_sessions')
        .select('*')
        .eq('token', token!)
        .single()
      if (data) {
        setSession(data)
        setAnswers(data.answers ?? {})
        setCurrentPhaseIndex(data.current_phase_index ?? 0)
      }
    }
    loadSession()
  }, [token])

  // Create or get session
  const ensureSession = useCallback(async (): Promise<string> => {
    if (token) return token
    const newToken = nanoid()
    const { error } = await supabase.from('guest_sessions').insert({
      token: newToken,
      status: 'in_progress',
      current_phase_index: 0,
      answers: {},
    })
    if (error) throw error
    localStorage.setItem('nd_token', newToken)
    setToken(newToken)
    return newToken
  }, [token])

  // Save answer (supports number for scale/barrier and string[] for multiple_choice)
  const saveAnswer = useCallback(async (questionId: number, value: number | string[]) => {
    const newAnswers = { ...answers, [String(questionId)]: value }
    setAnswers(newAnswers)

    const t = await ensureSession()
    await supabase
      .from('guest_sessions')
      .update({ answers: newAnswers, updated_at: new Date().toISOString() })
      .eq('token', t)
  }, [answers, ensureSession])

  // Navigate to phase
  const goToPhase = useCallback(async (index: number) => {
    setCurrentPhaseIndex(index)
    if (token) {
      await supabase
        .from('guest_sessions')
        .update({ current_phase_index: index })
        .eq('token', token)
    }
  }, [token])

  // Complete assessment
  const completeAssessment = useCallback(async (profile: {
    name: string
    organization: string
    country: string
    entityType: 'regulator' | 'designated_operator'
    email?: string
  }): Promise<{ scores: ScoreResult; gaps: Gap[]; actionPlan: ActionItem[] }> => {
    const t = await ensureSession()
    const scores = computeScores(answers, questions, phases)
    const gaps = computeGaps(scores)
    const actionPlan = generateActionPlan(scores, phases)

    await supabase
      .from('guest_sessions')
      .update({
        ...profile,
        entity_type: profile.entityType,
        status: 'completed',
        answers,
        scores,
        gaps,
        action_plan: actionPlan,
        completed_at: new Date().toISOString(),
      })
      .eq('token', t)

    return { scores, gaps, actionPlan }
  }, [answers, questions, phases, ensureSession])

  // Restore session from token
  const restoreFromToken = useCallback(async (t: string): Promise<boolean> => {
    const { data } = await supabase
      .from('guest_sessions')
      .select('*')
      .eq('token', t)
      .single()
    if (!data) return false
    localStorage.setItem('nd_token', t)
    setToken(t)
    setSession(data)
    setAnswers(data.answers ?? {})
    setCurrentPhaseIndex(data.current_phase_index ?? 0)
    return true
  }, [])

  const questionsForPhase = useCallback((phaseId: number) => {
    return questions.filter(q => q.phase_id === phaseId).sort((a, b) => a.order_index - b.order_index)
  }, [questions])

  const phaseCompletionRate = useCallback((phaseId: number): number => {
    const phaseQs = questionsForPhase(phaseId).filter(q => q.question_type !== 'barrier')
    if (phaseQs.length === 0) return 100
    const answered = phaseQs.filter(q => {
      const ans = answers[String(q.id)]
      if (ans === undefined) return false
      if (Array.isArray(ans)) return ans.length > 0
      return true
    }).length
    return Math.round((answered / phaseQs.length) * 100)
  }, [questionsForPhase, answers])

  return {
    phases,
    questions,
    loading,
    error,
    token,
    session,
    answers,
    currentPhaseIndex,
    saveAnswer,
    goToPhase,
    completeAssessment,
    restoreFromToken,
    questionsForPhase,
    phaseCompletionRate,
    ensureSession,
  }
}
