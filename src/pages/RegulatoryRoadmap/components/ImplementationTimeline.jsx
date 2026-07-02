import React, { useState, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Gavel, BookOpen, Users, ShieldCheck,
  Search, Award, LayoutDashboard, FileText, CheckCircle2, Clock,
  CircleDot, ArrowRight
} from "lucide-react";
import PhaseModal from "./PhaseModal";

const phaseIcons = {
  1: Gavel,
  2: BookOpen,
  3: Users,
  4: ShieldCheck,
  5: Search,
  6: Award,
  7: LayoutDashboard,
  8: FileText,
};

const redCardConfig = {
  accentBar: "bg-gradient-to-r from-red-400 to-red-500",
  iconBg: "bg-red-100",
  iconColor: "text-red-600",
  badge: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  cardBorder: "border-red-200 hover:border-red-400",
};

const statusConfig = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    dotColor: "bg-emerald-500",
    accentBar: "bg-gradient-to-r from-emerald-400 to-emerald-500",
    cardBorder: "border-emerald-200 hover:border-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    stepperBg: "bg-emerald-500",
    stepperText: "text-white",
  },
  "in-progress": {
    label: "In Progress",
    icon: Clock,
    dotColor: "bg-blue-500",
    accentBar: "bg-gradient-to-r from-blue-400 to-blue-500",
    cardBorder: "border-blue-200 hover:border-blue-400",
    badge: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    stepperBg: "bg-blue-500",
    stepperText: "text-white",
  },
  pending: {
    label: "Pending",
    icon: CircleDot,
    dotColor: "bg-slate-300",
    accentBar: "bg-gradient-to-r from-slate-300 to-slate-400",
    cardBorder: "border-slate-200 hover:border-slate-300",
    badge: "bg-slate-50 text-slate-500 ring-1 ring-inset ring-slate-200",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-400",
    stepperBg: "bg-slate-200",
    stepperText: "text-slate-500",
  },
};

const implementationPhases = [
  {
    id: 1,
    title: "Legislation",
    status: "completed",
    shortDescription: "Operationalization of the WSS act and regulations.",
    developmentPartners: [],
    description: [
      "Operationalization of the WSS act and regulations.",
      "Establishment of the Service Regulation and Information Management Section.",
    ],
  },
  {
    id: 2,
    title: "Methodology",
    status: "in-progress",
    shortDescription:
      "Development of new methodology for KPI measurement in line with WSS regulations 2081.",
    developmentPartners: ["wateraid", "whh"],
    description: [
      "Development of new methodology for the KPI measurement in line with WSS regulations 2081.",
    ],
  },
  {
    id: 3,
    title: "Mobilization",
    status: "in-progress",
    shortDescription:
      "Workshops with service providers across seven provinces and KPI data collection.",
    developmentPartners: ["whh", "wateraid", "rrn", "unicef", "unhabitat"],
    description: [
      "Conducting three workshops targeting service providers from all seven provinces.",
      "Target number of Service Providers: 75.",
      "Data related to various KPIs collected.",
    ],
  },
  {
    id: 4,
    title: "Validation",
    status: "in-progress",
    shortDescription:
      "Independent validation of the methodology and collected data through field visits.",
    developmentPartners: ["unicef", "wateraid"],
    description: [
      "An independent validation of the methodology and the data through field visits to selected service operators from the workshop.",
    ],
  },
  {
    id: 5,
    title: "Research and Planning",
    status: "in-progress",
    shortDescription:
      "Data analysis of workshop and pilot service operators and development of business plan templates.",
    developmentPartners: [],
    description: [
      "Data analysis of the 75 (workshop) + 12 (pilot) service operators.",
      "Development of Business plan templates based on the data analysis results.",
    ],
  },
  {
    id: 6,
    title: "Incentivize",
    status: "in-progress",
    shortDescription:
      "Dissemination of business plan templates and prioritization based on readiness metrics.",
    developmentPartners: [],
    description: [
      "Dissemination of Business plan templates.",
      "DWSSM will prioritize the budget allocation to service providers based on the readiness metrics and availability of their business plan.",
    ],
  },
  {
    id: 7,
    title: "Governance",
    status: "pending",
    shortDescription:
      "Development of a live regulation dashboard with real-time reporting and partner contribution tracking.",
    developmentPartners: ["wateraid"],
    description: [
      "Development of a Live regulation dashboard.",
      "Reporting and milestone tracking in real time.",
      "Tracking of partner contributions and their ripples in regulation streamlining.",
    ],
  },
  {
    id: 8,
    title: "Publication and Policy",
    status: "pending",
    shortDescription:
      "Publication of research results and policy dialogues based on the framework.",
    developmentPartners: [],
    description: [
      "Publication of the results of the research and data analysis in a peer reviewed journal.",
      "Policy dialogues and referations based on the data analysis and resulting framework.",
    ],
  },
];

export default function ImplementationTimeline() {
  const [selectedPhase, setSelectedPhase] = useState(null);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          Implementation Timeline
        </h2>
        <p className="text-sm text-text-secondary mt-2">
          8-phase regulatory implementation roadmap for water supply and
          sanitation services
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="hidden lg:flex items-center px-6 py-4 bg-slate-50/80 rounded-xl border border-surface-border">
        {implementationPhases.map((phase, idx) => {
          const st = statusConfig[phase.status];
          const isRed = phase.id >= 4;
          return (
            <React.Fragment key={phase.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold shadow-sm transition-all ${
                    isRed
                      ? "bg-red-500 text-white"
                      : `${st.stepperBg} ${st.stepperText}`
                  }`}
                >
                  {phase.id}
                </div>
                <span className={`mt-1.5 text-[10px] font-semibold whitespace-nowrap ${
                  isRed ? "text-red-600" : st.iconColor
                }`}>
                  {phase.title}
                </span>
              </div>
              {idx < implementationPhases.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full ${
                  phase.id >= 3 && phase.id < 8 ? "bg-red-300" : "bg-slate-200"
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Timeline Cards */}
      <div className="relative">
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg border border-surface-border hover:bg-white hover:shadow-xl hover:scale-105 transition-all"
          aria-label="Scroll left"
        >
          <ChevronLeft size={18} className="text-slate-600" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg border border-surface-border hover:bg-white hover:shadow-xl hover:scale-105 transition-all"
          aria-label="Scroll right"
        >
          <ChevronRight size={18} className="text-slate-600" />
        </button>

        {/* Cards Container */}
        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-5 pb-2 min-w-max">
            {implementationPhases.map((phase) => {
              const PhaseIcon = phaseIcons[phase.id];
              const st = statusConfig[phase.status];
              const StatusIcon = st.icon;

              const isRed = phase.id >= 4;
              const cardStyle = isRed ? redCardConfig : st;

              return (
                <div
                  key={phase.id}
                  className="flex-shrink-0 w-80 rounded-xl border-2 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer overflow-hidden group/card"
                  style={{
                    borderColor: isRed ? "#FECACA" :
                      phase.status === "completed" ? "#A7F3D0" :
                        phase.status === "in-progress" ? "#BFDBFE" : "#E2E8F0",
                  }}
                  onMouseEnter={(e) => {
                    if (isRed) { e.currentTarget.style.borderColor = "#FCA5A5"; return; }
                    const colors = {
                      completed: "#6EE7B7",
                      "in-progress": "#93C5FD",
                      pending: "#CBD5E1",
                    };
                    e.currentTarget.style.borderColor = colors[phase.status];
                  }}
                  onMouseLeave={(e) => {
                    if (isRed) { e.currentTarget.style.borderColor = "#FECACA"; return; }
                    const colors = {
                      completed: "#A7F3D0",
                      "in-progress": "#BFDBFE",
                      pending: "#E2E8F0",
                    };
                    e.currentTarget.style.borderColor = colors[phase.status];
                  }}
                  onClick={() => setSelectedPhase(phase)}
                >
                  {/* Accent bar */}
                  <div className={`h-1.5 w-full ${cardStyle.accentBar}`} />

                  <div className="p-5">
                    {/* Header: Icon + Title */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${cardStyle.iconBg} shrink-0`}>
                        <PhaseIcon size={20} className={cardStyle.iconColor} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {phase.title}
                        </h3>
                        <span className="text-xs text-slate-500">
                          Phase {phase.id}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cardStyle.badge}`}>
                      <StatusIcon size={12} />
                      {st.label}
                    </span>

                    {/* Short Description */}
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {phase.shortDescription}
                    </p>

                    {/* View Details */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary group-hover/card:gap-1.5 transition-all">
                        View details <ArrowRight size={12} className="transition-transform group-hover/card:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase Modal */}
      <PhaseModal
        phase={selectedPhase}
        isOpen={!!selectedPhase}
        onClose={() => setSelectedPhase(null)}
      />
    </div>
  );
}
