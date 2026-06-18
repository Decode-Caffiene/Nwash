import { useEffect } from "react";
import { CheckCircle } from "lucide-react";

import Button from "../../../../components/common/Button";

export default function DrawingSuccess({
  municipalityName,
  district,
  province,
  drawingStats,
  onClose,
}) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 1200);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <section className="stat-card">
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4 p-4 rounded-full bg-emerald-100">
          <CheckCircle size={48} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-3">
          Coverage Area Saved!
        </h2>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4 text-left w-full max-w-md">
          <p className="text-sm font-semibold text-emerald-900 mb-3">📍 Location Details:</p>
          <div className="space-y-2 text-sm text-emerald-800">
            <div>
              <span className="font-medium">Municipality:</span> {municipalityName}
            </div>
            <div>
              <span className="font-medium">District:</span> {district}
            </div>
            <div>
              <span className="font-medium">Province:</span> {province}
            </div>
            <div className="border-t border-emerald-200 pt-2 mt-2">
              <span className="font-medium">Areas Drawn:</span> {drawingStats.lines}
            </div>
            <div>
              <span className="font-medium">Total Points:</span> {drawingStats.points}
            </div>
          </div>
        </div>
        <Button type="button" onClick={onClose}>
          Back to form
        </Button>
        <p className="mt-3 text-xs text-text-secondary">
          Closing in a moment...
        </p>
      </div>
    </section>
  );
}
