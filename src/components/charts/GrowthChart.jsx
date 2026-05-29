import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function GrowthChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm lg:col-span-2">
      <h3 className="text-base font-bold text-slate-900">
        Monthly Growth Trend
      </h3>

      <p className="text-xs text-slate-500 mb-6">
        Operator onboarding trend
      </p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line
              type="linear"
              dataKey="Operators"
              stroke="#0d9488"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}