import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

// Imperative Leaflet controller — must live inside <MapContainer>.
// Smoothly flies the viewport to the selected project's municipality centroid.
// Guards against redundant animations using a ref comparison.
export default function ProjectFlyController({ center }) {
  const map = useMap();
  const prevRef = useRef(null);

  useEffect(() => {
    if (!center) return;
    const [lat, lng] = center;
    if (prevRef.current?.[0] === lat && prevRef.current?.[1] === lng) return;
    prevRef.current = center;
    map.flyTo(center, 12, { duration: 1.0 });
  }, [center, map]);

  return null;
}