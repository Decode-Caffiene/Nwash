export function getStatus(sub) {
  return ((sub.Status ?? sub.status) || "pending").toLowerCase();
}

export function getLocationBreadcrumb(location) {
  return [location.Municipality_Name, location.District_Name, location.Province_Name]
    .filter(Boolean)
    .join(" · ");
}

// Builds the page number sequence: always includes first, last, current±1,
// and inserts "…" ellipsis tokens where numbers are skipped.
export function buildPageNumbers(safePage, totalPages) {
  const nums = new Set(
    [1, totalPages, safePage, safePage - 1, safePage + 1].filter(
      (n) => n >= 1 && n <= totalPages,
    ),
  );
  const sorted = [...nums].sort((a, b) => a - b);
  const result = [];
  let prev = null;
  for (const n of sorted) {
    if (prev !== null && n - prev > 1) result.push("…");
    result.push(n);
    prev = n;
  }
  return result;
}
