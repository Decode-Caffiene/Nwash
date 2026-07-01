import { GeoJSON, MapContainer, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import nepalBoundary from "../../../data/boundary.json";
import nepalProvinces from "../../../data/nepal_provinces.json";
import { NEPAL_CENTER, defaultMarkerIcon, selectedMarkerIcon } from "../utils/mapConstants";
import MuniBoundsController from "./controllers/MuniBoundsController";
import ProjectFlyController from "./controllers/ProjectFlyController";

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

const wardStyle = () => ({
  color: "#2563eb",
  weight: 2,
  fillColor: "#3b82f6",
  fillOpacity: 0.28,
});

const muniStyle = () => ({
  color: "#f59e0b",
  weight: 2.5,
  fillColor: "#fcd34d",
  fillOpacity: 0.22,
});

export default function MapCanvas({
  projects,
  projectLocations,
  selectedProject,
  showProjects,
  wardFeatures,
  muniZoomFeatures,
  selectedCentroid,
  onSelectProject,
}) {
  return (
    <MapContainer
      center={NEPAL_CENTER}
      zoom={7}
      scrollWheelZoom
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

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
        />
      )}

      {muniZoomFeatures.length > 0 && (
        <GeoJSON
          key={`muni-${muniZoomFeatures[0]?.properties?.NAME}`}
          data={{ type: "FeatureCollection", features: muniZoomFeatures }}
          style={muniStyle}
        />
      )}

      {showProjects &&
        projects.map((project) => {
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
                <div style={{ minWidth: 160 }}>
                  <p style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                    {project.WSUC_Name || project.WSUC_ID}
                  </p>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0" }}>
                    {project.Location?.Municipality_Name || "Unknown municipality"}
                  </p>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0" }}>
                    {project.Location?.District_Name || "Unknown district"}
                  </p>
                  <p style={{ fontSize: 12, color: "#10b981", fontWeight: 600, marginTop: 6 }}>
                    OM Score:{" "}
                    {project.Summary_Index?.OM_Score != null
                      ? `${(Number(project.Summary_Index.OM_Score) * 100).toFixed(2)}%`
                      : "—"}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}