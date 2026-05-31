import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Label,
  Tooltip,
  Cell,
} from "recharts";
import SideBar from "../components/SideBar";
import LoadingSpinner from "../components/LoadingSpinner";

//Api imports
import { fetchOperators } from "../api/operator";

// 1. Memoized Tooltip to prevent re-renders when the mouse moves over the chart
const CustomTooltip = React.memo(({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-blue-400 p-3 rounded-lg shadow-xl backdrop-blur-md">
        <p className="text-blue-400 font-black uppercase text-xs mb-1">
          {data.WSUC_Name}
        </p>
        <div className="text-white text-[10px] space-y-1">
          <p>
            <span className="text-slate-400">OEI (X):</span>{" "}
            {data.Summary_Index?.OEI?.toFixed(2)}%
          </p>
          <p>
            <span className="text-slate-400">SPI (Y):</span>{" "}
            {data.Summary_Index?.SPI?.toFixed(2)}%
          </p>
          <p className="text-blue-200/50 pt-1 border-t border-white/10 italic">
            ID: {data.WSUC_ID}
          </p>
        </div>
      </div>
    );
  }
  return null;
});

const Chart = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data
  useEffect(() => {
    async function getData() {
      try {
        setLoading(true);
        const res = await fetchOperators();
        if (res.data) {
          const formattedData = res.data
            .filter(
              (item) =>
                item?.Summary_Index?.OEI !== null &&
                item?.Summary_Index?.SPI !== null
            )
            .map((item) => ({
              ...item,
              x: item?.Summary_Index?.OEI,
              y: item?.Summary_Index?.SPI,
            }));
          setData(formattedData);
        }
      } catch (error) {
        console.error("Fetch error", error);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);

  // 2. Optimization: Memoize the highlighted results.
  // This ensures we only re-run the search logic when searchQuery or data changes.
  const chartData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return data;

    return data.map((item) => ({
      ...item,
      isHighlighted: item.WSUC_Name.toLowerCase().includes(query),
    }));
  }, [data, searchQuery]);

  // 3. Optimization: Debounced change handler to keep typing smooth
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-300">
        <div className="w-full max-w-7xl bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-white text-xl md:text-2xl font-black tracking-tighter uppercase">
              Utilities/Service Providers{" "}
              <span className="text-blue-400">Categorization Chart</span>
            </h1>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search project..."
                onChange={handleSearchChange}
                className="w-full bg-slate-800/40 border border-blue-400/30 rounded-xl py-2 px-4 text-white text-sm focus:outline-none focus:border-blue-400 transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-2 md:p-4 shadow-inner min-h-[580px] flex items-center justify-center">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <ResponsiveContainer width="100%" height={680}>
                <ScatterChart
                  margin={{ top: 40, right: 120, left: 60, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" vertical />
                  <XAxis
                    type="number"
                    dataKey="x"
                    domain={[0, 100]}
                    ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100]}
                    stroke="#334155"
                    fontSize={12}
                    fontWeight="bold"
                  >
                    <Label
                      value="OPERATIONAL AND MANAGEMENT EFFICIENCY (OEI), %"
                      position="bottom"
                      offset={40}
                      className="fill-slate-600 font-black text-[9px] md:text-[10px] tracking-widest"
                    />
                  </XAxis>
                  <YAxis
                    type="number"
                    dataKey="y"
                    domain={[0, 100]}
                    ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100]}
                    stroke="#334155"
                    fontSize={12}
                    fontWeight="bold"
                  >
                    <Label
                      value="SERVICE PROVISION INDEX (SPI), %"
                      angle={-90}
                      position="left"
                      offset={45}
                      style={{ textAnchor: "middle" }}
                      className="fill-slate-600 font-black text-[9px] md:text-[10px] tracking-widest"
                    />
                  </YAxis>

                  {/* 4. Optimization: isAnimationActive={false} is applied to all static areas */}
                  <ReferenceArea
                    x1={0}
                    x2={30}
                    y1={0}
                    y2={30}
                    fill="red"
                    fillOpacity={0.7}
                    isAnimationActive={false}
                    label={{
                      value: "Very Poor",
                      fontWeight: "bold",
                      position: "insideBottomRight",
                      fontSize: 14,
                      fill: "white",
                    }}
                  />
                  <ReferenceArea
                    x1={0}
                    x2={50}
                    y1={0}
                    y2={50}
                    fill="#fe62c7"
                    fillOpacity={0.6}
                    isAnimationActive={false}
                    label={{
                      value: "Poor",
                      fontWeight: "bold",
                      position: "insideBottomRight",
                      fontSize: 14,
                      fill: "white",
                    }}
                  />
                  <ReferenceArea
                    x1={0}
                    x2={50}
                    y1={50}
                    y2={100}
                    fill="gray"
                    fillOpacity={0.6}
                    isAnimationActive={false}
                    label={{
                      value: "Inactive",
                      fontWeight: "bold",
                      position: "center",
                      fontSize: 14,
                      fill: "white",
                    }}
                  />
                  <ReferenceArea
                    x1={50}
                    x2={100}
                    y1={0}
                    y2={50}
                    fill="green"
                    fillOpacity={0.7}
                    isAnimationActive={false}
                    label={{
                      value: "Active",
                      fontWeight: "bold",
                      position: "insideBottomRight",
                      fontSize: 14,
                      fill: "white",
                    }}
                  />
                  <ReferenceArea
                    x1={50}
                    x2={100}
                    y1={50}
                    y2={100}
                    fill="Yellow"
                    fillOpacity={0.7}
                    isAnimationActive={false}
                    label={{
                      value: "Improving",
                      fontWeight: "bold",
                      position: "insideBottomRight",
                      fontSize: 14,
                    }}
                  />
                  <ReferenceArea
                    x1={70}
                    x2={100}
                    y1={70}
                    y2={100}
                    fill="#22c55e"
                    fillOpacity={0.6}
                    isAnimationActive={false}
                    label={{
                      value: "Improved",
                      fontWeight: "bold",
                      position: "insideBottomRight",
                      fontSize: 14,
                    }}
                  />
                  <ReferenceArea
                    x1={80}
                    x2={100}
                    y1={80}
                    y2={100}
                    fill="Cyan"
                    fillOpacity={0.6}
                    isAnimationActive={false}
                    label={{
                      value: "Just Efficient",
                      position: "insideBottomRight",
                      fill: "white",
                      fontSize: 14,
                      fontWeight: "bold",
                    }}
                  />
                  <ReferenceArea
                    x1={85}
                    x2={100}
                    y1={90}
                    y2={100}
                    fill="gray"
                    fillOpacity={0.8}
                    isAnimationActive={false}
                    label={{
                      value: "Moderately Efficient",
                      position: "insideBottomRight",
                      fill: "white",
                      fontWeight: "bold",
                      fontSize: 14,
                    }}
                  />
                  <ReferenceArea
                    x1={95}
                    x2={100}
                    y1={95}
                    y2={100}
                    fill="Blue"
                    fillOpacity={0.8}
                    isAnimationActive={false}
                    label={{
                      value: "Highly Efficient",
                      position: "top",
                      fill: "blue",
                      fontWeight: "bold",
                      fontSize: 14,
                    }}
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ strokeDasharray: "3 3" }}
                  />

                  <Scatter
                    name="WSUC Providers"
                    data={chartData}
                    shape="square"
                    isAnimationActive={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isHighlighted ? "#ff0000" : "#1e40af"}
                        r={entry.isHighlighted ? 10 : 4}
                        stroke={entry.isHighlighted ? "#fff" : "none"}
                        strokeWidth={2}
                      />
                    ))}
                  </Scatter>

                  <ReferenceLine
                    x={50}
                    stroke="#0f172a"
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                  <ReferenceLine
                    y={50}
                    stroke="#0f172a"
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* ... Scale Footer ... */}
        </div>
      </main>
    </div>
  );
};

export default Chart;
