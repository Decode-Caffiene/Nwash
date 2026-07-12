import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const PROVINCE_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#0ea5e9",
  "#10b981",
  "#8b5cf6",
  "#f97316",
  "#ec4899",
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-lg">
      <div className="text-sm font-semibold text-slate-900">{d.province}</div>
      <div className="mt-1 space-y-0.5 text-xs text-slate-600">
        <div>
          <span className="font-medium">{d.projects}</span> projects
        </div>
        <div>
          Avg OEI:{" "}
          <span className="font-medium">{d.averageOEI.toFixed(1)}</span>
        </div>
        <div>
          Avg SPI:{" "}
          <span className="font-medium">{d.averageSPI.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default function ProvinceComplianceDonut({ data }) {
  const total = useMemo(
    () => data.reduce((s, d) => s + d.projects, 0),
    [data],
  );

  const chartData = useMemo(
    () => data.map((d) => ({ ...d, name: d.province, value: d.projects })),
    [data],
  );

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm w-full">
      <h3 className="text-base font-bold text-slate-900">
        Province-wise Distribution
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Projects by province (valid OEI &amp; SPI only)
      </p>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              outerRadius={85}
              innerRadius={40}
              label={({ value }) => {
                const pct =
                  total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                return `${pct}%`;
              }}
              labelLine
            >
              {chartData.map((_, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={PROVINCE_COLORS[i % PROVINCE_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(_value, entry) => entry.payload.province}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}