import L from "leaflet";

export const NEPAL_CENTER = [28.3949, 84.124];

// Keys are normalizeText() output — handles spacing, accents, and case variants
// that appear in real project data (e.g. "Koshi Province", "Province No. 3").
export const PROVINCE_NAME_TO_NO = {
  koshi: 1,
  province1: 1,
  provinceno1: 1,
  province01: 1,
  koshiprovince: 1,
  madhesh: 2,
  province2: 2,
  provinceno2: 2,
  madheshprovince: 2,
  madheshpradesh: 2,
  bagmati: 3,
  province3: 3,
  provinceno3: 3,
  bagmatiprovince: 3,
  bagmatipradesh: 3,
  gandaki: 4,
  province4: 4,
  provinceno4: 4,
  gandakiprovince: 4,
  gandakipradesh: 4,
  lumbini: 5,
  province5: 5,
  provinceno5: 5,
  lumbiniprovince: 5,
  lumbinipradesh: 5,
  karnali: 6,
  province6: 6,
  provinceno6: 6,
  karnaliprovince: 6,
  karnalipradesh: 6,
  sudurpaschim: 7,
  sudurpashchim: 7,
  province7: 7,
  provinceno7: 7,
  sudurpashchimprovince: 7,
  sudurpashchimpradesh: 7,
  farwest: 7,
  farwesternprovince: 7,
};

// Municipality name corrections for known severe typos in project data
// where Levenshtein matching would be unsafe.
export const MUNI_CORRECTIONS = {
  "rupakot majuwa rupkot": "Rupakot Majhuwagadhi",
};

// Maps what cleanDistrict() produces (uppercase of DB value) to the district
// name as it appears in nepal_municipalities.json (used by buildMuniIndex).
// Keep this separate from DISTRICT_TO_WARD_KEY — the two datasets have
// independent spellings. Verified by cross-referencing all 75 municipality
// JSON district names: ILLAM is the only project-DB key that doesn't match.
export const MUNI_DISTRICT_CORRECTIONS = {
  ILLAM: "ILAM",
};

// Maps what cleanDistrict() produces (uppercase of DB value) to the exact
// DISTRICT field string used in nepal_wards.min.geojson.
// These 9 districts have different official spellings between the two datasets.
export const DISTRICT_TO_WARD_KEY = {
  MAKWANPUR: "MAKAWANPUR",
  CHITWAN: "CHITAWAN",
  DHANUSA: "DHANUSHA",
  KAVREPALANCHOK: "KABHREPALANCHOK",
  SINDHUPALCHOWK: "SINDHUPALCHOK",
  TANAHUN: "TANAHU",
  TERATHUM: "TERHATHUM",
  MANAG: "MANANG",
  ILLAM: "ILAM",
};

// Base map styles selectable from the map type control.
// "default" is the original CartoDB Voyager style the map always used.
export const BASEMAPS = {
  default: {
    label: "Default",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    subdomains: ["a", "b", "c", "d"],
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  osm: {
    label: "OSM",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: ["a", "b", "c"],
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  hybrid: {
    label: "Hybrid",
    url: "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution: "Imagery &copy; Google",
  },
};

// Population density overlay tiles — rendered semi-transparent on top of the
// selected basemap when toggled on.
export const POPULATION_DENSITY_URL =
  "https://comfy-cocada-48d405.netlify.app/{z}/{x}/{y}.png";

// Inline styles only — no animation needed for the idle state.
export const defaultMarkerIcon = L.divIcon({
  html: `<div style="width:13px;height:13px;border-radius:50%;background:#10b981;border:2.5px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,0.28),0 0 0 1.5px rgba(16,185,129,0.22)"></div>`,
  className: "",
  iconSize: [13, 13],
  iconAnchor: [6, 6],
  popupAnchor: [0, -8],
});

// CSS classes (.sel-marker, .sel-marker-ring, .sel-marker-dot) are defined in
// styles/index.css so the pulse animation can run outside React's rendering.
export const selectedMarkerIcon = L.divIcon({
  html: `<div class="sel-marker"><span class="sel-marker-ring"></span><span class="sel-marker-dot"></span></div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});
