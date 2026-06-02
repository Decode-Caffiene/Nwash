import React from "react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = "bg-slate-50",
  iconColor = "text-slate-500",
}) {
  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm flex justify-between items-start">
      <div className="space-y-1">
        <p className="text-xs text-slate-500 uppercase font-semibold">
          {title}
        </p>

        <p className="text-3xl font-bold text-slate-900">
          {value}
        </p>

        <p className="text-xs font-semibold text-emerald-600 pt-1">
          {subtitle}
        </p>
      </div>

      <div className={`p-2.5 rounded-lg ${iconBg} ${iconColor}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}