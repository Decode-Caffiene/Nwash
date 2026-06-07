import React from "react";
import { TYPE_META } from "../data/partnersData";

export default function Tooltip({ partner, mx, my }) {
  if (!partner) return null;
  const T = TYPE_META[partner.type];
  const W = 220;
  let left = mx + 18;
  let top = my - 55;
  if (left + W > window.innerWidth - 12) left = mx - W - 18;
  if (top < 8) top = my + 12;

  return (
    <div
      style={{
        position: "fixed",
        left,
        top,
        width: W,
        zIndex: 3000,
        pointerEvents: "none",
        background: "#0c1e12",
        borderRadius: 10,
        padding: "14px 15px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        border: "1px solid rgba(116,198,157,0.18)",
        animation: "fadeUp 0.13s ease both",
        fontFamily: "'Noto Sans', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 9,
        }}
      >
        <span style={{ fontSize: 20 }}>{partner.icon}</span>
        <div>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.2,
            }}
          >
            {partner.name}
          </div>
          <span
            style={{
              fontSize: 8.5,
              fontWeight: 700,
              padding: "1px 7px",
              borderRadius: 20,
              background: T.badge,
              color: T.badgeText,
              display: "inline-block",
            }}
          >
            {partner.type}
          </span>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 9,
        }}
      >
        {[
          { label: "Investment", val: partner.investment, accent: true },
          { label: "Projects", val: partner.activeProjects },
        ].map((m, i) => (
          <div
            key={i}
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 6,
              padding: "7px 9px",
            }}
          >
            <div
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.40)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 2,
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: m.accent ? "#74c69d" : "#fff",
              }}
            >
              {m.val}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontSize: 9.5,
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.6,
        }}
      >
        {partner.provinces.join(" · ")}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 9.5,
          color: "rgba(116,198,157,0.7)",
          fontWeight: 500,
          letterSpacing: "0.04em",
        }}
      >
        Click to view full profile →
      </div>
    </div>
  );
}
