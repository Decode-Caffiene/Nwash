// import React from "react";
// import {
//   CartesianGrid,
//   Label,
//   ReferenceArea,
//   ReferenceLine,
//   ResponsiveContainer,
//   Scatter,
//   ScatterChart,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";

// import ChartTooltip from "./chartTooltip";
// import ChartPoint from "./chartPoint";

// export default function AnalyticsChart({ chartData }) {
//   return (
//     <div className="mx-auto max-w-[980px] rounded-lg bg-white p-2">
//       <ResponsiveContainer width="100%" height={600}>
//         <ScatterChart margin={{ top: 36, right: 80, left: 56, bottom: 56 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />

//           {/* X Axis */}
//           <XAxis
//             type="number"
//             dataKey="x"
//             domain={[0, 100]}
//             ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
//             stroke="#334155"
//             fontSize={12}
//           >
//             <Label value="OEI (%)" position="bottom" offset={36} />
//           </XAxis>

//           {/* Y Axis */}
//           <YAxis
//             type="number"
//             dataKey="y"
//             domain={[0, 100]}
//             ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
//             stroke="#334155"
//             fontSize={12}
//           >
//             <Label value="SPI (%)" angle={-90} position="left" offset={42} />
//           </YAxis>

//           {/* Quadrants */}
//           <ReferenceArea
//             x1={0}
//             x2={50}
//             y1={0}
//             y2={50}
//             fill="#ef4444"
//             fillOpacity={0.2}
//           />
//           <ReferenceArea
//             x1={50}
//             x2={100}
//             y1={50}
//             y2={100}
//             fill="#22c55e"
//             fillOpacity={0.2}
//           />

//           {/* Center lines */}
//           <ReferenceLine x={50} stroke="#0f172a" strokeWidth={2} />
//           <ReferenceLine y={50} stroke="#0f172a" strokeWidth={2} />

//           {/* Tooltip */}
//           <Tooltip content={<ChartTooltip />} />

//           {/* Scatter Points */}
//           <Scatter
//             name="Providers"
//             data={chartData}
//             shape={<ChartPoint />}
//             isAnimationActive={false}
//           />
//         </ScatterChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }




import React, { useEffect } from "react";
import {
  CartesianGrid,
  Label,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import gsap from "gsap";

import ChartTooltip from "./chartTooltip";
import ChartPoint from "./chartPoint";

export default function AnalyticsChart({ chartData }) {

  /* ✅ GSAP MUST BE INSIDE COMPONENT */
  useEffect(() => {
    gsap.from(".analytics-point", {
      opacity: 0,
      scale: 0,
      duration: 0.4,
      stagger: 0.01,
      ease: "back.out(2)",
    });
  }, [chartData]);

  return (
    <div className="mx-auto max-w-[980px] rounded-lg bg-white p-2">
      <ResponsiveContainer width="100%" height={600}>
        <ScatterChart margin={{ top: 36, right: 80, left: 56, bottom: 56 }}>

          <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />

          {/* X AXIS */}
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
          >
            <Label value="OEI (%)" position="bottom" offset={36} />
          </XAxis>

          {/* Y AXIS */}
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
          >
            <Label value="SPI (%)" angle={-90} position="left" offset={42} />
          </YAxis>

          {/* QUADRANTS */}
          <ReferenceArea x1={0} x2={30} y1={0} y2={30} fill="#ef4444" fillOpacity={0.25} />
          <ReferenceArea x1={30} x2={50} y1={30} y2={50} fill="#f97316" fillOpacity={0.2} />
          <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill="#22c55e" fillOpacity={0.15} />
          <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill="#64748b" fillOpacity={0.2} />

          {/* CENTER LINES */}
          <ReferenceLine x={50} stroke="#0f172a" strokeWidth={2} />
          <ReferenceLine y={50} stroke="#0f172a" strokeWidth={2} />

          {/* TOOLTIP */}
          <Tooltip content={<ChartTooltip />} />

          {/* SCATTER */}
          <Scatter
            name="Providers"
            data={chartData}
            shape={<ChartPoint />}
            isAnimationActive={false}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}