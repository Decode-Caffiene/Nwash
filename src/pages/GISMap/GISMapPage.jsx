import { useCallback, useEffect, useMemo, useState } from "react";
import { NEPAL_CENTER } from "./utils/mapConstants";
import { getProjectType } from "./utils/geoHelpers";
import { useMapData } from "./hooks/useMapData";
import { useWardData } from "./hooks/useWardData";
import MapCanvas from "./components/MapCanvas";
import FilterBar from "./components/FilterBar";
import ProjectsPanel from "./components/ProjectsPanel";
import ProjectTypeFilter from "./components/ProjectTypeFilter";
import WardToast from "./components/WardToast";
import MapTypeControl from "./components/MapTypeControl";

function LoadingScreen() {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-4"
      style={{ background: "#0f172a" }}
    >
      <span className="inline-block w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
      <span className="text-sm text-slate-400">Loading map data…</span>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div
      className="flex h-full items-center justify-center text-red-400 text-sm"
      style={{ background: "#0f172a" }}
    >
      {message}
    </div>
  );
}

export default function GISMapPage() {
  const { projects, muniGeojson, projectLocations, loading, error } =
    useMapData();
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTypeFilters, setProjectTypeFilters] = useState({
    FORM: true,
    LEGACY_WITH_WARDS: true,
    LEGACY_WITHOUT_WARDS: true,
  });
  const [muniZoomFeatures, setMuniZoomFeatures] = useState([]);
  const [mapType, setMapType] = useState("default");
  const [showDensity, setShowDensity] = useState(false);

  const { wardFeatures, wardLoading, wardError, wardKey } = useWardData({
    selectedProject,
    projectLocations,
  });

  // Derive visible projects from the active type filters.
  const visibleProjects = useMemo(
    () => projects.filter((p) => projectTypeFilters[getProjectType(p)]),
    [projects, projectTypeFilters],
  );

  // If the selected project's type is toggled off, clear the selection so the
  // ward polygon, popup, and panel selection all stay in sync.
  useEffect(() => {
    if (!selectedProject) return;
    if (!projectTypeFilters[getProjectType(selectedProject)]) {
      setSelectedProject(null);
      setMuniZoomFeatures([]);
    }
  }, [projectTypeFilters, selectedProject]);

  const handleSelectProject = useCallback((project) => {
    console.log("====================================");
    console.log("CLICK", project._id, project.Project_Name);
    console.log("====================================");
    setSelectedProject(project);
    setMuniZoomFeatures([]);
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setProjectTypeFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const selectedCentroid = useMemo(() => {
    if (!selectedProject) return null;
    const loc = projectLocations[selectedProject._id];
    return [loc?.lat ?? NEPAL_CENTER[0], loc?.lng ?? NEPAL_CENTER[1]];
  }, [projectLocations, selectedProject]);

  console.log("Rendering wardFeatures");
  console.log(wardFeatures);
  console.log(wardFeatures[0]?.geometry);

  return (
    <div
      className="relative -mx-6 -my-6 overflow-hidden"
      style={{ height: "calc(100vh - 73px)" }}
    >
      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <ErrorScreen message={error} />
      ) : (
        <>
          <MapCanvas
            projects={visibleProjects}
            projectLocations={projectLocations}
            selectedProject={selectedProject}
            wardFeatures={wardFeatures}
            wardKey={wardKey}
            muniZoomFeatures={muniZoomFeatures}
            selectedCentroid={selectedCentroid}
            onSelectProject={handleSelectProject}
            mapType={mapType}
            showDensity={showDensity}
          />

          <FilterBar
            projects={projects}
            muniGeojson={muniGeojson}
            onZoom={setMuniZoomFeatures}
          />

          {/* Top-right: project list + type filters */}
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
            <ProjectsPanel
              projects={visibleProjects}
              selectedProject={selectedProject}
              onSelect={handleSelectProject}
            />
            <ProjectTypeFilter
              filters={projectTypeFilters}
              onChange={handleFilterChange}
            />
          </div>

          <WardToast wardLoading={wardLoading} wardError={wardError} />

          <MapTypeControl
            mapType={mapType}
            onMapTypeChange={setMapType}
            showDensity={showDensity}
            onToggleDensity={setShowDensity}
          />
        </>
      )}
    </div>
  );
}
