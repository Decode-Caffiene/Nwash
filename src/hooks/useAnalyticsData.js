import { useMemo } from "react";

import { filterAnalyticsProviders } from "../utils/zoneAnalytics";

export default function useAnalyticsData(
  providers,
  searchQuery,
  appliedFilters,
) {
  const chartData = useMemo(() => {
    return filterAnalyticsProviders(providers, searchQuery, appliedFilters);
  }, [providers, searchQuery, appliedFilters]);

  return { chartData };
}
