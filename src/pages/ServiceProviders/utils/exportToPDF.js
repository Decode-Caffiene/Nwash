import { dv, fmtScore, getCardStatus } from "./providerUtils";
import { STATUS, WATER_DROP_SVG } from "../constants/providerConstants";

// Why the old export lost colors: browser print dialogs strip background
// gradients and colors by default. The fix is print-color-adjust: exact on
// every element that carries a background.
export function exportToPDF(provider, e, rank = null) {
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

  .status-stripe { height: 3px; background: ${sc.dot}; border-radius: 3px 3px 0 0; margin-bottom: 0; }

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

  .section { margin-bottom: 10px; }
  .section-divider { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .section-divider-line { flex: 1; height: 1px; background: #e2e8f0; }
  .section-divider-label { font-size: 7px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #94a3b8; font-family: monospace; white-space: nowrap; }

  .spatial { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
  .spatial-item .s-label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #94a3b8; font-family: monospace; }
  .spatial-item .s-value { font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 2px; }

  .indices { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
  .index-card { border-radius: 8px; padding: 12px; color: #fff; position: relative; overflow: hidden; }
  .index-card.spi { background: linear-gradient(135deg,#0047ab 0%,#00327d 100%); }
  .index-card.oei { background: linear-gradient(135deg,#006195 0%,#004a79 100%); }
  .index-label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; opacity: .65; font-family: monospace; }
  .index-value { font-size: 34px; font-weight: 900; line-height: 1; margin-top: 4px; font-variant-numeric: tabular-nums; }
  .index-bar { height: 2px; background: rgba(255,255,255,.15); border-radius: 2px; margin-top: 8px; }
  .index-fill { height: 100%; background: rgba(255,255,255,.55); border-radius: 2px; }
  .index-rank { font-size: 7px; font-weight: 700; opacity: .65; margin-top: 6px; font-family: monospace; font-variant-numeric: tabular-nums; }

  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .kpi { background: #fff; border: 1px solid #f1f5f9; border-radius: 6px; padding: 6px 8px; }
  .kpi-label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; font-family: monospace; line-height: 1.3; }
  .kpi-value { font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px; line-height: 1; font-variant-numeric: tabular-nums; }
  .kpi-value.na { color: #cbd5e1; font-size: 12px; }
  .kpi-unit { font-size: 8px; font-weight: 500; color: #94a3b8; }
  .kpi-bar { height: 2px; background: #f1f5f9; border-radius: 2px; margin-top: 4px; }
  .kpi-fill { height: 100%; background: #2563eb; border-radius: 2px; }

  .metrics-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 10px; }
  .metric-chip { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 7px 8px; }
  .metric-chip .m-label { font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #94a3b8; font-family: monospace; }
  .metric-chip .m-value { font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px; font-variant-numeric: tabular-nums; }

  .footer { border-top: 1px dashed #e2e8f0; margin-top: 10px; padding-top: 8px; display: flex; justify-content: space-between; align-items: center; }
  .footer-text { font-size: 7px; color: #94a3b8; font-family: monospace; }
</style>
</head><body>

<div class="status-stripe"></div>

<div style="position:fixed;bottom:-30px;right:-30px;width:190px;height:230px;opacity:0.025;pointer-events:none;z-index:0">
  <svg viewBox="0 0 32 40" fill="#1e3a8a" style="width:100%;height:100%">
    ${WATER_DROP_SVG}
  </svg>
</div>

<div style="position:relative;z-index:1">

<div class="header">
  <svg style="position:absolute;top:-12px;right:-12px;width:96px;height:116px;opacity:0.08;fill:white;pointer-events:none" viewBox="0 0 32 40">
    ${WATER_DROP_SVG}
  </svg>
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

</div>

<script>window.onload = function(){ window.print(); };<\/script>
</body></html>`;

  const win = window.open("", "_blank", "width=640,height=900");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
