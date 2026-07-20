import { ChevronLeft, ChevronRight, Database, Search, XCircle } from "lucide-react";
import { PAGE_SIZE } from "../constants/viewDataConstants";
import SubmissionRow, { SkeletonRow } from "./SubmissionRow";

export default function SubmissionList({
  loading,
  error,
  submissions,
  filtered,
  paginated,
  safePage,
  totalPages,
  pageNumbers,
  actionLoading,
  onDetails,
  onAction,
  onRetry,
  onClearFilters,
  setPage,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-sm">
      {/* Loading skeleton */}
      {loading && (
        <div>
          {[...Array(5)].map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex flex-col items-center gap-3 py-16">
          <XCircle size={32} className="text-red-300" />
          <p className="text-sm font-medium text-red-500">{error}</p>
          <button
            onClick={onRetry}
            className="text-sm text-blue-600 underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty — no submissions at all */}
      {!loading && !error && submissions.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Database size={28} className="text-slate-400" />
          </div>
          <p className="font-semibold text-text-primary">No submissions yet</p>
          <p className="max-w-xs text-center text-sm text-text-secondary">
            When WSUC entities submit their registration data, entries will appear here for
            review.
          </p>
        </div>
      )}

      {/* Empty — filters produced no results */}
      {!loading && !error && submissions.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Search size={28} className="text-slate-300" />
          <p className="text-sm text-text-secondary">
            No submissions match your current filters.
          </p>
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 underline underline-offset-2"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Rows */}
      {!loading && !error && filtered.length > 0 && (
        <div className="divide-y divide-surface-border">
          {paginated.map((sub) => {
            const id = sub._id ?? sub.id;
            const operator = sub.Operator_Info ?? {};
            return (
              <SubmissionRow
                key={id}
                sub={sub}
                acting={actionLoading[id]}
                onDetails={() => onDetails(sub)}
                onAccept={(e) =>
                  onAction(id, "accepted", sub.WSUC_Name ?? "this submission", operator.Email ?? "", e)
                }
                onReject={(e) =>
                  onAction(id, "rejected", sub.WSUC_Name ?? "this submission", operator.Email ?? "", e)
                }
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-border bg-surface px-6 py-3">
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

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-border bg-white text-text-secondary transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>

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
                    onClick={() => setPage(n)}
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

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
  );
}
