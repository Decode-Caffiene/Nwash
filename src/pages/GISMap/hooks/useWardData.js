import { useCallback, useEffect, useState } from "react";
import { filterWards } from "../../../api/mapService";
import {
  DISTRICT_TO_WARD_KEY,
  PROVINCE_NAME_TO_NO,
} from "../utils/mapConstants";
import {
  cleanDistrict,
  cleanMunicipality,
  normalizeText,
  parseWardList,
} from "../utils/geoHelpers";

// Fetches GeoJSON ward boundaries for the currently selected project.
//
// Re-runs whenever selectedProject or projectLocations changes.
// Exposes clearWards so the parent can reset when the user dismisses a project.
//
// Returns { wardFeatures, wardLoading, wardError, clearWards }
export function useWardData({ selectedProject, projectLocations }) {
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
      const rawDistrict =
        loc?.district ?? cleanDistrict(project.Location?.District_Name);

      // 8 districts have different spellings between the DB and the wards
      // GeoJSON (e.g. "Makwanpur" in the DB vs "MAKAWANPUR" in the dataset).
      const district = DISTRICT_TO_WARD_KEY[rawDistrict] ?? rawDistrict;

      // cleanMunicipality trims and applies MUNI_CORRECTIONS, the same path
      // used by resolveMuni() for marker placement — keeps both in sync.
      const municipality = cleanMunicipality(
        project.Location?.Municipality_Name ?? "",
      );

      if (!municipality || !district) {
        setWardFeatures([]);
        return;
      }

      const wards = parseWardList(project.Location?.Wards_Covered);
      const province =
        PROVINCE_NAME_TO_NO[
          normalizeText(project.Location?.Province_Name ?? "")
        ] ?? null;

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

        console.log("data feature leangth", data.features.length);
        setWardFeatures(data?.features || []);
      } catch (err) {
        setWardError(err.message);
        setWardFeatures([]);
      } finally {
        setWardLoading(false);
      }
    },

    [projectLocations],
  );

  useEffect(() => {
    fetchWardData(selectedProject);
  }, [selectedProject, fetchWardData]);

  return { wardFeatures, wardLoading, wardError, clearWards };
}
