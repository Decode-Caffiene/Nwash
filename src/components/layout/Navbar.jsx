import { useEffect, useRef, useState } from "react";
import { Bell, LogOut, MapPin, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getFormData } from "../../api/formApi";
import { getInitials } from "../../utils/helpers";
import governmentLogo from "../../assets/govern.svg";

// ── Status dot config ─────────────────────────────────────────────────────────
const STATUS_DOT = {
  pending: { color: "#f59e0b", label: "Pending" },
  accepted: { color: "#10b981", label: "Accepted" },
  rejected: { color: "#ef4444", label: "Rejected" },
};

function getStatus(sub) {
  return ((sub.Status ?? sub.status) || "pending").toLowerCase();
}

// ── Notification dropdown ─────────────────────────────────────────────────────
function NotificationDropdown({ submissions, onNavigate }) {
  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
        <Bell size={24} className="text-slate-300" />
        <p className="text-sm font-medium text-slate-500">No submissions</p>
        <p className="text-xs text-slate-400">
          Form submissions will appear here
        </p>
      </div>
    );
  }

  return (
    <div>
      {submissions.map((sub) => {
        const id = sub._id ?? sub.id;
        const status = getStatus(sub);
        const dot = STATUS_DOT[status] ?? STATUS_DOT.pending;
        const operator = sub.Operator_Info ?? {};
        const location = sub.Location ?? {};

        return (
          <div
            key={id}
            className="flex items-start gap-3 border-b border-slate-100 px-4 py-3.5 last:border-0 hover:bg-slate-50 transition-colors"
          >
            {/* Status dot */}
            <span
              className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
              style={{ background: dot.color }}
            />

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {sub.WSUC_Name ?? "Unnamed WSUC"}
                </p>
                <span
                  className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    background: `${dot.color}18`,
                    color: dot.color,
                  }}
                >
                  {dot.label}
                </span>
              </div>

              {operator.Name && (
                <p className="mt-0.5 text-xs text-slate-500">{operator.Name}</p>
              )}

              {(location.District_Name || location.Municipality_Name) && (
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={9} className="flex-shrink-0" />
                  {[location.Municipality_Name, location.District_Name]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Footer link */}
      <div className="border-t border-slate-100 px-4 py-2.5">
        <button
          type="button"
          onClick={onNavigate}
          className="w-full rounded-lg py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
        >
          View all in portal →
        </button>
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const bellRef = useRef(null);

  // Fetch form data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    const load = async () => {
      try {
        const result = await getFormData();
        if (cancelled) return;
        const list = Array.isArray(result)
          ? result
          : Array.isArray(result?.message)
            ? result.message
            : [];
        setSubmissions(list);
      } catch {
        // Silently ignore — navbar badge is non-critical
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  const pendingCount = submissions.filter(
    (s) => getStatus(s) === "pending",
  ).length;

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
            Ministry of Infrastructures Development
          </p>
          <p className="text-sm font-bold text-text-primary">DWSSM Dashboard</p>
        </div>
      </div>

      {/* Right: bell + admin + user */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Bell with dropdown — admin only */}
        {isAuthenticated && (
          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="relative rounded-full p-2 text-text-secondary transition hover:bg-surface"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {pendingCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold leading-none text-white">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full z-[2000] mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                {/* Dropdown header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-slate-500" />
                    <span className="text-sm font-bold text-slate-800">
                      Submissions
                    </span>
                  </div>
                  {pendingCount > 0 && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                      {pendingCount} pending
                    </span>
                  )}
                </div>

                {/* Scrollable list */}
                <div className="max-h-96 overflow-y-auto">
                  <NotificationDropdown
                    submissions={submissions}
                    onNavigate={() => {
                      setDropdownOpen(false);
                      navigate("/view-data");
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Admin button */}
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
