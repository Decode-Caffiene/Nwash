import { X } from "lucide-react";
import { TOAST_CFG } from "../constants/viewDataConstants";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  const cfg = TOAST_CFG[toast.type] ?? TOAST_CFG.info;
  const Icon = cfg.icon;

  return (
    <>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
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
    </>
  );
}
