import {
  Briefcase,
  Building2,
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import Modal from "../../../components/common/Modal";
import axiosInstance from "../../../api/axiosInstance";

// ── Helpers ───────────────────────────────────────────────────────────────────

// Fetches a document through the authenticated Axios client, creates a
// temporary blob URL, and opens it in a new tab. Using Axios instead of a
// plain <a href> means the session cookie / auth headers are sent, avoiding
// the 401 that a direct cross-site browser navigation would trigger.
async function openDocument(path) {
  try {
    const response = await axiosInstance.get("/form/fetchDocument", {
      params: { key: path },
    });
    const { success, url } = response.data ?? {};
    if (!success || !url) {
      console.error("fetchDocument returned unexpected response:", response.data);
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (err) {
    console.error("Failed to open document:", err);
  }
}

const scoreColor = (pct) => {
  if (pct == null) return "#94a3b8";
  if (pct >= 70) return "#059669";
  if (pct >= 40) return "#d97706";
  return "#dc2626";
};

function toDisplayPct(key, raw) {
  if (raw == null) return null;
  if (key === "OM_Score") return Number(raw) * 50;
  return Number(raw);
}

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// "Snake_Case_Key" → "Snake Case Key"
const fmtLabel = (key) =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ── Shared sub-components ─────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
      {children}
    </p>
  );
}

// icon is optional: omit to render a small bullet instead.
function Field({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-start gap-2.5">
      {Icon ? (
        <Icon size={13} className="mt-0.5 flex-shrink-0 text-slate-400" />
      ) : (
        <span className="mt-[7px] block h-1 w-1 flex-shrink-0 rounded-full bg-slate-300" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p
          className={`mt-0.5 break-all text-sm text-slate-700 ${
            mono ? "font-mono text-[11px]" : ""
          }`}
        >
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}

function ScoreCard({ label, scoreKey, raw, emphasis = false }) {
  const pct = toDisplayPct(scoreKey, raw);
  const color = scoreColor(pct);

  return (
    <div
      className={`flex flex-col rounded-xl border px-3 py-3 text-center ${
        emphasis ? "border-slate-200 bg-white" : "border-slate-100 bg-white"
      }`}
    >
      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-tight">
        {label}
      </p>
      <p
        className={`mt-1.5 font-black leading-none tabular-nums ${
          emphasis ? "text-3xl" : "text-xl"
        }`}
        style={{ color }}
      >
        {pct != null ? `${pct.toFixed(1)}` : "—"}
        {pct != null && (
          <span
            className="font-semibold opacity-50"
            style={{ fontSize: emphasis ? "1.1rem" : "0.7rem" }}
          >
            %
          </span>
        )}
      </p>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(0, pct ?? 0))}%`,
            background: color,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

// Renders every non-null entry in a KPI object without hardcoding field names.
// Returns null when the object has no displayable data, so it can be skipped.
function KpiObjectSection({ title, data }) {
  const entries = Object.entries(data ?? {}).filter(
    ([, v]) => v != null && v !== "",
  );
  if (entries.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <SectionLabel>{title}</SectionLabel>
      <div className="space-y-3">
        {entries.map(([key, value]) => (
          <Field key={key} label={fmtLabel(key)} value={String(value)} />
        ))}
      </div>
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  accepted: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
    label: "Accepted",
  },
  rejected: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    dot: "bg-red-400",
    label: "Rejected",
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
    label: "Pending Review",
  },
};

// Ordered list of KPI object keys and their display titles.
const KPI_SECTIONS = [
  { key: "Service_Coverage_Score", title: "Service Coverage Score" },
  { key: "Adequacy_Score", title: "Adequacy Score" },
  { key: "Water_Quality_Score", title: "Water Quality Score" },
  { key: "Reliability_Score", title: "Reliability Score" },
  { key: "Metering_Ratio_Score", title: "Metering Ratio Score" },
  { key: "NRW_Score", title: "NRW Score" },
  { key: "OM_Score", title: "OM Score" },
  { key: "Grievance_Score", title: "Grievance Score" },
];

// Summary Index scalar score keys shown in the compact sub-grid.
const SI_SUB_SCORES = [
  { key: "Water_Quality_Score", label: "Water Quality" },
  { key: "Adequacy_Score", label: "Adequacy" },
  { key: "Metering_Ratio_Score", label: "Metering Ratio" },
  { key: "OM_Score", label: "O&M Score" },
  { key: "NRW_Score", label: "NRW Score" },
  { key: "Grievance_Score", label: "Grievance" },

  { key: "Reliability_Score", label: "Reliability" },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function SubmissionDetailModal({ submission: sub, onClose }) {
  if (!sub) return null;
  console.log("sub", sub);

  const status = ((sub.Status ?? sub.status) || "pending").toLowerCase();
  const sc = STATUS_STYLE[status] ?? STATUS_STYLE.pending;

  const operator = sub.Operator_Info ?? {};
  const location = sub.Location ?? {};
  const si = sub.Summary_Index ?? {};

  const wardsRaw = location.Wards_Covered;
  const wardsDisplay = Array.isArray(wardsRaw)
    ? wardsRaw.join(", ")
    : (wardsRaw ?? null);

  const docs = Object.entries(sub.Documents ?? {})
    .filter(([, d]) => d?.path)
    .map(([key, d]) => ({
      label: d.name ?? key.replace(/_/g, " "),
      path: d.path,
    }));
  const hasSummaryData = Object.values(si).some((v) => v != null);

  // Only render KPI sections that contain at least one non-null entry.
  const activeKpiSections = KPI_SECTIONS.filter(({ key }) => {
    const obj = sub[key];
    return (
      obj != null &&
      typeof obj === "object" &&
      !Array.isArray(obj) &&
      Object.values(obj).some((v) => v != null && v !== "")
    );
  });

  const createdAt = formatDate(sub.createdAt ?? sub.Created_At);
  const updatedAt = formatDate(sub.updatedAt ?? sub.Updated_At);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={sub.WSUC_Name ?? "Submission Details"}
      className="max-w-4xl"
    >
      <div className="space-y-4">
        {/* ── Basic Information + Location ─────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <SectionLabel>Basic Information</SectionLabel>
            <div className="space-y-3">
              <Field icon={Building2} label="WSUC Name" value={sub.WSUC_Name} />
              <div className="flex items-start gap-2.5">
                <span className="mt-[7px] block h-1 w-1 flex-shrink-0 rounded-full bg-slate-300" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </p>
                  <span
                    className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${sc.bg} ${sc.text} ${sc.border}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <SectionLabel>Location</SectionLabel>
            <div className="space-y-3">
              <Field
                icon={Globe}
                label="Province"
                value={location.Province_Name}
              />
              <Field
                icon={Building2}
                label="District"
                value={location.District_Name}
              />
              <Field
                icon={MapPin}
                label="Municipality"
                value={location.Municipality_Name}
              />
              {wardsDisplay && (
                <Field
                  icon={MapPin}
                  label="Wards Covered"
                  value={wardsDisplay}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Operator Information ─────────────────────────────── */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <SectionLabel>Operator Information</SectionLabel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field icon={User} label="Full Name" value={operator.Name} />
            <Field
              icon={Briefcase}
              label="Designation"
              value={operator.Designation}
            />
            <Field icon={Mail} label="Email" value={operator.Email} />
            {operator.Phone && (
              <Field icon={Phone} label="Phone" value={operator.Phone} />
            )}
          </div>
        </div>

        {/* ── Detailed KPI sections ─────────────────────────────── */}
        {activeKpiSections.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {activeKpiSections.map(({ key, title }) => (
              <KpiObjectSection key={key} title={title} data={sub[key]} />
            ))}
          </div>
        )}

        {/* ── Documents ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <SectionLabel>Documents</SectionLabel>
          {docs.length === 0 ? (
            <p className="text-sm italic text-slate-400">
              No documents attached to this submission.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {docs.map(({ label, path }) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => openDocument(path)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <FileText
                    size={14}
                    className="flex-shrink-0 text-slate-400"
                  />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {label}
                  </span>
                  <ExternalLink
                    size={11}
                    className="flex-shrink-0 text-slate-300"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Submission Information ───────────────────────────── */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <SectionLabel>Submission Information</SectionLabel>
          <div className="space-y-3">
            <Field icon={Calendar} label="Created At" value={createdAt} />
            {updatedAt && (
              <Field icon={Calendar} label="Updated At" value={updatedAt} />
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
