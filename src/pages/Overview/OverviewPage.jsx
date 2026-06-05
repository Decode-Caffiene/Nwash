import React, { useMemo } from "react";
import {
  Building2,
  CheckCircle2,
  Users2,
  Droplet,
  TrendingUp,
} from "lucide-react";

import useFetch from "../../hooks/useFetch";
import { getServiceProviders } from "../../api/serviceProviderApi";

import StatCard from "../../components/overview-components/StatCard";
import DistrictChart from "../../components/charts/DistrictChart";
import ComplianceChart from "../../components/charts/ComplianceChart";
import GrowthChart from "../../components/charts/GrowthChart";
import RecentActivity from "../../components/overview-components/RecentActivity";
import PartnerContributions from "../../components/overview-components/PartnerContributions";
import ErrorMessage from "../../components/common/ErrorMessage";

import {
  districtData,
  growthData,
  pieData,
  recentActivities,
  partnerContributions,
} from "../../utils/overviewData";

export default function OverviewPage() {
  const { data, loading, error } = useFetch(getServiceProviders, []);
  const list = Array.isArray(data) ? data : [];

  const totalOperators = list.length;

  const complianceRate = useMemo(() => {
    if (!list.length) return 0;

    const valid = list.filter((p) => p?.Summary_Index?.SPI != null).length;

    return (valid / list.length) * 100;
  }, [list]);

  return (
    <div className="p-6 space-y-6 bg-[#f8fafc] min-h-screen">
      <div>
        <h1 className="text-2xl font-bold">Overview Dashboard</h1>
        <p className="text-sm text-slate-500">
          Water supply and sanitation regulatory system
        </p>
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
          value="4"
          subtitle="Active agencies"
          icon={Users2}
        />

        <StatCard
          title="Population"
          value="1.2M"
          subtitle="Served users"
          icon={Droplet}
        />

        <StatCard
          title="Milestones"
          value="12"
          subtitle="8 completed"
          icon={TrendingUp}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <DistrictChart data={districtData} />
        <ComplianceChart data={pieData} />
        <GrowthChart data={growthData} />
        <RecentActivity activities={recentActivities} />
      </div>

      <PartnerContributions partners={partnerContributions} />
    </div>
  );
}
