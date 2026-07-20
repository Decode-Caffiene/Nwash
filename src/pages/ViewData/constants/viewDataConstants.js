import { AlertCircle, CheckCircle, Clock, FileText, XCircle } from "lucide-react";

export const PAGE_SIZE = 7;

export const STATUS_CFG = {
  accepted: {
    label: "Accepted",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    accent: "bg-emerald-400",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    accent: "bg-red-400",
    icon: XCircle,
  },
  pending: {
    label: "Pending Review",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    accent: "bg-amber-400",
    icon: Clock,
  },
};

export const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
];

export const STAT_CONFIG = [
  { key: "total", label: "Total", icon: FileText, color: "text-slate-600", bg: "bg-slate-100" },
  { key: "pending", label: "Pending Review", icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
  { key: "accepted", label: "Accepted", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-100" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-red-500", bg: "bg-red-100" },
];

export const TOAST_CFG = {
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    icon_color: "text-emerald-500",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon_color: "text-red-500",
  },
  info: {
    icon: AlertCircle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    icon_color: "text-amber-500",
  },
};
