import { useMemo, useState } from "react";
import {
  Award,
  BarChart3,
  Building2,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Download,
  Droplets,
  FileText,
  Globe,
  Home,
  Search,
  Shield,
  ShieldCheck,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
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

const fmtNum = (v) => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  if (isNaN(n)) return null;
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n));
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

// ── Rankings ───────────────────────────────────────────────────────────────

// Builds a Map<projectId, { oeiRank, spiRank, oeiTotal, spiTotal }>.
// Standard competition ranking: ties share the same rank, next rank skips.
// Example: [95, 95, 91, 88] → ranks [1, 1, 3, 4]
// Projects with null / undefined / NaN scores are excluded from that ranking
// and receive rank: null for that field. Totals reflect only ranked projects.
function computeRankings(providers) {
  const result = new Map();
  const idOf = (p) => p._id ?? p.WSUC_ID;

  for (const p of providers) {
    result.set(idOf(p), {
      oeiRank: null,
      spiRank: null,
      oeiTotal: 0,
      spiTotal: 0,
    });
  }

  const assignRanks = (scoreKey, rankKey, totalKey) => {
    const valid = providers
      .map((p) => ({ id: idOf(p), score: Number(p.Summary_Index?.[scoreKey]) }))
      .filter(({ score }) => Number.isFinite(score));

    const total = valid.length;
    valid.sort((a, b) => b.score - a.score);

    let currentRank = 0;
    for (let i = 0; i < valid.length; i++) {
      if (i === 0 || valid[i].score !== valid[i - 1].score) currentRank = i + 1;
      const entry = result.get(valid[i].id);
      entry[rankKey] = currentRank;
      entry[totalKey] = total;
    }
  };

  assignRanks("OEI", "oeiRank", "oeiTotal");
  assignRanks("SPI", "spiRank", "spiTotal");

  return result;
}

// ── Status logic ───────────────────────────────────────────────────────────
//
// Decision tree (evaluated top-to-bottom, first match wins):
//
//   1. RED   ("noScore")  — OEI or SPI is absent / non-finite. Highest priority.
//                           Both BP presence and value are irrelevant at this tier.
//   2. ORANGE ("noBP")   — OEI & SPI are present, but SCP !== "Yes".
//   3. GREEN  ("complete")— SCP === "Yes" AND OEI AND SPI all present.
//
// Every provider falls into exactly one tier because:
//   - "noScore" catches all records missing either index first.
//   - Of the remaining (both indexes present), "noBP" catches SCP !== "Yes".
//   - "complete" is what's left: both indexes present AND SCP === "Yes".

function isValidScore(v) {
  return v != null && v !== "" && Number.isFinite(Number(v));
}

function getCardStatus(provider) {
  const si = provider.Summary_Index ?? {};

  if (!isValidScore(si.OEI) || !isValidScore(si.SPI)) return "noScore";
  if (provider.Service_Coverage_Prerequisite !== "Yes") return "noBP";
  return "complete";
}

const STATUS = {
  noScore: {
    gradient: "bg-gradient-to-br from-red-50 to-rose-100",
    border: "border-red-200",
    stripe: "bg-red-400",
    dot: "#f87171",
    label: "Score Missing",
    badgeCls: "bg-red-100 text-red-700 border-red-200",
  },
  noBP: {
    gradient: "bg-gradient-to-br from-orange-50 to-amber-100",
    border: "border-orange-200",
    stripe: "bg-orange-400",
    dot: "#fb923c",
    label: "Business Plan Missing",
    badgeCls: "bg-orange-100 text-orange-700 border-orange-200",
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

// ── KPI config for detail modal ────────────────────────────────────────────

const KPI_GRID = [
  {
    key: "Water_Quality_Score",
    label: "Water Quality",

    max: 100,
    icon: Droplets,
  },
  {
    key: "Reliability_Score",
    label: "Hours Of Supply",
    unit: "hrs/day",
    max: 24,
    icon: Shield,
  },
  {
    key: "Adequacy_Score",
    label: "Adequacy Score",

    max: 100,
    icon: BarChart3,
  },
  {
    key: "Metering_Ratio_Score",
    label: "Metering Ratio",

    max: 100,
    icon: Database,
  },
  { key: "OM_Score", label: "O&M Score", unit: "", max: 2, icon: Star },
  {
    key: "NRW_Score",
    label: "NRW Score",

    max: 100,
    icon: TrendingDown,
    warn: true,
  },
  {
    key: "Grievance_Score",
    label: "Grievance Score",

    max: 100,
    icon: ShieldCheck,
  },
  {
    key: "Service_Coverage_Score",
    label: "Coverage Score",

    max: 100,
    icon: Award,
  },
];

const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "complete", label: "Complete" },
  { key: "noBP", label: "BP Missing" },
  { key: "noScore", label: "Score Missing" },
];

// ── PDF Export ─────────────────────────────────────────────────────────────
// Why the old export lost colors: browser print dialogs strip background
// gradients and colors by default. The fix is print-color-adjust: exact on
// every element that carries a background. This must be applied via inline
// style or an !important rule because @media print resets are overridden
// by the browser's own print stylesheet.

const WATER_DROP_SVG =
  '<path d="M16 0 Q28 14 28 24 A12 12 0 0 1 4 24 Q4 14 16 0 Z"/>';

function exportToPDF(provider, e, rank = null) {
  e.stopPropagation();
  const ms = provider.Master_Sheet ?? {};
  const si = provider.Summary_Index ?? {};
  const loc = provider.Location ?? {};
  const status = getCardStatus(provider);
  const sc = STATUS[status];

  const kv = (label, value, unit = "") => {
    const v = value !== null && value !== undefined ? value : null;
    const pct =
      v !== null ? Math.min(100, Math.max(0, Number(v))).toFixed(0) : 0;
    return `
      <div class="kpi">
        <div class="kpi-label">${label}</div>
        <div class="kpi-value ${v === null ? "na" : ""}">${v !== null ? `${Number(v).toFixed(1)}${unit ? `<span class="kpi-unit"> ${unit}</span>` : ""}` : "N/A"}</div>
        <div class="kpi-bar"><div class="kpi-fill" style="width:${pct}%"></div></div>
      </div>`;
  };

  const rankHtml =
    rank?.spiRank != null || rank?.oeiRank != null
      ? `<div class="rank-row">
          ${rank.spiRank != null ? `<div class="rank-chip"><div class="rank-lbl">SPI Rank</div><div class="rank-val">#${rank.spiRank}<span class="rank-of"> / ${rank.spiTotal}</span></div></div>` : ""}
          ${rank.oeiRank != null ? `<div class="rank-chip"><div class="rank-lbl">OEI Rank</div><div class="rank-val">#${rank.oeiRank}<span class="rank-of"> / ${rank.oeiTotal}</span></div></div>` : ""}
        </div>`
      : "";

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>${provider.WSUC_Name ?? "WSUC Profile"}</title>
<style>
  @page { size: A5; margin: 10mm; }
  *, *::before, *::after {
    box-sizing: border-box; margin: 0; padding: 0;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body { font-family: 'Segoe UI', system-ui, Arial, sans-serif; font-size: 10px; color: #0f172a; background: #fff; }

  /* ── Status stripe at top ── */
  .status-stripe { height: 3px; background: ${sc.dot}; border-radius: 3px 3px 0 0; margin-bottom: 0; }

  /* ── Header ── */
  .header {
    background: linear-gradient(135deg,#001d4a 0%,#0047ab 100%);
    color: #fff; border-radius: 0 0 8px 8px; padding: 14px 16px 18px;
    margin-bottom: 10px; position: relative; overflow: hidden;
  }
  .header-eyebrow { font-size: 7px; letter-spacing: .12em; text-transform: uppercase; opacity: .65; font-family: monospace; margin-bottom: 3px; }
  .header-name { font-size: 18px; font-weight: 800; line-height: 1.2; }
  .header-badges { margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
  .badge { display: inline-block; border-radius: 20px; padding: 2px 8px; font-size: 7px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; font-family: monospace; }
  .badge-status { background: ${sc.dot}33; color: ${sc.dot}; border: 1px solid ${sc.dot}55; }
  .badge-blue { background: rgba(255,255,255,.12); color: #bfdbfe; border: 1px solid rgba(255,255,255,.15); }

  .rank-row { display: flex; gap: 8px; margin-top: 8px; }
  .rank-chip { background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15); border-radius: 6px; padding: 4px 10px; }
  .rank-lbl { font-size: 6px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; color: rgba(255,255,255,.55); font-family: monospace; }
  .rank-val { font-size: 13px; font-weight: 900; color: #fff; font-variant-numeric: tabular-nums; line-height: 1.2; }
  .rank-of { font-size: 8px; font-weight: 500; opacity: .55; }

  /* ── Section divider ── */
  .section { margin-bottom: 10px; }
  .section-divider { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .section-divider-line { flex: 1; height: 1px; background: #e2e8f0; }
  .section-divider-label { font-size: 7px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #94a3b8; font-family: monospace; white-space: nowrap; }

  /* ── Location grid ── */
  .spatial { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
  .spatial-item .s-label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #94a3b8; font-family: monospace; }
  .spatial-item .s-value { font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 2px; }

  /* ── Composite index cards ── */
  .indices { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
  .index-card { border-radius: 8px; padding: 12px; color: #fff; position: relative; overflow: hidden; }
  .index-card.spi { background: linear-gradient(135deg,#0047ab 0%,#00327d 100%); }
  .index-card.oei { background: linear-gradient(135deg,#006195 0%,#004a79 100%); }
  .index-label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; opacity: .65; font-family: monospace; }
  .index-value { font-size: 34px; font-weight: 900; line-height: 1; margin-top: 4px; font-variant-numeric: tabular-nums; }
  .index-bar { height: 2px; background: rgba(255,255,255,.15); border-radius: 2px; margin-top: 8px; }
  .index-fill { height: 100%; background: rgba(255,255,255,.55); border-radius: 2px; }
  .index-rank { font-size: 7px; font-weight: 700; opacity: .65; margin-top: 6px; font-family: monospace; font-variant-numeric: tabular-nums; }

  /* ── KPI grid ── */
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .kpi { background: #fff; border: 1px solid #f1f5f9; border-radius: 6px; padding: 6px 8px; }
  .kpi-label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; font-family: monospace; line-height: 1.3; }
  .kpi-value { font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px; line-height: 1; font-variant-numeric: tabular-nums; }
  .kpi-value.na { color: #cbd5e1; font-size: 12px; }
  .kpi-unit { font-size: 8px; font-weight: 500; color: #94a3b8; }
  .kpi-bar { height: 2px; background: #f1f5f9; border-radius: 2px; margin-top: 4px; }
  .kpi-fill { height: 100%; background: #2563eb; border-radius: 2px; }

  /* ── Population metrics ── */
  .metrics-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 10px; }
  .metric-chip { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 7px 8px; }
  .metric-chip .m-label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #94a3b8; font-family: monospace; }
  .metric-chip .m-value { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px; font-variant-numeric: tabular-nums; }

  /* ── Footer ── */
  .footer { border-top: 1px dashed #e2e8f0; margin-top: 10px; padding-top: 8px; display: flex; justify-content: space-between; align-items: center; }
  .footer-text { font-size: 7px; color: #94a3b8; font-family: monospace; }
</style>
</head><body>

<!-- Status stripe -->
<div class="status-stripe"></div>

<!-- Page watermark — very faint drop in the bottom-right corner -->
<div style="position:fixed;bottom:-30px;right:-30px;width:190px;height:230px;opacity:0.025;pointer-events:none;z-index:0">
  <svg viewBox="0 0 32 40" fill="#1e3a8a" style="width:100%;height:100%">
    ${WATER_DROP_SVG}
  </svg>
</div>

<div style="position:relative;z-index:1">

<div class="header">
  <!-- Water drop — top-right corner of header -->
  <svg style="position:absolute;top:-12px;right:-12px;width:96px;height:116px;opacity:0.08;fill:white;pointer-events:none" viewBox="0 0 32 40">
    ${WATER_DROP_SVG}
  </svg>
  <!-- Wave accent — bottom edge of header -->
  <svg style="position:absolute;bottom:0;left:0;width:100%;height:14px;fill:white;opacity:0.07;pointer-events:none" viewBox="0 0 400 14" preserveAspectRatio="none">
    <path d="M0 7 Q50 0 100 7 Q150 14 200 7 Q250 0 300 7 Q350 14 400 7 L400 14 L0 14 Z"/>
  </svg>

  <div class="header-eyebrow">Water Supply Service Operator · NWASH Dashboard</div>
  <div class="header-name">${provider.WSUC_Name ?? "Unnamed WSUC"}</div>
  <div class="header-badges">
    <span class="badge badge-status">${sc.label}</span>
    ${dv(provider.WSUC_ID) ? `<span class="badge badge-blue">MIS: ${provider.WSUC_ID}</span>` : ""}
    <span class="badge badge-blue">Business Plan: ${provider.Service_Coverage_Prerequisite ?? "N/A"}</span>
  </div>
  ${rankHtml}
</div>

<div class="section">
  <div class="section-divider"><div class="section-divider-line"></div><div class="section-divider-label">Spatial Identity</div><div class="section-divider-line"></div></div>
  <div class="spatial">
    <div class="spatial-item"><div class="s-label">Province</div><div class="s-value">${dv(loc.Province_Name) ?? "—"}</div></div>
    <div class="spatial-item"><div class="s-label">District</div><div class="s-value">${dv(loc.District_Name) ?? "—"}</div></div>
    <div class="spatial-item"><div class="s-label">Municipality</div><div class="s-value">${dv(loc.Municipality_Name) ?? "—"}</div></div>
    <div class="spatial-item"><div class="s-label">Type</div><div class="s-value">${dv(loc.Municipality_Type) ?? "—"}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-divider"><div class="section-divider-line"></div><div class="section-divider-label">Population & Coverage</div><div class="section-divider-line"></div></div>
  <div class="metrics-row">
    <div class="metric-chip"><div class="m-label">HH Served</div><div class="m-value">${(ms.HH_Served ?? provider.HH_Served) != null ? Number(ms.HH_Served ?? provider.HH_Served).toLocaleString() : "N/A"}</div></div>
    <div class="metric-chip"><div class="m-label">Total HH</div><div class="m-value">${(ms.Total_HH ?? provider.Total_HH) != null ? Number(ms.Total_HH ?? provider.Total_HH).toLocaleString() : "N/A"}</div></div>
    <div class="metric-chip"><div class="m-label">Population Served</div><div class="m-value">${(ms.Population_Served ?? provider.Population_Served) != null ? Number(ms.Population_Served ?? provider.Population_Served).toLocaleString() : "N/A"}</div></div>
  </div>
</div>

<div class="indices">
  <div class="index-card spi">
    <!-- Subtle drop inside index card -->
    <svg style="position:absolute;bottom:-8px;right:-8px;width:52px;height:64px;opacity:0.1;fill:white;pointer-events:none" viewBox="0 0 32 40">
      ${WATER_DROP_SVG}
    </svg>
    <div class="index-label">Service Performance Index</div>
    <div class="index-value">${si.SPI != null ? Number(si.SPI).toFixed(0) : "—"}${si.SPI != null ? '<span style="font-size:16px;opacity:.5">%</span>' : ""}</div>
    <div class="index-bar"><div class="index-fill" style="width:${si.SPI != null ? Math.min(100, Number(si.SPI)).toFixed(0) : 0}%"></div></div>
    ${rank?.spiRank != null ? `<div class="index-rank">Rank ${rank.spiRank} / ${rank.spiTotal}</div>` : ""}
  </div>
  <div class="index-card oei">
    <svg style="position:absolute;bottom:-8px;right:-8px;width:52px;height:64px;opacity:0.1;fill:white;pointer-events:none" viewBox="0 0 32 40">
      ${WATER_DROP_SVG}
    </svg>
    <div class="index-label">Operational Efficiency Index</div>
    <div class="index-value">${si.OEI != null ? Number(si.OEI).toFixed(0) : "—"}${si.OEI != null ? '<span style="font-size:16px;opacity:.5">%</span>' : ""}</div>
    <div class="index-bar"><div class="index-fill" style="width:${si.OEI != null ? Math.min(100, Number(si.OEI)).toFixed(0) : 0}%"></div></div>
    ${rank?.oeiRank != null ? `<div class="index-rank">Rank ${rank.oeiRank} / ${rank.oeiTotal}</div>` : ""}
  </div>
</div>

<div class="section">
  <div class="section-divider"><div class="section-divider-line"></div><div class="section-divider-label">Detailed KPI Assessment</div><div class="section-divider-line"></div></div>
  <div class="kpi-grid">
    ${kv("Water Quality", si.Water_Quality_Score != null ? si.Water_Quality_Score * 100 : null)}
    ${kv("Reliability", ms.Hours_of_Supply ?? provider.Hours_of_Supply ?? null, "hrs/day")}
    ${kv("Adequacy", si.Adequacy_Score != null ? si.Adequacy_Score * 100 : null)}
    ${kv("Metering", si.Metering_Ratio_Score != null ? si.Metering_Ratio_Score * 100 : null)}
    ${kv("O&M Score", si.OM_Score != null ? si.OM_Score * 50 : null)}
    ${kv("NRW Score", si.NRW_Score)}
    ${kv("Grievance", si.Grievance_Score != null ? si.Grievance_Score * 100 : null)}
    ${kv("Coverage", si.Service_Coverage_Score != null ? si.Service_Coverage_Score * 100 : null)}
  </div>
</div>

<div class="footer">
  <div class="footer-text">NWASH MIS · DWSSM Dashboard · ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
  <div class="footer-text">Category: ${ms.Category_Level ?? si.Category_Level ?? "—"}</div>
</div>

</div><!-- /z-index wrapper -->

<script>window.onload = function(){ window.print(); };<\/script>
</body></html>`;

  const win = window.open("", "_blank", "width=640,height=900");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

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

// ── KPI grid card (detail modal) ───────────────────────────────────────────

function KpiCard({ item, value }) {
  const raw = value !== null && value !== undefined ? Number(value) : null;
  const isValid = raw !== null && !isNaN(raw);
  const pct = isValid ? toPercent(raw, item.max) : 0;

  let displayVal = null;
  if (isValid) {
    if (item.unit === "hrs" || item.unit === "hrs/day")
      displayVal = `${raw.toFixed(0)}`;
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

// ── Metric pill (list cards) ───────────────────────────────────────────────

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
        className={`text-[13px] font-black leading-tight ${hasValue ? "text-slate-800" : "text-slate-300"}`}
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
  const ms = provider.Master_Sheet ?? {};
  const si = provider.Summary_Index ?? {};

  const spi = fmtScore(si.SPI, 0);
  const oei = fmtScore(si.OEI, 0);
  const hhServed = fmtNum(ms.HH_Served ?? provider.HH_Served);
  const totalHH = fmtNum(ms.Total_HH ?? provider.Total_HH);
  const hours = ms.Hours_of_Supply ?? provider.Hours_of_Supply ?? null;
  const hoursDisplay =
    hours != null ? `${Number(hours).toFixed(0)} hrs/day` : null;

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
        group relative flex cursor-pointer overflow-hidden rounded-xl border shadow-sm
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-brand-primary/40
        ${sc.gradient} ${sc.border}
      `}
    >
      {/* Status stripe */}
      <div className={`w-[3px] flex-shrink-0 ${sc.stripe}`} />

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 px-3 py-3">
        {/* Top row: name + export button */}
        <div className="flex min-w-0 items-start justify-between gap-1.5">
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

          {/* Export button */}
          <button
            type="button"
            onClick={(e) => exportToPDF(provider, e)}
            title="Export as PDF"
            className="flex-shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-white/60 hover:text-slate-700"
          >
            <Download size={12} />
          </button>
        </div>

        {/* Bottom row: metric pills + extra stats + status */}
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          {/* SPI / OEI */}
          <div className="flex items-center gap-1.5">
            <MetricPill label="SPI" value={spi} />
            <MetricPill label="OEI" value={oei} />
          </div>

          {/* HH / Total HH / Hours */}
          <div
            className="flex items-center gap-2 text-[10px] text-slate-500"
            style={{ fontFamily: "monospace" }}
          >
            {hhServed && (
              <span className="flex items-center gap-0.5">
                <Home size={9} className="text-slate-400" />
                {hhServed}
              </span>
            )}
            {totalHH && (
              <span className="flex items-center gap-0.5 text-slate-400">
                <Users size={9} />
                {totalHH}
              </span>
            )}
            {hoursDisplay && (
              <span className="flex items-center gap-0.5 text-slate-400">
                <Clock size={9} />
                {hoursDisplay}
              </span>
            )}
          </div>
        </div>

        {/* Status badge row */}
        <div className="flex justify-end">
          <span
            className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${sc.badgeCls}`}
            style={{ fontFamily: "monospace" }}
          >
            <StatusDot status={status} />
            {sc.label}
          </span>
        </div>
      </div>

      {/* Water-drop watermark — purely decorative, clipped by overflow-hidden on article */}
      <svg
        viewBox="0 0 32 40"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-16 w-16 opacity-[0.05]"
        fill="#1e40af"
      >
        <path d="M16 0 Q28 14 28 24 A12 12 0 0 1 4 24 Q4 14 16 0 Z" />
      </svg>
    </article>
  );
}

// ── Provider detail modal ──────────────────────────────────────────────────

function ProviderDetailModal({ provider, rankings, onClose }) {
  if (!provider) return null;

  const status = getCardStatus(provider);
  const sc = STATUS[status];
  const location = provider.Location ?? {};
  const ms = provider.Master_Sheet ?? {};
  const si = provider.Summary_Index ?? {};
  const rank = rankings?.get(provider._id ?? provider.WSUC_ID) ?? null;

  const spiPct = toPercent(si.SPI, 100);
  const oeiPct = toPercent(si.OEI, 100);
  console.log("providerr data", provider);
  const skipped = new Set([
    "_id",
    "__v",
    "WSUC_Name",
    "WSUC_ID",
    "Service_Coverage_Prerequisite",
    "Business_Plan",
    "Location",
    "Summary_Index",
    "HH_Served",
    "Total_HH",
    "Population_Served",
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
          style={{
            background: "linear-gradient(135deg, #001d4a 0%, #0047ab 100%)",
          }}
        >
          {/* Water-drop decoration — top-right corner */}
          <svg
            viewBox="0 0 32 40"
            aria-hidden="true"
            className="pointer-events-none absolute -right-3 -top-3 h-28 w-28 opacity-[0.07]"
            fill="white"
          >
            <path d="M16 0 Q28 14 28 24 A12 12 0 0 1 4 24 Q4 14 16 0 Z" />
          </svg>
          {/* Wave accent — bottom edge of header */}
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
                      <span className="text-xs font-normal italic text-slate-300">
                        N/A
                      </span>
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
                        <span className="text-base font-normal text-slate-300">
                          N/A
                        </span>
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
                  style={{
                    fontFamily: "monospace",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  Rank {rank.spiRank} / {rank.spiTotal}
                </p>
              )}
              <Award
                size={40}
                className="absolute bottom-3 right-4 opacity-10"
              />
            </div>

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
                  style={{
                    fontFamily: "monospace",
                    fontVariantNumeric: "tabular-nums",
                  }}
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

// ── Main page ──────────────────────────────────────────────────────────────

function ServiceProvidersPage() {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data, loading, error } = useFetch(getServiceProviders, []);
  const providers = Array.isArray(data) ? data : [];
  console.log("data service provider", data);

  // Computed once per provider list load; never recalculated when a card is opened.
  const rankings = useMemo(() => computeRankings(providers), [providers]);

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
        label: "Provinces",
        value: provinceCount,
        icon: Globe,
        cls: "text-violet-600 bg-violet-50",
      },
      {
        label: "Complete",
        value: providers.filter((p) => getCardStatus(p) === "complete").length,
        icon: ShieldCheck,
        cls: "text-emerald-600 bg-emerald-50",
      },
      {
        label: "Business Plan Missing",
        value: providers.filter((p) => getCardStatus(p) === "noBP").length,
        icon: FileText,
        cls: "text-orange-600 bg-orange-50",
      },
    ];
  }, [providers]);

  const filtered = useMemo(() => {
    let list = providers;
    if (filterStatus !== "all")
      list = list.filter((p) => getCardStatus(p) === filterStatus);
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
          {/* Stats */}
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

          {/* Registry */}
          <div className="stat-card">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
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
                    aria-label="Clear"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

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

              <span
                className="flex-shrink-0 text-[11px] text-text-secondary"
                style={{ fontFamily: "monospace" }}
              >
                {filtered.length}/{providers.length}
              </span>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-5">
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
              <span
                className="ml-auto text-[10px] text-slate-400"
                style={{ fontFamily: "monospace" }}
              >
                Click card to view details ·{" "}
                <Download size={9} className="inline" /> to export PDF
              </span>
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
          rankings={rankings}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </div>
  );
}

export default ServiceProvidersPage;
