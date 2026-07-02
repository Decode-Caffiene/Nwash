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
    // Split districts: both _E and _W map to the parent district name
    rukum_e: "Rukum",
    rukum_w: "Rukum",
    nawalparasi_e: "Nawalparasi",
    nawalparasi_w: "Nawalparasi",
    nawalpur: "Nawalparasi",
    manag: "Manang",
  };

  return MAP[canonical] || toTitleCase(name);
};

// Municipality name aliases: national-dataset names that differ from GeoJSON names.
// Key = national-dataset municipality name, Value = the GeoJSON name to match against.
const MUNICIPALITY_NAME_ALIASES = {
  bethanchok: "Bethanchowk",
  "mandan deupur": "Mandandeupur",
  bhojpur: "Bhumlu",
  ichchhakamana: "Ichchhyakamana",
  ichchhhyakamana: "Ichchhyakamana",
  ichchhyakamana: "Ichchhyakamana",
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
  wardMunicipalityNameCanon,
  municipalityNameCanon,
  wardMunicipalityNameFuzzy,
  municipalityNameFuzzy,
}) => {
  if (wardMunicipalityNameCanon === municipalityNameCanon) return true;

  if (wardMunicipalityNameFuzzy && municipalityNameFuzzy) {
    if (wardMunicipalityNameFuzzy === municipalityNameFuzzy) return true;
  }

  if (wardMunicipalityNameCanon && municipalityNameCanon) {
    if (
      wardMunicipalityNameCanon.startsWith(municipalityNameCanon) ||
      municipalityNameCanon.startsWith(wardMunicipalityNameCanon)
    ) {
      return true;
    }
  }

  const geoNoSpace = wardMunicipalityNameCanon
    ? wardMunicipalityNameCanon.replace(/\s+/g, "")
    : "";
  const searchNoSpace = municipalityNameCanon
    ? municipalityNameCanon.replace(/\s+/g, "")
    : "";
  if (geoNoSpace && searchNoSpace && geoNoSpace === searchNoSpace) return true;

  const checkLevenshtein = (a, b) => {
    if (!a || !b || a.length < 4 || b.length < 4) return false;
    const dist = levenshteinDistance(a, b);
    const maxLen = Math.max(a.length, b.length);
    return dist <= 1 || (dist <= 2 && dist / maxLen <= 0.25);
  };

  if (checkLevenshtein(wardMunicipalityNameCanon, municipalityNameCanon))
    return true;
  if (
    wardMunicipalityNameFuzzy &&
    municipalityNameFuzzy &&
    checkLevenshtein(wardMunicipalityNameFuzzy, municipalityNameFuzzy)
  )
    return true;

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

  // Also include aliased GeoJSON names so national-dataset names with
  // spelling differences (e.g. Bethanchok → Bethanchowk) remain available.
  const allowedAliases = new Set(
    [...allowedByType].flatMap((geoName) => {
      const geoNameCanon = canonicalizeName(geoName);
      return Object.entries(MUNICIPALITY_NAME_ALIASES)
        .filter(
          ([, aliasTarget]) => canonicalizeName(aliasTarget) === geoNameCanon,
        )
        .map(([nationalName]) => toTitleCase(nationalName));
    }),
  );

  const combined = new Set([...allowedByType, ...allowedAliases]);
  return uniqueSorted(fromNational.filter((name) => combined.has(name)));
};

export const getWardFeatures = (
  district,
  municipalityName,
  municipalityType,
) => {
  const districtNorm = normalizeDistrict(district);
  const municipalityNameCanon = canonicalizeName(municipalityName);
  const municipalityNameFuzzy = canonicalizeForFuzzyMatch(municipalityName);

  // Resolve national-dataset municipality name aliases to GeoJSON names
  const aliasedMunicipalityName =
    MUNICIPALITY_NAME_ALIASES[municipalityNameCanon] || municipalityName;
  const aliasedMunicipalityNameCanon = canonicalizeName(
    aliasedMunicipalityName,
  );
  const aliasedMunicipalityNameFuzzy = canonicalizeForFuzzyMatch(
    aliasedMunicipalityName,
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
      const directMatch = municipalityNameMatches({
        wardMunicipalityNameCanon,
        municipalityNameCanon,
        wardMunicipalityNameFuzzy,
        municipalityNameFuzzy,
      });

      if (directMatch) return true;

      if (aliasedMunicipalityName !== municipalityName) {
        return municipalityNameMatches({
          wardMunicipalityNameCanon,
          municipalityNameCanon: aliasedMunicipalityNameCanon,
          wardMunicipalityNameFuzzy,
          municipalityNameFuzzy: aliasedMunicipalityNameFuzzy,
        });
      }

      return false;
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
