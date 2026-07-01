import React, { useMemo } from "react";
import { Building2, Users2, Droplet, TrendingUp, Search } from "lucide-react";

import useFetch from "../../hooks/useFetch";
import { getServiceProviders } from "../../api/serviceProviderApi";

import StatCard from "../../components/overview-components/StatCard";
import DistrictChart from "../../components/charts/DistrictChart";
import RecentActivity from "../../components/overview-components/RecentActivity";
import ErrorMessage from "../../components/common/ErrorMessage";
import PartnerContributions from "../../components/overview-components/PartnerContributions";
import ComplianceChart from "../../components/charts/ComplianceChart";

import {
  recentActivities,
  partnerContributions,
} from "../../utils/overviewData";
import { categorizeProviders } from "../../utils/zoneAnalytics";

export default function OverviewPage() {
  const { data, loading, error } = useFetch(getServiceProviders, []);
  const list = Array.isArray(data) ? data : [];

  // 1. Total Operators - from backend
  const totalOperators = list.length;

  // Transform data for zone analysis
  const chartDataForZones = useMemo(() => {
    return list
      .filter(
        (item) =>
          item?.Summary_Index?.OEI != null && item?.Summary_Index?.SPI != null,
      )
      .map((item) => ({
        ...item,
        x: item.Summary_Index.OEI,
        y: item.Summary_Index.SPI,
      }));
  }, [list]);

  // Categorize providers by zone
  const categorized = useMemo(() => {
    return categorizeProviders(chartDataForZones);
  }, [chartDataForZones]);

  // 3. Improving Operators - OEI 50-100 & SPI 50-100
  const improvingOperators = useMemo(() => {
    return categorized.IMPROVING?.length || 0;
  }, [categorized]);

  // 4. Poor/Very Poor Operators
  const poorVeryPoorOperators = useMemo(() => {
    const poor = categorized.POOR?.length || 0;
    const veryPoor = categorized.VERY_POOR?.length || 0;
    return poor + veryPoor;
  }, [categorized]);

  // 5. Missing Data - records without complete SPI/OEI
  const missingData = useMemo(() => {
    return list.length - chartDataForZones.length;
  }, [list, chartDataForZones]);

  // Compliance data derived from zone categorization
  const complianceData = useMemo(() => {
    const compliant = categorized.IMPROVING?.length || 0;
    const partial =
      (categorized.INACTIVE?.length || 0) +
      (categorized.ACTIVE?.length || 0);
    const nonCompliant =
      (categorized.VERY_POOR?.length || 0) +
      (categorized.POOR?.length || 0);
    return [
      { name: "Compliant", value: compliant, color: "#0d9488" },
      { name: "Partial", value: partial, color: "#3b82f6" },
      { name: "Non-Compliant", value: nonCompliant, color: "#dc2626" },
    ];
  }, [categorized]);

  // 6. Total Households Covered - placeholder (0) until backend provides data
  const totalHouseholdsCovered = useMemo(() => {
    return list.reduce((sum, provider) => {
      const households =
        provider.households_served ||
        provider["Number of households served by the WSUC"] ||
        provider.Service_Coverage?.Households_Served ||
        provider.Households_Served ||
        0;

      return sum + (Number(households) || 0);
    }, 0);
  }, [list]);

  // 3. District Data - calculated from provider locations
  const { districtData, excludedCount } = useMemo(() => {
    const districtMap = {};
    let excluded = 0;

    list.forEach((provider) => {
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
  }, [list]);

  // 5. Active Partners - count unique regulatory partners in provinces where providers exist

  // 6. Total Population Served - sum from all providers (if data available)
  const populationServed = useMemo(() => {
    const total = list.reduce((sum, provider) => {
      const population =
        provider.MasterSheet?.Population_Served ||
        provider["total-number-of-population-served"] ||
        provider["Total number of population served?"] ||
        provider["service-provider.kpi-2.total-number-of-population-served"] ||
        provider["service-provider-map.kpi-2.total-number-of-population-served"] ||
        provider.Population_Served ||
        provider.population_served ||
        0;

      return sum + (Number(population) || 0);
    }, 0);

    if (total === 0) return null;
    if (total > 1000000) {
      return `${(total / 1000000).toFixed(1)}M`;
    } else if (total > 1000) {
      return `${(total / 1000).toFixed(0)}K`;
    }
    return total.toString();
  }, [list]);

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
            subtitle="+12% growth"
            icon={Building2}
          />

          <StatCard
            title="Partners"
            value={loading ? "—" : partnerContributions.length}
            subtitle="Active agencies"
            icon={Users2}
          />

          <StatCard
            title="Population"
            value={loading ? "—" : (populationServed ?? "N/A")}
            subtitle={populationServed === null ? "Data pending" : "Served users"}
            icon={Droplet}
          />

          <StatCard
            title="Milestones"
            value="8"
            subtitle="1 completed"
            icon={TrendingUp}
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

          <StatCard
            title="Total Households"
            value={loading ? "—" : totalHouseholdsCovered}
            subtitle="Covered by WSUCs"
            icon={Users2}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>

        <div className="space-y-6">
          <DistrictChart
            data={districtData}
            excludedCount={excludedCount}
            totalOperators={totalOperators}
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <ComplianceChart data={complianceData} />
            <RecentActivity activities={recentActivities} />
          </div>

          <PartnerContributions partners={partnerContributions} />
        </div>
      </div>

    </div>
  );
}
