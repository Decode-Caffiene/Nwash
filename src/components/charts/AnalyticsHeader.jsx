import React from "react";

export default function AnalyticsHeader() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
        Analytics & Charts
      </p>

      <h1 className="mt-2 text-3xl font-bold text-text-primary">
        Utilities and service provider categorization
      </h1>

      <p className="mt-3 max-w-2xl text-sm text-text-secondary">
        Compare operational efficiency and service provision scores for WSUC providers
        using interactive scatter plot analysis with search and location filters.
      </p>
    </div>
  );
}