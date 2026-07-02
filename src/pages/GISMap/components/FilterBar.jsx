import { useMemo, useState } from "react";
import { cleanDistrict } from "../utils/geoHelpers";

const panelStyle = {
  background: "#1e293b",
};

const selectStyle = {
  background: "#1e293b",
  color: "#f1f5f9",
  borderColor: "rgba(255,255,255,0.18)",
};

const baseCls =
  "h-9 rounded-lg border text-sm outline-none transition cursor-pointer px-2.5 min-w-[148px]";

// Cascading province → district → municipality filter bar.
// Resets each level when its parent changes.
// Calls onZoom(features[]) when the user confirms a municipality selection.
export default function FilterBar({ projects, muniGeojson, onZoom }) {
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

  return (
    <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 flex-wrap">
      {/* Label chip */}
      <div
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 shadow border border-white/10"
        style={panelStyle}
      >
        <svg
          className="w-3.5 h-3.5 text-emerald-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
          />
        </svg>
        <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
          Filter
        </span>
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
        style={{
          ...selectStyle,
          opacity: !province ? 0.45 : 1,
          cursor: !province ? "not-allowed" : "pointer",
        }}
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
        style={{
          ...selectStyle,
          opacity: !district ? 0.45 : 1,
          cursor: !district ? "not-allowed" : "pointer",
        }}
      >
        <option value="">All Municipalities</option>
        {municipalities.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      {/* Zoom */}
      <button
        type="button"
        onClick={handleZoom}
        disabled={!municipality}
        className="flex items-center gap-1.5 h-9 rounded-lg px-4 text-sm font-bold shadow border border-transparent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: municipality ? "#10b981" : "#1e293b",
          color: "#fff",
        }}
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
          />
        </svg>
        Zoom
      </button>
    </div>
  );
}