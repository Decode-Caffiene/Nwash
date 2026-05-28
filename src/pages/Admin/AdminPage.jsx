function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
          Admin Panel
        </p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">
          Administrative controls and governance
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-secondary">
          Manage user access, configure alerts, and coordinate approvals in the
          administrative layer for the dashboard.
        </p>
      </div>

      <div className="stat-card">
        <p className="text-sm text-text-secondary">Placeholder content</p>
      </div>
    </div>
  );
}

export default AdminPage;
