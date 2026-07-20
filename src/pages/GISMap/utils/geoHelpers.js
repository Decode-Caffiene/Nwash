import { NEPAL_CENTER, MUNI_CORRECTIONS } from "./mapConstants";

// ─── Text normalisation ───────────────────────────────────────────────────────

export const normalizeText = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

// Strip trailing "District" suffix and uppercase — matches how the API expects it.
export const cleanDistrict = (raw) =>
  (raw ?? "")
    .trim()
    .replace(/\s+district\s*$/i, "")
    .toUpperCase();

// Apply known manual corrections before any fuzzy resolution.
export const cleanMunicipality = (raw) => {
  const trimmed = (raw ?? "").trim();
  return MUNI_CORRECTIONS[trimmed.toLowerCase()] ?? trimmed;
};

// ─── String distance ─────────────────────────────────────────────────────────

// O(n) space Levenshtein edit distance.
export const editDistance = (a, b) => {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const next =
        a[i - 1] === b[j - 1]
          ? row[j - 1]
          : 1 + Math.min(prev, row[j], row[j - 1]);
      row[j - 1] = prev;
      prev = next;
    }
    row[b.length] = prev;
  }
  return row[b.length];
};

// ─── Geometry ─────────────────────────────────────────────────────────────────

// Arithmetic centroid of polygon ring coordinates.
// Returns [lat, lng] — falls back to NEPAL_CENTER if no points.
export const calculateCentroid = (features) => {
  const points = features.flatMap((feature) => {
    const { geometry } = feature;

    if (geometry?.type === "Polygon") return geometry.coordinates[0] || [];
    if (geometry?.type === "MultiPolygon")
      return geometry.coordinates.flat(2) || [];
    return [];
  });

  const total = points.length;

  if (!total) return NEPAL_CENTER;

  const sum = points.reduce(
    (acc, [lng, lat]) => ({ lng: acc.lng + lng, lat: acc.lat + lat }),
    { lng: 0, lat: 0 },
  );
  return [sum.lat / total, sum.lng / total];
};

//Ward list parsing

// Accepts an array, comma-separated string, or anything in between.
export const parseWardList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => String(entry).split(","))
      .map((entry) => Number.parseInt(entry.trim(), 10))
      .filter(Number.isFinite);
  }
  return String(value)
    .split(",")
    .map((entry) => Number.parseInt(entry.trim(), 10))
    .filter(Number.isFinite);
};

// ─── Project classification ───────────────────────────────────────────────────

// Single source of truth for project type across filters, popups, and any
// future consumers. Does not validate coordinate count — presence of the
// geometry type is sufficient to identify a form project.
export const getProjectType = (project) => {
  const geom = project?.geometry;
  // Legacy projects may carry a placeholder geometry entry with type "Polygon"
  // but no real coordinate rings. The coordinates check matches the identical
  // guard used in useMapData.js and useWardData.js, which are the ground truth
  // for what constitutes a real drawn polygon in this codebase.
  const isFormPolygon =
    geom?.type === "Polygon" && geom.coordinates?.[0]?.length >= 3;
  const isFormMultiPolygon =
    geom?.type === "MultiPolygon" && geom.coordinates?.length > 0;
  if (isFormPolygon || isFormMultiPolygon) return "FORM";
  const wards = parseWardList(project?.Location?.Wards_Covered);
  return wards.length > 0 ? "LEGACY_WITH_WARDS" : "LEGACY_WITHOUT_WARDS";
};
