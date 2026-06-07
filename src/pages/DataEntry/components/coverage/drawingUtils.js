import L from "leaflet";

export const setupCanvasDrawing = (mapContainer, map, ctx, drawModeRef, drawnItems, currentPixels, setDrawingStats, setMapError) => {
  try {
    if (!map || !mapContainer) return null;

    const container = mapContainer;
    const oldCanvas = container.querySelector("#drawingCanvas");
    if (oldCanvas) oldCanvas.remove();

    const newCanvas = document.createElement("canvas");
    newCanvas.id = "drawingCanvas";

    newCanvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: grab;
      z-index: 9999;
      background: transparent;
      pointer-events: none;
    `;

    if (map.dragging) map.dragging.enable();

    container.appendChild(newCanvas);
    const canvasCtx = newCanvas.getContext("2d");

    newCanvas.width = container.offsetWidth;
    newCanvas.height = container.offsetHeight;

    const handleResize = () => {
      if (newCanvas && container) {
        newCanvas.width = container.offsetWidth;
        newCanvas.height = container.offsetHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    const isDrawingMode = { current: false };

    const onMouseDown = (e) => {
      if (!drawModeRef.current) return;

      isDrawingMode.current = true;
      currentPixels.current = [];

      const rect = newCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      currentPixels.current.push({ x, y });
      canvasCtx.beginPath();
      canvasCtx.moveTo(x, y);
      console.log("🎨 Drawing started at", { x, y });
    };

    const onMouseMove = (e) => {
      if (!isDrawingMode.current || !drawModeRef.current) return;

      const rect = newCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (currentPixels.current.length > 5000) {
        console.warn("Drawing line is too complex, stopping capture");
        return;
      }

      currentPixels.current.push({ x, y });

      canvasCtx.strokeStyle = "#0066cc";
      canvasCtx.lineWidth = 4;
      canvasCtx.lineJoin = "round";
      canvasCtx.lineCap = "round";
      canvasCtx.lineTo(x, y);
      canvasCtx.stroke();
    };

    const onMouseUp = (e) => {
      if (!isDrawingMode.current || !drawModeRef.current) return;
      isDrawingMode.current = false;

      if (currentPixels.current.length > 5) {
        console.log("💾 Saving drawing with", currentPixels.current.length, "points");
        saveDrawingAsPolyline(currentPixels.current, map, canvasCtx, newCanvas, drawnItems, setDrawingStats);
      } else {
        if (canvasCtx) {
          canvasCtx.clearRect(0, 0, newCanvas.width, newCanvas.height);
        }
      }

      currentPixels.current = [];
    };

    const onMouseLeave = (e) => {
      if (isDrawingMode.current && drawModeRef.current) {
        isDrawingMode.current = false;
        if (currentPixels.current.length > 5) {
          saveDrawingAsPolyline(currentPixels.current, map, canvasCtx, newCanvas, drawnItems, setDrawingStats);
        }
        if (canvasCtx) {
          canvasCtx.clearRect(0, 0, newCanvas.width, newCanvas.height);
        }
        currentPixels.current = [];
      }
    };

    newCanvas.addEventListener("mousedown", onMouseDown);
    newCanvas.addEventListener("mousemove", onMouseMove);
    newCanvas.addEventListener("mouseup", onMouseUp);
    newCanvas.addEventListener("mouseleave", onMouseLeave);

    console.log("✅ Canvas setup complete");

    return {
      canvas: newCanvas,
      ctx: canvasCtx,
      cleanup: () => {
        console.log("🧹 Cleaning up canvas listeners");
        window.removeEventListener("resize", handleResize);
        newCanvas.removeEventListener("mousedown", onMouseDown);
        newCanvas.removeEventListener("mousemove", onMouseMove);
        newCanvas.removeEventListener("mouseup", onMouseUp);
        newCanvas.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  } catch (error) {
    console.error("Canvas setup error:", error);
    setMapError("Failed to setup drawing canvas");
    return null;
  }
};

const saveDrawingAsPolyline = (pixels, map, canvasCtx, canvas, drawnItems, setDrawingStats) => {
  try {
    if (!map || !pixels || pixels.length < 5) return;

    const latlngs = pixels.map((pixel) => {
      const point = L.point(pixel.x, pixel.y);
      return map.unproject(point);
    });

    const polyline = L.polyline(latlngs, {
      color: "#0066cc",
      weight: 3,
      opacity: 0.8,
    }).addTo(map);

    polyline.on("click", () => {
      try {
        if (map && map.hasLayer(polyline)) {
          map.removeLayer(polyline);
          drawnItems.current = drawnItems.current.filter((item) => item !== polyline);
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
        console.error("Error deleting polyline:", error);
      }
    });

    drawnItems.current.push(polyline);

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

    if (canvasCtx && canvas) {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
  } catch (error) {
    console.error("Error saving drawing:", error);
  }
};
