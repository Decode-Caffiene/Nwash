import { useEffect, useMemo, useState } from "react";
import { getMapData, getMuniGeojson } from "../../../api/mapService";
import { cleanDistrict } from "../utils/geoHelpers";
import { buildMuniIndex, resolveMuni } from "../utils/muniResolver";

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
    return () => { cancelled = true; };
  }, []);

  // Build the spatial index once per muniGeojson update.
  // This is the only authoritative source of centroid data.
  const muniIndex = useMemo(() => buildMuniIndex(muniGeojson), [muniGeojson]);

  // Resolve every project's centroid + canonical municipality name up front
  // so individual markers never need to run the fuzzy resolver on render.
  const projectLocations = useMemo(
    () =>
      projects.reduce((acc, project) => {
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
      }, {}),
    [projects, muniIndex],
  );

  return { projects, muniGeojson, muniIndex, projectLocations, loading, error };
}