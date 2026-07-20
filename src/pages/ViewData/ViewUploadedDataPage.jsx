import { useEffect } from "react";
import { Database, RefreshCw, Search } from "lucide-react";
import { STAT_CONFIG, TABS } from "./constants/viewDataConstants";
import { useSubmissionData } from "./hooks/useSubmissionData";
import { useSubmissionFilters } from "./hooks/useSubmissionFilters";
import SubmissionList from "./components/SubmissionList";
import ConfirmModal from "./components/ConfirmModal";
import Toast from "./components/Toast";
import SubmissionDetailModal from "./components/SubmissionDetailModal";
import { useState } from "react";

export default function ViewUploadedDataPage() {
  const {
    submissions,
    loading,
    error,
    fetchData,
    toast,
    setToast,
    confirmModal,
    setConfirmModal,
    actionLoading,
    requestAction,
    confirmAction,
  } = useSubmissionData();

  const {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    counts,
    filtered,
    safePage,
    totalPages,
    paginated,
    pageNumbers,
    setPage,
  } = useSubmissionFilters(submissions);

  const [detailRecord, setDetailRecord] = useState(null);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="space-y-6 pb-12">
        {/* ── Page header ─────────────────────────────────────────── */}
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
                Review WSUC registration submissions and approve or reject entries
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

        {/* ── Stats row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg }) => (
            <div
              key={key}
              className="rounded-2xl border border-surface-border bg-white p-4 shadow-sm"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
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

        {/* ── Filters ─────────────────────────────────────────────── */}
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

        {/* ── Submission list ─────────────────────────────────────── */}
        <SubmissionList
          loading={loading}
          error={error}
          submissions={submissions}
          filtered={filtered}
          paginated={paginated}
          safePage={safePage}
          totalPages={totalPages}
          pageNumbers={pageNumbers}
          actionLoading={actionLoading}
          onDetails={setDetailRecord}
          onAction={requestAction}
          onRetry={fetchData}
          onClearFilters={() => {
            setSearch("");
            setActiveTab("all");
          }}
          setPage={setPage}
        />
      </div>

      {/* ── Overlays ────────────────────────────────────────────────── */}
      <ConfirmModal
        modal={confirmModal}
        onConfirm={confirmAction}
        onCancel={() => setConfirmModal(null)}
        loading={!!confirmModal && !!actionLoading[confirmModal?.id]}
      />
      <SubmissionDetailModal
        submission={detailRecord}
        onClose={() => setDetailRecord(null)}
      />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
