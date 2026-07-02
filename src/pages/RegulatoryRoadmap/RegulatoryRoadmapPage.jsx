import { LayoutList, CheckCircle2, Clock, Target } from "lucide-react";
import ImplementationTimeline from "./components/ImplementationTimeline";

const roadmapStats = [
  {
    label: "Total Phases",
    value: "8",
    icon: LayoutList,
    color: "text-brand-primary",
    bg: "bg-brand-light",
    subtext: "Complete roadmap",
  },
  {
    label: "Completed",
    value: "1",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    subtext: "Phase 1 finalized",
  },
  {
    label: "In Progress",
    value: "5",
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
    subtext: "Phases 2\u20136 active",
  },
  {
    label: "Remaining",
    value: "2",
    icon: Target,
    color: "text-slate-500",
    bg: "bg-slate-100",
    subtext: "Phases 7\u20138 pending",
  },
];

function RegulatoryRoadmapPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">
            Regulatory Roadmap
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            National roadmap for water regulation
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-blue-100">
            Track implementation milestones, policy adoption, and district-level
            rollout progress across the RRPCD program.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roadmapStats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-xl bg-white border border-surface-border p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    {item.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-text-primary">
                    {item.value}
                  </p>
                </div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${item.bg} shrink-0`}>
                  <Icon size={20} className={item.color} />
                </div>
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                {item.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* Implementation Timeline Component */}
      <div className="rounded-xl bg-white border border-surface-border p-6 shadow-sm">
        <ImplementationTimeline />
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

export default RegulatoryRoadmapPage;
