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
