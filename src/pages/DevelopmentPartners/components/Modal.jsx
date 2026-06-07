import React from "react";
import { TYPE_META } from "../data/partnersData";

export default function Modal({ partner, onClose, allPartners }) {
  if (!partner) return null;
  const T = TYPE_META[partner.type];
  const maxV = Math.max(...allPartners.map((p) => p.value));
  const pct = (partner.value / maxV) * 100;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(8,18,12,0.70)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.18s ease both",
        fontFamily: "'Noto Sans', sans-serif",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 580,
          maxHeight: "88vh",
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 100px rgba(0,0,0,0.40)",
          animation: "scaleIn 0.24s cubic-bezier(0.34,1.2,0.64,1) both",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: `linear-gradient(140deg, ${T.light} 0%, ${T.bg} 100%)`,
            padding: "24px 26px 22px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div
                style={{
                  fontSize: 42,
                  lineHeight: 1,
                  filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))",
                }}
              >
                {partner.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
                  {partner.name}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "rgba(255,255,255,0.60)",
                    marginTop: 3,
                  }}
                >
                  Active since {partner.since}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: 10,
                  fontWeight: 700,
                  background: T.badge,
                  color: T.badgeText,
                }}
              >
                {partner.type}
              </span>
              <button
                onClick={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.18)",
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: 18,
                  lineHeight: "32px",
                  textAlign: "center",
                  transition: "background 0.15s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Metrics row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 8,
            }}
          >
            {[
              { label: "Total Investment", val: partner.investment, big: true },
              { label: "Active Projects", val: partner.activeProjects },
              { label: "Provinces Covered", val: partner.provinces.length },
            ].map((m, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(0,0,0,0.22)",
                  borderRadius: 9,
                  padding: "11px 13px",
                }}
              >
                <div
                  style={{
                    fontSize: 8.5,
                    color: "rgba(255,255,255,0.45)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 3,
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontSize: m.big ? 18 : 16,
                    fontWeight: 700,
                    color: "#fff",
                  }}
                >
                  {m.val}
                </div>
              </div>
            ))}
          </div>

          {/* Contribution bar */}
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.45)",
                  textTransform: "uppercase",
                  letterSpacing: "0.09em",
                }}
              >
                Relative Contribution
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: "rgba(255,255,255,0.55)",
                  fontWeight: 600,
                }}
              >
                {pct.toFixed(1)}%
              </span>
            </div>
            <div
              style={{
                height: 5,
                background: "rgba(0,0,0,0.30)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: "#74c69d",
                  borderRadius: 3,
                  transition: "width 0.8s cubic-bezier(0.22,1,0.36,1)",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div
          style={{
            overflowY: "auto",
            padding: "20px 26px 26px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Description */}
          <p style={{ fontSize: 13, color: "#2a4030", lineHeight: 1.75 }}>
            {partner.desc}
          </p>

          {/* Projects */}
          <div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: T.mid,
                textTransform: "uppercase",
                marginBottom: 9,
              }}
            >
              Active Projects
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {partner.projects.map((p, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 12,
                    color: "#555",
                    paddingLeft: 16,
                    borderLeft: `2px solid ${T.light}`,
                  }}
                >
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Sectors + Provinces */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: T.mid,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Sectors
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {partner.sectors.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 11,
                      padding: "4px 10px",
                      background: T.surface,
                      color: T.textDark,
                      borderRadius: 12,
                      fontWeight: 500,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: T.mid,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Provinces
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {partner.provinces.map((p, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 11,
                      padding: "4px 10px",
                      background: T.surface,
                      color: T.textDark,
                      borderRadius: 12,
                      fontWeight: 500,
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Focal point */}
          <div
            style={{
              padding: "12px 14px",
              background: "#f6faf7",
              borderRadius: 9,
              border: "1px solid #ddeee4",
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                background: T.mid,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#fff", fontSize: 14 }}>👤</span>
            </div>
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: T.mid,
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                Focal Point
              </div>
              <div style={{ fontSize: 12, color: "#2a4030", fontWeight: 500 }}>
                {partner.focal}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
