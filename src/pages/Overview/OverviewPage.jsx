import { Building2, Droplet, TrendingUp, Users2 } from "lucide-react";
import { PARTNERS } from "../DevelopmentPartners/data/partnersData";

import StatCard from "../../components/overview-components/StatCard";
import DistrictChart from "../../components/charts/DistrictChart";
import ErrorMessage from "../../components/common/ErrorMessage";
import ComplianceChart from "../../components/charts/ComplianceChart";
import ProvinceComplianceDonut from "../../components/charts/ProvinceComplianceDonut";
import TopHouseholdsChart from "../../components/charts/TopHouseholdsChart";

import { useOverviewData } from "./hooks/useOverviewData";

export default function OverviewPage() {
  const {
    loading,
    error,
    totalOperators,
    improvingOperators,
    poorVeryPoorOperators,
    missingData,
    businessPlanData,
    totalHouseholdsCovered,
    districtData,
    excludedCount,
    topHHProviders,
    provinceComplianceData,
  } = useOverviewData();

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
        </div>
      </div>
    </div>
  );
}
