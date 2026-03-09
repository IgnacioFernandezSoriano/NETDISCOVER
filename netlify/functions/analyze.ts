import type { Handler } from '@netlify/functions'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const PHASE_NAMES: Record<string, string> = {
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

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  if (!OPENAI_API_KEY) {
    return {
      statusCode: 503,
      body: JSON.stringify({ error: 'OpenAI API key not configured. Set OPENAI_API_KEY in Netlify environment variables.' })
    }
  }

  let body: {
    scores: { global: number; byPhase: Record<string, number> }
    gaps: Array<{ phaseSlug: string; score: number; gap: number }>
    institution: string
    entityType: string
    country?: string
    respondentName?: string
  }

  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { scores, gaps, institution, entityType, country, respondentName } = body

  const phaseScoresSummary = Object.entries(scores.byPhase)
    .map(([slug, score]) => `- ${PHASE_NAMES[slug] ?? slug}: ${score}% (${getLevel(score)})`)
    .join('\n')

  const topGaps = gaps.slice(0, 3)
    .map(g => `${PHASE_NAMES[g.phaseSlug] ?? g.phaseSlug} (${g.score}%, gap: ${g.gap}%)`)
    .join(', ')

  const prompt = `You are an expert consultant in postal quality regulation and measurement for the Universal Postal Union (UPU) ONE for Regulators program.

Analyze the following postal quality maturity assessment results for ${institution} (${entityType === 'regulator' ? 'Postal Regulator' : 'Designated Operator'})${country ? ` in ${country}` : ''}${respondentName ? `, assessed by ${respondentName}` : ''}.

GLOBAL SCORE: ${scores.global}% (${getLevel(scores.global)})

PHASE SCORES:
${phaseScoresSummary}

TOP GAPS: ${topGaps}

Provide a comprehensive analysis in JSON format with this exact structure:
{
  "executiveSummary": "3-4 paragraph executive summary of the maturity state, key findings and strategic recommendations",
  "maturityLevel": "${getLevel(scores.global)}",
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
    // ... for each phase with score data
  ],
  "actionPlan": [
    {
      "action": "Action title",
      "phase": "phase slug",
      "description": "Detailed description",
      "horizon": "short|medium|long",
      "effort": "low|medium|high",
      "impact": "low|medium|high",
      "expectedOutcome": "Expected outcome"
    }
  ],
  "roadmapNarrative": "3-4 paragraph narrative describing the recommended improvement roadmap over 24-36 months"
}

Focus on practical, actionable recommendations specific to postal regulation and quality measurement. Be specific about UPU standards (S58, S59), measurement methodologies, and regulatory frameworks.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a UPU postal quality maturity expert. Always respond with valid JSON only, no markdown code blocks.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return { statusCode: 502, body: JSON.stringify({ error: `OpenAI error: ${err}` }) }
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content ?? '{}'

    let analysis
    try {
      analysis = JSON.parse(content)
    } catch {
      // Try to extract JSON from the response
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
