import { invokeLLM } from "./_core/llm";

// ─── Postal Roadmap Context ───────────────────────────────────────────────────
// Full context from "Hoja de Ruta del Regulador Postal" document

const ROADMAP_CONTEXT = `
You are an expert postal regulation analyst working within the UPU ONE for Regulators framework.
You are analyzing the maturity assessment results of a postal regulator or designated operator.

THE POSTAL QUALITY MEASUREMENT MATURITY ROADMAP (UPU Framework):

PHASE 1 — Measurement System Design
Context: Without independent measurement, the regulator depends on data reported by the operator itself, creating a conflict of interest. E2E measurement replicates the real user experience.
Solution: Design and implement a measurement panel with geographically distributed people who generate test mailings systematically, aligned with UPU S58/S59 and EN 13850 standards.
Key requirements: E2E methodology definition, statistical sampling study, panelist recruitment, mobile app for panelists, RFID/barcode materials, compensation system, audit plan.
Technology platform: Centralized platform integrating panelist data and RFID network, with automatic KPI calculation, interactive dashboards, configurable SLAs, and automatic alerts.

PHASE 2 — Initial Diagnosis and Ecosystem Mapping
Context: You cannot regulate what you don't know. Before measuring quality, the regulator needs a complete inventory of actors, infrastructure, and postal flows.
Solution: Complete survey: operator and carrier identification, network documentation, mail volumes by service and zone, existing complaint analysis.
Topology: Structure the territory into measurement zones combining administrative, operational and demographic criteria. Define an origin-destination pair matrix.
Key requirements: Standardized data collection forms, operator/carrier inventory, postal network map, mail volume database, field visits.

PHASE 3 — SLA Establishment and Baseline
Context: Setting SLAs without real data is arbitrary. A measurement period without predefined objectives is needed to know reality before setting targets.
Solution: Operate the measurement system for 3-6 months in observation mode. Collect E2E times, segment times, variability and loss rates covering seasonal variations.
SLA definition: For each service type and geographic flow: transit time objective (J+1, J+2, J+3), compliance percentage, alert and non-compliance thresholds. Formalize in binding instruments.
Carrier SLAs: Using network diagnostic data, establish SLAs per segment for each carrier to enable precise responsibility attribution.

PHASE 4 — Postal Network Diagnosis
Context: E2E measurement answers "how long does it take?" but not "where is time lost?" Without granular diagnosis, any improvement plan will be blind.
Solution: Design and implement RFID diagnostic network identifying all critical nodes. Deploy RFID readers at sorting centers and exchange points.
Segment analysis: Configure automatic calculation of times per segment: collection, processing at each center, transport between nodes, final distribution.
Continuous monitoring: Permanent monitoring system supervising performance of each node and segment, with automatic degradation alerts.
Key requirements: Complete node inventory, flow map, RFID equipment, connectivity architecture, deployment plan, maintenance plan.

PHASE 5 — Continuous Measurement and Control
Context: Baseline measurement was a snapshot. Now a continuous film is needed. Only with permanent measurement can SLA compliance be verified and early degradations detected.
Solution: Put the complete system into continuous operation: panelists, RFID network and platform. Establish data quality control procedures, incident management and preventive maintenance.
Reporting: Structured periodic reports: operational (monthly), management (quarterly), regulatory (annual). Define access levels by user role.
Alert system: Automatic alerts for SLA non-compliance, node degradation or excessive loss rate. Each alert activates a response protocol.

PHASE 6 — Improvement Plans and Consulting
Context: Knowing the service is poor is not enough. Root cause analysis connects measurement data with real operational causes: staff shortages, insufficient transport frequency, obsolete equipment.
Solution: A specialized consultant works with system data and conducts field visits to identify specific causes. Problems are prioritized by impact and feasibility.
Improvement plans: For each problem: specific actions, clear responsibilities, realistic deadlines and success indicators. Plans are linked to the regulatory regime.
Implementation: Execute with intermediate milestones. Compare indicators before and after. Periodic reviews. If no improvement, adjust or escalate.

PHASE 7 — Maturity and Continuous Improvement
Context: A mature regulator doesn't just look inward. International comparison identifies gaps and imports best practices.
SLA review: Annual or biennial review cycle: analyze accumulated data, consult stakeholders, adjust objectives upward or introduce new indicators.
Scope expansion: Progressively expand: new services, new indicators (satisfaction, complaints, tracking), new operators, e-commerce and last-mile services.
International benchmarking: Participate in international programs (UPU GMS, regional programs), share data and use standardized methodology.

MATURITY LEVELS:
- Initial (0-19%): No systematic approach. The regulator depends entirely on operator-reported data.
- Developing (20-39%): Basic processes exist but are inconsistent and undocumented.
- Defined (40-59%): Standardized processes are defined and partially implemented.
- Managed (60-79%): Processes are measured, controlled and continuously monitored.
- Optimized (80-100%): Continuous improvement is embedded in organizational culture.

IMPORTANT ANALYSIS PRINCIPLES:
1. Base your analysis ONLY on the scores and answers provided. Do not invent data.
2. Be specific and actionable. Generic recommendations have no value.
3. Prioritize by impact: focus on phases with the largest gaps first.
4. Reference specific requirements from the roadmap when recommending actions.
5. Use a professional, institutional tone appropriate for postal regulators.
6. Do NOT mention that this analysis was generated by AI or any automated system.
`;

export interface AssessmentAnalysisInput {
  institution: string;
  entityType: "regulator" | "designated_operator";
  country?: string;
  respondentName?: string;
  globalScore: number;
  phaseScores: Record<string, number>; // slug -> score
  phaseNames: Record<string, string>;  // slug -> English name
  topGaps: { phaseSlug: string; score: number; gap: number }[];
  barrierAnswers?: Record<string, string[]>; // phase slug -> selected barriers
  answersWithContext?: { phaseSlug: string; phaseName: string; questionText: string; value: number; questionType: string }[];
}

export interface AssessmentAnalysis {
  executiveSummary: string;
  maturityLevel: string;
  currentPhase: string;
  phaseAnalyses: {
    slug: string;
    name: string;
    score: number;
    level: string;
    narrative: string;
    keyObstacles: string[];
    priorityActions: string[];
  }[];
  actionPlan: {
    action: string;
    phase: string;
    description: string;
    horizon: "short" | "medium" | "long";
    effort: "low" | "medium" | "high";
    impact: "low" | "medium" | "high";
    expectedOutcome: string;
  }[];
  roadmapNarrative: string;
  keyInsights: string[];
}

export async function generateAssessmentAnalysis(
  input: AssessmentAnalysisInput
): Promise<AssessmentAnalysis> {
  const phaseScoresList = Object.entries(input.phaseScores)
    .map(([slug, score]) => `  - ${input.phaseNames[slug] ?? slug}: ${score}%`)
    .join("\n");

  const topGapsList = input.topGaps
    .map((g, i) => `  ${i + 1}. ${input.phaseNames[g.phaseSlug] ?? g.phaseSlug}: ${g.score}% (gap: ${g.gap}%)`)
    .join("\n");

  const prompt = `${ROADMAP_CONTEXT}

---

ASSESSMENT DATA TO ANALYZE:

Institution: ${input.institution}
Entity Type: ${input.entityType === "regulator" ? "Postal Regulator" : "Designated Operator"}
Country: ${input.country ?? "Not specified"}
Global Maturity Score: ${input.globalScore}%

Phase Scores:
${phaseScoresList}

Top 3 Critical Gaps:
${topGapsList}

---

Generate a comprehensive, deep analysis of this institution's postal quality measurement maturity.
The analysis must be based EXCLUSIVELY on the data provided above and the UPU roadmap framework.

Return a JSON object with this exact structure:
{
  "executiveSummary": "3-4 paragraph executive summary. Paragraph 1: overall maturity assessment and what it means for this institution. Paragraph 2: key strengths (phases with highest scores). Paragraph 3: critical gaps and their operational implications. Paragraph 4: strategic positioning and urgency of action.",
  "maturityLevel": "one of: Initial | Developing | Defined | Managed | Optimized",
  "currentPhase": "Name of the roadmap phase where this institution currently operates (e.g., 'Phase 2 — Initial Diagnosis and Ecosystem Mapping')",
  "phaseAnalyses": [
    {
      "slug": "phase1",
      "name": "Phase 1 name",
      "score": 45,
      "level": "Defined",
      "narrative": "2-3 sentences analyzing what the score means for this specific phase, referencing the roadmap context. Be specific about what capabilities exist and what is missing.",
      "keyObstacles": ["obstacle 1", "obstacle 2"],
      "priorityActions": ["specific action 1 from roadmap requirements", "specific action 2"]
    }
  ],
  "actionPlan": [
    {
      "action": "Concise action title",
      "phase": "Phase X — Name",
      "description": "2-3 sentences explaining what to do, how to do it, and why it matters based on the roadmap.",
      "horizon": "short",
      "effort": "high",
      "impact": "high",
      "expectedOutcome": "Specific measurable outcome from the roadmap 'Qué obtenemos' section"
    }
  ],
  "roadmapNarrative": "3-4 paragraphs describing the specific journey this institution must take from its current state to full maturity. Reference specific phases, milestones and timeline. Be concrete about what Phase X completion looks like for this institution.",
  "keyInsights": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"]
}

REQUIREMENTS:
- phaseAnalyses must include ALL 7 phases (phase1 through phase7)
- actionPlan must have 7-10 actions, ordered by priority (most urgent first)
- Short horizon = 0-6 months, Medium = 6-18 months, Long = 18+ months
- Focus actionPlan on the phases with the lowest scores
- keyInsights must be 5 specific, non-obvious insights about this institution's situation
- All text must be in English
- Do NOT use generic phrases like "it is important to..." — be direct and specific
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system" as const,
        content: "You are an expert postal regulation analyst. You always return valid JSON matching the requested schema exactly. Never add markdown code blocks or extra text outside the JSON.",
      },
      { role: "user" as const, content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "assessment_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            executiveSummary: { type: "string" },
            maturityLevel: { type: "string" },
            currentPhase: { type: "string" },
            phaseAnalyses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  slug: { type: "string" },
                  name: { type: "string" },
                  score: { type: "number" },
                  level: { type: "string" },
                  narrative: { type: "string" },
                  keyObstacles: { type: "array", items: { type: "string" } },
                  priorityActions: { type: "array", items: { type: "string" } },
                },
                required: ["slug", "name", "score", "level", "narrative", "keyObstacles", "priorityActions"],
                additionalProperties: false,
              },
            },
            actionPlan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  phase: { type: "string" },
                  description: { type: "string" },
                  horizon: { type: "string", enum: ["short", "medium", "long"] },
                  effort: { type: "string", enum: ["low", "medium", "high"] },
                  impact: { type: "string", enum: ["low", "medium", "high"] },
                  expectedOutcome: { type: "string" },
                },
                required: ["action", "phase", "description", "horizon", "effort", "impact", "expectedOutcome"],
                additionalProperties: false,
              },
            },
            roadmapNarrative: { type: "string" },
            keyInsights: { type: "array", items: { type: "string" } },
          },
          required: ["executiveSummary", "maturityLevel", "currentPhase", "phaseAnalyses", "actionPlan", "roadmapNarrative", "keyInsights"],
          additionalProperties: false,
        },
      },
    },
  });

   const rawContent = response.choices[0]?.message?.content;
  const content = typeof rawContent === "string" ? rawContent : null;
  if (!content) throw new Error("No response from LLM");
  return JSON.parse(content) as AssessmentAnalysis;
}

// ─── Commercial Action Plan ───────────────────────────────────────────────────

const COMMERCIAL_CONTEXT = `
You are a senior business development consultant specializing in postal regulation technology.
You are preparing a commercial action plan for a postal regulator or designated operator based on their maturity assessment results.

The ONE for Regulators program (UPU) provides:
- Independent postal quality measurement systems (panelist networks, RFID networks)
- Technology platforms for data collection, KPI calculation and dashboards
- Consulting services for methodology design, SLA definition and improvement plans
- Training and capacity building for regulatory teams
- International benchmarking programs
- Legal and regulatory framework advisory

PAIN POINTS BY MATURITY LEVEL:
Initial (0-19%):
- Complete dependency on operator self-reported data (conflict of interest)
- No objective evidence to justify regulatory decisions
- Inability to detect service degradation in real time
- Regulatory credibility at risk with users and government
- No legal basis for sanctions or improvement requirements

Developing (20-39%):
- Measurement exists but is inconsistent and not comparable
- Data quality issues prevent reliable trend analysis
- SLAs defined without real baseline data
- Difficulty attributing responsibility to specific operators/segments
- Manual processes create bottlenecks and errors

Defined (40-59%):
- Measurement system exists but lacks automation
- Reporting is periodic but not real-time
- RFID network incomplete — blind spots in the postal network
- Improvement plans exist but lack formal tracking
- International benchmarking not yet implemented

Managed (60-79%):
- System is operational but needs optimization
- Expanding to new services (e-commerce, last mile) is complex
- International comparison shows gaps vs best practices
- Stakeholder reporting could be more transparent and automated

Optimized (80-100%):
- Maintaining leadership position requires continuous innovation
- Expanding to new regulatory domains
- Sharing best practices with peer regulators

VALUE PROPOSITION FRAMEWORK:
1. Regulatory Credibility: Independent measurement = objective evidence = credible decisions
2. Operational Efficiency: Automation reduces manual work and human error
3. Risk Mitigation: Early detection prevents service crises
4. Stakeholder Trust: Transparent data builds confidence with users, government and operators
5. International Positioning: Benchmarking demonstrates commitment to global standards
6. Legal Certainty: Documented evidence supports regulatory actions and sanctions
`;

export interface CommercialPlan {
  headline: string;
  subheadline: string;
  executiveSummary: string;
  painPoints: {
    pain: string;
    description: string;
    businessImpact: string;
    urgency: "critical" | "high" | "medium";
  }[];
  valueProposition: {
    pillar: string;
    statement: string;
    evidence: string;
    benefit: string;
  }[];
  proposedSolution: {
    phase: string;
    solution: string;
    description: string;
    deliverables: string[];
    timeline: string;
    investment: string;
  }[];
  roi: {
    metric: string;
    currentState: string;
    expectedState: string;
    timeframe: string;
  }[];
  nextSteps: string[];
  closingStatement: string;
}

export async function generateCommercialPlan(
  input: AssessmentAnalysisInput
): Promise<CommercialPlan> {
  const phaseScoresList = Object.entries(input.phaseScores)
    .map(([slug, score]) => `  - ${input.phaseNames[slug] ?? slug}: ${score}%`)
    .join("\n");

  const prompt = `${COMMERCIAL_CONTEXT}

---

INSTITUTION DATA:
Institution: ${input.institution}
Entity Type: ${input.entityType === "regulator" ? "Postal Regulator" : "Designated Operator"}
Country: ${input.country ?? "Not specified"}
Global Maturity Score: ${input.globalScore}%

Phase Scores:
${phaseScoresList}

Top Critical Gaps:
${input.topGaps.map((g, i) => `  ${i + 1}. ${input.phaseNames[g.phaseSlug] ?? g.phaseSlug}: ${g.score}% (gap: ${g.gap}%)`).join("\n")}

---

Generate a compelling commercial action plan for this institution.
The plan must be personalized to their specific maturity level and gaps.
It should be persuasive but professional — institutional tone, not sales pitch.

Return a JSON object with this exact structure:
{
  "headline": "A compelling 8-12 word headline that captures the core transformation opportunity for this institution",
  "subheadline": "A 20-25 word subheadline that contextualizes the opportunity based on their specific score and gaps",
  "executiveSummary": "3 paragraphs. Para 1: Current situation and its implications for this specific institution. Para 2: The opportunity — what becomes possible with the right measurement infrastructure. Para 3: The proposed path forward and expected transformation.",
  "painPoints": [
    {
      "pain": "Concise pain point title (5-8 words)",
      "description": "2 sentences describing this specific pain point for this institution based on their scores",
      "businessImpact": "1 sentence on the regulatory/operational/reputational impact of this pain",
      "urgency": "critical | high | medium"
    }
  ],
  "valueProposition": [
    {
      "pillar": "Value pillar name (e.g., Regulatory Credibility)",
      "statement": "The core value statement for this pillar (1 sentence)",
      "evidence": "How this applies specifically to this institution's situation",
      "benefit": "Concrete benefit they will experience"
    }
  ],
  "proposedSolution": [
    {
      "phase": "Phase name (e.g., Phase 1: Foundation)",
      "solution": "Solution name",
      "description": "2-3 sentences describing what this solution does and why it matters for this institution",
      "deliverables": ["deliverable 1", "deliverable 2", "deliverable 3"],
      "timeline": "e.g., Months 1-6",
      "investment": "e.g., Consulting + Technology Platform"
    }
  ],
  "roi": [
    {
      "metric": "Metric name",
      "currentState": "Current state description based on their scores",
      "expectedState": "Expected state after implementation",
      "timeframe": "e.g., 12 months"
    }
  ],
  "nextSteps": ["step 1", "step 2", "step 3", "step 4"],
  "closingStatement": "2-3 sentences closing statement that reinforces the urgency and opportunity without being pushy"
}

REQUIREMENTS:
- painPoints: 4-6 pains, ordered by urgency (most critical first), based on their actual lowest scores
- valueProposition: 4-5 pillars, each directly addressing one of their identified pains
- proposedSolution: 3-4 phases of implementation, aligned with their maturity gaps
- roi: 4-5 metrics showing measurable improvement
- nextSteps: 4 concrete, actionable next steps
- All content must be specific to this institution's scores — no generic content
- Tone: professional, institutional, empowering (not fear-based)
- Do NOT mention AI, automated systems, or data generation
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system" as const,
        content: "You are a senior postal regulation business consultant. Return valid JSON matching the schema exactly. No markdown, no extra text.",
      },
      { role: "user" as const, content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "commercial_plan",
        strict: true,
        schema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            subheadline: { type: "string" },
            executiveSummary: { type: "string" },
            painPoints: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pain: { type: "string" },
                  description: { type: "string" },
                  businessImpact: { type: "string" },
                  urgency: { type: "string", enum: ["critical", "high", "medium"] },
                },
                required: ["pain", "description", "businessImpact", "urgency"],
                additionalProperties: false,
              },
            },
            valueProposition: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pillar: { type: "string" },
                  statement: { type: "string" },
                  evidence: { type: "string" },
                  benefit: { type: "string" },
                },
                required: ["pillar", "statement", "evidence", "benefit"],
                additionalProperties: false,
              },
            },
            proposedSolution: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "string" },
                  solution: { type: "string" },
                  description: { type: "string" },
                  deliverables: { type: "array", items: { type: "string" } },
                  timeline: { type: "string" },
                  investment: { type: "string" },
                },
                required: ["phase", "solution", "description", "deliverables", "timeline", "investment"],
                additionalProperties: false,
              },
            },
            roi: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  currentState: { type: "string" },
                  expectedState: { type: "string" },
                  timeframe: { type: "string" },
                },
                required: ["metric", "currentState", "expectedState", "timeframe"],
                additionalProperties: false,
              },
            },
            nextSteps: { type: "array", items: { type: "string" } },
            closingStatement: { type: "string" },
          },
          required: ["headline", "subheadline", "executiveSummary", "painPoints", "valueProposition", "proposedSolution", "roi", "nextSteps", "closingStatement"],
          additionalProperties: false,
        },
      },
    },
  });

  const rawContent = response.choices[0]?.message?.content;
  const content = typeof rawContent === "string" ? rawContent : null;
  if (!content) throw new Error("No response from LLM for commercial plan");
  return JSON.parse(content) as CommercialPlan;
}
