import { Bell, Search, ShieldCheck, Sparkles } from "lucide-react";
import Badge from "../common/Badge";
import { getInitials } from "../../utils/helpers";

function Navbar() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-surface-border bg-white px-6 py-4">
      <div className="flex flex-1 items-center gap-3">
        <label className="flex w-full max-w-xl items-center gap-3 rounded-xl border border-surface-border bg-surface px-4 py-2.5">
          <Search size={18} className="text-text-secondary" />
          <input
            type="search"
            placeholder="Search operators, districts…"
            className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-text-secondary"
          />
        </label>
      </div>

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

        <div className="flex items-center gap-3 rounded-full bg-surface px-3 py-1.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white">
            {getInitials("Admin User")}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Admin User
            </p>
            <p className="text-xs text-text-secondary">System Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
