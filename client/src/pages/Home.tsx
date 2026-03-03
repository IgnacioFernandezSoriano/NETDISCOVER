import { useLocation } from "wouter";
import { ArrowRight, BarChart3, Globe2, Loader2, Mail, Shield, Users, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const ONE_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/108732851/74mCmCSQiyTeeGLMNvU8nA/one-for-regulators-white-crop_2d85c531.png";
const UPU_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/108732851/74mCmCSQiyTeeGLMNvU8nA/upu-logo-white_a7f80b25.png";
const LS_RESULT_KEY = "nd_result_v2";

const PHASES = [
  { num: "01", title: "System Design", desc: "Measurement methodology and infrastructure" },
  { num: "02", title: "Ecosystem Mapping", desc: "Operators, carriers and postal network" },
  { num: "03", title: "SLA Establishment", desc: "Service level agreements and baselines" },
  { num: "04", title: "Network Diagnosis", desc: "RFID tracking and bottleneck analysis" },
  { num: "05", title: "Continuous Measurement", desc: "Ongoing monitoring and alert systems" },
  { num: "06", title: "Improvement Plans", desc: "Root cause analysis and corrective actions" },
  { num: "07", title: "Maturity & Excellence", desc: "International benchmarking and innovation" },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [hasLocalResult, setHasLocalResult] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const lookupMutation = trpc.guest.lookupByEmail.useMutation();

  useEffect(() => {
    setHasLocalResult(!!localStorage.getItem(LS_RESULT_KEY));
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    try {
      const res = await lookupMutation.mutateAsync({ email: email.trim() });
      if (!res.found || !res.scores) {
        setEmailError("No completed assessment found for this email. Please start a new one.");
        return;
      }
      const restored = {
        scores: res.scores,
        gaps: res.gaps ?? [],
        actionPlan: res.actionPlan ?? [],
        name: res.name ?? "",
        institution: res.organization ?? "",
        entityType: res.entityType === "regulator" ? "regulator" : "designated_operator",
        country: res.country ?? undefined,
      };
      localStorage.setItem(LS_RESULT_KEY, JSON.stringify(restored));
      navigate("/results");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav style={{ background: "var(--brand-navy)" }}>
        <div className="container flex items-center justify-between" style={{ minHeight: "4.5rem", gap: "1rem" }}>
          {/* Logos */}
          <div className="flex items-center gap-3 flex-shrink-0" style={{ minWidth: 0 }}>
            <img
              src={ONE_LOGO}
              alt="ONE for Regulators"
              style={{ height: "clamp(2rem, 6vw, 3.5rem)", width: "auto", display: "block" }}
            />
            <div className="w-px bg-white/20" style={{ height: "1.25rem", flexShrink: 0 }} />
            <img
              src={UPU_LOGO}
              alt="UPU"
              style={{ height: "clamp(2rem, 6vw, 3.5rem)", width: "auto", display: "block", opacity: 0.85 }}
            />
          </div>
          {/* Nav links + dual CTAs */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <a href="#about" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">About</a>
            <a href="#benchmark" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">Benchmark</a>
            <a href="#phases" className="text-white/50 hover:text-white text-sm transition-colors hidden md:block">Phases</a>
            {/* Secondary: access results */}
            <button
              onClick={() => hasLocalResult ? navigate("/results") : document.getElementById("access-section")?.scrollIntoView({ behavior: "smooth" })}
              className="whitespace-nowrap text-sm font-medium rounded-sm transition-all hidden sm:block"
              style={{
                border: "1.5px solid rgba(255,255,255,0.25)",
                color: "rgba(255,255,255,0.75)",
                padding: "0.45rem 0.9rem",
                background: "transparent",
              }}
            >
              Access my evaluation
            </button>
            {/* Primary: start */}
            <button
              onClick={() => navigate("/assessment")}
              className="whitespace-nowrap text-sm font-semibold rounded-sm transition-all hover:opacity-90"
              style={{ background: "var(--brand-red)", color: "white", padding: "0.5rem 1rem", flexShrink: 0 }}
            >
              Start Assessment
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--brand-navy)" }} className="pt-20 pb-32">
        <div className="container max-w-4xl">
          {/* Badge */}
          <div className="mb-6">
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm font-bold tracking-tight"
              style={{ background: "rgba(200,16,46,0.15)", color: "var(--brand-red)", fontSize: "clamp(0.85rem, 2vw, 1.1rem)", letterSpacing: "-0.01em", border: "1px solid rgba(200,16,46,0.25)" }}
            >
              Regulators Community Benchmark 2026
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl md:text-6xl font-black text-white mb-6"
            style={{ letterSpacing: "-0.03em", lineHeight: 1.05 }}
          >
            How mature is your<br />
            <span style={{ color: "var(--brand-red)" }}>postal quality</span><br />
            measurement?
          </h1>
          <p className="text-white/50 text-lg mb-10 max-w-xl leading-relaxed">
            A diagnostic tool for regulators to assess the development of postal service quality measurement.
          </p>

          {/* ── Primary CTA ── */}
          <button
            onClick={() => navigate("/assessment")}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-sm transition-all hover:opacity-90 mb-10"
            style={{ background: "var(--brand-red)", color: "white" }}
          >
            Start your assessment
            <ArrowRight size={16} />
          </button>

          {/* ── Access your evaluation ── */}
          <div
            id="access-section"
            className="rounded-sm p-6"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              maxWidth: "520px",
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--brand-red)" }}>
              Already completed the assessment?
            </p>
            <p className="text-white/70 text-sm mb-4 leading-relaxed">
              Enter the email you used to access your personalised results and PDF reports.
            </p>

            {hasLocalResult ? (
              /* User already has results in this browser */
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                  Results saved in this browser
                </div>
                <button
                  onClick={() => navigate("/results")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-sm transition-all hover:opacity-90"
                  style={{ background: "white", color: "var(--brand-navy)" }}
                >
                  Access my evaluation
                  <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              /* Email recovery form */
              <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 rounded-sm overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: emailError ? "1px solid var(--brand-red)" : "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <Mail size={14} className="ml-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                      placeholder="your@institution.org"
                      className="flex-1 py-3 pr-3 text-sm bg-transparent outline-none placeholder:text-white/25"
                      style={{ color: "white" }}
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs mt-1.5" style={{ color: "var(--brand-red)" }}>{emailError}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={lookupMutation.isPending}
                  className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-sm transition-all disabled:opacity-60 hover:opacity-90"
                  style={{ background: "white", color: "var(--brand-navy)" }}
                >
                  {lookupMutation.isPending
                    ? <Loader2 size={14} className="animate-spin" />
                    : <ChevronRight size={14} />}
                  {lookupMutation.isPending ? "Searching…" : "Access my evaluation"}
                </button>
              </form>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-14 pt-10 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            {[
              { value: "7", label: "Maturity phases" },
              { value: "35", label: "Assessment questions" },
              { value: "10 min", label: "Estimated time" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-black text-white" style={{ letterSpacing: "-0.02em" }}>{s.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave */}
      <div style={{ marginTop: "-2px", background: "var(--brand-navy)" }}>
        <svg viewBox="0 0 1440 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 50L1440 50L1440 15C1200 50 960 0 720 25C480 50 240 0 0 15L0 50Z" fill="white" />
        </svg>
      </div>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label mb-4">What is NetDiscover</p>
              <h2 className="text-3xl font-bold mb-5" style={{ color: "var(--brand-navy)", letterSpacing: "-0.02em" }}>
                A diagnostic tool for postal quality regulators
              </h2>
              <p className="text-gray-500 leading-relaxed mb-5">
                NetDiscover is a structured self-assessment platform based on the ONE for Regulators framework
                developed in collaboration with the Universal Postal Union (UPU). It maps your organisation's
                current capabilities across seven maturity phases.
              </p>
              <p className="text-gray-500 leading-relaxed">
                In 10 minutes you get a maturity score, a gap analysis, a prioritised action plan, and two
                downloadable PDF reports — one technical and one commercial — generated by AI from your responses.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "Independent assessment", desc: "Self-administered with no external validation required." },
                { icon: BarChart3, title: "Anonymous benchmark", desc: "Your results contribute to a regional comparison shared with all participants." },
                { icon: Globe2, title: "UPU framework", desc: "Based on international postal quality standards and best practices." },
                { icon: Users, title: "Regulators only", desc: "Designed specifically for national postal regulators and designated operators." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-5 rounded-sm" style={{ background: "oklch(0.97 0.01 255)" }}>
                  <Icon size={20} className="mb-3" style={{ color: "var(--brand-navy)" }} />
                  <h3 className="text-sm font-bold mb-1" style={{ color: "var(--brand-navy)" }}>{title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Benchmark ────────────────────────────────────────────────────── */}
      <section id="benchmark" className="py-20" style={{ background: "oklch(0.97 0.01 255)" }}>
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label mb-4">The benchmark</p>
              <h2 className="text-3xl font-bold mb-5" style={{ color: "var(--brand-navy)", letterSpacing: "-0.02em" }}>
                Know where you stand in the region
              </h2>
              <p className="text-gray-500 leading-relaxed mb-5">
                The regional benchmark is a collective intelligence tool. Every organisation that completes
                the assessment contributes anonymously to a shared picture of postal quality regulation
                maturity across the postal sector.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8">
                The benchmark report shows average scores per phase, identifies leading practices,
                and highlights where the sector as a whole needs to improve — giving each participant
                actionable context for their own results.
              </p>
              <button
                onClick={() => navigate("/assessment")}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-sm transition-all hover:opacity-90"
                style={{ background: "var(--brand-navy)", color: "white" }}
              >
                Contribute to the benchmark
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Phases ───────────────────────────────────────────────────────── */}
      <section id="phases" className="py-20">
        <div className="container max-w-4xl">
          <p className="section-label mb-4">Assessment structure</p>
          <h2 className="text-3xl font-bold mb-12" style={{ color: "var(--brand-navy)", letterSpacing: "-0.02em" }}>
            Seven phases of postal quality maturity
          </h2>
          <div className="relative">
            <div
              className="absolute left-5 top-0 bottom-0 w-px hidden md:block"
              style={{ background: "oklch(0.90 0.01 255)" }}
            />
            <div className="space-y-0">
              {PHASES.map((phase, i) => (
                <div key={phase.num} className="flex gap-8 items-start group">
                  <div className="flex-shrink-0 relative">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "var(--brand-navy)", color: "white", zIndex: 1, position: "relative" }}
                    >
                      {phase.num}
                    </div>
                  </div>
                  <div className="flex-1 pb-10">
                    <h3 className="font-bold mb-1" style={{ color: "var(--brand-navy)" }}>{phase.title}</h3>
                    <p className="text-sm text-gray-400">{phase.desc}</p>
                  </div>
                  {i < PHASES.length - 1 && <div className="hidden md:block" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ background: "var(--brand-navy)" }} className="py-20">
        <div className="container max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
            Ready to assess your maturity?
          </h2>
          <p className="text-white/50 mb-8 leading-relaxed">
            10 minutes. 35 questions. Instant results. No registration required to start.
          </p>
          <button
            onClick={() => navigate("/assessment")}
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold rounded-sm transition-all hover:opacity-90"
            style={{ background: "var(--brand-red)", color: "white" }}
          >
            Begin the assessment
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ background: "oklch(0.10 0.04 255)" }} className="py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={ONE_LOGO} alt="ONE for Regulators" className="h-5 opacity-50" />
            <div className="w-px h-4 bg-white/10" />
            <img src={UPU_LOGO} alt="UPU" className="h-6 opacity-30" />
          </div>
          <p className="text-xs text-white/20">
            © {new Date().getFullYear()} ONE for Regulators · Universal Postal Union framework
          </p>
        </div>
      </footer>
    </div>
  );
}
