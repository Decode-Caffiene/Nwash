import React, { useMemo } from "react";
import RegionCard from "./RegionCard";
import {
  ZONE_CATEGORIES,
  categorizeProviders,
  calculateZoneStats,
} from "../../utils/zoneAnalytics";

export default function RegionCardsSection({ chartData }) {
  const categorized = useMemo(
    () => categorizeProviders(chartData || []),
    [chartData]
  );

  const stats = useMemo(
    () => ({
      veryPoor: calculateZoneStats(categorized.VERY_POOR),
      poor: calculateZoneStats(categorized.POOR),
      active: calculateZoneStats(categorized.ACTIVE),
      improving: calculateZoneStats(categorized.IMPROVING),
    }),
    [categorized]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-900">
          Regional Performance Overview
        </h2>
        <p className="text-sm text-slate-600">
          Service providers categorized by operational efficiency and service quality
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <RegionCard
          zone={ZONE_CATEGORIES.VERY_POOR}
          stats={stats.veryPoor}
          showDetails={true}
        />
        <RegionCard
          zone={ZONE_CATEGORIES.POOR}
          stats={stats.poor}
          showDetails={true}
        />
        <RegionCard
          zone={ZONE_CATEGORIES.ACTIVE}
          stats={stats.active}
          showDetails={true}
        />
        <RegionCard
          zone={ZONE_CATEGORIES.IMPROVING}
          stats={stats.improving}
          showDetails={true}
        />
      </div>
    </div>
  );
}
