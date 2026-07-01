import L from "leaflet";
import { getMuniGeojson } from "../../../../api/mapService";

let muniCache = null;
let muniCachePromise = null;

const ensureMuniCache = async () => {
  if (muniCache) return muniCache;
  if (muniCachePromise) return muniCachePromise;

  muniCachePromise = (async () => {
    const geo = await getMuniGeojson();
    muniCache = geo;
    return geo;
  })();

  return muniCachePromise;
};

const normalizeBoundaryValue = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

// Same district name normalization as locationOptions.js
// Maps known GeoJSON misspellings to the national-dataset spelling.
const normalizeDistrict = (name) => {
  if (!name) return "";
  const canonical = String(name).trim().toLowerCase().replace(/\s+/g, " ");
  const MAP = {
    chitawan: "Chitwan",
    makawanpur: "Makwanpur",
    tanahu: "Tanahun",
    sindhupalchok: "Sindhupalchowk",
    kabhrepalanchok: "Kavrepalanchok",
    dhanusha: "Dhanusa",
    terhathum: "Terathum",
    rukum_e: "Rukum",
    rukum_w: "Rukum",
    nawalparasi_e: "Nawalpur",
    nawalparasi_w: "Nawalparasi",
  };
  return MAP[canonical] || name.trim();
};

export const getMunicipalityBoundary = (district, municipalityName) => {
  if (!district || !municipalityName) return null;
  // NOTE: legacy sync export (kept for compatibility)
  if (!muniCache?.features) return null;

  const districtNorm = normalizeBoundaryValue(normalizeDistrict(district));
  const muniNameNorm = normalizeBoundaryValue(municipalityName);

  const features = muniCache.features || [];
  const matching = features.filter((feature) => {
    const featureDistrictNorm = normalizeBoundaryValue(
      normalizeDistrict(feature.properties?.DISTRICT),
    );
    const featureNameNorm = normalizeBoundaryValue(feature.properties?.NAME);

    return (
      featureDistrictNorm === districtNorm && featureNameNorm === muniNameNorm
    );
  });

  if (matching.length === 0) return null;

  return {
    type: "FeatureCollection",
    features: matching,
  };
};

export const getMunicipalityBoundaryAsync = async (
  district,
  municipalityName,
) => {
  if (!district || !municipalityName) return null;
  const muniGeo = await ensureMuniCache();
  const features = muniGeo?.features || [];

  const districtNorm = normalizeBoundaryValue(normalizeDistrict(district));
  const muniNameNorm = normalizeBoundaryValue(municipalityName);

  const matching = features.filter((feature) => {
    const featureDistrictNorm = normalizeBoundaryValue(
      normalizeDistrict(feature.properties?.DISTRICT),
    );
    const featureNameNorm = normalizeBoundaryValue(feature.properties?.NAME);

    return (
      featureDistrictNorm === districtNorm && featureNameNorm === muniNameNorm
    );
  });

  if (matching.length === 0) return null;

  return {
    type: "FeatureCollection",
    features: matching,
  };
};

export const getDistrictBoundary = (district) => {
  if (!district) return null;
  // NOTE: legacy sync export (kept for compatibility)
  if (!muniCache?.features) return null;

  const districtNorm = normalizeDistrict(district);
  const features = muniCache.features || [];
  const districtMunicipalities = features.filter(
    (feature) =>
      normalizeDistrict(feature.properties?.DISTRICT) === districtNorm,
  );

  if (districtMunicipalities.length === 0) return null;

  return {
    type: "FeatureCollection",
    features: districtMunicipalities,
  };
};

export const getDistrictBoundaryAsync = async (district) => {
  if (!district) return null;
  const muniGeo = await ensureMuniCache();
  const features = muniGeo?.features || [];

  const districtNorm = normalizeDistrict(district);
  const districtMunicipalities = features.filter(
    (feature) =>
      normalizeDistrict(feature.properties?.DISTRICT) === districtNorm,
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
