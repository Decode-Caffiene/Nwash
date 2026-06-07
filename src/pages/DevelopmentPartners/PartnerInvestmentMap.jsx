import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { PARTNERS, TYPE_META, TYPES } from "./data/partnersData";
import { squarify, useCountUp, formatInvestment } from "./utils/helpers";
import Cell from "./components/Cell";
import Tooltip from "./components/Tooltip";
import Modal from "./components/Modal";

export default function PartnerInvestmentMap() {
  const [filter, setFilter] = useState("All");
  const [hov, setHov] = useState(null);
  const [modal, setModal] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 900, h: 480 });

  useEffect(() => {
    const obs = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setDims({ w: Math.max(width, 100), h: Math.max(height, 100) });
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const filtered = useMemo(
    () =>
      filter === "All" ? PARTNERS : PARTNERS.filter((p) => p.type === filter),
    [filter],
  );

  const cells = useMemo(
    () => squarify(filtered, 0, 0, dims.w, dims.h),
    [filtered, dims],
  );

  const hovPartner = useMemo(
    () => (hov ? filtered.find((p) => p.id === hov) : null),
    [hov, filtered],
  );
  const totalRaw = useMemo(
    () => filtered.reduce((s, p) => s + p.value, 0),
    [filtered],
  );
  const counting = useCountUp(totalRaw, 900);
  const totalFmt = formatInvestment(counting);

  const typeTotals = useMemo(
    () =>
      TYPES.reduce((acc, t) => {
        acc[t] = PARTNERS.filter((p) => p.type === t).reduce(
          (s, p) => s + p.value,
          0,
        );
        return acc;
      }, {}),
    [],
  );

  const handleMouseMove = useCallback((e) => {
    setMouse({ x: e.clientX, y: e.clientY });
  }, []);

  const handleOut = useCallback(() => setHov(null), []);

  return (
    <div
      style={{
        width: "100%",
        height: "600px",
        display: "flex",
        flexDirection: "column",
        background: "#0f1e15",
        fontFamily: "'Noto Sans', sans-serif",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.94) translateY(10px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        @keyframes cellIn { from { opacity: 0; transform: scale(0.86) } to { opacity: 1; transform: scale(1) } }
      `}</style>

      {/* TOP CHROME */}
      <div
        style={{
          background: "linear-gradient(180deg, #0c1910 0%, #121f16 100%)",
          borderBottom: "1px solid rgba(45,106,79,0.35)",
          padding: "14px 22px 12px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <div
            style={{
              width: 4,
              height: 36,
              background: "#be1e2d",
              borderRadius: 2,
            }}
          ></div>
          <div
            style={{
              width: 4,
              height: 36,
              background: "#003893",
              borderRadius: 2,
            }}
          ></div>
        </div>

        <div>
          <div
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Partners Investment
          </div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Development Partners Map
          </div>
        </div>

        <div style={{ flex: 1 }}></div>

        {/* Total counter */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 1,
            }}
          >
            Total Commitment · {filtered.length} partner
            {filtered.length !== 1 ? "s" : ""}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#74c69d",
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            {totalFmt}
          </div>
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 2,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 9,
            padding: "3px",
            flexShrink: 0,
          }}
        >
          {["All", ...TYPES].map((t) => {
            const active = filter === t;
            return (
              <button
                key={t}
                onClick={() => setFilter(t)}
                style={{
                  background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  border: "none",
                  color: "#fff",
                  padding: "6px 12px",
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.18s",
                  whiteSpace: "nowrap",
                }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* TREEMAP */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          background: "#182d1f",
          margin: "10px 12px 6px",
          borderRadius: 10,
          border: "1px solid rgba(45,106,79,0.30)",
          boxShadow: "inset 0 2px 20px rgba(0,0,0,0.25)",
        }}
      >
        {cells.map((cell, idx) => (
          <Cell
            key={`${cell.id}-${filter}`}
            cell={cell}
            idx={idx}
            isHov={hov === cell.id}
            onHov={setHov}
            onOut={handleOut}
            onClick={setModal}
          />
        ))}
      </div>

      {/* LEGEND */}
      <div
        style={{
          padding: "6px 16px 12px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexShrink: 0,
          flexWrap: "wrap",
          background: "#0f1e15",
          borderTop: "1px solid rgba(45,106,79,0.30)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            flexShrink: 0,
          }}
        >
          Partner Type
        </div>
        {TYPES.map((t) => {
          const T = TYPE_META[t];
          const count = PARTNERS.filter((p) => p.type === t).length;
          const total = typeTotals[t];
          const fmtT = formatInvestment(total);
          const dim = filter !== "All" && filter !== t;
          return (
            <div
              key={t}
              onClick={() => setFilter(filter === t ? "All" : t)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                cursor: "pointer",
                opacity: dim ? 0.3 : 1,
                transition: "opacity 0.2s",
              }}
            >
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 3,
                  background: T.mid,
                  flexShrink: 0,
                }}
              ></div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {t}
              </span>
              <span style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)" }}>
                {count} · {fmtT}
              </span>
            </div>
          );
        })}
        <div style={{ flex: 1 }}></div>
        <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.22)" }}>
          Cell size ∝ total investment · Hover to preview · Click to open
          profile
        </div>
      </div>

      {/* TOOLTIP */}
      {hovPartner && <Tooltip partner={hovPartner} mx={mouse.x} my={mouse.y} />}

      {/* MODAL */}
      {modal && (
        <Modal
          partner={modal}
          onClose={() => setModal(null)}
          allPartners={PARTNERS}
        />
      )}
    </div>
  );
}
