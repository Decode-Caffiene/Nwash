import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Database,
  Download,
  FileText,
  Globe2,
  LayoutDashboard,
  Sparkles,
  Users,
} from "lucide-react";

// Visible to every visitor regardless of auth state
export const publicNavLinks = [
  { label: "Overview", path: "/overview", icon: LayoutDashboard },
  { label: "Regulatory Roadmap", path: "/regulatory-roadmap", icon: BookOpen },
  { label: "Service Providers", path: "/service-providers", icon: Users },
  { label: "Map", path: "/gis-map", icon: Globe2 },
  {
    label: "Development Partners",
    path: "/development-partners",
    icon: BriefcaseBusiness,
  },
  { label: "Research & Exploration", path: "/research", icon: Sparkles },
  { label: "Analytics & Charts", path: "/analytics", icon: BarChart3 },
  { label: "Downloads & Reports", path: "/downloads", icon: Download },
];

// Shown only to non-admin (normal) users
export const dataEntryLink = {
  label: "Data Entry Forms",
  path: "/data-entry",
  icon: FileText,
};

// Shown only to authenticated admins (replaces Data Entry in the sidebar)
export const adminNavLinks = [
  { label: "View Uploaded Data", path: "/view-data", icon: Database },
];

// Legacy default export kept so any import that still uses the old shape
// doesn't break before it gets updated.
const navLinks = [...publicNavLinks, dataEntryLink];
export default navLinks;
