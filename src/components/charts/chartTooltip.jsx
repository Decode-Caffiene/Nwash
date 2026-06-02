

import React from "react";

const ChartTooltip = React.memo(({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-2xl border border-slate-600 bg-slate-950 p-4 text-sm shadow-2xl backdrop-blur-md">
      <p className="mb-3 font-bold text-white text-base border-b border-slate-700 pb-2">
        {data.WSUC_Name}
      </p>

      <div className="space-y-2 text-slate-300">
        <p>
          <span className="text-slate-400">OEI:</span>{" "}
          <span className="font-semibold text-emerald-400">
            {data.Summary_Index?.OEI?.toFixed(1) || "N/A"}%
          </span>
        </p>
        <p>
          <span className="text-slate-400">SPI:</span>{" "}
          <span className="font-semibold text-sky-400">
            {data.Summary_Index?.SPI?.toFixed(1) || "N/A"}%
          </span>
        </p>
        <p className="text-xs text-slate-500 pt-2 border-t border-slate-800">
          ID: {data.WSUC_ID}
        </p>
      </div>
    </div>
  );
});

ChartTooltip.displayName = "ChartTooltip";

export default ChartTooltip;