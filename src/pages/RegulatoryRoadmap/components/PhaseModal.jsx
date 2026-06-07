import React from "react";
import { X } from "lucide-react";
import wateraidLogo from "../../../assets/wateraid.webp";
import whhLogo from "../../../assets/weltwater.png";
import rrnLogo from "../../../assets/rrn.webp";
import unicefLogo from "../../../assets/unicef.png";
import unhabitatLogo from "../../../assets/unhabitat.png";

const partnerLogoMap = {
  wateraid: { src: wateraidLogo, alt: "WaterAid" },
  whh: { src: whhLogo, alt: "WHH" },
  rrn: { src: rrnLogo, alt: "RRN" },
  unicef: { src: unicefLogo, alt: "UNICEF" },
  unhabitat: { src: unhabitatLogo, alt: "UN-Habitat" },
};

export default function PhaseModal({ phase, isOpen, onClose }) {
  if (!isOpen || !phase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header with background color */}
        <div className={`${phase.color} p-6 flex items-center justify-between`}>
          <div>
            <h2 className={`text-2xl font-bold ${phase.textColor}`}>
              {phase.title}
            </h2>
            <p className={`text-xs font-semibold mt-1 ${phase.textColor} opacity-75`}>
              Phase {phase.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`rounded-full p-2 hover:bg-white/20 transition ${phase.textColor}`}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Short Description */}
          <div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {phase.shortDescription}
            </p>
          </div>

          {/* Full Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Details
            </h3>
            <ul className="space-y-2">
              {phase.description.map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-700">
                  <span className="font-bold flex-shrink-0 text-slate-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Development Partners */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">
              Development Partners
            </h3>
            {phase.developmentPartners.length === 0 ? (
              <div className="text-sm text-slate-500 italic">
                No partner organizations
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {phase.developmentPartners.map((key) => {
                  const partner = partnerLogoMap[key];
                  if (!partner) return null;
                  return (
                    <div key={key} className="flex flex-col items-center gap-2">
                      <div className="h-16 w-16 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-200 p-2">
                        <img
                          src={partner.src}
                          alt={partner.alt}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <p className="text-xs text-slate-600 text-center font-medium">
                        {partner.alt}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-900 font-medium hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
