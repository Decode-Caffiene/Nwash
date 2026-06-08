import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

// Imperative Leaflet controller — must live inside <MapContainer>.
// Fits the viewport to the bounding box of a set of municipality GeoJSON features.
// Uses a key ref to skip re-triggering when the same features are passed again.
export default function MuniBoundsController({ features }) {
  const map = useMap();
  const keyRef = useRef(null);

  useEffect(() => {
    if (!features?.length) return;

    const key = features.map((f) => f.properties?.NAME).join(",");
    if (keyRef.current === key) return;
    keyRef.current = key;

    const layer = L.geoJSON({ type: "FeatureCollection", features });
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
    }
  }, [features, map]);

  return null;
}