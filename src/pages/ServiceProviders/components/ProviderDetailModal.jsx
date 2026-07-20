import { useState } from "react";
import {
  Award,
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  Home,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  dv,
  fmtAny,
  fmtLabel,
  fmtScore,
  isObj,
  toPercent,
} from "../utils/providerUtils";
import { getCardStatus } from "../utils/providerUtils";
import { KPI_GRID, STATUS } from "../constants/providerConstants";
import { exportToPDF } from "../utils/exportToPDF";
import { StatusDot } from "./ProviderCard";

// ── Local sub-components ───────────────────────────────────────────────────

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

function KpiCard({ item, value }) {
  const raw = value !== null && value !== undefined ? Number(value) : null;
  const isValid = raw !== null && !isNaN(raw);
  const pct = isValid ? toPercent(raw, item.max) : 0;

  let displayVal = null;
  if (isValid) {
    if (item.unit === "hrs" || item.unit === "hrs/day") displayVal = `${raw.toFixed(0)}`;
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
      className={`rounded-xl border bg-white p-3 ${item.warn ? "border-rose-100" : "border-slate-100"}`}
    >
      <div className="flex items-center justify-between">
        <span
          className="leading-tight text-[9px] font-bold uppercase tracking-widest text-slate-400"
          style={{ fontFamily: "monospace" }}
        >
          {item.label}
        </span>
        <Icon size={11} className={item.warn ? "text-rose-300" : "text-slate-300"} />
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

// ── Main component ─────────────────────────────────────────────────────────

export default function ProviderDetailModal({ provider, rankings, onClose }) {
  if (!provider) return null;

  const status = getCardStatus(provider);
  const sc = STATUS[status];
  const location = provider.Location ?? {};
  const ms = provider.Master_Sheet ?? {};
  const si = provider.Summary_Index ?? {};
  const rank = rankings?.get(provider._id ?? provider.WSUC_ID) ?? null;

  const spiPct = toPercent(si.SPI, 100);
  const oeiPct = toPercent(si.OEI, 100);

  const skipped = new Set([
    "_id", "__v", "WSUC_Name", "WSUC_ID",
    "Service_Coverage_Prerequisite", "Business_Plan",
    "Location", "Summary_Index",
    "HH_Served", "Total_HH", "Population_Served",
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
        {/* Header */}
        <div
          className="relative flex-shrink-0 overflow-hidden px-7 py-6 text-white"
          style={{ background: "linear-gradient(135deg, #001d4a 0%, #0047ab 100%)" }}
        >
          <svg
            viewBox="0 0 32 40"
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 -top-3 h-28 w-28 opacity-[0.07]"
            fill="white"
          >
            <path d="M16 0 Q28 14 28 24 A12 12 0 0 1 4 24 Q4 14 16 0 Z" />
          </svg>
          <svg
            viewBox="0 0 400 14"
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 w-full opacity-[0.08]"
            preserveAspectRatio="none"
            fill="white"
          >
            <path d="M0 7 Q50 0 100 7 Q150 14 200 7 Q250 0 300 7 Q350 14 400 7 L400 14 L0 14 Z" />
          </svg>

          <div className="absolute right-4 top-4 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => exportToPDF(provider, e, rank)}
              title="Export as PDF"
              className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/80 transition hover:bg-white/20"
            >
              <Download size={12} />
              Export PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 transition-colors hover:bg-white/10"
              aria-label="Close"
            >
              <X size={16} className="text-white/70" />
            </button>
          </div>

          <p
            className="text-[10px] font-bold uppercase tracking-widest text-blue-300"
            style={{ fontFamily: "monospace" }}
          >
            Water Supply Service Operator
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

        {/* Scrollable body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* Spatial identity */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <SectionDivider label="Spatial Identity" />
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-3">
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
                      <span className="text-xs font-normal italic text-slate-300">N/A</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Population & Coverage */}
          <div>
            <SectionDivider label="Population & Coverage" />
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                {
                  label: "HH Served",
                  icon: Home,
                  value: ms.HH_Served ?? provider.HH_Served,
                  fmt: (v) => Number(v).toLocaleString(),
                },
                {
                  label: "Total Households",
                  icon: Users,
                  value: ms.Total_HH ?? provider.Total_HH,
                  fmt: (v) => Number(v).toLocaleString(),
                },
                {
                  label: "Population Served",
                  icon: Users,
                  value: ms.Population_Served ?? provider.Population_Served,
                  fmt: (v) => Number(v).toLocaleString(),
                },
              ].map(({ label, icon: Icon, value, fmt }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Icon size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <div
                      className="text-[9px] font-bold uppercase tracking-widest text-slate-400"
                      style={{ fontFamily: "monospace" }}
                    >
                      {label}
                    </div>
                    <div
                      className="mt-0.5 text-lg font-black leading-none text-slate-800"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {value != null ? (
                        fmt(value)
                      ) : (
                        <span className="text-base font-normal text-slate-300">N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Composite Indices */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="relative overflow-hidden rounded-xl p-5 text-white"
              style={{ background: "linear-gradient(135deg, #0047ab 0%, #00327d 100%)" }}
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
                {fmtScore(si.SPI, 0) ?? "—"}
                {si.SPI != null && (
                  <span className="ml-1 text-2xl font-bold opacity-50">%</span>
                )}
              </div>
              <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white/50 transition-all duration-700"
                  style={{ width: `${spiPct}%` }}
                />
              </div>
              {rank?.spiRank != null && (
                <p
                  className="mt-3 text-[10px] font-bold opacity-70"
                  style={{ fontFamily: "monospace", fontVariantNumeric: "tabular-nums" }}
                >
                  Rank {rank.spiRank} / {rank.spiTotal}
                </p>
              )}
              <Award size={40} className="absolute bottom-3 right-4 opacity-10" />
            </div>

            <div
              className="relative overflow-hidden rounded-xl p-5 text-white"
              style={{ background: "linear-gradient(135deg, #006195 0%, #004a79 100%)" }}
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
                {fmtScore(si.OEI, 0) ?? "—"}
                {si.OEI != null && (
                  <span className="ml-1 text-2xl font-bold opacity-50">%</span>
                )}
              </div>
              <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white/50 transition-all duration-700"
                  style={{ width: `${oeiPct}%` }}
                />
              </div>
              {rank?.oeiRank != null && (
                <p
                  className="mt-3 text-[10px] font-bold opacity-70"
                  style={{ fontFamily: "monospace", fontVariantNumeric: "tabular-nums" }}
                >
                  Rank {rank.oeiRank} / {rank.oeiTotal}
                </p>
              )}
              <Zap size={40} className="absolute bottom-3 right-4 opacity-10" />
            </div>
          </div>

          {/* KPI grid */}
          <div>
            <SectionDivider label="Detailed KPI Assessment" />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {KPI_GRID.map((item) => (
                <KpiCard
                  key={item.key}
                  item={item}
                  value={
                    item.key === "Reliability_Score"
                      ? (ms.Hours_of_Supply ?? provider.Hours_of_Supply ?? null)
                      : si[item.key]
                  }
                />
              ))}
            </div>
          </div>

          {/* Additional */}
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
