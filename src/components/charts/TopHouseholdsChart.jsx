import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  Cell,
} from "recharts";

const TEAL = "#0d9488";

// Opacity steps give a visual ranking cue (brightest = #1).
const BAR_OPACITIES = [1, 0.82, 0.66, 0.52, 0.4];

function HHTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-slate-900">{name}</p>
      <p className="text-sm text-slate-600">
        <span className="font-bold text-teal-600">
          {Number(value).toLocaleString()}
        </span>{" "}
        households served
      </p>
    </div>
  );
}

// Compact axis tick: 12 000 → "12K"
const formatXTick = (v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v);

// Truncate very long WSUC names so they fit the fixed Y-axis width.
const truncateName = (name) =>
  name.length > 26 ? `${name.slice(0, 24)}…` : name;

export default function TopHouseholdsChart({ data }) {
  if (!data?.length) return null;

  return (
    <div className="w-full bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="text-base font-bold text-slate-900">
        Top 5 Service Providers by Households Served
      </h3>
      <p className="text-xs text-slate-500 mb-6">
        Ranked by Master Sheet HH Served — top five WSUCs
      </p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 2, right: 64, bottom: 2, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              horizontal={false}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickFormatter={formatXTick}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={192}
              tick={{ fontSize: 11, fill: "#475569" }}
              tickFormatter={truncateName}
            />
            <Tooltip
              cursor={{ fill: "rgba(13,148,136,0.07)" }}
              content={<HHTooltip />}
            />
            <Bar
              dataKey="value"
              barSize={26}
              radius={[0, 4, 4, 0]}
              label={{
                position: "right",
                formatter: (v) => Number(v).toLocaleString(),
                fontSize: 11,
                fill: "#64748b",
              }}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={TEAL}
                  fillOpacity={BAR_OPACITIES[i] ?? 0.4}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
