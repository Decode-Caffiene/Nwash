import { useEffect, useRef, useState } from "react";

export default function ProjectsPanel({ projects, selectedProject, onSelect }) {
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
        style={{
          background: "rgba(15,23,42,0.82)",
          color: "#f1f5f9",
          backdropFilter: "blur(12px)",
        }}
      >
        <svg
          className="w-4 h-4 text-emerald-400 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <span>{projects.length} Projects</span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform text-white/50 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1.5 max-h-[360px] overflow-y-auto rounded-xl shadow-2xl border border-white/10"
          style={{
            background: "rgba(15,23,42,0.95)",
            backdropFilter: "blur(16px)",
            width: "300px",
          }}
        >
          <div
            className="sticky top-0 px-4 py-2.5 border-b border-white/10"
            style={{ background: "rgba(15,23,42,0.95)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">
              Select Project
            </p>
          </div>
          {projects.map((project) => {
            const isSelected = selectedProject?._id === project._id;
            return (
              <button
                key={project._id}
                type="button"
                onClick={() => {
                  onSelect(project);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm transition border-b border-white/5 last:border-0 hover:bg-white/5"
                style={{ background: isSelected ? "rgba(16,185,129,0.15)" : undefined }}
              >
                <p
                  className="font-semibold truncate"
                  style={{ color: isSelected ? "#10b981" : "#f1f5f9" }}
                >
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