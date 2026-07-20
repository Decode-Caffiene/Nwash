import { Check, FileText, MapPin, RefreshCw, X } from "lucide-react";
import { STATUS_CFG } from "../constants/viewDataConstants";
import { getLocationBreadcrumb, getStatus } from "../utils/submissionUtils";

// ── Atoms ──────────────────────────────────────────────────────────────────

export function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function Initials({ name }) {
  const chars = (name ?? "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
      {chars}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-4 border-b border-surface-border px-6 py-5">
      <div className="h-9 w-9 rounded-full bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 rounded bg-slate-200" />
        <div className="h-3 w-64 rounded bg-slate-100" />
      </div>
      <div className="h-6 w-24 rounded-full bg-slate-200" />
      <div className="flex gap-2">
        <div className="h-8 w-18 rounded-lg bg-slate-200" />
        <div className="h-8 w-18 rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

// ── Row ────────────────────────────────────────────────────────────────────

export default function SubmissionRow({ sub, acting, onDetails, onAccept, onReject }) {
  const status = getStatus(sub);
  const isDone = status === "accepted" || status === "rejected";
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
  const operator = sub.Operator_Info ?? {};
  const locationBreadcrumb = getLocationBreadcrumb(sub.Location ?? {});

  return (
    <div className="group relative">
      <div className={`absolute inset-y-0 left-0 w-1 ${cfg.accent} rounded-l-sm`} />

      <div className="flex flex-wrap items-center gap-4 py-4 pl-7 pr-6">
        <Initials name={sub.WSUC_Name ?? operator.Name} />

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-text-primary">
            {sub.WSUC_Name ?? "Unnamed WSUC"}
          </p>
          {locationBreadcrumb && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-text-secondary">
              <MapPin size={10} className="flex-shrink-0" />
              {locationBreadcrumb}
            </p>
          )}
        </div>

        <div className="hidden min-w-[160px] md:block">
          <p className="text-sm font-medium text-text-primary">
            {operator.Name ?? "—"}
          </p>
          <p className="text-xs text-text-secondary">
            {operator.Designation ?? ""}
          </p>
        </div>

        <StatusBadge status={status} />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDetails}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <FileText size={11} />
            Details
          </button>
          <button
            type="button"
            onClick={onAccept}
            disabled={!!acting || isDone}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {acting === "accepted" ? (
              <RefreshCw size={11} className="animate-spin" />
            ) : (
              <Check size={11} />
            )}
            Accept
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={!!acting || isDone}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {acting === "rejected" ? (
              <RefreshCw size={11} className="animate-spin" />
            ) : (
              <X size={11} />
            )}
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
