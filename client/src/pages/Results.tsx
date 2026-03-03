import { trpc } from "@/lib/trpc";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts";
import {
  CheckCircle2, ArrowRight, Mail, Building2, Globe,
  Download, FileText, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  generateTechnicalReportHTML,
  generateCommercialReportHTML,
  printHTMLAsPDF,
  type TechnicalReportData,
  type CommercialReportData,
} from "@/lib/pdfGenerator";

const ONE_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/108732851/74mCmCSQiyTeeGLMNvU8nA/one-for-regulators-white-crop_2d85c531.png";
const UPU_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/108732851/74mCmCSQiyTeeGLMNvU8nA/upu-logo_8968bce5.png";
const LS_RESULT_KEY = "nd_result_v2";

type ScoreResult = { global: number; byPhase: Record<string, number> };
type Gap = { phaseSlug: string; score: number; gap: number };
type Action = {
  id: string; phaseSlug: string;
  titleEn: string; descriptionEn: string;
  priority: "high" | "medium" | "low";
  horizon: "short" | "medium" | "long";
  effort: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
};

// LLM response types — matching server/analysis.ts exactly
type AssessmentAnalysis = {
  executiveSummary: string;
  maturityLevel: string;
  currentPhase: string;
  phaseAnalyses: {
    slug: string; name: string; score: number; level: string;
    narrative: string; keyObstacles: string[]; priorityActions: string[];
  }[];
  actionPlan: {
    action: string; phase: string; description: string;
    horizon: "short" | "medium" | "long";
    effort: "low" | "medium" | "high";
    impact: "low" | "medium" | "high";
    expectedOutcome: string;
  }[];
  roadmapNarrative: string;
  keyInsights: string[];
};

type CommercialPlan = {
  headline: string;
  subheadline: string;
  executiveSummary: string;
  painPoints: {
    pain: string; description: string; businessImpact: string;
    urgency: "critical" | "high" | "medium";
  }[];
  valueProposition: {
    pillar: string; statement: string; evidence: string; benefit: string;
  }[];
  proposedSolution: {
    phase: string; solution: string; description: string;
    deliverables: string[]; timeline: string; investment: string;
  }[];
  roi: { metric: string; currentState: string; expectedState: string; timeframe: string }[];
  nextSteps: string[];
  closingStatement: string;
};

type LLMAnalysis = {
  technicalAnalysis: AssessmentAnalysis;
  commercialPlan: CommercialPlan;
  scores: ScoreResult;
  gaps: Gap[];
};

type StoredResult = {
  scores: ScoreResult;
  gaps: Gap[];
  actionPlan: Action[];
  name: string;
  institution: string;
  entityType: "regulator" | "designated_operator";
  country?: string;
  llmAnalysis?: LLMAnalysis;
};

function getMaturityLevel(score: number) {
  if (score < 20) return { label: "Initial", color: "#DC2626", desc: "No systematic approach to postal quality measurement." };
  if (score < 40) return { label: "Developing", color: "#D97706", desc: "Basic processes exist but are inconsistent and undocumented." };
  if (score < 60) return { label: "Defined", color: "#0891B2", desc: "Standardized processes are defined and partially implemented." };
  if (score < 80) return { label: "Managed", color: "#0077C8", desc: "Processes are measured, controlled and continuously monitored." };
  return { label: "Optimized", color: "#059669", desc: "Continuous improvement is embedded in organizational culture." };
}

function getScoreColor(score: number): string {
  if (score < 20) return "#DC2626";
  if (score < 40) return "#D97706";
  if (score < 60) return "#0891B2";
  if (score < 80) return "#0077C8";
  return "#059669";
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

function ContactForm({ token, answers, onComplete }: {
  token?: string;
  answers: Record<number, number>;
  onComplete: (result: StoredResult) => void;
}) {
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [entityType, setEntityType] = useState<"regulator" | "designated_operator" | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const completeMutation = trpc.guest.complete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Required";
    if (!institution.trim()) errs.institution = "Required";
    if (!email.trim() || !email.includes("@")) errs.email = "Valid email required";
    if (!entityType) errs.entityType = "Required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      const result = await completeMutation.mutateAsync({
        token: token || undefined,
        email: email.trim(),
        answers: Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v])),
        name: name.trim(),
        organization: institution.trim(),
        country: country || undefined,
        entityType: entityType as "regulator" | "public_operator" | "private_operator" | "consultant" | "other",
      });
      const typedResult = result as { scores: ScoreResult; gaps: Gap[]; actionPlan: Action[] };
      onComplete({
        scores: typedResult.scores,
        gaps: typedResult.gaps,
        actionPlan: typedResult.actionPlan,
        name: name.trim(),
        institution: institution.trim(),
        entityType: entityType as "regulator" | "designated_operator",
        country: country || undefined,
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--brand-navy)" }}>
      <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="container flex items-center justify-between h-14">
          <img src={ONE_LOGO} alt="ONE for Regulators" className="h-9" />
          <img src={UPU_LOGO} alt="UPU" className="h-9 opacity-80" style={{ filter: "brightness(0) invert(1)" }} />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
              style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
              <CheckCircle2 size={12} /> Assessment complete
            </div>
            <h1 className="text-3xl font-bold text-white mb-3" style={{ letterSpacing: "-0.02em" }}>
              Your results are ready
            </h1>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mx-auto">
              Tell us about your institution to unlock your full maturity score, gap analysis,
              and a personalised action plan — including two downloadable PDF reports.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="bg-white rounded-sm p-8 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: "var(--brand-navy)" }}>
              Institution information
            </p>
            <div className="space-y-4">
              {/* Entity Type */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">
                  Type of institution <span style={{ color: "var(--brand-red)" }}>*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "regulator", label: "Postal Regulator", desc: "National regulatory authority" },
                    { value: "designated_operator", label: "Designated Operator", desc: "Public postal operator (DO)" },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setEntityType(opt.value as "regulator" | "designated_operator"); setErrors(p => ({ ...p, entityType: "" })); }}
                      className="text-left p-3 border rounded-sm transition-all"
                      style={{
                        borderColor: entityType === opt.value ? "var(--brand-navy)" : errors.entityType ? "var(--brand-red)" : "oklch(0.88 0.01 255)",
                        background: entityType === opt.value ? "var(--brand-navy)" : "white",
                      }}
                    >
                      <div className="text-xs font-semibold" style={{ color: entityType === opt.value ? "white" : "var(--brand-navy)" }}>{opt.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: entityType === opt.value ? "rgba(255,255,255,0.6)" : "#9CA3AF" }}>{opt.desc}</div>
                    </button>
                  ))}
                </div>
                {errors.entityType && <p className="text-xs mt-1" style={{ color: "var(--brand-red)" }}>{errors.entityType}</p>}
              </div>

              {/* Institution name */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">
                  Institution name <span style={{ color: "var(--brand-red)" }}>*</span>
                </label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input type="text" value={institution}
                    onChange={e => { setInstitution(e.target.value); setErrors(p => ({ ...p, institution: "" })); }}
                    placeholder="e.g. Postal Regulatory Authority"
                    className="w-full pl-9 pr-4 py-3 border rounded-sm text-sm focus:outline-none"
                    style={{ borderColor: errors.institution ? "var(--brand-red)" : "oklch(0.88 0.01 255)" }} />
                </div>
                {errors.institution && <p className="text-xs mt-1" style={{ color: "var(--brand-red)" }}>{errors.institution}</p>}
              </div>

              {/* Contact person + country */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-500">
                    Contact person <span style={{ color: "var(--brand-red)" }}>*</span>
                  </label>
                  <input type="text" value={name}
                    onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
                    placeholder="Full name"
                    className="w-full px-3 py-3 border rounded-sm text-sm focus:outline-none"
                    style={{ borderColor: errors.name ? "var(--brand-red)" : "oklch(0.88 0.01 255)" }} />
                  {errors.name && <p className="text-xs mt-1" style={{ color: "var(--brand-red)" }}>{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-gray-500">Country</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input type="text" value={country} onChange={e => setCountry(e.target.value)}
                      placeholder="e.g. Colombia"
                      className="w-full pl-9 pr-4 py-3 border rounded-sm text-sm focus:outline-none"
                      style={{ borderColor: "oklch(0.88 0.01 255)" }} />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">
                  Email address <span style={{ color: "var(--brand-red)" }}>*</span>
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input type="email" value={email}
                    onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                    placeholder="you@institution.org"
                    className="w-full pl-9 pr-4 py-3 border rounded-sm text-sm focus:outline-none"
                    style={{ borderColor: errors.email ? "var(--brand-red)" : "oklch(0.88 0.01 255)" }} />
                </div>
                {errors.email && <p className="text-xs mt-1" style={{ color: "var(--brand-red)" }}>{errors.email}</p>}
              </div>
            </div>

            <div className="mt-5 p-4 rounded-sm flex items-start gap-3"
              style={{ background: "oklch(0.97 0.01 255)", borderLeft: "3px solid var(--brand-navy)" }}>
              <Mail size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--brand-navy)" }} />
              <p className="text-xs text-gray-500 leading-relaxed">
                Once we collect enough responses, we will send you the{" "}
                <strong className="text-gray-700">anonymous global benchmark</strong> comparing your institution
                with other postal regulators and designated operators — at no cost.
              </p>
            </div>

            <button type="submit" disabled={completeMutation.isPending}
              className="w-full mt-6 py-3.5 text-sm font-semibold rounded-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "var(--brand-navy)", color: "white" }}>
              {completeMutation.isPending
                ? <><Loader2 size={14} className="animate-spin" /> Processing…</>
                : <>Unlock my results <ArrowRight size={14} /></>}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              Your data is kept confidential and used only for the benchmark.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── LLM Analysis Loading Screen ─────────────────────────────────────────────

function AnalysisLoadingScreen() {
  const [step, setStep] = useState(0);
  const steps = [
    "Analysing your responses…",
    "Identifying maturity gaps…",
    "Generating phase-by-phase diagnosis…",
    "Building your action plan…",
    "Preparing PDF reports…",
  ];
  useEffect(() => {
    const interval = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 2200);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--brand-navy)" }}>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-8" />
        <h2 className="text-xl font-bold text-white mb-3">Generating your report</h2>
        <p className="text-white/40 text-sm mb-8">This may take 20–30 seconds</p>
        <div className="space-y-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3 text-sm transition-all"
              style={{ color: i < step ? "rgba(255,255,255,0.3)" : i === step ? "white" : "rgba(255,255,255,0.15)" }}>
              {i < step
                ? <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                : i === step
                  ? <Loader2 size={14} className="animate-spin flex-shrink-0" />
                  : <div className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0" />}
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Results Dashboard ────────────────────────────────────────────────────────

function ResultsDashboard({ result, phases, onRetake }: {
  result: StoredResult;
  phases: { slug: string; titleEn: string }[];
  onRetake?: () => void;
}) {
  const { scores, gaps, actionPlan, institution, entityType, country, llmAnalysis } = result;
  const maturity = getMaturityLevel(scores.global);
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [downloadingTech, setDownloadingTech] = useState(false);
  const [downloadingComm, setDownloadingComm] = useState(false);

  const radarData = phases.filter(p => p.slug !== "context").map(p => ({
    phase: p.titleEn.split(" ").slice(0, 2).join(" "),
    score: scores.byPhase[p.slug] ?? 0,
    fullMark: 100,
  }));

  const barData = phases.filter(p => p.slug !== "context").map(p => ({
    name: p.titleEn.split(" ").slice(0, 2).join(" "),
    score: scores.byPhase[p.slug] ?? 0,
    slug: p.slug,
  }));

  const horizonLabel: Record<string, string> = { short: "0–6 months", medium: "6–18 months", long: "18+ months" };
  const horizonColor: Record<string, string> = { short: "#059669", medium: "#0077C8", long: "#7C3AED" };

  const handleDownloadTechnical = async () => {
    setDownloadingTech(true);
    try {
      if (!llmAnalysis) {
        // Fallback: basic PDF with scores only (no LLM analysis)
        toast.info("Generating basic report…");
        const basicData: TechnicalReportData = {
          institution,
          entityType,
          country,
          respondentName: result.name,
          globalScore: scores.global,
          maturityLevel: getMaturityLevel(scores.global).label,
          currentPhase: "",
          executiveSummary: `${institution} has completed the NetDiscover postal quality maturity assessment with a global score of ${scores.global}%.`,
          phaseAnalyses: Object.entries(scores.byPhase).map(([slug, score]) => ({
            slug,
            name: slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            score,
            level: getMaturityLevel(score).label,
            analysis: `Score: ${score}%. Full AI narrative not available.`,
            keyBarriers: [],
            priorityActions: [],
          })),
          actionPlan: actionPlan.map(a => ({
            title: a.titleEn,
            description: a.descriptionEn,
            phase: a.phaseSlug,
            horizon: (a.horizon ?? "medium") as "short" | "medium" | "long",
            effort: (a.effort ?? "medium") as "low" | "medium" | "high",
            impact: (a.impact ?? "medium") as "low" | "medium" | "high",
          })),
          roadmapNarrative: "",
          phaseScores: scores.byPhase,
        };
        printHTMLAsPDF(generateTechnicalReportHTML(basicData), `NetDiscover_Diagnostic_${institution.replace(/\s+/g, "_")}.pdf`);
        return;
      }
      const ta = llmAnalysis.technicalAnalysis;
      const data: TechnicalReportData = {
        institution,
        entityType,
        country,
        respondentName: result.name,
        globalScore: scores.global,
        maturityLevel: ta.maturityLevel,
        currentPhase: ta.currentPhase,
        executiveSummary: ta.executiveSummary,
        phaseAnalyses: ta.phaseAnalyses.map(p => ({
          slug: p.slug,
          name: p.name,
          score: p.score,
          level: p.level,
          analysis: p.narrative,
          keyBarriers: p.keyObstacles,
          priorityActions: p.priorityActions,
        })),
        actionPlan: ta.actionPlan.map(a => ({
          title: a.action,
          description: a.description,
          phase: a.phase,
          horizon: a.horizon,
          effort: a.effort,
          impact: a.impact,
        })),
        roadmapNarrative: ta.roadmapNarrative,
        phaseScores: scores.byPhase,
      };
      printHTMLAsPDF(generateTechnicalReportHTML(data), `NetDiscover_Diagnostic_${institution.replace(/\s+/g, "_")}.pdf`);
    } finally {
      setDownloadingTech(false);
    }
  };

  const handleDownloadCommercial = async () => {
    setDownloadingComm(true);
    try {
      if (!llmAnalysis) {
        toast.info("Generating basic action plan…");
        const basicData: CommercialReportData = {
          institution,
          entityType,
          country,
          globalScore: scores.global,
          maturityLevel: getMaturityLevel(scores.global).label,
          executiveSummary: `${institution} has completed the NetDiscover assessment with a global score of ${scores.global}%. Full AI analysis not available.`,
          pains: gaps.slice(0, 5).map(g => ({
            title: g.phaseSlug ?? "Gap identified",
            description: `Gap score: ${g.gap}%`,
            phase: g.phaseSlug ?? "",
            severity: "medium" as "critical" | "high" | "medium",
          })),
          valuePropositions: [],
          proposedSolution: actionPlan.map(a => `${a.phaseSlug}: ${a.titleEn}`).join("\n"),
          nextSteps: actionPlan.slice(0, 5).map(a => a.titleEn),
          investmentJustification: "",
        };
        printHTMLAsPDF(generateCommercialReportHTML(basicData), `NetDiscover_ActionPlan_${institution.replace(/\s+/g, "_")}.pdf`);
        return;
      }
      const cp = llmAnalysis.commercialPlan;
      const data: CommercialReportData = {
        institution,
        entityType,
        country,
        globalScore: scores.global,
        maturityLevel: llmAnalysis.technicalAnalysis.maturityLevel,
        executiveSummary: cp.executiveSummary,
        pains: cp.painPoints.map(p => ({
          title: p.pain,
          description: p.description,
          phase: p.businessImpact,
          severity: p.urgency as "critical" | "high" | "medium",
        })),
        valuePropositions: cp.valueProposition.map(vp => ({
          pain: vp.pillar,
          solution: vp.statement,
          benefit: vp.benefit,
          product: vp.evidence,
        })),
        proposedSolution: cp.proposedSolution.map(s =>
          `${s.phase}: ${s.solution}. ${s.description} (${s.timeline})`
        ).join("\n\n"),
        nextSteps: cp.nextSteps,
        investmentJustification: cp.closingStatement,
      };
      printHTMLAsPDF(generateCommercialReportHTML(data), `NetDiscover_ActionPlan_${institution.replace(/\s+/g, "_")}.pdf`);
    } finally {
      setDownloadingComm(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <div style={{ background: "var(--brand-navy)" }}>
        <div className="container flex items-center justify-between h-14">
          <img src={ONE_LOGO} alt="ONE for Regulators" className="h-9" />
          <div className="flex items-center gap-3">
            {onRetake && (
              <button onClick={onRetake}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-sm border transition-all hover:bg-white/10"
                style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }}>
                New assessment
              </button>
            )}
            <img src={UPU_LOGO} alt="UPU" className="h-9 opacity-80" style={{ filter: "brightness(0) invert(1)" }} />
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "var(--brand-navy)" }} className="pb-16 pt-10">
        <div className="container max-w-4xl">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
            <div className="flex-1">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">
                {entityType === "regulator" ? "Postal Regulator" : "Designated Operator"} · {institution}
                {country ? ` · ${country}` : ""}
              </p>
              <div className="flex items-end gap-4 mb-3">
                <span className="text-8xl font-black" style={{ letterSpacing: "-0.04em", color: maturity.color }}>{scores.global}</span>
                <span className="text-2xl font-light text-white/30 mb-4">/100</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-3"
                style={{ background: maturity.color + "22", color: maturity.color, border: `1px solid ${maturity.color}44` }}>
                {maturity.label}
              </div>
              <p className="text-white/80 text-sm max-w-md">{maturity.desc}</p>
            </div>
            {/* PDF Download Buttons */}
            {llmAnalysis && (
              <div className="flex flex-col gap-3 min-w-[220px]">
                <button onClick={handleDownloadTechnical} disabled={downloadingTech}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-sm text-sm font-semibold transition-all disabled:opacity-60"
                  style={{ background: "white", color: "var(--brand-navy)" }}>
                  {downloadingTech ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  <div className="text-left">
                    <div className="text-xs font-bold">Diagnostic Report</div>
                    <div className="text-xs font-normal opacity-60">Technical assessment PDF</div>
                  </div>
                  <Download size={14} className="ml-auto opacity-50" />
                </button>
                <button onClick={handleDownloadCommercial} disabled={downloadingComm}
                  className="flex items-center gap-3 px-5 py-3.5 rounded-sm text-sm font-semibold transition-all disabled:opacity-60"
                  style={{ background: "var(--brand-red)", color: "white" }}>
                  {downloadingComm ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                  <div className="text-left">
                    <div className="text-xs font-bold">Action Plan</div>
                    <div className="text-xs font-normal opacity-70">Commercial roadmap PDF</div>
                  </div>
                  <Download size={14} className="ml-auto opacity-70" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div style={{ marginTop: "-2px", background: "var(--brand-navy)" }}>
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 40L1440 40L1440 10C1200 40 960 0 720 20C480 40 240 0 0 10L0 40Z" fill="white" />
        </svg>
      </div>

      <div className="container max-w-4xl py-12 space-y-12">

        {/* Executive Summary (LLM) */}
        {llmAnalysis && (
          <section>
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--brand-navy)" }}>Executive Summary</h2>
            <div className="p-6 rounded-sm" style={{ background: "#F0F4F8", borderLeft: "4px solid var(--brand-navy)" }}>
              <p className="text-sm text-gray-700 leading-relaxed">{llmAnalysis.technicalAnalysis.executiveSummary}</p>
            </div>
          </section>
        )}

        {/* Charts */}
        <section className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--brand-navy)" }}>Maturity Profile</h3>
            <div className="bg-gray-50 rounded-sm p-4" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="phase" tick={{ fontSize: 10, fill: "#6B7280" }} />
                  <Radar name="Score" dataKey="score" stroke="var(--brand-navy)" fill="var(--brand-navy)" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: "var(--brand-navy)" }}>Score by Phase</h3>
            <div className="bg-gray-50 rounded-sm p-4" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 32 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#6B7280" }} width={70} />
                  <Tooltip formatter={(v) => [`${v}%`, "Score"]} />
                  <Bar dataKey="score" radius={[0, 3, 3, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={getScoreColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Critical Gaps */}
        <section>
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--brand-navy)" }}>Critical Gaps</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {gaps.slice(0, 3).map((g, i) => (
              <div key={i} className="border rounded-sm p-5" style={{ borderColor: "#E5E7EB" }}>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} style={{ color: "#DC2626" }} />
                  <span className="text-xs font-bold uppercase tracking-wider text-red-600">Gap #{i + 1}</span>
                </div>
                <div className="text-2xl font-black mb-1" style={{ color: "#DC2626" }}>{g.gap}%</div>
                <div className="text-xs text-gray-500 mb-2">below maximum</div>
                <div className="text-sm font-semibold" style={{ color: "var(--brand-navy)" }}>
                  {phases.find(p => p.slug === g.phaseSlug)?.titleEn ?? g.phaseSlug}
                </div>
                <div className="text-xs text-gray-400 mt-1">Current score: {g.score}%</div>
              </div>
            ))}
          </div>
        </section>

        {/* Phase Analysis (LLM) */}
        {llmAnalysis && (
          <section>
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--brand-navy)" }}>Phase-by-Phase Diagnosis</h2>
            <div className="space-y-3">
              {llmAnalysis.technicalAnalysis.phaseAnalyses.map(p => (
                <div key={p.slug} className="border rounded-sm overflow-hidden" style={{ borderColor: "#E5E7EB" }}>
                  <button
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedPhase(expandedPhase === p.slug ? null : p.slug)}>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-black" style={{ color: getScoreColor(p.score) }}>{p.score}%</div>
                      <div>
                        <div className="text-sm font-bold" style={{ color: "var(--brand-navy)" }}>{p.name}</div>
                        <div className="text-xs font-semibold" style={{ color: getScoreColor(p.score) }}>{p.level}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p.score}%`, background: getScoreColor(p.score) }} />
                      </div>
                      {expandedPhase === p.slug ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </button>
                  {expandedPhase === p.slug && (
                    <div className="px-5 pb-5 border-t" style={{ borderColor: "#F3F4F6" }}>
                      <p className="text-sm text-gray-600 leading-relaxed mt-4 mb-4">{p.narrative}</p>
                      {p.keyObstacles.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2">Key Barriers</div>
                          {p.keyObstacles.map((b, i) => (
                            <div key={i} className="text-xs text-gray-500 py-1.5 pl-3 border-l-2 border-red-200 mb-1">{b}</div>
                          ))}
                        </div>
                      )}
                      {p.priorityActions.length > 0 && (
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-green-600 mb-2">Priority Actions</div>
                          {p.priorityActions.map((a, i) => (
                            <div key={i} className="text-xs text-gray-600 py-1.5 pl-3 border-l-2 border-green-200 mb-1">→ {a}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Action Plan */}
        <section>
          <h2 className="text-xl font-bold mb-4" style={{ color: "var(--brand-navy)" }}>Prioritised Action Plan</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {(["short", "medium", "long"] as const).map(h => {
              const llmPlan = llmAnalysis?.technicalAnalysis.actionPlan ?? [];
              const fallbackPlan = actionPlan ?? [];
              const items = llmPlan.length > 0
                ? llmPlan.filter(a => a.horizon === h)
                : fallbackPlan.filter(a => a.horizon === h);
              return (
                <div key={h} className="rounded-sm p-4 text-center" style={{ background: horizonColor[h] + "10", border: `1px solid ${horizonColor[h]}30` }}>
                  <div className="text-2xl font-black mb-1" style={{ color: horizonColor[h] }}>{items.length}</div>
                  <div className="text-xs font-semibold" style={{ color: horizonColor[h] }}>{horizonLabel[h]}</div>
                </div>
              );
            })}
          </div>
          <div className="space-y-3">
            {(llmAnalysis?.technicalAnalysis.actionPlan.length
              ? llmAnalysis.technicalAnalysis.actionPlan
              : (actionPlan ?? [])
            ).slice(0, 8).map((a, i) => {
              const title = "action" in a ? (a as AssessmentAnalysis["actionPlan"][0]).action : (a as Action).titleEn;
              const desc = "description" in a ? a.description : "";
              const phase = "phase" in a ? (a as AssessmentAnalysis["actionPlan"][0]).phase : (a as Action).phaseSlug;
              return (
                <div key={i} className="flex items-start gap-4 p-4 rounded-sm border" style={{ borderColor: "#E5E7EB" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                    style={{ background: "var(--brand-navy)" }}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold mb-1" style={{ color: "var(--brand-navy)" }}>{title}</div>
                    <div className="text-xs text-gray-500 leading-relaxed">{desc}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: horizonColor[a.horizon] + "15", color: horizonColor[a.horizon] }}>
                      {horizonLabel[a.horizon]}
                    </span>
                    <span className="text-xs text-gray-400">{phase}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Roadmap Narrative (LLM) */}
        {llmAnalysis && (
          <section>
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--brand-navy)" }}>Recommended Roadmap</h2>
            <div className="p-6 rounded-sm" style={{ background: "#F0F4F8", borderLeft: "4px solid var(--brand-navy)" }}>
              <p className="text-sm text-gray-700 leading-relaxed">{llmAnalysis.technicalAnalysis.roadmapNarrative}</p>
            </div>
          </section>
        )}

        {/* Commercial Pain Points (LLM) */}
        {llmAnalysis && (
          <section>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--brand-navy)" }}>Identified Challenges</h2>
            <p className="text-sm text-gray-500 mb-5">Key pain points identified based on your assessment responses.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {llmAnalysis.commercialPlan.painPoints.slice(0, 6).map((p, i) => {
                const sColor = p.urgency === "critical" ? "#DC2626" : p.urgency === "high" ? "#D97706" : "#0891B2";
                return (
                  <div key={i} className="p-4 rounded-sm"
                    style={{ borderLeft: `4px solid ${sColor}`, background: sColor + "08", border: `1px solid ${sColor}20` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-bold" style={{ color: "var(--brand-navy)" }}>{p.pain}</div>
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{ background: sColor + "15", color: sColor }}>{p.urgency}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-1">{p.description}</p>
                    <p className="text-xs text-gray-400 italic">{p.businessImpact}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Key Insights (LLM) */}
        {llmAnalysis && llmAnalysis.technicalAnalysis.keyInsights.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--brand-navy)" }}>Key Insights</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {llmAnalysis.technicalAnalysis.keyInsights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-sm border" style={{ borderColor: "#E5E7EB" }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                    style={{ background: "var(--brand-navy)", fontSize: "10px", fontWeight: 700 }}>{i + 1}</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Download CTA */}
        {llmAnalysis && (
          <section className="rounded-sm p-8 text-center" style={{ background: "var(--brand-navy)" }}>
            <h2 className="text-xl font-bold text-white mb-2">Download your full reports</h2>
            <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
              Two institutional PDF reports with logos, charts, detailed analysis and action plans — ready to share with your team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={handleDownloadTechnical} disabled={downloadingTech}
                className="flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-semibold transition-all disabled:opacity-60"
                style={{ background: "white", color: "var(--brand-navy)" }}>
                {downloadingTech ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                Diagnostic Report (PDF)
              </button>
              <button onClick={handleDownloadCommercial} disabled={downloadingComm}
                className="flex items-center gap-2 px-6 py-3 rounded-sm text-sm font-semibold transition-all disabled:opacity-60"
                style={{ background: "var(--brand-red)", color: "white" }}>
                {downloadingComm ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                Action Plan (PDF)
              </button>
            </div>
          </section>
        )}

        {/* Benchmark promise */}
        <section className="rounded-sm p-6 flex items-start gap-4" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
          <Mail size={20} style={{ color: "var(--brand-navy)", flexShrink: 0, marginTop: 2 }} />
          <div>
            <div className="text-sm font-bold mb-1" style={{ color: "var(--brand-navy)" }}>Global Benchmark — Coming Soon</div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Once we have collected enough responses from postal regulators and designated operators worldwide,
              we will send you the <strong>anonymous global benchmark</strong> comparing your institution's
              maturity profile with your peers — free of charge.
            </p>
          </div>
        </section>

      </div>

      {/* Footer */}
      <div style={{ background: "var(--brand-navy)", marginTop: "60px" }} className="py-8">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src={ONE_LOGO} alt="ONE for Regulators" className="h-6 opacity-60" />
            <img src={UPU_LOGO} alt="UPU" className="h-7 opacity-40" style={{ filter: "brightness(0) invert(1)" }} />
          </div>
          <p className="text-xs text-white/20">© Universal Postal Union — Regulators Community Benchmark 2026</p>
        </div>
      </div>
    </div>
  );
}

// ─── Email Recovery Screen ──────────────────────────────────────────────────
function EmailRecoveryScreen({ onRestore, onStartNew }: {
  onRestore: (result: StoredResult) => void;
  onStartNew: () => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const lookupMutation = trpc.guest.lookupByEmail.useMutation();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email address."); return; }
    setError("");
    try {
      const res = await lookupMutation.mutateAsync({ email: email.trim() });
      if (!res.found || !res.scores) {
        setError("No completed assessment found for this email. Please start a new one.");
        return;
      }
      const restored: StoredResult = {
        scores: res.scores as ScoreResult,
        gaps: (res.gaps ?? []) as Gap[],
        actionPlan: (res.actionPlan ?? []) as Action[],
        name: res.name ?? "",
        institution: res.organization ?? "",
        entityType: (res.entityType === "regulator" ? "regulator" : "designated_operator") as "regulator" | "designated_operator",
        country: res.country ?? undefined,
      };
      localStorage.setItem(LS_RESULT_KEY, JSON.stringify(restored));
      onRestore(restored);
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--brand-navy)" }}>
      <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <div className="container flex items-center justify-between h-14">
          <img src={ONE_LOGO} alt="ONE for Regulators" className="h-9" />
          <img src={UPU_LOGO} alt="UPU" className="h-9 opacity-80" style={{ filter: "brightness(0) invert(1)" }} />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(255,255,255,0.08)" }}>
              <FileText size={24} className="text-white/60" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3" style={{ letterSpacing: "-0.02em" }}>
              Access your results
            </h1>
            <p className="text-white/50 text-sm leading-relaxed">
              Enter the email you used when completing the assessment to recover your results,
              or start a new assessment.
            </p>
          </div>

          <div className="bg-white rounded-sm p-8 shadow-2xl mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: "var(--brand-navy)" }}>
              Recover existing results
            </p>
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-gray-500">
                  Email address <span style={{ color: "var(--brand-red)" }}>*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="your@institution.org"
                  className="w-full px-3 py-2.5 text-sm border rounded-sm outline-none transition-all"
                  style={{
                    borderColor: error ? "var(--brand-red)" : "#e5e7eb",
                    background: "#fafafa",
                    color: "var(--brand-navy)",
                  }}
                />
                {error && <p className="text-xs mt-1" style={{ color: "var(--brand-red)" }}>{error}</p>}
              </div>
              <button
                type="submit"
                disabled={lookupMutation.isPending}
                className="w-full py-2.5 text-sm font-semibold rounded-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "var(--brand-navy)", color: "white" }}
              >
                {lookupMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                {lookupMutation.isPending ? "Looking up…" : "Recover my results"}
              </button>
            </form>
          </div>

          <div className="text-center">
            <p className="text-white/40 text-xs mb-3">Don\'t have results yet?</p>
            <button
              onClick={onStartNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-sm transition-all hover:opacity-90"
              style={{ background: "var(--brand-red)", color: "white" }}
            >
              Start the assessment
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page Controller ──────────────────────────────────────────────────────────
export default function Results() {
  const [, navigate] = useLocation();
  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [token, setToken] = useState<string | undefined>();
  const [result, setResult] = useState<StoredResult | null>(null);
  // initialized = true once the useEffect has finished reading storage
  const [initialized, setInitialized] = useState(false);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);

  const { data: phases } = trpc.model.getPhases.useQuery();
  const generateAnalysisMutation = trpc.analysis.generate.useMutation();

  // Load answers or restore from localStorage — runs once after mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_RESULT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StoredResult;
        setResult(parsed);
        setInitialized(true);
        return;
      } catch { /* ignore */ }
    }
    const raw = sessionStorage.getItem("nd_answers");
    const tok = sessionStorage.getItem("nd_token");
    if (raw) {
      try {
        setAnswers(JSON.parse(raw) as Record<number, number>);
        if (tok) setToken(tok);
      } catch { /* ignore */ }
    }
    // Always mark initialized so we never stay on the spinner
    setInitialized(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = async (baseResult: StoredResult) => {
    setResult(baseResult);
    localStorage.setItem(LS_RESULT_KEY, JSON.stringify(baseResult));
    sessionStorage.removeItem("nd_answers");
    sessionStorage.removeItem("nd_token");

    setIsGeneratingAnalysis(true);
    try {
      const llmResult = await generateAnalysisMutation.mutateAsync({
        answers: Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v])),
        institution: baseResult.institution,
        entityType: baseResult.entityType,
        country: baseResult.country,
        respondentName: baseResult.name,
      });
      const enriched: StoredResult = { ...baseResult, llmAnalysis: llmResult as LLMAnalysis };
      setResult(enriched);
      localStorage.setItem(LS_RESULT_KEY, JSON.stringify(enriched));
    } catch (err) {
      console.error("LLM analysis failed:", err);
      toast.error("Could not generate full analysis. Basic results are still available.");
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  // Brief initial render before useEffect fires
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--brand-navy)" }}>
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (isGeneratingAnalysis) return <AnalysisLoadingScreen />;

  if (result) {
    return (
      <ResultsDashboard
        result={result}
        phases={phases ?? []}
        onRetake={() => {
          localStorage.removeItem(LS_RESULT_KEY);
          navigate("/assessment");
        }}
      />
    );
  }

  // Has answers from sessionStorage → show contact form
  if (Object.keys(answers).length > 0) {
    return <ContactForm token={token} answers={answers} onComplete={handleComplete} />;
  }

  // No data at all → show access / recovery screen
  return (
    <EmailRecoveryScreen
      onRestore={setResult}
      onStartNew={() => navigate("/assessment")}
    />
  );
}
