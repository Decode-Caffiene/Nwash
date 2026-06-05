import {
  ArrowRight,
  Check,
  Clock3,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useRef } from "react";
import Badge from "../../components/common/Badge";

const roadmapStats = [
  { label: "Total Phases", value: "8", trend: "+2 this quarter" },
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
  {
    name: "Policy Drafting",
    quarter: "Q1 2024",
    status: "complete",
    description:
      "Comprehensive policy framework development and initial documentation preparation for water supply and sanitation regulatory framework.",
    partners: [
      {
        name: "World Bank",
        logo: "https://www.worldbank.org/content/dam/worldbankorg-corporate/logo/wb-logo-horizontal-blue.png",
      },
      {
        name: "UNDP",
        logo: "https://www.undp.org/sites/g/files/zskgke326/files/media/image/2023/12/undp_logo_english_blue.png",
      },
    ],
  },
  {
    name: "Stakeholder Review",
    quarter: "Q2 2024",
    status: "complete",
    description:
      "Consultation with government agencies, water utilities, NGOs, and community representatives to gather feedback on proposed policies.",
    partners: [
      {
        name: "UNICEF",
        logo: "https://www.unicef.org/sites/default/files/styles/logo/public/2020-05/unicef-logo.png",
      },
      {
        name: "WaterAid Nepal",
        logo: "https://www.wateraid.org/sites/default/files/2023-08/WaterAid-logo%40320px%20%281%29.png",
      },
    ],
  },
  {
    name: "Field Pilots",
    quarter: "Q3 2024",
    status: "current",
    description:
      "Testing regulatory framework implementation in selected districts to identify challenges and refine processes based on field experience.",
    partners: [
      {
        name: "UNDP",
        logo: "https://www.undp.org/sites/g/files/zskgke326/files/media/image/2023/12/undp_logo_english_blue.png",
      },
      {
        name: "World Bank",
        logo: "https://www.worldbank.org/content/dam/worldbankorg-corporate/logo/wb-logo-horizontal-blue.png",
      },
      {
        name: "NWSC",
        logo: "https://upload.wikimedia.org/wikipedia/en/4/41/Nepal_Water_Supply_Corporation_logo.png",
      },
    ],
  },
  {
    name: "Monitoring Rollout",
    quarter: "Q4 2024",
    status: "upcoming",
    description:
      "Nationwide implementation of monitoring systems and compliance tracking mechanisms across all water service providers.",
    partners: [
      {
        name: "ADB",
        logo: "https://www.adb.org/sites/default/files/styles/800px_medium/public/adb-logo.png",
      },
      {
        name: "HELVETAS",
        logo: "https://www.helvetas.org/sites/default/files/media/2022-07/HELVETAS_logo_cmyk_pos_0.jpg",
      },
    ],
  },
  {
    name: "Compliance Audit",
    quarter: "Q1 2025",
    status: "upcoming",
    description:
      "Independent assessment of service provider compliance with established regulatory standards and performance benchmarks.",
    partners: [
      {
        name: "World Bank",
        logo: "https://www.worldbank.org/content/dam/worldbankorg-corporate/logo/wb-logo-horizontal-blue.png",
      },
      {
        name: "UNICEF",
        logo: "https://www.unicef.org/sites/default/files/styles/logo/public/2020-05/unicef-logo.png",
      },
    ],
  },
  {
    name: "Capacity Building",
    quarter: "Q2 2025",
    status: "upcoming",
    description:
      "Training programs for regulatory staff, utility managers, and government officials on new frameworks and best practices.",
    partners: [
      {
        name: "UNDP",
        logo: "https://www.undp.org/sites/g/files/zskgke326/files/media/image/2023/12/undp_logo_english_blue.png",
      },
      {
        name: "NORAD",
        logo: "https://www.norad.no/en/about/profile-and-values/~/media/Files/Bilder/NORAD/norad_logo_rgb_red.ashx",
      },
    ],
  },
  {
    name: "Impact Assessment",
    quarter: "Q3 2025",
    status: "upcoming",
    description:
      "Comprehensive evaluation of regulatory implementation impact on service quality, operational efficiency, and customer satisfaction metrics.",
    partners: [
      {
        name: "World Bank",
        logo: "https://www.worldbank.org/content/dam/worldbankorg-corporate/logo/wb-logo-horizontal-blue.png",
      },
      {
        name: "ADB",
        logo: "https://www.adb.org/sites/default/files/styles/800px_medium/public/adb-logo.png",
      },
    ],
  },
  {
    name: "Sustainability Planning",
    quarter: "Q4 2025",
    status: "upcoming",
    description:
      "Development of long-term sustainability strategies and institutionalization of regulatory framework for continued success and scalability.",
    partners: [
      {
        name: "UNDP",
        logo: "https://www.undp.org/sites/g/files/zskgke326/files/media/image/2023/12/undp_logo_english_blue.png",
      },
      {
        name: "UNICEF",
        logo: "https://www.unicef.org/sites/default/files/styles/logo/public/2020-05/unicef-logo.png",
      },
      {
        name: "WaterAid Nepal",
        logo: "https://www.wateraid.org/sites/default/files/2023-08/WaterAid-logo%40320px%20%281%29.png",
      },
    ],
  },
];

function PhaseModal({ phase, isOpen, onClose }) {
  if (!isOpen || !phase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{phase.name}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-100"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Quarter */}
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wide">
              Timeline
            </p>
            <p className="mt-1 text-sm text-slate-700">{phase.quarter}</p>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wide">
              Description
            </p>
            <p className="mt-1 text-sm text-slate-700 leading-relaxed">
              {phase.description}
            </p>
          </div>

          {/* Partners */}
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500 tracking-wide mb-3">
              Development Partners
            </p>
            <div className="flex flex-wrap gap-4">
              {phase.partners.map((partner) => (
                <div
                  key={partner.name}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="h-16 w-16 bg-white border-2 border-slate-200 rounded-lg p-1 flex items-center justify-center overflow-hidden">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f1f5f9' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='20' fill='%23094a4a' text-anchor='middle' dominant-baseline='middle' font-weight='bold'%3E" +
                          partner.name.substring(0, 3) +
                          "%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 text-center max-w-[80px] font-medium">
                    {partner.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function RegulatoryRoadmapPage() {
  const [selectedPhase, setSelectedPhase] = useState(null);
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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
              Current roadmap status - Click on any phase for details
            </h2>
          </div>
          <Badge variant="success">71% progress</Badge>
        </div>

        {/* Scrollable Phases Container */}
        <div className="mt-6 relative">
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>

          {/* Scrollable Content */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide"
          >
            <div className="flex gap-4 px-12 py-2 relative">
              {phases.map((phase, index) => (
                <div key={phase.name} className="flex items-start gap-2">
                  <div
                    className="flex-shrink-0 w-56 cursor-pointer group"
                    onClick={() => setSelectedPhase(phase)}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all group-hover:scale-110 ${
                            phase.status === "complete"
                              ? "border-brand-primary bg-brand-primary text-white"
                              : phase.status === "current"
                                ? "border-sky-500 bg-white text-sky-500 shadow-md"
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
                      <div className="mt-4 rounded-lg bg-slate-50 p-3 group-hover:bg-slate-100 transition-colors">
                        <p className="text-sm font-semibold text-text-primary">
                          {phase.name}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {phase.quarter}
                        </p>
                        <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                          Click for details
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Green connecting line */}
                  {index < phases.length - 1 && (
                    <div className="flex items-center justify-center h-12 -mx-2">
                      <div className="h-1 w-6 bg-brand-primary" />
                    </div>
                  )}
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

      {/* Phase Modal */}
      <PhaseModal
        phase={selectedPhase}
        isOpen={!!selectedPhase}
        onClose={() => setSelectedPhase(null)}
      />

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
