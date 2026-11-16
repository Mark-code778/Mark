// Плоская 2D-сцена (SVG): фоны локаций, предметы, стикмены, речевые облачка, частицы.
import React, { useMemo } from "react";
import { FONT } from "../fonts";
import type { Theme } from "../theme";
import { actorStateAt, buildSegments } from "../three/actor";
import type { WorldInput } from "../three/World";
import type { Actor, Prop } from "../types";
import { hashStr, rng } from "../util";
import { flatCamera, type Proj } from "./cam";
import { Figure, INK } from "./Figure";

type Bubble = { actor: string; text: string; at?: number; until?: number };
type El = { z: number; el: React.ReactNode };

const C = {
  frame: "#4a5166",
  skyTop: "#a9b8cc",
  skyBot: "#e4e2dc",
  city: "#6f7891",
  cityFar: "#8d96ad",
};

const rr = (proj: Proj, x1: number, y1: number, x2: number, y2: number, z: number) => {
  const a = proj(x1, y2, z).xy;
  const b = proj(x2, y1, z).xy;
  return { x: a[0], y: a[1], width: Math.max(0, b[0] - a[0]), height: Math.max(0, b[1] - a[1]) };
};

const Txt: React.FC<{ lines: string[]; cx: number; cy: number; w: number; h: number; color?: string }> = ({ lines, cx, cy, w, h, color = "#fff" }) => {
  const n = Math.max(1, lines.length);
  const longest = Math.max(4, ...lines.map((l) => l.length));
  const fs = Math.min((h / n) * 0.62, (w * 1.35) / longest);
  return (
    <g>
      {lines.map((l, i) => (
        <text key={i} x={cx} y={cy + (i - (n - 1) / 2) * fs * 1.12 + fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={color}>
          {l.toUpperCase()}
        </text>
      ))}
    </g>
  );
};

// экран/доска с текстом и полосой прогресса (на стене или отдельным предметом)
const Board: React.FC<{ proj: Proj; x: number; y: number; z: number; w: number; h: number; lines: string[]; progress?: { label?: string; from: number; to: number }; t: number; len: number }> = ({
  proj,
  x,
  y,
  z,
  w,
  h,
  lines,
  progress,
  t,
  len,
}) => {
  const r = rr(proj, x - w / 2, y, x + w / 2, y + h, z);
  const s = proj(x, y, z).s;
  const pv = progress ? progress.from + (progress.to - progress.from) * Math.min(1, t / Math.max(0.01, len)) : 0;
  return (
    <g>
      <rect {...r} rx={0.06 * s} fill="#23283a" stroke="#3b4258" strokeWidth={0.07 * s} />
      <Txt lines={lines.filter(Boolean)} cx={r.x + r.width / 2} cy={r.y + r.height * (progress ? 0.38 : 0.5)} w={r.width * 0.86} h={r.height * (progress ? 0.6 : 0.8)} />
      {progress ? (
        <g>
          <rect x={r.x + r.width * 0.1} y={r.y + r.height * 0.74} width={r.width * 0.8} height={r.height * 0.07} rx={r.height * 0.035} fill="#3d4560" />
          <rect x={r.x + r.width * 0.1} y={r.y + r.height * 0.74} width={r.width * 0.8 * (pv / 100)} height={r.height * 0.07} rx={r.height * 0.035} fill="#4fd1c5" />
          <text x={r.x + r.width * 0.1} y={r.y + r.height * 0.92} fontFamily={FONT} fontWeight={800} fontSize={r.height * 0.08} fill="#cfd6e6">
            {`${(progress.label ?? "").toUpperCase()} ${Math.round(pv)}%`}
          </text>
        </g>
      ) : null}
    </g>
  );
};

const Clock: React.FC<{ proj: Proj; x: number; y: number; z: number; r: number; t: number }> = ({ proj, x, y, z, r, t }) => {
  const c = proj(x, y, z);
  const R = r * c.s;
  const a1 = t * 0.6 - 1.2;
  const a2 = t * 0.05 + 0.6;
  return (
    <g>
      <circle cx={c.xy[0]} cy={c.xy[1]} r={R} fill="#fbf6ea" stroke="#2b2f3c" strokeWidth={R * 0.12} />
      <path d={`M${c.xy[0]},${c.xy[1]} l${Math.sin(a1) * R * 0.75},${-Math.cos(a1) * R * 0.75}`} stroke="#2b2f3c" strokeWidth={R * 0.08} strokeLinecap="round" />
      <path d={`M${c.xy[0]},${c.xy[1]} l${Math.sin(a2) * R * 0.5},${-Math.cos(a2) * R * 0.5}`} stroke="#2b2f3c" strokeWidth={R * 0.11} strokeLinecap="round" />
    </g>
  );
};

const Desk: React.FC<{ proj: Proj; x: number; z: number; monitor?: boolean; w?: number; color?: string }> = ({ proj, x, z, monitor = true, w = 2.3, color = "#e3d4b6" }) => {
  const s = proj(x, 0, z).s;
  const top = rr(proj, x - w / 2, 0.74, x + w / 2, 0.82, z);
  const legs = [x - w / 2 + 0.12, x + w / 2 - 0.12].map((lx) => rr(proj, lx - 0.03, 0, lx + 0.03, 0.75, z));
  return (
    <g>
      {legs.map((l, i) => (
        <rect key={i} {...l} fill="#2f3443" />
      ))}
      <rect {...top} fill={color} />
      {monitor ? (
        <g>
          <rect {...rr(proj, x - 0.03, 0.82, x + 0.03, 1.02, z)} fill="#2f3443" />
          <rect {...rr(proj, x - 0.18, 0.82, x + 0.18, 0.85, z)} fill="#2f3443" />
          <rect {...rr(proj, x - 0.48, 1.0, x + 0.48, 1.58, z)} fill="#262a35" rx={0.03 * s} />
          <rect {...rr(proj, x - 0.42, 1.05, x + 0.42, 1.53, z)} fill="#4b91cc" />
        </g>
      ) : null}
    </g>
  );
};

// ── предметы ─────────────────────────────────────────
const PropEl: React.FC<{ p: Prop; proj: Proj; t: number; len: number }> = ({ p, proj, t, len }) => {
  const k = p.scale ?? 1;
  const y0 = p.y ?? 0;
  const x = p.x;
  const z = p.z;
  const s = proj(x, y0, z).s;
  const R = (x1: number, y1: number, x2: number, y2: number) => rr(proj, x + x1 * k, y0 + y1 * k, x + x2 * k, y0 + y2 * k, z);
  const flip = Math.abs(((p.rotation ?? 0) % 360) + 360) % 360 > 90 && Math.abs(((p.rotation ?? 0) % 360) + 360) % 360 < 270;
  switch (p.type) {
    case "car": {
      const col = p.color ?? "#e0453a";
      const L = 4.2;
      const body = R(-L / 2, 0.3, L / 2, 1.0);
      const cab = rr(proj, x - 1.2 * k, y0 + 0.95 * k, x + 0.9 * k, y0 + 1.65 * k, z);
      const wheel = (wx: number) => {
        const c = proj(x + wx * k, y0 + 0.36 * k, z);
        return (
          <g key={wx}>
            <circle cx={c.xy[0]} cy={c.xy[1]} r={0.38 * k * s} fill="#1d1f26" />
            <circle cx={c.xy[0]} cy={c.xy[1]} r={0.17 * k * s} fill="#c9ccd4" />
          </g>
        );
      };
      return (
        <g transform={flip ? `translate(${2 * proj(x, 0, z).xy[0]},0) scale(-1,1)` : undefined}>
          <ellipse cx={proj(x, 0, z).xy[0]} cy={proj(x, 0, z).xy[1]} rx={2.3 * k * s} ry={0.12 * k * s} fill="#000" opacity={0.15} />
          <rect {...cab} rx={0.3 * k * s} fill={col} />
          <rect {...rr(proj, x - 1.05 * k, y0 + 1.05 * k, x - 0.2 * k, y0 + 1.52 * k, z)} rx={0.1 * k * s} fill="#bfe3f2" />
          <rect {...rr(proj, x - 0.1 * k, y0 + 1.05 * k, x + 0.75 * k, y0 + 1.52 * k, z)} rx={0.1 * k * s} fill="#bfe3f2" />
          <rect {...body} rx={0.25 * k * s} fill={col} />
          <rect {...rr(proj, x - L / 2 * k, y0 + 0.62 * k, x + L / 2 * k, y0 + 0.68 * k, z)} fill="#000" opacity={0.12} />
          <rect {...rr(proj, x + 1.85 * k, y0 + 0.62 * k, x + 2.1 * k, y0 + 0.8 * k, z)} rx={0.05 * s} fill="#fff1b8" />
          {wheel(-1.3)}
          {wheel(1.3)}
        </g>
      );
    }
    case "clock":
      return <Clock proj={proj} x={x} y={y0 + 0.5 * k} z={z} r={0.42 * k} t={t} />;
    case "screen":
      return <Board proj={proj} x={x} y={y0 + 1.3 * k} z={z} w={2.6 * k} h={1.5 * k} lines={p.lines ?? (p.label ? [p.label] : [])} progress={p.progress} t={t} len={len} />;
    case "phone":
      return (
        <g>
          <rect {...R(-0.5, 0.3, 0.5, 2.1)} rx={0.12 * k * s} fill="#23262f" />
          <rect {...R(-0.42, 0.42, 0.42, 1.98)} rx={0.08 * k * s} fill="#7fd3ff" />
        </g>
      );
    case "sign": {
      const lines = p.lines ?? [p.label ?? ""];
      const b = R(-0.9, 1.4, 0.9, 2.4);
      return (
        <g>
          <rect {...R(-0.05, 0, 0.05, 1.5)} fill="#7a6a5a" />
          <rect {...b} rx={0.06 * s} fill="#2bb3a3" stroke="#fff" strokeWidth={0.05 * s} />
          <Txt lines={lines} cx={b.x + b.width / 2} cy={b.y + b.height / 2} w={b.width * 0.85} h={b.height * 0.75} />
        </g>
      );
    }
    case "table":
      return <Desk proj={proj} x={x} z={z} monitor={false} w={1.6 * k} color="#c9935e" />;
    case "chair":
      return (
        <g>
          <rect {...R(-0.3, 0.45, 0.3, 0.52)} fill="#7a5238" />
          <rect {...R(-0.3, 0, -0.25, 1.1)} fill="#7a5238" />
          <rect {...R(0.25, 0, 0.3, 0.5)} fill="#7a5238" />
        </g>
      );
    case "bench":
      return (
        <g>
          <rect {...R(-1.1, 0, -1.0, 0.45)} fill="#3b3f4f" />
          <rect {...R(1.0, 0, 1.1, 0.45)} fill="#3b3f4f" />
          <rect {...R(-1.2, 0.42, 1.2, 0.52)} rx={0.03 * s} fill="#b07a4a" />
          <rect {...R(-1.2, 0.75, 1.2, 0.85)} rx={0.03 * s} fill="#b07a4a" />
          <rect {...R(-1.2, 0.98, 1.2, 1.08)} rx={0.03 * s} fill="#b07a4a" />
        </g>
      );
    case "lamp": {
      const c = proj(x, y0 + 3.2 * k, z);
      return (
        <g>
          <rect {...R(-0.05, 0, 0.05, 3.1)} fill="#2f3443" />
          <circle cx={c.xy[0]} cy={c.xy[1]} r={0.2 * k * s} fill="#fff3c4" />
        </g>
      );
    }
    case "tree": {
      const c = proj(x, y0 + 2.4 * k, z);
      return (
        <g>
          <rect {...R(-0.12, 0, 0.12, 1.8)} fill="#7a5238" />
          <circle cx={c.xy[0]} cy={c.xy[1]} r={1.0 * k * s} fill="#4fa860" />
          <circle cx={c.xy[0] - 0.55 * k * s} cy={c.xy[1] + 0.25 * k * s} r={0.7 * k * s} fill="#46995a" />
          <circle cx={c.xy[0] + 0.6 * k * s} cy={c.xy[1] + 0.2 * k * s} r={0.65 * k * s} fill="#5bb46a" />
        </g>
      );
    }
    case "plant": {
      const c = proj(x, y0 + 0.75 * k, z);
      return (
        <g>
          <path d={`M${R(-0.25, 0, 0.25, 0.45).x},${R(-0.25, 0, 0.25, 0.45).y} h${0.5 * k * s} l${-0.06 * k * s},${0.45 * k * s} h${-0.38 * k * s} Z`} fill="#d9773f" />
          <circle cx={c.xy[0]} cy={c.xy[1]} r={0.33 * k * s} fill="#4fa860" />
          <circle cx={c.xy[0] - 0.2 * k * s} cy={c.xy[1] + 0.12 * k * s} r={0.22 * k * s} fill="#46995a" />
        </g>
      );
    }
    case "door":
      return (
        <g>
          <rect {...R(-0.6, 0, 0.6, 2.4)} fill="#2bb3a3" stroke="#1f7f75" strokeWidth={0.06 * s} />
          <circle cx={proj(x + 0.4 * k, y0 + 1.15 * k, z).xy[0]} cy={proj(x + 0.4 * k, y0 + 1.15 * k, z).xy[1]} r={0.06 * k * s} fill="#f2c230" />
        </g>
      );
    case "box":
      return <rect {...R(-0.5, 0, 0.5, 0.7)} rx={0.04 * s} fill={p.color ?? "#d9a066"} />;
    case "bed":
      return (
        <g>
          <rect {...R(-1.2, 0.3, 1.2, 0.65)} rx={0.05 * s} fill="#f4f6f8" stroke="#c9d3da" strokeWidth={0.03 * s} />
          <rect {...R(-1.25, 0, -1.15, 1.1)} fill="#9aa7b4" />
          <rect {...R(1.15, 0, 1.25, 0.8)} fill="#9aa7b4" />
          <rect {...R(-1.1, 0.62, -0.6, 0.8)} rx={0.06 * s} fill="#fff" />
        </g>
      );
    case "coin": {
      const c = proj(x, y0 + 0.3 * k, z);
      return <circle cx={c.xy[0]} cy={c.xy[1]} r={0.3 * k * s} fill="#f2c230" stroke="#c99a14" strokeWidth={0.05 * k * s} />;
    }
    case "money":
      return (
        <g>
          <rect {...R(-0.45, 0, 0.45, 0.25)} rx={0.03 * s} fill="#6cbf6a" />
          <rect {...R(-0.12, 0, 0.12, 0.25)} fill="#e9f5e4" />
        </g>
      );
    case "trophy":
      return (
        <g>
          <rect {...R(-0.25, 0, 0.25, 0.12)} fill="#8a6a2a" />
          <rect {...R(-0.05, 0.1, 0.05, 0.4)} fill="#f2c230" />
          <rect {...R(-0.3, 0.4, 0.3, 0.9)} rx={0.12 * s} fill="#f2c230" />
        </g>
      );
    case "bottle":
      return (
        <g>
          <rect {...R(-0.35, 0, 0.35, 1.3)} rx={0.12 * k * s} fill={p.color ?? "#5fd0e3"} />
          <rect {...R(-0.15, 1.3, 0.15, 1.6)} fill="#9aa0aa" />
          {p.label ? <Txt lines={[p.label]} cx={R(-0.35, 0.4, 0.35, 0.9).x + R(-0.35, 0.4, 0.35, 0.9).width / 2} cy={R(-0.35, 0.4, 0.35, 0.9).y + R(-0.35, 0.4, 0.35, 0.9).height / 2} w={0.6 * k * s} h={0.4 * k * s} /> : null}
        </g>
      );
    case "syringe":
      return (
        <g>
          <rect {...R(-0.7, 0.4, 0.5, 0.65)} rx={0.05 * s} fill="#e8f6fb" stroke="#8fb6c7" strokeWidth={0.03 * s} />
          <rect {...R(0.5, 0.5, 1.0, 0.55)} fill="#8a96a3" />
        </g>
      );
    case "rock":
      return <ellipse cx={proj(x, y0 + 0.25 * k, z).xy[0]} cy={proj(x, y0 + 0.25 * k, z).xy[1]} rx={0.6 * k * s} ry={0.3 * k * s} fill="#9aa0a8" />;
    default:
      return null;
  }
};

// ── локации: фон (стены/небо) + объекты с глубиной ─────
const sky = (W: number, H: number, id: string, top: string, bot: string) => (
  <g>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="1" stopColor={bot} />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill={`url(#${id})`} />
  </g>
);

const ground = (proj: Proj, W: number, H: number, zBack: number, color: string, lines?: string, step = 0.9) => {
  const yb = proj(0, 0, zBack).xy[1];
  const out: React.ReactNode[] = [<rect key="g" x={0} y={yb} width={W} height={Math.max(0, H - yb)} fill={color} />];
  if (lines) {
    for (let z = zBack + step; z < zBack + 40; z += step) {
      const y = proj(0, 0, z).xy[1];
      if (y > H) break;
      out.push(<rect key={`l${z}`} x={0} y={y} width={W} height={Math.max(1, proj(0, 0, z).s * 0.025)} fill={lines} />);
    }
  }
  return out;
};

const skyline = (proj: Proj, x1: number, x2: number, y1: number, y2: number, z: number, seed: number) => {
  const r = rng(seed);
  const out: React.ReactNode[] = [];
  let x = x1 + 0.1;
  let i = 0;
  while (x < x2 - 0.2) {
    const w = 0.35 + r() * 0.6;
    const h = (0.25 + r() * 0.6) * (y2 - y1);
    const xe = Math.min(x2 - 0.05, x + w);
    const far = r() < 0.4;
    out.push(<rect key={`b${i}`} {...rr(proj, x, y1, xe, y1 + h * (far ? 1.1 : 1), z)} fill={far ? C.cityFar : C.city} />);
    // окна домов
    const rows = Math.floor((h - 0.1) / 0.22);
    for (let rI = 0; rI < rows; rI++)
      for (let cx = x + 0.08; cx < xe - 0.1; cx += 0.16)
        if (r() < 0.55) out.push(<rect key={`w${i}-${rI}-${cx.toFixed(2)}`} {...rr(proj, cx, y1 + 0.1 + rI * 0.22, cx + 0.06, y1 + 0.18 + rI * 0.22, z)} fill="#a6aec2" />);
    x = xe + 0.05 + r() * 0.2;
    i++;
  }
  return out;
};

const buildLocation = ({ input, proj, W, H, theme, t, len, uid }: { input: WorldInput; proj: Proj; W: number; H: number; theme: Theme; t: number; len: number; uid: string }): { back: React.ReactNode; items: El[] } => {
  const { location, scene, bg } = input;
  // в крупных планах экран на стене только мешает — прячем
  const closeShot = input.camera?.shot === "close" || input.camera?.shot === "extreme";
  const screen = closeShot ? undefined : scene.screen;
  const night = scene.time === "night";
  const back: React.ReactNode[] = [];
  const items: El[] = [];
  const wallAt = -8;
  switch (location) {
    case "office": {
      back.push(<rect key="wall" x={0} y={0} width={W} height={H} fill="#8a93a8" />);
      const wins: [number, number][] = [
        [-20, -15.5],
        [-14.5, -10],
        [-9, -4.6],
        [3.6, 8],
        [9, 13.5],
        [14.5, 19],
      ];
      wins.forEach(([a, b], i) => {
        const g = rr(proj, a, 2.9, b, 7.6, wallAt);
        back.push(<rect key={`wg${i}`} {...g} fill={`url(#sky${uid})`} />);
        back.push(...skyline(proj, a, b, 2.9, 7.0, wallAt, 11 + i * 7).map((e, j) => <g key={`sl${i}-${j}`}>{e}</g>));
        const s = proj(a, 4, wallAt).s;
        back.push(<rect key={`wf${i}`} {...g} fill="none" stroke={C.frame} strokeWidth={0.16 * s} />);
        const mid = (a + b) / 2;
        back.push(<rect key={`wm${i}`} {...rr(proj, mid - 0.06, 2.9, mid + 0.06, 7.6, wallAt)} fill={C.frame} />);
      });
      [-15, -9.5, -4.0, 3.0, 8.5, 14].forEach((px, i) => back.push(<rect key={`pl${i}`} {...rr(proj, px - 0.4, 0, px + 0.4, 12, wallAt)} fill="#7b849a" />));
      back.push(<rect key="sk" {...rr(proj, -40, 0, 40, 0.18, wallAt)} fill="#6c7489" />);
      if (screen) back.push(<Board key="scr" proj={proj} x={-0.3} y={1.55} z={wallAt} w={3.0} h={1.6} lines={screen.lines} progress={screen.progress} t={t} len={len} />);
      back.push(...ground(proj, W, H, wallAt, "#5c5967", "#4e4b58", 0.8));
      [-5.6, 0.2, 5.8].forEach((dx, i) => items.push({ z: -4.8, el: <Desk key={`d${i}`} proj={proj} x={dx} z={-4.8} /> }));
      break;
    }
    case "cafe": {
      back.push(<rect key="wall" x={0} y={0} width={W} height={H} fill="#4a3f54" />);
      [-9, -5.2, 3.4, 7.2].forEach((a, i) => {
        const g = rr(proj, a, 1.2, a + 3.2, 4.6, wallAt);
        const s = proj(a, 1, wallAt).s;
        back.push(<rect key={`w${i}`} {...g} fill="#f3a347" stroke="#382f40" strokeWidth={0.18 * s} />);
        back.push(<rect key={`wm${i}`} {...rr(proj, a + 1.55, 1.2, a + 1.65, 4.6, wallAt)} fill="#382f40" />);
        back.push(<rect key={`wh${i}`} {...rr(proj, a, 2.85, a + 3.2, 2.95, wallAt)} fill="#382f40" />);
      });
      back.push(<rect key="door" {...rr(proj, -0.75, 0, 0.75, 2.6, wallAt)} fill="#2bb3a3" stroke="#1f7f75" strokeWidth={0.1 * proj(0, 0, wallAt).s} />);
      back.push(...ground(proj, W, H, wallAt, "#3d3447", "#352d3e", 0.8));
      items.push({ z: -4.5, el: <PropEl p={{ type: "table", x: -4, z: -4.5 }} proj={proj} t={t} len={len} /> });
      items.push({ z: -4.8, el: <PropEl p={{ type: "table", x: 4.5, z: -4.8 }} proj={proj} t={t} len={len} /> });
      items.push({ z: -6, el: <PropEl p={{ type: "plant", x: -7, z: -6 }} proj={proj} t={t} len={len} /> });
      items.push({ z: -6, el: <PropEl p={{ type: "plant", x: 7.5, z: -6 }} proj={proj} t={t} len={len} /> });
      break;
    }
    case "room": {
      back.push(<rect key="wall" x={0} y={0} width={W} height={H} fill="#efe1d2" />);
      const win = rr(proj, 2.6, 1.5, 5.4, 3.7, wallAt);
      back.push(<rect key="win" {...win} fill={night ? "#2a3560" : "#cfe7f2"} stroke="#fff" strokeWidth={0.12 * proj(0, 0, wallAt).s} />);
      back.push(<rect key="winm" {...rr(proj, 3.95, 1.5, 4.05, 3.7, wallAt)} fill="#fff" />);
      back.push(<rect key="pic" {...rr(proj, -2.0, 2.3, -0.8, 3.1, wallAt)} fill="#f2c230" />);
      back.push(<rect key="sk" {...rr(proj, -40, 0, 40, 0.15, wallAt)} fill="#d8c3ad" />);
      back.push(...ground(proj, W, H, wallAt, "#d6bfa3", "#c9b093", 0.7));
      items.push({
        z: -6.6,
        el: (
          <g key="sofa">
            <rect {...rr(proj, -5.2, 0.2, -1.8, 1.4, -6.6)} rx={0.15 * proj(0, 0, -6.6).s} fill="#5a6fc4" />
            <rect {...rr(proj, -5.4, 0.2, -4.9, 1.0, -6.6)} rx={0.1 * proj(0, 0, -6.6).s} fill="#4c5fb0" />
            <rect {...rr(proj, -2.1, 0.2, -1.6, 1.0, -6.6)} rx={0.1 * proj(0, 0, -6.6).s} fill="#4c5fb0" />
          </g>
        ),
      });
      items.push({ z: -6, el: <PropEl p={{ type: "plant", x: 6, z: -6 }} proj={proj} t={t} len={len} /> });
      items.push({ z: -6.5, el: <PropEl p={{ type: "lamp", x: -6.4, z: -6.5, scale: 0.6 }} proj={proj} t={t} len={len} /> });
      break;
    }
    case "lab": {
      back.push(<rect key="wall" x={0} y={0} width={W} height={H} fill="#e9eeec" />);
      if (screen) back.push(<Board key="scr" proj={proj} x={-1.8} y={1.7} z={wallAt} w={3.4} h={1.9} lines={screen.lines} progress={screen.progress} t={t} len={len} />);
      back.push(<rect key="sh" {...rr(proj, 1.0, 3.6, 4.6, 3.7, wallAt)} fill="#c9d1ce" />);
      ["#4fd1c5", "#f2c230", "#e86aa6", "#8a5cd8", "#3b7be0"].forEach((c, i) => {
        const p = proj(1.4 + i * 0.75, 3.95, wallAt);
        back.push(<circle key={`f${i}`} cx={p.xy[0]} cy={p.xy[1]} r={0.26 * p.s} fill={c} />);
      });
      back.push(<rect key="cab" {...rr(proj, 5.2, 0, 7.4, 2.8, wallAt)} fill="#d5dcd9" />);
      back.push(...ground(proj, W, H, wallAt, "#dfe6e3", "#d2dad7", 1.0));
      items.push({
        z: -5.6,
        el: (
          <g key="bench">
            <rect {...rr(proj, -6, 0, 0.5, 0.9, -5.6)} fill="#f7f9f8" stroke="#c9d1ce" strokeWidth={0.04 * proj(0, 0, -5.6).s} />
            {[-5.2, -4.4, -3.6, -2.8, -2.0, -1.2].map((tx, i) => (
              <rect key={i} {...rr(proj, tx - 0.12, 0.9, tx + 0.12, 1.35, -5.6)} rx={0.05 * proj(0, 0, -5.6).s} fill={i % 2 ? "#e86a6a" : "#ffffff"} stroke="#c9d1ce" strokeWidth={0.02 * proj(0, 0, -5.6).s} />
            ))}
          </g>
        ),
      });
      break;
    }
    case "hospital": {
      back.push(<rect key="wall" x={0} y={0} width={W} height={H} fill="#d4ebe3" />);
      if (screen) back.push(<Board key="scr" proj={proj} x={2.6} y={1.8} z={wallAt} w={2.8} h={1.6} lines={screen.lines} progress={screen.progress} t={t} len={len} />);
      back.push(<rect key="door" {...rr(proj, 5.6, 0, 7.0, 2.6, wallAt)} fill="#b6d7cc" stroke="#8fbcae" strokeWidth={0.08 * proj(0, 0, wallAt).s} />);
      back.push(...ground(proj, W, H, wallAt, "#e6eeeb", "#d8e2de", 1.0));
      items.push({ z: -5.2, el: <PropEl p={{ type: "bed", x: -2.5, z: -5.2 }} proj={proj} t={t} len={len} /> });
      break;
    }
    case "stage": {
      back.push(<rect key="wall" x={0} y={0} width={W} height={H} fill="#2a1f2e" />);
      for (let i = -14; i <= 14; i += 1.1) back.push(<rect key={`c${i}`} {...rr(proj, i, 0, i + 0.55, 9, wallAt)} fill={Math.abs(i) < 4 ? "#2a1f2e" : "#b8323a"} opacity={Math.abs(i) < 4 ? 0 : 1} />);
      back.push(<rect key="val" {...rr(proj, -14, 6.4, 14, 8, wallAt)} fill="#9e2a33" />);
      if (screen) back.push(<Board key="scr" proj={proj} x={0} y={4.4} z={wallAt} w={4} h={1.2} lines={screen.lines} progress={screen.progress} t={t} len={len} />);
      back.push(...ground(proj, W, H, wallAt, "#8a5a3c", "#7a4e33", 0.8));
      const c = proj(0, 0, 0);
      back.push(<ellipse key="spot" cx={c.xy[0]} cy={c.xy[1]} rx={2.2 * c.s} ry={0.35 * c.s} fill="#ffe9a8" opacity={0.45} />);
      items.push({
        z: 0.4,
        el: (
          <g key="mic">
            <rect {...rr(proj, 1.57, 0, 1.63, 1.5, 0.4)} fill="#333" />
            <circle cx={proj(1.6, 1.55, 0.4).xy[0]} cy={proj(1.6, 1.55, 0.4).xy[1]} r={0.08 * proj(0, 0, 0.4).s} fill="#555" />
          </g>
        ),
      });
      break;
    }
    case "street":
    case "plaza": {
      back.push(sky(W, H, `ss${uid}`, night ? "#1d2444" : theme.sky, night ? "#3a3f66" : "#eef3f4"));
      const r = rng(location === "street" ? 3 + (scene.variant ?? 0) : 9);
      const bz = location === "street" ? -9 : -10;
      for (let x = -26; x < 26; ) {
        const w = 3.4 + r() * 1.6;
        const h = 5 + r() * 4;
        const col = theme.walls[Math.floor(r() * theme.walls.length)];
        back.push(<rect key={`h${x}`} {...rr(proj, x, 0, x + w, h, bz)} fill={col} />);
        for (let wy = 1.2; wy < h - 0.6; wy += 1.3)
          for (let wx = x + 0.5; wx < x + w - 0.6; wx += 1.0)
            back.push(<rect key={`hw${x}-${wy}-${wx}`} {...rr(proj, wx, wy, wx + 0.5, wy + 0.7, bz)} fill={night || theme.windowsLit ? "#ffd27a" : theme.windows} />);
        x += w + 0.15;
      }
      if (location === "street") {
        back.push(...ground(proj, W, H, -7, theme.road));
        for (let x = -30; x < 30; x += 2.2) back.push(<rect key={`rd${x}`} {...rr(proj, x, -0.001, x + 1.1, 0.001, -5)} height={Math.max(2, proj(0, 0, -5).s * 0.08)} fill="#e8e8e8" opacity={0.8} />);
        back.push(...ground(proj, W, H, -3, theme.sidewalk, "#cfc7bb", 1.2));
        [-9, -3, 3, 9].forEach((lx) => items.push({ z: -2.6, el: <PropEl key={`lp${lx}`} p={{ type: "lamp", x: lx, z: -2.6 }} proj={proj} t={t} len={len} /> }));
        items.push({ z: -2.2, el: <PropEl p={{ type: "tree", x: -8, z: -2.2 }} proj={proj} t={t} len={len} /> });
        items.push({ z: -2.3, el: <PropEl p={{ type: "tree", x: 8.5, z: -2.3 }} proj={proj} t={t} len={len} /> });
      } else {
        back.push(...ground(proj, W, H, bz, theme.ground, theme.groundLine, 1.1));
        back.push(<rect key="bbp1" {...rr(proj, -2.2, 0, -2.0, 2.2, -8)} fill="#3b3f4f" />);
        back.push(<rect key="bbp2" {...rr(proj, 2.0, 0, 2.2, 2.2, -8)} fill="#3b3f4f" />);
        back.push(<Board key="bb" proj={proj} x={0} y={2.0} z={-8} w={6} h={2.4} lines={screen?.lines ?? [""]} progress={screen?.progress} t={t} len={len} />);
      }
      break;
    }
    case "park": {
      back.push(sky(W, H, `sp${uid}`, night ? "#1d2444" : theme.sky, night ? "#3a3f66" : "#f2f5ee"));
      const h1 = proj(-8, 0, -30);
      const h2 = proj(9, 0, -30);
      back.push(<ellipse key="hill1" cx={h1.xy[0]} cy={h1.xy[1]} rx={14 * h1.s} ry={4 * h1.s} fill="#8fcf8a" />);
      back.push(<ellipse key="hill2" cx={h2.xy[0]} cy={h2.xy[1]} rx={16 * h2.s} ry={3.2 * h2.s} fill="#7cc27a" />);
      back.push(...ground(proj, W, H, -14, theme.ground, theme.groundLine, 1.4));
      const pa = proj(0, 0, -2.0).xy[1];
      const pb = proj(0, 0, -1.0).xy[1];
      back.push(<rect key="path" x={0} y={pa} width={W} height={Math.max(0, pb - pa)} fill="#e8dcc6" />);
      const r = rng(21);
      for (let i = 0; i < 14; i++) {
        const tz = -6 - r() * 6;
        const tx = -18 + i * 2.8 + r() * 1.2;
        items.push({ z: tz, el: <PropEl key={`tr${i}`} p={{ type: "tree", x: tx, z: tz, scale: 0.9 + r() * 0.5 }} proj={proj} t={t} len={len} /> });
      }
      items.push({ z: -3.4, el: <PropEl p={{ type: "bench", x: 5, z: -3.4 }} proj={proj} t={t} len={len} /> });
      items.push({ z: -3.2, el: <PropEl p={{ type: "lamp", x: -5, z: -3.2 }} proj={proj} t={t} len={len} /> });
      break;
    }
    default: {
      // studio: однотонный фон и мягкое пятно на полу
      const col = bg ?? scene.bg ?? theme.studio;
      back.push(<rect key="bg" x={0} y={0} width={W} height={H} fill={col} />);
      const yb = proj(0, 0, -12).xy[1];
      back.push(<rect key="fl" x={0} y={yb} width={W} height={Math.max(0, H - yb)} fill="#ffffff" opacity={0.1} />);
      const c = proj(0, 0, 0.3);
      back.push(<ellipse key="spot" cx={c.xy[0]} cy={c.xy[1]} rx={2.2 * c.s} ry={0.32 * c.s} fill="#ffffff" opacity={0.12} />);
    }
  }
  return {
    back: (
      <>
        <defs>
          <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={night ? "#2a3358" : C.skyTop} />
            <stop offset="1" stopColor={night ? "#4a4f78" : C.skyBot} />
          </linearGradient>
        </defs>
        {back}
      </>
    ),
    items,
  };
};

// ── плавающие частицы и виньетка ─────────────────────
const Particles: React.FC<{ W: number; H: number; t: number; seed: number }> = ({ W, H, t, seed }) => {
  const r = rng(seed);
  const dots = Array.from({ length: 34 }, () => ({ x: r() * W, y: r() * H, sp: 8 + r() * 18, rad: 1.5 + r() * 2.5, ph: r() * 6 }));
  return (
    <g>
      {dots.map((d, i) => {
        const y = (((d.y + t * d.sp) % H) + H) % H;
        const x = d.x + Math.sin(t * 0.7 + d.ph) * 12;
        return <circle key={i} cx={x} cy={y} r={(d.rad * W) / 1920} fill="#ffffff" opacity={0.28} />;
      })}
    </g>
  );
};

// ── речевое облачко ───────────────────────────────────
const SpeechBubble: React.FC<{ b: Bubble; head: [number, number]; s: number; r: number; W: number; H: number; t: number }> = ({ b, head, r, W, H, t }) => {
  const at = b.at ?? 0.15;
  if (t < at || (b.until !== undefined && t > b.until)) return null;
  const k = Math.min(1, (t - at) / 0.18);
  const fs = Math.round(H * 0.036);
  const pad = fs * 0.75;
  const words = b.text.split(" ");
  const maxChars = 30;
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  const bw = Math.max(...lines.map((l) => l.length)) * fs * 0.56 + pad * 2;
  const bh = lines.length * fs * 1.22 + pad * 1.3;
  const margin = H * 0.125;
  let bx = head[0] - bw * 0.35;
  bx = Math.max(W * 0.03, Math.min(W * 0.97 - bw, bx));
  let by = head[1] - r * 1.2 - fs * 0.5 - bh;
  let side = false;
  if (by < margin) {
    // крупный план: облачко сбоку от головы
    side = true;
    by = Math.max(margin, head[1] - r * 0.9 - bh);
    bx = head[0] + r * 1.15 + bw < W * 0.97 ? head[0] + r * 1.15 : head[0] - r * 1.15 - bw;
    bx = Math.max(W * 0.03, Math.min(W * 0.97 - bw, bx));
  }
  const tailX = side ? (bx > head[0] ? bx + fs * 1.2 : bx + bw - fs * 1.2) : Math.max(bx + bh * 0.4, Math.min(bx + bw - bh * 0.4, head[0]));
  const tailY = by + bh;
  return (
    <g opacity={k} transform={`translate(${tailX},${tailY}) scale(${0.85 + 0.15 * k}) translate(${-tailX},${-tailY})`}>
      <rect x={bx} y={by} width={bw} height={bh} rx={Math.min(bh / 2, fs * 1.1)} fill="#fbf6ec" />
      <path d={`M${tailX - fs * 0.45},${tailY - 2} L${tailX + fs * 0.05},${tailY + fs * 0.75} L${tailX + fs * 0.4},${tailY - 2} Z`} fill="#fbf6ec" />
      {lines.map((l, i) => (
        <text key={i} x={bx + bw / 2} y={by + pad * 0.65 + fs * (i + 0.85) * 1.22 - fs * 0.22} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={fs} fill="#22242c">
          {l}
        </text>
      ))}
    </g>
  );
};

export type FlatInput = WorldInput & { bubble?: Bubble };

export const FlatScene: React.FC<{ input: FlatInput; theme: Theme; t: number; len: number; width: number; height: number }> = ({ input, theme, t, len, width, height }) => {
  const { actors, props, camera } = input;
  const segMap = useMemo(() => {
    const m = new Map<string, ReturnType<typeof buildSegments>>();
    actors.forEach((a) => m.set(a.id, buildSegments(a, len)));
    return m;
  }, [actors, len]);
  const segsFor = (a: Actor) => segMap.get(a.id) ?? buildSegments(a, len);
  const cam = flatCamera(camera, actors, len, t, segsFor, width, height);
  const uid = useMemo(() => String(hashStr(JSON.stringify([input.location, input.scene.start, input.bg, width]))), [input, width]);

  const loc = buildLocation({ input, proj: cam.proj, W: width, H: height, theme, t, len, uid });
  const background = loc.back;
  const staticItems = loc.items;

  const els: El[] = [...staticItems];
  props.forEach((p, i) => els.push({ z: p.z, el: <PropEl key={`p${i}`} p={p} proj={cam.proj} t={t} len={len} /> }));
  let bubbleEl: React.ReactNode = null;
  actors.forEach((a, i) => {
    const st = actorStateAt(a, segsFor(a), t);
    const shirt = a.shirt ?? theme.shirts[(hashStr(a.id) + i) % theme.shirts.length];
    els.push({ z: st.z, el: <Figure key={a.id} actor={a} state={st} proj={cam.proj} shirt={shirt} seed={(hashStr(a.id) % 1000) / 97} /> });
    if (input.bubble && input.bubble.actor === a.id) {
      const hp = cam.proj(st.x, 2.05 * (a.scale ?? 1), st.z);
      bubbleEl = <SpeechBubble b={input.bubble} head={hp.xy} s={hp.s} r={0.34 * hp.s * (a.scale ?? 1)} W={width} H={height} t={t} />;
    }
  });
  els.sort((a, b) => a.z - b.z);

  const tint = input.scene.time === "sunset" ? { c: "#ff8a4c", o: 0.16 } : input.scene.time === "night" ? { c: "#1b2560", o: 0.38 } : null;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <radialGradient id={`vig${uid}`} cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </radialGradient>
      </defs>
      {background}
      {els.map((e, i) => (
        <g key={i}>{e.el}</g>
      ))}
      {tint ? <rect x={0} y={0} width={width} height={height} fill={tint.c} opacity={tint.o} style={{ mixBlendMode: "multiply" }} /> : null}
      <Particles W={width} H={height} t={t} seed={hashStr(uid) % 997} />
      <rect x={0} y={0} width={width} height={height} fill={`url(#vig${uid})`} />
      {bubbleEl}
    </svg>
  );
};

