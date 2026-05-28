import React from "react";
import Button from "../common/Button";

export default function AnalyticsFilters({
  searchQuery,
  setSearchQuery,
  openFilter,
  activeFilterCount,
}) {
  return (
    <div className="flex gap-3">
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search WSUC"
        className="border px-3 py-2 rounded"
      />

      <Button onClick={openFilter}>
        Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
      </Button>
    </div>
  );
}
