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
    // Exclusive upper bounds: x < 30, y < 30
    isInZone: (x, y) => x >= 0 && x < 30 && y >= 0 && y < 30,
  },
  POOR: {
    name: "POOR",
    xRange: [30, 50],
    yRange: [0, 31],
    color: "#ec4899",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-700",
    // POOR is an L-shape: part 1 (x 30-50, y 0-30) + part 2 (x 0-50, y 30-52)
    // Exclusive upper bound y < 52 to avoid overlap with INACTIVE
    isInZone: (x, y) =>
      (x >= 30 && x < 50 && y >= 0 && y < 30) ||
      (x >= 0 && x < 50 && y >= 30 && y < 52),
  },
  INACTIVE: {
    name: "INACTIVE",
    xRange: [0, 50],
    yRange: [52, 100],
    color: "#475569",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    textColor: "text-slate-700",
    // Exclusive upper bound x < 50 to match chart visual (ReferenceArea x2=50)
    isInZone: (x, y) => x >= 0 && x < 50 && y >= 52 && y <= 100,
  },
  ACTIVE: {
    name: "ACTIVE",
    xRange: [50, 100],
    yRange: [0, 52],
    color: "#15803d",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700",
    // Inclusive bound: y <= 52 extends past the 50% SPI line
    isInZone: (x, y) => x >= 50 && x <= 100 && y >= 0 && y <= 52,
  },
  IMPROVING: {
    name: "IMPROVING",
    xRange: [50, 100],
    yRange: [52, 100],
    color: "#d5d906",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-700",
    // y >= 52 — extends past the 50% SPI line
    isInZone: (x, y) => x >= 50 && x <= 100 && y >= 52 && y <= 100,
  },
};

export const isInZone = (x, y, zoneCategory) => {
  if (zoneCategory.isInZone) {
    return zoneCategory.isInZone(x, y);
  }
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

    if (isInZone(x, y, ZONE_CATEGORIES.VERY_POOR)) {
      categorized.VERY_POOR.push(provider);
    } else if (isInZone(x, y, ZONE_CATEGORIES.POOR)) {
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
