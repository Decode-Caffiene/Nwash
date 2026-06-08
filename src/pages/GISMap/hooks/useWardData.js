import { useCallback, useEffect, useState } from "react";
import { filterWards } from "../../../api/mapService";
import { PROVINCE_NAME_TO_NO } from "../utils/mapConstants";
import { cleanDistrict, normalizeText, parseWardList } from "../utils/geoHelpers";
import { resolveMuni } from "../utils/muniResolver";

// Fetches GeoJSON ward boundaries for the currently selected project.
//
// Re-runs whenever selectedProject, projectLocations, or muniIndex changes.
// Exposes clearWards so the parent can reset when the user dismisses a project.
//
// Returns { wardFeatures, wardLoading, wardError, clearWards }
export function useWardData({ selectedProject, projectLocations, muniIndex }) {
  const [wardFeatures, setWardFeatures] = useState([]);
  const [wardLoading, setWardLoading] = useState(false);
  const [wardError, setWardError] = useState("");

  const clearWards = useCallback(() => setWardFeatures([]), []);

  const fetchWardData = useCallback(
    async (project) => {
      if (!project) {
        setWardFeatures([]);
        return;
      }

      const loc = projectLocations[project._id];
      const district =
        loc?.district ?? cleanDistrict(project.Location?.District_Name);

      // Use the canonical municipality name resolved via the spatial index.
      // Falls back to raw project value (via resolveMuni) if projectLocations
      // hasn't been hydrated yet.
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
      const province =
        PROVINCE_NAME_TO_NO[normalizeText(project.Location?.Province_Name ?? "")] ??
        null;

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

  return { wardFeatures, wardLoading, wardError, clearWards };
}