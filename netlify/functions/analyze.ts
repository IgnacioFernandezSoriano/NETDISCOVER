import type { Handler } from '@netlify/functions'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const PHASE_NAMES: Record<string, string> = {
  phase0: 'Regulatory Context',
  phase1: 'Measurement System Design',
  phase2: 'Ecosystem Mapping',
  phase3: 'SLA Establishment',
  phase4: 'Network Diagnosis',
  phase5: 'Continuous Improvement',
  phase6: 'Regulation & Enforcement',
  phase7: 'Maturity & Benchmarking',
}

function getLevel(score: number): string {
  if (score < 20) return 'Initial'
  if (score < 40) return 'Developing'
  if (score < 60) return 'Defined'
  if (score < 80) return 'Managed'
  return 'Optimized'
}

function getNextLevel(score: number): string {
  if (score < 20) return 'Developing'
  if (score < 40) return 'Defined'
  if (score < 60) return 'Managed'
  if (score < 80) return 'Optimized'
  return 'Optimized'
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!GEMINI_API_KEY) {
    return {
      statusCode: 503,
      body: JSON.stringify({ error: 'Gemini API key not configured. Set GEMINI_API_KEY in Netlify environment variables.' })
    }
  }

  let body: {
    scores: { global: number; byPhase: Record<string, number> }
    gaps: Array<{ phaseSlug: string; score: number; gap: number }>
    institution: string
    entityType: string
    country?: string
    respondentName?: string
    lang?: string
  }

  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { scores, gaps, institution, entityType, country, respondentName, lang = 'en' } = body

  const currentLevel = getLevel(scores.global)
  const nextLevel = getNextLevel(scores.global)

  const phaseScoresSummary = Object.entries(scores.byPhase)
    .map(([slug, score]) => `- ${PHASE_NAMES[slug] ?? slug}: ${score}% (${getLevel(score)})`)
    .join('\n')

  const topGaps = gaps.slice(0, 3)
    .map(g => `${PHASE_NAMES[g.phaseSlug] ?? g.phaseSlug} (${g.score}%, gap: ${g.gap}%)`)
    .join(', ')

  const langInstruction = lang === 'es'
    ? 'Respond entirely in Spanish.'
    : lang === 'fr'
    ? 'Respond entirely in French.'
    : lang === 'ar'
    ? 'Respond entirely in Arabic.'
    : lang === 'ru'
    ? 'Respond entirely in Russian.'
    : 'Respond entirely in English.'

  const prompt = `You are an expert consultant in postal quality regulation and measurement for the Universal Postal Union (UPU) ONE for Regulators program. ${langInstruction}

Analyze the following postal quality maturity assessment results for ${institution} (${entityType === 'regulator' ? 'Postal Regulator' : 'Designated Operator'})${country ? ` in ${country}` : ''}${respondentName ? `, assessed by ${respondentName}` : ''}.

GLOBAL SCORE: ${scores.global}% — Current level: ${currentLevel} → Target next level: ${nextLevel}

PHASE SCORES:
${phaseScoresSummary}

TOP PRIORITY GAPS: ${topGaps}

Provide a comprehensive analysis in JSON format with this exact structure (no markdown, pure JSON):
{
  "executiveSummary": "3-4 paragraph executive summary of the maturity state, key findings and strategic recommendations",
  "maturityLevel": "${currentLevel}",
  "currentPhase": "Current development phase description",
  "keyInsights": ["insight 1", "insight 2", "insight 3", "insight 4"],
  "phaseAnalyses": [
    {
      "slug": "phase1",
      "name": "Measurement System Design",
      "score": ${scores.byPhase.phase1 ?? 0},
      "level": "${getLevel(scores.byPhase.phase1 ?? 0)}",
      "narrative": "2-3 sentence analysis of this phase",
      "keyObstacles": ["obstacle 1", "obstacle 2"],
      "priorityActions": ["action 1", "action 2"]
    }
  ],
  "roadmapNarrative": "3-4 paragraph narrative describing the recommended improvement roadmap. First section: actions to reach ${nextLevel}. Second section: long-term roadmap to reach Optimized level. Reference UPU standards (S58, S59) and measurement methodologies where relevant."
}

Focus on practical, actionable recommendations specific to postal regulation and quality measurement. Be specific about UPU standards, measurement methodologies, and regulatory frameworks. The roadmap must clearly distinguish between short-term actions to reach ${nextLevel} and the long-term path to Optimized.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
          systemInstruction: {
            parts: [{ text: 'You are a UPU postal quality maturity expert. Always respond with valid JSON only, no markdown code blocks, no backticks.' }]
          }
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      return { statusCode: 502, body: JSON.stringify({ error: `Gemini API error: ${err}` }) }
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'

    let analysis
    try {
      // Strip possible markdown code fences
      const cleaned = content.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
      analysis = JSON.parse(cleaned)
    } catch {
      const match = content.match(/\{[\s\S]*\}/)
      analysis = match ? JSON.parse(match[0]) : { executiveSummary: content, phaseAnalyses: [], actionPlan: [], keyInsights: [] }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
    }
  }
}
