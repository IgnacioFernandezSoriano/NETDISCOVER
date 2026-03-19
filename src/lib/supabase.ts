import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Types ────────────────────────────────────────────────────────────────────

export interface Phase {
  id: number
  slug: string
  order_index: number
  title_es: string
  title_en: string
  title_fr: string | null
  description_es: string | null
  description_en: string | null
  icon: string | null
  color: string | null
  scoring_excluded: boolean
}

export interface OptionItem {
  value: number | string
  label_es: string
  label_en?: string
  label_fr?: string
  label_ar?: string
  label_ru?: string
  desc_es?: string
  desc_en?: string
}

export interface Question {
  id: number
  phase_id: number
  order_index: number
  slug: string
  text_es: string
  text_en: string
  text_fr: string | null
  help_es: string | null
  help_en: string | null
  context_es: string | null
  question_type: 'scale' | 'yes_no' | 'multiple_choice' | 'single_choice' | 'barrier' | 'hidden'
  weight: number
  options: BarrierOption[] | null
  options_json: OptionItem[] | null
}

export interface BarrierOption {
  value: string
  labelEn: string
  labelEs: string
  labelFr?: string
}

export interface GuestSession {
  id: number
  token: string
  email: string | null
  name: string | null
  organization: string | null
  country: string | null
  entity_type: 'regulator' | 'designated_operator' | null
  status: 'in_progress' | 'completed'
  current_phase_index: number
  answers: Record<string, number | string[]> | null
  scores: ScoreResult | null
  gaps: Gap[] | null
  action_plan: ActionItem[] | null
  llm_analysis: LLMAnalysis | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface ScoreResult {
  global: number
  byPhase: Record<string, number>
}

export interface Gap {
  phaseSlug: string
  score: number
  gap: number
}

export interface ActionItem {
  id: string
  titleEn: string
  titleEs: string
  phaseSlug: string
  priority: 'high' | 'medium' | 'low'
  horizon: 'short' | 'medium' | 'long'
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  descriptionEn?: string
  descriptionEs?: string
  section?: 'next_level' | 'quality_total'
}

export interface LLMAnalysis {
  executiveSummary: string
  maturityLevel: string
  currentPhase: string
  phaseAnalyses: PhaseAnalysis[]
  actionPlan: LLMActionItem[]
  roadmapNarrative: string
  keyInsights: string[]
  commercialPlan?: CommercialPlan
}

export interface PhaseAnalysis {
  slug: string
  name: string
  score: number
  level: string
  narrative: string
  keyObstacles: string[]
  priorityActions: string[]
}

export interface LLMActionItem {
  action: string
  phase: string
  description: string
  horizon: 'short' | 'medium' | 'long'
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
  expectedOutcome: string
}

export interface CommercialPlan {
  painPoints: string[]
  valueProposition: string
  proposedSolution: string
  expectedROI: string
  nextSteps: string[]
}

export interface MarketProvider {
  id: number
  name_es: string
  name_en: string
  description_es: string | null
  description_en: string | null
  category: 'technology' | 'consulting' | 'training' | 'measurement' | 'rfid' | 'platform' | 'other'
  relevant_phases: string[] | null
  website: string | null
  contact_email: string | null
  logo_url: string | null
  case_studies: CaseStudy[] | null
  featured: boolean
  active: boolean
}

export interface CaseStudy {
  titleEn: string
  descriptionEn: string
  titleEs?: string
  descriptionEs?: string
}

export interface BenchmarkSnapshot {
  id: number
  region: string
  entity_type: string
  data: BenchmarkData
  snapshot_date: string
}

export interface BenchmarkData {
  globalAvg: number
  globalMedian: number
  globalP25: number
  globalP75: number
  sampleSize: number
  phaseAverages: Record<string, number>
  phaseStats: Record<string, { avg: number; median: number; p25: number; p75: number }>
}
