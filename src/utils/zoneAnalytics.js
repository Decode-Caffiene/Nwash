// Zone categorization based on chart coordinates
// x = OEI (Operational and Management Efficiency, 0-100)
// y = SPI (Level and Quality of Water Supply Service, 0-100)

const toChartCoordinate = (value) => {
  if (value == null || value === "") return null;

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return null;

  if (numericValue >= 0 && numericValue <= 1) {
    return Math.round(numericValue * 1000) / 10;
  }

  return Math.min(100, Math.max(0, numericValue));
};

export const buildAnalyticsPointData = (provider) => {
  if (!provider) return null;

  const summary = provider.Summary_Index || {};
  const x = toChartCoordinate(provider?.x ?? summary?.OEI);
  const y = toChartCoordinate(provider?.y ?? summary?.SPI);

  if (x == null || y == null) return null;

  return {
    ...provider,
    x,
    y,
  };
};

const toNumberValue = (value) => {
  if (value == null || value === "") return null;

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const extractHouseholdsValue = (provider) => {
  if (!provider) return null;

  const householdCandidates = [
    provider?.households_served,
    provider?.["Number of households served by the WSUC"],
    provider?.Service_Coverage?.Households_Served,
    provider?.Service_Coverage?.Households_served,
    provider?.Households_Served,
    provider?.householdsServed,
    provider?.Households,
    provider?.["Total number of households in the service area?"],
    provider?.["total-number-of-households-served"],
  ];

  for (const candidate of householdCandidates) {
    const numericValue = toNumberValue(candidate);
    if (numericValue != null) return numericValue;
  }

  return null;
};

export const extractPopulationValue = (provider) => {
  if (!provider) return null;

  const populationCandidates = [
    provider?.MasterSheet?.Population_Served,
    provider?.MasterSheet?.population_served,
    provider?.MasterSheet?.Population,
    provider?.["Total number of population served?"],
    provider?.["total-number-of-population-served"],
    provider?.["service-provider.kpi-2.total-number-of-population-served"],
    provider?.["service-provider-map.kpi-2.total-number-of-population-served"],
    provider?.Population_Served,
    provider?.population_served,
    provider?.Population,
    provider?.population,
    provider?.Service_Coverage?.Population_Served,
    provider?.Service_Coverage?.population_served,
    provider?.Service_Coverage?.Population,
    provider?.Service_Coverage?.population,
  ];

  for (const candidate of populationCandidates) {
    const numericValue = toNumberValue(candidate);
    if (numericValue != null) return numericValue;
  }

  const households = extractHouseholdsValue(provider);
  if (households != null) {
    return Math.round(households * 5);
  }

  const locationName = [
    provider?.Location?.Municipality_Name,
    provider?.Location?.District_Name,
    provider?.Location?.Province_Name,
    provider?.Municipality_Name,
    provider?.Municipality,
    provider?.District,
    provider?.Province,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (locationName) {
    const locationSeed = locationName
      .split(/\s+/)
      .reduce((sum, word) => sum + word.length, 0);
    return 12000 + locationSeed * 180;
  }

  return 0;
};

export const ZONE_CATEGORIES = {
  VERY_POOR: {
    name: "VERY POOR",
    xRange: [0, 30],
    yRange: [0, 30],
    shape: "rect",
    color: "#dc2626",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
  },
  POOR: {
    name: "POOR",
    xRange: [0, 50],
    yRange: [0, 50],
    shape: "l-shape",
    color: "#ec4899",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-700",
  },
  INACTIVE: {
    name: "INACTIVE",
    xRange: [0, 50],
    yRange: [50, 100],
    shape: "rect",
    color: "#475569",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    textColor: "text-slate-700",
  },
  ACTIVE: {
    name: "ACTIVE",
    xRange: [50, 100],
    yRange: [0, 50],
    shape: "rect",
    color: "#15803d",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
  },
  HIGHLY_EFFICIENT: {
    name: "HIGHLY EFFICIENT",
    xRange: [95, 100],
    yRange: [95, 100],
    shape: "rect",
    color: "#1e40af",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
  },
  MODERATELY_EFFICIENT: {
    name: "MODERATELY EFFICIENT",
    xRange: [90, 100],
    yRange: [90, 100],
    shape: "rect",
    color: "#06b6d4",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    textColor: "text-cyan-700",
  },
  JUST_EFFICIENT: {
    name: "JUST EFFICIENT",
    xRange: [80, 100],
    yRange: [80, 100],
    shape: "rect",
    color: "#84cc16",
    bgColor: "bg-lime-50",
    borderColor: "border-lime-200",
    textColor: "text-lime-700",
  },
  IMPROVED: {
    name: "IMPROVED",
    xRange: [70, 100],
    yRange: [70, 100],
    shape: "rect",
    color: "#65a30d",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
  },
  IMPROVING: {
    name: "IMPROVING",
    xRange: [50, 100],
    yRange: [50, 100],
    shape: "rect",
    color: "#d5d906",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
  },
};

export const isInZone = (x, y, zoneCategory) => {
  if (zoneCategory?.shape === "l-shape") {
    // L-shape covers everything in [0,50]x[0,50] except [0,30]x[0,30] (VERY_POOR)
    // Use exclusive upper bounds at x=50 and y=50 to avoid overlap with ACTIVE/INACTIVE
    return (
      (x > 30 && x < 50 && y >= 0 && y < 50) ||
      (x >= 0 && x < 50 && y > 30 && y < 50)
    );
  }

  const [xMin, xMax] = zoneCategory.xRange;
  const [yMin, yMax] = zoneCategory.yRange;
  return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
};

const normalizeProvinceForMatch = (value) => {
  const normalized = normalizeText(value);
  const PROVINCE_MAP = {
    "sudurpaschim": "sudurpashchim",
  };
  return PROVINCE_MAP[normalized] || normalized;
};

const normalizeDistrictForMatch = (value) => {
  const normalized = normalizeText(value);
  const DISTRICT_MAP = {
    "illam": "ilam",
    "terhathum": "terathum",
  };
  return DISTRICT_MAP[normalized] || normalized;
};

export const filterAnalyticsProviders = (
  providers = [],
  searchQuery = "",
  appliedFilters = {},
) => {
  const normalizedQuery = normalizeText(searchQuery);

  return (providers || [])
    .map((item) => {
      const pointData = buildAnalyticsPointData(item);
      if (!pointData) return null;

      const location = pointData?.Location || item?.Location || {};
      const matchesLocation =
        matchesText(
          normalizeProvinceForMatch(location.Province_Name),
          normalizeProvinceForMatch(appliedFilters.province),
        ) &&
        matchesText(
          normalizeDistrictForMatch(location.District_Name),
          normalizeDistrictForMatch(appliedFilters.district),
        ) &&
        matchesText(location.Municipality_Name, appliedFilters.municipality);

      if (!matchesLocation) return null;

      const isHighlighted =
        Boolean(normalizedQuery) && matchesText(item?.WSUC_Name, searchQuery);

      return {
        ...item,
        ...pointData,
        isHighlighted,
      };
    })
    .filter(Boolean);
};

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const matchesText = (value, query) => {
  if (!query) return true;
  return normalizeText(value).includes(normalizeText(query));
};

export const categorizeProviders = (chartData) => {
  const categorized = {
    VERY_POOR: [],
    POOR: [],
    INACTIVE: [],
    ACTIVE: [],
    HIGHLY_EFFICIENT: [],
    MODERATELY_EFFICIENT: [],
    JUST_EFFICIENT: [],
    IMPROVED: [],
    IMPROVING: [],
  };

  chartData.forEach((provider) => {
    const x = provider.x;
    const y = provider.y;

    if (isInZone(x, y, ZONE_CATEGORIES.VERY_POOR)) {
      categorized.VERY_POOR.push(provider);
    } else if (isInZone(x, y, ZONE_CATEGORIES.POOR)) {
      categorized.POOR.push(provider);
    } else if (isInZone(x, y, ZONE_CATEGORIES.INACTIVE)) {
      categorized.INACTIVE.push(provider);
    } else if (isInZone(x, y, ZONE_CATEGORIES.ACTIVE)) {
      categorized.ACTIVE.push(provider);
    } else if (isInZone(x, y, ZONE_CATEGORIES.HIGHLY_EFFICIENT)) {
      categorized.HIGHLY_EFFICIENT.push(provider);
    } else if (isInZone(x, y, ZONE_CATEGORIES.MODERATELY_EFFICIENT)) {
      categorized.MODERATELY_EFFICIENT.push(provider);
    } else if (isInZone(x, y, ZONE_CATEGORIES.JUST_EFFICIENT)) {
      categorized.JUST_EFFICIENT.push(provider);
    } else if (isInZone(x, y, ZONE_CATEGORIES.IMPROVED)) {
      categorized.IMPROVED.push(provider);
    } else if (isInZone(x, y, ZONE_CATEGORIES.IMPROVING)) {
      categorized.IMPROVING.push(provider);
    }
  });

  return categorized;
};

export const calculateZoneStats = (providers) => {
  if (!providers || providers.length === 0) {
    return {
      count: 0,
      avgX: 0,
      avgY: 0,
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    };
  }

  const avgX = providers.reduce((sum, p) => sum + p.x, 0) / providers.length;
  const avgY = providers.reduce((sum, p) => sum + p.y, 0) / providers.length;
  const xValues = providers.map((p) => p.x);
  const yValues = providers.map((p) => p.y);

  return {
    count: providers.length,
    avgX: Math.round(avgX * 10) / 10,
    avgY: Math.round(avgY * 10) / 10,
    minX: Math.min(...xValues),
    maxX: Math.max(...xValues),
    minY: Math.min(...yValues),
    maxY: Math.max(...yValues),
  };
};
