import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0].payload;
    const total = payload[0].payload.total;
    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
        <div className="text-sm font-semibold text-slate-900">{name}</div>
        <div className="text-sm text-slate-600">
          <span className="font-bold">{value}</span> operators ({percentage}%)
        </div>
      </div>
    );
  }
  return null;
};

export default function ComplianceChart({ data }) {
  const totalOperators = useMemo(() => {
    return data.reduce((sum, item) => sum + (item.value || 0), 0);
  }, [data]);

  const dataWithTotal = useMemo(() => {
    return data.map((item) => ({
      ...item,
      total: totalOperators,
    }));
  }, [data, totalOperators]);

  const labels = useMemo(() => {
    return data.map((item) => {
      const percentage =
        totalOperators > 0 ? ((item.value / totalOperators) * 100).toFixed(1) : 0;
      return `${item.name}: ${percentage}%`;
    });
  }, [data, totalOperators]);

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="text-base font-bold text-slate-900">
        Compliance Status
      </h3>

      <p className="text-xs text-slate-500 mb-4">
        Overall compliance distribution
      </p>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithTotal}
              dataKey="value"
              outerRadius={85}
              label={({ value, total, name }) => {
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${percentage}%`;
              }}
              labelLine={true}
            >
              {dataWithTotal.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => {
                const item = entry.payload;
                const percentage =
                  totalOperators > 0
                    ? ((item.value / totalOperators) * 100).toFixed(1)
                    : 0;
                return `${item.name} (${item.value} - ${percentage}%)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}