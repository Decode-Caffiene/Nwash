function ServiceProvidersPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
          Service Providers
        </p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">
          Service provider performance dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-secondary">
          Review provider status, monitoring coverage, and district-level
          updates from the SRIMS network.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {[1, 2, 3].map((card) => (
          <div key={card} className="stat-card">
            <p className="text-sm text-text-secondary">
              Provider status {card}
            </p>
            <p className="mt-3 text-xl font-semibold text-text-primary">
              Operational readiness
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              This section will display provider-specific compliance metrics and
              incident summaries.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServiceProvidersPage;
