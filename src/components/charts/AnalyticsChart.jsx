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
    <div className="mx-auto max-w-[1000px] rounded-3xl bg-white border border-gray-200 p-6 shadow-xl">
      <ResponsiveContainer width="100%" height={720}>
        <ScatterChart margin={{ top: 50, right: 75, left: 80, bottom: 80 }}>
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 100]}
            ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100]}
            stroke="#374151"
            fontSize={13}
          >
            <Label
              value="OPERATIONAL AND MANAGEMENT EFFICIENCY, %"
              position="bottom"
              offset={35}
              className="fill-gray-800 text-[15px] font-semibold tracking-widest"
              style={{ textAnchor: "middle" }}
            />
          </XAxis>

          {/* Y AXIS */}
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, 100]}
            ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100]}
            stroke="#374151"
            fontSize={13}
          >
            <Label
              value="LEVEL AND QUALITY OF WATER SUPPLY SERVICE, %"
              angle={-90}
              position="left"
              offset={45}
              className="fill-gray-800 text-[15px] font-semibold tracking-widest"
              style={{ textAnchor: "middle" }}
            />
          </YAxis>

          <ReferenceArea
            x1={0}
            x2={30}
            y1={0}
            y2={30}
            fill="#dc2626"
            fillOpacity={0.9}
          />

          {/* POOR (PINK - split into 2 non-overlapping blocks) */}

          {/* bottom-right part (x 30-50, y 0-30) */}
          <ReferenceArea
            x1={30}
            x2={50}
            y1={0}
            y2={30}
            fill="#ec4899"
            fillOpacity={0.9}
          />

          {/* left-middle part (x 0-50, y 30-52) */}
          <ReferenceArea
            x1={0}
            x2={50}
            y1={30}
            y2={52}
            fill="#ec4899"
            fillOpacity={0.9}
          />
          <ReferenceArea
            x1={0}
            x2={50}
            y1={52}
            y2={100}
            fill="#475569"
            fillOpacity={0.85}
          />
          <ReferenceArea
            x1={50}
            x2={100}
            y1={0}
            y2={52}
            fill="#15803d"
            fillOpacity={0.85}
          />
          <ReferenceArea
            x1={50}
            x2={100}
            y1={52}
            y2={100}
            fill="#d5d906"
            fillOpacity={0.85}
          />

          {/* LAYER 2: TOP-RIGHT SUB-ZONE OVERLAYS */}
          <ReferenceArea
            x1={70}
            x2={100}
            y1={70}
            y2={100}
            fill="#84cc16"
            fillOpacity={0.55}
          />
          <ReferenceArea
            x1={80}
            x2={100}
            y1={80}
            y2={100}
            fill="#06b6d4"
            fillOpacity={0.55}
          />
          <ReferenceArea
            x1={90}
            x2={100}
            y1={90}
            y2={100}
            fill="#22d3ee"
            fillOpacity={0.55}
          />
          <ReferenceArea
            x1={95}
            x2={100}
            y1={95}
            y2={100}
            fill="#1e40af"
            fillOpacity={0.6}
          />

          <CartesianGrid
            stroke="#0f172a"
            strokeWidth={1.8}
            strokeDasharray="3 3"
            opacity={0.9}
          />
          {/* LAYER 4: MAIN DIVISION LINES */}
          <ReferenceLine x={50} stroke="#1f2937" strokeWidth={3} />
          <ReferenceLine y={52} stroke="#1f2937" strokeWidth={3} />

          {/* LAYER 5: TEXT LABELS OVERLAYS */}
          <ReferenceArea
            x1={5}
            x2={25}
            y1={8}
            y2={18}
            fill="none"
            label={{
              value: "9. VERY POOR",
              fill: "white",
              fontSize: 13.5,
              fontWeight: "700",
            }}
          />

          <ReferenceArea
            x1={33}
            x2={48}
            y1={25}
            y2={15}
            fill="none"
            label={{
              value: "8. POOR",
              fill: "white",
              fontSize: 13.5,
              fontWeight: "700",
            }}
          />

          <ReferenceArea
            x1={10}
            x2={42}
            y1={62}
            y2={85}
            fill="none"
            label={{
              value: "7. INACTIVE",
              fill: "white",
              fontSize: 14,
              fontWeight: "700",
            }}
          />

          <ReferenceArea
            x1={65}
            x2={90}
            y1={22}
            y2={35}
            fill="none"
            label={{
              value: "6. ACTIVE",
              fill: "white",
              fontSize: 14,
              fontWeight: "700",
            }}
          />

          <ReferenceArea
            x1={82}
            x2={68}
            y1={65}
            y2={62}
            fill="none"
            label={{
              value: "5. IMPROVING",
              fill: "#1f2937",
              fontSize: 13,
              fontWeight: "700",
            }}
          />

          <ReferenceArea
            x1={75}
            x2={79}
            y1={71}
            y2={79}
            fill="none"
            label={{
              value: "4. IMPROVED",
              fill: "#1f2937",
              fontSize: 13,
              fontWeight: "700",
            }}
          />

          <ReferenceArea
            x1={95}
            x2={84}
            y1={81}
            y2={87}
            fill="none"
            label={{
              value: "3. JUST EFFICIENT",
              fill: "#1f2937",
              fontSize: 12,
              fontWeight: "700",
            }}
          />
<ReferenceArea
  x1={90}
  x2={100}
  y1={90}
  y2={95}
  fill="#06b6d4"
  fillOpacity={0.55}
  label={({ viewBox }) => {
    const { x, y, width, height } = viewBox;

    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10.5}
        fontWeight="700"
        fill="#0f172a"
      >
        <tspan x={x + width / 2} dy="-6">
           MODERATELY
        </tspan>
        <tspan x={x + width / 2} dy="14">
          EFFICIENT
        </tspan>
      </text>
    );
  }}
/>
          <ReferenceArea
            x1={100}
            x2={100}
            y1={100}
            y2={99}
            fill="none"
            label={{
              value: "1. HIGHLY EFFICIENT",
              position: "top",
              fill: "blue",
              fontSize: 11.5,
              fontWeight: "700",
            }}
          />

          <Tooltip
            content={<ChartTooltip />}
            cursor={{
              stroke: "#374151",
              strokeWidth: 1.5,
              strokeDasharray: "3 3",
            }}
          />

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
