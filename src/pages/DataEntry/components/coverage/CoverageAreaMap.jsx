import React, { useEffect, useRef, useState } from "react";
import { X, Save, Trash2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Button from "../../../../components/common/Button";
import {
  getDistrictBoundaryAsync,
  getMunicipalityBoundaryAsync,
} from "./boundaryUtils";


// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function CoverageAreaMap({
  isOpen,
  onClose,
  onSave,
  initialGeometry = null,
  province = "",
  district = "",
  municipalityType = "",
  municipalityName = "",
  // overlays municipality boundary before user draws
  overlayMunicipalityBoundaryBeforeDraw = true,
  // backward compat: if provided, it takes precedence over overlayMunicipalityBoundaryBeforeDraw
  showMunicipalityBoundary = true,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const canvas = useRef(null);
  const ctx = useRef(null);
  const drawnItems = useRef([]);
  const isDrawing = useRef(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  // Initialize map
  useEffect(() => {
    if (!isOpen) return;

    const setupMap = async () => {
      try {
        if (!mapContainer.current) return;

        // Remove old map if exists
        if (map.current) {
          map.current.remove();
          map.current = null;
        }

        // Create new map
        map.current = L.map(mapContainer.current).setView([28.3949, 84.124], 6);

        // Add Google Earth Hybrid tiles
        L.tileLayer(
          "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
          {
            maxZoom: 20,
            attribution: "Google",
          },
        ).addTo(map.current);

        // Create canvas overlay
        createCanvasOverlay();

        // Optionally show municipality boundary (resolved using geo utilities)
        // before user draws (requested behavior)
        const shouldOverlayMunicipalityBoundary =
          overlayMunicipalityBoundaryBeforeDraw || showMunicipalityBoundary;

        if (
          shouldOverlayMunicipalityBoundary &&
          district &&
          municipalityName
        ) {
          try {
            const municipalityBoundaryGeoJSON =
              await getMunicipalityBoundaryAsync(district, municipalityName);

            // fallback to district boundary if municipality lookup fails
            const boundaryGeoJSON =
              municipalityBoundaryGeoJSON ||
              (await getDistrictBoundaryAsync(district));

            if (boundaryGeoJSON?.features?.length) {
              L.geoJSON(boundaryGeoJSON, {
                style: {
                  color: "#0066cc",
                  weight: 3,
                  opacity: 0.9,
                  fillColor: "#0066cc",
                  fillOpacity: 0.12,
                  dashArray: "5, 3",
                },
              }).addTo(map.current);

              // Fit only after boundary is rendered
              const bounds = L.geoJSON(boundaryGeoJSON).getBounds?.();
              if (bounds && bounds.isValid()) {
                map.current.fitBounds(bounds, { padding: [24, 24] });
              }
            }
          } catch (error) {
            console.error("Error loading municipality boundary:", error);
          }
        }


        // Load initial geometry
        if (initialGeometry) {
          loadGeometry(initialGeometry);
        }


        setMapInitialized(true);
      } catch (error) {
        console.error("Map initialization error:", error);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(setupMap, 100);
    return () => clearTimeout(timer);
  }, [isOpen, initialGeometry, district, municipalityName, showMunicipalityBoundary]);


  const createCanvasOverlay = () => {
    if (!map.current || !mapContainer.current) return;

    const mapElement = mapContainer.current.querySelector(
      ".leaflet-overlay-pane",
    );
    if (!mapElement) return;

    // Remove old canvas if exists
    const oldCanvas = mapElement.querySelector("canvas");
    if (oldCanvas) oldCanvas.remove();

    // Create new canvas
    const newCanvas = document.createElement("canvas");
    newCanvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      cursor: crosshair;
      z-index: 400;
      touch-action: none;
    `;

    mapElement.appendChild(newCanvas);
    canvas.current = newCanvas;
    ctx.current = newCanvas.getContext("2d");

    // Set canvas size
    const mapWrapper = mapContainer.current.querySelector(".leaflet-container");
    if (mapWrapper) {
      newCanvas.width = mapWrapper.offsetWidth;
      newCanvas.height = mapWrapper.offsetHeight;
    }

    // Prevent map interaction
    L.DomEvent.disableClickPropagation(newCanvas);
    L.DomEvent.disableScrollPropagation(newCanvas);

    // Mouse events
    newCanvas.addEventListener("mousedown", (e) => {
      startDrawing(e);
      e.stopPropagation();
    });
    newCanvas.addEventListener("mousemove", (e) => {
      draw(e);
      e.stopPropagation();
    });
    newCanvas.addEventListener("mouseup", (e) => {
      stopDrawing(e);
      e.stopPropagation();
    });
    newCanvas.addEventListener("mouseout", (e) => {
      if (isDrawing.current) {
        stopDrawing(e);
      }
    });

    // Touch events
    newCanvas.addEventListener("touchstart", (e) => {
      startDrawing(e);
      e.stopPropagation();
    });
    newCanvas.addEventListener("touchmove", (e) => {
      draw(e);
      e.stopPropagation();
    });
    newCanvas.addEventListener("touchend", (e) => {
      stopDrawing(e);
      e.stopPropagation();
    });

    // Handle window resize
    const resizeCanvas = () => {
      const mapWrapper =
        mapContainer.current?.querySelector(".leaflet-container");
      if (mapWrapper) {
        newCanvas.width = mapWrapper.offsetWidth;
        newCanvas.height = mapWrapper.offsetHeight;
      }
    };

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Disable map dragging when drawing
    if (map.current) {
      map.current.dragging.disable();
      map.current.scrollWheelZoom.disable();
    }

    isDrawing.current = true;

    // Start drawing line
    const rect = canvas.current.getBoundingClientRect();
    let x, y;

    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.current.beginPath();
    ctx.current.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing.current || !canvas.current || !ctx.current) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = canvas.current.getBoundingClientRect();
    let x, y;

    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    // Draw on canvas
    ctx.current.strokeStyle = "#0066cc";
    ctx.current.lineWidth = 4;
    ctx.current.lineJoin = "round";
    ctx.current.lineCap = "round";

    ctx.current.lineTo(x, y);
    ctx.current.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing.current) return;

    e.preventDefault();
    e.stopPropagation();

    // Re-enable map dragging
    if (map.current) {
      map.current.dragging.enable();
      map.current.scrollWheelZoom.enable();
    }

    isDrawing.current = false;

    // Convert canvas drawing to polyline on map
    if (canvas.current && ctx.current && map.current) {
      saveCanvasDrawingAsPolyline();
    }
  };

  const saveCanvasDrawingAsPolyline = () => {
    if (!canvas.current || !map.current) return;

    // Get image data from canvas
    const imageData = ctx.current.getImageData(
      0,
      0,
      canvas.current.width,
      canvas.current.height,
    );
    const data = imageData.data;

    // Find all blue pixels (our drawing color)
    const pixels = [];
    for (let i = 0; i < data.length; i += 4) {
      // Check for blue color (#0066cc)
      if (data[i + 2] > 100 && data[i + 3] > 128) {
        // B channel and alpha
        const pixelIndex = i / 4;
        const x = pixelIndex % canvas.current.width;
        const y = Math.floor(pixelIndex / canvas.current.width);
        pixels.push({ x, y });
      }
    }

    if (pixels.length > 5) {
      // Convert pixels to lat/lng
      const latlngs = pixels.map((pixel) => {
        const point = L.point(pixel.x, pixel.y);
        return map.current.unproject(point);
      });

      // Create polyline
      const polyline = L.polyline(latlngs, {
        color: "#0066cc",
        weight: 3,
        opacity: 0.8,
      }).addTo(map.current);

      // Click to delete
      polyline.on("click", () => {
        if (map.current.hasLayer(polyline)) {
          map.current.removeLayer(polyline);
          drawnItems.current = drawnItems.current.filter(
            (item) => item !== polyline,
          );
          setItemCount(drawnItems.current.length);
        }
      });

      drawnItems.current.push(polyline);
      setItemCount(drawnItems.current.length);
    }

    // Clear canvas
    ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
  };

  const loadGeometry = (geometry) => {
    if (!geometry || !map.current) return;

    try {
      const layer = L.geoJSON(geometry, {
        style: {
          color: "#0066cc",
          weight: 3,
          opacity: 0.8,
        },
      }).addTo(map.current);

      drawnItems.current = [];
      layer.eachLayer((sublayer) => {
        drawnItems.current.push(sublayer);
        sublayer.on("click", () => {
          if (map.current && map.current.hasLayer(sublayer)) {
            map.current.removeLayer(sublayer);
            drawnItems.current = drawnItems.current.filter(
              (item) => item !== sublayer,
            );
            setItemCount(drawnItems.current.length);
          }
        });
      });

      setItemCount(drawnItems.current.length);
      if (layer.getBounds().isValid()) {
        map.current.fitBounds(layer.getBounds());
      }
    } catch (error) {
      console.error("Error loading geometry:", error);
    }
  };

  const clearDrawing = () => {
    // Remove all polylines from map
    drawnItems.current.forEach((item) => {
      if (map.current && map.current.hasLayer(item)) {
        map.current.removeLayer(item);
      }
    });
    drawnItems.current = [];
    setItemCount(0);

    // Clear canvas
    if (canvas.current && ctx.current) {
      ctx.current.clearRect(0, 0, canvas.current.width, canvas.current.height);
    }
  };

  const saveDrawing = () => {
    if (drawnItems.current.length === 0) {
      alert("Please draw an area on the map before saving.");
      return;
    }

    // Convert to GeoJSON
    const features = drawnItems.current
      .map((item) => {
        try {
          return item.toGeoJSON();
        } catch (error) {
          return null;
        }
      })
      .filter(Boolean);

    const geoJson = {
      type: "FeatureCollection",
      features: features,
    };

    onSave(geoJson);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Draw Coverage Area
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Click and drag on the map to draw the coverage area. Like painting
              in MS Paint!
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-200 transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Map Container */}
        <div
          ref={mapContainer}
          className="flex-1 relative"
          style={{ minHeight: "500px", background: "#f0f0f0" }}
        />

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-gray-600">
            {itemCount > 0 ? (
              <p>
                ✓ <span className="font-semibold">{itemCount}</span> area(s)
                drawn -
                <span className="text-blue-600 ml-1">
                  Click on any line to delete
                </span>
              </p>
            ) : (
              <p className="text-gray-500">Draw on the map to start</p>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              variant="secondary"
              onClick={clearDrawing}
              className="gap-2"
            >
              <Trash2 size={16} />
              Clear All
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={saveDrawing} className="gap-2">
              <Save size={16} />
              Save Coverage Area
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
