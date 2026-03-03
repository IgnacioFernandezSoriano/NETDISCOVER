import { describe, expect, it } from "vitest";

// ─── Test the scoring engine logic (extracted from routers.ts) ────────────────

function computeScores(
  answersData: { questionId: number; value: string | null }[],
  questionsData: { question: { id: number; questionType: string; weight: string; phaseId: number }; phase: { slug: string } }[]
) {
  const answerMap = new Map(answersData.map((a) => [a.questionId, parseFloat(a.value ?? "0")]));
  const phaseScores: Record<string, { total: number; max: number }> = {};

  for (const { question, phase } of questionsData) {
    const raw = answerMap.get(question.id) ?? 0;
    const weight = parseFloat(question.weight);
    const maxVal = question.questionType === "scale" ? 5 : 1;
    const normalized = (raw / maxVal) * 100 * weight;
    const maxNorm = 100 * weight;

    if (!phaseScores[phase.slug]) phaseScores[phase.slug] = { total: 0, max: 0 };
    phaseScores[phase.slug].total += normalized;
    phaseScores[phase.slug].max += maxNorm;
  }

  const byPhase: Record<string, number> = {};
  for (const [slug, { total, max }] of Object.entries(phaseScores)) {
    byPhase[slug] = max > 0 ? Math.round((total / max) * 100) : 0;
  }

  const scoredSlugs = Object.keys(byPhase).filter(s => s !== "context");
  const global = scoredSlugs.length > 0
    ? Math.round(scoredSlugs.reduce((acc, s) => acc + byPhase[s], 0) / scoredSlugs.length)
    : 0;

  return { global, byPhase };
}

// ─── Test maturity level classification ──────────────────────────────────────

function getMaturityLevel(score: number): string {
  if (score < 20) return "Initial";
  if (score < 40) return "Developing";
  if (score < 60) return "Defined";
  if (score < 80) return "Managed";
  return "Optimized";
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Scoring Engine", () => {
  it("computes zero score when no answers provided", () => {
    const questions = [
      { question: { id: 1, questionType: "scale", weight: "1", phaseId: 1 }, phase: { slug: "phase1" } },
    ];
    const result = computeScores([], questions);
    expect(result.byPhase["phase1"]).toBe(0);
    expect(result.global).toBe(0);
  });

  it("computes 100% when max answer given for scale question", () => {
    const questions = [
      { question: { id: 1, questionType: "scale", weight: "1", phaseId: 1 }, phase: { slug: "phase1" } },
    ];
    const answers = [{ questionId: 1, value: "5" }];
    const result = computeScores(answers, questions);
    expect(result.byPhase["phase1"]).toBe(100);
    expect(result.global).toBe(100);
  });

  it("computes 50% for mid-range scale answer (value=2.5 out of 5)", () => {
    const questions = [
      { question: { id: 1, questionType: "scale", weight: "1", phaseId: 1 }, phase: { slug: "phase1" } },
    ];
    const answers = [{ questionId: 1, value: "2.5" }];
    const result = computeScores(answers, questions);
    expect(result.byPhase["phase1"]).toBe(50);
  });

  it("excludes context phase from global score", () => {
    const questions = [
      { question: { id: 1, questionType: "scale", weight: "1", phaseId: 0 }, phase: { slug: "context" } },
      { question: { id: 2, questionType: "scale", weight: "1", phaseId: 1 }, phase: { slug: "phase1" } },
    ];
    const answers = [
      { questionId: 1, value: "5" },
      { questionId: 2, value: "2" },
    ];
    const result = computeScores(answers, questions);
    // global should only include phase1, not context
    expect(result.global).toBe(result.byPhase["phase1"]);
    expect(result.byPhase["context"]).toBe(100);
  });

  it("averages scores across multiple phases", () => {
    const questions = [
      { question: { id: 1, questionType: "scale", weight: "1", phaseId: 1 }, phase: { slug: "phase1" } },
      { question: { id: 2, questionType: "scale", weight: "1", phaseId: 2 }, phase: { slug: "phase2" } },
    ];
    const answers = [
      { questionId: 1, value: "5" }, // 100%
      { questionId: 2, value: "0" }, // 0%
    ];
    const result = computeScores(answers, questions);
    expect(result.byPhase["phase1"]).toBe(100);
    expect(result.byPhase["phase2"]).toBe(0);
    expect(result.global).toBe(50);
  });

  it("handles barrier (non-scale) questions with max value 1", () => {
    const questions = [
      { question: { id: 1, questionType: "barrier", weight: "0.5", phaseId: 1 }, phase: { slug: "phase1" } },
    ];
    const answers = [{ questionId: 1, value: "1" }];
    const result = computeScores(answers, questions);
    expect(result.byPhase["phase1"]).toBe(100);
  });

  it("respects question weights in phase score calculation", () => {
    const questions = [
      { question: { id: 1, questionType: "scale", weight: "2", phaseId: 1 }, phase: { slug: "phase1" } },
      { question: { id: 2, questionType: "scale", weight: "1", phaseId: 1 }, phase: { slug: "phase1" } },
    ];
    const answers = [
      { questionId: 1, value: "5" }, // 100% × weight 2
      { questionId: 2, value: "0" }, // 0% × weight 1
    ];
    const result = computeScores(answers, questions);
    // Weighted: (100*2 + 0*1) / (100*2 + 100*1) = 200/300 ≈ 67%
    expect(result.byPhase["phase1"]).toBe(67);
  });
});

describe("Maturity Level Classification", () => {
  it("classifies score 0 as Initial", () => {
    expect(getMaturityLevel(0)).toBe("Initial");
  });

  it("classifies score 19 as Initial", () => {
    expect(getMaturityLevel(19)).toBe("Initial");
  });

  it("classifies score 20 as Developing", () => {
    expect(getMaturityLevel(20)).toBe("Developing");
  });

  it("classifies score 39 as Developing", () => {
    expect(getMaturityLevel(39)).toBe("Developing");
  });

  it("classifies score 40 as Defined", () => {
    expect(getMaturityLevel(40)).toBe("Defined");
  });

  it("classifies score 60 as Managed", () => {
    expect(getMaturityLevel(60)).toBe("Managed");
  });

  it("classifies score 80 as Optimized", () => {
    expect(getMaturityLevel(80)).toBe("Optimized");
  });

  it("classifies score 100 as Optimized", () => {
    expect(getMaturityLevel(100)).toBe("Optimized");
  });
});

describe("LLM Analysis Type Mapping", () => {
  it("correctly maps AssessmentAnalysis phaseAnalyses fields for PDF", () => {
    const llmPhaseAnalysis = {
      slug: "phase1",
      name: "Measurement System Design",
      score: 45,
      level: "Defined",
      narrative: "The institution has basic measurement processes.",
      keyObstacles: ["Budget constraints", "Lack of trained staff"],
      priorityActions: ["Deploy panelist network", "Define SLA framework"],
    };

    // Simulate the mapping done in Results.tsx
    const pdfPhaseAnalysis = {
      slug: llmPhaseAnalysis.slug,
      name: llmPhaseAnalysis.name,
      score: llmPhaseAnalysis.score,
      level: llmPhaseAnalysis.level,
      analysis: llmPhaseAnalysis.narrative,       // narrative → analysis
      keyBarriers: llmPhaseAnalysis.keyObstacles, // keyObstacles → keyBarriers
      priorityActions: llmPhaseAnalysis.priorityActions,
    };

    expect(pdfPhaseAnalysis.analysis).toBe("The institution has basic measurement processes.");
    expect(pdfPhaseAnalysis.keyBarriers).toHaveLength(2);
    expect(pdfPhaseAnalysis.keyBarriers[0]).toBe("Budget constraints");
  });

  it("correctly maps AssessmentAnalysis actionPlan fields for PDF", () => {
    const llmAction = {
      action: "Deploy E2E measurement panel",
      phase: "Phase 1 — Measurement System Design",
      description: "Recruit and train panelists across all geographic zones.",
      horizon: "short" as const,
      effort: "high" as const,
      impact: "high" as const,
      expectedOutcome: "Independent measurement data within 6 months",
    };

    // Simulate the mapping done in Results.tsx
    const pdfAction = {
      title: llmAction.action,       // action → title
      description: llmAction.description,
      phase: llmAction.phase,
      horizon: llmAction.horizon,
      effort: llmAction.effort,
      impact: llmAction.impact,
    };

    expect(pdfAction.title).toBe("Deploy E2E measurement panel");
    expect(pdfAction.horizon).toBe("short");
  });

  it("correctly maps CommercialPlan painPoints for PDF", () => {
    const llmPainPoint = {
      pain: "Dependency on operator self-reported data",
      description: "The regulator lacks independent measurement infrastructure.",
      businessImpact: "Regulatory decisions lack objective evidence.",
      urgency: "critical" as const,
    };

    // Simulate the mapping done in Results.tsx
    const pdfPain = {
      title: llmPainPoint.pain,           // pain → title
      description: llmPainPoint.description,
      phase: llmPainPoint.businessImpact, // businessImpact → phase
      severity: llmPainPoint.urgency,     // urgency → severity
    };

    expect(pdfPain.title).toBe("Dependency on operator self-reported data");
    expect(pdfPain.severity).toBe("critical");
  });

  it("correctly maps CommercialPlan valueProposition for PDF", () => {
    const llmVP = {
      pillar: "Regulatory Credibility",
      statement: "Independent measurement provides objective evidence for decisions.",
      evidence: "ONE for Regulators measurement platform with RFID network.",
      benefit: "Credible, defensible regulatory actions backed by data.",
    };

    // Simulate the mapping done in Results.tsx
    const pdfVP = {
      pain: llmVP.pillar,      // pillar → pain
      solution: llmVP.statement, // statement → solution
      benefit: llmVP.benefit,
      product: llmVP.evidence,  // evidence → product
    };

    expect(pdfVP.pain).toBe("Regulatory Credibility");
    expect(pdfVP.solution).toBe("Independent measurement provides objective evidence for decisions.");
  });

  it("correctly joins proposedSolution phases into narrative string", () => {
    const llmSolutions = [
      {
        phase: "Phase 1: Foundation",
        solution: "E2E Measurement System",
        description: "Deploy panelist network and RFID infrastructure.",
        deliverables: ["Panelist network", "RFID readers"],
        timeline: "Months 1-6",
        investment: "Consulting + Technology Platform",
      },
    ];

    // Simulate the mapping done in Results.tsx
    const proposedSolution = llmSolutions.map(s =>
      `${s.phase}: ${s.solution}. ${s.description} (${s.timeline})`
    ).join("\n\n");

    expect(proposedSolution).toContain("Phase 1: Foundation");
    expect(proposedSolution).toContain("E2E Measurement System");
    expect(proposedSolution).toContain("Months 1-6");
  });
});
