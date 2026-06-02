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
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-gray-200 p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-600">Location Filter</p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">Filter Providers</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        <div className="space-y-5">
          {["province", "district", "municipality"].map((key, i) => (
            <label key={key} className="block">
              <span className="text-sm font-medium text-gray-700 block mb-1.5 capitalize">
                {key}
              </span>
              <input
                type="text"
                value={draftFilters[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={`Enter ${key}`}
                className="w-full rounded-2xl border border-gray-300 px-5 py-3.5 focus:border-blue-600 outline-none"
              />
            </label>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={clearFilters}>Clear</Button>
          <Button onClick={applyFilters}>Apply Filters</Button>
        </div>
      </div>
    </div>
  );
}