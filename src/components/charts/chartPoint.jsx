

import React from "react";

export default function ChartPoint({ cx, cy, payload }) {
  if (cx === undefined || cy === undefined) return null;

  const isHighlighted = payload?.isHighlighted;

  return (
    <g
      className="analytics-point"
      transform={`translate(${cx}, ${cy}) scale(${isHighlighted ? 1.25 : 1})`}
    >
      {isHighlighted && (
        <circle r={14} fill="#f59e0b" opacity={0.25} />
      )}

      <path
        d="M0 -11C-5.2 -11 -9 -7 -9 -2C-9 4 0 11 0 11C0 11 9 4 9 -2C9 -7 5.2 -11 0 -11Z"
        fill={isHighlighted ? "#f97316" : "#22d3ee"}
        stroke="#fff"
        strokeWidth={2}
      />

      <circle r={3} fill="#fff" />
    </g>
  );
}