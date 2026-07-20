import { useEffect, useMemo, useState } from "react";
import { getMapData, getMuniGeojson } from "../../../api/mapService";
import { calculateCentroid, cleanDistrict } from "../utils/geoHelpers";
import { buildMuniIndex, resolveMuni } from "../utils/muniResolver";
import { MUNI_DISTRICT_CORRECTIONS } from "../utils/mapConstants";
import { NEPAL_CENTER } from "../utils/mapConstants";
// Loads projects + municipality GeoJSON in parallel, then derives:
//   muniIndex        — district-keyed spatial lookup for fuzzy municipality resolution
//   projectLocations — per-project { lat, lng, canonicalMunicipality, district }
//
// Returns a single stable object to prevent unnecessary re-renders in consumers.
export function useMapData() {
  const [projects, setProjects] = useState([]);
  const [muniGeojson, setMuniGeojson] = useState({ features: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const failedProjects = [];
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectData, muniPayload] = await Promise.all([
          getMapData(),
          getMuniGeojson(),
        ]);
        if (!cancelled) {
          setProjects(projectData);
          setMuniGeojson(muniPayload);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load map data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);
  console.log("project data", projects);

  // Build the spatial index once per muniGeojson update.
  // This is the only authoritative source of centroid data.
  const muniIndex = useMemo(() => buildMuniIndex(muniGeojson), [muniGeojson]);

  const projectLocations = useMemo(() => {
    // Phase 1: resolve municipality centroid for every project.
    const raw = projects.reduce((acc, project) => {
      const rawMuni = project.Location?.Municipality_Name ?? "";
      const rawDist = cleanDistrict(project.Location?.District_Name);
      // MUNI_DISTRICT_CORRECTIONS maps the DB district key to the spelling
      // used in nepal_municipalities.json, which differs only for ILLAM.
      // rawDist is stored unchanged so useWardData can apply its own correction.
      const muniDist = MUNI_DISTRICT_CORRECTIONS[rawDist] ?? rawDist;
      const hasPolygon =
        project.geometry?.type === "Polygon" &&
        project.geometry.coordinates?.[0]?.length >= 3;

      if (hasPolygon) {
        // New project: centroid comes from the drawn polygon, not from muniIndex.
        const [lat, lng] = calculateCentroid([{ geometry: project.geometry }]);
        acc[project._id] = { lat, lng, canonicalMunicipality: null, district: rawDist };
      } else {
        // Legacy project: resolve municipality centroid as before.
        const resolved = resolveMuni(rawMuni, muniDist, muniIndex);
        acc[project._id] = {
          lat: resolved.lat,
          lng: resolved.lng,
          canonicalMunicipality: resolved.canonical,
          district: rawDist,
        };
      }
      return acc;
    }, {});

    // Phase 2: deterministic radial offset for projects sharing the same centroid.
    // Groups are sorted by _id so the same project always gets the same angle on reload.
    const byCoord = {};
    for (const [id, loc] of Object.entries(raw)) {
      const key = `${loc.lat},${loc.lng}`;
      if (!byCoord[key]) byCoord[key] = [];
      byCoord[key].push(id);
    }

    const RADIUS_M = 150;
    const LAT_DEG = RADIUS_M / 111320;

    for (const ids of Object.values(byCoord)) {
      if (ids.length <= 1) continue;
      ids.sort(); // lexicographic _id sort → stable angle assignment across reloads
      const { lat, lng } = raw[ids[0]];
      const LNG_DEG = RADIUS_M / (111320 * Math.cos((lat * Math.PI) / 180));
      ids.forEach((id, i) => {
        const angle = (2 * Math.PI * i) / ids.length;
        raw[id] = {
          ...raw[id],
          lat: lat + LAT_DEG * Math.sin(angle),
          lng: lng + LNG_DEG * Math.cos(angle),
        };
      });
    }
    return raw;
  }, [projects, muniIndex]);
  return { projects, muniGeojson, muniIndex, projectLocations, loading, error };
}
