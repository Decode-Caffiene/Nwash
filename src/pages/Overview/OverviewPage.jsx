function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">
          Government water supply control center
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-secondary">
          A live operations dashboard for monitoring regulatory readiness,
          service providers, and water security indicators across Nepal.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active districts", value: "41" },
          { label: "Operators tracked", value: "126" },
          { label: "Compliance score", value: "93%" },
          { label: "Pending alerts", value: "9" },
        ].map((item) => (
          <div key={item.label} className="stat-card">
            <p className="text-sm text-text-secondary">{item.label}</p>
            <p className="mt-3 text-2xl font-bold text-text-primary">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OverviewPage;
