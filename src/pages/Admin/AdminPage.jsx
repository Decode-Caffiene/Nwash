import { useAuth } from "../../hooks/useAuth";
import { Database, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
          Admin Panel
        </p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">
          Administrative Controls
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-secondary">
          Welcome back
          {user?.name ? `, ${user.name}` : ""}. Manage and review WSUC data
          submissions from this panel.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={() => navigate("/view-data")}
          className="stat-card flex items-start gap-4 text-left transition hover:shadow-md"
        >
          <div className="rounded-xl bg-brand-primary/10 p-3">
            <Database size={22} className="text-brand-primary" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">View Uploaded Data</p>
            <p className="mt-1 text-sm text-text-secondary">
              Review submitted WSUC forms, accept or reject entries.
            </p>
          </div>
        </button>

        <div className="stat-card flex items-start gap-4">
          <div className="rounded-xl bg-slate-100 p-3">
            <ShieldCheck size={22} className="text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">Access Control</p>
            <p className="mt-1 text-sm text-text-secondary">
              User management and role configuration — coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
