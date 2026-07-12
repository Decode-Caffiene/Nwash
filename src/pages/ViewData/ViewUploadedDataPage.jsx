import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Building2,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Database,
  FileText,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  RefreshCw,
  Search,
  User,
  X,
  XCircle,
} from "lucide-react";
import {
  acceptFormSubmission,
  getFormData,
  rejectFormSubmission,
} from "../../api/formApi";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG = {
  accepted: {
    label: "Accepted",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    accent: "bg-emerald-400",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    accent: "bg-red-400",
    icon: XCircle,
  },
  pending: {
    label: "Pending Review",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    accent: "bg-amber-400",
    icon: Clock,
  },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
];

const STAT_CONFIG = [
  {
    key: "total",
    label: "Total",
    icon: FileText,
    color: "text-slate-600",
    bg: "bg-slate-100",
  },
  {
    key: "pending",
    label: "Pending Review",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  {
    key: "accepted",
    label: "Accepted",
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    key: "rejected",
    label: "Rejected",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-100",
  },
];

const TOAST_CFG = {
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    icon_color: "text-emerald-500",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon_color: "text-red-500",
  },
  info: {
    icon: AlertCircle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    icon_color: "text-amber-500",
  },
};

function getStatus(sub) {
  return ((sub.Status ?? sub.status) || "pending").toLowerCase();
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({ toast, onClose }) {
  if (!toast) return null;
  const cfg = TOAST_CFG[toast.type] ?? TOAST_CFG.info;
  const Icon = cfg.icon;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none">
      <div
        key={toast.id}
        className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-lg ${cfg.bg} ${cfg.border}`}
        style={{
          minWidth: 280,
          maxWidth: 380,
          animation: "toast-in 0.25s ease-out forwards",
        }}
      >
        <Icon size={18} className={`flex-shrink-0 mt-0.5 ${cfg.icon_color}`} />
        <p className={`flex-1 text-sm font-medium leading-snug ${cfg.text}`}>
          {toast.message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className={`flex-shrink-0 rounded-md p-0.5 transition hover:bg-black/10 ${cfg.text}`}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({ modal, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState("");

  // Reset reason each time a new action is opened
  useEffect(() => {
    setReason("");
  }, [modal?.id, modal?.action]);

  if (!modal) return null;

  const isAccept = modal.action === "accepted";
  const canSubmit = isAccept || reason.trim().length > 0;
  const confirmCls = isAccept
    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
    : "bg-red-600 hover:bg-red-700 text-white";

  return (
    <div
      className="fixed inset-0 z-[8000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${isAccept ? "bg-emerald-100" : "bg-red-100"}`}
            >
              {isAccept ? (
                <Check size={18} className="text-emerald-600" />
              ) : (
                <X size={18} className="text-red-600" />
              )}
            </div>
            <h2 className="text-base font-bold text-slate-800">
              {isAccept ? "Confirm Acceptance" : "Confirm Rejection"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm leading-relaxed text-slate-600">
            {isAccept ? (
              <>
                Are you sure you want to accept{" "}
                <span className="font-semibold text-slate-800">
                  {modal.wsucName}
                </span>
                ? The operator will be notified via email.
              </>
            ) : (
              <>
                You are about to reject{" "}
                <span className="font-semibold text-slate-800">
                  {modal.wsucName}
                </span>
                . Please provide a reason — it will be sent to the operator via
                email.
              </>
            )}
          </p>

          {/* Reason textarea — reject only */}
          {!isAccept && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <MessageSquare size={12} />
                Reason for rejection
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a clear reason for rejecting this submission…"
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
                autoFocus
              />
              <p className="mt-1.5 text-right text-[11px] text-slate-400">
                {reason.trim().length === 0
                  ? "Required — cannot submit without a reason"
                  : `${reason.trim().length} characters`}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason)}
            disabled={loading || !canSubmit}
            className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${confirmCls}`}
          >
            {loading && <RefreshCw size={13} className="animate-spin" />}
            {isAccept ? "Yes, Accept" : "Yes, Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reusable sub-components ───────────────────────────────────────────────────

function StatusBadge({ status }) {
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

function DetailField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon size={13} className="mt-0.5 flex-shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 break-all text-text-primary">{value || "—"}</p>
      </div>
    </div>
  );
}

function SkeletonRow() {
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ViewUploadedDataPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { id, action, wsucName } | null
  const [page, setPage] = useState(1);
  const toastTimer = useRef(null);

  console.log("submissions", submissions);
  const showToast = useCallback((message, type = "success") => {
    clearTimeout(toastTimer.current);
    setToast({ message, type, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getFormData();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.message)
          ? data.message
          : [];
      setSubmissions(list);
    } catch (err) {
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Failed to load submissions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 and collapse any open row when the filter changes
  useEffect(() => {
    setPage(1);
    setExpandedId(null);
  }, [search, activeTab]);

  // Step 1: clicking Accept/Reject opens the confirmation modal
  const requestAction = (id, action, wsucName, userEmail, e) => {
    e.stopPropagation();
    setConfirmModal({ id, action, wsucName, userEmail });
  };

  // Step 2: user confirmed in modal — run the API call
  const confirmAction = async (reason) => {
    const { id, action, wsucName, userEmail } = confirmModal;

    setActionLoading((prev) => ({ ...prev, [id]: action }));
    setConfirmModal(null);

    try {
      if (action === "accepted") {
        await acceptFormSubmission(id, userEmail);
      } else {
        await rejectFormSubmission(id, reason, userEmail);
      }

      setSubmissions((prev) =>
        prev.map((s) =>
          (s._id ?? s.id) === id ? { ...s, Status: action, status: action } : s,
        ),
      );

      if (action === "accepted") {
        showToast(`${wsucName} has been accepted successfully.`, "success");
      } else {
        showToast(`${wsucName} has been rejected.`, "info");
      }
    } catch (err) {
      showToast(
        err?.response?.data?.message ?? "Action failed. Please try again.",
        "error",
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const counts = {
    total: submissions.length,
    pending: submissions.filter((s) => getStatus(s) === "pending").length,
    accepted: submissions.filter((s) => getStatus(s) === "accepted").length,
    rejected: submissions.filter((s) => getStatus(s) === "rejected").length,
  };

  const filtered = submissions
    .filter((s) => activeTab === "all" || getStatus(s) === activeTab)
    .filter((s) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (s.WSUC_Name ?? "").toLowerCase().includes(q) ||
        (s.Location?.Province_Name ?? "").toLowerCase().includes(q) ||
        (s.Location?.District_Name ?? "").toLowerCase().includes(q) ||
        (s.Location?.Municipality_Name ?? "").toLowerCase().includes(q) ||
        (s.Operator_Info?.Name ?? "").toLowerCase().includes(q)
      );
    });

  const PAGE_SIZE = 7;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // Page numbers to render: always first, last, current±1, ellipsis gaps
  const pageNumbers = (() => {
    const nums = new Set(
      [1, totalPages, safePage, safePage - 1, safePage + 1].filter(
        (n) => n >= 1 && n <= totalPages,
      ),
    );
    const sorted = [...nums].sort((a, b) => a - b);
    const result = [];
    let prev = null;
    for (const n of sorted) {
      if (prev !== null && n - prev > 1) result.push("…");
      result.push(n);
      prev = n;
    }
    return result;
  })();

  return (
    <>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      <div className="space-y-6 pb-12">
        {/* ── Page header ───────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-md">
              <Database size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">
                Admin · Data Review
              </p>
              <h1 className="text-xl font-bold leading-tight text-text-primary">
                Submissions Review Portal
              </h1>
              <p className="mt-0.5 text-xs text-text-secondary">
                Review WSUC registration submissions and approve or reject
                entries
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm font-medium text-text-primary shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg }) => (
            <div
              key={key}
              className="rounded-2xl border border-surface-border bg-white p-4 shadow-sm"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}
              >
                <Icon size={17} className={color} />
              </div>
              <p className="mt-3 text-2xl font-bold tabular-nums text-text-primary">
                {loading ? (
                  <span className="inline-block h-7 w-10 animate-pulse rounded-md bg-slate-200" />
                ) : (
                  counts[key]
                )}
              </p>
              <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-0.5 rounded-xl border border-surface-border bg-surface p-1">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                  activeTab === key
                    ? "bg-white text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {label}
                {!loading && (
                  <span className="ml-1.5 text-[11px] opacity-55">
                    ({key === "all" ? counts.total : counts[key]})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, district, operator…"
              className="w-72 rounded-xl border border-surface-border bg-white py-2 pl-9 pr-4 text-sm outline-none placeholder:text-text-secondary transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* ── Submission list ───────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-sm">
          {loading && (
            <div>
              {[...Array(5)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-16">
              <XCircle size={32} className="text-red-300" />
              <p className="text-sm font-medium text-red-500">{error}</p>
              <button
                onClick={fetchData}
                className="text-sm text-blue-600 underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && submissions.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Database size={28} className="text-slate-400" />
              </div>
              <p className="font-semibold text-text-primary">
                No submissions yet
              </p>
              <p className="max-w-xs text-center text-sm text-text-secondary">
                When WSUC entities submit their registration data, entries will
                appear here for review.
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            submissions.length > 0 &&
            filtered.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-16">
                <Search size={28} className="text-slate-300" />
                <p className="text-sm text-text-secondary">
                  No submissions match your current filters.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveTab("all");
                  }}
                  className="text-sm text-blue-600 underline underline-offset-2"
                >
                  Clear filters
                </button>
              </div>
            )}

          {!loading && !error && filtered.length > 0 && (
            <div className="divide-y divide-surface-border">
              {paginated.map((sub) => {
                const id = sub._id ?? sub.id;
                const status = getStatus(sub);
                const acting = actionLoading[id];
                const isDone = status === "accepted" || status === "rejected";
                const isExpanded = expandedId === id;
                const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending;
                const operator = sub.Operator_Info ?? {};
                const location = sub.Location ?? {};
                const locationBreadcrumb = [
                  location.Municipality_Name,
                  location.District_Name,
                  location.Province_Name,
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <div key={id} className="group relative">
                    <div
                      className={`absolute inset-y-0 left-0 w-1 ${cfg.accent} rounded-l-sm`}
                    />

                    {/* Collapsed row */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        setExpandedId(isExpanded ? null : id)
                      }
                      className="flex cursor-pointer flex-wrap items-center gap-4 py-4 pl-7 pr-6 transition-colors hover:bg-slate-50/70"
                    >
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

                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) =>
                            requestAction(
                              id,
                              "accepted",
                              sub.WSUC_Name ?? "this submission",
                              operator.Email ?? "",
                              e,
                            )
                          }
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
                          onClick={(e) =>
                            requestAction(
                              id,
                              "rejected",
                              sub.WSUC_Name ?? "this submission",
                              operator.Email ?? "",
                              e,
                            )
                          }
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

                      <span className="text-text-secondary">
                        {isExpanded ? (
                          <ChevronUp size={15} />
                        ) : (
                          <ChevronDown size={15} />
                        )}
                      </span>
                    </div>

                    {/* Expanded detail panel */}
                    {isExpanded && (
                      <div className="border-t border-surface-border bg-slate-50/60 py-5 pl-7 pr-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                          <div className="space-y-3 rounded-xl border border-surface-border bg-white p-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              Operator Info
                            </p>
                            <DetailField
                              icon={User}
                              label="Full Name"
                              value={operator.Name}
                            />
                            <DetailField
                              icon={Mail}
                              label="Email"
                              value={operator.Email}
                            />
                            <DetailField
                              icon={Briefcase}
                              label="Designation"
                              value={operator.Designation}
                            />
                          </div>

                          <div className="space-y-3 rounded-xl border border-surface-border bg-white p-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              Location Details
                            </p>
                            <DetailField
                              icon={Globe}
                              label="Province"
                              value={location.Province_Name}
                            />
                            <DetailField
                              icon={Building2}
                              label="District"
                              value={location.District_Name}
                            />
                            <DetailField
                              icon={MapPin}
                              label="Municipality"
                              value={location.Municipality_Name}
                            />
                          </div>

                          <div className="space-y-3 rounded-xl border border-surface-border bg-white p-4">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              Submission
                            </p>
                            <DetailField
                              icon={FileText}
                              label="Documents"
                              value={
                                sub.Documents?.length
                                  ? `${sub.Documents.length} file${sub.Documents.length !== 1 ? "s" : ""} attached`
                                  : "No documents attached"
                              }
                            />
                            <div className="flex items-start gap-2.5 text-sm">
                              <Database
                                size={13}
                                className="mt-0.5 flex-shrink-0 text-slate-400"
                              />
                              <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                  Submission ID
                                </p>
                                <p className="mt-0.5 break-all font-mono text-[11px] text-text-secondary">
                                  {id}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-border bg-surface px-6 py-3">
              {/* Count label */}
              <p className="text-xs text-text-secondary">
                Showing{" "}
                <span className="font-semibold text-text-primary tabular-nums">
                  {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-text-primary tabular-nums">
                  {filtered.length}
                </span>{" "}
                submissions
              </p>

              {/* Page controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  {/* Prev */}
                  <button
                    type="button"
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      setExpandedId(null);
                    }}
                    disabled={safePage === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-white text-text-secondary transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {/* Page numbers */}
                  {pageNumbers.map((n, i) =>
                    n === "…" ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="flex h-8 w-8 items-center justify-center text-xs text-text-secondary select-none"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        onClick={() => {
                          setPage(n);
                          setExpandedId(null);
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition tabular-nums ${
                          n === safePage
                            ? "border-blue-500 bg-blue-600 text-white"
                            : "border-surface-border bg-white text-text-secondary hover:bg-slate-50"
                        }`}
                      >
                        {n}
                      </button>
                    ),
                  )}

                  {/* Next */}
                  <button
                    type="button"
                    onClick={() => {
                      setPage((p) => Math.min(totalPages, p + 1));
                      setExpandedId(null);
                    }}
                    disabled={safePage === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-white text-text-secondary transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Overlays ──────────────────────────────────────────────────── */}
      <ConfirmModal
        modal={confirmModal}
        onConfirm={confirmAction}
        onCancel={() => setConfirmModal(null)}
        loading={!!confirmModal && !!actionLoading[confirmModal?.id]}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
