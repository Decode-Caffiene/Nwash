import React, { useEffect } from "react";
import { X, CheckCircle2, Clock, CircleDot } from "lucide-react";
import wateraidLogo from "../../../assets/wateraid.svg";
import whhLogo from "../../../assets/weltwater.svg";
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

const statusStyles = {
  completed: {
    headerBg: "bg-gradient-to-r from-emerald-50 to-emerald-100",
    headerText: "text-emerald-800",
    badge: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle2,
    iconColor: "text-emerald-600",
    divider: "bg-emerald-200",
  },
  "in-progress": {
    headerBg: "bg-gradient-to-r from-blue-50 to-blue-100",
    headerText: "text-blue-800",
    badge: "bg-blue-100 text-blue-700",
    icon: Clock,
    iconColor: "text-blue-600",
    divider: "bg-blue-200",
  },
  pending: {
    headerBg: "bg-gradient-to-r from-slate-50 to-slate-100",
    headerText: "text-slate-600",
    badge: "bg-slate-100 text-slate-500",
    icon: CircleDot,
    iconColor: "text-slate-400",
    divider: "bg-slate-200",
  },
};

export default function PhaseModal({ phase, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen || !phase) return null;

  const isRed = phase.id >= 4;
  const baseSt = statusStyles[phase.status] || statusStyles.pending;
  const st = isRed
    ? {
        ...baseSt,
        headerBg: "bg-gradient-to-r from-red-50 to-red-100",
        headerText: "text-red-800",
        badge: "bg-red-100 text-red-700",
        iconColor: "text-red-600",
        divider: "bg-red-200",
      }
    : baseSt;
  const StatusIcon = st.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${st.headerBg} p-6`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white/80 shadow-sm`}
              >
                <StatusIcon size={22} className={st.iconColor} />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${st.headerText}`}>
                  {phase.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs font-semibold ${st.headerText} opacity-75`}
                  >
                    Phase {phase.id}
                  </span>
                  <span className={`w-1 h-1 rounded-full ${st.divider}`} />
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.badge}`}
                  >
                    {st.label || phase.status}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`rounded-full p-1.5 hover:bg-white/60 transition ${st.headerText}`}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Short Description */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <p className="text-sm text-slate-700 leading-relaxed">
              {phase.shortDescription}
            </p>
          </div>

          {/* Full Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Key Activities
            </h3>
            <ul className="space-y-2">
              {phase.description.map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-700">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-brand-light text-brand-primary text-xs font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Divider */}
          <div className={`h-px ${st.divider}`} />

          {/* Development Partners */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Development Partners
            </h3>
            {phase.developmentPartners.length === 0 ? (
              <div className="text-sm text-slate-400 italic bg-slate-50 rounded-lg p-4 text-center border border-dashed border-slate-200">
                No partner organizations involved in this phase
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {phase.developmentPartners.map((key) => {
                  const partner = partnerLogoMap[key];
                  if (!partner) return null;
                  return (
                    <div
                      key={key}
                      className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
                    >
                      <div className="h-14 w-14 flex items-center justify-center bg-white rounded-lg border border-slate-200 p-2">
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
            className="px-5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition shadow-sm"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in-95 {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in.fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-in.zoom-in-95 {
          animation: zoom-in-95 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
