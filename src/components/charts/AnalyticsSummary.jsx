import React, { useMemo } from "react";

export default function AnalyticsSummary({ chartData = [] }) {
  const summary = useMemo(() => {
    const total = chartData.length;

    const improvedZone = chartData.filter(
      (item) => item.x >= 70 && item.y >= 70
    ).length;

    const highlighted = chartData.filter(
      (item) => item.isHighlighted
    ).length;

    const activeZone = chartData.filter(
      (item) => item.x >= 50 && item.y >= 50
    ).length;

    return [
      { label: "Total Records", value: total },
      { label: "Improved Zone", value: improvedZone },
      { label: "Active Zone", value: activeZone },
      { label: "Highlighted", value: highlighted },
    ];
  }, [chartData]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {summary.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-surface-border bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            {item.label}
          </p>

          <p className="mt-1 text-xl font-bold text-text-primary">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}