import React, { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Users2,
  Droplet,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

import useFetch from "../../hooks/useFetch";
import { getServiceProviders } from "../../api/serviceProviderApi";

import StatCard from "../../components/overview-components/StatCard";
import DistrictChart from "../../components/charts/DistrictChart";
import ComplianceChart from "../../components/charts/ComplianceChart";
import RecentActivity from "../../components/overview-components/RecentActivity";
import PartnerContributions from "../../components/overview-components/PartnerContributions";
import ErrorMessage from "../../components/common/ErrorMessage";

import { PARTNERS } from "../../pages/DevelopmentPartners/data/partnersData";
import { recentActivities } from "../../utils/overviewData";
import { categorizeProviders, calculateZoneStats } from "../../utils/zoneAnalytics";

export default function OverviewPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading, error } = useFetch(getServiceProviders, [refreshKey]);
  const list = Array.isArray(data) ? data : [];

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // 1. Total Operators - from backend
  const totalOperators = list.length;

  // 2. Compliance Rate - calculated from SPI data
  const complianceRate = useMemo(() => {
    if (!list.length) return 0;
    const valid = list.filter((p) => p?.Summary_Index?.SPI != null).length;
    return (valid / list.length) * 100;
  }, [list]);

  // Transform data for zone analysis
  const chartDataForZones = useMemo(() => {
    return list
      .filter(
        (item) =>
          item?.Summary_Index?.OEI != null &&
          item?.Summary_Index?.SPI != null
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
      districtData: Object.values(districtMap).sort((a, b) => b.Operators - a.Operators),
      excludedCount: excluded,
    };
  }, [list]);

  // 4. Compliance Data - calculated from SPI ranges
  const pieData = useMemo(() => {
    const compliant = list.filter((p) => p?.Summary_Index?.SPI >= 80).length;
    const partial = list.filter(
      (p) => p?.Summary_Index?.SPI >= 50 && p?.Summary_Index?.SPI < 80
    ).length;
    const nonCompliant = list.filter(
      (p) => p?.Summary_Index?.SPI && p?.Summary_Index?.SPI < 50
    ).length;

    return [
      { name: "Compliant (≥80%)", value: compliant, color: "#0d9488" },
      { name: "Partial (50-79%)", value: partial, color: "#3b82f6" },
      { name: "Non-Compliant (<50%)", value: nonCompliant, color: "#dc2626" },
    ];
  }, [list]);

  // 5. Active Partners - count unique regulatory partners in provinces where providers exist
  const activepartnersCount = useMemo(() => {
    const regulatoryPartners = ["wb", "adb", "unicef", "wateraid", "giz", "eu", "sdc", "usaid"];
    const providerProvinces = new Set(
      list.map((p) => p.Location?.Province_Name).filter(Boolean)
    );

    const mappedPartners = new Set();
    PARTNERS.filter((p) => regulatoryPartners.includes(p.id)).forEach((partner) => {
      if (partner.provinces.some((p) => providerProvinces.has(p))) {
        mappedPartners.add(partner.id);
      }
    });

    return mappedPartners.size;
  }, [list]);

  // 6. Total Population Served - sum from all providers (if data available)
  const populationServed = useMemo(() => {
    const total = list.reduce((sum, provider) => {
      const population =
        provider.MasterSheet?.Population_Served ||
        provider["total-number-of-population-served"] ||
        provider["Total number of population served?"] ||
        0;

      return sum + (Number(population) || 0);
    }, 0);

    if (total > 1000000) {
      return `${(total / 1000000).toFixed(1)}M`;
    } else if (total > 1000) {
      return `${(total / 1000).toFixed(0)}K`;
    }
    return total.toString();
  }, [list]);

  // 7. Partner Contributions - Only core regulatory roadmap partners
  const partnerContributions = useMemo(() => {
    const regulatoryPartners = ["wb", "adb", "unicef", "wateraid", "giz", "eu", "sdc", "usaid"];
    return PARTNERS.filter((p) => regulatoryPartners.includes(p.id)).map(
      (partner) => ({
        name: partner.name,
        projects: partner.activeProjects,
        funding: partner.investment,
      })
    );
  }, []);

  return (
    <div className="p-6 space-y-6 bg-[#f8fafc] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview Dashboard</h1>
          <p className="text-sm text-slate-500">
            Water supply and sanitation regulatory system
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          title="Refresh real-time data"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {error && <ErrorMessage />}

      <div className="grid gap-4 lg:grid-cols-5">
        <StatCard
          title="Total Operators"
          value={loading ? "—" : totalOperators}
          subtitle="+12% growth"
          icon={Building2}
        />

        <StatCard
          title="Compliance Rate"
          value={`${complianceRate.toFixed(1)}%`}
          subtitle="Improving trend"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <StatCard
          title="Partners"
          value={loading ? "—" : activepartnersCount}
          subtitle="Active agencies"
          icon={Users2}
        />

        <StatCard
          title="Population"
          value={loading ? "—" : populationServed}
          subtitle="Served users"
          icon={Droplet}
        />

        <StatCard
          title="Milestones"
          value="8"
          subtitle="1 completed"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
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

        <StatCard
          title="Dev. Partners"
          value={loading ? "—" : activepartnersCount}
          subtitle="Active partners"
          icon={Users2}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <DistrictChart data={districtData} excludedCount={excludedCount} totalOperators={totalOperators} />
        <ComplianceChart data={pieData} />
        <RecentActivity activities={recentActivities} />
      </div>

      <PartnerContributions partners={partnerContributions} />
    </div>
  );
}
