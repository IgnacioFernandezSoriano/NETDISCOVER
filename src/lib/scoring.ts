import type { Question, Phase, ScoreResult, Gap, ActionItem } from './supabase'

/**
 * Compute global and per-phase scores from answers.
 * Scale questions: 1-4 → normalized to 0-100
 * Barrier/hidden/multiple_choice questions: not scored
 */
export function computeScores(
  answers: Record<string, number | string[]>,
  questions: Question[],
  phases: Phase[]
): ScoreResult {
  const scoredPhases = phases.filter(p => !p.scoring_excluded)
  const byPhase: Record<string, number> = {}

  for (const phase of scoredPhases) {
    const phaseQuestions = questions.filter(
      q => q.phase_id === phase.id && q.question_type !== 'barrier'
        && q.question_type !== 'multiple_choice'
        && q.question_type !== 'hidden'
        && q.weight > 0
    )
    if (phaseQuestions.length === 0) {
      byPhase[phase.slug] = 0
      continue
    }

    let weightedSum = 0
    let totalWeight = 0

    for (const q of phaseQuestions) {
      const raw = answers[String(q.id)]
      if (raw === undefined || raw === null || Array.isArray(raw)) continue
      const val = raw as number
      if (val !== undefined && val !== null) {
        const normalized = ((val - 1) / 3) * 100
        weightedSum += normalized * q.weight
        totalWeight += q.weight
      }
    }

    byPhase[phase.slug] = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
  }

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

export function getNextMaturityLevel(score: number): string {
  if (score < 20) return 'Developing'
  if (score < 40) return 'Defined'
  if (score < 60) return 'Managed'
  if (score < 80) return 'Optimized'
  return 'Optimized'
}

export function getNextMaturityThreshold(score: number): number {
  if (score < 20) return 20
  if (score < 40) return 40
  if (score < 60) return 60
  if (score < 80) return 80
  return 100
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

// Per-phase descriptions for the phase score cards
export const PHASE_DESCRIPTIONS: Record<string, { en: string; es: string }> = {
  phase1: {
    en: 'Capacity to measure end-to-end delivery times using independent panels aligned with UPU S58/S59 standards.',
    es: 'Capacidad para medir tiempos de entrega extremo a extremo mediante paneles independientes alineados con los estándares UPU S58/S59.',
  },
  phase2: {
    en: 'Knowledge and mapping of all postal actors, network nodes and operational flows that affect service quality.',
    es: 'Conocimiento y mapeo de todos los actores postales, nodos de red y flujos operativos que afectan la calidad del servicio.',
  },
  phase3: {
    en: 'Existence and enforceability of Service Level Agreements (SLAs) that define minimum quality standards for postal services.',
    es: 'Existencia y exigibilidad de Acuerdos de Nivel de Servicio (SLAs) que definen estándares mínimos de calidad para los servicios postales.',
  },
  phase4: {
    en: 'Deployment of automated capture technology (RFID, barcodes) at critical network nodes to enable granular transit measurement.',
    es: 'Despliegue de tecnología de captura automatizada (RFID, códigos de barras) en nodos críticos de la red para habilitar la medición granular del tránsito.',
  },
  phase5: {
    en: 'Existence of structured improvement plans based on measurement results, with defined responsibilities and measurable targets.',
    es: 'Existencia de planes de mejora estructurados basados en los resultados de medición, con responsabilidades definidas y objetivos medibles.',
  },
  phase6: {
    en: 'Regulatory capacity to monitor SLA compliance, apply corrective measures and enforce consequences for non-compliance.',
    es: 'Capacidad regulatoria para monitorear el cumplimiento de SLAs, aplicar medidas correctivas y hacer cumplir las consecuencias por incumplimiento.',
  },
  phase7: {
    en: 'Integration with international benchmarking programs and continuous improvement culture based on global best practices.',
    es: 'Integración con programas de benchmarking internacional y cultura de mejora continua basada en las mejores prácticas globales.',
  },
}

// Actions per phase, structured by maturity level to reach
type LevelActions = {
  toNext: { titleEn: string; titleEs: string; whyEn: string; whyEs: string; requiresEn: string; requiresEs: string }[]
  toOptimized: { titleEn: string; titleEs: string; whyEn: string; whyEs: string; requiresEn: string; requiresEs: string }[]
}

const PHASE_LEVEL_ACTIONS: Record<string, LevelActions> = {
  phase1: {
    toNext: [
      {
        titleEn: 'Design and document measurement methodology',
        titleEs: 'Diseñar y documentar la metodología de medición',
        whyEn: 'Without a documented methodology, measurement results are not reproducible or comparable over time.',
        whyEs: 'Sin una metodología documentada, los resultados de medición no son reproducibles ni comparables en el tiempo.',
        requiresEn: 'Technical team, UPU S58/S59 standards documentation, validation process.',
        requiresEs: 'Equipo técnico, documentación de estándares UPU S58/S59, proceso de validación.',
      },
      {
        titleEn: 'Build and activate a panelist network',
        titleEs: 'Construir y activar la red de panelistas',
        whyEn: 'An independent panelist network is the foundation for credible, unbiased end-to-end measurement.',
        whyEs: 'Una red de panelistas independientes es la base para una medición extremo a extremo creíble e imparcial.',
        requiresEn: 'Budget for panelist recruitment and training, geographic coverage plan, data collection platform.',
        requiresEs: 'Presupuesto para reclutamiento y formación de panelistas, plan de cobertura geográfica, plataforma de recogida de datos.',
      },
    ],
    toOptimized: [
      {
        titleEn: 'Automate data collection and real-time reporting',
        titleEs: 'Automatizar la recogida de datos y el reporte en tiempo real',
        whyEn: 'Automation eliminates manual errors and enables continuous monitoring rather than periodic snapshots.',
        whyEs: 'La automatización elimina errores manuales y permite la monitorización continua en lugar de instantáneas periódicas.',
        requiresEn: 'Technology platform, API integrations with postal operator systems, trained data analysts.',
        requiresEs: 'Plataforma tecnológica, integraciones API con sistemas del operador postal, analistas de datos formados.',
      },
    ],
  },
  phase2: {
    toNext: [
      {
        titleEn: 'Complete postal ecosystem inventory',
        titleEs: 'Completar el inventario del ecosistema postal',
        whyEn: 'A complete inventory is the prerequisite for identifying measurement gaps and quality bottlenecks.',
        whyEs: 'Un inventario completo es el prerrequisito para identificar brechas de medición y cuellos de botella de calidad.',
        requiresEn: 'Collaboration with the designated operator, GIS tools, field survey team.',
        requiresEs: 'Colaboración con el operador designado, herramientas GIS, equipo de encuesta de campo.',
      },
    ],
    toOptimized: [
      {
        titleEn: 'Establish a dynamic ecosystem monitoring system',
        titleEs: 'Establecer un sistema de monitoreo dinámico del ecosistema',
        whyEn: 'Static inventories become outdated; a live monitoring system ensures the regulatory picture remains accurate.',
        whyEs: 'Los inventarios estáticos quedan desactualizados; un sistema de monitoreo en vivo garantiza que la imagen regulatoria sea precisa.',
        requiresEn: 'Data sharing agreements with operators, monitoring platform, regular update protocols.',
        requiresEs: 'Acuerdos de intercambio de datos con operadores, plataforma de monitoreo, protocolos de actualización periódica.',
      },
    ],
  },
  phase3: {
    toNext: [
      {
        titleEn: 'Establish measurement baseline and define SLAs',
        titleEs: 'Establecer línea base y definir SLAs',
        whyEn: 'SLAs without a measurement baseline are unenforceable; baseline data provides the evidence for realistic target-setting.',
        whyEs: 'Los SLAs sin línea base de medición son inaplicables; los datos de referencia proporcionan la evidencia para fijar objetivos realistas.',
        requiresEn: 'Minimum 12 months of measurement data, statistical analysis capacity, stakeholder consultation.',
        requiresEs: 'Mínimo 12 meses de datos de medición, capacidad de análisis estadístico, consulta con partes interesadas.',
      },
      {
        titleEn: 'Formalize SLAs in the regulatory framework',
        titleEs: 'Formalizar SLAs en el marco regulatorio',
        whyEn: 'Informal SLAs lack legal force; regulatory formalization creates binding obligations and enables enforcement.',
        whyEs: 'Los SLAs informales carecen de fuerza legal; la formalización regulatoria crea obligaciones vinculantes y permite la aplicación.',
        requiresEn: 'Legal drafting capacity, regulatory consultation process, publication in official gazette.',
        requiresEs: 'Capacidad de redacción legal, proceso de consulta regulatoria, publicación en gaceta oficial.',
      },
    ],
    toOptimized: [
      {
        titleEn: 'Implement dynamic SLA review cycles',
        titleEs: 'Implementar ciclos de revisión dinámica de SLAs',
        whyEn: 'Static SLAs become obsolete; regular review cycles ensure targets remain ambitious and aligned with market evolution.',
        whyEs: 'Los SLAs estáticos quedan obsoletos; los ciclos de revisión periódica garantizan que los objetivos sigan siendo ambiciosos y alineados con la evolución del mercado.',
        requiresEn: 'Annual review process, benchmarking data, stakeholder engagement mechanism.',
        requiresEs: 'Proceso de revisión anual, datos de benchmarking, mecanismo de participación de las partes interesadas.',
      },
    ],
  },
  phase4: {
    toNext: [
      {
        titleEn: 'Deploy capture technology at critical network nodes',
        titleEs: 'Desplegar tecnología de captura en nodos críticos de la red',
        whyEn: 'Automated capture at key nodes provides objective, granular data on transit times that manual methods cannot deliver.',
        whyEs: 'La captura automatizada en nodos clave proporciona datos objetivos y granulares sobre tiempos de tránsito que los métodos manuales no pueden ofrecer.',
        requiresEn: 'Capital investment in RFID/barcode infrastructure, technical installation team, data integration platform.',
        requiresEs: 'Inversión de capital en infraestructura RFID/código de barras, equipo de instalación técnica, plataforma de integración de datos.',
      },
    ],
    toOptimized: [
      {
        titleEn: 'Achieve full network coverage and real-time dashboards',
        titleEs: 'Alcanzar cobertura total de la red y dashboards en tiempo real',
        whyEn: 'Full coverage eliminates blind spots and enables proactive quality management rather than reactive incident response.',
        whyEs: 'La cobertura total elimina los puntos ciegos y permite una gestión proactiva de la calidad en lugar de una respuesta reactiva a incidentes.',
        requiresEn: 'Full network rollout plan, real-time analytics platform, trained operations team.',
        requiresEs: 'Plan de despliegue completo de la red, plataforma de análisis en tiempo real, equipo de operaciones formado.',
      },
    ],
  },
  phase5: {
    toNext: [
      {
        titleEn: 'Implement structured improvement plans',
        titleEs: 'Implementar planes de mejora estructurados',
        whyEn: 'Without structured plans, measurement data does not translate into operational improvements.',
        whyEs: 'Sin planes estructurados, los datos de medición no se traducen en mejoras operativas.',
        requiresEn: 'Cross-functional improvement team, defined KPIs, project management methodology.',
        requiresEs: 'Equipo de mejora multifuncional, KPIs definidos, metodología de gestión de proyectos.',
      },
    ],
    toOptimized: [
      {
        titleEn: 'Embed continuous improvement culture and feedback loops',
        titleEs: 'Incorporar cultura de mejora continua y ciclos de retroalimentación',
        whyEn: 'Sustained quality improvement requires institutionalized processes, not one-off projects.',
        whyEs: 'La mejora sostenida de la calidad requiere procesos institucionalizados, no proyectos puntuales.',
        requiresEn: 'Organizational change management, performance incentive alignment, regular review cadence.',
        requiresEs: 'Gestión del cambio organizacional, alineación de incentivos de rendimiento, cadencia de revisión periódica.',
      },
    ],
  },
  phase6: {
    toNext: [
      {
        titleEn: 'Establish an enforcement framework with proportional measures',
        titleEs: 'Establecer un marco de cumplimiento con medidas proporcionales',
        whyEn: 'SLAs without enforcement mechanisms are aspirational; a clear framework creates accountability and drives compliance.',
        whyEs: 'Los SLAs sin mecanismos de cumplimiento son aspiracionales; un marco claro crea responsabilidad e impulsa el cumplimiento.',
        requiresEn: 'Legal authority review, graduated response procedures, documented enforcement processes.',
        requiresEs: 'Revisión de autoridad legal, procedimientos de respuesta gradual, procesos de cumplimiento documentados.',
      },
    ],
    toOptimized: [
      {
        titleEn: 'Implement proactive compliance monitoring and public reporting',
        titleEs: 'Implementar monitoreo proactivo de cumplimiento e informes públicos',
        whyEn: 'Transparency through public reporting creates market pressure for compliance beyond regulatory enforcement alone.',
        whyEs: 'La transparencia a través de informes públicos crea presión de mercado para el cumplimiento más allá de la aplicación regulatoria.',
        requiresEn: 'Public reporting framework, compliance dashboard, stakeholder communication strategy.',
        requiresEs: 'Marco de informes públicos, panel de cumplimiento, estrategia de comunicación con las partes interesadas.',
      },
    ],
  },
  phase7: {
    toNext: [
      {
        titleEn: 'Join international benchmarking programs',
        titleEs: 'Unirse a programas de benchmarking internacional',
        whyEn: 'International benchmarking provides external reference points that drive ambition and validate local measurement quality.',
        whyEs: 'El benchmarking internacional proporciona puntos de referencia externos que impulsan la ambición y validan la calidad de la medición local.',
        requiresEn: 'UPU GMS membership, data sharing protocols, dedicated benchmarking analyst.',
        requiresEs: 'Membresía en UPU GMS, protocolos de intercambio de datos, analista de benchmarking dedicado.',
      },
    ],
    toOptimized: [
      {
        titleEn: 'Lead regional knowledge-sharing and become a center of excellence',
        titleEs: 'Liderar el intercambio de conocimiento regional y convertirse en centro de excelencia',
        whyEn: 'Leading organizations that share best practices accelerate regional quality improvement and strengthen their own regulatory authority.',
        whyEs: 'Las organizaciones líderes que comparten mejores prácticas aceleran la mejora de la calidad regional y refuerzan su propia autoridad regulatoria.',
        requiresEn: 'Regional network participation, knowledge management system, expert staff with capacity to mentor peers.',
        requiresEs: 'Participación en redes regionales, sistema de gestión del conocimiento, personal experto con capacidad para mentorizar a pares.',
      },
    ],
  },
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

  let actionId = 1

  // --- Section 1: Actions to reach next maturity level (top 5 worst phases) ---
  for (const phase of sortedPhases.slice(0, 5)) {
    const score = scores.byPhase[phase.slug] ?? 0
    const levelActions = PHASE_LEVEL_ACTIONS[phase.slug]
    if (!levelActions) continue

    for (const action of levelActions.toNext) {
      let priority: 'high' | 'medium' | 'low' = 'medium'
      let horizon: 'short' | 'medium' | 'long' = 'medium'
      if (score < 30) { priority = 'high'; horizon = 'short' }
      else if (score < 60) { priority = 'medium'; horizon = 'medium' }
      else { priority = 'low'; horizon = 'long' }

      actions.push({
        id: `next-${actionId++}`,
        titleEn: action.titleEn,
        titleEs: action.titleEs,
        phaseSlug: phase.slug,
        priority,
        horizon,
        effort: score < 30 ? 'high' : score < 60 ? 'medium' : 'low',
        impact: score < 30 ? 'high' : score < 60 ? 'medium' : 'low',
        descriptionEn: `WHY: ${action.whyEn} | REQUIRES: ${action.requiresEn}`,
        descriptionEs: `POR QUÉ: ${action.whyEs} | REQUIERE: ${action.requiresEs}`,
        section: 'next_level',
      })
    }
  }

  // --- Section 2: Roadmap to Optimized (quality total) ---
  for (const phase of sortedPhases) {
    const score = scores.byPhase[phase.slug] ?? 0
    if (score >= 80) continue // already at Managed/Optimized, skip
    const levelActions = PHASE_LEVEL_ACTIONS[phase.slug]
    if (!levelActions) continue

    for (const action of levelActions.toOptimized) {
      actions.push({
        id: `opt-${actionId++}`,
        titleEn: action.titleEn,
        titleEs: action.titleEs,
        phaseSlug: phase.slug,
        priority: 'low',
        horizon: 'long',
        effort: 'high',
        impact: 'high',
        descriptionEn: `WHY: ${action.whyEn} | REQUIRES: ${action.requiresEn}`,
        descriptionEs: `POR QUÉ: ${action.whyEs} | REQUIERE: ${action.requiresEs}`,
        section: 'quality_total',
      })
    }
  }

  return actions
}
