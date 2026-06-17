import L from "leaflet";
import municipalitiesData from "../../../../data/nepal_municipalities.json";

export const getMunicipalityBoundary = (district, municipalityName) => {
  if (!district || !municipalityName) return null;

  const features = municipalitiesData.features || [];
  const matching = features.filter(
    (feature) =>
      feature.properties?.DISTRICT === district &&
      feature.properties?.NAME === municipalityName
  );

  if (matching.length === 0) return null;

  return {
    type: "FeatureCollection",
    features: matching,
  };
};

export const getDistrictBoundary = (district) => {
  if (!district) return null;

  const features = municipalitiesData.features || [];
  const districtMunicipalities = features.filter(
    (feature) => feature.properties?.DISTRICT === district
  );

  if (districtMunicipalities.length === 0) return null;

  return {
    type: "FeatureCollection",
    features: districtMunicipalities,
  };
};

export const displayBoundaryOnMap = (map, geoJSON, options = {}) => {
  if (!map || !geoJSON) return null;

  const defaultOptions = {
    color: "#2c3e50",
    weight: 2,
    opacity: 0.7,
    fillColor: "#ecf0f1",
    fillOpacity: 0.15,
    dashArray: "5, 3",
  };

  const style = { ...defaultOptions, ...options };

  const geoJsonLayer = L.geoJSON(geoJSON, {
    style: style,
    pane: "overlayPane",
  }).addTo(map);

  // Bring the boundary to back so it doesn't interfere with drawn items
  if (geoJsonLayer.setZIndex) {
    geoJsonLayer.setZIndex(1);
  }

  return geoJsonLayer;
};

export const fitMapToLayer = (map, layer, padding = [50, 50]) => {
  if (!map || !layer) return;

  try {
    const bounds = layer.getBounds();
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding });
    }
  } catch (error) {
    console.error("Error fitting map to layer:", error);
  }
};
