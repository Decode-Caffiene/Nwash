import { useMemo } from "react";

const normalize = (value) => String(value || "").trim().toLowerCase();

const matchesText = (value, query) => {
  if (!query) return true;
  return normalize(value).includes(normalize(query));
};

export default function useAnalyticsData(providers, searchQuery, appliedFilters) {
  const chartData = useMemo(() => {
    return (providers || [])
      .filter(
        (item) =>
          item?.Summary_Index?.OEI != null &&
          item?.Summary_Index?.SPI != null
      )
      .filter((item) => {
        const location = item.Location || {};
        return (
          matchesText(location.Province_Name, appliedFilters.province) &&
          matchesText(location.District_Name, appliedFilters.district) &&
          matchesText(location.Municipality_Name, appliedFilters.municipality)
        );
      })
      .map((item) => ({
        ...item,
        x: item.Summary_Index.OEI,
        y: item.Summary_Index.SPI,
        isHighlighted:
          normalize(searchQuery) &&
          matchesText(item.WSUC_Name, searchQuery),
      }));
  }, [providers, searchQuery, appliedFilters]);

  return { chartData };
}