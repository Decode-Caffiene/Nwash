import React, { useMemo } from "react";

export default function AnalyticsSummary({ chartData = [] }) {
  const summary = useMemo(() => {
    const total = chartData.length;
    const improvedZone = chartData.filter((item) => item.x >= 70 && item.y >= 70).length;
    const activeZone = chartData.filter((item) => item.x >= 50 && item.y >= 50).length;
    const highlighted = chartData.filter((item) => item.isHighlighted).length;

    return [
      { label: "Total Records", value: total },
      { label: "Improved Zone", value: improvedZone },
      { label: "Active Zone", value: activeZone },
      { label: "Highlighted", value: highlighted },
    ];
  }, [chartData]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {summary.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl bg-white border border-gray-200 px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
            {item.label}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}