import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  Activity, Award, ChevronLeft, ExternalLink, Mail,
  Map, Network, Settings2, Target, TrendingUp, Users, Star
} from "lucide-react";

const PHASE_ICONS: Record<string, React.ElementType> = {
  phase1: Settings2, phase2: Map, phase3: Target,
  phase4: Network, phase5: Activity, phase6: TrendingUp, phase7: Award,
};
const PHASE_COLORS: Record<string, string> = {
  phase1: "#0077C8", phase2: "#7C3AED", phase3: "#059669",
  phase4: "#D97706", phase5: "#DC2626", phase6: "#DB2777", phase7: "#0891B2",
};

const CATEGORY_LABELS: Record<string, string> = {
  technology: "Technology", consulting: "Consulting", training: "Training",
  measurement: "Measurement", rfid: "RFID", platform: "Platform", other: "Other",
};
const CATEGORY_COLORS: Record<string, string> = {
  technology: "#0077C8", consulting: "#7C3AED", training: "#059669",
  measurement: "#D97706", rfid: "#DC2626", platform: "#0891B2", other: "#6B7280",
};

export default function Market() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [contactingId, setContactingId] = useState<number | null>(null);

  const { data: providers, isLoading } = trpc.market.getProviders.useQuery();
  const { data: phases } = trpc.model.getPhases.useQuery();
  const { data: assessments } = trpc.assessment.getMyAssessments.useQuery(undefined, { enabled: isAuthenticated });
  const contactMutation = trpc.market.contactProvider.useMutation();

  const latestCompleted = assessments?.find((a) => a.status === "completed");

  const filtered = providers?.filter((p) => {
    const catOk = selectedCategory === "all" || p.category === selectedCategory;
    const phaseOk = selectedPhase === "all" || (p.relevantPhases as string[] | null)?.includes(selectedPhase);
    return catOk && phaseOk;
  }) ?? [];

  const categories = Array.from(new Set(providers?.map((p) => p.category) ?? []));

  const handleContact = async (providerId: number) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to contact providers.");
      return;
    }
    setContactingId(providerId);
    try {
      await contactMutation.mutateAsync({
        providerId,
        assessmentId: latestCompleted?.id,
        message: "I'm interested in learning more about your services.",
      });
      toast.success("Contact request sent! The provider will reach out to you.");
    } catch {
      toast.error("Error sending contact request. Please try again.");
    } finally {
      setContactingId(null);
    }
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
            <Award className="w-4 h-4" style={{ color: "var(--brand-cyan)" }} />
            Market Catalog
          </h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container py-8 space-y-6">
        {/* Hero */}
        <div className="rounded-2xl p-6 md:p-8" style={{ background: "var(--brand-navy)" }}>
          <h2 className="text-2xl font-extrabold text-white mb-2">Solutions for every maturity level</h2>
          <p style={{ color: "oklch(0.72 0.03 255)" }} className="text-sm max-w-xl">
            Find measurement systems, RFID technology, platforms and specialized consultants
            matched to your postal quality improvement needs.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid var(--color-border)" }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Category</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setSelectedCategory("all")}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: selectedCategory === "all" ? "var(--brand-navy)" : "var(--color-muted)",
                    color: selectedCategory === "all" ? "white" : "var(--color-muted-foreground)",
                  }}>
                  All
                </button>
                {categories.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: selectedCategory === cat ? CATEGORY_COLORS[cat] : "var(--color-muted)",
                      color: selectedCategory === cat ? "white" : "var(--color-muted-foreground)",
                    }}>
                    {CATEGORY_LABELS[cat] ?? cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Phase</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setSelectedPhase("all")}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: selectedPhase === "all" ? "var(--brand-navy)" : "var(--color-muted)",
                    color: selectedPhase === "all" ? "white" : "var(--color-muted-foreground)",
                  }}>
                  All
                </button>
                {phases?.map((ph) => (
                  <button key={ph.slug} onClick={() => setSelectedPhase(ph.slug)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: selectedPhase === ph.slug ? PHASE_COLORS[ph.slug] : "var(--color-muted)",
                      color: selectedPhase === ph.slug ? "white" : "var(--color-muted-foreground)",
                    }}>
                    P{ph.orderIndex}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Provider grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse h-48"
                style={{ border: "1px solid var(--color-border)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center" style={{ border: "1px solid var(--color-border)" }}>
            <Users className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-muted-foreground)" }} />
            <p className="font-semibold mb-1" style={{ color: "var(--brand-navy)" }}>No providers found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((provider) => {
              const relevantPhases = (provider.relevantPhases as string[] | null) ?? [];
              const catColor = CATEGORY_COLORS[provider.category] ?? "#6B7280";
              return (
                <div key={provider.id} className="bg-white rounded-2xl p-5 flex flex-col"
                  style={{ border: "1px solid var(--color-border)", boxShadow: "0 2px 8px oklch(0.22 0.08 255 / 0.06)" }}>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {provider.featured && (
                          <Star className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#D97706" }} fill="#D97706" />
                        )}
                        <h3 className="font-bold text-sm truncate" style={{ color: "var(--brand-navy)" }}>
                          {provider.nameEn}
                        </h3>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: `${catColor}18`, color: catColor }}>
                        {CATEGORY_LABELS[provider.category]}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">
                    {provider.descriptionEn ?? "Specialized provider for postal quality improvement."}
                  </p>

                  {/* Relevant phases */}
                  {relevantPhases.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {relevantPhases.map((slug) => {
                        const ph = phases?.find((p) => p.slug === slug);
                        const Icon = PHASE_ICONS[slug] ?? Settings2;
                        const color = PHASE_COLORS[slug] ?? "var(--brand-navy)";
                        return (
                          <span key={slug} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                            style={{ background: `${color}18`, color }}>
                            <Icon className="w-3 h-3" />
                            {ph?.titleEn.split(" ")[0]}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                    <Button size="sm" className="flex-1 text-xs font-semibold"
                      style={{ background: "var(--brand-navy)", color: "white" }}
                      onClick={() => handleContact(provider.id)}
                      disabled={contactingId === provider.id}>
                      <Mail className="w-3.5 h-3.5 mr-1" />
                      {contactingId === provider.id ? "Sending..." : "Contact"}
                    </Button>
                    {provider.website && (
                      <Button size="sm" variant="outline" className="text-xs"
                        onClick={() => window.open(provider.website!, "_blank")}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA for providers */}
        <div className="rounded-2xl p-6 text-center" style={{ background: "var(--color-section-alt)", border: "1px solid var(--color-border)" }}>
          <h3 className="font-bold mb-2" style={{ color: "var(--brand-navy)" }}>Are you a provider?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            List your solutions in the NetDiscover catalog and reach postal regulators and operators across the region.
          </p>
          <Button variant="outline" style={{ borderColor: "var(--brand-navy)", color: "var(--brand-navy)" }}>
            <Mail className="w-4 h-4 mr-2" /> Contact us to list your services
          </Button>
        </div>
      </div>
    </div>
  );
}
