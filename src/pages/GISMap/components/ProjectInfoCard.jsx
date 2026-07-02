export default function ProjectInfoCard({
  project,
  coveredWards,
  wardLoading,
  wardFeatures,
  wardError,
  onDismiss,
}) {
  return (
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
            {project.WSUC_Name || `WSUC ${project.WSUC_ID}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition mt-0.5"
        >
          ×
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
        {[
          ["Province", project.Location?.Province_Name],
          ["District", project.Location?.District_Name],
          ["Municipality", project.Location?.Municipality_Name],
          [
            "OM Score",
            project.Summary_Index?.OM_Score != null
              ? `${(Number(project.Summary_Index.OM_Score) * 100).toFixed(2)}%`
              : null,
          ],
          [
            "SPI",
            project.Summary_Index?.SPI != null
              ? `${Number(project.Summary_Index.SPI).toFixed(1)}%`
              : null,
          ],
          [
            "OEI",
            project.Summary_Index?.OEI != null
              ? `${Number(project.Summary_Index.OEI).toFixed(1)}%`
              : null,
          ],
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
  );
}