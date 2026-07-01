import wardsGeojson from "../../../data/nepal_wards.min.geojson?raw";
import nationalDataset from "../../../data/nationaldataset.json";

const wards = JSON.parse(wardsGeojson);

const normalizeProvince = (p) => (p ? String(p).trim() : "");

const uniqueSorted = (values) =>
  [...new Set(values.filter(Boolean))].sort((first, second) =>
    first.localeCompare(second),
  );

const toTitleCase = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

// Normalize district names across datasets that use different spellings.
// The ward geojson (nepal_wards.min.geojson) has known misspellings and
// split-district suffixes (_E/_W) that need to align with the national dataset.
const normalizeDistrict = (name) => {
  if (!name) return "";

  // Use a canonical lowercase key for matching to avoid casing/underscore issues.
  const canonical = String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const MAP = {
    "chitawan": "Chitwan",
    "makawanpur": "Makwanpur",
    "tanahu": "Tanahun",
    "sindhupalchok": "Sindhupalchowk",
    "kabhrepalanchok": "Kavrepalanchok",
    "dhanusha": "Dhanusa",
    "terhathum": "Terathum",
    // Split districts: both _E and _W map to the parent district name
    "rukum_e": "Rukum",
    "rukum_w": "Rukum",
    "nawalparasi_e": "Nawalpur",
    "nawalparasi_w": "Nawalparasi",
  };

  return MAP[canonical] || toTitleCase(name);
};

// Enable temporary logs only when you want to debug.
// Usage: in devtools set window.__TRACE_WARDS_DEBUG__ = true
const TRACE_WARDS_DEBUG =
  typeof window !== "undefined" && window.__TRACE_WARDS_DEBUG__;

const canonicalizeName = (value) => {
  // Goal: stable matching across datasets with casing/spacing/punctuation differences
  return (
    String(value || "")
      .trim()
      .toLowerCase()
      // collapse whitespace
      .replace(/\s+/g, " ")
      // normalize common apostrophe variants
      .replace(/[’']/g, "'")
      // remove spaces around hyphens
      .replace(/\s*-\s*/g, "-")
      // remove common punctuation that can appear in different datasets
      .replace(/[.,]/g, "")
  );
};

const canonicalizeForFuzzyMatch = (value) => {
  // Additional normalization for fuzzy matching fallback.
  // Strip common words/suffixes that may appear inconsistently.
  return (
    canonicalizeName(value)
      // remove Nepal municipality-related suffixes if present in some datasets
      .replace(
        /\b(gaunpalika|nagarpalika|mahanagarpalika|upamahanagarpalika)\b/g,
        "",
      )
      // collapse again
      .replace(/\s+/g, " ")
      .trim()
  );
};

const municipalityNameMatches = ({
  wardMunicipalityNameCanon,
  municipalityNameCanon,
  wardMunicipalityNameFuzzy,
  municipalityNameFuzzy,
  municipalityIsInNational,
}) => {
  // 1) strict equality
  if (
    municipalityIsInNational
      ? wardMunicipalityNameCanon === municipalityNameCanon
      : wardMunicipalityNameCanon === municipalityNameCanon
  ) {
    return true;
  }

  // 2) fuzzy equality
  if (wardMunicipalityNameFuzzy && municipalityNameFuzzy) {
    if (wardMunicipalityNameFuzzy === municipalityNameFuzzy) return true;
  }

  // 3) prefix match (useful when one dataset has an extra leading/trailing token)
  if (wardMunicipalityNameCanon && municipalityNameCanon) {
    if (
      wardMunicipalityNameCanon.startsWith(municipalityNameCanon) ||
      municipalityNameCanon.startsWith(wardMunicipalityNameCanon)
    ) {
      return true;
    }
  }

  return false;
};

const VALID_MUNICIPALITY_TYPES = new Set([
  "Gaunpalika",
  "Mahanagarpalika",
  "Nagarpalika",
  "Upamahanagarpalika",
]);

const normalizeMunicipalityType = (type) => {
  const normalized = String(type || "")
    .trim()
    .toLowerCase();

  if (normalized === "maha nagarpalika") return "Mahanagarpalika";
  if (normalized === "gaupaika") return "Gaunpalika";

  return String(type || "").trim();
};

// -------------------------
// nationaldataset.json shape
// Expected by this UI:
// nationalDataset.provinces = ["Koshi", ...]
// OR
// nationalDataset.provinces is an object:
// { Koshi: { Bhojpur: { municipalities: [...] }, ... }, ... }
// -------------------------

const nationalProvincesFromObject =
  nationalDataset?.provinces && typeof nationalDataset.provinces === "object"
    ? Object.keys(nationalDataset.provinces)
    : [];

const PROVINCES_FROM_PROVIDED_ARRAY = Array.isArray(nationalDataset?.provinces)
  ? nationalDataset.provinces
  : [];

export const PROVINCES =
  PROVINCES_FROM_PROVIDED_ARRAY.length > 0
    ? PROVINCES_FROM_PROVIDED_ARRAY
    : nationalProvincesFromObject.length > 0
      ? nationalProvincesFromObject
      : [
          "Koshi",
          "Madhesh",
          "Bagmati",
          "Gandaki",
          "Lumbini",
          "Karnali",
          "Sudurpashchim",
        ];

const districtsByProvinceFromNational = (() => {
  const provincesObj =
    nationalDataset?.provinces && typeof nationalDataset.provinces === "object"
      ? nationalDataset.provinces
      : null;

  if (!provincesObj) return null;

  const result = {};
  for (const [province, districtsObj] of Object.entries(provincesObj)) {
    if (districtsObj && typeof districtsObj === "object") {
      result[province] = Object.keys(districtsObj);
    }
  }
  return result;
})();

const municipalitiesByDistrictFromNational = (() => {
  const provincesObj =
    nationalDataset?.provinces && typeof nationalDataset.provinces === "object"
      ? nationalDataset.provinces
      : null;

  if (!provincesObj) return null;

  // Map: district -> Set(municipalityName)
  const byDistrict = {};

  for (const districtsObj of Object.values(provincesObj)) {
    if (!districtsObj || typeof districtsObj !== "object") continue;

    for (const [district, districtInfo] of Object.entries(districtsObj)) {
      const munis =
        districtInfo && Array.isArray(districtInfo.municipalities)
          ? districtInfo.municipalities
          : [];

      if (!byDistrict[district]) byDistrict[district] = new Set();
      for (const m of munis) byDistrict[district].add(m);
    }
  }

  // Convert Set -> sorted arrays
  const out = {};
  for (const [district, muniSet] of Object.entries(byDistrict)) {
    out[district] = [...muniSet].sort((a, b) => a.localeCompare(b));
  }
  return out;
})();

const municipalitiesByDistrictAndProvinceFromNational = (() => {
  const provincesObj =
    nationalDataset?.provinces && typeof nationalDataset.provinces === "object"
      ? nationalDataset.provinces
      : null;

  if (!provincesObj) return null;

  // Map: province -> district -> municipalityName[]
  const out = {};
  for (const [province, districtsObj] of Object.entries(provincesObj)) {
    out[province] = {};
    for (const [district, districtInfo] of Object.entries(districtsObj || {})) {
      out[province][district] = Array.isArray(districtInfo?.municipalities)
        ? districtInfo.municipalities
        : [];
    }
  }
  return out;
})();

export const getDistrictOptions = (province) => {
  const normalized = normalizeProvince(province);

  // Prefer nationaldataset derived districts
  if (districtsByProvinceFromNational && normalized) {
    return districtsByProvinceFromNational[normalized] || [];
  }

  // Fallback: keep app usable even if dataset shape is unexpected
  return [];
};

// These types are not present in nationaldataset.json.
// We keep the UI stable by returning municipality types derived from geojson,
// but names shown for a district come from nationaldataset.json.
const municipalityRecords = wards.features
  .map(({ properties }) => ({
    district: normalizeDistrict(properties.DISTRICT),
    name: properties.GaPa_NaPa,
    type: normalizeMunicipalityType(properties.Type_GN),
  }))
  .filter(
    ({ district, name, type }) =>
      district && name && VALID_MUNICIPALITY_TYPES.has(type),
  );

export const getMunicipalityTypeOptions = (district) => {
  if (!district) return [];
  return uniqueSorted(
    municipalityRecords
      .filter((m) => m.district === district)
      .map((m) => m.type),
  );
};

export const getMunicipalityNameOptions = (district, municipalityType) => {
  const fromNational = municipalitiesByDistrictFromNational?.[district] || [];

  if (!municipalityType) return fromNational;

  // Filter national names by geojson type when type is selected.
  const allowedByType = new Set(
    municipalityRecords
      .filter((m) => m.district === district && m.type === municipalityType)
      .map((m) => m.name),
  );

  return uniqueSorted(fromNational.filter((name) => allowedByType.has(name)));
};

export const getWardFeatures = (
  district,
  municipalityName,
  municipalityType,
) => {
  const districtNorm = normalizeDistrict(district);
  const municipalityNameCanon = canonicalizeName(municipalityName);
  const municipalityNameFuzzy = canonicalizeForFuzzyMatch(municipalityName);

  // National dataset is the source of truth for how municipality names are spelled.
  // We match ward geojson to nationaldataset-derived names to avoid spacing/casing issues.
  const canonicalMunicipalities =
    municipalitiesByDistrictFromNational?.[district] || [];

  const canonicalMunicipalitiesCanon = canonicalMunicipalities.map((m) =>
    canonicalizeName(m),
  );
  const canonicalMunicipalitiesFuzzy = canonicalMunicipalities.map((m) =>
    canonicalizeForFuzzyMatch(m),
  );

  const municipalityIsInNational = canonicalMunicipalitiesCanon.includes(
    municipalityNameCanon,
  );
  const municipalityIsInNationalFuzzy = canonicalMunicipalitiesFuzzy.includes(
    municipalityNameFuzzy,
  );

  const debug =
    TRACE_WARDS_DEBUG &&
    districtNorm?.toLowerCase() === "chitwan" &&
    municipalityName &&
    String(municipalityName).length > 0;

  if (debug) {
    // eslint-disable-next-line no-console
    console.log("[TraceWardsDebug] inputs", {
      district,
      districtNorm,
      municipalityName,
      municipalityNameCanon,
      municipalityNameFuzzy,
      municipalityType,
    });
  }

  const matched = wards.features.filter(({ properties }) => {
    const wardDistrict = normalizeDistrict(properties.DISTRICT);
    const wardType = normalizeMunicipalityType(properties.Type_GN);

    const wardMunicipalityNameCanon = canonicalizeName(properties.GaPa_NaPa);
    const wardMunicipalityNameFuzzy = canonicalizeForFuzzyMatch(
      properties.GaPa_NaPa,
    );

    const isWardDistrictMatch = wardDistrict === districtNorm;

    // Municipality matching
    const doesMunicipalityMatch = (() => {
      // Prefer national-set matching semantics when possible.
      if (municipalityIsInNational || municipalityIsInNationalFuzzy) {
        return municipalityNameMatches({
          municipalityIsInNational,
          wardMunicipalityNameCanon,
          municipalityNameCanon,
          wardMunicipalityNameFuzzy,
          municipalityNameFuzzy,
        });
      }

      // Fallback: fuzzy + canonical (still tolerant)
      return municipalityNameMatches({
        municipalityIsInNational: false,
        wardMunicipalityNameCanon,
        municipalityNameCanon,
        wardMunicipalityNameFuzzy,
        municipalityNameFuzzy,
      });
    })();

    const doesTypeMatch = !municipalityType || wardType === municipalityType;

    if (debug && doesMunicipalityMatch) {
      // eslint-disable-next-line no-console
      console.log("[TraceWardsDebug] candidate", {
        wardDistrict,
        wardType,
        wardMunicipalityNameCanon,
        wardMunicipalityNameFuzzy,
        doesTypeMatch,
      });
    }

    return isWardDistrictMatch && doesMunicipalityMatch && doesTypeMatch;
  });

  if (debug) {
    // eslint-disable-next-line no-console
    console.log("[TraceWardsDebug] matched wards", matched.length);
  }

  return matched;
};

export const getProvinceAndDistrictByMunicipality = (municipalityName) => {
  // Prefer nationaldataset lookup if possible
  if (municipalitiesByDistrictAndProvinceFromNational) {
    for (const [province, districtsObj] of Object.entries(
      municipalitiesByDistrictAndProvinceFromNational,
    )) {
      for (const [district, muniArr] of Object.entries(districtsObj || {})) {
        if ((muniArr || []).includes(municipalityName)) {
          return { province, district };
        }
      }
    }
  }

  // Fallback to geojson derived index
  const record = municipalityRecords.find((m) => m.name === municipalityName);
  if (!record) return { province: null, district: null };

  // If we reached here, province isn't easily derivable without full index.
  return { province: null, district: record.district };
};
