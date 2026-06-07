import React, { useState, useMemo, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PhaseModal from "./PhaseModal";

const implementationPhases = [
  {
    id: 1,
    title: "Legislation",
    color: "bg-green-100",
    borderColor: "border-green-300",
    textColor: "text-green-900",
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
    color: "bg-blue-100",
    borderColor: "border-blue-300",
    textColor: "text-blue-900",
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
    color: "bg-blue-100",
    borderColor: "border-blue-300",
    textColor: "text-blue-900",
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
    color: "bg-blue-100",
    borderColor: "border-blue-300",
    textColor: "text-blue-900",
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
    color: "bg-blue-100",
    borderColor: "border-blue-300",
    textColor: "text-blue-900",
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
    color: "bg-red-100",
    borderColor: "border-red-300",
    textColor: "text-red-900",
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
    color: "bg-blue-100",
    borderColor: "border-blue-300",
    textColor: "text-blue-900",
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
    color: "bg-red-100",
    borderColor: "border-red-300",
    textColor: "text-red-900",
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedPhase, setSelectedPhase] = useState(null);

  const scroll = (direction) => {
    const container = document.getElementById("timeline-scroll");
    const scrollAmount = 400;

    if (direction === "left") {
      container?.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      setScrollPosition(Math.max(0, scrollPosition - scrollAmount));
    } else {
      container?.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setScrollPosition(scrollPosition + scrollAmount);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Implementation Timeline
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          8-phase regulatory implementation roadmap for water supply and
          sanitation services
        </p>
      </div>

      <div className="relative">
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow border border-slate-200"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow border border-slate-200"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} className="text-slate-600" />
        </button>

        {/* Timeline Container */}
        <div id="timeline-scroll" className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 px-12 pb-4 min-w-max">
            {implementationPhases.map((phase) => (
              <div
                key={phase.id}
                className={`flex-shrink-0 w-80 rounded-lg border-2 p-5 transition-all cursor-pointer ${phase.color} ${phase.borderColor} hover:shadow-lg`}
                onClick={() => setSelectedPhase(phase)}
              >
                {/* Phase Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-lg font-bold ${phase.textColor}`}>
                    {phase.title}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${phase.color} ${phase.textColor}`}
                  >
                    Phase {phase.id}
                  </span>
                </div>

                {/* Phase Description */}
                <div className="space-y-2">
                  {phase.description.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2 text-sm ${phase.textColor}`}
                    >
                      <span className="font-bold flex-shrink-0">•</span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>

                {/* Click indicator */}
                <div className="mt-4 text-xs text-center text-slate-500 opacity-75">
                  Click for details
                </div>
              </div>
            ))}
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
