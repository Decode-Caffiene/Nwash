import { useMemo } from "react";

import Modal from "../../../../components/common/Modal";
import { formatNumber } from "../../../../utils/formatNumber";

function flattenValues(values) {
  // values is an object keyed by formId + section + question slug.
  // We display key/value pairs sorted by key.
  if (!values || typeof values !== "object") return [];

  return Object.entries(values)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const displayValue =
        typeof value === "number" ? formatNumber(value) : String(value);
      return { key, value: displayValue };
    });
}

function PreviewModal({ isOpen, onClose, formTitle, values }) {
  const items = useMemo(() => flattenValues(values), [values]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Preview: ${formTitle}`}>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-text-secondary">No data entered yet.</p>
        ) : (
          <div className="max-h-[60vh] overflow-auto pr-1">
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex flex-col gap-1 rounded-lg border border-surface-border bg-surface p-3"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    {item.key}
                  </div>
                  <div className="text-sm font-medium text-text-primary">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default PreviewModal;
