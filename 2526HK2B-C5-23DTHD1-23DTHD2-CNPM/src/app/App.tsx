import { useState } from "react";
import {
  Search,
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Shield,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Bell,
  Pill,
  Activity,
  Users,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Check,
  Info,
} from "lucide-react";

type Screen = "home" | "register" | "profile" | "admin";

const NAV_ITEMS: { id: Screen; label: string }[] = [
  { id: "home", label: "Drug Checker" },
  { id: "register", label: "Register" },
  { id: "profile", label: "My Profile" },
  { id: "admin", label: "Admin" },
];

const SAMPLE_DRUGS = [
  "Warfarin",
  "Aspirin",
  "Metformin",
  "Lisinopril",
  "Atorvastatin",
  "Omeprazole",
  "Amoxicillin",
  "Sertraline",
  "Metoprolol",
  "Gabapentin",
];

type Severity = "severe" | "moderate" | "mild" | "none";

interface Interaction {
  drug1: string;
  drug2: string;
  severity: Severity;
  description: string;
}

const MOCK_INTERACTIONS: Interaction[] = [
  {
    drug1: "Warfarin",
    drug2: "Aspirin",
    severity: "severe",
    description:
      "Concurrent use significantly increases bleeding risk. Monitor INR closely or avoid combination.",
  },
  {
    drug1: "Sertraline",
    drug2: "Aspirin",
    severity: "moderate",
    description:
      "Increased risk of gastrointestinal bleeding. Consider gastroprotective agent or alternative.",
  },
  {
    drug1: "Metformin",
    drug2: "Lisinopril",
    severity: "mild",
    description:
      "Slight risk of hypoglycemia. Monitor blood glucose levels more frequently.",
  },
  {
    drug1: "Atorvastatin",
    drug2: "Amoxicillin",
    severity: "none",
    description: "No clinically significant interaction identified.",
  },
];

const SEVERITY_CONFIG = {
  severe: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    badge: "bg-red-100 text-red-700",
    label: "Severe",
    dot: "bg-red-500",
  },
  moderate: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    badge: "bg-amber-100 text-amber-700",
    label: "Moderate",
    dot: "bg-amber-500",
  },
  mild: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: <Info className="w-5 h-5 text-yellow-600" />,
    badge: "bg-yellow-100 text-yellow-700",
    label: "Mild",
    dot: "bg-yellow-400",
  },
  none: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    badge: "bg-green-100 text-green-700",
    label: "No Interaction",
    dot: "bg-green-500",
  },
};

// ─── Drug Tag ───────────────────────────────────────────────────────────────

function DrugTag({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#0072b1]/10 text-[#0072b1] text-sm font-medium font-['DM_Sans'] border border-[#0072b1]/20">
      <Pill className="w-3.5 h-3.5" />
      {name}
      <button
        onClick={onRemove}
        className="ml-0.5 hover:text-red-500 transition-colors"
        aria-label={`Remove ${name}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}

// ─── Interaction Result Card ─────────────────────────────────────────────────

function InteractionCard({ interaction }: { interaction: Interaction }) {
  const cfg = SEVERITY_CONFIG[interaction.severity];
  return (
    <div className={`rounded-md border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-foreground font-['DM_Sans']">
              {interaction.drug1}
            </span>
            <span className="text-muted-foreground text-sm">+</span>
            <span className="font-semibold text-foreground font-['DM_Sans']">
              {interaction.drug2}
            </span>
            <span
              className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full font-['DM_Mono'] ${cfg.badge}`}
            >
              {cfg.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {interaction.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Home / Checker Screen ────────────────────────────────────────────────────

function HomeScreen() {
  const [query, setQuery] = useState("");
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<Interaction[] | null>(null);
  const [checked, setChecked] = useState(false);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim().length > 0) {
      setSuggestions(
        SAMPLE_DRUGS.filter(
          (d) =>
            d.toLowerCase().startsWith(val.toLowerCase()) &&
            !selectedDrugs.includes(d)
        ).slice(0, 5)
      );
    } else {
      setSuggestions([]);
    }
  };

  const addDrug = (drug: string) => {
    if (!selectedDrugs.includes(drug)) {
      setSelectedDrugs((prev) => [...prev, drug]);
    }
    setQuery("");
    setSuggestions([]);
    setChecked(false);
    setResults(null);
  };

  const removeDrug = (drug: string) => {
    setSelectedDrugs((prev) => prev.filter((d) => d !== drug));
    setChecked(false);
    setResults(null);
  };

  const checkInteractions = () => {
    if (selectedDrugs.length < 2) return;
    const found: Interaction[] = [];
    for (let i = 0; i < selectedDrugs.length; i++) {
      for (let j = i + 1; j < selectedDrugs.length; j++) {
        const mock = MOCK_INTERACTIONS.find(
          (m) =>
            (m.drug1 === selectedDrugs[i] && m.drug2 === selectedDrugs[j]) ||
            (m.drug1 === selectedDrugs[j] && m.drug2 === selectedDrugs[i])
        );
        if (mock) {
          found.push(mock);
        } else {
          found.push({
            drug1: selectedDrugs[i],
            drug2: selectedDrugs[j],
            severity: "none",
            description:
              "No clinically significant interaction identified in our database. Consult a pharmacist for complete guidance.",
          });
        }
      }
    }
    setResults(found);
    setChecked(true);
  };

  const hasSevere = results?.some((r) => r.severity === "severe");
  const hasModerate = results?.some((r) => r.severity === "moderate");

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0d1b2a]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0072b1]/30 via-transparent to-[#00a896]/20 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#0072b1]/20 border border-[#0072b1]/30 text-[#7ec8f0] text-xs font-['DM_Mono'] font-medium mb-6 tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                CLINICALLY VALIDATED DATABASE
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold text-white font-['DM_Sans'] leading-tight mb-4">
                Check medication safety with confidence
              </h1>
              <p className="text-[#a8c4d8] text-lg leading-relaxed mb-8">
                Instantly identify drug-drug interactions, contraindications, and
                dosage conflicts. Trusted by 50,000+ healthcare professionals
                worldwide.
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[#7ec8f0] text-sm font-['DM_Mono']">
                  <Activity className="w-4 h-4" />
                  12,000+ drug pairs
                </div>
                <div className="flex items-center gap-2 text-[#7ec8f0] text-sm font-['DM_Mono']">
                  <CheckCircle className="w-4 h-4" />
                  FDA & EMA sourced
                </div>
              </div>
            </div>
            {/* Hero stats panel */}
            <div className="hidden md:block">
              <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-4">
                <p className="text-xs font-['DM_Mono'] text-[#7ec8f0] tracking-widest uppercase mb-4">
                  Today's Checks
                </p>
                {[
                  { label: "Checks Performed", value: "84,231", trend: "+12%" },
                  { label: "Interactions Flagged", value: "3,419", trend: "+5%" },
                  { label: "Severe Alerts", value: "142", trend: "-3%" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
                  >
                    <span className="text-[#a8c4d8] text-sm font-['DM_Sans']">
                      {stat.label}
                    </span>
                    <div className="text-right">
                      <span className="text-white font-semibold font-['DM_Mono'] text-lg">
                        {stat.value}
                      </span>
                      <span className="ml-2 text-xs text-[#00a896] font-['DM_Mono']">
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Checker Tool */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-card rounded-lg border border-border shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded bg-[#0072b1]/10 flex items-center justify-center">
              <Pill className="w-5 h-5 text-[#0072b1]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold font-['DM_Sans'] text-foreground">
                Interaction Checker
              </h2>
              <p className="text-sm text-muted-foreground">
                Add two or more medications to check for interactions
              </p>
            </div>
          </div>

          {/* Drug Input */}
          <div className="relative mb-4">
            <div className="flex items-center gap-2 w-full rounded-md border border-border bg-input-background px-4 py-3 focus-within:ring-2 focus-within:ring-[#0072b1]/30 focus-within:border-[#0072b1] transition-all">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && query.trim()) {
                    addDrug(
                      suggestions.length > 0 ? suggestions[0] : query.trim()
                    );
                  }
                }}
                placeholder="Type a drug name (e.g. Warfarin, Aspirin...)"
                className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground font-['DM_Sans'] text-sm"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setSuggestions([]); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-md shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => addDrug(s)}
                    className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary font-['DM_Sans'] flex items-center gap-2 transition-colors"
                  >
                    <Pill className="w-3.5 h-3.5 text-[#0072b1]" />
                    {s}
                    <span className="ml-auto text-xs text-muted-foreground font-['DM_Mono']">
                      Add
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected drug tags */}
          {selectedDrugs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedDrugs.map((d) => (
                <DrugTag key={d} name={d} onRemove={() => removeDrug(d)} />
              ))}
            </div>
          )}

          {/* Quick-add pills */}
          <div className="mb-6">
            <p className="text-xs text-muted-foreground font-['DM_Mono'] mb-2 tracking-wider uppercase">
              Common medications
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_DRUGS.filter((d) => !selectedDrugs.includes(d))
                .slice(0, 6)
                .map((d) => (
                  <button
                    key={d}
                    onClick={() => addDrug(d)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-border text-sm text-muted-foreground hover:border-[#0072b1] hover:text-[#0072b1] transition-colors font-['DM_Sans']"
                  >
                    <Plus className="w-3 h-3" />
                    {d}
                  </button>
                ))}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={checkInteractions}
            disabled={selectedDrugs.length < 2}
            className="w-full md:w-auto px-8 py-3.5 rounded bg-[#0072b1] text-white font-semibold font-['DM_Sans'] text-sm flex items-center justify-center gap-2 hover:bg-[#005f96] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Shield className="w-4 h-4" />
            Check Interactions
            {selectedDrugs.length >= 2 && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-white/20 text-xs font-['DM_Mono']">
                {selectedDrugs.length} drugs
              </span>
            )}
          </button>

          {selectedDrugs.length === 1 && (
            <p className="mt-2 text-xs text-muted-foreground font-['DM_Sans']">
              Add at least one more medication to check interactions.
            </p>
          )}
        </div>

        {/* Results */}
        {checked && results && (
          <div className="mt-6">
            {/* Summary banner */}
            <div
              className={`rounded-lg border p-4 mb-4 flex items-center gap-3 ${
                hasSevere
                  ? "bg-red-50 border-red-200"
                  : hasModerate
                  ? "bg-amber-50 border-amber-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              {hasSevere ? (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              ) : hasModerate ? (
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              )}
              <div>
                <p
                  className={`font-semibold font-['DM_Sans'] ${
                    hasSevere
                      ? "text-red-800"
                      : hasModerate
                      ? "text-amber-800"
                      : "text-green-800"
                  }`}
                >
                  {hasSevere
                    ? "Severe interaction detected — immediate review recommended"
                    : hasModerate
                    ? "Moderate interaction found — consult prescriber"
                    : "No significant interactions found"}
                </p>
                <p
                  className={`text-sm mt-0.5 ${
                    hasSevere
                      ? "text-red-600"
                      : hasModerate
                      ? "text-amber-600"
                      : "text-green-600"
                  }`}
                >
                  {results.length} pair{results.length !== 1 ? "s" : ""} analyzed
                  across {selectedDrugs.length} medications
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {results
                .sort((a, b) => {
                  const order = { severe: 0, moderate: 1, mild: 2, none: 3 };
                  return order[a.severity] - order[b.severity];
                })
                .map((r, i) => (
                  <InteractionCard key={i} interaction={r} />
                ))}
            </div>

            <p className="mt-4 text-xs text-muted-foreground font-['DM_Sans'] border-t border-border pt-4">
              <strong>Disclaimer:</strong> This tool is for informational purposes
              only and does not constitute medical advice. Always consult a
              qualified healthcare professional before making clinical decisions.
            </p>
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-[#0d1b2a] py-14">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-['DM_Mono'] text-[#5a7089] tracking-widest uppercase mb-8">
            Why MedCheck Pro
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield className="w-6 h-6 text-[#0072b1]" />,
                title: "Clinically Validated",
                desc: "Data sourced from FDA, EMA, and peer-reviewed pharmacological studies. Updated weekly.",
              },
              {
                icon: <Activity className="w-6 h-6 text-[#00a896]" />,
                title: "Real-Time Alerts",
                desc: "Instant severity classification: mild, moderate, or severe — with actionable clinical guidance.",
              },
              {
                icon: <Users className="w-6 h-6 text-[#7ec8f0]" />,
                title: "Role-Based Access",
                desc: "Tailored views for patients, pharmacists, and physicians with appropriate data access controls.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-white/8 bg-white/4 p-6"
              >
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold font-['DM_Sans'] mb-2">
                  {f.title}
                </h3>
                <p className="text-[#a8c4d8] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Register Screen ──────────────────────────────────────────────────────────

function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accountType, setAccountType] = useState<"patient" | "professional">(
    "patient"
  );
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold font-['DM_Sans'] text-foreground mb-2">
            Account created
          </h2>
          <p className="text-muted-foreground">
            Welcome to MedCheck Pro. A verification email has been sent to{" "}
            <strong>{form.email}</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Left panel */}
        <div className="hidden md:block pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#0072b1]/10 border border-[#0072b1]/20 text-[#0072b1] text-xs font-['DM_Mono'] tracking-wider mb-6">
            <Lock className="w-3.5 h-3.5" />
            SECURE REGISTRATION
          </div>
          <h2 className="text-3xl font-semibold font-['DM_Sans'] text-foreground leading-tight mb-4">
            Join 50,000+ healthcare professionals
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Create your account to save drug history, set personal medication
            profiles, and access advanced clinical interaction data.
          </p>
          <div className="space-y-4">
            {[
              { icon: <Shield className="w-4 h-4 text-[#0072b1]" />, text: "HIPAA-compliant data storage" },
              { icon: <CheckCircle className="w-4 h-4 text-[#00a896]" />, text: "Role-specific data access controls" },
              { icon: <Bell className="w-4 h-4 text-[#0072b1]" />, text: "Personalized drug alert notifications" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm text-foreground font-['DM_Sans']">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-lg border border-border shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-semibold font-['DM_Sans'] text-foreground mb-1">
            Create account
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Fill in your details to get started
          </p>

          {/* Account type toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2 font-['DM_Sans']">
              Account Type
            </label>
            <div className="grid grid-cols-2 rounded-md border border-border p-1 bg-muted gap-1">
              {(["patient", "professional"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setAccountType(type)}
                  className={`py-2 rounded text-sm font-medium font-['DM_Sans'] transition-all ${
                    accountType === type
                      ? "bg-card text-[#0072b1] shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type === "patient" ? "Patient" : "Healthcare Professional"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 font-['DM_Sans']">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder={accountType === "professional" ? "Dr. Sarah Mitchell" : "Alex Johnson"}
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-border bg-input-background text-foreground placeholder-muted-foreground text-sm font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#0072b1]/30 focus:border-[#0072b1] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 font-['DM_Sans']">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="sarah.mitchell@hospital.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-border bg-input-background text-foreground placeholder-muted-foreground text-sm font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#0072b1]/30 focus:border-[#0072b1] transition-all"
                />
              </div>
            </div>

            {accountType === "professional" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 font-['DM_Sans']">
                  License / Registration Number
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="NPI-1234567890"
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-border bg-input-background text-foreground placeholder-muted-foreground text-sm font-['DM_Mono'] focus:outline-none focus:ring-2 focus:ring-[#0072b1]/30 focus:border-[#0072b1] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 font-['DM_Sans']">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 12 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-md border border-border bg-input-background text-foreground placeholder-muted-foreground text-sm font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#0072b1]/30 focus:border-[#0072b1] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-1.5 flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        form.password.length > i * 3
                          ? form.password.length >= 12
                            ? "bg-green-500"
                            : form.password.length >= 8
                            ? "bg-amber-400"
                            : "bg-red-400"
                          : "bg-border"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5 font-['DM_Sans']">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-md border border-border bg-input-background text-foreground placeholder-muted-foreground text-sm font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#0072b1]/30 focus:border-[#0072b1] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {form.confirm && form.password && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    {form.confirm === form.password ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <X className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (form.fullName && form.email && form.password) setSubmitted(true);
            }}
            className="w-full mt-6 py-3 rounded bg-[#0072b1] text-white font-semibold font-['DM_Sans'] text-sm hover:bg-[#005f96] transition-colors"
          >
            Create Account
          </button>

          <p className="text-xs text-center text-muted-foreground mt-4 font-['DM_Sans']">
            By registering, you agree to our{" "}
            <span className="text-[#0072b1] cursor-pointer hover:underline">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-[#0072b1] cursor-pointer hover:underline">
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────

const SAVED_MEDS = ["Metformin 500mg", "Lisinopril 10mg", "Atorvastatin 20mg"];
const ALLERGIES = ["Penicillin", "Sulfonamides"];

function ProfileScreen() {
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left: avatar + nav */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-card rounded-lg border border-border p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 rounded-full bg-[#0072b1]/10 border-2 border-[#0072b1]/30 flex items-center justify-center mx-auto">
                <span className="text-2xl font-semibold text-[#0072b1] font-['DM_Sans']">
                  SM
                </span>
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#0072b1] text-white flex items-center justify-center hover:bg-[#005f96] transition-colors">
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
            <h3 className="font-semibold text-foreground font-['DM_Sans']">
              Dr. Sarah Mitchell
            </h3>
            <p className="text-sm text-muted-foreground font-['DM_Mono']">
              Pharmacist
            </p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#0072b1]/10 text-[#0072b1] text-xs font-['DM_Mono']">
              Verified Professional
            </span>
          </div>

          {/* Stats */}
          <div className="bg-card rounded-lg border border-border p-5 space-y-3">
            {[
              { label: "Checks Run", value: "1,247" },
              { label: "Interactions Flagged", value: "83" },
              { label: "Member Since", value: "Mar 2023" },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-['DM_Sans']">
                  {s.label}
                </span>
                <span className="text-sm font-semibold text-foreground font-['DM_Mono']">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: details */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal info */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-foreground font-['DM_Sans']">
                Personal Information
              </h3>
              <button
                onClick={() => setEditMode((e) => !e)}
                className={`flex items-center gap-1.5 text-sm font-medium font-['DM_Sans'] px-3 py-1.5 rounded border transition-colors ${
                  editMode
                    ? "bg-[#0072b1] text-white border-[#0072b1]"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                {editMode ? "Save" : "Edit"}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Full Name", value: "Dr. Sarah Mitchell", icon: <User className="w-4 h-4" /> },
                { label: "Email", value: "s.mitchell@generalhosp.org", icon: <Mail className="w-4 h-4" /> },
                { label: "Phone", value: "+1 (555) 012-3456", icon: <Phone className="w-4 h-4" /> },
                { label: "License No.", value: "NPI-4827619305", icon: <FileText className="w-4 h-4" /> },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-['DM_Mono'] text-muted-foreground uppercase tracking-wider mb-1.5">
                    {field.label}
                  </label>
                  {editMode ? (
                    <input
                      defaultValue={field.value}
                      className="w-full px-3 py-2 rounded border border-border bg-input-background text-foreground text-sm font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#0072b1]/30 focus:border-[#0072b1]"
                    />
                  ) : (
                    <div className="flex items-center gap-2 py-2 text-sm text-foreground font-['DM_Sans']">
                      <span className="text-muted-foreground">{field.icon}</span>
                      {field.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Saved Medications */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground font-['DM_Sans']">
                Saved Medications
              </h3>
              <button className="flex items-center gap-1 text-sm text-[#0072b1] hover:text-[#005f96] font-['DM_Sans']">
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {SAVED_MEDS.map((med) => (
                <div
                  key={med}
                  className="flex items-center justify-between px-3 py-2.5 rounded border border-border bg-secondary/50"
                >
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-[#0072b1]" />
                    <span className="text-sm font-['DM_Sans'] text-foreground">{med}</span>
                  </div>
                  <button className="text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Allergy Information */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground font-['DM_Sans']">
                Known Allergies
              </h3>
              <button className="flex items-center gap-1 text-sm text-[#0072b1] hover:text-[#005f96] font-['DM_Sans']">
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ALLERGIES.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm font-['DM_Sans']"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {a}
                  <button className="ml-0.5 hover:text-red-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "Patient" | "Pharmacist" | "Doctor" | "System Admin";
  canAddDrug: boolean;
  canViewHistory: boolean;
  canManageUsers: boolean;
  status: "Active" | "Suspended";
}

const INITIAL_USERS: AdminUser[] = [
  { id: 1, name: "Dr. Sarah Mitchell", email: "s.mitchell@generalhosp.org", role: "Doctor", canAddDrug: true, canViewHistory: true, canManageUsers: false, status: "Active" },
  { id: 2, name: "James Nguyen", email: "j.nguyen@rxcare.com", role: "Pharmacist", canAddDrug: true, canViewHistory: true, canManageUsers: false, status: "Active" },
  { id: 3, name: "Emma Rodriguez", email: "emma.r@patient.com", role: "Patient", canAddDrug: false, canViewHistory: false, canManageUsers: false, status: "Active" },
  { id: 4, name: "Admin Root", email: "admin@medcheckpro.com", role: "System Admin", canAddDrug: true, canViewHistory: true, canManageUsers: true, status: "Active" },
  { id: 5, name: "Dr. Kevin Park", email: "k.park@clinic.net", role: "Doctor", canAddDrug: false, canViewHistory: true, canManageUsers: false, status: "Suspended" },
  { id: 6, name: "Priya Patel", email: "priya.p@patient.com", role: "Patient", canAddDrug: false, canViewHistory: false, canManageUsers: false, status: "Active" },
];

const ROLE_COLORS: Record<string, string> = {
  Patient: "bg-blue-50 text-blue-700 border-blue-200",
  Pharmacist: "bg-teal-50 text-teal-700 border-teal-200",
  Doctor: "bg-purple-50 text-purple-700 border-purple-200",
  "System Admin": "bg-slate-100 text-slate-700 border-slate-200",
};

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex items-center w-10 h-5 rounded-full transition-colors ${
        checked ? "bg-[#0072b1]" : "bg-switch-background"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function AdminScreen() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_USERS);
  const [filterRole, setFilterRole] = useState("All");

  const toggle = (
    id: number,
    field: "canAddDrug" | "canViewHistory" | "canManageUsers"
  ) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: !u[field] } : u))
    );
  };

  const filtered =
    filterRole === "All" ? users : users.filter((u) => u.role === filterRole);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold font-['DM_Sans'] text-foreground">
            User Management
          </h2>
          <p className="text-muted-foreground text-sm mt-1 font-['DM_Sans']">
            Manage roles and permissions for all platform users
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Summary chips */}
          <div className="hidden md:flex items-center gap-2">
            {[
              { label: "Total", value: users.length, color: "text-foreground" },
              { label: "Active", value: users.filter(u => u.status === "Active").length, color: "text-green-600" },
              { label: "Suspended", value: users.filter(u => u.status === "Suspended").length, color: "text-red-600" },
            ].map((s) => (
              <div key={s.label} className="text-center px-4 py-2 rounded bg-card border border-border">
                <p className={`text-lg font-semibold font-['DM_Mono'] ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground font-['DM_Sans']">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["All", "Patient", "Pharmacist", "Doctor", "System Admin"].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium font-['DM_Sans'] border transition-colors ${
              filterRole === r
                ? "bg-[#0072b1] text-white border-[#0072b1]"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_repeat(3,_auto)_auto] gap-4 px-5 py-3 bg-muted border-b border-border text-xs font-['DM_Mono'] text-muted-foreground uppercase tracking-wider">
          <span>User</span>
          <span className="min-w-[100px]">Role</span>
          <span className="min-w-[100px] text-center">Add Drug Data</span>
          <span className="min-w-[110px] text-center">View Pt. History</span>
          <span className="min-w-[110px] text-center">Manage Users</span>
          <span className="min-w-[80px] text-center">Status</span>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-border">
          {filtered.map((user) => (
            <div
              key={user.id}
              className={`grid grid-cols-[1fr_auto_repeat(3,_auto)_auto] gap-4 px-5 py-4 items-center hover:bg-secondary/40 transition-colors ${
                user.status === "Suspended" ? "opacity-60" : ""
              }`}
            >
              {/* User info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#0072b1]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-[#0072b1] font-['DM_Sans']">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground font-['DM_Sans'] truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-['DM_Mono'] truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Role badge */}
              <div className="min-w-[100px]">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border font-['DM_Sans'] ${
                    ROLE_COLORS[user.role]
                  }`}
                >
                  {user.role}
                </span>
              </div>

              {/* Toggle: Add Drug Data */}
              <div className="min-w-[100px] flex justify-center">
                <Toggle
                  checked={user.canAddDrug}
                  onChange={() => toggle(user.id, "canAddDrug")}
                  disabled={user.status === "Suspended" || user.role === "Patient"}
                />
              </div>

              {/* Toggle: View History */}
              <div className="min-w-[110px] flex justify-center">
                <Toggle
                  checked={user.canViewHistory}
                  onChange={() => toggle(user.id, "canViewHistory")}
                  disabled={user.status === "Suspended"}
                />
              </div>

              {/* Toggle: Manage Users */}
              <div className="min-w-[110px] flex justify-center">
                <Toggle
                  checked={user.canManageUsers}
                  onChange={() => toggle(user.id, "canManageUsers")}
                  disabled={user.status === "Suspended" || user.role !== "System Admin"}
                />
              </div>

              {/* Status */}
              <div className="min-w-[80px] flex justify-center">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium font-['DM_Mono'] ${
                    user.status === "Active"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      user.status === "Active" ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  {user.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground font-['DM_Sans']">
        Toggle switches update permissions in real time. Grayed-out controls indicate the permission is not applicable for that role.
      </p>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-background font-['DM_Sans']"
      style={{ scrollbarWidth: "none" }}
    >
      {/* Top navigation */}
      <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setScreen("home")}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded bg-[#0072b1] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-foreground font-['DM_Sans'] text-base tracking-tight">
              MedCheck<span className="text-[#0072b1]">Pro</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors font-['DM_Sans'] ${
                  screen === item.id
                    ? "bg-[#0072b1]/10 text-[#0072b1]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-border text-sm text-foreground cursor-pointer hover:bg-secondary transition-colors">
              <div className="w-6 h-6 rounded-full bg-[#0072b1]/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-[#0072b1]">SM</span>
              </div>
              <span className="font-['DM_Sans']">Dr. Mitchell</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : (
              <div className="flex flex-col gap-1.5">
                <span className="block w-5 h-0.5 bg-current" />
                <span className="block w-5 h-0.5 bg-current" />
                <span className="block w-5 h-0.5 bg-current" />
              </div>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-6 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => { setScreen(item.id); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded text-sm font-medium transition-colors font-['DM_Sans'] ${
                  screen === item.id
                    ? "bg-[#0072b1]/10 text-[#0072b1]"
                    : "text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Screen content */}
      <main>
        {screen === "home" && <HomeScreen />}
        {screen === "register" && <RegisterScreen />}
        {screen === "profile" && <ProfileScreen />}
        {screen === "admin" && <AdminScreen />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#0072b1] flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-foreground font-['DM_Sans']">
              MedCheckPro
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-['DM_Sans'] text-center">
            For informational use only. Not a substitute for professional medical advice. © 2025 MedCheckPro Inc.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground font-['DM_Sans']">
            <span className="hover:text-foreground cursor-pointer">Privacy</span>
            <span className="hover:text-foreground cursor-pointer">Terms</span>
            <span className="hover:text-foreground cursor-pointer">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
