function GISMapPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
          GIS Intelligence Map
        </p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">
          District and water point intelligence
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-secondary">
          Visualize service zones, installations, and system health with an
          interactive map view for field coordination.
        </p>
      </div>

      <div className="stat-card min-h-[360px]">
        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface">
          <p className="text-sm text-text-secondary">
            Interactive GIS map placeholder
          </p>
        </div>
      </div>
    </div>
  );
}

export default GISMapPage;
