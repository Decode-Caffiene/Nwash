import React, { useMemo } from "react";
import { Building2, Users2, Droplet, TrendingUp } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getProviderSearchText, normalizeQuery } from "./overviewSearchUtils";

import useFetch from "../../hooks/useFetch";
import { getServiceProviders } from "../../api/serviceProviderApi";
// import { getFormData } from "../../api/formApi";
import { PARTNERS } from "../DevelopmentPartners/data/partnersData";

import StatCard from "../../components/overview-components/StatCard";
import DistrictChart from "../../components/charts/DistrictChart";
import RecentActivity from "../../components/overview-components/RecentActivity";
import ErrorMessage from "../../components/common/ErrorMessage";
import ComplianceChart from "../../components/charts/ComplianceChart";
import ProvinceComplianceDonut from "../../components/charts/ProvinceComplianceDonut";
import TopHouseholdsChart from "../../components/charts/TopHouseholdsChart";

// Groups projects that have both valid OEI and SPI by province.
// Returns data sorted descending by project count, ready for a donut chart.
function buildProvinceComplianceData(projects) {
  const groups = {};
  for (const p of projects) {
    const si = p.Summary_Index ?? {};
    const oei = Number(si.OEI);
    const spi = Number(si.SPI);
    if (!Number.isFinite(oei) || !Number.isFinite(spi)) continue;

    const rawProvince = p.Location?.Province_Name;

    if (typeof rawProvince !== "string") {
      console.error(
        "Non-string Province_Name:",
        rawProvince,
        typeof rawProvince,
        p,
      );
    }

    const province = String(rawProvince ?? "").trim();
    if (!province) continue;

    if (!groups[province])
      groups[province] = { oeiSum: 0, spiSum: 0, count: 0 };
    groups[province].oeiSum += oei;
    groups[province].spiSum += spi;
    groups[province].count += 1;
  }

  return Object.entries(groups)
    .map(([province, { oeiSum, spiSum, count }]) => ({
      province,
      projects: count,
      averageOEI: oeiSum / count,
      averageSPI: spiSum / count,
    }))
    .sort((a, b) => b.projects - a.projects);
}
import {
  buildAnalyticsPointData,
  categorizeProviders,
  extractPopulationValue,
} from "../../utils/zoneAnalytics";

export default function OverviewPage() {
  const location = useLocation();
  const { data, loading, error } = useFetch(getServiceProviders, []);
  const list = Array.isArray(data) ? data : [];
  console.log("data", data);
  // Fetch real form submissions for Recent Activity
  // const { data: submissionsRaw } = useFetch(getFormData, []);
  // const recentActivities = useMemo(() => {
  //   const raw = Array.isArray(submissionsRaw)
  //     ? submissionsRaw
  //     : Array.isArray(submissionsRaw?.message)
  //       ? submissionsRaw.message
  //       : [];

  //   const statusColor = (status) => {
  //     const s = (status ?? "").toLowerCase();
  //     if (s === "accepted") return "bg-green-500";
  //     if (s === "rejected") return "bg-red-500";
  //     if (s === "pending") return "bg-amber-500";
  //     return "bg-blue-500";
  //   };

  //   const formatTime = (ts) => {
  //     if (!ts) return "";
  //     const diff = Date.now() - new Date(ts).getTime();
  //     const mins = Math.floor(diff / 60000);
  //     if (mins < 60) return `${mins}m ago`;
  //     const hrs = Math.floor(mins / 60);
  //     if (hrs < 24) return `${hrs}h ago`;
  //     return `${Math.floor(hrs / 24)}d ago`;
  //   };

  //   const sorted = raw.slice().sort((a, b) => {
  //     if (!a.createdAt && !b.createdAt) return 0;
  //     if (!a.createdAt) return 1;
  //     if (!b.createdAt) return -1;
  //     return new Date(b.createdAt) - new Date(a.createdAt);
  //   });

  //   return sorted.map((item) => ({
  //     id: item._id,
  //     title: item.WSUC_Name ?? item.Operator_Info?.Name ?? "Unnamed Submission",
  //     desc: [item.Operator_Info?.Name, item.Location?.District_Name]
  //       .filter(Boolean)
  //       .join(" · "),
  //     time: formatTime(item.createdAt),
  //     color: statusColor(item.Status),
  //   }));
  // }, [submissionsRaw]);

  const q = useMemo(() => {
    try {
      const sp = new URLSearchParams(location.search);
      return normalizeQuery(sp.get("q"));
    } catch {
      return "";
    }
  }, [location.search]);

  const filteredList = useMemo(() => {
    if (!q) return list;
    return list.filter((provider) => {
      const haystack = getProviderSearchText(provider);
      return haystack.includes(q);
    });
  }, [list, q]);

  // 1. Total Operators - from backend (filtered)
  const totalOperators = filteredList.length;

  // Transform data for zone analysis (filtered)
  const chartDataForZones = useMemo(() => {
    return filteredList
      .map((item) => buildAnalyticsPointData(item))
      .filter(Boolean);
  }, [filteredList]);

  // Categorize providers by zone
  const categorized = useMemo(() => {
    return categorizeProviders(chartDataForZones);
  }, [chartDataForZones]);

  const allImproving = useMemo(() => {
    return categorized.IMPROVING?.length || 0;
  }, [categorized]);

  // 3. Improving Operators - total in top-right quadrant
  const improvingOperators = allImproving;

  // 4. Poor/Very Poor Operators
  const poorVeryPoorOperators = useMemo(() => {
    const poor = categorized.POOR?.length || 0;
    const veryPoor = categorized.VERY_POOR?.length || 0;
    return poor + veryPoor;
  }, [categorized]);

  // 5. Missing Data - records without complete SPI/OEI
  const missingData = useMemo(() => {
    return filteredList.length - chartDataForZones.length;
  }, [filteredList, chartDataForZones]);

  // Business Plan Presence — counts providers where Service_Coverage_Prerequisite is "Yes" or "No"
  const businessPlanData = useMemo(() => {
    let hasPlan = 0;
    let noPlan = 0;
    for (const p of filteredList) {
      const val = p.Service_Coverage_Prerequisite;
      if (val === "Yes") hasPlan++;
      else if (val === "No") noPlan++;
    }
    return [
      { name: "Have Business Plan", value: hasPlan, color: "#0d9488" },
      { name: "Do Not Have Business Plan", value: noPlan, color: "#dc2626" },
    ];
  }, [filteredList]);

  // Total Households Covered — checks Master_Sheet first (live API path)
  const totalHouseholdsCovered = useMemo(() => {
    return filteredList.reduce((sum, provider) => {
      const households =
        provider.Master_Sheet?.HH_Served ??
        provider.households_served ??
        provider["Number of households served by the WSUC"] ??
        provider.Service_Coverage?.Households_Served ??
        provider.Households_Served ??
        0;
      return sum + (Number(households) || 0);
    }, 0);
  }, [filteredList]);

  // 3. District Data - calculated from provider locations
  const { districtData, excludedCount } = useMemo(() => {
    const districtMap = {};
    let excluded = 0;

    filteredList.forEach((provider) => {
      // Try to get district and province from multiple possible field names
      const district =
        provider.Location?.District_Name ||
        provider.District ||
        provider.district ||
        null;

      const province =
        provider.Location?.Province_Name ||
        provider.Province ||
        provider.province ||
        null;

      if (district && province) {
        const key = `${district}-${province}`;
        if (!districtMap[key]) {
          districtMap[key] = {
            name: district,
            Province: province,
            Operators: 0,
          };
        }
        districtMap[key].Operators += 1;
      } else {
        excluded += 1;
      }
    });

    return {
      districtData: Object.values(districtMap).sort(
        (a, b) => b.Operators - a.Operators,
      ),
      excludedCount: excluded,
    };
  }, [filteredList]);

  // Top 5 service providers ranked by HH_Served
  const topHHProviders = useMemo(() => {
    return filteredList
      .map((p) => ({
        name: p.WSUC_Name || "Unknown",
        value: Number(p.Master_Sheet?.HH_Served),
      }))
      .filter(({ value }) => Number.isFinite(value) && value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredList]);

  // Province-wise distribution for donut chart — computed once per list change
  const provinceComplianceData = useMemo(
    () => buildProvinceComplianceData(list),
    [list],
  );

  // 5. Active Partners - count unique regulatory partners in provinces where providers exist

  // 6. Total Population Served - use direct backend population fields when available,
  // otherwise fall back to a household-based estimate so the card still displays data.
  const populationServed = useMemo(() => {
    const total = filteredList.reduce((sum, provider) => {
      const population = extractPopulationValue(provider);
      return sum + (Number(population) || 0);
    }, 0);

    if (total === 0) return null;
    if (total > 1000000) {
      return `${(total / 1000000).toFixed(1)}M`;
    } else if (total > 1000) {
      return `${(total / 1000).toFixed(0)}K`;
    }
    return total.toString();
  }, [filteredList]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f8fafc]">
      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Overview Dashboard</h1>
            <p className="text-sm text-slate-500">
              Water supply and sanitation regulatory system
            </p>
          </div>
        </div>

        {error && <ErrorMessage />}

        <div className="grid gap-4 lg:grid-cols-4">
          <StatCard
            title="Total Operators"
            value={loading ? "—" : totalOperators}
            icon={Building2}
          />

          <StatCard
            title="Partners"
            value={PARTNERS.length}
            subtitle="Active agencies"
            icon={Users2}
          />

          <StatCard
            title="Household Covered"
            value={
              loading ? "—" : Number(totalHouseholdsCovered).toLocaleString()
            }
            subtitle="Covered by WSUCs"
            icon={Users2}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <StatCard
            title="Improving Operators"
            value={loading ? "—" : improvingOperators}
            subtitle="High performance"
            icon={TrendingUp}
            iconBg="bg-yellow-50"
            iconColor="text-yellow-600"
          />

          <StatCard
            title="Poor/Very Poor"
            value={loading ? "—" : poorVeryPoorOperators}
            subtitle="Need improvement"
            icon={Building2}
            iconBg="bg-red-50"
            iconColor="text-red-600"
          />

          <StatCard
            title="Missing Data"
            value={loading ? "—" : missingData}
            subtitle="Incomplete records"
            icon={Droplet}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
          />
        </div>

        <div className="space-y-6">
          <DistrictChart
            data={districtData}
            excludedCount={excludedCount}
            totalOperators={totalOperators}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <ComplianceChart
              data={businessPlanData}
              title="Business Plan Presence"
              subtitle="Distribution by business plan submission"
            />
            <ProvinceComplianceDonut data={provinceComplianceData} />
          </div>

          <TopHouseholdsChart data={topHHProviders} />
          {/* 
          <RecentActivity activities={recentActivities} /> */}
        </div>
      </div>
    </div>
  );
}
