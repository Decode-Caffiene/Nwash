import { useEffect, useState } from "react";
import { Check, MessageSquare, RefreshCw, X } from "lucide-react";

export default function ConfirmModal({ modal, onConfirm, onCancel, loading }) {
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
                <span className="font-semibold text-slate-800">{modal.wsucName}</span>? The
                operator will be notified via email.
              </>
            ) : (
              <>
                You are about to reject{" "}
                <span className="font-semibold text-slate-800">{modal.wsucName}</span>.
                Please provide a reason — it will be sent to the operator via email.
              </>
            )}
          </p>

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
