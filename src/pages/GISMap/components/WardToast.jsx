const toastBase = {
  background: "#0f172a",
};

export default function WardToast({ wardLoading, wardError }) {
  if (!wardLoading && !wardError) return null;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
      {wardLoading && (
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2 text-xs text-white shadow border border-white/10"
          style={toastBase}
        >
          <span className="inline-block w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          Loading ward boundaries…
        </div>
      )}
      {wardError && !wardLoading && (
        <div
          className="rounded-full px-4 py-2 text-xs text-red-400 shadow border border-red-900/50"
          style={toastBase}
        >
          {wardError}
        </div>
      )}
    </div>
  );
}