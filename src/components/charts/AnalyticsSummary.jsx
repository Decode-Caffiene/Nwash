import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  categorizeProviders,
  calculateZoneStats,
} from "../../utils/zoneAnalytics";

export default function AnalyticsSummary({ chartData = [] }) {
  const [expandedZone, setExpandedZone] = useState(null);

  const { categorized, stats, summary } = useMemo(() => {
    const total = chartData.length;
    const categorizedData = categorizeProviders(chartData);

    const veryPoorStats = calculateZoneStats(categorizedData.VERY_POOR);
    const poorStats = calculateZoneStats(categorizedData.POOR);
    const inactiveStats = calculateZoneStats(categorizedData.INACTIVE);
    const activeStats = calculateZoneStats(categorizedData.ACTIVE);
    const improvingStats = calculateZoneStats(categorizedData.IMPROVING);
    return {
      categorized: categorizedData,
      stats: {
        veryPoor: veryPoorStats,
        poor: poorStats,
        inactive: inactiveStats,
        active: activeStats,
        improving: improvingStats,
      },
      summary: [
        {
          label: "Total Records",
          value: total,
          color: "text-slate-900",
          key: "total"
        },
        {
          label: "Very Poor",
          value: categorizedData.VERY_POOR.length,
          color: "text-red-600",
          key: "veryPoor",
          providers: categorizedData.VERY_POOR,
          stats: veryPoorStats,
        },
        {
          label: "Poor",
          value: categorizedData.POOR.length,
          color: "text-pink-600",
          key: "poor",
          providers: categorizedData.POOR,
          stats: poorStats,
        },
        {
          label: "Inactive",
          value: categorizedData.INACTIVE.length,
          color: "text-slate-600",
          key: "inactive",
          providers: categorizedData.INACTIVE,
          stats: inactiveStats,
        },
        {
          label: "Active",
          value: categorizedData.ACTIVE.length,
          color: "text-green-600",
          key: "active",
          providers: categorizedData.ACTIVE,
          stats: activeStats,
        },
        {
          label: "Improving",
          value: categorizedData.IMPROVING.length,
          color: "text-yellow-600",
          key: "improving",
          providers: categorizedData.IMPROVING,
          stats: improvingStats,
        },
      ],
    };
  }, [chartData]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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