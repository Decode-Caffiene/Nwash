import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import DrawingMap from "./DrawingMap";
import DrawingSuccess from "./DrawingSuccess";
import LocationFields from "./LocationFields";
import { setupCanvasDrawing } from "./drawingUtils";

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
}) {
  const province = values[LOCATION_FIELD_KEYS.province] || "";
  const district = values[LOCATION_FIELD_KEYS.district] || "";
  const municipalityType = values[LOCATION_FIELD_KEYS.municipalityType] || "";
  const municipalityName = values[LOCATION_FIELD_KEYS.municipalityName] || "";
  const coverageAreaGeoJson = values[LOCATION_FIELD_KEYS.coverageArea];

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawModeEnabled, setDrawModeEnabled] = useState(false);
  const [drawingComplete, setDrawingComplete] = useState(false);
  const [coverageAreaInfo, setCoverageAreaInfo] = useState(
    coverageAreaGeoJson ? "✓ Coverage area selected" : null
  );
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [drawingStats, setDrawingStats] = useState({ lines: 0, points: 0 });

  // Map drawing refs
  const mapContainer = useRef(null);
  const map = useRef(null);
  const canvas = useRef(null);
  const ctx = useRef(null);
  const drawnItems = useRef([]);
  const isDrawingMode = useRef(false);
  const currentPixels = useRef([]);
  const drawModeRef = useRef(drawModeEnabled);

  const canOpenMap = province && district && municipalityName;

  // Initialize map when drawing mode starts
  useEffect(() => {
    if (!isDrawing) return;

    let cleanupCanvasListeners = null;

    const initMap = () => {
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

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
        }).addTo(map.current);

        if (map.current.touchZoom) map.current.touchZoom.enable();
        if (map.current.doubleClickZoom) map.current.doubleClickZoom.enable();
        if (map.current.scrollWheelZoom) map.current.scrollWheelZoom.enable();

        const result = setupCanvasDrawing(
          mapContainer.current,
          map.current,
          ctx.current,
          drawModeRef,
          drawnItems,
          currentPixels,
          setDrawingStats,
          setMapError
        );
        cleanupCanvasListeners = result?.cleanup;
        if (result?.canvas) canvas.current = result.canvas;
        if (result?.ctx) ctx.current = result.ctx;
        setDrawingStats({ lines: 0, points: 0 });
      } catch (error) {
        console.error("Map initialization error:", error);
        setMapError("Failed to initialize map. Please try again.");
        setIsDrawing(false);
      }
    };

    const timer = setTimeout(initMap, 100);
    return () => {
      clearTimeout(timer);
      if (cleanupCanvasListeners) cleanupCanvasListeners();
    };
  }, [isDrawing]);

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
      if (drawnItems.current.length === 0) {
        setMapError("Please draw at least one area on the map");
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

      const geoJson = {
        type: "FeatureCollection",
        features: features,
      };

      onFieldChange(LOCATION_FIELD_KEYS.coverageArea, JSON.stringify(geoJson));
      setCoverageAreaInfo(
        `✓ Coverage area saved for ${municipalityName} (${drawingStats.lines} area(s))`
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

      setTimeout(() => {
        cleanup();
      }, 3000);
    } catch (error) {
      console.error("Error finishing drawing:", error);
      setMapError("Failed to save coverage area. Please try again.");
    }
  };

  const cleanup = () => {
    try {
      if (map.current) {
        map.current.dragging.enable();
        map.current.remove();
        map.current = null;
      }

      const drawingCanvas = mapContainer.current?.querySelector("#drawingCanvas");
      if (drawingCanvas) drawingCanvas.remove();

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
        ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
      }
    } catch (error) {
      setMapError("Failed to clear drawings");
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
      }
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
          drawingStats={drawingStats}
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
        onDrawModeToggle={() => setDrawModeEnabled(!drawModeEnabled)}
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
    />
  );
}
