import { useMemo, useState } from "react";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import { getServiceProviders } from "../../api/serviceProviderApi";
import useFetch from "../../hooks/useFetch";

const displayValue = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  return String(value).trim() || "N/A";
};

const formatScore = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  return Number(value).toFixed(1);
};

const formatLabel = (label) =>
  label
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const formatDetailValue = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    if (value.length === 0) return "N/A";
    return value
      .map((item) => (isPlainObject(item) ? JSON.stringify(item) : item))
      .join(", ");
  }
  return String(value);
};

const ProviderDetailGrid = ({ title, entries }) => {
  const visibleEntries = entries.filter(
    ([, value]) => !isPlainObject(value) && !Array.isArray(value),
  );

  if (visibleEntries.length === 0) return null;

  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-primary">
        {title}
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {visibleEntries.map(([key, value]) => (
          <div
            key={key}
            className="rounded-lg border border-surface-border bg-surface px-3 py-2"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              {formatLabel(key)}
            </p>
            <p className="mt-1 break-words text-sm font-semibold text-text-primary">
              {formatDetailValue(value)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

const ProviderDetailsModal = ({ provider, onClose }) => {
  if (!provider) return null;

  const topLevelEntries = Object.entries(provider).filter(
    ([key]) => !key.startsWith("__"),
  );
  const primaryEntries = topLevelEntries.filter(
    ([, value]) => !isPlainObject(value) && !Array.isArray(value),
  );
  const groupedEntries = topLevelEntries.filter(([, value]) =>
    isPlainObject(value),
  );
  const arrayEntries = topLevelEntries.filter(([, value]) =>
    Array.isArray(value),
  );

  return (
    <Modal
      isOpen={Boolean(provider)}
      onClose={onClose}
      title={displayValue(provider.WSUC_Name)}
      className="max-w-4xl"
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info">ID: {displayValue(provider.WSUC_ID)}</Badge>
          <Badge
            variant={
              provider.Service_Coverage_Prerequisite === "Yes"
                ? "success"
                : "default"
            }
          >
            Coverage: {displayValue(provider.Service_Coverage_Prerequisite)}
          </Badge>
        </div>

        <ProviderDetailGrid title="Provider Details" entries={primaryEntries} />

        {groupedEntries.map(([groupName, groupValue]) => (
          <ProviderDetailGrid
            key={groupName}
            title={formatLabel(groupName)}
            entries={Object.entries(groupValue)}
          />
        ))}

        {arrayEntries.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-primary">
              Additional Records
            </h3>
            <div className="mt-3 space-y-3">
              {arrayEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-lg border border-surface-border bg-surface px-3 py-2"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                    {formatLabel(key)}
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold text-text-primary">
                    {formatDetailValue(value)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
};

function ServiceProvidersPage() {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const { data, loading, error } = useFetch(
    getServiceProviders,
    [],
  );
  const providers = Array.isArray(data) ? data : [];

  const stats = useMemo(() => {
    const provinceCount = new Set(
      providers
        .map((provider) => provider.Location?.Province_Name?.trim())
        .filter(Boolean),
    ).size;

    return [
      { label: "Total WSUCs", value: providers.length },
      { label: "Provinces Covered", value: provinceCount },
      {
        label: "With SPI Data",
        value: providers.filter(
          (provider) => provider.Summary_Index?.SPI !== null &&
            provider.Summary_Index?.SPI !== undefined,
        ).length,
      },
      {
        label: "Coverage Ready",
        value: providers.filter(
          (provider) => provider.Service_Coverage_Prerequisite === "Yes",
        ).length,
      },
    ];
  }, [providers]);

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

      {loading && <Loader text="Loading service providers..." />}

      {error && (
        <div className="stat-card border-status-error/30 bg-red-50">
          <p className="text-sm font-semibold text-status-error">
            Could not load service provider data
          </p>
          <p className="mt-2 text-sm text-text-secondary">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="stat-card">
                <p className="text-sm text-text-secondary">{item.label}</p>
                <p className="mt-3 text-2xl font-bold text-text-primary">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <section className="stat-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
                  WSUC Registry
                </p>
                <h2 className="mt-2 text-xl font-semibold text-text-primary">
                  Hosted service provider records
                </h2>
              </div>
              <Badge variant="info">{providers.length} records</Badge>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {providers.map((provider) => {
                const location = provider.Location || {};
                const summary = provider.Summary_Index || {};
                const coverageReady =
                  provider.Service_Coverage_Prerequisite === "Yes";
                const metrics = [
                  {
                    label: "Water Quality",
                    value: formatScore(summary.Water_Quality_Score),
                  },
                  {
                    label: "Reliability",
                    value: formatScore(summary.Reliability_Score),
                  },
                  { label: "SPI", value: displayValue(summary.SPI) },
                  { label: "OEI", value: displayValue(summary.OEI) },
                ];

                return (
                  <article
                    key={provider._id || provider.WSUC_ID}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedProvider(provider)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedProvider(provider);
                      }
                    }}
                    className="cursor-pointer rounded-lg border border-surface-border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                          {displayValue(provider.WSUC_ID)}
                        </p>
                        <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-text-primary">
                          {displayValue(provider.WSUC_Name)}
                        </h3>
                      </div>
                      <Badge variant={coverageReady ? "success" : "default"}>
                        {displayValue(provider.Service_Coverage_Prerequisite)}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-surface-border pt-4 text-sm">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                          Province
                        </p>
                        <p className="mt-1 font-medium text-text-primary">
                          {displayValue(location.Province_Name)}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                            District
                          </p>
                          <p className="mt-1 font-medium text-text-primary">
                            {displayValue(location.District_Name)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                            Municipality
                          </p>
                          <p className="mt-1 font-medium text-text-primary">
                            {displayValue(location.Municipality_Name)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {metrics.map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded-lg bg-surface px-3 py-2"
                        >
                          <p className="text-xs font-medium text-text-secondary">
                            {metric.label}
                          </p>
                          <p className="mt-1 text-base font-semibold text-text-primary">
                            {metric.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <ProviderDetailsModal
            provider={selectedProvider}
            onClose={() => setSelectedProvider(null)}
          />
        </>
      )}
    </div>
  );
}

export default ServiceProvidersPage;
