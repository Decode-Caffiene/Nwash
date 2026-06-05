import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ChartColumnIncreasing,
  Download,
  Globe2,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
  FileText,
} from "lucide-react";

const navLinks = [
  { label: "Overview", path: "/overview", icon: LayoutDashboard },
  { label: "Regulatory Roadmap", path: "/regulatory-roadmap", icon: BookOpen },
  { label: "Service Providers", path: "/service-providers", icon: Users },
  { label: "GIS Intelligence Map", path: "/gis-map", icon: Globe2 },
  {
    label: "Development Partners",
    path: "/development-partners",
    icon: BriefcaseBusiness,
  },
  { label: "Research & Exploration", path: "/research", icon: Sparkles },
  { label: "Analytics & Charts", path: "/analytics", icon: BarChart3 },
  { label: "Downloads & Reports", path: "/downloads", icon: Download },
  { label: "Admin Panel", path: "/admin", icon: ShieldCheck },
  { label: "Data Entry Forms", path: "/data-entry", icon:   FileText },
];

export default navLinks;
