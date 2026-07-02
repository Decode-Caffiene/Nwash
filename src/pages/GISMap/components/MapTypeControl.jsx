import { BASEMAPS } from "../utils/mapConstants";

const panelStyle = {
  background: "#1e293b",
};

// Bottom-right control: switch basemap style and toggle the population
// density overlay. Fully controlled — state lives in GISMapPage.
export default function MapTypeControl({
  mapType,
  onMapTypeChange,
  showDensity,
  onToggleDensity,
}) {
  return (
    <div
      className="absolute bottom-8 right-3 z-[1000] rounded-xl px-3 py-2.5 shadow border border-white/10"
      style={panelStyle}
    >
      <p className="text-[9px] uppercase tracking-widest text-white/40 mb-2">
        Map Type
      </p>

      <div className="flex gap-1.5">
        {Object.entries(BASEMAPS).map(([key, { label }]) => {
          const active = mapType === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onMapTypeChange(key)}
              className="rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors"
              style={{
                background: active ? "#10b981" : "rgba(255,255,255,0.06)",
                color: active ? "#fff" : "rgba(241,245,249,0.6)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 pt-2.5 border-t border-white/10">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showDensity}
            onChange={(e) => onToggleDensity(e.target.checked)}
            className="h-3.5 w-3.5 accent-emerald-500"
          />
          <span className="text-[11px] text-white/70">Population density</span>
        </label>
      </div>
    </div>
  );
}
