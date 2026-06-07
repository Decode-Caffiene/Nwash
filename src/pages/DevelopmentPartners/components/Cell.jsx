import React from "react";
import { TYPE_META, GAP } from "../data/partnersData";

export default function Cell({ cell, idx, isHov, onHov, onOut, onClick }) {
  const T = TYPE_META[cell.type];
  const gx = cell.x + GAP / 2;
  const gy = cell.y + GAP / 2;
  const gw = Math.max(cell.w - GAP, 2);
  const gh = Math.max(cell.h - GAP, 2);

  const big = gw > 130 && gh > 90;
  const med = gw > 75 && gh > 55;
  const show = gw > 38 && gh > 28;

  const nameFontSize = big
    ? Math.min(gw / 6.5, 19)
    : med
      ? Math.min(gw / 7, 15)
      : Math.min(gw / 5, 12);
  const valueFontSize = big ? Math.min(gw / 7, 16) : Math.min(gw / 8, 12);

  return (
    <div
      onMouseEnter={() => onHov(cell.id)}
      onMouseLeave={onOut}
      onClick={() => onClick(cell)}
      title={cell.name}
      style={{
        position: "absolute",
        left: gx,
        top: gy,
        width: gw,
        height: gh,
        borderRadius: 6,
        cursor: "pointer",
        overflow: "hidden",
        background: isHov
          ? `linear-gradient(145deg, ${T.light} 0%, ${T.mid} 60%)`
          : `linear-gradient(145deg, ${T.mid} 0%, ${T.bg} 75%)`,
        boxShadow: isHov
          ? `0 0 0 2.5px rgba(255,255,255,0.85), 0 10px 32px rgba(0,0,0,0.35)`
          : `inset 0 0 0 1px rgba(255,255,255,0.10)`,
        transform: isHov ? "scale(1.025)" : "scale(1)",
        zIndex: isHov ? 20 : 1,
        transition:
          "transform 0.20s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, background 0.18s ease",
        animation: "cellIn 350ms cubic-bezier(0.22,1,0.36,1) both",
        animationDelay: `${idx * 28}ms`,
      }}
    >
      {show && (
        <div
          style={{
            padding: big ? "13px 13px 10px" : "8px 9px 7px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: med ? "space-between" : "flex-start",
          }}
        >
          <div>
            {big && (
              <div
                style={{
                  fontSize: Math.min(gw / 6, 22),
                  marginBottom: 5,
                  lineHeight: 1,
                }}
              >
                {cell.icon}
              </div>
            )}
            <div
              style={{
                fontSize: nameFontSize,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                textShadow: "0 1px 4px rgba(0,0,0,0.30)",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: big ? 2 : 1,
                WebkitBoxOrient: "vertical",
              }}
            >
              {big ? cell.name : med ? cell.abbr : cell.abbr.slice(0, 4)}
            </div>
            {big && (
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.55)",
                  marginTop: 2,
                }}
              >
                {cell.country}
              </div>
            )}
          </div>
          {med && (
            <div>
              <div
                style={{
                  fontSize: valueFontSize,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.92)",
                }}
              >
                {cell.investment}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
