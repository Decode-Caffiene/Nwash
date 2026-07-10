import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  categorizeProviders,
  calculateZoneStats,
} from "../../utils/zoneAnalytics";

// One card per chart zone, ordered from worst (9) to best (1) category,
// matching the categories in the DWSSM KPI mastersheet.
const ZONE_CARDS = [
  { key: "veryPoor", zone: "VERY_POOR", label: "Very Poor", color: "text-red-600" },
  { key: "poor", zone: "POOR", label: "Poor", color: "text-pink-600" },
  { key: "inactive", zone: "INACTIVE", label: "Inactive", color: "text-slate-600" },
  { key: "active", zone: "ACTIVE", label: "Active", color: "text-green-600" },
  { key: "improving", zone: "IMPROVING", label: "Improving", color: "text-yellow-600" },
  { key: "improved", zone: "IMPROVED", label: "Improved", color: "text-lime-700" },
  { key: "justEfficient", zone: "JUST_EFFICIENT", label: "Just Efficient", color: "text-lime-600" },
  { key: "moderatelyEfficient", zone: "MODERATELY_EFFICIENT", label: "Moderately Efficient", color: "text-cyan-600" },
  { key: "highlyEfficient", zone: "HIGHLY_EFFICIENT", label: "Highly Efficient", color: "text-blue-700" },
];

export default function AnalyticsSummary({ chartData = [] }) {
  const [expandedZone, setExpandedZone] = useState(null);

  const summary = useMemo(() => {
    const categorizedData = categorizeProviders(chartData);

    return [
      {
        label: "Total Records",
        value: chartData.length,
        color: "text-slate-900",
        key: "total",
      },
      ...ZONE_CARDS.map(({ key, zone, label, color }) => {
        const providers = categorizedData[zone];
        return {
          label,
          value: providers.length,
          color,
          key,
          providers,
          stats: calculateZoneStats(providers),
        };
      }),
    ];
  }, [chartData]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {summary.map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl bg-white border border-gray-200 px-5 py-4 shadow-sm hover:shadow-md transition-all ${
              item.providers && item.providers.length > 0 ? "cursor-pointer" : ""
            }`}
            onClick={() => {
              if (item.providers && item.providers.length > 0) {
                setExpandedZone(expandedZone === item.key ? null : item.key);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-widest text-gray-500">
                  {item.label}
                </p>
                <p className={`mt-2 text-3xl font-bold ${item.color}`}>
                  {item.value}
                </p>
              </div>
              {item.providers && item.providers.length > 0 && (
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${
                    expandedZone === item.key ? "rotate-180" : ""
                  }`}
                />
              )}
            </div>

            {/* Expanded Provider Details */}
            {expandedZone === item.key && item.providers && (
              <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg OEI:</span>
                    <span className="font-semibold text-gray-900">{item.stats.avgX}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg SPI:</span>
                    <span className="font-semibold text-gray-900">{item.stats.avgY}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">OEI Range:</span>
                    <span className="font-semibold text-gray-900">
                      {item.stats.minX}% - {item.stats.maxX}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SPI Range:</span>
                    <span className="font-semibold text-gray-900">
                      {item.stats.minY}% - {item.stats.maxY}%
                    </span>
                  </div>
                </div>

                {/* Provider List */}
                {item.providers.length > 0 && (
                  <div className="mt-3 border-t border-gray-200 pt-3 max-h-64 overflow-y-auto">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Providers:</p>
                    <div className="space-y-2">
                      {item.providers.map((provider, idx) => (
                        <div
                          key={idx}
                          className="rounded bg-gray-50 p-2 text-xs border border-gray-100"
                        >
                          <p className="font-semibold text-gray-900 truncate">
                            {provider.WSUC_Name || "N/A"}
                          </p>
                          <div className="mt-1 grid grid-cols-2 gap-1 text-gray-600">
                            <div>
                              <span className="text-gray-500">OEI:</span>
                              <span className="ml-1 font-semibold text-gray-900">
                                {provider.x?.toFixed(1) || "N/A"}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">SPI:</span>
                              <span className="ml-1 font-semibold text-gray-900">
                                {provider.y?.toFixed(1) || "N/A"}%
                              </span>
                            </div>
                          </div>
                          {provider.WSUC_ID && (
                            <p className="mt-1 text-gray-500">ID: {provider.WSUC_ID}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}