import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { format } from "date-fns";
import {
  Activity, Award, BarChart3, ChevronRight, Globe2, LogOut,
  Map, Network, Plus, Settings2, Target, TrendingUp, User, Zap,
  CheckCircle2, Clock, AlertTriangle, ShieldCheck
} from "lucide-react";

const PHASE_ICONS: Record<string, React.ElementType> = {
  phase1: Settings2, phase2: Map, phase3: Target,
  phase4: Network, phase5: Activity, phase6: TrendingUp, phase7: Award,
};
const PHASE_COLORS: Record<string, string> = {
  phase1: "#0077C8", phase2: "#7C3AED", phase3: "#059669",
  phase4: "#D97706", phase5: "#DC2626", phase6: "#DB2777", phase7: "#0891B2",
};

function MaturityBadge({ score }: { score: number }) {
  const level = score < 20 ? "initial" : score < 40 ? "developing" : score < 60 ? "defined" : score < 80 ? "managed" : "optimized";
  const configs = {
    initial:    { label: "Initial",    bg: "oklch(0.93 0.01 255)", color: "oklch(0.45 0.04 255)" },
    developing: { label: "Developing", bg: "oklch(0.95 0.08 70)",  color: "oklch(0.50 0.15 70)" },
    defined:    { label: "Defined",    bg: "oklch(0.93 0.08 220)", color: "oklch(0.40 0.15 220)" },
    managed:    { label: "Managed",    bg: "oklch(0.92 0.10 130)", color: "oklch(0.38 0.18 130)" },
    optimized:  { label: "Optimized",  bg: "var(--brand-navy)",    color: "white" },
  };
  const cfg = configs[level];
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, navigate] = useLocation();

  const { data: assessments, isLoading } = trpc.assessment.getMyAssessments.useQuery(
    undefined, { enabled: isAuthenticated }
  );
  const { data: phases } = trpc.model.getPhases.useQuery();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: "var(--brand-cyan)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--brand-navy)" }}>
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--brand-navy)" }}>Sign in required</h2>
          <p className="text-muted-foreground text-sm mb-6">Please sign in to access your dashboard.</p>
          <Button asChild className="w-full font-semibold" style={{ background: "var(--brand-navy)", color: "white" }}>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const completedAssessments = assessments?.filter((a) => a.status === "completed") ?? [];
  const inProgressAssessment = assessments?.find((a) => a.status === "in_progress");
  const latestCompleted = completedAssessments[0];
  const latestScores = latestCompleted?.scores as { global: number; byPhase: Record<string, number> } | null;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      {/* ── Sidebar + Main layout ── */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 sticky top-0 h-screen"
          style={{ background: "var(--brand-navy)", borderRight: "1px solid oklch(1 0 0 / 0.1)" }}>
          {/* Logo */}
          <div className="p-5 border-b" style={{ borderColor: "oklch(1 0 0 / 0.1)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--brand-cyan)" }}>
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-base text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                  Net<span style={{ color: "var(--brand-cyan)" }}>Discover</span>
                </span>
                <p className="text-xs" style={{ color: "oklch(0.60 0.03 255)" }}>Postal Maturity</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {[
              { icon: BarChart3, label: "Dashboard", href: "/dashboard", active: true },
              { icon: CheckCircle2, label: "Assessment", href: "/assessment" },
              { icon: Globe2, label: "Benchmark", href: "/benchmark" },
              { icon: Award, label: "Market", href: "/market" },
              { icon: User, label: "Profile", href: "/profile" },
              ...(user?.role === "admin" ? [{ icon: ShieldCheck, label: "Admin", href: "/admin" }] : []),
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.href} onClick={() => navigate(item.href)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: item.active ? "oklch(1 0 0 / 0.1)" : "transparent",
                    color: item.active ? "white" : "oklch(0.70 0.03 255)",
                  }}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User */}
          <div className="p-3 border-t" style={{ borderColor: "oklch(1 0 0 / 0.1)" }}>
            <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: "var(--brand-cyan)" }}>
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name ?? "User"}</p>
                <p className="text-xs truncate" style={{ color: "oklch(0.60 0.03 255)" }}>{user?.email ?? ""}</p>
              </div>
            </div>
            <button onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
              style={{ color: "oklch(0.60 0.03 255)" }}>
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile header */}
          <header className="lg:hidden bg-white border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-navy)" }}>
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-extrabold text-base" style={{ color: "var(--brand-navy)", fontFamily: "'Inter Tight', sans-serif" }}>
                Net<span style={{ color: "var(--brand-cyan)" }}>Discover</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate("/profile")} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "var(--brand-cyan)" }}>
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </button>
            </div>
          </header>

          <div className="p-4 md:p-6 lg:p-8 space-y-6">
            {/* Welcome */}
            <div>
              <h1 className="text-2xl font-extrabold" style={{ color: "var(--brand-navy)" }}>
                Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {latestCompleted
                  ? `Last assessment: ${format(new Date(latestCompleted.completedAt ?? latestCompleted.createdAt), "MMM d, yyyy")}`
                  : "Start your first postal maturity assessment"}
              </p>
            </div>

            {/* In-progress banner */}
            {inProgressAssessment && (
              <div className="rounded-xl p-4 flex items-center justify-between gap-4"
                style={{ background: "oklch(0.95 0.08 70)", border: "1px solid oklch(0.88 0.12 70)" }}>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 flex-shrink-0" style={{ color: "#D97706" }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#92400E" }}>Assessment in progress</p>
                    <p className="text-xs" style={{ color: "#B45309" }}>
                      Started {format(new Date(inProgressAssessment.createdAt), "MMM d")} · Phase {(inProgressAssessment.currentPhaseIndex ?? 0) + 1} of 7
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={() => navigate("/assessment")}
                  style={{ background: "#D97706", color: "white" }}>
                  Continue <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Assessments", value: completedAssessments.length, icon: CheckCircle2, color: "var(--brand-green)" },
                { label: "Latest Score", value: latestScores ? `${latestScores.global}%` : "—", icon: BarChart3, color: "var(--brand-cyan)" },
                { label: "Maturity Level", value: latestScores ? (latestScores.global < 40 ? "Developing" : latestScores.global < 60 ? "Defined" : latestScores.global < 80 ? "Managed" : "Optimized") : "—", icon: Award, color: "var(--brand-navy)" },
                { label: "Actions Pending", value: latestCompleted?.actionPlan ? (latestCompleted.actionPlan as unknown[]).length : "—", icon: AlertTriangle, color: "#D97706" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white rounded-xl p-4"
                    style={{ border: "1px solid var(--color-border)", borderTop: `3px solid ${stat.color}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                      <Icon className="w-4 h-4" style={{ color: stat.color }} />
                    </div>
                    <div className="text-xl font-extrabold" style={{ color: "var(--brand-navy)", fontFamily: "'Inter Tight', sans-serif" }}>
                      {stat.value}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Latest results + CTA */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Latest assessment */}
              {latestCompleted && latestScores ? (
                <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--color-border)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm" style={{ color: "var(--brand-navy)" }}>Latest Assessment</h3>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/results/${latestCompleted.id}`)}
                      className="text-xs flex items-center gap-1" style={{ color: "var(--brand-cyan)" }}>
                      View full results <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl font-black" style={{ color: "var(--brand-navy)", fontFamily: "'Inter Tight', sans-serif" }}>
                      {latestScores.global}%
                    </div>
                    <div>
                      <MaturityBadge score={latestScores.global} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(latestCompleted.completedAt ?? latestCompleted.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {phases?.slice(0, 4).map((ph) => {
                      const s = latestScores.byPhase[ph.slug] ?? 0;
                      const color = PHASE_COLORS[ph.slug] ?? "var(--brand-navy)";
                      return (
                        <div key={ph.slug} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-24 truncate">{ph.titleEn.split(" ")[0]}</span>
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--color-muted)" }}>
                            <div className="h-full rounded-full" style={{ width: `${s}%`, background: color }} />
                          </div>
                          <span className="text-xs font-semibold w-8 text-right" style={{ color }}>{s}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-5 flex flex-col items-center justify-center text-center"
                  style={{ border: "2px dashed var(--color-border)", minHeight: 200 }}>
                  <BarChart3 className="w-10 h-10 mb-3" style={{ color: "var(--color-muted-foreground)" }} />
                  <p className="text-sm font-semibold text-foreground mb-1">No assessments yet</p>
                  <p className="text-xs text-muted-foreground mb-4">Complete your first assessment to see results here.</p>
                  <Button size="sm" onClick={() => navigate("/assessment")}
                    style={{ background: "var(--brand-navy)", color: "white" }}>
                    Start Assessment
                  </Button>
                </div>
              )}

              {/* Quick actions */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm" style={{ color: "var(--brand-navy)" }}>Quick Actions</h3>
                {[
                  { icon: Plus, label: "New Assessment", desc: "Start a fresh evaluation", href: "/assessment", color: "var(--brand-navy)" },
                  { icon: Globe2, label: "View Benchmark", desc: "Compare with regional peers", href: "/benchmark", color: "var(--brand-cyan)" },
                  { icon: Award, label: "Explore Market", desc: "Find solutions for your gaps", href: "/market", color: "var(--brand-green)" },
                  { icon: TrendingUp, label: "Track Progress", desc: "Update your action plan", href: latestCompleted ? `/progress/${latestCompleted.id}` : "/assessment", color: "#D97706" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} onClick={() => navigate(item.href)}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white text-left transition-all hover:-translate-y-0.5"
                      style={{ border: "1px solid var(--color-border)", boxShadow: "0 1px 4px oklch(0.22 0.08 255 / 0.05)" }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${item.color}18`, color: item.color }}>
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--brand-navy)" }}>{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assessment history */}
            {completedAssessments.length > 1 && (
              <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--color-border)" }}>
                <h3 className="font-bold text-sm mb-4" style={{ color: "var(--brand-navy)" }}>Assessment History</h3>
                <div className="space-y-2">
                  {completedAssessments.map((a, i) => {
                    const s = a.scores as { global: number } | null;
                    const prev = completedAssessments[i + 1]?.scores as { global: number } | null;
                    const diff = s && prev ? s.global - prev.global : null;
                    return (
                      <button key={a.id} onClick={() => navigate(`/results/${a.id}`)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-muted/50">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: "var(--brand-navy)" }}>
                          #{completedAssessments.length - i}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold" style={{ color: "var(--brand-navy)" }}>
                            {format(new Date(a.completedAt ?? a.createdAt), "MMMM d, yyyy")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {diff !== null && (
                            <span className="text-xs font-semibold" style={{ color: diff > 0 ? "var(--brand-green)" : "#DC2626" }}>
                              {diff > 0 ? "+" : ""}{diff}%
                            </span>
                          )}
                          {s && <MaturityBadge score={s.global} />}
                          <span className="text-sm font-bold" style={{ color: "var(--brand-navy)" }}>
                            {s?.global ?? 0}%
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
