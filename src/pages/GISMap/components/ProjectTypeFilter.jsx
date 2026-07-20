const TYPES = [
  {
    key: "FORM",
    label: "Form",
    title: "Form Projects — have their own polygon geometry",
    color: "#10b981",
  },
  {
    key: "LEGACY_WITH_WARDS",
    label: "With Wards",
    title: "Legacy Projects with Wards_Covered data",
    color: "#3b82f6",
  },
  {
    key: "LEGACY_WITHOUT_WARDS",
    label: "No Wards",
    title: "Legacy Projects with no ward data",
    color: "#64748b",
  },
];

export default function ProjectTypeFilter({ filters, onChange }) {
  return (
    <div
      className="flex items-center gap-1 rounded-lg shadow border border-white/10 p-1"
      style={{ background: "#1e293b" }}
    >
      {TYPES.map(({ key, label, title, color }) => {
        const active = filters[key];
        return (
          <button
            key={key}
            type="button"
            role="checkbox"
            aria-checked={active}
            aria-label={title}
            title={title}
            onClick={() => onChange(key, !active)}
            className="flex items-center gap-1.5 rounded-md px-2.5 h-7 text-xs font-semibold transition-all select-none"
            style={{
              background: active ? color : "transparent",
              color: active ? "#fff" : "rgba(241,245,249,0.4)",
              border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: active ? "rgba(255,255,255,0.7)" : color }}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
