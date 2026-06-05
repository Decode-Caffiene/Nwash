import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
} from "recharts";

function ProvinceTooltip({ active, payload, provinceDistrictsMap }) {
  if (!active || !payload?.length) return null;

  const provinceName = payload[0]?.payload?.name;
  const districts = provinceDistrictsMap?.[provinceName] || [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
      <div className="text-sm font-bold text-slate-900 mb-2">
        {provinceName}
      </div>

      {districts.length === 0 ? (
        <div className="text-xs text-slate-500">No district data</div>
      ) : (
        <div className="space-y-1 max-h-56 overflow-auto pr-1">
          {districts
            .slice()
            .sort((a, b) => (b.Operators || 0) - (a.Operators || 0))
            .map((d) => (
              <div
                key={d.name}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-slate-700 font-medium">{d.name}</span>
                <span className="text-slate-900">{d.Operators}</span>
              </div>
            ))}
        </div>
      )}
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

  const provinceDistrictsMap = useMemo(() => {
    if (!hasProvince) return null;
    return (data || []).reduce((acc, cur) => {
      const province = cur?.Province;
      if (!province) return acc;
      if (!acc[province]) acc[province] = [];
      acc[province].push({ name: cur.name, Operators: cur.Operators });
      return acc;
    }, {});
  }, [data, hasProvince]);

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

  // keep a local state to make tooltip consistent
  const [tooltipProvince, setTooltipProvince] = useState(null);

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
        Hover a province bar to see district-wise operators
      </p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={provinceBarData}
            onMouseMove={(state) => {
              const provinceName = state?.activePayload?.[0]?.payload?.name;
              setTooltipProvince(provinceName || null);
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tickLine={false} />
            <YAxis tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(13,148,136,0.08)" }}
              content={(props) => (
                <ProvinceTooltip
                  {...props}
                  provinceDistrictsMap={provinceDistrictsMap}
                />
              )}
            />
            <Bar dataKey="Operators" fill="#0d9488" barSize={34} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* optional: keep state in case you want to show selected province elsewhere */}
      {/* {tooltipProvince && <div className="text-xs text-slate-500 mt-2">Selected: {tooltipProvince}</div>} */}
    </div>
  );
}
