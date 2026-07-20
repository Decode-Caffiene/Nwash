import {
  Award,
  BarChart3,
  Database,
  Droplets,
  Shield,
  ShieldCheck,
  Star,
  TrendingDown,
} from "lucide-react";

export const STATUS = {
  noScore: {
    gradient: "bg-gradient-to-br from-red-50 to-rose-100",
    border: "border-red-200",
    stripe: "bg-red-400",
    dot: "#f87171",
    label: "Score Missing",
    badgeCls: "bg-red-100 text-red-700 border-red-200",
  },
  noBP: {
    gradient: "bg-gradient-to-br from-orange-50 to-amber-100",
    border: "border-orange-200",
    stripe: "bg-orange-400",
    dot: "#fb923c",
    label: "Business Plan Missing",
    badgeCls: "bg-orange-100 text-orange-700 border-orange-200",
  },
  complete: {
    gradient: "bg-gradient-to-br from-emerald-50 to-green-100",
    border: "border-emerald-200",
    stripe: "bg-emerald-500",
    dot: "#34d399",
    label: "Complete",
    badgeCls: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

export const KPI_GRID = [
  { key: "Water_Quality_Score", label: "Water Quality", max: 100, icon: Droplets },
  { key: "Reliability_Score", label: "Hours Of Supply", unit: "hrs/day", max: 24, icon: Shield },
  { key: "Adequacy_Score", label: "Adequacy Score", max: 100, icon: BarChart3 },
  { key: "Metering_Ratio_Score", label: "Metering Ratio", max: 100, icon: Database },
  { key: "OM_Score", label: "O&M Score", unit: "", max: 2, icon: Star },
  { key: "NRW_Score", label: "NRW Score", max: 100, icon: TrendingDown, warn: true },
  { key: "Grievance_Score", label: "Grievance Score", max: 100, icon: ShieldCheck },
  { key: "Service_Coverage_Score", label: "Coverage Score", max: 100, icon: Award },
];

export const FILTER_TABS = [
  { key: "all", label: "All" },
  { key: "complete", label: "Complete" },
  { key: "noBP", label: "BP Missing" },
  { key: "noScore", label: "Score Missing" },
];

export const WATER_DROP_SVG =
  '<path d="M16 0 Q28 14 28 24 A12 12 0 0 1 4 24 Q4 14 16 0 Z"/>';
