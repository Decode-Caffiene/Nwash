import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Lock, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import governmentLogo from "../../assets/govern.svg";
import AdminPage from "../Admin/AdminPage";
export default function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from?.pathname ?? "/admin";

  const [form, setForm] = useState({ userName: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in — send them where they were trying to go
  if (isAuthenticated) {
    return <Navigate to={returnTo} replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
      navigate(returnTo, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.detail ??
        err?.message ??
        "Invalid credentials. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src={governmentLogo}
            alt="Nepal Government"
            className="mb-4 h-16 w-16 object-contain"
          />

          <h1 className="mt-1 text-2xl font-bold text-text-primary">
            Admin Sign In
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            DWSSM Dashboard — restricted access
          </p>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} className="stat-card space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary"
            >
              Username
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface px-4 py-3 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary/30 transition">
              <User size={16} className="shrink-0 text-text-secondary" />
              <input
                id="userName"
                name="userName"
                type="text"
                autoComplete="userName"
                required
                value={form.userName}
                onChange={handleChange}
                placeholder="Enter username"
                className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-text-secondary"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-text-secondary"
            >
              Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-surface-border bg-surface px-4 py-3 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary/30 transition">
              <Lock size={16} className="shrink-0 text-text-secondary" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-text-secondary"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand-primary py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-secondary">
          This area is for authorized personnel only.
          <br />
          Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}
