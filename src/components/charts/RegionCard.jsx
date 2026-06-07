import React, { useState } from "react";
import { AlertCircle, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";

export default function RegionCard({
  zone,
  stats,
  providers = [],
  showDetails = true,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch (zone.name) {
      case "VERY POOR":
        return <AlertCircle size={24} />;
      case "POOR":
        return <TrendingDown size={24} />;
      case "IMPROVING":
        return <TrendingUp size={24} />;
      default:
        return <AlertCircle size={24} />;
    }
  };

  return (
    <div
      className={`${zone.bgColor} ${zone.borderColor} rounded-lg border shadow-sm transition-all hover:shadow-md overflow-hidden`}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wide ${zone.textColor}`}>
              {zone.name}
            </h3>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {stats.count}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {stats.count === 1 ? "Provider" : "Providers"}
            </p>
          </div>
          <div className={`rounded-lg p-3 ${zone.bgColor} ${zone.textColor}`}>
            {getIcon()}
          </div>
        </div>

        {/* Stats */}
        {showDetails && stats.count > 0 && (
          <div className="mt-5 space-y-3 border-t border-slate-300 pt-4">
            <div className="flex justify-between">
              <span className="text-xs text-slate-600">Avg Efficiency (OEI)</span>
              <span className="font-semibold text-slate-900">{stats.avgX}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-600">Avg Quality (SPI)</span>
              <span className="font-semibold text-slate-900">{stats.avgY}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-600">Efficiency Range</span>
              <span className="font-semibold text-slate-900">
                {stats.minX}% - {stats.maxX}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-600">Quality Range</span>
              <span className="font-semibold text-slate-900">
                {stats.minY}% - {stats.maxY}%
              </span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {stats.count === 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">No providers in this zone</p>
          </div>
        )}
      </div>

      {/* Expandable Provider List */}
      {providers.length > 0 && (
        <div className="border-t border-slate-300">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-6 py-3 hover:bg-white hover:bg-opacity-50 transition"
          >
            <span className="text-xs font-semibold text-slate-700 uppercase">
              View Providers
            </span>
            <ChevronDown
              size={18}
              className={`text-slate-600 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          {isExpanded && (
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2 px-6 pb-4">
                {providers.map((provider, idx) => (
                  <div
                    key={idx}
                    className="rounded border border-slate-300 bg-white bg-opacity-50 p-3 text-sm"
                  >
                    <p className="font-semibold text-slate-900 truncate">
                      {provider.WSUC_Name || "N/A"}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-500">OEI:</span>
                        <span className="ml-1 font-semibold text-slate-900">
                          {provider.x?.toFixed(1) || "N/A"}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">SPI:</span>
                        <span className="ml-1 font-semibold text-slate-900">
                          {provider.y?.toFixed(1) || "N/A"}%
                        </span>
                      </div>
                    </div>
                    {provider.WSUC_ID && (
                      <p className="mt-2 text-xs text-slate-500">
                        ID: {provider.WSUC_ID}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
