import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import nepalBoundary from "../../../data/boundary.json";
import nepalProvinces from "../../../data/nepal_provinces.json";
import {
  BASEMAPS,
  NEPAL_CENTER,
  POPULATION_DENSITY_URL,
  defaultMarkerIcon,
  selectedMarkerIcon,
} from "../utils/mapConstants";
import { parseWardList } from "../utils/geoHelpers";

import MuniBoundsController from "./controllers/MuniBoundsController";
import ProjectFlyController from "./controllers/ProjectFlyController";

// ── Score helpers ─────────────────────────────────────────────────────────────

// OM_Score is a 0–1 ratio; SPI and Reliability_Score are already 0–100.
const toPercent = (ratio) => Number(ratio) * 100;

// Returns a semantic colour based on performance level.
const scoreColor = (pct) => {
  if (pct == null) return "#94a3b8";
  if (pct >= 70) return "#059669";
  if (pct >= 40) return "#d97706";
  return "#dc2626";
};

// ── Popup sub-components ──────────────────────────────────────────────────────

function LocationField({ label, value }) {
  return (
    <div>
      <p
        style={{
          margin: 0,
          fontSize: 9,
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "2px 0 0",
          fontSize: 11,
          fontWeight: 500,
          color: "#334155",
          lineHeight: 1.35,
        }}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function ScoreCell({ label, pct }) {
  const color = scoreColor(pct);
  return (
    <div style={{ textAlign: "center" }}>
      <p
        style={{
          margin: 0,
          fontSize: 9,
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "4px 0 0",
          fontSize: 15,
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {pct != null ? `${pct.toFixed(1)}%` : "—"}
      </p>
      {/* Thin coloured underline gives a traffic-light cue at a glance */}
      <div
        style={{
          height: 2,
          borderRadius: 2,
          background: color,
          opacity: pct != null ? 0.35 : 0,
          marginTop: 4,
        }}
      />
    </div>
  );
}

function ProjectPopup({ project }) {
  const summary = project.Summary_Index || {};
  const location = project.Location || {};
  const wardCount = parseWardList(location.Wards_Covered).length;

  const omPct = summary.OM_Score != null ? toPercent(summary.OM_Score) : null;
  const spiPct = summary.SPI != null ? Number(summary.SPI) : null;
  const relPct =
    summary.Reliability_Score != null
      ? Number(summary.Reliability_Score)
      : null;

  return (
    <div style={{ width: 260, fontFamily: "inherit" }}>
      {/* Dark header — WSUC name + subtitle */}
      <div
        style={{
          background: "#0f172a",
          padding: "11px 14px 10px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.3,
          }}
        >
          {project.WSUC_Name || `WSUC ${project.WSUC_ID}`}
        </p>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: 10,
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.04em",
          }}
        >
          Water Supply &amp; Sanitation Unit
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px 10px" }}>
        {/* Location row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 8,
          }}
        >
          <LocationField label="Province" value={location.Province_Name} />
          <LocationField label="District" value={location.District_Name} />
          <LocationField
            label="Municipality"
            value={location.Municipality_Name}
          />
        </div>

        {/* Score row */}
        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            marginTop: 10,
            paddingTop: 10,
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 9,
              fontWeight: 600,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Performance Scores
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
            }}
          >
            <ScoreCell label="OM Score" pct={omPct} />
            <ScoreCell label="SPI" pct={spiPct} />
            <ScoreCell label="Reliability" pct={relPct} />
          </div>
        </div>

        {/* Ward coverage */}
        <p
          style={{
            margin: "10px 0 0",
            paddingTop: 8,
            borderTop: "1px solid #f1f5f9",
            fontSize: 11,
            color: "#64748b",
          }}
        >
          {wardCount > 0
            ? `Covers ${wardCount} ward${wardCount !== 1 ? "s" : ""}`
            : "Ward coverage not recorded"}
        </p>
      </div>
    </div>
  );
}

// ── Map layer styles ──────────────────────────────────────────────────────────

const boundaryStyle = {
  color: "#1e3a5f",
  weight: 2.5,
  fillColor: "#dbeafe",
  fillOpacity: 0.04,
};

const provinceStyle = {
  color: "#64748b",
  weight: 1.5,
  dashArray: "6 5",
  fillOpacity: 0,
};

// 8-colour palette gives more variety before repeating; adjacent wards
// (consecutive ward numbers) reliably get different colours.
const WARD_PALETTE = [
  { fill: "#3b82f6", stroke: "#2563eb" },
  { fill: "#10b981", stroke: "#059669" },
  { fill: "#f59e0b", stroke: "#d97706" },
  { fill: "#8b5cf6", stroke: "#7c3aed" },
  { fill: "#f43f5e", stroke: "#e11d48" },
  { fill: "#06b6d4", stroke: "#0891b2" },
  { fill: "#84cc16", stroke: "#65a30d" },
  { fill: "#fb923c", stroke: "#ea580c" },
];

const wardStyle = (feature) => {
  const wardNo = feature?.properties?.WARD_NO ?? 0;
  const { fill, stroke } = WARD_PALETTE[wardNo % WARD_PALETTE.length];
  return {
    color: stroke,
    weight: 2,
    fillColor: fill,
    fillOpacity: 0.22,
    // className triggers the .ward-polygon fade-in animation (styles/index.css)
    className: "ward-polygon",
  };
};

const onEachWard = (_feature, layer) => {
  layer.on({
    mouseover: (e) => {
      e.target.setStyle({ fillOpacity: 0.52, weight: 3 });
      e.target.bringToFront();
    },
    mouseout: (e) => {
      e.target.setStyle({ fillOpacity: 0.22, weight: 2 });
    },
  });
};

const muniStyle = () => ({
  color: "#f59e0b",
  weight: 2.5,
  fillColor: "#fcd34d",
  fillOpacity: 0.22,
});

// ── MapCanvas ─────────────────────────────────────────────────────────────────

export default function MapCanvas({
  projects,
  projectLocations,
  selectedProject,
  showProjects,
  wardFeatures,
  muniZoomFeatures,
  selectedCentroid,
  onSelectProject,
  mapType,
  showDensity,
}) {
  const basemap = BASEMAPS[mapType] ?? BASEMAPS.default;

  return (
    <MapContainer
      center={NEPAL_CENTER}
      zoom={7}
      scrollWheelZoom
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        key={mapType}
        attribution={basemap.attribution}
        url={basemap.url}
        subdomains={basemap.subdomains}
      />

      {showDensity && <TileLayer url={POPULATION_DENSITY_URL} opacity={0.6} />}

      <ZoomControl position="bottomright" />

      {selectedCentroid && <ProjectFlyController center={selectedCentroid} />}
      <MuniBoundsController features={muniZoomFeatures} />

      <GeoJSON data={nepalBoundary} style={boundaryStyle} />
      <GeoJSON data={nepalProvinces} style={provinceStyle} />

      {wardFeatures.length > 0 && (
        <GeoJSON
          key={`wards-${selectedProject?._id}-${wardFeatures.length}`}
          data={{ type: "FeatureCollection", features: wardFeatures }}
          style={wardStyle}
          onEachFeature={onEachWard}
        />
      )}

      {muniZoomFeatures.length > 0 && (
        <GeoJSON
          key={`muni-${muniZoomFeatures[0]?.properties?.NAME}`}
          data={{ type: "FeatureCollection", features: muniZoomFeatures }}
          style={muniStyle}
        />
      )}

      {showProjects && (
        <MarkerClusterGroup
          disableClusteringAtZoom={12}
          showCoverageOnHover={false}
          maxClusterRadius={60}
        >
          {projects.map((project) => {
            const { lat, lng } = projectLocations[project._id] || {};
            const isSelected = selectedProject?._id === project._id;
            return (
              <Marker
                key={project._id}
                position={[lat ?? NEPAL_CENTER[0], lng ?? NEPAL_CENTER[1]]}
                icon={isSelected ? selectedMarkerIcon : defaultMarkerIcon}
                zIndexOffset={isSelected ? 1000 : 0}
                eventHandlers={{ click: () => onSelectProject(project) }}
              >
                <Popup>
                  <ProjectPopup project={project} />
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      )}
    </MapContainer>
  );
}
