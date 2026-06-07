// Zone categorization based on chart coordinates
// x = OEI (Operational and Management Efficiency, 0-100)
// y = SPI (Level and Quality of Water Supply Service, 0-100)

export const ZONE_CATEGORIES = {
  VERY_POOR: {
    name: "VERY POOR",
    xRange: [0, 30],
    yRange: [0, 30],
    color: "#dc2626",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-700",
  },
  POOR: {
    name: "POOR",
    xRange: [30, 50],
    yRange: [0, 30],
    color: "#ec4899",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-700",
  },
  INACTIVE: {
    name: "INACTIVE",
    xRange: [0, 50],
    yRange: [50, 100],
    color: "#475569",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    textColor: "text-slate-700",
  },
  ACTIVE: {
    name: "ACTIVE",
    xRange: [50, 100],
    yRange: [0, 50],
    color: "#15803d",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
  },
  IMPROVING: {
    name: "IMPROVING",
    xRange: [50, 100],
    yRange: [50, 100],
    color: "#d5d906",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
  },
};

export const isInZone = (x, y, zoneCategory) => {
  const [xMin, xMax] = zoneCategory.xRange;
  const [yMin, yMax] = zoneCategory.yRange;
  return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
};

export const categorizeProviders = (chartData) => {
  const categorized = {
    VERY_POOR: [],
    POOR: [],
    INACTIVE: [],
    ACTIVE: [],
    IMPROVING: [],
  };

  chartData.forEach((provider) => {
    const x = provider.x;
    const y = provider.y;

    // Check in order of priority for overlapping zones
    if (isInZone(x, y, ZONE_CATEGORIES.VERY_POOR)) {
      categorized.VERY_POOR.push(provider);
    } else if (isInZone(x, y, ZONE_CATEGORIES.POOR)) {
      // POOR part 1: x 30-50, y 0-30
      categorized.POOR.push(provider);
    } else if (x >= 0 && x <= 50 && y >= 30 && y <= 50) {
      // POOR part 2: x 0-50, y 30-50
      categorized.POOR.push(provider);
    } else if (isInZone(x, y, ZONE_CATEGORIES.INACTIVE)) {
      categorized.INACTIVE.push(provider);
    } else if (isInZone(x, y, ZONE_CATEGORIES.ACTIVE)) {
      categorized.ACTIVE.push(provider);
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
