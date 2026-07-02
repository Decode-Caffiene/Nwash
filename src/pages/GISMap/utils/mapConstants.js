import L from "leaflet";

export const NEPAL_CENTER = [28.3949, 84.124];

// Keys are normalizeText() output — handles spacing, accents, and case variants
// that appear in real project data (e.g. "Koshi Province", "Province No. 3").
export const PROVINCE_NAME_TO_NO = {
  koshi: 1,         province1: 1,  provinceno1: 1,  province01: 1, koshiprovince: 1,
  madhesh: 2,       province2: 2,  provinceno2: 2,  madheshprovince: 2, madheshpradesh: 2,
  bagmati: 3,       province3: 3,  provinceno3: 3,  bagmatiprovince: 3, bagmatipradesh: 3,
  gandaki: 4,       province4: 4,  provinceno4: 4,  gandakiprovince: 4, gandakipradesh: 4,
  lumbini: 5,       province5: 5,  provinceno5: 5,  lumbiniprovince: 5, lumbinipradesh: 5,
  karnali: 6,       province6: 6,  provinceno6: 6,  karnaliprovince: 6, karnalipradesh: 6,
  sudurpaschim: 7,  sudurpashchim: 7, province7: 7, provinceno7: 7,
  sudurpashchimprovince: 7, sudurpashchimpradesh: 7, farwest: 7, farwesternprovince: 7,
};

// Municipality name corrections for known severe typos in project data
// where Levenshtein matching would be unsafe.
export const MUNI_CORRECTIONS = {
  "rupakot majuwa rupkot": "Rupakot Majhuwagadhi",
};

// Zone colours matching zoneAnalytics.js categories
const ZONE_COLORS = {
  VERY_POOR: "#dc2626",
  POOR: "#ec4899",
  INACTIVE: "#475569",
  ACTIVE: "#15803d",
  HIGHLY_EFFICIENT: "#1e40af",
  MODERATELY_EFFICIENT: "#06b6d4",
  JUST_EFFICIENT: "#84cc16",
  IMPROVED: "#65a30d",
  IMPROVING: "#d5d906",
};

export const categoryMarkerIcons = {};
for (const [key, color] of Object.entries(ZONE_COLORS)) {
  categoryMarkerIcons[key] = L.divIcon({
    html: `<span style="display:block;width:12px;height:12px;border-radius:9999px;border:2.5px solid #fff;background:${color};box-shadow:0 2px 8px ${color}99,0 0 0 4px ${color}33;"></span>`,
    className: "",
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

export const defaultMarkerIcon = L.divIcon({
  html: `<span style="display:block;width:12px;height:12px;border-radius:9999px;border:2.5px solid #fff;background:#10b981;box-shadow:0 2px 8px rgba(16,185,129,0.55),0 0 0 4px rgba(16,185,129,0.2);"></span>`,
  className: "",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

export const selectedMarkerIcon = L.divIcon({
  html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;border:2.5px solid #fff;background:#3b82f6;box-shadow:0 2px 14px rgba(59,130,246,0.7),0 0 0 7px rgba(59,130,246,0.25);"></span>`,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});