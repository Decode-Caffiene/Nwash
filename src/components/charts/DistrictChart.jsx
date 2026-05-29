import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";

export default function DistrictChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm lg:col-span-2">
      <h3 className="text-base font-bold text-slate-900">
        District-wise Operator Distribution
      </h3>

      <p className="text-xs text-slate-500 mb-6">
        Number of operators and compliance rates by district
      </p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tickLine={false} />
            <YAxis tickLine={false} />
            <Tooltip />
            <Bar dataKey="Operators" fill="#0d9488" barSize={34} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}