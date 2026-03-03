import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";
import { useState } from "react";
import {
  Activity, Award, CheckCircle2, ChevronLeft, ChevronRight,
  Clock, Map as MapIcon, Network, Settings2, Target, TrendingUp
} from "lucide-react";

const PHASE_ICONS: Record<string, React.ElementType> = {
  phase1: Settings2, phase2: MapIcon, phase3: Target,
  phase4: Network, phase5: Activity, phase6: TrendingUp, phase7: Award,
};
const PHASE_COLORS: Record<string, string> = {
  phase1: "#0077C8", phase2: "#7C3AED", phase3: "#059669",
  phase4: "#D97706", phase5: "#DC2626", phase6: "#DB2777", phase7: "#0891B2",
};
const HORIZON_COLORS = { short: "#DC2626", medium: "#D97706", long: "#059669" };
const PRIORITY_COLORS = { high: "#DC2626", medium: "#D97706", low: "#059669" };

type Action = {
  id: string; phaseSlug: string; titleEn: string; titleEs: string;
  descriptionEn: string; descriptionEs: string;
  priority: "high" | "medium" | "low"; horizon: "short" | "medium" | "long";
  effort: "high" | "medium" | "low"; impact: "high" | "medium" | "low";
};

export default function Progress() {
  const { id } = useParams<{ id: string }>();
  const assessmentId = parseInt(id ?? "0");
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  const { data: assessment } = trpc.assessment.getById.useQuery({ id: assessmentId }, { enabled: !!assessmentId });
  const { data: progressData, refetch } = trpc.progress.getForAssessment.useQuery({ assessmentId }, { enabled: !!assessmentId });
  const { data: phases } = trpc.model.getPhases.useQuery();
  const upsertMutation = trpc.progress.upsert.useMutation({ onSuccess: () => refetch() });

  const actionPlan = (assessment?.actionPlan as Action[] | null) ?? [];
  const scores = assessment?.scores as { global: number; byPhase: Record<string, number> } | null;

  type ProgressItem = NonNullable<typeof progressData>[number];
  const progressMap: Map<string, ProgressItem> = new Map(
    (progressData ?? []).map((p) => [p.actionId, p])
  );
  const completedCount = actionPlan.filter((a) => progressMap.get(a.id)?.completed).length;
  const pct = actionPlan.length > 0 ? Math.round((completedCount / actionPlan.length) * 100) : 0;

  const handleToggle = async (actionId: string, currentCompleted: boolean) => {
    await upsertMutation.mutateAsync({
      assessmentId,
      actionId,
      completed: !currentCompleted,
    });
    toast.success(!currentCompleted ? "Action marked as complete!" : "Action marked as pending.");
  };

  const handleSaveNotes = async (actionId: string) => {
    await upsertMutation.mutateAsync({
      assessmentId,
      actionId,
      completed: progressMap.get(actionId)?.completed ?? false,
      notes: notesValue,
    });
    setEditingNotes(null);
    toast.success("Notes saved.");
  };

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--brand-cyan)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container py-3 flex items-center justify-between">
          <button onClick={() => navigate(`/results/${assessmentId}`)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" /> Results
          </button>
          <h1 className="text-base font-bold" style={{ color: "var(--brand-navy)" }}>Action Plan Progress</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container py-8 space-y-6">
        {/* Progress summary */}
        <div className="rounded-2xl p-6" style={{ background: "var(--brand-navy)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-white mb-1">Your Action Plan</h2>
              <p style={{ color: "oklch(0.72 0.03 255)" }} className="text-sm">
                {completedCount} of {actionPlan.length} actions completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                {pct}%
              </div>
              <div className="text-xs" style={{ color: "oklch(0.65 0.03 255)" }}>Progress</div>
            </div>
          </div>
          <div className="h-2 rounded-full" style={{ background: "oklch(1 0 0 / 0.15)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: "var(--brand-green)" }} />
          </div>
          {pct === 100 && (
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" style={{ color: "var(--brand-green)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--brand-green)" }}>
                All actions completed! Consider a re-evaluation to measure your improvement.
              </span>
            </div>
          )}
        </div>

        {/* Action list */}
        <div className="space-y-3">
          {actionPlan.map((action, i) => {
            const progress = progressMap.get(action.id);
            const isCompleted = progress?.completed ?? false;
            const ph = phases?.find((p) => p.slug === action.phaseSlug);
            const Icon = PHASE_ICONS[action.phaseSlug] ?? Settings2;
            const phColor = PHASE_COLORS[action.phaseSlug] ?? "var(--brand-navy)";
            const horizonColor = HORIZON_COLORS[action.horizon];
            const priorityColor = PRIORITY_COLORS[action.priority];
            const isEditingThis = editingNotes === action.id;

            return (
              <div key={action.id} className="bg-white rounded-2xl p-5 transition-all"
                style={{
                  border: `1px solid ${isCompleted ? "oklch(0.85 0.12 130)" : "var(--color-border)"}`,
                  opacity: isCompleted ? 0.8 : 1,
                }}>
                <div className="flex items-start gap-3">
                  {/* Toggle button */}
                  <button onClick={() => handleToggle(action.id, isCompleted)}
                    className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: isCompleted ? "var(--brand-green)" : "transparent",
                      border: `2px solid ${isCompleted ? "var(--brand-green)" : "var(--color-border)"}`,
                    }}>
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-bold leading-snug"
                        style={{ color: "var(--brand-navy)", textDecoration: isCompleted ? "line-through" : "none" }}>
                        {action.titleEn}
                      </h3>
                      <span className="text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded-full"
                        style={{ background: `${priorityColor}18`, color: priorityColor }}>
                        {action.priority}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                      {action.descriptionEn}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                        style={{ background: `${phColor}18`, color: phColor }}>
                        <Icon className="w-3 h-3" />
                        {ph?.titleEn.split(" ")[0]}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                        style={{ background: `${horizonColor}18`, color: horizonColor }}>
                        <Clock className="w-3 h-3" />
                        {action.horizon}-term
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                        style={{ background: "oklch(0.93 0.04 220)", color: "var(--brand-navy)" }}>
                        {action.impact} impact
                      </span>
                    </div>

                    {/* Notes */}
                    {isEditingThis ? (
                      <div className="mt-2">
                        <textarea
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder="Add your notes here..."
                          className="w-full text-xs p-2 rounded-lg resize-none focus:outline-none"
                          style={{ border: "1px solid var(--brand-cyan)", minHeight: 64, background: "oklch(0.97 0.01 220)" }}
                          rows={3}
                        />
                        <div className="flex gap-2 mt-1.5">
                          <Button size="sm" className="text-xs" style={{ background: "var(--brand-navy)", color: "white" }}
                            onClick={() => handleSaveNotes(action.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs"
                            onClick={() => setEditingNotes(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {progress?.notes && (
                          <p className="text-xs italic text-muted-foreground mb-1.5 p-2 rounded-lg"
                            style={{ background: "oklch(0.97 0.01 220)" }}>
                            "{progress.notes}"
                          </p>
                        )}
                        <button
                          onClick={() => { setEditingNotes(action.id); setNotesValue(progress?.notes ?? ""); }}
                          className="text-xs font-medium transition-colors"
                          style={{ color: "var(--brand-cyan)" }}>
                          {progress?.notes ? "Edit notes" : "+ Add notes"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Re-evaluate CTA */}
        {pct >= 50 && (
          <div className="rounded-2xl p-6 text-center" style={{ background: "var(--brand-navy)" }}>
            <TrendingUp className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--brand-cyan)" }} />
            <h3 className="font-bold text-white mb-2">Ready to measure your improvement?</h3>
            <p style={{ color: "oklch(0.72 0.03 255)" }} className="text-sm mb-4">
              You've completed {pct}% of your action plan. Start a new assessment to see how much you've improved.
            </p>
            <Button onClick={() => navigate("/assessment")} style={{ background: "var(--brand-cyan)", color: "white" }}>
              Start Re-evaluation <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
