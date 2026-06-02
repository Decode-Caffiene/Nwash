// import React, { useState, useRef, useEffect } from "react";
// import gsap from "gsap";

// import useFetch from "../../hooks/useFetch";
// import useAnalyticsData from "../../hooks/useAnalyticsData";
// import { getServiceProviders } from "../../api/serviceProviderApi";

// /* Components */
// import AnalyticsHeader from "../../components/charts/AnalyticsHeader";
// import AnalyticsSummary from "../../components/charts/AnalyticsSummary";
// import AnalyticsFilters from "../../components/charts/AnalyticsFilters";
// import AnalyticsChart from "../../components/charts/AnalyticsChart";
// import AnalyticsModal from "../../components/charts/AnalyticsModal";

// function AnalyticsPage() {
//   const { data, loading, error } = useFetch(getServiceProviders, []);
//   const providers = Array.isArray(data) ? data : [];

//   const [searchQuery, setSearchQuery] = useState("");

//   const [isFilterOpen, setIsFilterOpen] = useState(false);

//   const [draftFilters, setDraftFilters] = useState({
//     province: "",
//     district: "",
//     municipality: "",
//   });

//   const [appliedFilters, setAppliedFilters] = useState({
//     province: "",
//     district: "",
//     municipality: "",
//   });

//   const { chartData } = useAnalyticsData(
//     providers,
//     searchQuery,
//     appliedFilters
//   );

//   const headerRef = useRef(null);
//   const summaryRef = useRef(null);
//   const chartRef = useRef(null);

//   const activeFilterCount =
//     Object.values(appliedFilters).filter(Boolean).length;

//   /* ---------------- GSAP PAGE ANIMATION ---------------- */
//   useEffect(() => {
//     const ctx = gsap.context(() => {
//       gsap.from(headerRef.current, {
//         opacity: 0,
//         y: 20,
//         duration: 0.6,
//       });

//       gsap.from(summaryRef.current, {
//         opacity: 0,
//         y: 20,
//         delay: 0.1,
//         duration: 0.6,
//       });

//       gsap.from(chartRef.current, {
//         opacity: 0,
//         scale: 0.98,
//         delay: 0.2,
//         duration: 0.6,
//       });
//     });

//     return () => ctx.revert();
//   }, []);

//   /* ---------------- FILTER ACTIONS ---------------- */
//   const openFilter = () => setIsFilterOpen(true);

//   const applyFilters = () => {
//     setAppliedFilters(draftFilters);
//     setIsFilterOpen(false);
//   };

//   const clearFilters = () => {
//     const empty = {
//       province: "",
//       district: "",
//       municipality: "",
//     };
//     setDraftFilters(empty);
//     setAppliedFilters(empty);
//   };

//   return (
//     <div className="space-y-6 p-6">

//       {/* HEADER */}
//       <div ref={headerRef}>
//         <AnalyticsHeader />
//       </div>

//       {/* SUMMARY */}
//       <div ref={summaryRef}>
//         <AnalyticsSummary chartData={chartData} />
//       </div>

//       {/* FILTERS */}
//       <AnalyticsFilters
//         searchQuery={searchQuery}
//         setSearchQuery={setSearchQuery}
//         openFilter={openFilter}
//         activeFilterCount={activeFilterCount}
//       />

//       {/* LOADING */}
//       {loading && (
//         <p className="text-sm text-gray-500">Loading chart data...</p>
//       )}

//       {/* ERROR */}
//       {error && (
//         <p className="text-sm text-red-500">
//           Failed to load analytics data
//         </p>
//       )}

//       {/* CHART */}
//       <div ref={chartRef}>
//         {!loading && !error && (
//           <AnalyticsChart chartData={chartData} />
//         )}
//       </div>

//       {/* MODAL */}
//       <AnalyticsModal
//         isOpen={isFilterOpen}
//         onClose={() => setIsFilterOpen(false)}
//         draftFilters={draftFilters}
//         setDraftFilters={setDraftFilters}
//         applyFilters={applyFilters}
//         clearFilters={clearFilters}
//       />
//     </div>
//   );
// }

// export default AnalyticsPage;



import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";

import useFetch from "../../hooks/useFetch";
import useAnalyticsData from "../../hooks/useAnalyticsData";
import { getServiceProviders } from "../../api/serviceProviderApi";

/* Components */
import AnalyticsHeader from "../../components/charts/AnalyticsHeader";
import AnalyticsSummary from "../../components/charts/AnalyticsSummary";
import AnalyticsFilters from "../../components/charts/AnalyticsFilters";
import AnalyticsChart from "../../components/charts/AnalyticsChart";
import AnalyticsModal from "../../components/charts/AnalyticsModal";

function AnalyticsPage() {
  const { data, loading, error } = useFetch(getServiceProviders, []);
  const providers = Array.isArray(data) ? data : [];

  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [draftFilters, setDraftFilters] = useState({
    province: "", district: "", municipality: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    province: "", district: "", municipality: "",
  });

  const { chartData } = useAnalyticsData(providers, searchQuery, appliedFilters);

  const headerRef = useRef(null);
  const summaryRef = useRef(null);
  const chartRef = useRef(null);

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, { opacity: 0, y: 20, duration: 0.6 });
      gsap.from(summaryRef.current, { opacity: 0, y: 20, delay: 0.1, duration: 0.6 });
      gsap.from(chartRef.current, { opacity: 0, scale: 0.98, delay: 0.2, duration: 0.6 });
    });
    return () => ctx.revert();
  }, []);

  const openFilter = () => setIsFilterOpen(true);

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    const empty = { province: "", district: "", municipality: "" };
    setDraftFilters(empty);
    setAppliedFilters(empty);
  };

  return (
    <div className="min-h-screen bg-white p-6 space-y-8">
      {/* HEADER */}
      <div ref={headerRef}>
        <AnalyticsHeader />
      </div>

      {/* SUMMARY */}
      <div ref={summaryRef}>
        <AnalyticsSummary chartData={chartData} />
      </div>

      {/* FILTERS */}
      <AnalyticsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        openFilter={openFilter}
        activeFilterCount={activeFilterCount}
      />

      {loading && <p className="text-gray-500">Loading chart data...</p>}
      {error && <p className="text-red-500">Failed to load analytics data</p>}

      {/* CHART */}
      <div ref={chartRef}>
        {!loading && !error && <AnalyticsChart chartData={chartData} />}
      </div>

      {/* MODAL */}
      <AnalyticsModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        draftFilters={draftFilters}
        setDraftFilters={setDraftFilters}
        applyFilters={applyFilters}
        clearFilters={clearFilters}
      />
    </div>
  );
}

export default AnalyticsPage;