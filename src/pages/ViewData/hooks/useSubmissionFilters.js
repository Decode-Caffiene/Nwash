import { useEffect, useState } from "react";
import { PAGE_SIZE } from "../constants/viewDataConstants";
import { buildPageNumbers, getStatus } from "../utils/submissionUtils";

export function useSubmissionFilters(submissions) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  const counts = {
    total: submissions.length,
    pending: submissions.filter((s) => getStatus(s) === "pending").length,
    accepted: submissions.filter((s) => getStatus(s) === "accepted").length,
    rejected: submissions.filter((s) => getStatus(s) === "rejected").length,
  };

  const filtered = submissions
    .filter((s) => activeTab === "all" || getStatus(s) === activeTab)
    .filter((s) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (s.WSUC_Name ?? "").toLowerCase().includes(q) ||
        (s.Location?.Province_Name ?? "").toLowerCase().includes(q) ||
        (s.Location?.District_Name ?? "").toLowerCase().includes(q) ||
        (s.Location?.Municipality_Name ?? "").toLowerCase().includes(q) ||
        (s.Operator_Info?.Name ?? "").toLowerCase().includes(q)
      );
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageNumbers = buildPageNumbers(safePage, totalPages);

  return {
    search,
    setSearch,
    activeTab,
    setActiveTab,
    page,
    setPage,
    counts,
    filtered,
    safePage,
    totalPages,
    paginated,
    pageNumbers,
  };
}
