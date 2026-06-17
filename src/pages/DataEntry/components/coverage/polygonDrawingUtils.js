import L from "leaflet";
import "leaflet-geodesy";

export const setupPolygonDrawing = (
  mapContainer,
  map,
  drawnItems,
  setDrawingStats,
  setMapError
) => {
  if (!map || !mapContainer) return null;

  let currentPolyline = null;
  let currentPoints = [];
  let isDrawing = false;
  let measureLayer = null;

  const calculateDistance = (point1, point2) => {
    return map.distance(point1, point2); // returns distance in meters
  };

  const calculateArea = (points) => {
    if (points.length < 3) return 0;
    const latlngs = points.map(p => [p.lat, p.lng]);
    return L.GeometryUtil.geodesicArea(latlngs); // returns area in square meters
  };

  const formatDistance = (meters) => {
    if (meters > 1000) {
      return (meters / 1000).toFixed(2) + " km";
    }
    return meters.toFixed(2) + " m";
  };

  const formatArea = (squareMeters) => {
    if (squareMeters > 1000000) {
      return (squareMeters / 1000000).toFixed(2) + " km²";
    } else if (squareMeters > 10000) {
      return (squareMeters / 10000).toFixed(2) + " hectares";
    }
    return squareMeters.toFixed(2) + " m²";
  };

  const updateMeasurements = () => {
    if (measureLayer && map.hasLayer(measureLayer)) {
      map.removeLayer(measureLayer);
    }

    if (currentPoints.length < 2) return;

    measureLayer = L.layerGroup().addTo(map);

    // Draw distances between points
    for (let i = 0; i < currentPoints.length - 1; i++) {
      const distance = calculateDistance(currentPoints[i], currentPoints[i + 1]);
      const midpoint = L.latLngBounds([currentPoints[i], currentPoints[i + 1]]).getCenter();

      const tooltip = L.tooltip({
        permanent: true,
        direction: "center",
        className: "distance-tooltip",
      });

      tooltip.setContent(formatDistance(distance));
      tooltip.setLatLng(midpoint);
      tooltip.addTo(measureLayer);
    }

    // Calculate and display area if polygon is complete (at least 3 points)
    if (currentPoints.length >= 3) {
      const area = calculateArea(currentPoints);
      const center = L.latLngBounds(currentPoints).getCenter();

      const areaTooltip = L.tooltip({
        permanent: true,
        direction: "center",
        className: "area-tooltip",
      });

      areaTooltip.setContent(`<strong>Area: ${formatArea(area)}</strong>`);
      areaTooltip.setLatLng(center);
      areaTooltip.addTo(measureLayer);
    }
  };

  const onMapClick = (e) => {
    if (!isDrawing) return;

    const point = e.latlng;
    currentPoints.push(point);

    // Add marker for the point
    L.circleMarker(point, {
      radius: 6,
      fillColor: "#0066cc",
      color: "#fff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    })
      .addTo(map)
      .on("click", (e) => {
        // Allow deletion of individual points
        L.DomEvent.stopPropagation(e);
        removePoint(currentPoints.indexOf(point));
      });

    // Update polyline
    if (currentPolyline && map.hasLayer(currentPolyline)) {
      map.removeLayer(currentPolyline);
    }

    currentPolyline = L.polyline(currentPoints, {
      color: "#0066cc",
      weight: 3,
      opacity: 0.8,
      dashArray: "5, 5",
    }).addTo(map);

    updateMeasurements();
  };

  const removePoint = (index) => {
    currentPoints.splice(index, 1);
    redrawPolyline();
    updateMeasurements();
  };

  const redrawPolyline = () => {
    if (currentPolyline && map.hasLayer(currentPolyline)) {
      map.removeLayer(currentPolyline);
    }

    if (currentPoints.length >= 2) {
      currentPolyline = L.polyline(currentPoints, {
        color: "#0066cc",
        weight: 3,
        opacity: 0.8,
        dashArray: "5, 5",
      }).addTo(map);
    }
  };

  const finishPolygon = () => {
    if (currentPoints.length < 3) {
      setMapError("Please draw at least 3 points to create a polygon");
      return;
    }

    // Create a closed polygon
    const polygonPoints = [...currentPoints, currentPoints[0]]; // Close the polygon

    const polygon = L.polygon(polygonPoints, {
      color: "#0066cc",
      weight: 3,
      opacity: 0.8,
      fillColor: "#0066cc",
      fillOpacity: 0.2,
    }).addTo(map);

    // Allow deletion by clicking on the polygon
    polygon.on("click", () => {
      if (map.hasLayer(polygon)) {
        map.removeLayer(polygon);
        drawnItems.current = drawnItems.current.filter((item) => item !== polygon);
        updateStats();
      }
    });

    drawnItems.current.push(polygon);
    updateStats();

    // Clear for next polygon
    clearCurrentPolygon();
  };

  const clearCurrentPolygon = () => {
    currentPoints = [];
    if (currentPolyline && map.hasLayer(currentPolyline)) {
      map.removeLayer(currentPolyline);
    }
    if (measureLayer && map.hasLayer(measureLayer)) {
      map.removeLayer(measureLayer);
    }
    currentPolyline = null;
  };

  const startDrawing = () => {
    isDrawing = true;
    clearCurrentPolygon();
    map.on("click", onMapClick);
  };

  const stopDrawing = () => {
    isDrawing = false;
    map.off("click", onMapClick);
  };

  const updateStats = () => {
    setDrawingStats({
      lines: drawnItems.current.length,
      points: drawnItems.current.reduce((sum, item) => {
        try {
          const coords = item.toGeoJSON().geometry.coordinates;
          return sum + (Array.isArray(coords[0]) ? coords.length : 0);
        } catch {
          return sum;
        }
      }, 0),
    });
  };

  const cleanup = () => {
    stopDrawing();
    clearCurrentPolygon();
  };

  // Add custom CSS for tooltips
  const style = document.createElement("style");
  style.textContent = `
    .distance-tooltip {
      background-color: rgba(255, 255, 255, 0.9) !important;
      border: 1px solid #0066cc !important;
      border-radius: 4px !important;
      padding: 4px 8px !important;
      font-size: 12px !important;
      color: #0066cc !important;
      font-weight: 600 !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    }
    .area-tooltip {
      background-color: rgba(0, 102, 204, 0.95) !important;
      border: none !important;
      border-radius: 4px !important;
      padding: 6px 10px !important;
      font-size: 13px !important;
      color: white !important;
      font-weight: 700 !important;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2) !important;
    }
  `;
  document.head.appendChild(style);

  return {
    startDrawing,
    stopDrawing,
    finishPolygon,
    clearCurrentPolygon,
    getCurrentPoints: () => currentPoints,
    cleanup,
    isDrawing: () => isDrawing,
  };
};
