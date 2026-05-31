import React from "react";
import Button from "../common/Button";

export default function AnalyticsFilters({
  searchQuery,
  setSearchQuery,
  openFilter,
  activeFilterCount,
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[260px]">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search WSUC name..."
          className="w-full bg-white border border-gray-300 rounded-2xl py-3 px-5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-600 transition-all"
        />
      </div>

      <Button onClick={openFilter} className="px-6">
        Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
      </Button>
    </div>
  );
}