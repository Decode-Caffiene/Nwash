import { useMemo } from "react";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
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

function ServiceProvidersPage() {
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

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-surface-border bg-surface text-xs uppercase tracking-wide text-text-secondary">
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">WSUC Name</th>
                    <th className="px-4 py-3 font-semibold">Province</th>
                    <th className="px-4 py-3 font-semibold">District</th>
                    <th className="px-4 py-3 font-semibold">Municipality</th>
                    <th className="px-4 py-3 font-semibold">Water Quality</th>
                    <th className="px-4 py-3 font-semibold">Reliability</th>
                    <th className="px-4 py-3 font-semibold">SPI</th>
                    <th className="px-4 py-3 font-semibold">OEI</th>
                    <th className="px-4 py-3 font-semibold">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider) => {
                    const location = provider.Location || {};
                    const summary = provider.Summary_Index || {};

                    return (
                      <tr
                        key={provider._id || provider.WSUC_ID}
                        className="border-b border-surface-border last:border-0 hover:bg-surface"
                      >
                        <td className="px-4 py-3 font-medium text-text-primary">
                          {displayValue(provider.WSUC_ID)}
                        </td>
                        <td className="max-w-[260px] px-4 py-3 font-medium text-text-primary">
                          {displayValue(provider.WSUC_Name)}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {displayValue(location.Province_Name)}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {displayValue(location.District_Name)}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {displayValue(location.Municipality_Name)}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {formatScore(summary.Water_Quality_Score)}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {formatScore(summary.Reliability_Score)}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {displayValue(summary.SPI)}
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {displayValue(summary.OEI)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              provider.Service_Coverage_Prerequisite === "Yes"
                                ? "success"
                                : "default"
                            }
                          >
                            {displayValue(
                              provider.Service_Coverage_Prerequisite,
                            )}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default ServiceProvidersPage;
