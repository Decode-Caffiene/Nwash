function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
          Analytics & Charts
        </p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">
          Performance and trend analysis
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-secondary">
          Explore water system performance, compliance reporting, and progress
          metrics in an analytics-ready workspace.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="stat-card min-h-[220px]">
          <p className="text-sm text-text-secondary">
            Water service performance
          </p>
        </div>
        <div className="stat-card min-h-[220px]">
          <p className="text-sm text-text-secondary">
            Compliance trend overview
          </p>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
