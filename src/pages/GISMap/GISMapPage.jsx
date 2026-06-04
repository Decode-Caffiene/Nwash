import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { filterWards, getMapData, getMuniGeojson } from "../../api/mapService";
import nepalBoundary from "../../data/boundary.json";
import nepalProvinces from "../../data/nepal_provinces.json";

const MUNI_DATA_URL = new URL(
  "../../data/nepal_municipalities.json",
  import.meta.url,
).href;
const NEPAL_CENTER = [28.3949, 84.124];

const PROVINCE_NAME_TO_NO = {
  koshi: 1,
  madhesh: 2,
  bagmati: 3,
  gandaki: 4,
  lumbini: 5,
  karnali: 6,
  sudurpaschim: 7,
  sudurpashchim: 7,
};

// Projects where the municipality name is so wrong that fuzzy matching would be unsafe.
const MUNI_CORRECTIONS = {
  "rupakot majuwa rupkot": "Rupakot Majhuwagadhi",
};

const normalizeText = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

const cleanDistrict = (raw) =>
  (raw ?? "")
    .trim()
    .replace(/\s+district\s*$/i, "")
    .toUpperCase();

const cleanMunicipality = (raw) => {
  const trimmed = (raw ?? "").trim();
  return MUNI_CORRECTIONS[trimmed.toLowerCase()] ?? trimmed;
};

// Levenshtein edit distance, O(n) space.
const editDistance = (a, b) => {
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

const calculateCentroid = (features) => {
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

// Build index from nepal_municipalities.json:
//   normalizedDistrict → [{canonical, normalized, lat, lng}]
// The centroid comes from the municipality polygon geometry, so fly-to always
// lands on the correct location regardless of how many wards are covered.
const buildMuniIndex = (muniGeojson) => {
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

// Resolve a (possibly typo'd) municipality name to the canonical form used by
// the API, and also return the municipality centroid for map fly-to.
// Strategy: exact normalized → prefix → Levenshtein (threshold scales with length).
// Returns { canonical, lat, lng }.
const resolveMuni = (rawMuni, rawDistrict, muniIndex) => {
  const cleaned = cleanMunicipality(rawMuni);
  const distKey = normalizeText(rawDistrict);
  const candidates = muniIndex.get(distKey);
  const fallback = {
    canonical: cleaned,
    lat: NEPAL_CENTER[0],
    lng: NEPAL_CENTER[1],
  };

  if (!candidates?.length) return fallback;

  const normalized = normalizeText(cleaned);

  // 1. Exact normalized match (handles spaces, accents, case)
  const exact = candidates.find((c) => c.normalized === normalized);
  if (exact) return exact;

  // 2. Prefix match — "Pokhara" → "Pokhara Lekhnath", "Benighat" → "Benighat Rorang"
  const prefixHits = candidates.filter(
    (c) =>
      c.normalized.startsWith(normalized) ||
      normalized.startsWith(c.normalized),
  );
  if (prefixHits.length === 1) return prefixHits[0];

  // 3. Levenshtein — threshold scales with name length to safely catch transliteration
  //    differences: Kusma→Kushma (d=1), Kageswori Manohara→Kageshwori Manahora (d=3).
  let best = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = editDistance(normalized, c.normalized);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  const threshold = Math.min(3, Math.ceil(normalized.length / 4));
  if (bestDist <= threshold) return best;

  return fallback;
};

const parseWardList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => String(entry).split(","))
      .map((entry) => Number.parseInt(entry.trim(), 10))
      .filter((entry) => Number.isFinite(entry));
  }
  return String(value)
    .split(",")
    .map((entry) => Number.parseInt(entry.trim(), 10))
    .filter((entry) => Number.isFinite(entry));
};

const defaultMarkerIcon = L.divIcon({
  html: '<span style="display:block;width:14px;height:14px;border-radius:9999px;border:2px solid #fff;background:#16A34A;box-shadow:0 0 0 6px rgba(22,163,74,0.18);"></span>',
  className: "",
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const selectedMarkerIcon = L.divIcon({
  html: '<span style="display:block;width:18px;height:18px;border-radius:9999px;border:2px solid #fff;background:#2563EB;box-shadow:0 0 0 8px rgba(37,99,235,0.22);"></span>',
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function MapController({ center }) {
  const map = useMap();
  const prevRef = useRef(null);

  useEffect(() => {
    if (!center) return;
    const [lat, lng] = center;
    if (prevRef.current?.[0] === lat && prevRef.current?.[1] === lng) return;
    prevRef.current = center;
    map.flyTo(center, 11, { duration: 1.2 });
  }, [center, map]);

  return null;
}

function ProjectDropdown({ projects, selectedProject, onSelect }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="absolute top-3 left-3 z-[1000]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-text-primary shadow-md border border-surface-border hover:bg-surface transition-colors"
      >
        <svg
          className="w-4 h-4 text-brand-primary shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <span>{projects.length} Projects</span>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-1 w-72 max-h-80 overflow-y-auto rounded-xl bg-white shadow-xl border border-surface-border">
          {projects.map((project) => {
            const isSelected = selectedProject?._id === project._id;
            return (
              <button
                key={project._id}
                type="button"
                onClick={() => {
                  onSelect(project);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm transition border-b border-surface-border/50 last:border-0 ${
                  isSelected
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "hover:bg-surface text-text-primary"
                }`}
              >
                <p
                  className={`font-medium ${isSelected ? "text-brand-primary" : "text-text-primary"}`}
                >
                  {project.WSUC_Name || `WSUC ${project.WSUC_ID}`}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {[
                    project.Location?.District_Name,
                    project.Location?.Municipality_Name,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GISMapPage() {
  const [projects, setProjects] = useState([]);
  const [muniGeojson, setMuniGeojson] = useState({ features: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [wardFeatures, setWardFeatures] = useState([]);
  const [wardLoading, setWardLoading] = useState(false);
  const [wardError, setWardError] = useState("");

  console.log("projectssss", projects);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [projects, muniPayload] = await Promise.all([
          getMapData(),
          getMuniGeojson(),
        ]);

        setProjects(projects);
        setMuniGeojson(muniPayload);

        if (projects[0]) {
          setSelectedProject(projects[0]);
          setSelectedProjectId(projects[0]._id);
        }
      } catch (err) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Index built from nepal_municipalities.json:
  //   normalizedDistrict → [{canonical, normalized, lat, lng}]
  // Used for both canonical name resolution (API call) and centroid (fly-to).
  const muniIndex = useMemo(() => buildMuniIndex(muniGeojson), [muniGeojson]);

  // Per-project resolved location: canonical municipality name + centroid from
  // the municipality polygon (not ward centroids, so always accurate).
  const projectLocations = useMemo(() => {
    return projects.reduce((acc, project) => {
      const rawMuni = project.Location?.Municipality_Name ?? "";
      const rawDist = cleanDistrict(project.Location?.District_Name);
      const resolved = resolveMuni(rawMuni, rawDist, muniIndex);
      acc[project._id] = {
        lat: resolved.lat,
        lng: resolved.lng,
        canonicalMunicipality: resolved.canonical,
        district: rawDist,
      };
      return acc;
    }, {});
  }, [projects, muniIndex]);

  const selectedCentroid = useMemo(() => {
    if (!selectedProject) return NEPAL_CENTER;
    const loc = projectLocations[selectedProject._id];
    return [loc?.lat ?? NEPAL_CENTER[0], loc?.lng ?? NEPAL_CENTER[1]];
  }, [projectLocations, selectedProject]);

  const fetchWardData = useCallback(
    async (project) => {
      if (!project) {
        setWardFeatures([]);
        return;
      }

      const loc = projectLocations[project._id];
      // If projectLocations isn't built yet (muniIndex still empty), fall back
      // to cleaning the raw name and trying anyway.
      const district =
        loc?.district ?? cleanDistrict(project.Location?.District_Name);
      const municipality =
        loc?.canonicalMunicipality ??
        resolveMuni(
          project.Location?.Municipality_Name ?? "",
          district,
          muniIndex,
        ).canonical;

      if (!municipality || !district) {
        setWardFeatures([]);
        return;
      }

      const wards = parseWardList(project.Location?.Wards_Covered);
      const provinceName = (project.Location?.Province_Name ?? "")
        .trim()
        .toLowerCase();
      const province = PROVINCE_NAME_TO_NO[provinceName] ?? null;

      setWardLoading(true);
      setWardError("");
      setWardFeatures([]);

      try {
        const body = {
          district,
          municipality,
          ...(wards.length && { wards }),
          ...(province != null && { province }),
        };

        const data = await filterWards(body);
        setWardFeatures(data?.features || []);
      } catch (err) {
        setWardError(err.message);
        setWardFeatures([]);
      } finally {
        setWardLoading(false);
      }
    },
    [muniIndex, projectLocations],
  );

  useEffect(() => {
    fetchWardData(selectedProject);
  }, [selectedProject, fetchWardData]);

  const handleSelectProject = useCallback((project) => {
    setSelectedProject(project);
    setSelectedProjectId(project._id);
  }, []);

  const coveredWards = useMemo(
    () => parseWardList(selectedProject?.Location?.Wards_Covered),
    [selectedProject],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
          GIS Intelligence Map
        </p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">
          Interactive operator coverage map
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-text-secondary">
          Live operator data loaded from the dashboard API. Click a marker or
          use the project menu to select a project and see its ward coverage.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="stat-card min-h-[520px] overflow-hidden p-0">
          {loading ? (
            <div className="flex h-[520px] items-center justify-center text-sm text-text-secondary">
              Loading live operator data…
            </div>
          ) : error ? (
            <div className="flex h-[520px] items-center justify-center text-sm text-red-500">
              {error}
            </div>
          ) : (
            <div className="relative h-[520px]">
              <MapContainer
                center={NEPAL_CENTER}
                zoom={7}
                scrollWheelZoom
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController center={selectedCentroid} />

                <GeoJSON
                  data={nepalBoundary}
                  style={{
                    color: "#0f172a",
                    weight: 2,
                    fillColor: "#dbeafe",
                    fillOpacity: 0.08,
                  }}
                />

                <GeoJSON
                  data={nepalProvinces}
                  style={{
                    color: "#64748b",
                    weight: 1.5,
                    fillOpacity: 0,
                  }}
                />

                {projects.map((project) => {
                  const { lat, lng } = projectLocations[project._id] || {};
                  const isSelected = selectedProject?._id === project._id;

                  return (
                    <Marker
                      key={project._id}
                      position={[
                        lat ?? NEPAL_CENTER[0],
                        lng ?? NEPAL_CENTER[1],
                      ]}
                      icon={isSelected ? selectedMarkerIcon : defaultMarkerIcon}
                      zIndexOffset={isSelected ? 1000 : 0}
                      eventHandlers={{
                        click: () => handleSelectProject(project),
                      }}
                    >
                      <Popup>
                        <strong>{project.WSUC_Name || project.WSUC_ID}</strong>
                        <br />
                        {project.Location?.Municipality_Name ||
                          "Unknown municipality"}
                        <br />
                        {project.Location?.District_Name || "Unknown district"}
                        <br />
                        Score: {project.Summary_Index?.OM_Score ?? "—"}
                      </Popup>
                    </Marker>
                  );
                })}

                {wardFeatures.length > 0 && (
                  <GeoJSON
                    key={`${selectedProject?._id}-${wardFeatures.length}`}
                    data={{ type: "FeatureCollection", features: wardFeatures }}
                    style={() => ({
                      color: "#2563eb",
                      weight: 2,
                      fillColor: "#60a5fa",
                      fillOpacity: 0.35,
                    })}
                  />
                )}
              </MapContainer>

              <ProjectDropdown
                projects={projects}
                selectedProject={selectedProject}
                onSelect={handleSelectProject}
              />

              {wardLoading && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 rounded-full bg-white/95 px-4 py-1.5 text-xs text-text-secondary shadow-md border border-surface-border">
                  <span className="inline-block w-3 h-3 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
                  Loading ward boundaries…
                </div>
              )}

              {wardError && !wardLoading && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] rounded-full bg-red-50 px-4 py-1.5 text-xs text-red-600 shadow-md border border-red-200">
                  {wardError}
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="stat-card">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-primary">
              Live feed
            </p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary">
              Operator overview
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {projects.length} operator records loaded. Select a project to
              inspect its municipality ward coverage.
            </p>
            <label className="mt-4 block text-sm text-text-secondary">
              Choose operator
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  const next = projects.find((p) => p._id === e.target.value);
                  if (next) handleSelectProject(next);
                }}
                className="mt-2 w-full rounded-xl border border-surface-border bg-white px-3 py-2 text-sm text-text-primary shadow-sm outline-none ring-0 transition focus:border-brand-primary"
              >
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.WSUC_Name || `WSUC ${project.WSUC_ID}`}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedProject && (
            <div className="stat-card space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-brand-primary">
                Selected project
              </p>
              <h3 className="text-lg font-semibold text-text-primary">
                {selectedProject.WSUC_Name || `WSUC ${selectedProject.WSUC_ID}`}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-text-secondary">
                    Municipality
                  </p>
                  <p className="mt-1 text-sm font-medium text-text-primary">
                    {selectedProject.Location?.Municipality_Name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-text-secondary">
                    District
                  </p>
                  <p className="mt-1 text-sm font-medium text-text-primary">
                    {selectedProject.Location?.District_Name || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-text-secondary">
                    OM Score
                  </p>
                  <p className="mt-1 text-sm font-medium text-text-primary">
                    {selectedProject.Summary_Index?.OM_Score ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-text-secondary">
                    Wards covered
                  </p>
                  <p className="mt-1 text-sm font-medium text-text-primary">
                    {coveredWards.length ? `${coveredWards.length} wards` : "—"}
                  </p>
                </div>
              </div>

              {coveredWards.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-text-secondary mb-2">
                    Ward numbers
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {coveredWards.map((ward) => (
                      <span
                        key={ward}
                        className="rounded-full bg-brand-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-primary"
                      >
                        {ward}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {wardLoading && (
                <p className="text-xs text-text-secondary flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
                  Fetching ward boundaries…
                </p>
              )}

              {!wardLoading && wardFeatures.length > 0 && (
                <p className="text-xs text-emerald-600 font-medium">
                  ✓ {wardFeatures.length} ward
                  {wardFeatures.length !== 1 ? "s" : ""} highlighted on map
                </p>
              )}

              {wardError && !wardLoading && (
                <p className="text-xs text-red-500">{wardError}</p>
              )}

              <p className="text-sm text-text-secondary">
                Service coverage prerequisite:{" "}
                {selectedProject.Service_Coverage_Prerequisite ??
                  "Not specified"}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {projects.map((project) => {
              const municipality =
                project.Location?.Municipality_Name || "Unknown municipality";
              const district =
                project.Location?.District_Name || "Unknown district";
              const covered = parseWardList(project.Location?.Wards_Covered);
              const isSelected = selectedProject?._id === project._id;

              return (
                <button
                  key={project._id}
                  type="button"
                  onClick={() => handleSelectProject(project)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? "border-brand-primary bg-brand-primary/10 shadow-sm"
                      : "border-surface-border bg-white hover:border-brand-primary/50 hover:bg-surface"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {project.WSUC_Name || `WSUC ${project.WSUC_ID}`}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-text-secondary">
                        {district}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-brand-primary/10 px-2.5 py-1 text-[11px] font-semibold text-brand-primary">
                      {covered.length ? `${covered.length} wards` : "Coverage"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">
                    {municipality}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default GISMapPage;
