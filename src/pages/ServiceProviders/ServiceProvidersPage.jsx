import { useMemo, useState } from "react";
import {
  Building2,
  Download,
  FileText,
  Globe,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import Loader from "../../components/common/Loader";
import { getServiceProviders } from "../../api/serviceProviderApi";
import useFetch from "../../hooks/useFetch";
import { computeRankings, getCardStatus } from "./utils/providerUtils";
import { FILTER_TABS, STATUS } from "./constants/providerConstants";
import ProviderCard from "./components/ProviderCard";
import ProviderDetailModal from "./components/ProviderDetailModal";

const asText = (value) => (value == null ? "" : String(value));

export default function ServiceProvidersPage() {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data, loading, error } = useFetch(getServiceProviders, []);
  const providers = Array.isArray(data) ? data : [];
  console.log("providers", providers);
  const rankings = useMemo(() => computeRankings(providers), [providers]);

  const stats = useMemo(() => {
    const provinceCount = new Set(
      providers
        .map((p) => asText(p.Location?.Province_Name).trim())
        .filter(Boolean),
    ).size;

    return [
      {
        label: "Total WSUCs",
        value: providers.length,
        icon: Building2,
        cls: "text-blue-600 bg-blue-50",
      },
      {
        label: "Provinces",
        value: provinceCount,
        icon: Globe,
        cls: "text-violet-600 bg-violet-50",
      },
      {
        label: "Complete",
        value: providers.filter((p) => getCardStatus(p) === "complete").length,
        icon: ShieldCheck,
        cls: "text-emerald-600 bg-emerald-50",
      },
      {
        label: "Business Plan Missing",
        value: providers.filter((p) => getCardStatus(p) === "noBP").length,
        icon: FileText,
        cls: "text-orange-600 bg-orange-50",
      },
    ];
  }, [providers]);

  const filtered = useMemo(() => {
    let list = providers;
    if (filterStatus !== "all")
      list = list.filter((p) => getCardStatus(p) === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const loc = p.Location ?? {};
        return (
          asText(p.WSUC_Name).toLowerCase().includes(q) ||
          asText(loc.Province_Name).toLowerCase().includes(q) ||
          asText(loc.District_Name).toLowerCase().includes(q) ||
          asText(loc.Municipality_Name).toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [providers, search, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary"
          style={{ fontFamily: "monospace" }}
        >
          Service Providers
        </p>
        <h1 className="mt-1 text-2xl font-bold text-text-primary">
          WSUC Registry
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-text-secondary">
          Browse and review all registered Water Supply and Urban Sanitation
          Committees across Nepal.
        </p>
      </div>

      {loading && <Loader text="Loading service providers…" />}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">
            Could not load service provider data
          </p>
          <p className="mt-1 text-sm text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, cls }) => (
              <div key={label} className="stat-card flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${cls}`}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-text-secondary">{label}</p>
                  <p
                    className="mt-0.5 text-2xl font-bold leading-none text-text-primary"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Registry */}
          <div className="stat-card">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex min-w-48 flex-1 items-center gap-2 rounded-lg border border-surface-border bg-surface px-3 py-2">
                <Search
                  size={14}
                  className="flex-shrink-0 text-text-secondary"
                />
                <input
                  type="text"
                  placeholder="Search by name, province, district…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-secondary/60 outline-none"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="flex-shrink-0 text-text-secondary hover:text-text-primary"
                    aria-label="Clear"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 rounded-lg border border-surface-border bg-surface p-1">
                {FILTER_TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilterStatus(key)}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                      filterStatus === key
                        ? "border border-surface-border bg-white text-text-primary shadow-sm"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                    style={{ fontFamily: "monospace" }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <span
                className="flex-shrink-0 text-[11px] text-text-secondary"
                style={{ fontFamily: "monospace" }}
              >
                {filtered.length}/{providers.length}
              </span>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-5">
              {Object.entries(STATUS).map(([key, sc]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ background: sc.dot }}
                  />
                  <span
                    className="text-[10px] text-slate-400"
                    style={{ fontFamily: "monospace" }}
                  >
                    {sc.label}
                  </span>
                </div>
              ))}
              <span
                className="ml-auto text-[10px] text-slate-400"
                style={{ fontFamily: "monospace" }}
              >
                Click card to view details ·{" "}
                <Download size={9} className="inline" /> to export PDF
              </span>
            </div>

            {/* Cards grid */}
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filtered.length === 0 ? (
                <div className="col-span-full py-16 text-center">
                  <Search size={36} className="mx-auto mb-3 text-slate-200" />
                  <p className="text-sm font-medium text-text-secondary">
                    No providers match your search
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setFilterStatus("all");
                    }}
                    className="mt-2 text-xs text-brand-primary hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filtered.map((provider) => (
                  <ProviderCard
                    key={provider._id ?? provider.WSUC_ID}
                    provider={provider}
                    onClick={() => setSelectedProvider(provider)}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}

      {selectedProvider && (
        <ProviderDetailModal
          provider={selectedProvider}
          rankings={rankings}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </div>
  );
}
