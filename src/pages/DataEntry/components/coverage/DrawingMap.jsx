import React, { useEffect, useRef } from "react";
import { X, PenTool, CheckCircle, AlertCircle } from "lucide-react";
import L from "leaflet";
import Button from "../../../../components/common/Button";

export default function DrawingMap({
  municipalityName,
  district,
  province,
  mapError,
  drawingStats,
  drawModeEnabled,
  mapContainer,
  map,
  canvas,
  ctx,
  drawnItems,
  isDrawingMode,
  currentPixels,
  drawModeRef,
  onDrawModeToggle,
  onFinishDrawing,
  onCancelDrawing,
  onDeleteAll,
  onSetupCanvas,
  onSetMapError,
  onSetDrawingStats,
}) {
  useEffect(() => {
    drawModeRef.current = drawModeEnabled;

    if (!canvas.current || !map.current) return;

    if (drawModeEnabled) {
      canvas.current.style.cursor = "crosshair";
      canvas.current.style.pointerEvents = "auto";
      if (map.current.dragging) map.current.dragging.disable();
      if (map.current.touchZoom) map.current.touchZoom.disable();
      if (map.current.doubleClickZoom) map.current.doubleClickZoom.disable();
      if (map.current.scrollWheelZoom) map.current.scrollWheelZoom.disable();
      console.log("✏️ Draw mode enabled");
    } else {
      canvas.current.style.cursor = "grab";
      canvas.current.style.pointerEvents = "none";
      if (map.current.dragging) map.current.dragging.enable();
      if (map.current.touchZoom) map.current.touchZoom.enable();
      if (map.current.doubleClickZoom) map.current.doubleClickZoom.enable();
      if (map.current.scrollWheelZoom) map.current.scrollWheelZoom.enable();
      console.log("🖐️ Pan mode enabled");
    }
  }, [drawModeEnabled, canvas, map, drawModeRef]);

  return (
    <section className="stat-card">
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            🖊️ Drawing Coverage Area: {municipalityName}
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            {district}, {province} | Press Pencil button to draw, drag on map to draw lines
          </p>
        </div>
        <button
          onClick={onCancelDrawing}
          className="p-2 hover:bg-red-100 rounded-lg transition"
          title="Cancel and close"
        >
          <X size={20} className="text-red-600" />
        </button>
      </div>

      {mapError && (
        <div className="mb-4 rounded bg-red-50 p-3 border border-red-200 flex gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{mapError}</p>
        </div>
      )}

      <div
        ref={mapContainer}
        className="w-full h-96 rounded-lg overflow-hidden border-2 border-blue-400 bg-gray-100 relative"
        style={{ minHeight: "400px" }}
      >
        {/* Mode Indicator */}
        <div className="absolute top-4 right-4 z-[999] px-4 py-2 rounded-lg text-sm font-bold bg-white border-2 border-gray-300 shadow-md">
          {drawModeEnabled ? (
            <span className="text-blue-600 flex items-center gap-2">
              <span>✏️ Drawing Mode</span>
            </span>
          ) : (
            <span className="text-gray-600 flex items-center gap-2">
              <span>🖐️ Pan Mode</span>
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex gap-3 justify-between items-center">
          <div className="text-xs text-gray-600">
            {drawingStats.lines > 0 ? (
              <span>
                <span className="font-semibold">{drawingStats.lines}</span> area(s) drawn,{" "}
                <span className="font-semibold">{drawingStats.points}</span> points total
              </span>
            ) : (
              <span className="text-gray-400">👉 Press Pencil button, then drag on map to draw</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button variant="secondary" onClick={onCancelDrawing} className="gap-2">
            <X size={16} />
            Cancel
          </Button>

          <button
            onClick={onDrawModeToggle}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              drawModeEnabled
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                : "bg-white text-blue-600 border-2 border-blue-400 hover:bg-blue-50"
            }`}
            title={drawModeEnabled ? "Drawing mode ON - Click to pan" : "Click to enable drawing mode"}
          >
            <PenTool size={18} strokeWidth={2} />
            {drawModeEnabled ? "Drawing" : "Draw"}
          </button>

          <Button
            variant="secondary"
            onClick={onDeleteAll}
            disabled={drawnItems.current.length === 0}
            className="gap-2"
          >
            🗑️ Delete All
          </Button>

          <Button
            onClick={onFinishDrawing}
            disabled={drawnItems.current.length === 0}
            className="gap-2"
          >
            <CheckCircle size={16} />
            Done
          </Button>
        </div>
      </div>
    </section>
  );
}
