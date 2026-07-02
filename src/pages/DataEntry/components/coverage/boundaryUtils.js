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

const canonicalizeName = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[’']/g, "'")
    .replace(/\s*-\s*/g, "-")
    .replace(/[.,]/g, "");
};

const canonicalizeForFuzzyMatch = (value) => {
  return canonicalizeName(value)
    .replace(
      /\b(gaunpalika|nagarpalika|mahanagarpalika|upamahanagarpalika)\b/g,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
};

const toTitleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

// Levenshtein distance for fuzzy fallback matching
const levenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const municipalityNameMatches = ({
  geoNameCanon,
  searchNameCanon,
  geoNameFuzzy,
  searchNameFuzzy,
}) => {
  if (geoNameCanon === searchNameCanon) return true;
  if (geoNameFuzzy && searchNameFuzzy && geoNameFuzzy === searchNameFuzzy)
    return true;
  if (geoNameCanon && searchNameCanon) {
    if (
      geoNameCanon.startsWith(searchNameCanon) ||
      searchNameCanon.startsWith(geoNameCanon)
    )
      return true;
  }
  const geoNoSpace = geoNameCanon ? geoNameCanon.replace(/\s+/g, "") : "";
  const searchNoSpace = searchNameCanon
    ? searchNameCanon.replace(/\s+/g, "")
    : "";
  if (geoNoSpace && searchNoSpace && geoNoSpace === searchNoSpace) return true;

  const checkLevenshtein = (a, b) => {
    if (!a || !b || a.length < 4 || b.length < 4) return false;
    const dist = levenshteinDistance(a, b);
    const maxLen = Math.max(a.length, b.length);
    return dist <= 1 || (dist <= 2 && dist / maxLen <= 0.25);
  };

  if (checkLevenshtein(geoNameCanon, searchNameCanon)) return true;
  if (
    geoNameFuzzy &&
    searchNameFuzzy &&
    checkLevenshtein(geoNameFuzzy, searchNameFuzzy)
  )
    return true;

  return false;
};

// Municipality name aliases: national-dataset names that differ from GeoJSON names.
const MUNICIPALITY_NAME_ALIASES = {
  bethanchok: "Bethanchowk",
  "mandan deupur": "Mandandeupur",
  bhojpur: "Bhumlu",
  ichchhakamana: "Ichchhyakamana",
  ichchhhyakamana: "Ichchhyakamana",
  ichchhyakamana: "Ichchhyakamana",
};

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
    kavrepalanchowk: "Kavrepalanchok",
    dhanusha: "Dhanusa",
    terhathum: "Terathum",
    rukum_e: "Rukum",
    rukum_w: "Rukum",
    nawalparasi_e: "Nawalparasi",
    nawalparasi_w: "Nawalparasi",
    nawalpur: "Nawalparasi",
    manag: "Manang",
  };
  return MAP[canonical] || toTitleCase(name);
};

const findMatchingFeatures = (features, district, municipalityName) => {
  const districtNorm = normalizeDistrict(district);

  const searchNameCanon = canonicalizeName(municipalityName);
  const searchNameFuzzy = canonicalizeForFuzzyMatch(municipalityName);

  // Resolve national-dataset municipality name aliases to GeoJSON names
  const aliasedName =
    MUNICIPALITY_NAME_ALIASES[searchNameCanon] || municipalityName;
  const aliasedNameCanon = canonicalizeName(aliasedName);
  const aliasedNameFuzzy = canonicalizeForFuzzyMatch(aliasedName);

  const matching = features.filter((feature) => {
    const featureDistrictNorm = normalizeDistrict(
      feature.properties?.DISTRICT,
    );
    if (featureDistrictNorm !== districtNorm) return false;

    const geoNameCanon = canonicalizeName(feature.properties?.NAME);
    const geoNameFuzzy = canonicalizeForFuzzyMatch(feature.properties?.NAME);

    // Try direct match first
    if (
      municipalityNameMatches({
        geoNameCanon,
        searchNameCanon,
        geoNameFuzzy,
        searchNameFuzzy,
      })
    ) {
      return true;
    }

    // Try alias-resolved name
    if (aliasedName !== municipalityName) {
      return municipalityNameMatches({
        geoNameCanon,
        searchNameCanon: aliasedNameCanon,
        geoNameFuzzy,
        searchNameFuzzy: aliasedNameFuzzy,
      });
    }

    return false;
  });

  return matching;
};

export const getMunicipalityBoundary = (district, municipalityName) => {
  if (!district || !municipalityName) return null;
  // NOTE: legacy sync export (kept for compatibility)
  if (!muniCache?.features) return null;

  const matching = findMatchingFeatures(
    muniCache.features,
    district,
    municipalityName,
  );

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

  const matching = findMatchingFeatures(features, district, municipalityName);

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
