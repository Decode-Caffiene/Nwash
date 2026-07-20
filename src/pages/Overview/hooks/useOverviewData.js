import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import useFetch from "../../../hooks/useFetch";
import { getServiceProviders } from "../../../api/serviceProviderApi";
import { getProviderSearchText, normalizeQuery } from "../overviewSearchUtils";
import {
  buildAnalyticsPointData,
  categorizeProviders,
} from "../../../utils/zoneAnalytics";
import { buildProvinceComplianceData, buildDistrictData } from "../utils/overviewUtils";

export function useOverviewData() {
  const location = useLocation();
  const { data, loading, error } = useFetch(getServiceProviders, []);
  const list = Array.isArray(data) ? data : [];

  const q = useMemo(() => {
    try {
      return normalizeQuery(new URLSearchParams(location.search).get("q"));
    } catch {
      return "";
    }
  }, [location.search]);

  const filteredList = useMemo(() => {
    if (!q) return list;
    return list.filter((provider) => getProviderSearchText(provider).includes(q));
  }, [list, q]);

  const chartDataForZones = useMemo(
    () => filteredList.map((item) => buildAnalyticsPointData(item)).filter(Boolean),
    [filteredList],
  );

  const categorized = useMemo(
    () => categorizeProviders(chartDataForZones),
    [chartDataForZones],
  );

  const improvingOperators = useMemo(
    () => categorized.IMPROVING?.length || 0,
    [categorized],
  );

  const poorVeryPoorOperators = useMemo(
    () => (categorized.POOR?.length || 0) + (categorized.VERY_POOR?.length || 0),
    [categorized],
  );

  const missingData = useMemo(
    () => filteredList.length - chartDataForZones.length,
    [filteredList, chartDataForZones],
  );

  const businessPlanData = useMemo(() => {
    let hasPlan = 0;
    for (const p of filteredList) {
      if (String(p.Service_Coverage_Prerequisite ?? "").trim().toLowerCase() === "yes") {
        hasPlan++;
      }
    }
    return [
      { name: "Have Business Plan", value: hasPlan, color: "#0d9488" },
      { name: "Do Not Have Business Plan", value: filteredList.length - hasPlan, color: "#dc2626" },
    ];
  }, [filteredList]);

  const totalHouseholdsCovered = useMemo(
    () =>
      filteredList.reduce((sum, provider) => {
        const households =
          provider.Master_Sheet?.HH_Served ??
          provider.households_served ??
          provider["Number of households served by the WSUC"] ??
          provider.Service_Coverage?.Households_Served ??
          provider.Households_Served ??
          0;
        return sum + (Number(households) || 0);
      }, 0),
    [filteredList],
  );

  const { districtData, excludedCount } = useMemo(
    () => buildDistrictData(filteredList),
    [filteredList],
  );

  const topHHProviders = useMemo(
    () =>
      filteredList
        .map((p) => ({ name: p.WSUC_Name || "Unknown", value: Number(p.Master_Sheet?.HH_Served) }))
        .filter(({ value }) => Number.isFinite(value) && value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    [filteredList],
  );

  const provinceComplianceData = useMemo(
    () => buildProvinceComplianceData(list),
    [list],
  );

  return {
    loading,
    error,
    totalOperators: filteredList.length,
    improvingOperators,
    poorVeryPoorOperators,
    missingData,
    businessPlanData,
    totalHouseholdsCovered,
    districtData,
    excludedCount,
    topHHProviders,
    provinceComplianceData,
  };
}
