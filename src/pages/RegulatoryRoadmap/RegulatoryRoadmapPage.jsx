import Badge from "../../components/common/Badge";
import ImplementationTimeline from "./components/ImplementationTimeline";

const roadmapStats = [
  { label: "Total Phases", value: "8" },
  { label: "Completed", value: "1", trend: "Green", tone: "success" },
  { label: "In Progress", value: "5", trend: "Blue", tone: "info" },
  
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

      {/* Implementation Timeline Component */}
      <div className="stat-card">
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
