import { NEPAL_CENTER } from "./mapConstants";
import {
  normalizeText,
  cleanMunicipality,
  calculateCentroid,
  editDistance,
} from "./geoHelpers";

// ─── Spatial index ────────────────────────────────────────────────────────────
//
// Builds a Map<normalised_district, Array<{canonical, normalized, lat, lng}>>
// from the municipality GeoJSON (nepal_municipalities.json).
//
// Centroid is computed per-feature so fly-to always lands on the correct
// municipality polygon rather than a ward centroid average.
export const buildMuniIndex = (muniGeojson) => {
  const index = new Map();

  (muniGeojson.features || []).forEach((feature) => {
    const props = feature.properties || {};
    const district = normalizeText(props.DISTRICT);
    const canonical = (props.NAME || "").trim();
    const normalized = normalizeText(canonical);

    if (!district || !canonical) return;

    const [lat, lng] = calculateCentroid([feature]);

    if (!index.has(district)) index.set(district, []);
    const arr = index.get(district);

    if (!arr.some((e) => e.canonical === canonical)) {
      arr.push({ canonical, normalized, lat, lng });
    }
  });

  return index;
};

// ─── Fuzzy resolver ───────────────────────────────────────────────────────────
//
// Resolves a (possibly typo-d) municipality name to the canonical form used in
// the spatial index and returns the pre-computed centroid for map fly-to.
//
// Resolution strategy (in order):
//   1. Exact normalised match   — handles spaces, accents, case
//   2. Prefix match             — "Pokhara" → "Pokhara Lekhnath"
//   3. Levenshtein              — threshold scales with name length
//
// Returns { canonical, lat, lng }.
export const resolveMuni = (rawMuni, rawDistrict, muniIndex) => {
  const cleaned = cleanMunicipality(rawMuni);
  const distKey = normalizeText(rawDistrict);
  const candidates = muniIndex.get(distKey);
  const fallback = { canonical: cleaned, lat: NEPAL_CENTER[0], lng: NEPAL_CENTER[1] };

  if (!candidates?.length) return fallback;

  const normalized = normalizeText(cleaned);

  const exact = candidates.find((c) => c.normalized === normalized);
  if (exact) return exact;

  const prefixHits = candidates.filter(
    (c) =>
      c.normalized.startsWith(normalized) ||
      normalized.startsWith(c.normalized),
  );
  if (prefixHits.length === 1) return prefixHits[0];

  let best = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = editDistance(normalized, c.normalized);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }

  // Threshold scales with name length: Kusma→Kushma (d=1), Kageswori→Kageshwori (d=3)
  const threshold = Math.min(3, Math.ceil(normalized.length / 4));
  if (bestDist <= threshold) return best;

  return fallback;
};