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

// All 7 provinces in Nepal
const ALL_PROVINCES = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

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

export default function DistrictChart({
  data,
  excludedCount = 0,
  totalOperators: totalFromParent = 0,
}) {
  // Expect `data` as array of district objects:
  // { name: "Kathmandu", Province: "Bagmati", Operators: 145 }
  // Fallback: if no Province field exists, show original behavior.

  const hasProvince = useMemo(
    () => Array.isArray(data) && data.some((d) => d?.Province),
    [data],
  );

  const provinceBarData = useMemo(() => {
    if (!hasProvince) return data;

    // Initialize all provinces with 0 operators
    const aggregated = ALL_PROVINCES.reduce((acc, province) => {
      acc[province] = 0;
      return acc;
    }, {});

    // Fill in actual data
    (data || []).forEach((cur) => {
      const province = cur?.Province;
      if (province && aggregated.hasOwnProperty(province)) {
        aggregated[province] =
          (aggregated[province] || 0) + (cur?.Operators || 0);
      }
    });

    return Object.entries(aggregated)
      .map(([province, operators]) => ({
        name: province,
        Operators: operators,
      }))
      .sort((a, b) => b.Operators - a.Operators);
  }, [data, hasProvince]);

  // Calculate total operators - must be called before any conditional returns
  const totalOperators = useMemo(() => {
    if (!Array.isArray(provinceBarData)) return 0;
    return provinceBarData.reduce((sum, p) => sum + (p.Operators || 0), 0);
  }, [provinceBarData]);

  if (!hasProvince) {
    return (
      <div className="w-full bg-white p-6 rounded-xl border shadow-sm">
        <h3 className="text-base font-bold text-slate-900">
          District-wise Operator Distribution
        </h3>

        <p className="text-xs text-slate-500 mb-6">
          Number of operators and compliance rates by district
        </p>

        <div className="h-80">
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
    <div className="w-full bg-white p-6 rounded-xl border shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">
          Province-wise Operator Distribution
        </h3>

        <p className="text-xs text-slate-500 mb-6">
          Real-time number of operators by province
        </p>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={provinceBarData} margin={{ bottom: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
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
    </div>
  );
}
