import React, { useEffect, useRef, useState } from "react";
import { X, PenTool, CheckCircle, AlertCircle, Trash2, Plus, Lock } from "lucide-react";
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
  onCompletePolygon,
  onFinishDrawing,
  onCancelDrawing,
  onDeleteAll,
  onSetupCanvas,
  onSetMapError,
  onSetDrawingStats,
  polygonDrawingRef,
}) {
  const [currentPointCount, setCurrentPointCount] = useState(0);

  useEffect(() => {
    const setupDrawingMode = () => {
      if (!map.current || !polygonDrawingRef?.current) return false;

      if (drawModeEnabled) {
        polygonDrawingRef.current.startDrawing();
        if (map.current.dragging) map.current.dragging.disable();
        if (map.current.scrollWheelZoom) map.current.scrollWheelZoom.disable();
      } else {
        polygonDrawingRef.current.stopDrawing();
        if (map.current.dragging) map.current.dragging.enable();
        if (map.current.scrollWheelZoom) map.current.scrollWheelZoom.enable();
      }
      return true;
    };

    if (!setupDrawingMode()) {
      const readyCheck = setInterval(() => {
        if (setupDrawingMode()) {
          clearInterval(readyCheck);
        }
      }, 300);
      return () => clearInterval(readyCheck);
    }
  }, [drawModeEnabled]);

  return (
    <section className="stat-card overflow-hidden">
      <div className="bg-gradient-to-r from-brand-light to-white px-5 py-4 -mx-5 -mt-5 border-b border-surface-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white shadow-sm">
              <PenTool size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Draw Coverage Area
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                {municipalityName}, {district}, {province}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelDrawing}
            className="p-2 hover:bg-red-100 rounded-lg transition text-red-600 hover:text-red-700"
            title="Cancel and close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {mapError && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{mapError}</p>
        </div>
      )}

      <div
        ref={mapContainer}
        className="w-full mt-4 rounded-xl overflow-hidden border-2 border-brand-primary/30 bg-gray-100 relative"
        style={{ minHeight: "400px" }}
      >
        {!map.current && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
              <p className="text-sm font-medium text-text-secondary">Initializing map...</p>
            </div>
          </div>
        )}

        {drawModeEnabled && (
          <div className="absolute top-20 left-4 z-[999] bg-white/95 backdrop-blur-sm border-l-4 border-brand-primary p-3.5 rounded-lg shadow-lg max-w-xs">
            <p className="text-sm text-text-primary font-semibold">Click points on the map to draw a polygon</p>
            <p className="text-xs text-text-secondary mt-1">Double-click to finish the current polygon</p>
          </div>
        )}

        <div className="absolute top-4 right-4 z-[999] px-3 py-1.5 rounded-lg text-xs font-bold bg-white/95 backdrop-blur-sm border shadow-lg">
          {!map.current ? (
            <span className="text-text-secondary flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-text-secondary" />
              Loading...
            </span>
          ) : drawModeEnabled ? (
            <span className="text-brand-primary flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-primary animate-pulse" />
              Drawing Mode
            </span>
          ) : (
            <span className="text-text-secondary flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-text-secondary" />
              Pan Mode
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between bg-surface rounded-lg px-4 py-2.5">
          <div className="text-sm text-text-secondary">
            {drawingStats.lines > 0 ? (
              <span>
                <span className="font-semibold text-text-primary">{drawingStats.lines}</span> polygon(s) drawn,{" "}
                <span className="font-semibold text-text-primary">{drawingStats.points}</span> points
              </span>
            ) : (
              <span className="text-text-secondary/60">Press "Start Drawing" then click the map to place points</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onCancelDrawing} className="gap-2">
            <X size={16} />
            Cancel
          </Button>

          <button
            type="button"
            onClick={onDrawModeToggle}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              drawModeEnabled
                ? "bg-brand-primary text-white hover:bg-brand-secondary shadow-md"
                : "bg-white text-brand-primary border-2 border-brand-primary/40 hover:bg-brand-light"
            }`}
            title={drawModeEnabled ? "Drawing mode ON - Click to pan" : "Click to enable drawing mode"}
          >
            <Plus size={18} strokeWidth={2} />
            {drawModeEnabled ? "Drawing" : "Start Drawing"}
          </button>

          {drawModeEnabled && (
            <button
              type="button"
              onClick={onCompletePolygon}
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 bg-violet-600 text-white hover:bg-violet-700 shadow-md"
              title="Complete the current polygon and start a new one"
            >
              <Lock size={16} />
              Complete
            </button>
          )}

          <Button
            variant="secondary"
            onClick={onDeleteAll}
            disabled={drawnItems.current.length === 0}
            className="gap-2"
          >
            <Trash2 size={16} />
            Delete All
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
