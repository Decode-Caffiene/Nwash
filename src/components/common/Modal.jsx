import { X } from "lucide-react";
import Button from "./Button";
import { cn } from "../../utils/helpers";

function Modal({ isOpen, onClose, title, children, footer, className = "" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div
        className={cn(
          "max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl",
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-text-secondary hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[calc(90vh-9rem)] overflow-y-auto pr-1">
          {children}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          {footer || (
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
