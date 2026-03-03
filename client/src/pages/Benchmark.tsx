import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend
} from "recharts";
import {
  Activity, Award, ChevronLeft, Globe2, Map, Network,
  Settings2, Target, TrendingUp, Users, ArrowUp, ArrowDown, Minus
} from "lucide-react";
import { useMemo } from "react";

const PHASE_ICONS: Record<string, React.ElementType> = {
  phase1: Settings2, phase2: Map, phase3: Target,
  phase4: Network, phase5: Activity, phase6: TrendingUp, phase7: Award,
};
const PHASE_COLORS: Record<string, string> = {
  phase1: "#0077C8", phase2: "#7C3AED", phase3: "#059669",
  phase4: "#D97706", phase5: "#DC2626", phase6: "#DB2777", phase7: "#0891B2",
};

export default function Benchmark() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: benchmark, isLoading } = trpc.benchmark.getLatest.useQuery();
  const { data: phases } = trpc.model.getPhases.useQuery();
  const { data: assessments } = trpc.assessment.getMyAssessments.useQuery(undefined, { enabled: isAuthenticated });

  const latestCompleted = assessments?.find((a) => a.status === "completed");
  const myScores = latestCompleted?.scores as { global: number; byPhase: Record<string, number> } | null;

  const benchmarkData = benchmark?.data as {
    global: { avg: number; p25: number; p75: number; count: number };
    byPhase: Record<string, { avg: number; p25: number; p75: number; count: number }>;
  } | null;

  const radarData = useMemo(() => {
    if (!phases) return [];
    return phases.map((ph) => ({
      phase: ph.titleEn.split(" ")[0],
      slug: ph.slug,
      avg: benchmarkData?.byPhase[ph.slug]?.avg ?? 0,
      p75: benchmarkData?.byPhase[ph.slug]?.p75 ?? 0,
      mine: myScores?.byPhase[ph.slug] ?? 0,
      fullMark: 100,
    }));
  }, [phases, benchmarkData, myScores]);

  const barData = useMemo(() => {
    if (!phases) return [];
    return phases.map((ph) => ({
      name: ph.titleEn.split(" ").slice(0, 2).join(" "),
      slug: ph.slug,
      avg: Math.round(benchmarkData?.byPhase[ph.slug]?.avg ?? 0),
      p75: Math.round(benchmarkData?.byPhase[ph.slug]?.p75 ?? 0),
      mine: myScores?.byPhase[ph.slug] ?? 0,
    }));
  }, [phases, benchmarkData, myScores]);

  const vsAvg = myScores && benchmarkData ? myScores.global - benchmarkData.global.avg : null;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container py-3 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </button>
          <h1 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--brand-navy)" }}>
            <Globe2 className="w-4 h-4" style={{ color: "var(--brand-cyan)" }} />
            Regional Benchmark
          </h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container py-8 space-y-6">
        {/* Hero */}
        <div className="rounded-2xl p-6 md:p-8" style={{ background: "var(--brand-navy)" }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white mb-1">Regional Benchmark</h2>
              <p style={{ color: "oklch(0.72 0.03 255)" }} className="text-sm">
                Anonymous comparison of postal maturity across participating organizations.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 rounded-xl" style={{ background: "oklch(1 0 0 / 0.08)" }}>
                <div className="text-2xl font-black text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                  {benchmarkData?.global.count ?? 0}
                </div>
                <div className="text-xs" style={{ color: "oklch(0.65 0.03 255)" }}>Organizations</div>
              </div>
              <div className="text-center px-4 py-2 rounded-xl" style={{ background: "oklch(1 0 0 / 0.08)" }}>
                <div className="text-2xl font-black text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
                  {benchmarkData ? Math.round(benchmarkData.global.avg) : "—"}%
                </div>
                <div className="text-xs" style={{ color: "oklch(0.65 0.03 255)" }}>Regional Avg</div>
              </div>
              {myScores && vsAvg !== null && (
                <div className="text-center px-4 py-2 rounded-xl" style={{ background: "oklch(1 0 0 / 0.08)" }}>
                  <div className="text-2xl font-black flex items-center gap-1 justify-center"
                    style={{ color: vsAvg > 0 ? "var(--brand-green)" : vsAvg < 0 ? "#DC2626" : "white", fontFamily: "'Inter Tight', sans-serif" }}>
                    {vsAvg > 0 ? <ArrowUp className="w-5 h-5" /> : vsAvg < 0 ? <ArrowDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                    {Math.abs(Math.round(vsAvg))}%
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.65 0.03 255)" }}>vs Average</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {!benchmarkData || benchmarkData.global.count < 2 ? (
          <div className="bg-white rounded-2xl p-10 text-center" style={{ border: "1px solid var(--color-border)" }}>
            <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--color-muted-foreground)" }} />
            <h3 className="font-bold text-lg mb-2" style={{ color: "var(--brand-navy)" }}>
              Benchmark data building up
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              The regional benchmark will be available once more organizations complete their assessments.
              Your data contributes anonymously to the collective benchmark.
            </p>
            {!myScores && (
              <Button onClick={() => navigate("/assessment")} style={{ background: "var(--brand-navy)", color: "white" }}>
                Complete your assessment
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--color-border)" }}>
                <h3 className="font-bold text-sm mb-4" style={{ color: "var(--brand-navy)" }}>
                  Radar: Your Score vs Regional Average
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="oklch(0.91 0.01 255)" />
                    <PolarAngleAxis dataKey="phase" tick={{ fontSize: 11, fill: "oklch(0.50 0.04 255)" }} />
                    <Radar name="Regional Avg" dataKey="avg" stroke="oklch(0.75 0.04 255)"
                      fill="oklch(0.75 0.04 255)" fillOpacity={0.2} strokeDasharray="4 2" />
                    {myScores && (
                      <Radar name="Your Score" dataKey="mine" stroke="var(--brand-cyan)"
                        fill="var(--brand-cyan)" fillOpacity={0.25} strokeWidth={2} />
                    )}
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--color-border)" }}>
                <h3 className="font-bold text-sm mb-4" style={{ color: "var(--brand-navy)" }}>
                  Phase Comparison
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 24, left: -20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "oklch(0.55 0.04 255)" }} angle={-30} textAnchor="end" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(v: number, name: string) => [`${v}%`, name]}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="avg" name="Regional Avg" fill="oklch(0.82 0.03 255)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="p75" name="Top 25%" fill="oklch(0.72 0.06 220)" radius={[3, 3, 0, 0]} />
                    {myScores && (
                      <Bar dataKey="mine" name="Your Score" radius={[3, 3, 0, 0]}>
                        {barData.map((entry) => (
                          <Cell key={entry.slug} fill={PHASE_COLORS[entry.slug] ?? "var(--brand-cyan)"} />
                        ))}
                      </Bar>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Phase detail table */}
            <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--color-border)" }}>
              <h3 className="font-bold text-sm mb-4" style={{ color: "var(--brand-navy)" }}>
                Phase-by-Phase Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <th className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground">Phase</th>
                      <th className="text-center py-2 px-2 text-xs font-semibold text-muted-foreground">Avg</th>
                      <th className="text-center py-2 px-2 text-xs font-semibold text-muted-foreground">P25</th>
                      <th className="text-center py-2 px-2 text-xs font-semibold text-muted-foreground">P75</th>
                      {myScores && <th className="text-center py-2 px-2 text-xs font-semibold text-muted-foreground">Yours</th>}
                      {myScores && <th className="text-center py-2 px-2 text-xs font-semibold text-muted-foreground">vs Avg</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {phases?.map((ph) => {
                      const bd = benchmarkData?.byPhase[ph.slug];
                      const mine = myScores?.byPhase[ph.slug];
                      const diff = mine !== undefined && bd ? mine - bd.avg : null;
                      const Icon = PHASE_ICONS[ph.slug] ?? Settings2;
                      const color = PHASE_COLORS[ph.slug] ?? "var(--brand-navy)";
                      return (
                        <tr key={ph.slug} style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                                style={{ background: `${color}18`, color }}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs font-medium" style={{ color: "var(--brand-navy)" }}>
                                {ph.titleEn}
                              </span>
                            </div>
                          </td>
                          <td className="text-center py-3 px-2 text-xs font-semibold">{bd ? Math.round(bd.avg) : "—"}%</td>
                          <td className="text-center py-3 px-2 text-xs text-muted-foreground">{bd ? Math.round(bd.p25) : "—"}%</td>
                          <td className="text-center py-3 px-2 text-xs text-muted-foreground">{bd ? Math.round(bd.p75) : "—"}%</td>
                          {myScores && <td className="text-center py-3 px-2 text-xs font-bold" style={{ color }}>{mine ?? "—"}%</td>}
                          {myScores && (
                            <td className="text-center py-3 px-2">
                              {diff !== null ? (
                                <span className="text-xs font-semibold"
                                  style={{ color: diff > 0 ? "var(--brand-green)" : diff < 0 ? "#DC2626" : "var(--color-muted-foreground)" }}>
                                  {diff > 0 ? "+" : ""}{Math.round(diff)}%
                                </span>
                              ) : "—"}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* CTA */}
        {!myScores && (
          <div className="rounded-2xl p-6 text-center" style={{ background: "var(--brand-navy)" }}>
            <p className="text-white font-semibold mb-2">Complete your assessment to see your position</p>
            <p style={{ color: "oklch(0.72 0.03 255)" }} className="text-sm mb-4">
              Your results will be anonymously added to the regional benchmark.
            </p>
            <Button onClick={() => navigate("/assessment")} style={{ background: "var(--brand-cyan)", color: "white" }}>
              Start Assessment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
