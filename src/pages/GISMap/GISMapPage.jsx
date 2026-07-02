import { useCallback, useMemo, useState } from "react";
import { NEPAL_CENTER } from "./utils/mapConstants";
import { useMapData } from "./hooks/useMapData";
import { useWardData } from "./hooks/useWardData";
import MapCanvas from "./components/MapCanvas";
import FilterBar from "./components/FilterBar";
import ProjectsPanel from "./components/ProjectsPanel";
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
  const [showProjects, setShowProjects] = useState(true);
  const [muniZoomFeatures, setMuniZoomFeatures] = useState([]);
  const [mapType, setMapType] = useState("default");
  const [showDensity, setShowDensity] = useState(false);

  const { wardFeatures, wardLoading, wardError } = useWardData({
    selectedProject,
    projectLocations,
  });

  const handleSelectProject = useCallback((project) => {
    setSelectedProject(project);
    setMuniZoomFeatures([]);
  }, []);

  const selectedCentroid = useMemo(() => {
    if (!selectedProject) return null;
    const loc = projectLocations[selectedProject._id];
    return [loc?.lat ?? NEPAL_CENTER[0], loc?.lng ?? NEPAL_CENTER[1]];
  }, [projectLocations, selectedProject]);

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
            projects={projects}
            projectLocations={projectLocations}
            selectedProject={selectedProject}
            showProjects={showProjects}
            wardFeatures={wardFeatures}
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

          {/* Top-right: project list + visibility toggle */}
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
            <ProjectsPanel
              projects={projects}
              selectedProject={selectedProject}
              onSelect={handleSelectProject}
            />
            <button
              type="button"
              onClick={() => setShowProjects((v) => !v)}
              title={
                showProjects ? "Hide project markers" : "Show project markers"
              }
              className="flex items-center gap-2 h-9 rounded-lg px-3 text-sm font-bold shadow border transition-colors"
              style={{
                background: showProjects ? "#10b981" : "#1e293b",
                color: showProjects ? "#fff" : "rgba(241,245,249,0.5)",
                borderColor: showProjects
                  ? "transparent"
                  : "rgba(255,255,255,0.12)",
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {showProjects ? (
                  <>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </>
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                )}
              </svg>
              {showProjects ? "Visible" : "Hidden"}
            </button>
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
