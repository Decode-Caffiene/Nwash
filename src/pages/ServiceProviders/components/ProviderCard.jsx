import { Clock, Download, Home, Users } from "lucide-react";
import { dv, fmtNum, fmtScore, getCardStatus } from "../utils/providerUtils";
import { STATUS } from "../constants/providerConstants";
import { exportToPDF } from "../utils/exportToPDF";

export function StatusDot({ status }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
      style={{ background: STATUS[status]?.dot ?? "#94a3b8" }}
    />
  );
}

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

export default function ProviderCard({ provider, onClick }) {
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
  const hoursDisplay = hours != null ? `${Number(hours).toFixed(0)} hrs/day` : null;

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
      <div className={`w-[3px] flex-shrink-0 ${sc.stripe}`} />

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 px-3 py-3">
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
              <p className="mt-0.5 text-[10px] italic text-slate-300">No location</p>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => exportToPDF(provider, e)}
            title="Export as PDF"
            className="flex-shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-white/60 hover:text-slate-700"
          >
            <Download size={12} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <MetricPill label="SPI" value={spi} />
            <MetricPill label="OEI" value={oei} />
          </div>

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
