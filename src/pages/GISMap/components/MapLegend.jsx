const items = [
  {
    shape: "circle",
    color: "#10b981",
    shadow: "0 0 0 3px rgba(16,185,129,0.25)",
    label: "Project location",
  },
  {
    shape: "circle",
    color: "#3b82f6",
    shadow: "0 0 0 3px rgba(59,130,246,0.25)",
    label: "Selected project",
  },
  {
    shape: "square",
    color: "rgba(59,130,246,0.3)",
    border: "#60a5fa",
    label: "Ward coverage",
  },
  {
    shape: "square",
    color: "rgba(252,211,77,0.25)",
    border: "#fbbf24",
    label: "Municipality boundary",
  },
];

export default function MapLegend() {
  return (
    <div
      className="absolute bottom-8 right-14 z-[1000] rounded-xl px-3 py-2.5 shadow-lg border border-white/10"
      style={{ background: "rgba(15,23,42,0.82)", backdropFilter: "blur(12px)" }}
    >
      <p className="text-[9px] uppercase tracking-widest text-white/40 mb-2">Legend</p>
      <div className="flex flex-col gap-1.5">
        {items.map(({ shape, color, shadow, border, label }) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`w-3 h-3 shrink-0 ${shape === "circle" ? "rounded-full" : "rounded border"}`}
              style={{
                background: color,
                boxShadow: shadow,
                borderColor: border,
              }}
            />
            <span className="text-[11px] text-white/70">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}