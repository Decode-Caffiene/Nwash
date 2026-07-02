

import React from "react";

const MARKER_BLUE = "#1e40af";
const MARKER_HIGHLIGHT = "#f97316";

export default function ChartPoint({ cx, cy, payload }) {
  if (cx === undefined || cy === undefined) return null;

  const { isHighlighted } = payload || {};
  const color = isHighlighted ? MARKER_HIGHLIGHT : MARKER_BLUE;

  return (
    <g
      className="analytics-point"
      transform={`translate(${cx}, ${cy}) scale(${isHighlighted ? 1.25 : 1})`}
    >
      {isHighlighted && (
        <circle r={8} fill={color} opacity={0.25} />
      )}

      <path
        d="M0 -6C-3 -6 -5 -3.5 -5 -1C-5 2 0 6 0 6C0 6 5 2 5 -1C5 -3.5 3 -6 0 -6Z"
        fill={color}
        stroke="#fff"
        strokeWidth={1.5}
      />

      <circle r={2} fill="#fff" />
    </g>
  );
}