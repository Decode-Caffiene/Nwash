import { useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";

import Button from "../../../../components/common/Button";

export default function DrawingSuccess({
  municipalityName,
  district,
  province,
  drawingStats,
  onClose,
}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const timer = window.setTimeout(() => onCloseRef.current(), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="stat-card overflow-hidden">
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="mb-6 p-4 rounded-full bg-emerald-100 shadow-inner">
          <CheckCircle size={56} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Coverage Area Saved!
        </h2>
        <p className="text-sm text-text-secondary mb-8 max-w-sm">
          The coverage area has been successfully recorded for the selected municipality.
        </p>
        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-xl p-5 mb-6 text-left w-full max-w-md shadow-sm">
          <p className="text-sm font-bold text-emerald-900 mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            Location Details
          </p>
          <div className="space-y-3 text-sm text-emerald-800">
            <div className="flex justify-between">
              <span className="font-medium text-emerald-700">Municipality</span>
              <span className="text-emerald-900 font-medium">{municipalityName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-emerald-700">District</span>
              <span className="text-emerald-900">{district}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-emerald-700">Province</span>
              <span className="text-emerald-900">{province}</span>
            </div>
            <div className="border-t border-emerald-200 pt-3 mt-3 flex justify-between">
              <span className="font-medium text-emerald-700">Areas Drawn</span>
              <span className="text-emerald-900 font-semibold">{drawingStats.lines}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-emerald-700">Total Points</span>
              <span className="text-emerald-900 font-semibold">{drawingStats.points}</span>
            </div>
          </div>
        </div>
        <Button type="button" onClick={onClose}>
          Back to form
        </Button>
        <p className="mt-4 text-xs text-text-secondary/60">
          Closing automatically...
        </p>
      </div>
    </section>
  );
}
