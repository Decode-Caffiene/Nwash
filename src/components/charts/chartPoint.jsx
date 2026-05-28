


import React from "react";

export default function ChartPoint({ cx, cy, payload }) {
  if (cx === undefined || cy === undefined) return null;

  const isHighlighted = payload?.isHighlighted;

  return (
    <g
      className="analytics-point"
      transform={`translate(${cx}, ${cy}) scale(${isHighlighted ? 1.2 : 1})`}
    >

      {isHighlighted && (
        <circle r={12} fill="#f97316" opacity={0.15} />
      )}

      <path
        d="M0 -11C-5.2 -11 -9 -7 -9 -2C-9 4 0 11 0 11C0 11 9 4 9 -2C9 -7 5.2 -11 0 -11Z"
        fill={isHighlighted ? "#ea580c" : "#0f766e"}
        stroke="#fff"
        strokeWidth={1.5}
      />

      <circle r={3} fill="#fff" />
    </g>
  );
}