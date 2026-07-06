import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import DrawingMap from "./DrawingMap";
import DrawingSuccess from "./DrawingSuccess";
import LocationFields from "./LocationFields";
import { setupCanvasDrawing } from "./drawingUtils";
import { setupPolygonDrawing } from "./polygonDrawingUtils";
import {
  getMunicipalityBoundaryAsync,
  getDistrictBoundaryAsync,
  displayBoundaryOnMap,
  fitMapToLayer,
} from "./boundaryUtils";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const LOCATION_FIELD_KEYS = {
  province: "spatial.province-name",
  district: "spatial.district",
  municipalityType: "spatial.municipality-type",
  municipalityName: "spatial.municipality-name",
  coverageArea: "spatial.coverage-area-geojson",
  gpsLatitude: "spatial.gps-latitude",
  gpsLongitude: "spatial.gps-longitude",
};

export default function CoverageAreaForm({
  title = "Coverage Area Information",
  subtitle = "Define service coverage area on map",
  fields,
  values,
  onFieldChange,
  language = "eng",
  onValidationChange,
}) {
  const province = values[LOCATION_FIELD_KEYS.province] || "";
  const district = values[LOCATION_FIELD_KEYS.district] || "";
  const municipalityType = values[LOCATION_FIELD_KEYS.municipalityType] || "";
  const municipalityName = values[LOCATION_FIELD_KEYS.municipalityName] || "";
  const coverageAreaGeoJson = values[LOCATION_FIELD_KEYS.coverageArea];

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawModeEnabled, setDrawModeEnabled] = useState(false);
  const [drawingComplete, setDrawingComplete] = useState(false);
  const [savedDrawingStats, setSavedDrawingStats] = useState({
    lines: 0,
    points: 0,
  });
  const [coverageAreaInfo, setCoverageAreaInfo] = useState(
    coverageAreaGeoJson ? "✓ Coverage area selected" : null,
  );
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [drawingStats, setDrawingStats] = useState({ lines: 0, points: 0 });
  const [mapReady, setMapReady] = useState(false);

  // Map drawing refs
  const mapContainer = useRef(null);
  const map = useRef(null);
  const canvas = useRef(null);
  const ctx = useRef(null);
  const drawnItems = useRef([]);
  const isDrawingMode = useRef(false);
  const currentPixels = useRef([]);
  const drawModeRef = useRef(drawModeEnabled);
  const boundaryLayer = useRef(null);
  const polygonDrawingRef = useRef(null);

  const canOpenMap = province && district && municipalityName;

  // Initialize map when drawing mode starts
  useEffect(() => {
    if (!isDrawing) return;

    drawnItems.current = [];
    setDrawingStats({ lines: 0, points: 0 });
    setMapError(null);
    setMapReady(false);

    let cleanupCanvasListeners = null;

    const initMap = async () => {
      try {
        setMapError(null);

        if (!mapContainer.current) {
          setMapError("Map container not found");
          return;
        }

        if (map.current) {
          map.current.remove();
          map.current = null;
        }

        map.current = L.map(mapContainer.current).setView([28.3949, 84.124], 6);

        L.tileLayer(
          "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
          {
            maxZoom: 20,
            attribution: "Google",
          },
        ).addTo(map.current);

        // Load and display selected boundary, then zoom to it
        const municipalityGeoJSON = await getMunicipalityBoundaryAsync(
          district,
          municipalityName,
        );
        if (!municipalityGeoJSON) {
          console.warn(
            `Municipality boundary not found for "${municipalityName}" in ${district}. Falling back to district boundary.`,
          );
        }
        const boundaryGeoJSON =
          municipalityGeoJSON || (await getDistrictBoundaryAsync(district));

        if (boundaryGeoJSON) {
          boundaryLayer.current = displayBoundaryOnMap(
            map.current,
            boundaryGeoJSON,
            {
              color: "#0066cc",
              weight: 3,
              opacity: 0.9,
              fillColor: "#0066cc",
              fillOpacity: 0.12,
              dashArray: "5, 3",
            },
          );
          fitMapToLayer(map.current, boundaryLayer.current);
        }

        if (map.current.touchZoom) map.current.touchZoom.enable();
        if (map.current.doubleClickZoom) map.current.doubleClickZoom.enable();
        if (map.current.scrollWheelZoom) map.current.scrollWheelZoom.enable();

        const polygonDrawing = setupPolygonDrawing(
          mapContainer.current,
          map.current,
          drawnItems,
          setDrawingStats,
          setMapError,
        );
        polygonDrawingRef.current = polygonDrawing;

        setDrawingStats({ lines: 0, points: 0 });
        setMapReady(true);
      } catch (error) {
        console.error("Map initialization error:", error);
        setMapError("Failed to initialize map. Please try again.");
        setIsDrawing(false);
      }
    };

    const timer = setTimeout(initMap, 100);
    return () => {
      clearTimeout(timer);
      if (polygonDrawingRef.current?.cleanup) {
        polygonDrawingRef.current.cleanup();
      }
    };
  }, [isDrawing, district, municipalityName]);

  // Load existing coverage area once map is ready
  useEffect(() => {
    if (!isDrawing || !mapReady || !map.current || !coverageAreaGeoJson) return;

    try {
      const existingGeometry =
        typeof coverageAreaGeoJson === "string"
          ? JSON.parse(coverageAreaGeoJson)
          : coverageAreaGeoJson;

      if (existingGeometry && existingGeometry.features) {
        existingGeometry.features.forEach((feature) => {
          const layer = L.geoJSON(feature, {
            style: {
              color: "#0066cc",
              weight: 3,
              opacity: 0.8,
            },
          });

          layer.eachLayer((sublayer) => {
            sublayer.addTo(map.current);
            sublayer.on("click", () => {
              if (map.current && map.current.hasLayer(sublayer)) {
                map.current.removeLayer(sublayer);
                drawnItems.current = drawnItems.current.filter(
                  (item) => item !== sublayer,
                );
                setDrawingStats({
                  lines: drawnItems.current.length,
                  points: drawnItems.current.reduce((sum, item) => {
                    try {
                      const coords = item.toGeoJSON().geometry.coordinates;
                      return sum + coords.length;
                    } catch {
                      return sum;
                    }
                  }, 0),
                });
              }
            });
            drawnItems.current.push(sublayer);
          });
        });

        setDrawingStats({
          lines: drawnItems.current.length,
          points: drawnItems.current.reduce((sum, item) => {
            try {
              const coords = item.toGeoJSON().geometry.coordinates;
              return sum + coords.length;
            } catch {
              return sum;
            }
          }, 0),
        });
      }
    } catch (error) {
      console.error("Error loading existing coverage area:", error);
    }
  }, [isDrawing, mapReady, coverageAreaGeoJson]);

  // Update canvas state when draw mode changes
  useEffect(() => {
    drawModeRef.current = drawModeEnabled;

    if (!isDrawing || !canvas.current || !map.current) return;

    if (drawModeEnabled) {
      canvas.current.style.cursor = "crosshair";
      canvas.current.style.pointerEvents = "auto";
      if (map.current.dragging) map.current.dragging.disable();
      if (map.current.touchZoom) map.current.touchZoom.disable();
      if (map.current.doubleClickZoom) map.current.doubleClickZoom.disable();
      if (map.current.scrollWheelZoom) map.current.scrollWheelZoom.disable();
    } else {
      canvas.current.style.cursor = "grab";
      canvas.current.style.pointerEvents = "none";
      if (map.current.dragging) map.current.dragging.enable();
      if (map.current.touchZoom) map.current.touchZoom.enable();
      if (map.current.doubleClickZoom) map.current.doubleClickZoom.enable();
      if (map.current.scrollWheelZoom) map.current.scrollWheelZoom.enable();
    }
  }, [drawModeEnabled, isDrawing]);

  const finishDrawing = () => {
    try {
      // Finish the current polygon if in drawing mode
      if (drawModeEnabled && polygonDrawingRef.current) {
        try {
          polygonDrawingRef.current.finishPolygon();
        } catch (error) {
          console.error("Error finishing polygon:", error);
        }
      }

      if (drawnItems.current.length === 0) {
        setMapError("Please draw at least one polygon on the map");
        return;
      }

      const features = drawnItems.current
        .map((item) => {
          try {
            return item.toGeoJSON();
          } catch (error) {
            console.error("Error converting to GeoJSON:", error);
            return null;
          }
        })
        .filter(Boolean);

      if (features.length === 0) {
        setMapError("Failed to process drawings. Please try again.");
        return;
      }

      const normalizeCoverageGeoJson = (inputFeatures) => ({
        type: "FeatureCollection",
        features: inputFeatures
          .map((feature) => {
            if (!feature?.geometry) return null;

            const { type, coordinates } = feature.geometry;
            if (!["Polygon", "MultiPolygon"].includes(type)) return null;

            return {
              type: "Feature",
              properties: feature.properties || {},
              geometry: {
                type,
                coordinates,
              },
            };
          })
          .filter(Boolean),
      });

      const normalizedGeoJson = normalizeCoverageGeoJson(features);

      if (
        !normalizedGeoJson.features ||
        normalizedGeoJson.features.length === 0
      ) {
        setMapError(
          "Coverage area geometry is invalid or unsupported. Please redraw.",
        );
        return;
      }

      onFieldChange(LOCATION_FIELD_KEYS.coverageArea, normalizedGeoJson);
      const nextDrawingStats = {
        lines: normalizedGeoJson.features.length,
        points: normalizedGeoJson.features.reduce((total, feature) => {
          const { type, coordinates } = feature.geometry;
          if (type === "Polygon") {
            return total + (coordinates[0]?.length || 0);
          }
          if (type === "MultiPolygon") {
            return (
              total +
              coordinates.reduce(
                (polygonTotal, polygon) =>
                  polygonTotal + (polygon[0]?.length || 0),
                0,
              )
            );
          }
          return total;
        }, 0),
      };
      setSavedDrawingStats(nextDrawingStats);
      setCoverageAreaInfo(
        `✓ Coverage area saved for ${municipalityName} (${nextDrawingStats.lines} area(s))`,
      );
      setDrawingComplete(true);
      if (map.current && drawnItems.current.length > 0) {
        try {
          const group = new L.FeatureGroup(drawnItems.current);
          const bounds = group.getBounds();
          if (bounds.isValid()) {
            map.current.fitBounds(bounds, { padding: [50, 50] });
          }
        } catch (error) {
          console.error("Error fitting bounds:", error);
        }
      }
    } catch (error) {
      console.error("Error finishing drawing:", error);
      setMapError("Failed to save coverage area. Please try again.");
    }
  };

  const cleanup = () => {
    try {
      if (polygonDrawingRef.current?.cleanup) {
        polygonDrawingRef.current.cleanup();
      }

      if (map.current) {
        if (
          boundaryLayer.current &&
          map.current.hasLayer(boundaryLayer.current)
        ) {
          map.current.removeLayer(boundaryLayer.current);
        }
        map.current.dragging.enable();
        map.current.remove();
        map.current = null;
      }

      const drawingCanvas =
        mapContainer.current?.querySelector("#drawingCanvas");
      if (drawingCanvas) drawingCanvas.remove();

      polygonDrawingRef.current = null;
      boundaryLayer.current = null;
      drawnItems.current = [];
      isDrawingMode.current = false;
      currentPixels.current = [];
      setIsDrawing(false);
      setDrawingComplete(false);
      setMapError(null);
      setDrawModeEnabled(false);
    } catch (error) {
      console.error("Cleanup error:", error);
      setIsDrawing(false);
    }
  };

  const closeDrawingSuccess = () => {
    cleanup();
  };

  const handleDeleteAll = () => {
    try {
      drawnItems.current.forEach((item) => {
        if (map.current && map.current.hasLayer(item)) {
          map.current.removeLayer(item);
        }
      });
      drawnItems.current = [];
      setDrawingStats({ lines: 0, points: 0 });
      if (canvas.current && ctx.current) {
        ctx.current.clearRect(
          0,
          0,
          canvas.current.width,
          canvas.current.height,
        );
      }
    } catch (error) {
      setMapError("Failed to clear drawings");
    }
  };

  const handleCompletePolygon = () => {
    try {
      if (polygonDrawingRef.current) {
        polygonDrawingRef.current.finishPolygon();
      }
    } catch (error) {
      console.error("Error completing polygon:", error);
      setMapError("Failed to complete polygon");
    }
  };

  const captureGPSLocation = () => {
    setIsGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser");
      setIsGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onFieldChange(LOCATION_FIELD_KEYS.gpsLatitude, latitude.toString());
        onFieldChange(LOCATION_FIELD_KEYS.gpsLongitude, longitude.toString());
        setIsGpsLoading(false);
      },
      (error) => {
        const errorMsg =
          error.code === 1
            ? "Permission denied. Please enable location access."
            : "Unable to retrieve location. Please try again.";
        setGpsError(errorMsg);
        setIsGpsLoading(false);
      },
    );
  };

  // Drawing mode view
  if (isDrawing) {
    if (drawingComplete) {
      return (
        <DrawingSuccess
          municipalityName={municipalityName}
          district={district}
          province={province}
          drawingStats={savedDrawingStats}
          onClose={closeDrawingSuccess}
        />
      );
    }

    return (
      <DrawingMap
        municipalityName={municipalityName}
        district={district}
        province={province}
        mapError={mapError}
        drawingStats={drawingStats}
        drawModeEnabled={drawModeEnabled}
        mapContainer={mapContainer}
        map={map}
        canvas={canvas}
        ctx={ctx}
        drawnItems={drawnItems}
        isDrawingMode={isDrawingMode}
        currentPixels={currentPixels}
        drawModeRef={drawModeRef}
        polygonDrawingRef={polygonDrawingRef}
        onDrawModeToggle={() => setDrawModeEnabled(!drawModeEnabled)}
        onCompletePolygon={handleCompletePolygon}
        onFinishDrawing={finishDrawing}
        onCancelDrawing={cleanup}
        onDeleteAll={handleDeleteAll}
        onSetupCanvas={() => {}}
        onSetMapError={setMapError}
        onSetDrawingStats={setDrawingStats}
      />
    );
  }

  // Normal form view
  return (
    <LocationFields
      title={title}
      subtitle={subtitle}
      fields={fields}
      values={values}
      onFieldChange={onFieldChange}
      language={language}
      canOpenMap={canOpenMap}
      coverageAreaInfo={coverageAreaInfo}
      onDrawClick={() => canOpenMap && setIsDrawing(true)}
      isGpsLoading={isGpsLoading}
      gpsError={gpsError}
      onCaptureGPS={captureGPSLocation}
      onValidationChange={onValidationChange}
    />
  );
}
