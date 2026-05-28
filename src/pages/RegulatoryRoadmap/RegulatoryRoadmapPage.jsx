import { ArrowRight, Check, Clock3 } from "lucide-react";
import Badge from "../../components/common/Badge";

const roadmapStats = [
  { label: "Total Phases", value: "6", trend: "+2 this quarter" },
  { label: "Completed", value: "3", trend: "Green", tone: "success" },
  { label: "In Progress", value: "2", trend: "Blue", tone: "info" },
  {
    label: "Overall Progress",
    value: "71%",
    trend: "Target achieved",
    tone: "success",
  },
];

const phases = [
  { name: "Policy Drafting", quarter: "Q1 2024", status: "complete" },
  { name: "Stakeholder Review", quarter: "Q2 2024", status: "complete" },
  { name: "Field Pilots", quarter: "Q3 2024", status: "current" },
  { name: "Monitoring Rollout", quarter: "Q4 2024", status: "upcoming" },
  { name: "Compliance Audit", quarter: "Q1 2025", status: "upcoming" },
];

function RegulatoryRoadmapPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
          Regulatory Roadmap
        </p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">
          National roadmap for water regulation
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-text-secondary">
          Track implementation milestones, policy adoption, and district-level
          rollout progress across the RRPCD program.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roadmapStats.map((item) => (
          <div key={item.label} className="stat-card">
            <p className="text-sm text-text-secondary">{item.label}</p>
            <p className="mt-3 text-2xl font-bold text-text-primary">
              {item.value}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant={item.tone || "default"}>{item.trend}</Badge>
            </div>
          </div>
        ))}
      </div>

      <section className="stat-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
              Implementation Timeline
            </p>
            <h2 className="mt-2 text-xl font-semibold text-text-primary">
              Current roadmap status
            </h2>
          </div>
          <Badge variant="success">71% progress</Badge>
        </div>

        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-5 gap-4">
              {phases.map((phase, index) => (
                <div key={phase.name} className="text-center">
                  <div className="flex items-center justify-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                        phase.status === "complete"
                          ? "border-brand-primary bg-brand-primary text-white"
                          : phase.status === "current"
                            ? "border-sky-500 bg-white text-sky-500"
                            : "border-slate-300 bg-white text-slate-400"
                      }`}
                    >
                      {phase.status === "complete" ? (
                        <Check size={18} />
                      ) : (
                        <Clock3 size={18} />
                      )}
                    </div>
                  </div>
                  {index < phases.length - 1 && (
                    <div className="mx-auto mt-[-14px] h-1 w-full bg-brand-primary" />
                  )}
                  <p className="mt-4 text-sm font-semibold text-text-primary">
                    {phase.name}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {phase.quarter}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Next milestone
            </p>
            <p className="text-sm text-text-secondary">
              Field pilots expansion and data quality review
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary">
            <span>Open action plan</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </section>
    </div>
  );
}

export default RegulatoryRoadmapPage;
