import { useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronUp,
  Database,
  Droplets,
  FileText,
  Globe,
  Search,
  Shield,
  ShieldCheck,
  Star,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import Loader from "../../components/common/Loader";
import { getServiceProviders } from "../../api/serviceProviderApi";
import useFetch from "../../hooks/useFetch";

// ── Helpers ────────────────────────────────────────────────────────────────

const dv = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const s = String(v).trim();
  return s || null;
};

const fmtScore = (v, decimals = 1) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n.toFixed(decimals);
};

const fmtLabel = (label) =>
  label
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

const fmtAny = (v) => {
  if (v === null || v === undefined || v === "") return "Not Available";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) {
    if (v.length === 0) return "Not Available";
    return v.map((i) => (isObj(i) ? JSON.stringify(i) : i)).join(", ");
  }
  return String(v);
};

function toPercent(v, max = 100) {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  if (isNaN(n)) return 0;
  return Math.min(100, Math.max(0, (n / max) * 100));
}

// ── Status logic ───────────────────────────────────────────────────────────

function getCardStatus(provider) {
  const s = provider.Summary_Index;
  const hasSummary = s && (s.SPI != null || s.OEI != null);
  if (!hasSummary) return "missing";
  if (provider.Service_Coverage_Prerequisite === "Yes") return "complete";
  return "partial";
}

const STATUS = {
  missing: {
    gradient: "bg-gradient-to-br from-red-50 to-rose-100",
    border: "border-red-200",
    stripe: "bg-red-400",
    dot: "#f87171",
    label: "Missing Data",
    badgeCls: "bg-red-100 text-red-700 border-red-200",
  },
  partial: {
    gradient: "bg-gradient-to-br from-amber-50 to-yellow-100",
    border: "border-amber-200",
    stripe: "bg-amber-400",
    dot: "#fbbf24",
    label: "Plan Missing",
    badgeCls: "bg-amber-100 text-amber-700 border-amber-200",
  },
  complete: {
    gradient: "bg-gradient-to-br from-emerald-50 to-green-100",
    border: "border-emerald-200",
    stripe: "bg-emerald-500",
    dot: "#34d399",
    label: "Complete",
    badgeCls: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

// ── KPI config ─────────────────────────────────────────────────────────────

const KPI_GRID = [
  {
    key: "Water_Quality_Score",
    label: "Water Quality",
    unit: "%",
    max: 100,
    icon: Droplets,
  },
  {
    key: "Reliability_Score",
    label: "Reliability",
    unit: "hrs",
    max: 24,
    icon: Shield,
  },
  {
    key: "Adequacy_Score",
    label: "Adequacy Score",
    unit: "%",
    max: 100,
    icon: BarChart3,
  },
  {
    key: "Metering_Ratio",
    label: "Metering Ratio",
    unit: "%",
    max: 100,
    icon: Database,
  },
  { key: "OM_Score", label: "O&M Score", unit: "", max: 2, icon: Star },
  {
    key: "NRW_Score",
    label: "NRW Score",
    unit: "%",
    max: 100,
    icon: TrendingDown,
    warn: true,
  },
  {
    key: "Grievance_Redressal_Score",
    label: "Grievance Redr.",
    unit: "%",
    max: 100,
    icon: ShieldCheck,
  },
  { key: "CWPI", label: "CWPI", unit: "", max: 100, icon: Award },
];

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "complete", label: "Complete" },
  { key: "partial", label: "Plan Missing" },
  { key: "missing", label: "Missing Data" },
];

// ── Shared UI atoms ────────────────────────────────────────────────────────

function StatusDot({ status }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
      style={{ background: STATUS[status]?.dot ?? "#94a3b8" }}
    />
  );
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200" />
      <span
        className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
        style={{ fontFamily: "monospace" }}
      >
        {label}
      </span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function Accordion({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100"
      >
        <div className="flex items-center gap-2">
          <Icon size={13} className="text-slate-500" />
          <span
            className="text-[10px] font-bold uppercase tracking-widest text-slate-600"
            style={{ fontFamily: "monospace" }}
          >
            {title}
          </span>
        </div>
        {open ? (
          <ChevronUp size={13} className="text-slate-400" />
        ) : (
          <ChevronDown size={13} className="text-slate-400" />
        )}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

// ── KPI grid card (used in modal) ──────────────────────────────────────────

function KpiCard({ item, value }) {
  const raw = value !== null && value !== undefined ? Number(value) : null;
  const isValid = raw !== null && !isNaN(raw);
  const pct = isValid ? toPercent(raw, item.max) : 0;

  let displayVal = null;
  if (isValid) {
    if (item.unit === "hrs") displayVal = `${raw.toFixed(0)}`;
    else if (item.max === 2) displayVal = raw.toFixed(2);
    else displayVal = raw.toFixed(1);
  }

  const barColor = item.warn
    ? "#f87171"
    : pct >= 75
      ? "#10b981"
      : pct >= 50
        ? "#2563eb"
        : "#f59e0b";

  const Icon = item.icon;

  return (
    <div
      className={`rounded-xl border bg-white p-3 ${
        item.warn ? "border-rose-100" : "border-slate-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className="leading-tight text-[9px] font-bold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "monospace" }}
        >
          {item.label}
        </span>
        <Icon
          size={11}
          className={item.warn ? "text-rose-300" : "text-slate-300"}
        />
      </div>

      <div
        className="mt-1 text-[22px] font-black leading-none tracking-tight"
        style={{
          fontVariantNumeric: "tabular-nums",
          color: !isValid ? "#cbd5e1" : item.warn ? "#dc2626" : "#0f172a",
        }}
      >
        {displayVal ?? "—"}
        {isValid && item.unit && (
          <span
            className="ml-0.5 text-xs font-medium text-slate-400"
            style={{ fontVariantNumeric: "normal" }}
          >
            {item.unit}
          </span>
        )}
      </div>

      <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.round(pct)}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

// ── Metric pill (used on cards) ────────────────────────────────────────────

function MetricPill({ label, value }) {
  const hasValue = value !== null;
  return (
    <div className="flex flex-col items-center rounded-md border border-slate-200/80 bg-white/70 px-2 py-0.5 backdrop-blur-sm">
      <span
        className="text-[8px] font-bold uppercase tracking-wider text-slate-400"
        style={{ fontFamily: "monospace" }}
      >
        {label}
      </span>
      <span
        className={`text-[13px] font-black leading-tight ${
          hasValue ? "text-slate-800" : "text-slate-300"
        }`}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {hasValue ? value : "—"}
      </span>
    </div>
  );
}

// ── Provider compact card ──────────────────────────────────────────────────

function ProviderCard({ provider, onClick }) {
  const status = getCardStatus(provider);
  const sc = STATUS[status];
  const location = provider.Location ?? {};
  const summary = provider.Summary_Index ?? {};
  const spi = fmtScore(summary.SPI, 0);
  const oei = fmtScore(summary.OEI, 0);
  const province = dv(location.Province_Name);
  const district = dv(location.District_Name);
  const breadcrumb = [province, district].filter(Boolean).join(" · ");

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      title={dv(provider.WSUC_Name) ?? ""}
      className={`
        group flex cursor-pointer overflow-hidden rounded-xl border shadow-sm
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-brand-primary/40
        ${sc.gradient} ${sc.border}
      `}
    >
      {/* Status stripe */}
      <div className={`w-[3px] flex-shrink-0 ${sc.stripe}`} />

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 px-3 py-3">
        {/* Top: name + location */}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-snug text-slate-800 transition-colors group-hover:text-brand-primary">
            {dv(provider.WSUC_Name) ?? "Unnamed WSUC"}
          </p>
          {breadcrumb ? (
            <p
              className="mt-0.5 truncate text-[10px] text-slate-400"
              style={{ fontFamily: "monospace" }}
            >
              {breadcrumb}
            </p>
          ) : (
            <p className="mt-0.5 text-[10px] italic text-slate-300">
              No location
            </p>
          )}
        </div>

        {/* Bottom: metric pills + status badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <MetricPill label="SPI" value={spi} />
            <MetricPill label="OEI" value={oei} />
          </div>
          <span
            className={`flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${sc.badgeCls}`}
            style={{ fontFamily: "monospace" }}
          >
            <StatusDot status={status} />
            {sc.label}
          </span>
        </div>
      </div>
    </article>
  );
}

// ── Provider detail modal ──────────────────────────────────────────────────

function ProviderDetailModal({ provider, onClose }) {
  if (!provider) return null;

  const status = getCardStatus(provider);
  const sc = STATUS[status];
  const location = provider.Location ?? {};
  const summary = provider.Summary_Index ?? {};
  const coverageReady = provider.Service_Coverage_Prerequisite === "Yes";

  const spiPct = toPercent(summary.SPI, 100);
  const oeiPct = toPercent(summary.OEI, 100);

  const docEntries =
    provider.Documents && isObj(provider.Documents)
      ? Object.entries(provider.Documents)
      : [];
  const hasGeometry = provider.geometry != null;

  const skipped = new Set([
    "_id",
    "__v",
    "WSUC_Name",
    "WSUC_ID",
    "Service_Coverage_Prerequisite",
    "Location",
    "Summary_Index",
    "Documents",
    "geometry",
  ]);
  const extraEntries = Object.entries(provider).filter(
    ([k, v]) => !skipped.has(k) && !isObj(v) && !Array.isArray(v),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ── Modal header ── */}
        <div
          className="relative flex-shrink-0 px-7 py-6 text-white"
          style={{
            background: "linear-gradient(135deg, #001d4a 0%, #0047ab 100%)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 transition-colors hover:bg-white/10"
            aria-label="Close"
          >
            <X size={16} className="text-white/70" />
          </button>

          <p
            className="text-[10px] font-bold uppercase tracking-widest text-blue-300"
            style={{ fontFamily: "monospace" }}
          >
            Water Supply Service Provider
          </p>
          <h2 className="mt-1 text-2xl font-bold leading-tight tracking-tight">
            {dv(provider.WSUC_Name) ?? "Unnamed WSUC"}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{
                background: `${sc.dot}22`,
                color: sc.dot,
                borderColor: `${sc.dot}40`,
                fontFamily: "monospace",
              }}
            >
              <StatusDot status={status} />
              {sc.label}
            </span>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* Spatial Identity */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <SectionDivider label="Spatial Identity" />
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Province", value: location.Province_Name },
                { label: "District", value: location.District_Name },
                { label: "Municipality", value: location.Municipality_Name },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div
                    className="text-[9px] font-bold uppercase tracking-widest text-slate-400"
                    style={{ fontFamily: "monospace" }}
                  >
                    {label}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold leading-snug text-slate-800">
                    {dv(value) ?? (
                      <span className="text-xs font-normal italic text-slate-300">
                        N/A
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Composite Indices */}
          <div className="grid grid-cols-2 gap-4">
            {/* SPI */}
            <div
              className="relative overflow-hidden rounded-xl p-5 text-white"
              style={{
                background: "linear-gradient(135deg, #0047ab 0%, #00327d 100%)",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-widest opacity-60"
                style={{ fontFamily: "monospace" }}
              >
                Service Performance Index
              </p>
              <div
                className="mt-1 text-5xl font-black leading-none tracking-tight"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {fmtScore(summary.SPI, 0) ?? "—"}
                {summary.SPI != null && (
                  <span className="ml-1 text-2xl font-bold opacity-50">%</span>
                )}
              </div>
              <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white/50 transition-all duration-700"
                  style={{ width: `${spiPct}%` }}
                />
              </div>
              <Award
                size={40}
                className="absolute bottom-3 right-4 opacity-10"
              />
            </div>

            {/* OEI */}
            <div
              className="relative overflow-hidden rounded-xl p-5 text-white"
              style={{
                background: "linear-gradient(135deg, #006195 0%, #004a79 100%)",
              }}
            >
              <p
                className="text-[10px] font-bold uppercase tracking-widest opacity-60"
                style={{ fontFamily: "monospace" }}
              >
                Operational Efficiency Index
              </p>
              <div
                className="mt-1 text-5xl font-black leading-none tracking-tight"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {fmtScore(summary.OEI, 0) ?? "—"}
                {summary.OEI != null && (
                  <span className="ml-1 text-2xl font-bold opacity-50">%</span>
                )}
              </div>
              <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white/50 transition-all duration-700"
                  style={{ width: `${oeiPct}%` }}
                />
              </div>
              <Zap size={40} className="absolute bottom-3 right-4 opacity-10" />
            </div>
          </div>

          {/* KPI Assessment grid */}
          <div>
            <SectionDivider label="Detailed KPI Assessment" />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {KPI_GRID.map((item) => (
                <KpiCard key={item.key} item={item} value={summary[item.key]} />
              ))}
            </div>
          </div>

          {/* Documents */}
          {docEntries.length > 0 && (
            <Accordion title="Documents" icon={FileText}>
              <div className="grid gap-2 sm:grid-cols-2">
                {docEntries.map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <div
                      className="text-[9px] font-bold uppercase tracking-wider text-slate-400"
                      style={{ fontFamily: "monospace" }}
                    >
                      {fmtLabel(k)}
                    </div>
                    <div className="mt-0.5 break-all text-xs font-medium text-slate-700">
                      {fmtAny(v)}
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>
          )}

          {/* Additional fields */}
          {extraEntries.length > 0 && (
            <Accordion title="Additional Information" icon={Database}>
              <div className="grid gap-2 sm:grid-cols-2">
                {extraEntries.map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <div
                      className="text-[9px] font-bold uppercase tracking-wider text-slate-400"
                      style={{ fontFamily: "monospace" }}
                    >
                      {fmtLabel(k)}
                    </div>
                    <div className="mt-0.5 break-words text-xs font-medium text-slate-700">
                      {fmtAny(v)}
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-4 w-7 items-center justify-end rounded-full bg-emerald-500 px-0.5">
                <div className="h-3 w-3 rounded-full bg-white" />
              </div>
              <div>
                <div
                  className="text-[9px] font-bold uppercase tracking-wider text-slate-600"
                  style={{ fontFamily: "monospace" }}
                >
                  NWASH MIS Integration
                </div>
                <div
                  className="text-[9px] text-slate-400"
                  style={{ fontFamily: "monospace" }}
                >
                  Verified &amp; Integrated
                </div>
              </div>
            </div>
            <TrendingUp size={14} className="text-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

function ServiceProvidersPage() {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data, loading, error } = useFetch(getServiceProviders, []);
  const providers = Array.isArray(data) ? data : [];

  console.log("service provider data", data);
  const stats = useMemo(() => {
    const provinceCount = new Set(
      providers.map((p) => p.Location?.Province_Name?.trim()).filter(Boolean),
    ).size;

    return [
      {
        label: "Total WSUCs",
        value: providers.length,
        icon: Building2,
        cls: "text-blue-600 bg-blue-50",
      },
      {
        label: "Provinces Covered",
        value: provinceCount,
        icon: Globe,
        cls: "text-violet-600 bg-violet-50",
      },
      {
        label: "With SPI Data",
        value: providers.filter((p) => p.Summary_Index?.SPI != null).length,
        icon: BarChart3,
        cls: "text-teal-600 bg-teal-50",
      },
      {
        label: "Complete Records",
        value: providers.filter((p) => getCardStatus(p) === "complete").length,
        icon: ShieldCheck,
        cls: "text-emerald-600 bg-emerald-50",
      },
    ];
  }, [providers]);

  const filtered = useMemo(() => {
    let list = providers;

    if (filterStatus !== "all") {
      list = list.filter((p) => getCardStatus(p) === filterStatus);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const loc = p.Location ?? {};
        return (
          (p.WSUC_Name ?? "").toLowerCase().includes(q) ||
          (loc.Province_Name ?? "").toLowerCase().includes(q) ||
          (loc.District_Name ?? "").toLowerCase().includes(q) ||
          (loc.Municipality_Name ?? "").toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [providers, search, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary"
          style={{ fontFamily: "monospace" }}
        >
          Service Providers
        </p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">
          WSUC Registry
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          Browse and review all registered Water Supply and Urban Sanitation
          Committees across Nepal.
        </p>
      </div>

      {loading && <Loader text="Loading service providers…" />}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Could not load service provider data
          </p>
          <p className="mt-1 text-sm text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats row */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, cls }) => (
              <div key={label} className="stat-card flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${cls}`}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-text-secondary">{label}</p>
                  <p
                    className="mt-0.5 text-2xl font-bold leading-none text-text-primary"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Registry card */}
          <div className="stat-card">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex min-w-48 flex-1 items-center gap-2 rounded-lg border border-surface-border bg-surface px-3 py-2">
                <Search
                  size={14}
                  className="flex-shrink-0 text-text-secondary"
                />
                <input
                  type="text"
                  placeholder="Search by name, province, district…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-secondary/60 outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="flex-shrink-0 text-text-secondary hover:text-text-primary"
                    aria-label="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center gap-1 rounded-lg border border-surface-border bg-surface p-1">
                {FILTER_TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilterStatus(key)}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                      filterStatus === key
                        ? "border border-surface-border bg-white text-text-primary shadow-sm"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                    style={{ fontFamily: "monospace" }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Result count */}
              <span
                className="flex-shrink-0 text-[11px] text-text-secondary"
                style={{ fontFamily: "monospace" }}
              >
                {filtered.length}/{providers.length}
              </span>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {Object.entries(STATUS).map(([key, sc]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: sc.dot }}
                  />
                  <span
                    className="text-[10px] text-slate-400"
                    style={{ fontFamily: "monospace" }}
                  >
                    {sc.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Cards grid */}
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filtered.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <Search size={36} className="mx-auto mb-3 text-slate-200" />
                  <p className="text-sm font-medium text-text-secondary">
                    No providers match your search
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setFilterStatus("all");
                    }}
                    className="mt-2 text-xs text-brand-primary hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filtered.map((provider) => (
                  <ProviderCard
                    key={provider._id ?? provider.WSUC_ID}
                    provider={provider}
                    onClick={() => setSelectedProvider(provider)}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}

      {selectedProvider && (
        <ProviderDetailModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </div>
  );
}

export default ServiceProvidersPage;
