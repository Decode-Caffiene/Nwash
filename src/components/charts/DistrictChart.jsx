import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
} from "recharts";

function ProvinceTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const provinceName = payload[0]?.payload?.name;
  const operators = payload[0]?.payload?.Operators;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-sm font-semibold text-slate-900">{provinceName}</div>
      <div className="text-sm text-slate-600">
        <span className="font-bold text-teal-600">{operators}</span> operators
      </div>
    </div>
  );
}

export default function DistrictChart({ data }) {
  // Expect `data` as array of district objects:
  // { name: "Kathmandu", Province: "Bagmati", Operators: 145 }
  // Fallback: if no Province field exists, show original behavior.

  const hasProvince = useMemo(
    () => Array.isArray(data) && data.some((d) => d?.Province),
    [data],
  );


  const provinceBarData = useMemo(() => {
    if (!hasProvince) return data;

    const aggregated = (data || []).reduce((acc, cur) => {
      const province = cur?.Province;
      if (!province) return acc;
      acc[province] = (acc[province] || 0) + (cur?.Operators || 0);
      return acc;
    }, {});

    return Object.entries(aggregated)
      .map(([province, operators]) => ({
        name: province,
        Operators: operators,
      }))
      .sort((a, b) => b.Operators - a.Operators);
  }, [data, hasProvince]);


  if (!hasProvince) {
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
            <BarChart data={provinceBarData}>
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

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm lg:col-span-2">
      <h3 className="text-base font-bold text-slate-900">
        Province-wise Operator Distribution
      </h3>

      <p className="text-xs text-slate-500 mb-6">
        Number of operators by province
      </p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={provinceBarData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tickLine={false} />
            <YAxis tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(13,148,136,0.08)" }}
              content={<ProvinceTooltip />}
            />
            <Bar dataKey="Operators" fill="#0d9488" barSize={34} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
