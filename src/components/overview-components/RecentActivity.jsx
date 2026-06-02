import React from "react";

export default function RecentActivity({ activities }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="text-base font-bold text-slate-900">
        Recent Activity
      </h3>

      <p className="text-xs text-slate-500 mb-5">
        Latest updates
      </p>

      <div className="space-y-4">
        {activities.map((a) => (
          <div key={a.id} className="flex gap-3 border-b pb-3">
            <span className={`w-2.5 h-2.5 rounded-full mt-1.5 ${a.color}`} />
            <div>
              <p className="text-sm font-bold">{a.title}</p>
              <p className="text-xs text-slate-400">{a.desc}</p>
              <p className="text-[11px] text-slate-300">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}