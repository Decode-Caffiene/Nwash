import React from "react";
import { X } from "lucide-react";
import Button from "../common/Button";

export default function AnalyticsModal({
  isOpen,
  onClose,
  draftFilters,
  setDraftFilters,
  applyFilters,
  clearFilters,
}) {
  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="filter-modal fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-primary">
              Location Filter
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-800">
              Filter Providers
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Inputs */}
        <div className="mt-5 space-y-4">
          {[
            { key: "province", label: "Province" },
            { key: "district", label: "District" },
            { key: "municipality", label: "Municipality" },
          ].map((field) => (
            <label key={field.key} className="block">
              <span className="text-sm font-medium text-gray-700">
                {field.label}
              </span>

              <input
                type="text"
                value={draftFilters[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={`Enter ${field.label}`}
                className="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-brand-primary"
              />
            </label>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={clearFilters}>
            Clear
          </Button>

          <Button onClick={applyFilters}>Apply Filters</Button>
        </div>
      </div>
    </div>
  );
}
