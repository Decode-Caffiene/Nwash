import { useEffect, useState } from "react";
import { CheckCircle, Clock, Database, FileText, RefreshCw, XCircle } from "lucide-react";
import {
  acceptFormSubmission,
  getFormData,
  rejectFormSubmission,
} from "../../api/formApi";

function StatusBadge({ status }) {
  const s = (status ?? "pending").toLowerCase();
  const map = {
    accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const label = s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[s] ?? map.pending}`}
    >
      {label}
    </span>
  );
}

const STATS = [
  { key: "total",    label: "Total",    icon: FileText,     color: "text-blue-600"    },
  { key: "pending",  label: "Pending",  icon: Clock,        color: "text-amber-600"   },
  { key: "accepted", label: "Accepted", icon: CheckCircle,  color: "text-emerald-600" },
  { key: "rejected", label: "Rejected", icon: XCircle,      color: "text-red-500"     },
];

export default function ViewUploadedDataPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getFormData();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ?? err?.message ?? "Failed to load submissions.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id, action) => {
    setActionLoading((prev) => ({ ...prev, [id]: action }));
    try {
      if (action === "accepted") await acceptFormSubmission(id);
      else await rejectFormSubmission(id);
      setSubmissions((prev) =>
        prev.map((s) => ((s._id ?? s.id) === id ? { ...s, status: action } : s)),
      );
    } catch (err) {
      alert(err?.response?.data?.message ?? "Action failed. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  const counts = {
    total:    submissions.length,
    pending:  submissions.filter((s) => !s.status || s.status.toLowerCase() === "pending").length,
    accepted: submissions.filter((s) => s.status?.toLowerCase() === "accepted").length,
    rejected: submissions.filter((s) => s.status?.toLowerCase() === "rejected").length,
  };

  const filtered = submissions.filter((row) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (row.WSUC_Name ?? row.name ?? "").toLowerCase().includes(q) ||
      (row.Location?.District_Name ?? row.district ?? "").toLowerCase().includes(q) ||
      (row.Location?.Municipality_Name ?? row.municipality ?? "").toLowerCase().includes(q) ||
      (row.Location?.Province_Name ?? row.province ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
            Admin Panel
          </p>
          <h1 className="mt-2 text-3xl font-bold text-text-primary">
            Uploaded Form Data
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            Review WSUC data submissions. Accept valid entries or reject
            incomplete ones.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition hover:bg-surface disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="stat-card flex items-center gap-4">
            <Icon size={22} className={color} />
            <div>
              <p className="text-2xl font-bold text-text-primary">
                {loading ? "—" : counts[key]}
              </p>
              <p className="text-xs text-text-secondary">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + count */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, district, municipality…"
          className="w-full max-w-sm rounded-xl border border-surface-border bg-white px-4 py-2.5 text-sm outline-none placeholder:text-text-secondary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 transition"
        />
        {!loading && !error && (
          <p className="text-sm text-text-secondary">
            {filtered.length} of {submissions.length} submissions
          </p>
        )}
      </div>

      {/* Table */}
      <div className="stat-card overflow-hidden p-0">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
            <span className="text-sm text-text-secondary">Loading submissions…</span>
          </div>
        )}

        {!loading && error && (
          <div className="py-12 text-center text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && submissions.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Database size={32} className="text-text-secondary" />
            <p className="text-sm text-text-secondary">No submissions found.</p>
          </div>
        )}

        {!loading && !error && submissions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border bg-surface text-left">
                  {["WSUC / Organization", "Province", "District", "Municipality", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-secondary"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-text-secondary">
                      No submissions match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((sub) => {
                    const id = sub._id ?? sub.id;
                    const acting = actionLoading[id];
                    const status = (sub.status ?? "pending").toLowerCase();
                    const isDone = status === "accepted" || status === "rejected";

                    return (
                      <tr key={id} className="transition-colors hover:bg-slate-50">
                        <td className="px-5 py-4 font-medium text-text-primary">
                          {sub.WSUC_Name ?? sub.wsuc_name ?? sub.organizationName ?? sub.name ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-text-secondary">
                          {sub.Location?.Province_Name ?? sub.province ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-text-secondary">
                          {sub.Location?.District_Name ?? sub.district ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-text-secondary">
                          {sub.Location?.Municipality_Name ?? sub.municipality ?? "—"}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={sub.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAction(id, "accepted")}
                              disabled={!!acting || isDone}
                              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {acting === "accepted" ? "…" : "Accept"}
                            </button>
                            <button
                              onClick={() => handleAction(id, "rejected")}
                              disabled={!!acting || isDone}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {acting === "rejected" ? "…" : "Reject"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
