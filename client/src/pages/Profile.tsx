import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { ChevronLeft, User, Building2, Globe2, Phone, Briefcase, Save } from "lucide-react";

const ENTITY_TYPES = [
  { value: "regulator", label: "Postal Regulator" },
  { value: "public_operator", label: "Public Postal Operator" },
  { value: "private_operator", label: "Private Postal Operator" },
  { value: "consultant", label: "Consultant / Advisor" },
  { value: "other", label: "Other" },
];

const COUNTRIES = [
  "Argentina", "Bolivia", "Brazil", "Chile", "Colombia", "Costa Rica", "Cuba",
  "Dominican Republic", "Ecuador", "El Salvador", "Guatemala", "Honduras",
  "Mexico", "Nicaragua", "Panama", "Paraguay", "Peru", "Uruguay", "Venezuela",
  "Spain", "Portugal", "United States", "Other",
];

export default function Profile() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    country: "",
    entityType: "" as "regulator" | "public_operator" | "private_operator" | "consultant" | "other" | "",
    jobTitle: "",
    organization: "",
    phone: "",
    preferredLang: "en" as "es" | "en",
  });

  const updateMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => toast.success("Profile updated successfully."),
    onError: () => toast.error("Error updating profile. Please try again."),
  });

  useEffect(() => {
    if (user) {
      setForm({
        country: user.country ?? "",
        entityType: (user.entityType as typeof form.entityType) ?? "",
        jobTitle: user.jobTitle ?? "",
        organization: user.organization ?? "",
        phone: user.phone ?? "",
        preferredLang: (user.preferredLang as "es" | "en") ?? "en",
      });
    }
  }, [user]);

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      country: form.country || undefined,
      entityType: form.entityType || undefined,
      jobTitle: form.jobTitle || undefined,
      organization: form.organization || undefined,
      phone: form.phone || undefined,
      preferredLang: form.preferredLang,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="container py-3 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" /> Dashboard
          </button>
          <h1 className="text-base font-bold" style={{ color: "var(--brand-navy)" }}>My Profile</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container py-8 max-w-2xl">
        {/* Avatar card */}
        <div className="bg-white rounded-2xl p-6 mb-5 flex items-center gap-4"
          style={{ border: "1px solid var(--color-border)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
            style={{ background: "var(--brand-navy)" }}>
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--brand-navy)" }}>{user?.name ?? "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email ?? ""}</p>
            <p className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
              style={{ background: "oklch(0.93 0.04 220)", color: "var(--brand-navy)" }}>
              {user?.role === "admin" ? "Administrator" : "User"}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid var(--color-border)" }}>
          <h3 className="font-bold text-sm mb-5" style={{ color: "var(--brand-navy)" }}>
            Organization Information
          </h3>

          <div className="space-y-4">
            {/* Organization */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Organization
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  placeholder="Your organization name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{ border: "1px solid var(--color-border)", background: "white" }}
                />
              </div>
            </div>

            {/* Entity type */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Entity Type
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={form.entityType}
                  onChange={(e) => setForm({ ...form, entityType: e.target.value as typeof form.entityType })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none appearance-none"
                  style={{ border: "1px solid var(--color-border)", background: "white" }}>
                  <option value="">Select entity type</option>
                  {ENTITY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Job title */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Job Title
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  placeholder="Your position"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{ border: "1px solid var(--color-border)", background: "white" }}
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Country
              </label>
              <div className="relative">
                <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none appearance-none"
                  style={{ border: "1px solid var(--color-border)", background: "white" }}>
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Phone (optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none"
                  style={{ border: "1px solid var(--color-border)", background: "white" }}
                />
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                Preferred Language
              </label>
              <div className="flex gap-2">
                {[{ value: "en", label: "English" }, { value: "es", label: "Español" }].map((lang) => (
                  <button key={lang.value} onClick={() => setForm({ ...form, preferredLang: lang.value as "es" | "en" })}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all border-2"
                    style={{
                      borderColor: form.preferredLang === lang.value ? "var(--brand-cyan)" : "var(--color-border)",
                      background: form.preferredLang === lang.value ? "var(--brand-cyan)" : "white",
                      color: form.preferredLang === lang.value ? "white" : "var(--brand-navy)",
                    }}>
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--color-border)" }}>
            <Button onClick={handleSave} className="w-full font-semibold flex items-center justify-center gap-2"
              style={{ background: "var(--brand-navy)", color: "white" }}
              disabled={updateMutation.isPending}>
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
