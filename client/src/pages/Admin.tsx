import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { useState } from "react";
import {
  Activity, BarChart3, ChevronLeft, Download, RefreshCw,
  ShieldCheck, Users, Mail, Globe2, CheckCircle2, Clock
} from "lucide-react";

export default function Admin() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<"stats" | "users" | "leads">("stats");

  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const { data: users, isLoading: usersLoading } = trpc.admin.getUsers.useQuery(
    { limit: 100, offset: 0 },
    { enabled: isAuthenticated && user?.role === "admin" && tab === "users" }
  );
  const { data: leads, isLoading: leadsLoading } = trpc.admin.getLeads.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin" && tab === "leads",
  });
  const recomputeMutation = trpc.admin.recomputeBenchmark.useMutation({
    onSuccess: () => toast.success("Benchmark recomputed successfully."),
    onError: () => toast.error("Error recomputing benchmark."),
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <ShieldCheck className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--color-muted-foreground)" }} />
          <p className="font-semibold mb-1" style={{ color: "var(--brand-navy)" }}>Admin access required</p>
          <p className="text-sm text-muted-foreground mb-4">You don't have permission to access this page.</p>
          <Button onClick={() => navigate("/dashboard")} style={{ background: "var(--brand-navy)", color: "white" }}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data?.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(","), ...data.map((row) => keys.map((k) => JSON.stringify(row[k] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container py-3 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </button>
          <h1 className="text-base font-bold flex items-center gap-2" style={{ color: "var(--brand-navy)" }}>
            <ShieldCheck className="w-4 h-4" style={{ color: "var(--brand-cyan)" }} />
            Admin Panel
          </h1>
          <Button size="sm" variant="outline" onClick={() => recomputeMutation.mutate()}
            disabled={recomputeMutation.isPending}
            className="flex items-center gap-1.5 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${recomputeMutation.isPending ? "animate-spin" : ""}`} />
            Recompute Benchmark
          </Button>
        </div>
      </header>

      <div className="container py-8 space-y-6">
        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Users", value: stats.totalUsers, icon: Users, color: "var(--brand-navy)" },
              { label: "Completed Assessments", value: stats.completedAssessments, icon: CheckCircle2, color: "var(--brand-green)" },
              { label: "Total Assessments", value: stats.totalAssessments, icon: Clock, color: "#D97706" },
              { label: "Provider Contacts", value: stats.totalContacts, icon: Mail, color: "var(--brand-cyan)" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-xl p-4"
                  style={{ border: "1px solid var(--color-border)", borderTop: `3px solid ${stat.color}` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                    <Icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                  <div className="text-2xl font-extrabold" style={{ color: "var(--brand-navy)", fontFamily: "'Inter Tight', sans-serif" }}>
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--color-muted)" }}>
          {[
            { key: "stats", label: "Overview", icon: BarChart3 },
            { key: "users", label: "Users", icon: Users },
            { key: "leads", label: "Leads", icon: Mail },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: tab === t.key ? "white" : "transparent",
                  color: tab === t.key ? "var(--brand-navy)" : "var(--color-muted-foreground)",
                  boxShadow: tab === t.key ? "0 1px 4px oklch(0.22 0.08 255 / 0.1)" : "none",
                }}>
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Users table */}
        {tab === "users" && (
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--color-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm" style={{ color: "var(--brand-navy)" }}>
                Registered Users ({users?.length ?? 0})
              </h3>
              <Button size="sm" variant="outline" className="text-xs flex items-center gap-1"
                onClick={() => exportCSV(users as unknown as Record<string, unknown>[] ?? [], "netdiscover-users.csv")}>
                <Download className="w-3.5 h-3.5" /> Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {["Name", "Email", "Organization", "Country", "Entity", "Role", "Joined"].map((h) => (
                      <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr><td colSpan={7} className="py-8 text-center text-muted-foreground text-sm">Loading...</td></tr>
                  ) : users?.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td className="py-2.5 pr-4 text-xs font-medium" style={{ color: "var(--brand-navy)" }}>{u.name ?? "—"}</td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground">{u.email ?? "—"}</td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground">{u.organization ?? "—"}</td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground">{u.country ?? "—"}</td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground">{u.entityType ?? "—"}</td>
                      <td className="py-2.5 pr-4">
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: u.role === "admin" ? "var(--brand-navy)" : "oklch(0.93 0.04 220)",
                            color: u.role === "admin" ? "white" : "var(--brand-navy)",
                          }}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-muted-foreground">
                        {format(new Date(u.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leads table */}
        {tab === "leads" && (
          <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--color-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm" style={{ color: "var(--brand-navy)" }}>
                Provider Contacts / Leads ({leads?.length ?? 0})
              </h3>
              <Button size="sm" variant="outline" className="text-xs flex items-center gap-1"
                onClick={() => exportCSV(leads as unknown as Record<string, unknown>[] ?? [], "netdiscover-leads.csv")}>
                <Download className="w-3.5 h-3.5" /> Export CSV
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {["Provider", "User", "Organization", "Country", "Date"].map((h) => (
                      <th key={h} className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leadsLoading ? (
                    <tr><td colSpan={5} className="py-8 text-center text-muted-foreground text-sm">Loading...</td></tr>
                  ) : leads?.map((lead) => {
                    const profile = lead.leadProfile as { name?: string; organization?: string; country?: string } | null;
                    return (
                      <tr key={lead.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                        <td className="py-2.5 pr-4 text-xs font-medium" style={{ color: "var(--brand-navy)" }}>
                          Provider #{lead.providerId}
                        </td>
                        <td className="py-2.5 pr-4 text-xs text-muted-foreground">{profile?.name ?? "—"}</td>
                        <td className="py-2.5 pr-4 text-xs text-muted-foreground">{profile?.organization ?? "—"}</td>
                        <td className="py-2.5 pr-4 text-xs text-muted-foreground">{profile?.country ?? "—"}</td>
                        <td className="py-2.5 text-xs text-muted-foreground">
                          {format(new Date(lead.createdAt), "MMM d, yyyy")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Overview tab */}
        {tab === "stats" && stats && (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--color-border)" }}>
              <h3 className="font-bold text-sm mb-4" style={{ color: "var(--brand-navy)" }}>Platform Summary</h3>
              <div className="space-y-3">
                {[
                  { label: "Total registered users", value: stats.totalUsers },
                  { label: "Completed assessments", value: stats.completedAssessments },
                  { label: "Total assessments", value: stats.totalAssessments },
                  { label: "Provider contact requests", value: stats.totalContacts },
                  { label: "Completion rate", value: stats.totalUsers > 0 ? `${Math.round((stats.completedAssessments / stats.totalUsers) * 100)}%` : "—" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2"
                    style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-bold" style={{ color: "var(--brand-navy)" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--color-border)" }}>
              <h3 className="font-bold text-sm mb-4" style={{ color: "var(--brand-navy)" }}>Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { label: "Recompute Regional Benchmark", icon: RefreshCw, action: () => recomputeMutation.mutate() },
                  { label: "Export All Users", icon: Download, action: () => exportCSV(users as unknown as Record<string, unknown>[] ?? [], "users.csv") },
                  { label: "Export All Leads", icon: Mail, action: () => exportCSV(leads as unknown as Record<string, unknown>[] ?? [], "leads.csv") },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} onClick={item.action}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-muted/50"
                      style={{ border: "1px solid var(--color-border)" }}>
                      <Icon className="w-4 h-4" style={{ color: "var(--brand-cyan)" }} />
                      <span className="text-sm font-medium" style={{ color: "var(--brand-navy)" }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
