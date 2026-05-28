// // import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// // import {
// //   CartesianGrid,
// //   Label,
// //   ReferenceArea,
// //   ReferenceLine,
// //   ResponsiveContainer,
// //   Scatter,
// //   ScatterChart,
// //   Tooltip,
// //   XAxis,
// //   YAxis,
// // } from "recharts";
// // import gsap from "gsap";
// // import { Filter, Search, X } from "lucide-react";
// // import Badge from "../../components/common/Badge";
// // import Button from "../../components/common/Button";
// // import Card from "../../components/common/Card";
// // import Loader from "../../components/common/Loader";
// // import { getServiceProviders } from "../../api/serviceProviderApi";
// // import useFetch from "../../hooks/useFetch";

// // const normalize = (value) => String(value || "").trim().toLowerCase();

// // const matchesText = (value, query) => {
// //   if (!query) return true;
// //   return normalize(value).includes(normalize(query));
// // };

// // const CustomTooltip = React.memo(({ active, payload }) => {
// //   if (!active || !payload?.length) return null;

// //   const data = payload[0].payload;

// //   return (
// //     <div className="rounded-lg border border-brand-primary bg-slate-950 p-3 text-xs shadow-xl">
// //       <p className="mb-2 font-semibold text-brand-light">{data.WSUC_Name}</p>
// //       <div className="space-y-1 text-white">
// //         <p>
// //           <span className="text-slate-400">OEI:</span>{" "}
// //           {data.Summary_Index?.OEI?.toFixed(2) || "N/A"}%
// //         </p>
// //         <p>
// //           <span className="text-slate-400">SPI:</span>{" "}
// //           {data.Summary_Index?.SPI?.toFixed(2) || "N/A"}%
// //         </p>
// //         <p className="border-t border-white/10 pt-1 text-slate-400">
// //           ID: {data.WSUC_ID}
// //         </p>
// //       </div>
// //     </div>
// //   );
// // });

// // CustomTooltip.displayName = "CustomTooltip";

// // function ChartPoint({ cx, cy, payload }) {
// //   const isHighlighted = payload?.isHighlighted;
// //   const markerColor = isHighlighted ? "#ea580c" : "#0f766e";
// //   const markerStroke = isHighlighted ? "#7c2d12" : "#064e3b";
// //   const scale = isHighlighted ? 1.22 : 1;

// //   if (cx === undefined || cy === undefined) return null;



// //   return (
// //     <g
// //       className="analytics-point"
// //       transform={`translate(${cx} ${cy}) scale(${scale})`}
// //     >
// //       {isHighlighted && (
// //         <>
// //           <circle r={13} fill="#f97316" opacity={0.14} />
// //           <circle r={9} fill="none" stroke="#fb923c" strokeWidth={1.8} />
// //         </>
// //       )}
// //       <path
// //         d="M0 -11C-5.2 -11 -9 -7.1 -9 -2.2C-9 4.7 0 11 0 11C0 11 9 4.7 9 -2.2C9 -7.1 5.2 -11 0 -11Z"
// //         fill={markerColor}
// //         stroke="#ffffff"
// //         strokeWidth={1.7}
// //       />
// //       <circle
// //         r={3.2}
// //         fill="#ffffff"
// //         opacity={0.92}
// //         stroke={markerStroke}
// //         strokeWidth={1}
// //       />
// //       <path d="M-3.5 -6.5C-2 -8 -0.2 -8.4 1.8 -7.8" fill="none" stroke="#ffffff" strokeLinecap="round" strokeWidth={1.2} opacity={0.55} />
// //     </g>
// //   );
// // }

// // function AnalyticsPage() {
// //   const { data, loading, error } = useFetch(getServiceProviders, []);
// //   const providers = Array.isArray(data) ? data : [];
// //   const pageRef = useRef(null);
// //   const headerRef = useRef(null);
// //   const cardRef = useRef(null);
// //   const chartShellRef = useRef(null);
// //   const modalRef = useRef(null);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [isFilterOpen, setIsFilterOpen] = useState(false);
// //   const [draftFilters, setDraftFilters] = useState({
// //     province: "",
// //     district: "",
// //     municipality: "",
// //   });
// //   const [appliedFilters, setAppliedFilters] = useState({
// //     province: "",
// //     district: "",
// //     municipality: "",
// //   });

// //   const chartData = useMemo(() => {
// //     return providers
// //       .filter(
// //         (item) =>
// //           item?.Summary_Index?.OEI !== null &&
// //           item?.Summary_Index?.OEI !== undefined &&
// //           item?.Summary_Index?.SPI !== null &&
// //           item?.Summary_Index?.SPI !== undefined,
// //       )
// //       .filter((item) => {
// //         const location = item.Location || {};
// //         return (
// //           matchesText(location.Province_Name, appliedFilters.province) &&
// //           matchesText(location.District_Name, appliedFilters.district) &&
// //           matchesText(
// //             location.Municipality_Name,
// //             appliedFilters.municipality,
// //           )
// //         );
// //       })
// //       .map((item) => ({
// //         ...item,
// //         x: item.Summary_Index.OEI,
// //         y: item.Summary_Index.SPI,
// //         isHighlighted:
// //           normalize(searchQuery) && matchesText(item.WSUC_Name, searchQuery),
// //       }));
// //   }, [appliedFilters, providers, searchQuery]);

// //   const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

// //   const chartSummary = useMemo(() => {
// //     const improvedCount = chartData.filter((item) => item.x >= 70 && item.y >= 70)
// //       .length;
// //     const highlightedCount = chartData.filter((item) => item.isHighlighted)
// //       .length;

// //     return [
// //       { label: "Chart Records", value: chartData.length },
// //       { label: "Improved Zone", value: improvedCount },
// //       { label: "Highlighted", value: highlightedCount },
// //     ];
// //   }, [chartData]);

// //   useEffect(() => {
// //     const context = gsap.context(() => {
// //       gsap.from([headerRef.current, cardRef.current], {
// //         autoAlpha: 0,
// //         y: 24,
// //         duration: 0.75,
// //         ease: "power3.out",
// //         stagger: 0.12,
// //       });
// //     }, pageRef);

// //     return () => context.revert();
// //   }, []);

// //   useEffect(() => {
// //     if (loading || error || !chartShellRef.current) return;

// //     const context = gsap.context(() => {
// //       gsap.fromTo(
// //         chartShellRef.current,
// //         { autoAlpha: 0.75, y: 12, scale: 0.985 },
// //         { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "power2.out" },
// //       );

// //       gsap.from(".analytics-point", {
// //         autoAlpha: 0,
// //         scale: 0,
// //         transformOrigin: "center",
// //         duration: 0.45,
// //         ease: "back.out(2)",
// //         stagger: { each: 0.008, from: "random" },
// //       });
// //     }, chartShellRef);

// //     return () => context.revert();
// //   }, [chartData.length, error, loading]);

// //   useEffect(() => {
// //     if (!isFilterOpen || !modalRef.current) return;

// //     const context = gsap.context(() => {
// //       gsap.fromTo(
// //         ".filter-backdrop",
// //         { autoAlpha: 0 },
// //         { autoAlpha: 1, duration: 0.2, ease: "power2.out" },
// //       );
// //       gsap.fromTo(
// //         modalRef.current,
// //         { autoAlpha: 0, y: 20, scale: 0.96 },
// //         { autoAlpha: 1, y: 0, scale: 1, duration: 0.32, ease: "back.out(1.5)" },
// //       );
// //     }, modalRef);

// //     return () => context.revert();
// //   }, [isFilterOpen]);

// //   const handleSearchChange = useCallback((event) => {
// //     setSearchQuery(event.target.value);
// //   }, []);

// //   const handleFilterChange = (key, value) => {
// //     setDraftFilters((current) => ({ ...current, [key]: value }));
// //   };

// //   const applyFilters = () => {
// //     setAppliedFilters(draftFilters);
// //     setIsFilterOpen(false);
// //   };

// //   const clearFilters = () => {
// //     const emptyFilters = { province: "", district: "", municipality: "" };
// //     setDraftFilters(emptyFilters);
// //     setAppliedFilters(emptyFilters);
// //   };

// //   return (
// //     <div ref={pageRef} className="space-y-6">
// //       <div ref={headerRef}>
// //         <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
// //           Analytics & Charts
// //         </p>
// //         <h1 className="mt-2 text-3xl font-bold text-text-primary">
// //           Utilities and service provider categorization
// //         </h1>
// //         <p className="mt-3 max-w-2xl text-sm text-text-secondary">
// //           Compare operational efficiency and service provision scores for WSUC
// //           providers with searchable and location-based filtering.
// //         </p>
// //       </div>

// //       <Card
// //         ref={cardRef}
// //         className="mx-auto max-w-6xl overflow-hidden border-0 bg-white p-0 shadow-lg ring-1 ring-surface-border"
// //       >
// //         <div className="border-b border-surface-border bg-slate-950 px-5 py-5 text-white">
// //           <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
// //             <div>
// //               <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-light">
// //                 Categorization Matrix
// //               </p>
// //               <h2 className="mt-2 text-xl font-semibold">
// //                 OEI and SPI performance map
// //               </h2>
// //               <p className="mt-1 text-sm text-slate-300">
// //                 Showing {chartData.length} providers with both SPI and OEI data.
// //               </p>
// //             </div>

// //             <div className="grid gap-2 sm:grid-cols-3">
// //               {chartSummary.map((item) => (
// //                 <div
// //                   key={item.label}
// //                   className="rounded-lg border border-white/10 bg-white/10 px-4 py-3"
// //                 >
// //                   <p className="text-[11px] uppercase tracking-wide text-slate-300">
// //                     {item.label}
// //                   </p>
// //                   <p className="mt-1 text-xl font-bold">{item.value}</p>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </div>

// //         <div className="p-5">
// //         <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
// //           <div>
// //             <p className="text-sm font-semibold text-text-primary">
// //               Search and filter
// //             </p>
// //             <p className="mt-1 text-sm text-text-secondary">
// //               Search is case-insensitive and filters can be combined.
// //             </p>
// //           </div>

// //           <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
// //             <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-surface-border bg-white px-3 py-2 sm:w-80">
// //               <Search size={18} className="shrink-0 text-text-secondary" />
// //               <input
// //                 type="search"
// //                 value={searchQuery}
// //                 onChange={handleSearchChange}
// //                 placeholder="Search WSUC name"
// //                 className="w-full min-w-0 border-0 bg-transparent text-sm outline-none placeholder:text-text-secondary"
// //               />
// //             </label>

// //             <Button
// //               type="button"
// //               variant="secondary"
// //               className="gap-2"
// //               onClick={() => setIsFilterOpen(true)}
// //             >
// //               <Filter size={16} />
// //               Filter
// //               {activeFilterCount > 0 && (
// //                 <Badge variant="info">{activeFilterCount}</Badge>
// //               )}
// //             </Button>
// //           </div>
// //         </div>

// //         {loading && <Loader text="Loading chart data..." />}

// //         {error && (
// //           <div className="mt-6 rounded-lg border border-status-error/30 bg-red-50 p-4">
// //             <p className="text-sm font-semibold text-status-error">
// //               Could not load analytics data
// //             </p>
// //             <p className="mt-2 text-sm text-text-secondary">{error}</p>
// //           </div>
// //         )}

// //         {!loading && !error && (
// //           <div
// //             ref={chartShellRef}
// //             className="mx-auto mt-6 min-h-[620px] max-w-5xl rounded-xl border border-surface-border bg-slate-50 p-3 shadow-inner"
// //           >
// //             <div className="mb-3 flex flex-wrap gap-2">
// //               {[
// //                 ["Very Poor", "bg-red-600"],
// //                 ["Poor", "bg-pink-500"],
// //                 ["Inactive", "bg-slate-500"],
// //                 ["Active", "bg-green-600"],
// //                 ["Improving", "bg-yellow-400"],
// //                 ["Efficient", "bg-cyan-500"],
// //               ].map(([label, color]) => (
// //                 <span
// //                   key={label}
// //                   className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-text-secondary shadow-sm"
// //                 >
// //                   <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
// //                   {label}
// //                 </span>
// //               ))}
// //             </div>
// //             <div className="mx-auto max-w-[980px] rounded-lg bg-white p-2">
// //             <ResponsiveContainer width="100%" height={600}>
// //               <ScatterChart margin={{ top: 36, right: 80, left: 56, bottom: 56 }}>
// //                 <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
// //                 <XAxis
// //                   type="number"
// //                   dataKey="x"
// //                   domain={[0, 100]}
// //                   ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100]}
// //                   stroke="#334155"
// //                   fontSize={12}
// //                   fontWeight="bold"
// //                 >
// //                   <Label
// //                     value="Operational and Management Efficiency (OEI), %"
// //                     position="bottom"
// //                     offset={36}
// //                     className="fill-slate-600 text-[10px] font-bold uppercase"
// //                   />
// //                 </XAxis>
// //                 <YAxis
// //                   type="number"
// //                   dataKey="y"
// //                   domain={[0, 100]}
// //                   ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100]}
// //                   stroke="#334155"
// //                   fontSize={12}
// //                   fontWeight="bold"
// //                 >
// //                   <Label
// //                     value="Service Provision Index (SPI), %"
// //                     angle={-90}
// //                     position="left"
// //                     offset={42}
// //                     style={{ textAnchor: "middle" }}
// //                     className="fill-slate-600 text-[10px] font-bold uppercase"
// //                   />
// //                 </YAxis>

// //                 <ReferenceArea x1={0} x2={30} y1={0} y2={30} fill="#dc2626" fillOpacity={0.7} label={{ value: "Very Poor", fontWeight: "bold", position: "insideBottomRight", fontSize: 13, fill: "white" }} />
// //                 <ReferenceArea x1={0} x2={50} y1={0} y2={50} fill="#ec4899" fillOpacity={0.35} label={{ value: "Poor", fontWeight: "bold", position: "insideBottomRight", fontSize: 13, fill: "white" }} />
// //                 <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill="#64748b" fillOpacity={0.45} label={{ value: "Inactive", fontWeight: "bold", position: "center", fontSize: 13, fill: "white" }} />
// //                 <ReferenceArea x1={50} x2={100} y1={0} y2={50} fill="#16a34a" fillOpacity={0.35} label={{ value: "Active", fontWeight: "bold", position: "insideBottomRight", fontSize: 13, fill: "white" }} />
// //                 <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill="#facc15" fillOpacity={0.45} label={{ value: "Improving", fontWeight: "bold", position: "insideBottomRight", fontSize: 13 }} />
// //                 <ReferenceArea x1={70} x2={100} y1={70} y2={100} fill="#22c55e" fillOpacity={0.45} label={{ value: "Improved", fontWeight: "bold", position: "insideBottomRight", fontSize: 13 }} />
// //                 <ReferenceArea x1={80} x2={100} y1={80} y2={100} fill="#06b6d4" fillOpacity={0.45} label={{ value: "Just Efficient", position: "insideBottomRight", fill: "white", fontSize: 13, fontWeight: "bold" }} />
// //                 <ReferenceArea x1={85} x2={100} y1={90} y2={100} fill="#475569" fillOpacity={0.65} label={{ value: "Moderately Efficient", position: "insideBottomRight", fill: "white", fontWeight: "bold", fontSize: 13 }} />
// //                 <ReferenceArea x1={95} x2={100} y1={95} y2={100} fill="#2563eb" fillOpacity={0.75} label={{ value: "Highly Efficient", position: "top", fill: "#1d4ed8", fontWeight: "bold", fontSize: 13 }} />

// //                 <Tooltip
// //                   content={<CustomTooltip />}
// //                   cursor={{ strokeDasharray: "3 3" }}
// //                 />
// //                 <Scatter
// //                   name="WSUC Providers"
// //                   data={chartData}
// //                   shape={<ChartPoint />}
// //                   isAnimationActive={false}
// //                 />
// //                 <ReferenceLine x={50} stroke="#0f172a" strokeWidth={2} />
// //                 <ReferenceLine y={50} stroke="#0f172a" strokeWidth={2} />
// //               </ScatterChart>
// //             </ResponsiveContainer>
// //             </div>
// //           </div>
// //         )}
// //         </div>
// //       </Card>

// //       {isFilterOpen && (
// //         <div className="filter-backdrop fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
// //           <div
// //             ref={modalRef}
// //             className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl ring-1 ring-surface-border"
// //           >
// //             <div className="flex items-center justify-between gap-4">
// //               <div>
// //                 <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
// //                   Location Filter
// //                 </p>
// //                 <h2 className="mt-1 text-lg font-semibold text-text-primary">
// //                   Filter providers
// //                 </h2>
// //               </div>
// //               <button
// //                 type="button"
// //                 onClick={() => setIsFilterOpen(false)}
// //                 className="rounded-full p-1 text-text-secondary hover:bg-surface"
// //                 aria-label="Close filter"
// //               >
// //                 <X size={18} />
// //               </button>
// //             </div>

// //             <div className="mt-5 space-y-4">
// //               {[
// //                 ["province", "Province"],
// //                 ["district", "District"],
// //                 ["municipality", "Municipality"],
// //               ].map(([key, label]) => (
// //                 <label key={key} className="block">
// //                   <span className="text-sm font-medium text-text-primary">
// //                     {label}
// //                   </span>
// //                   <input
// //                     type="text"
// //                     value={draftFilters[key]}
// //                     onChange={(event) =>
// //                       handleFilterChange(key, event.target.value)
// //                     }
// //                     className="mt-2 w-full rounded-lg border border-surface-border px-3 py-2 text-sm outline-none transition focus:border-brand-primary"
// //                     placeholder={`Enter ${label.toLowerCase()}`}
// //                   />
// //                 </label>
// //               ))}
// //             </div>

// //             <div className="mt-6 flex flex-wrap justify-end gap-3">
// //               <Button type="button" variant="secondary" onClick={clearFilters}>
// //                 Clear
// //               </Button>
// //               <Button type="button" onClick={applyFilters}>
// //                 Search
// //               </Button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // export default AnalyticsPage;



// import React, { useState } from "react";
// import gsap from "gsap";

// import useFetch from "../../hooks/useFetch";
// import { getServiceProviders } from "../../api/serviceProviderApi";
// import useAnalyticsData from "../../hooks/useAnalyticsData";

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

//   // custom hook (logic separation)
//   const { chartData } = useAnalyticsData(
//     providers,
//     searchQuery,
//     appliedFilters
//   );

//   const activeFilterCount =
//     Object.values(appliedFilters).filter(Boolean).length;

//   // open filter modal with animation (optional GSAP hook point)
//   const openFilter = () => {
//     setIsFilterOpen(true);

//     gsap.fromTo(
//       ".filter-modal",
//       { autoAlpha: 0, y: 20, scale: 0.95 },
//       { autoAlpha: 1, y: 0, scale: 1, duration: 0.3 }
//     );
//   };

//   const applyFilters = () => {
//     setAppliedFilters(draftFilters);
//     setIsFilterOpen(false);
//   };

//   const clearFilters = () => {
//     const empty = { province: "", district: "", municipality: "" };
//     setDraftFilters(empty);
//     setAppliedFilters(empty);
//   };

//   return (
//     <div className="space-y-6 p-6">
//       {/* Header */}
//       <AnalyticsHeader />

//       {/* Summary cards */}
//       <AnalyticsSummary chartData={chartData} />

//       {/* Search + Filter */}
//       <AnalyticsFilters
//         searchQuery={searchQuery}
//         setSearchQuery={setSearchQuery}
//         openFilter={openFilter}
//         activeFilterCount={activeFilterCount}
//       />

//       {/* Loading */}
//       {loading && (
//         <p className="text-sm text-text-secondary">Loading chart data...</p>
//       )}

//       {/* Error */}
//       {error && (
//         <p className="text-sm text-red-500">
//           Failed to load analytics data
//         </p>
//       )}

//       {/* Chart */}
//       {!loading && !error && (
//         <AnalyticsChart chartData={chartData} />
//       )}

//       {/* Filter Modal */}
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
    province: "",
    district: "",
    municipality: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    province: "",
    district: "",
    municipality: "",
  });

  const { chartData } = useAnalyticsData(
    providers,
    searchQuery,
    appliedFilters
  );

  const headerRef = useRef(null);
  const summaryRef = useRef(null);
  const chartRef = useRef(null);

  const activeFilterCount =
    Object.values(appliedFilters).filter(Boolean).length;

  /* ---------------- GSAP PAGE ANIMATION ---------------- */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
      });

      gsap.from(summaryRef.current, {
        opacity: 0,
        y: 20,
        delay: 0.1,
        duration: 0.6,
      });

      gsap.from(chartRef.current, {
        opacity: 0,
        scale: 0.98,
        delay: 0.2,
        duration: 0.6,
      });
    });

    return () => ctx.revert();
  }, []);

  /* ---------------- FILTER ACTIONS ---------------- */
  const openFilter = () => setIsFilterOpen(true);

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    const empty = {
      province: "",
      district: "",
      municipality: "",
    };
    setDraftFilters(empty);
    setAppliedFilters(empty);
  };

  return (
    <div className="space-y-6 p-6">

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

      {/* LOADING */}
      {loading && (
        <p className="text-sm text-gray-500">Loading chart data...</p>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-sm text-red-500">
          Failed to load analytics data
        </p>
      )}

      {/* CHART */}
      <div ref={chartRef}>
        {!loading && !error && (
          <AnalyticsChart chartData={chartData} />
        )}
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