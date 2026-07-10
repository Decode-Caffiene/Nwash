const EARTH_RADIUS_KM = 6371;

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function getDistance(lat1, lon1, lat2, lon2) {
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function calculatePolygonPerimeter(coordinates) {
  let perimeter = 0;
  const ring = coordinates[0];

  for (let i = 0; i < ring.length - 1; i++) {
    const [lon1, lat1] = ring[i];
    const [lon2, lat2] = ring[i + 1];
    perimeter += getDistance(lat1, lon1, lat2, lon2);
  }

  return perimeter;
}

function calculatePolygonArea(coordinates) {
  const ring = coordinates[0];
  let area = 0;

  for (let i = 0; i < ring.length - 1; i++) {
    const [lon1, lat1] = ring[i];
    const [lon2, lat2] = ring[i + 1];

    area +=
      degreesToRadians(lon2 - lon1) *
      (2 + Math.sin(degreesToRadians(lat1)) + Math.sin(degreesToRadians(lat2)));
  }

  area = Math.abs((area * EARTH_RADIUS_KM * EARTH_RADIUS_KM) / 2);
  return area;
}

export function calculateCoverageAreaStats(geojson) {
  if (!geojson) return { perimeter: 0, area: 0, totalPerimeter: 0, totalArea: 0 };

  let coverage = geojson;
  if (typeof geojson === "string") {
    try {
      coverage = JSON.parse(geojson);
    } catch {
      return { perimeter: 0, area: 0, totalPerimeter: 0, totalArea: 0 };
    }
  }

  if (!coverage.features || coverage.features.length === 0) {
    return { perimeter: 0, area: 0, totalPerimeter: 0, totalArea: 0 };
  }

  let totalPerimeter = 0;
  let totalArea = 0;
  const areas = [];

  coverage.features.forEach((feature) => {
    if (feature.geometry.type === "Polygon") {
      const perimeter = calculatePolygonPerimeter(feature.geometry.coordinates);
      const area = calculatePolygonArea(feature.geometry.coordinates);

      totalPerimeter += perimeter;
      totalArea += area;
      areas.push({ perimeter, area });
    } else if (feature.geometry.type === "MultiPolygon") {
      feature.geometry.coordinates.forEach((polygonCoords) => {
        const perimeter = calculatePolygonPerimeter([polygonCoords[0]]);
        const area = calculatePolygonArea([polygonCoords[0]]);

        totalPerimeter += perimeter;
        totalArea += area;
        areas.push({ perimeter, area });
      });
    }
  });

  return {
    perimeter: totalPerimeter,
    area: totalArea,
    totalPerimeter,
    totalArea,
    features: areas.length,
  };
}
