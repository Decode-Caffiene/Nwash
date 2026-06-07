import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { filterWards, getMapData, getMuniGeojson } from "../../api/mapService";
import nepalBoundary from "../../data/boundary.json";
import nepalProvinces from "../../data/nepal_provinces.json";

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

const resolveMuni = (rawMuni, rawDistrict, muniIndex) => {
  const cleaned = cleanMunicipality(rawMuni);
  const distKey = normalizeText(rawDistrict);
  const candidates = muniIndex.get(distKey);
  const fallback = { canonical: cleaned, lat: NEPAL_CENTER[0], lng: NEPAL_CENTER[1] };

  if (!candidates?.length) return fallback;
  const normalized = normalizeText(cleaned);
  const exact = candidates.find((c) => c.normalized === normalized);
  if (exact) return exact;

  const prefixHits = candidates.filter(
    (c) => c.normalized.startsWith(normalized) || normalized.startsWith(c.normalized),
  );
  if (prefixHits.length === 1) return prefixHits[0];

  let best = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = editDistance(normalized, c.normalized);
    if (d < bestDist) { bestDist = d; best = c; }
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
  html: `<span style="display:block;width:12px;height:12px;border-radius:9999px;border:2.5px solid #fff;background:#10b981;box-shadow:0 2px 8px rgba(16,185,129,0.55),0 0 0 4px rgba(16,185,129,0.2);"></span>`,
  className: "",
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

const selectedMarkerIcon = L.divIcon({
  html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;border:2.5px solid #fff;background:#3b82f6;box-shadow:0 2px 14px rgba(59,130,246,0.7),0 0 0 7px rgba(59,130,246,0.25);"></span>`,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function ProjectFlyController({ center }) {
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

function MuniBoundsController({ features }) {
  const map = useMap();
  const keyRef = useRef(null);
  useEffect(() => {
    if (!features?.length) return;
    const key = features.map((f) => f.properties?.NAME).join(",");
    if (keyRef.current === key) return;
    keyRef.current = key;
    const layer = L.geoJSON({ type: "FeatureCollection", features });
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
    }
  }, [features, map]);
  return null;
}

const selectStyle = {
  background: "rgba(15,23,42,0.82)",
  color: "#f1f5f9",
  borderColor: "rgba(255,255,255,0.18)",
  backdropFilter: "blur(12px)",
};

function FilterBar({ projects, muniGeojson, onZoom }) {
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [municipality, setMunicipality] = useState("");

  const provinces = useMemo(() => {
    const seen = new Set();
    return projects
      .map((p) => p.Location?.Province_Name?.trim())
      .filter((n) => n && !seen.has(n) && seen.add(n))
      .sort();
  }, [projects]);

  const districts = useMemo(() => {
    const pool = province
      ? projects.filter((p) => p.Location?.Province_Name?.trim() === province)
      : projects;
    const seen = new Set();
    return pool
      .map((p) => cleanDistrict(p.Location?.District_Name))
      .filter((n) => n && !seen.has(n) && seen.add(n))
      .sort();
  }, [projects, province]);

  const municipalities = useMemo(() => {
    if (!district) return [];
    const distKey = cleanDistrict(district);
    const seen = new Set();
    return (muniGeojson.features || [])
      .filter((f) => cleanDistrict(f.properties?.DISTRICT) === distKey)
      .map((f) => f.properties?.NAME)
      .filter((n) => n && !seen.has(n) && seen.add(n))
      .sort();
  }, [muniGeojson, district]);

  const handleProvinceChange = (e) => {
    setProvince(e.target.value);
    setDistrict("");
    setMunicipality("");
    onZoom([]);
  };

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
    setMunicipality("");
    onZoom([]);
  };

  const handleMuniChange = (e) => {
    setMunicipality(e.target.value);
    onZoom([]);
  };

  const handleZoom = () => {
    if (!municipality || !district) return;
    const distKey = cleanDistrict(district);
    const features = (muniGeojson.features || []).filter(
      (f) =>
        cleanDistrict(f.properties?.DISTRICT) === distKey &&
        f.properties?.NAME === municipality,
    );
    onZoom(features);
  };

  const baseCls =
    "h-9 rounded-lg border text-sm outline-none transition cursor-pointer px-2.5 min-w-[148px]";

  return (
    <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 flex-wrap">
      {/* Label chip */}
      <div className="flex items-center gap-1.5 rounded-lg px-3 py-2 shadow-lg border border-white/10"
        style={{ background: "rgba(15,23,42,0.82)", backdropFilter: "blur(12px)" }}>
        <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        <span className="text-xs font-bold text-white/70 uppercase tracking-widest">Filter</span>
      </div>

      {/* Province */}
      <select
        value={province}
        onChange={handleProvinceChange}
        className={baseCls}
        style={selectStyle}
      >
        <option value="">All Provinces</option>
        {provinces.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* District */}
      <select
        value={district}
        onChange={handleDistrictChange}
        disabled={!province}
        className={baseCls}
        style={{ ...selectStyle, opacity: !province ? 0.45 : 1, cursor: !province ? "not-allowed" : "pointer" }}
      >
        <option value="">All Districts</option>
        {districts.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Municipality */}
      <select
        value={municipality}
        onChange={handleMuniChange}
        disabled={!district}
        className={baseCls}
        style={{ ...selectStyle, opacity: !district ? 0.45 : 1, cursor: !district ? "not-allowed" : "pointer" }}
      >
        <option value="">All Municipalities</option>
        {municipalities.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      {/* Zoom button */}
      <button
        type="button"
        onClick={handleZoom}
        disabled={!municipality}
        className="flex items-center gap-1.5 h-9 rounded-lg px-4 text-sm font-bold shadow-lg border border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: municipality ? "linear-gradient(135deg,#10b981,#059669)" : "rgba(15,23,42,0.6)",
          color: "#fff",
          boxShadow: municipality ? "0 4px 16px rgba(16,185,129,0.35)" : "none",
        }}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
        Zoom
      </button>
    </div>
  );
}

function ProjectsPanel({ projects, selectedProject, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 rounded-lg px-3 text-sm font-bold shadow-lg border border-white/10 transition-colors"
        style={{ background: "rgba(15,23,42,0.82)", color: "#f1f5f9", backdropFilter: "blur(12px)" }}
      >
        <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span>{projects.length} Projects</span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform text-white/50 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1.5 w-76 max-h-[360px] overflow-y-auto rounded-xl shadow-2xl border border-white/10"
          style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(16px)", width: "300px" }}
        >
          <div className="sticky top-0 px-4 py-2.5 border-b border-white/10" style={{ background: "rgba(15,23,42,0.95)" }}>
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Select Project</p>
          </div>
          {projects.map((project) => {
            const isSelected = selectedProject?._id === project._id;
            return (
              <button
                key={project._id}
                type="button"
                onClick={() => { onSelect(project); setOpen(false); }}
                className="w-full text-left px-4 py-3 text-sm transition border-b border-white/5 last:border-0 hover:bg-white/5"
                style={{ background: isSelected ? "rgba(16,185,129,0.15)" : undefined }}
              >
                <p className="font-semibold truncate" style={{ color: isSelected ? "#10b981" : "#f1f5f9" }}>
                  {project.WSUC_Name || `WSUC ${project.WSUC_ID}`}
                </p>
                <p className="text-xs mt-0.5 text-white/40 truncate">
                  {[project.Location?.District_Name, project.Location?.Municipality_Name]
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
  const [wardFeatures, setWardFeatures] = useState([]);
  const [wardLoading, setWardLoading] = useState(false);
  const [wardError, setWardError] = useState("");
  const [showProjects, setShowProjects] = useState(true);
  const [muniZoomFeatures, setMuniZoomFeatures] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectData, muniPayload] = await Promise.all([
          getMapData(),
          getMuniGeojson(),
        ]);
        setProjects(projectData);
        setMuniGeojson(muniPayload);
      } catch (err) {
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const muniIndex = useMemo(() => buildMuniIndex(muniGeojson), [muniGeojson]);

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
    if (!selectedProject) return null;
    const loc = projectLocations[selectedProject._id];
    return [loc?.lat ?? NEPAL_CENTER[0], loc?.lng ?? NEPAL_CENTER[1]];
  }, [projectLocations, selectedProject]);

  const fetchWardData = useCallback(
    async (project) => {
      if (!project) { setWardFeatures([]); return; }
      const loc = projectLocations[project._id];
      const district = loc?.district ?? cleanDistrict(project.Location?.District_Name);
      const municipality =
        loc?.canonicalMunicipality ??
        resolveMuni(project.Location?.Municipality_Name ?? "", district, muniIndex).canonical;

      if (!municipality || !district) { setWardFeatures([]); return; }

      const wards = parseWardList(project.Location?.Wards_Covered);
      const provinceName = (project.Location?.Province_Name ?? "").trim().toLowerCase();
      const province = PROVINCE_NAME_TO_NO[provinceName] ?? null;

      setWardLoading(true);
      setWardError("");
      setWardFeatures([]);
      try {
        const data = await filterWards({
          district,
          municipality,
          ...(wards.length && { wards }),
          ...(province != null && { province }),
        });
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
    setMuniZoomFeatures([]);
  }, []);

  const handleDismissProject = useCallback(() => {
    setSelectedProject(null);
    setWardFeatures([]);
  }, []);

  const coveredWards = useMemo(
    () => parseWardList(selectedProject?.Location?.Wards_Covered),
    [selectedProject],
  );

  return (
    <div
      className="relative -mx-6 -my-6 overflow-hidden"
      style={{ height: "calc(100vh - 73px)" }}
    >
      {loading ? (
        <div className="flex h-full flex-col items-center justify-center gap-4"
          style={{ background: "linear-gradient(160deg,#0f172a 0%,#1e293b 100%)" }}>
          <span className="inline-block w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          <span className="text-sm text-slate-400">Loading map data…</span>
        </div>
      ) : error ? (
        <div className="flex h-full items-center justify-center text-red-400 text-sm"
          style={{ background: "linear-gradient(160deg,#0f172a 0%,#1e293b 100%)" }}>
          {error}
        </div>
      ) : (
        <>
          <MapContainer
            center={NEPAL_CENTER}
            zoom={7}
            scrollWheelZoom
            zoomControl={false}
            className="h-full w-full"
          >
            {/* Tile layer — CartoDB Voyager for a clean modern look */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            <ZoomControl position="bottomright" />

            {selectedCentroid && <ProjectFlyController center={selectedCentroid} />}
            <MuniBoundsController features={muniZoomFeatures} />

            {/* National boundary */}
            <GeoJSON
              data={nepalBoundary}
              style={{
                color: "#1e3a5f",
                weight: 2.5,
                fillColor: "#dbeafe",
                fillOpacity: 0.04,
              }}
            />

            {/* Province borders — dashed */}
            <GeoJSON
              data={nepalProvinces}
              style={{
                color: "#64748b",
                weight: 1.5,
                dashArray: "6 5",
                fillOpacity: 0,
              }}
            />

            {/* Ward highlights for selected project */}
            {wardFeatures.length > 0 && (
              <GeoJSON
                key={`wards-${selectedProject?._id}-${wardFeatures.length}`}
                data={{ type: "FeatureCollection", features: wardFeatures }}
                style={() => ({
                  color: "#2563eb",
                  weight: 2,
                  fillColor: "#3b82f6",
                  fillOpacity: 0.28,
                })}
              />
            )}

            {/* Municipality zoom highlight */}
            {muniZoomFeatures.length > 0 && (
              <GeoJSON
                key={`muni-${muniZoomFeatures[0]?.properties?.NAME}`}
                data={{ type: "FeatureCollection", features: muniZoomFeatures }}
                style={() => ({
                  color: "#f59e0b",
                  weight: 2.5,
                  fillColor: "#fcd34d",
                  fillOpacity: 0.22,
                })}
              />
            )}

            {/* Project markers */}
            {showProjects &&
              projects.map((project) => {
                const { lat, lng } = projectLocations[project._id] || {};
                const isSelected = selectedProject?._id === project._id;
                return (
                  <Marker
                    key={project._id}
                    position={[lat ?? NEPAL_CENTER[0], lng ?? NEPAL_CENTER[1]]}
                    icon={isSelected ? selectedMarkerIcon : defaultMarkerIcon}
                    zIndexOffset={isSelected ? 1000 : 0}
                    eventHandlers={{ click: () => handleSelectProject(project) }}
                  >
                    <Popup>
                      <div style={{ minWidth: 160 }}>
                        <p style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                          {project.WSUC_Name || project.WSUC_ID}
                        </p>
                        <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0" }}>
                          {project.Location?.Municipality_Name || "Unknown municipality"}
                        </p>
                        <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0" }}>
                          {project.Location?.District_Name || "Unknown district"}
                        </p>
                        <p style={{ fontSize: 12, color: "#10b981", fontWeight: 600, marginTop: 6 }}>
                          OM Score: {project.Summary_Index?.OM_Score ?? "—"}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>

          {/* ── Top-left: Cascading geographic filter ── */}
          <FilterBar
            projects={projects}
            muniGeojson={muniGeojson}
            onZoom={setMuniZoomFeatures}
          />

          {/* ── Top-right: controls ── */}
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
            <ProjectsPanel
              projects={projects}
              selectedProject={selectedProject}
              onSelect={handleSelectProject}
            />

            {/* Show/hide projects toggle */}
            <button
              type="button"
              onClick={() => setShowProjects((v) => !v)}
              title={showProjects ? "Hide project markers" : "Show project markers"}
              className="flex items-center gap-2 h-9 rounded-lg px-3 text-sm font-bold shadow-lg border transition-all"
              style={{
                background: showProjects
                  ? "linear-gradient(135deg,#10b981,#059669)"
                  : "rgba(15,23,42,0.82)",
                color: showProjects ? "#fff" : "rgba(241,245,249,0.5)",
                borderColor: showProjects ? "transparent" : "rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                boxShadow: showProjects ? "0 4px 14px rgba(16,185,129,0.35)" : undefined,
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {showProjects ? (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                )}
              </svg>
              {showProjects ? "Visible" : "Hidden"}
            </button>
          </div>

          {/* ── Bottom-left: selected project info card ── */}
          {selectedProject && (
            <div
              className="absolute bottom-8 left-3 z-[1000] max-w-[280px] rounded-2xl shadow-2xl border border-white/10 p-4"
              style={{ background: "rgba(15,23,42,0.92)", backdropFilter: "blur(16px)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-400">
                    Selected Project
                  </p>
                  <p className="mt-1 text-sm font-bold text-white leading-snug truncate">
                    {selectedProject.WSUC_Name || `WSUC ${selectedProject.WSUC_ID}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDismissProject}
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition mt-0.5"
                >
                  ×
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
                {[
                  ["Province", selectedProject.Location?.Province_Name],
                  ["District", selectedProject.Location?.District_Name],
                  ["Municipality", selectedProject.Location?.Municipality_Name],
                  ["OM Score", selectedProject.Summary_Index?.OM_Score],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-[9px] uppercase tracking-widest text-white/35">{label}</p>
                    <p className="text-xs text-white/80 mt-0.5 truncate">{val ?? "—"}</p>
                  </div>
                ))}
              </div>

              {coveredWards.length > 0 && (
                <div className="mt-3">
                  <p className="text-[9px] uppercase tracking-widest text-white/35 mb-1.5">
                    Wards Covered ({coveredWards.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {coveredWards.map((w) => (
                      <span
                        key={w}
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: "rgba(16,185,129,0.2)", color: "#10b981" }}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {wardLoading && (
                <p className="mt-2 text-[10px] text-white/40 flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full border border-emerald-400 border-t-transparent animate-spin" />
                  Fetching ward boundaries…
                </p>
              )}
              {!wardLoading && wardFeatures.length > 0 && (
                <p className="mt-2 text-[10px] font-semibold text-emerald-400">
                  ✓ {wardFeatures.length} ward{wardFeatures.length !== 1 ? "s" : ""} highlighted
                </p>
              )}
              {wardError && !wardLoading && (
                <p className="mt-2 text-[10px] text-red-400">{wardError}</p>
              )}
            </div>
          )}

          {/* ── Loading toast for ward data (when no project card visible) ── */}
          {wardLoading && !selectedProject && (
            <div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 rounded-full px-4 py-2 text-xs text-white shadow-lg border border-white/10"
              style={{ background: "rgba(15,23,42,0.90)", backdropFilter: "blur(12px)" }}
            >
              <span className="inline-block w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
              Loading ward boundaries…
            </div>
          )}

          {wardError && !wardLoading && !selectedProject && (
            <div
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] rounded-full px-4 py-2 text-xs text-red-400 shadow-lg border border-red-900/50"
              style={{ background: "rgba(15,23,42,0.90)", backdropFilter: "blur(12px)" }}
            >
              {wardError}
            </div>
          )}

          {/* ── Legend ── */}
          <div
            className="absolute bottom-8 right-14 z-[1000] rounded-xl px-3 py-2.5 shadow-lg border border-white/10"
            style={{ background: "rgba(15,23,42,0.82)", backdropFilter: "blur(12px)" }}
          >
            <p className="text-[9px] uppercase tracking-widest text-white/40 mb-2">Legend</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: "#10b981", boxShadow: "0 0 0 3px rgba(16,185,129,0.25)" }} />
                <span className="text-[11px] text-white/70">Project location</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: "#3b82f6", boxShadow: "0 0 0 3px rgba(59,130,246,0.25)" }} />
                <span className="text-[11px] text-white/70">Selected project</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded shrink-0 border border-blue-400" style={{ background: "rgba(59,130,246,0.3)" }} />
                <span className="text-[11px] text-white/70">Ward coverage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded shrink-0 border border-amber-400" style={{ background: "rgba(252,211,77,0.25)" }} />
                <span className="text-[11px] text-white/70">Municipality boundary</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GISMapPage;
