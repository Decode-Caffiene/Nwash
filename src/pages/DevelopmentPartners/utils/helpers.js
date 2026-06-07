import { useEffect, useState } from "react";

// Squarified Treemap Algorithm
export function squarify(data, x, y, w, h) {
  if (!data.length || w <= 0 || h <= 0) return [];
  const totalVal = data.reduce((s, d) => s + d.value, 0);
  const pixArea = w * h;
  const items = [...data]
    .sort((a, b) => b.value - a.value)
    .map((d) => ({ ...d, area: (d.value / totalVal) * pixArea }));

  const result = [];

  function worst(row, ss) {
    const s = row.reduce((a, b) => a + b.area, 0);
    const maxA = Math.max(...row.map((d) => d.area));
    const minA = Math.min(...row.map((d) => d.area));
    const ss2 = ss * ss;
    return Math.max((ss2 * maxA) / (s * s), (s * s) / (ss2 * minA));
  }

  function placeRow(row, rx, ry, rw, rh) {
    const s = row.reduce((a, b) => a + b.area, 0);
    if (rw >= rh) {
      const sw = s / rh;
      let cy = ry;
      row.forEach((item) => {
        const sh = item.area / sw;
        result.push({ ...item, x: rx, y: cy, w: sw, h: sh });
        cy += sh;
      });
    } else {
      const sh = s / rw;
      let cx = rx;
      row.forEach((item) => {
        const sw = item.area / sh;
        result.push({ ...item, x: cx, y: ry, w: sw, h: sh });
        cx += sw;
      });
    }
  }

  function sq(items, rx, ry, rw, rh) {
    if (!items.length) return;
    if (items.length === 1) {
      result.push({ ...items[0], x: rx, y: ry, w: rw, h: rh });
      return;
    }
    let row = [];
    let rem = [...items];
    let cx = rx,
      cy = ry,
      cw = rw,
      ch = rh;
    while (rem.length > 0) {
      const ss = Math.min(cw, ch);
      const next = rem[0];
      if (row.length === 0 || worst([...row, next], ss) <= worst(row, ss)) {
        row.push(rem.shift());
      } else {
        placeRow(row, cx, cy, cw, ch);
        const s = row.reduce((a, b) => a + b.area, 0);
        if (cw >= ch) {
          cx += s / ch;
          cw -= s / ch;
        } else {
          cy += s / cw;
          ch -= s / cw;
        }
        row = [];
      }
    }
    if (row.length) placeRow(row, cx, cy, cw, ch);
  }

  sq(items, x, y, w, h);
  return result;
}

// Count-up animation hook
export function useCountUp(target, duration = 1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = null;
    const from = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(from + (target - from) * ease));
      if (progress < 1) requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [target]);
  return val;
}

// Format investment value
export function formatInvestment(value) {
  return value >= 1000000
    ? `$${(value / 1000000).toFixed(1)}M`
    : `$${(value / 1000).toFixed(0)}K`;
}
