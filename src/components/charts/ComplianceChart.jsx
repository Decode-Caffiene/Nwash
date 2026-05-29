import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

export default function ComplianceChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="text-base font-bold text-slate-900">
        Compliance Status
      </h3>

      <p className="text-xs text-slate-500 mb-4">
        Overall compliance distribution
      </p>

      <div className="h-56 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" outerRadius={85}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute top-10 left-6 text-xs font-bold text-[#0d9488]">
          Compliant: 55%
        </div>
        <div className="absolute bottom-4 left-6 text-xs font-bold text-[#3b82f6]">
          Partial: 33%
        </div>
        <div className="absolute bottom-20 right-6 text-xs font-bold text-[#dc2626]">
          Non-Compliant: 12%
        </div>
      </div>
    </div>
  );
}