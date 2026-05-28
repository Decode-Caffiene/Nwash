import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight, Droplets, Menu } from "lucide-react";
import navLinks from "../../constants/navLinks";
import { cn } from "../../utils/helpers";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const applyCollapse = () => setCollapsed(mediaQuery.matches);
    applyCollapse();

    mediaQuery.addEventListener("change", applyCollapse);
    return () => mediaQuery.removeEventListener("change", applyCollapse);
  }, []);

  const labelWidth = useMemo(() => (collapsed ? "w-16" : "w-64"), [collapsed]);

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-sidebar-light/20 bg-sidebar text-white transition-all duration-300",
        labelWidth,
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Droplets size={20} />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold">RRPCD</p>
            <p className="text-[11px] text-white/70">DWSSM/SRIMS</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navLinks.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/overview"}
            className={({ isActive }) =>
              cn(
                "nav-link",
                isActive && "nav-link-active",
                collapsed && "justify-center px-2",
              )
            }
          >
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-sidebar-active"
        >
          {collapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          {!collapsed ? (
            <span>Collapse</span>
          ) : (
            <span className="sr-only">Expand</span>
          )}
          {!collapsed && (
            <ChevronRight size={16} className="ml-auto text-white/60" />
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
