import React from "react";

const ChartTooltip = React.memo(({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-brand-primary bg-slate-950 p-3 text-xs shadow-xl">
      <p className="mb-2 font-semibold text-brand-light">
        {data.WSUC_Name}
      </p>

      <div className="space-y-1 text-white">
        <p>
          <span className="text-slate-400">OEI:</span>{" "}
          {data.Summary_Index?.OEI?.toFixed(2) || "N/A"}%
        </p>

        <p>
          <span className="text-slate-400">SPI:</span>{" "}
          {data.Summary_Index?.SPI?.toFixed(2) || "N/A"}%
        </p>

        <p className="border-t border-white/10 pt-1 text-slate-400">
          ID: {data.WSUC_ID}
        </p>
      </div>
    </div>
  );
});

ChartTooltip.displayName = "ChartTooltip";

export default ChartTooltip;