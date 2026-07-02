import { Bell, LogOut, Search, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Badge from "../common/Badge";
import { useAuth } from "../../hooks/useAuth";

import { getInitials } from "../../utils/helpers";
import governmentLogo from "../../assets/govern.svg";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAdminClick = () => {
    navigate(isAuthenticated ? "/view-data" : "/login");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/overview");
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border bg-white px-6 py-4">
      {/* Left: Nepal Government Logo */}
      <div className="flex items-center">
        <img
          src={governmentLogo}
          alt="Nepal Government Logo"
          className="h-16 w-16 object-contain"
        />
        <div className="ml-3 hidden sm:block">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
            Ministry of Water Supply
          </p>

          <p className="text-sm font-bold text-text-primary">DWSSM Dashboard</p>
        </div>
      </div>

      {/* Centre: Search */}
      <div className="flex flex-1 flex-wrap items-center justify-end gap-4">
        <label className="flex w-full max-w-xl items-center gap-3 rounded-xl border border-surface-border bg-surface px-4 py-2.5">
          <Search size={18} className="text-text-secondary" />
          <input
            type="search"
            placeholder="Search operators, districts…"
            className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-text-secondary"
          />
        </label>
      </div>

      {/* Right: badges + Admin button + user area */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="default">DWSSM</Badge>
          <Badge className="border border-brand-primary bg-transparent text-brand-secondary">
            WaterAid
          </Badge>
        </div>

        <div className="relative">
          <button
            type="button"
            className="rounded-full p-2 text-text-secondary transition hover:bg-surface"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
          <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
        </div>

        {/* Admin button — always visible; destination depends on auth state */}
        <button
          type="button"
          onClick={handleAdminClick}
          title={isAuthenticated ? "Go to Admin Panel" : "Admin Login"}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition"
          style={{
            background: isAuthenticated ? "#0f172a" : "transparent",
            color: isAuthenticated ? "#fff" : "#0f172a",
            borderColor: isAuthenticated ? "transparent" : "#cbd5e1",
          }}
        >
          <ShieldCheck size={16} />
          Admin
        </button>

        {/* User area */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 rounded-full bg-surface px-3 py-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">
                {getInitials(user?.name ?? "Admin User")}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-text-primary">
                  {user?.name ?? "Admin User"}
                </p>
                <p className="text-xs text-text-secondary">
                  {user?.role ?? "System Administrator"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="rounded-full p-2 text-text-secondary transition hover:bg-surface hover:text-red-500"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-text-secondary">
            <ShieldCheck size={18} />
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
