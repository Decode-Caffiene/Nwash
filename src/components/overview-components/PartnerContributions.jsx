import React from "react";

export default function PartnerContributions({ partners }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="text-base font-bold text-slate-900">
        Development Partner Contributions
      </h3>

      <p className="text-xs text-slate-500 mb-4">
        Key supporting organizations
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {partners.map((p, i) => (
          <div key={i} className="border rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-bold">{p.name}</h4>

            <div className="text-xs flex justify-between">
              <span>Projects</span>
              <span>{p.projects}</span>
            </div>

            <div className="text-xs flex justify-between">
              <span>Funding</span>
              <span>{p.funding}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}