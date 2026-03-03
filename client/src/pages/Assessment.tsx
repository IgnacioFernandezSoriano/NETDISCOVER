import { trpc } from "@/lib/trpc";
import { useEffect, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { CheckCircle2, ChevronLeft, ChevronRight, Save, X, ArrowRight, Clock } from "lucide-react";
import { toast } from "sonner";

const ONE_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/108732851/74mCmCSQiyTeeGLMNvU8nA/one-for-regulators-white-crop_2d85c531.png";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuestionRow = {
  question: {
    id: number; slug: string; textEs: string; textEn: string;
    helpEs: string | null; helpEn: string | null;
    questionType: "yes_no" | "scale" | "multiple_choice" | "barrier";
    weight: string; phaseId: number;
    options: unknown;
  };
  phase: { id: number; slug: string; titleEs: string; titleEn: string; orderIndex: number };
};

// ─── Save Progress Modal ──────────────────────────────────────────────────────

function SaveProgressModal({
  onSave,
  onDismiss,
  isSaving,
}: {
  onSave: (email: string) => void;
  onDismiss: () => void;
  isSaving: boolean;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    onSave(email);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,34,64,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-sm w-full max-w-md shadow-2xl animate-fade-in-up">
        <div className="p-6 border-b" style={{ borderColor: "oklch(0.90 0.01 255)" }}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg" style={{ color: "var(--brand-navy)" }}>
              Save your progress
            </h3>
            <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-500 text-sm mb-5 leading-relaxed">
            Enter your email and we'll send you a private link to resume exactly where you left off.
            Your answers are saved securely for 30 days.
          </p>
          <label
            className="block text-xs font-semibold mb-2 uppercase tracking-wider"
            style={{ color: "var(--brand-navy)" }}
          >
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            placeholder="you@organization.org"
            className="w-full px-4 py-3 border rounded-sm text-sm focus:outline-none focus:ring-2 mb-1"
            style={{
              borderColor: error ? "var(--brand-red)" : "oklch(0.88 0.01 255)",
              outline: "none",
            }}
            autoFocus
          />
          {error && (
            <p className="text-xs mt-1 mb-3" style={{ color: "var(--brand-red)" }}>{error}</p>
          )}
          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={onDismiss}
              className="flex-1 py-2.5 text-sm font-medium border rounded-sm transition-colors"
              style={{ borderColor: "oklch(0.88 0.01 255)", color: "oklch(0.45 0.04 255)" }}
            >
              Continue without saving
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 text-sm font-semibold rounded-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "var(--brand-navy)", color: "white" }}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                <><Save size={14} /> Save & get link</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Question Component ───────────────────────────────────────────────────────

function QuestionCard({
  q,
  value,
  multiValue,
  onChange,
  onMultiChange,
  index,
  total,
}: {
  q: QuestionRow["question"];
  value: number | undefined;
  multiValue?: number[];
  onChange: (v: number) => void;
  onMultiChange?: (v: number[]) => void;
  index: number;
  total: number;
}) {
  const isYesNo = q.questionType === "yes_no";
  const isScale = q.questionType === "scale";
  const isBarrier = q.questionType === "barrier";
  const selected = multiValue ?? (value !== undefined ? [value] : []);

  const options = isYesNo
    ? [
        { value: 1,   label: "Yes — fully implemented" },
        { value: 0.5, label: "Partially — in progress" },
        { value: 0,   label: "No — not yet" },
      ]
    : isScale
    ? [1, 2, 3, 4].map(n => ({ value: n, label: String(n) }))
    : (() => {
        let opts = q.options;
        if (typeof opts === "string") {
          try { opts = JSON.parse(opts); } catch { opts = []; }
        }
        return (Array.isArray(opts) ? opts as { value: string; labelEn: string }[] : []).map((o, i) => ({
          value: i + 1,
          label: o.labelEn,
          strValue: o.value,
        }));
      })();

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold tracking-wider" style={{ color: "var(--brand-red)" }}>
          {index + 1} / {total}
        </span>
      </div>
      <h3
        className="text-xl font-semibold mb-2 leading-snug"
        style={{ color: "var(--brand-navy)", letterSpacing: "-0.01em" }}
      >
        {q.textEn}
      </h3>
      {q.helpEn && (
        <p className="text-sm text-gray-400 mb-6 leading-relaxed">{q.helpEn}</p>
      )}
      {!q.helpEn && <div className="mb-6" />}

      {isBarrier ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-sm" style={{ background: "oklch(0.97 0.01 255)", border: "1px solid oklch(0.88 0.01 255)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <rect x="1" y="1" width="5" height="5" rx="1" fill="var(--brand-navy)" opacity="0.7"/>
              <rect x="8" y="1" width="5" height="5" rx="1" fill="var(--brand-navy)" opacity="0.3"/>
              <rect x="1" y="8" width="5" height="5" rx="1" fill="var(--brand-navy)" opacity="0.3"/>
              <rect x="8" y="8" width="5" height="5" rx="1" fill="var(--brand-navy)" opacity="0.7"/>
            </svg>
            <p className="text-xs font-semibold" style={{ color: "var(--brand-navy)" }}>Select all that apply — you can choose multiple options</p>
          </div>
          {options.map(opt => {
            const isSelected = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  const next = isSelected ? selected.filter(v => v !== opt.value) : [...selected, opt.value];
                  onMultiChange?.(next);
                  // Also set single value to last selected for compatibility
                  if (next.length > 0) onChange(next[next.length - 1]);
                }}
                className={`answer-option${isSelected ? " selected" : ""}`}
              >
                <div
                  className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center transition-all border-2"
                  style={{
                    borderColor: isSelected ? "white" : "oklch(0.75 0.02 255)",
                    background: isSelected ? "rgba(255,255,255,0.3)" : "transparent",
                  }}
                >
                  {isSelected && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </div>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      ) : isScale ? (
        <div>
          <div className="flex gap-2 mb-2">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={`scale-option${value === opt.value ? " selected" : ""}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>Not at all</span>
            <span>Fully implemented</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`answer-option${value === opt.value ? " selected" : ""}`}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                style={{
                  borderColor: value === opt.value ? "white" : "oklch(0.75 0.02 255)",
                  background: "transparent",
                }}
              >
                {value === opt.value && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Assessment Page ─────────────────────────────────────────────────────

export default function Assessment() {
  const [, navigate] = useLocation();
  const searchStr = useSearch();
  const resumeToken = new URLSearchParams(searchStr).get("token");

  // ── All hooks must be declared before any conditional logic ──────────────
  const { data: allQuestions, isLoading } = trpc.model.getAllQuestions.useQuery();
  const { data: phases } = trpc.model.getPhases.useQuery();
  const saveProgressMutation = trpc.guest.saveProgress.useMutation();
  const { data: resumeSession } = trpc.guest.getSession.useQuery(
    { token: resumeToken! },
    { enabled: !!resumeToken }
  );

  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<number, number[]>>({});
  const [sessionToken, setSessionToken] = useState<string | null>(resumeToken);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingNav, setPendingNav] = useState<string | null>(null);
  const [showSectionEnd, setShowSectionEnd] = useState(false);
  const hasChanges = useRef(false);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Redirect to results if user already completed the assessment
  useEffect(() => {
    if (!resumeToken && localStorage.getItem("nd_last_result")) {
      navigate("/results");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore session from URL token
  useEffect(() => {
    if (resumeSession?.answers) {
      const saved = resumeSession.answers as Record<string, number>;
      const restored: Record<number, number> = {};
      for (const [k, v] of Object.entries(saved)) restored[parseInt(k)] = v;
      setAnswers(restored);
      setCurrentPhaseIdx(resumeSession.currentPhaseIndex ?? 0);
      toast.success("Progress restored — continue where you left off.");
    }
  }, [resumeSession]);

  // Auto-scroll tabs to center active tab when phase changes
  // MUST be here (before any early return) to comply with Rules of Hooks
  useEffect(() => {
    const tabsEl = tabsRef.current;
    if (!tabsEl) return;
    const activeTab = tabsEl.querySelector(".phase-tab.active") as HTMLElement;
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [currentPhaseIdx]);

  if (isLoading || !allQuestions || !phases) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--brand-navy)" }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Loading assessment…</p>
        </div>
      </div>
    );
  }

  // Group questions by phase
  const phaseGroups: Record<string, QuestionRow[]> = {};
  for (const q of allQuestions) {
    if (!phaseGroups[q.phase.slug]) phaseGroups[q.phase.slug] = [];
    phaseGroups[q.phase.slug].push(q);
  }

  const currentPhase = phases[currentPhaseIdx];
  const currentPhaseQs = currentPhase ? (phaseGroups[currentPhase.slug] ?? []) : [];
  const currentQuestion = currentPhaseQs[currentQIdx];

  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = allQuestions.length;
  const progressPct = Math.round((totalAnswered / totalQuestions) * 100);

  const isPhaseComplete = (slug: string) =>
    (phaseGroups[slug] ?? []).every(q => answers[q.question.id] !== undefined);

  const allComplete = phases.every(p => isPhaseComplete(p.slug));

  const handleAnswer = (value: number) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.question.id]: value }));
    hasChanges.current = true;
    // Auto-advance after brief delay (not for barrier — multi-select)
    if (currentQuestion.question.questionType !== "barrier") {
      setTimeout(() => {
        if (currentQIdx < currentPhaseQs.length - 1) {
          setCurrentQIdx(i => i + 1);
        } else if (currentPhaseIdx < phases.length - 1) {
          // Last question of phase — show end-of-section indicator
          setShowSectionEnd(true);
        }
      }, 280);
    }
  };

  const handleMultiAnswer = (questionId: number, values: number[]) => {
    setMultiAnswers(prev => ({ ...prev, [questionId]: values }));
    hasChanges.current = true;
  };

  const handleSaveProgress = async (email: string) => {
    setIsSaving(true);
    try {
      const result = await saveProgressMutation.mutateAsync({
        email,
        currentPhaseIndex: currentPhaseIdx,
        answers: Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v])),
        token: sessionToken ?? undefined,
      });
      setSessionToken(result.token);
      hasChanges.current = false;
      setShowSaveModal(false);
      toast.success(
        result.isNew
          ? "Progress saved! Check your email for the resume link."
          : "Progress updated."
      );
      if (pendingNav) navigate(pendingNav);
    } catch {
      toast.error("Could not save progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (currentQIdx > 0) {
      setCurrentQIdx(i => i - 1);
    } else if (currentPhaseIdx > 0) {
      const prevPhase = phases[currentPhaseIdx - 1];
      const prevQs = phaseGroups[prevPhase.slug] ?? [];
      setCurrentPhaseIdx(i => i - 1);
      setCurrentQIdx(prevQs.length - 1);
    }
  };

  const handleNext = () => {
    if (currentQIdx < currentPhaseQs.length - 1) {
      setCurrentQIdx(i => i + 1);
    } else if (currentPhaseIdx < phases.length - 1) {
      // Last question of phase — show end-of-section indicator
      setShowSectionEnd(true);
    }
  };

  const handleAdvanceToNextPhase = () => {
    setShowSectionEnd(false);
    setCurrentPhaseIdx(i => i + 1);
    setCurrentQIdx(0);
    // Scroll tabs to center the new active tab
    setTimeout(() => {
      const tabsEl = tabsRef.current;
      if (!tabsEl) return;
      const activeTab = tabsEl.querySelector(".phase-tab.active") as HTMLElement;
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }, 100);
  };

  const handleFinish = () => {
    sessionStorage.setItem("nd_answers", JSON.stringify(answers));
    sessionStorage.setItem("nd_token", sessionToken ?? "");
    navigate("/results");
  };

  const handleExit = () => {
    if (hasChanges.current && totalAnswered > 0) {
      setPendingNav("/");
      setShowSaveModal(true);
    } else {
      navigate("/");
    }
  };

  const isFirstQ = currentPhaseIdx === 0 && currentQIdx === 0;
  const currentValue = currentQuestion ? answers[currentQuestion.question.id] : undefined;
  const currentMultiValue = currentQuestion ? (multiAnswers[currentQuestion.question.id] ?? undefined) : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--brand-navy)" }}>
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={handleExit}
              className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm"
            >
              <ChevronLeft size={14} />
              Exit
            </button>
            <div className="w-px h-4 bg-white/20" />
            <img src={ONE_LOGO} alt="ONE for Regulators" className="h-4 opacity-70" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <Clock size={11} />
              <span>{totalAnswered}/{totalQuestions}</span>
            </div>
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm border transition-all hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}
            >
              <Save size={11} />
              Save progress
            </button>
          </div>
        </div>
        {/* Global progress */}
        <div className="h-0.5" style={{ background: "oklch(0.28 0.09 255)" }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: "var(--brand-red)" }}
          />
        </div>
      </div>

      {/* ── Phase tabs ───────────────────────────────────────────────────── */}
      <div
        className="border-b bg-white sticky top-0 z-10"
        style={{ borderColor: "oklch(0.90 0.01 255)" }}
      >
        <div className="container">
          <div className="flex overflow-x-auto" ref={tabsRef}>
            {phases.map((phase, idx) => {
              const done = isPhaseComplete(phase.slug);
              const active = idx === currentPhaseIdx;
              return (
                <button
                  key={phase.slug}
                  onClick={() => { setCurrentPhaseIdx(idx); setCurrentQIdx(0); }}
                  className={`phase-tab${active ? " active" : ""}${done && !active ? " completed" : ""}`}
                >
                  {done && !active ? (
                    <CheckCircle2 size={11} style={{ color: "oklch(0.55 0.15 145)", flexShrink: 0 }} />
                  ) : null}
                  <span
                    className="text-xs font-bold tracking-wider mr-1"
                    style={{ color: active ? "var(--brand-red)" : "oklch(0.75 0.02 255)" }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="hidden md:inline">{phase.titleEn}</span>
                  <span className="md:hidden">{phase.titleEn.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        <div className="container flex-1 flex flex-col py-10 max-w-2xl">

          {/* Phase header */}
          <div className="mb-8">
            <p className="section-label mb-3">
              Phase {String(currentPhaseIdx + 1).padStart(2, "0")} — {currentPhase?.titleEn}
            </p>
            {/* Question dots */}
            <div className="flex gap-1.5 flex-wrap">
              {currentPhaseQs.map((q, i) => {
                const answered = answers[q.question.id] !== undefined;
                const isCurrent = i === currentQIdx;
                return (
                  <button
                    key={q.question.id}
                    onClick={() => setCurrentQIdx(i)}
                    className={`wizard-step-dot${isCurrent ? " active" : ""}${answered && !isCurrent ? " completed" : ""}`}
                    title={`Question ${i + 1}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Question */}
          {currentQuestion ? (
            <div className="flex-1">
              <QuestionCard
                key={currentQuestion.question.id}
                q={currentQuestion.question}
                value={currentValue}
                multiValue={currentMultiValue}
                onChange={handleAnswer}
                onMultiChange={(vals) => currentQuestion && handleMultiAnswer(currentQuestion.question.id, vals)}
                index={currentQIdx}
                total={currentPhaseQs.length}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              No questions in this phase.
            </div>
          )}

          {/* Navigation */}
          <div
            className="flex items-center justify-between pt-8 mt-8 border-t"
            style={{ borderColor: "oklch(0.92 0.01 255)" }}
          >
            <button
              onClick={handleBack}
              disabled={isFirstQ}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-sm border transition-all disabled:opacity-30"
              style={{ borderColor: "oklch(0.88 0.01 255)", color: "oklch(0.40 0.04 255)" }}
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            <span className="text-xs text-gray-400">
              {currentQIdx + 1} of {currentPhaseQs.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-sm border transition-all hover:bg-gray-50"
                style={{ borderColor: "oklch(0.88 0.01 255)", color: "oklch(0.40 0.04 255)", background: "white" }}
              >
                <Save size={14} />
                Save
              </button>

              {allComplete ? (
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-sm transition-all hover:opacity-90"
                  style={{ background: "var(--brand-red)", color: "white" }}
                >
                  View Results
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={
                    currentPhaseIdx === phases.length - 1 &&
                    currentQIdx === currentPhaseQs.length - 1
                  }
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-sm transition-all disabled:opacity-30"
                  style={{ background: "var(--brand-navy)", color: "white" }}
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Partial results hint */}
          {totalAnswered >= Math.floor(totalQuestions * 0.7) && !allComplete && (
            <div className="mt-4 text-center">
              <button
                onClick={handleFinish}
                className="text-xs underline transition-colors"
                style={{ color: "oklch(0.60 0.04 255)" }}
              >
                Get partial results now ({progressPct}% complete)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── End of Section Overlay ───────────────────────────────────────── */}
      {showSectionEnd && currentPhase && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(10,34,64,0.75)", backdropFilter: "blur(6px)" }}
        >
          <div className="bg-white rounded-sm w-full max-w-md shadow-2xl text-center p-10">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "oklch(0.95 0.05 145)" }}
            >
              <CheckCircle2 size={28} style={{ color: "oklch(0.50 0.15 145)" }} />
            </div>
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--brand-red)" }}>
              Section complete
            </p>
            <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--brand-navy)", letterSpacing: "-0.02em" }}>
              {currentPhase.titleEn}
            </h3>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              You have completed all questions in this section.<br />
              Ready to continue to the next one?
            </p>
            <button
              onClick={handleAdvanceToNextPhase}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold rounded-sm transition-all hover:opacity-90"
              style={{ background: "var(--brand-navy)", color: "white" }}
            >
              Continue to next section
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setShowSectionEnd(false)}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Review answers in this section
            </button>
          </div>
        </div>
      )}

      {/* ── Save Modal ───────────────────────────────────────────────────── */}
      {showSaveModal && (
        <SaveProgressModal
          onSave={handleSaveProgress}
          onDismiss={() => { setShowSaveModal(false); setPendingNav(null); }}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
