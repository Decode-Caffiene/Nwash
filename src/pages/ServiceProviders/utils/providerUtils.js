// ── Formatters ─────────────────────────────────────────────────────────────

export const dv = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const s = String(v).trim();
  return s || null;
};

export const fmtScore = (v, decimals = 1) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n.toFixed(decimals);
};

export const fmtNum = (v) => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  if (isNaN(n)) return null;
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n));
};

export const fmtLabel = (label) =>
  label
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

export const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

export const fmtAny = (v) => {
  if (v === null || v === undefined || v === "") return "Not Available";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) {
    if (v.length === 0) return "Not Available";
    return v.map((i) => (isObj(i) ? JSON.stringify(i) : i)).join(", ");
  }
  return String(v);
};

export function toPercent(v, max = 100) {
  if (v === null || v === undefined) return 0;
  const n = Number(v);
  if (isNaN(n)) return 0;
  return Math.min(100, Math.max(0, (n / max) * 100));
}

// ── Status logic ────────────────────────────────────────────────────────────
//
// Decision tree (evaluated top-to-bottom, first match wins):
//
//   1. RED   ("noScore")  — OEI or SPI is absent / non-finite.
//   2. ORANGE ("noBP")   — OEI & SPI present, but SCP !== "Yes".
//   3. GREEN  ("complete")— SCP === "Yes" AND OEI AND SPI all present.

export function isValidScore(v) {
  return v != null && v !== "" && Number.isFinite(Number(v));
}

export function getCardStatus(provider) {
  const si = provider.Summary_Index ?? {};
  if (!isValidScore(si.OEI) || !isValidScore(si.SPI)) return "noScore";
  if (provider.Service_Coverage_Prerequisite !== "Yes") return "noBP";
  return "complete";
}

// ── Rankings ────────────────────────────────────────────────────────────────
//
// Builds a Map<projectId, { oeiRank, spiRank, oeiTotal, spiTotal }>.
// Standard competition ranking: ties share the same rank, next rank skips.
// Projects missing a score receive rank: null for that field.

export function computeRankings(providers) {
  const result = new Map();
  const idOf = (p) => p._id ?? p.WSUC_ID;

  for (const p of providers) {
    result.set(idOf(p), { oeiRank: null, spiRank: null, oeiTotal: 0, spiTotal: 0 });
  }

  const assignRanks = (scoreKey, rankKey, totalKey) => {
    const valid = providers
      .map((p) => ({ id: idOf(p), score: Number(p.Summary_Index?.[scoreKey]) }))
      .filter(({ score }) => Number.isFinite(score));

    const total = valid.length;
    valid.sort((a, b) => b.score - a.score);

    let currentRank = 0;
    for (let i = 0; i < valid.length; i++) {
      if (i === 0 || valid[i].score !== valid[i - 1].score) currentRank = i + 1;
      const entry = result.get(valid[i].id);
      entry[rankKey] = currentRank;
      entry[totalKey] = total;
    }
  };

  assignRanks("OEI", "oeiRank", "oeiTotal");
  assignRanks("SPI", "spiRank", "spiTotal");

  return result;
}
