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
// A `cancelled` flag inside each effect run prevents stale filterWards
// responses (including the extra call React Strict Mode triggers on mount)
// from overwriting wardFeatures after the user has switched projects.
//
// wardKey increments only when real features are committed, so MapCanvas
// uses it as the <GeoJSON> key — the layer remounts only when the data
// actually changes, not on every intermediate render.
export function useWardData({ selectedProject, projectLocations }) {
  const [wardFeatures, setWardFeatures] = useState([]);
  const [wardLoading, setWardLoading] = useState(false);
  const [wardError, setWardError] = useState("");
  const [wardKey, setWardKey] = useState(0);

  const clearWards = useCallback(() => setWardFeatures([]), []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!selectedProject) {
        setWardFeatures([]);
        return;
      }

      // New project: geometry is already the service area — render it directly,
      // skip the backend ward request entirely.
      const hasPolygon =
        selectedProject.geometry?.type === "Polygon" &&
        selectedProject.geometry.coordinates?.[0]?.length >= 3;

      if (hasPolygon) {
        setWardFeatures([
          {
            type: "Feature",
            geometry: selectedProject.geometry,
            properties: { WARD_NO: 0 },
          },
        ]);
        setWardKey((k) => k + 1);
        return;
      }

      const loc = projectLocations[selectedProject._id];
      const rawDistrict =
        loc?.district ??
        cleanDistrict(selectedProject.Location?.District_Name);

      // 8 districts have different spellings between the DB and the wards
      // GeoJSON (e.g. "Makwanpur" in the DB vs "MAKAWANPUR" in the dataset).
      const district = DISTRICT_TO_WARD_KEY[rawDistrict] ?? rawDistrict;

      // cleanMunicipality trims and applies MUNI_CORRECTIONS, the same path
      // used by resolveMuni() for marker placement — keeps both in sync.
      const municipality = cleanMunicipality(
        selectedProject.Location?.Municipality_Name ?? "",
      );

      if (!municipality || !district) {
        setWardFeatures([]);
        return;
      }

      const wards = parseWardList(selectedProject.Location?.Wards_Covered);
      const province =
        PROVINCE_NAME_TO_NO[
          normalizeText(selectedProject.Location?.Province_Name ?? "")
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

        if (!cancelled) {
          setWardFeatures(data?.features || []);
          setWardKey((k) => k + 1);
        }
      } catch (err) {
        if (!cancelled) {
          setWardError(err.message);
          setWardFeatures([]);
        }
      } finally {
        if (!cancelled) {
          setWardLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [selectedProject, projectLocations]);

  return { wardFeatures, wardLoading, wardError, clearWards, wardKey };
}
