import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Edit3, X } from "lucide-react";
import {
  getMunicipalityBoundary,
  getDistrictBoundary,
  displayBoundaryOnMap,
  fitMapToLayer,
} from "./boundaryUtils";

export default function CoverageAreaPreview({
  geojson,
  district,
  municipalityName,
  onEdit,
  onClear,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const geoJsonLayer = useRef(null);
  const boundaryLayer = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      if (map.current) {
        map.current.remove();
      }

      map.current = L.map(mapContainer.current).setView([28.3949, 84.124], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map.current);

      // Display boundary (municipality preferred; fallback to district)
      const municipalityBoundaryGeoJSON = getMunicipalityBoundary(
        district,
        municipalityName,
      );
      const boundaryGeoJSON =
        municipalityBoundaryGeoJSON || getDistrictBoundary(district);

      if (boundaryGeoJSON) {
        boundaryLayer.current = displayBoundaryOnMap(
          map.current,
          boundaryGeoJSON,
        );
      }

      // Display drawn coverage area (only if geojson exists and parses)
      let coverage = null;
      if (geojson) {
        try {
          coverage =
            typeof geojson === "string" ? JSON.parse(geojson) : geojson;
        } catch {
          coverage = null;
        }
      }

      if (coverage) {
        geoJsonLayer.current = L.geoJSON(coverage, {
          style: {
            color: "#0066cc",
            weight: 3,
            opacity: 0.8,
            fillColor: "#0066cc",
            fillOpacity: 0.2,
          },
        }).addTo(map.current);
      }

      // Fit map
      // - If coverage exists: fit to both boundary + coverage
      // - If coverage doesn't exist: fit only to boundary (so district/municipalities are visible)
      const hasCoverage = Boolean(geoJsonLayer.current);
      const hasBoundary = Boolean(boundaryLayer.current);

      if (hasCoverage) {
        const group = new L.FeatureGroup(
          [boundaryLayer.current, geoJsonLayer.current].filter(Boolean),
        );
        const bounds = group.getBounds();
        if (bounds && bounds.isValid()) {
          map.current.fitBounds(bounds, { padding: [50, 50] });
        }
      } else if (hasBoundary) {
        const bounds = boundaryLayer.current.getBounds?.();
        if (bounds && bounds.isValid()) {
          map.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    } catch (error) {
      console.error("Error displaying coverage area preview:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [geojson, district, municipalityName]);

  return (
    <div className="rounded-xl border border-brand-primary/20 overflow-hidden bg-white shadow-sm">
      <div className="flex items-center justify-between bg-gradient-to-r from-brand-light to-white px-4 py-3 border-b border-brand-primary/10">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-brand-primary" />
          <h3 className="font-semibold text-text-primary text-sm">
            Coverage Area Preview
          </h3>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 hover:bg-brand-primary/10 rounded-lg transition text-brand-primary"
            title="Edit coverage area"
          >
            <Edit3 size={15} />
          </button>
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 hover:bg-red-100 rounded-lg transition text-red-600"
            title="Clear coverage area"
          >
            <X size={15} />
          </button>
        </div>
      </div>
      <div
        ref={mapContainer}
        className="w-full"
        style={{ height: "300px", background: "#f8fafc" }}
      />
    </div>
  );
}
