import type { Question, Phase, ScoreResult, Gap, ActionItem } from './supabase'

/**
 * Compute global and per-phase scores from answers.
 * Scale questions: 1-4 → normalized to 0-100
 * Barrier questions: not scored (weight = 0)
 * Phase 0: scoring_excluded = true → not included in global
 */
export function computeScores(
  answers: Record<string, number>,
  questions: Question[],
  phases: Phase[]
): ScoreResult {
  const scoredPhases = phases.filter(p => !p.scoring_excluded)
  const byPhase: Record<string, number> = {}

  for (const phase of scoredPhases) {
    const phaseQuestions = questions.filter(
      q => q.phase_id === phase.id && q.question_type !== 'barrier' && q.weight > 0
    )
    if (phaseQuestions.length === 0) {
      byPhase[phase.slug] = 0
      continue
    }

    let weightedSum = 0
    let totalWeight = 0

    for (const q of phaseQuestions) {
      const val = answers[String(q.id)]
      if (val !== undefined && val !== null) {
        // Scale 1-4 → 0-100
        const normalized = ((val - 1) / 3) * 100
        weightedSum += normalized * q.weight
        totalWeight += q.weight
      }
    }

    byPhase[phase.slug] = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
  }

  // Global = average of all scored phases
  const phaseScores = Object.values(byPhase)
  const global = phaseScores.length > 0
    ? Math.round(phaseScores.reduce((a, b) => a + b, 0) / phaseScores.length)
    : 0

  return { global, byPhase }
}

export function computeGaps(scores: ScoreResult): Gap[] {
  return Object.entries(scores.byPhase)
    .map(([phaseSlug, score]) => ({ phaseSlug, score, gap: 100 - score }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3)
}

export function getMaturityLevel(score: number): string {
  if (score < 20) return 'Initial'
  if (score < 40) return 'Developing'
  if (score < 60) return 'Defined'
  if (score < 80) return 'Managed'
  return 'Optimized'
}

export function getMaturityColor(level: string): string {
  switch (level) {
    case 'Initial': return '#9CA3AF'
    case 'Developing': return '#F59E0B'
    case 'Defined': return '#3B82F6'
    case 'Managed': return '#10B981'
    case 'Optimized': return '#003087'
    default: return '#9CA3AF'
  }
}

export function generateActionPlan(
  scores: ScoreResult,
  phases: Phase[]
): ActionItem[] {
  const actions: ActionItem[] = []
  const scoredPhases = phases.filter(p => !p.scoring_excluded)

  // Sort phases by score ascending (worst first)
  const sortedPhases = [...scoredPhases].sort(
    (a, b) => (scores.byPhase[a.slug] ?? 100) - (scores.byPhase[b.slug] ?? 100)
  )

  const PHASE_ACTIONS: Record<string, { titleEn: string; titleEs: string; descriptionEn: string }[]> = {
    phase1: [
      {
        titleEn: 'Design and document measurement methodology',
        titleEs: 'Diseñar y documentar la metodología de medición',
        descriptionEn: 'Define E2E measurement methodology aligned with UPU S58/S59 standards, including panelist selection criteria, measurement protocols and data validation procedures.'
      },
      {
        titleEn: 'Build and activate panelist network',
        titleEs: 'Construir y activar la red de panelistas',
        descriptionEn: 'Recruit and train a representative panelist panel covering all geographic zones and demographic segments relevant to postal service usage.'
      }
    ],
    phase2: [
      {
        titleEn: 'Complete postal ecosystem inventory',
        titleEs: 'Completar el inventario del ecosistema postal',
        descriptionEn: 'Document all postal actors, network nodes, routes and operational capacities to establish a comprehensive baseline for quality measurement.'
      }
    ],
    phase3: [
      {
        titleEn: 'Establish measurement baseline and define SLAs',
        titleEs: 'Establecer línea base y definir SLAs',
        descriptionEn: 'Use 12 months of measurement data to establish a quality baseline and define specific, measurable SLAs for all main postal services.'
      },
      {
        titleEn: 'Formalize SLAs in regulatory framework',
        titleEs: 'Formalizar SLAs en el marco regulatorio',
        descriptionEn: 'Integrate defined SLAs into binding regulation with clear obligations, measurement methodology and enforcement mechanisms.'
      }
    ],
    phase4: [
      {
        titleEn: 'Deploy capture technology at critical nodes',
        titleEs: 'Desplegar tecnología de captura en nodos críticos',
        descriptionEn: 'Install RFID or barcode capture systems at identified critical network nodes to enable granular transit time measurement by segment.'
      }
    ],
    phase5: [
      {
        titleEn: 'Implement structured improvement plans',
        titleEs: 'Implementar planes de mejora estructurados',
        descriptionEn: 'Develop formalized improvement plans with specific actions, responsibilities, timelines and measurable success indicators based on measurement results.'
      }
    ],
    phase6: [
      {
        titleEn: 'Establish enforcement framework with sanctions',
        titleEs: 'Establecer marco de enforcement con sanciones',
        descriptionEn: 'Create a regulatory framework with proportional sanctions for SLA non-compliance, including clear processes and consistent application criteria.'
      }
    ],
    phase7: [
      {
        titleEn: 'Join international benchmarking programs',
        titleEs: 'Unirse a programas de benchmarking internacional',
        descriptionEn: 'Participate in UPU GMS or regional postal quality programs to benchmark performance against international standards and import best practices.'
      }
    ]
  }

  let actionId = 1
  for (const phase of sortedPhases) {
    const score = scores.byPhase[phase.slug] ?? 0
    const phaseActions = PHASE_ACTIONS[phase.slug] ?? []

    for (const action of phaseActions) {
      let priority: 'high' | 'medium' | 'low' = 'medium'
      let horizon: 'short' | 'medium' | 'long' = 'medium'

      if (score < 30) { priority = 'high'; horizon = 'short' }
      else if (score < 60) { priority = 'medium'; horizon = 'medium' }
      else { priority = 'low'; horizon = 'long' }

      actions.push({
        id: `action-${actionId++}`,
        titleEn: action.titleEn,
        titleEs: action.titleEs,
        phaseSlug: phase.slug,
        priority,
        horizon,
        effort: score < 30 ? 'high' : score < 60 ? 'medium' : 'low',
        impact: score < 30 ? 'high' : score < 60 ? 'medium' : 'low',
        descriptionEn: action.descriptionEn,
      })
    }
  }

  return actions.slice(0, 10)
}
