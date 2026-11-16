// 2D-стикмен: плоская заливка, тонкие чёрные конечности, светлый контур головы.
import React from "react";
import type { Actor, FaceName } from "../types";
import type { ActorState } from "../three/actor";
import { FONT } from "../fonts";
import { onHead, R_HEAD, skeleton, toWorld, type Limb, type V3 } from "./kin";
import type { Proj } from "./cam";

export const INK = "#141416";
export const RIM = "#f4ead6";

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + (k > 0 ? (255 - c) * k : c * k))));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, "0")).join("")}`;
};

const line = (pts: [number, number][]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
const mix = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

type Outfit = "hoodie" | "suit" | "tee";

export const Figure: React.FC<{ actor: Actor & { outfit?: Outfit }; state: ActorState; proj: Proj; shirt: string; seed: number }> = ({ actor, state, proj, shirt, seed }) => {
  const sc = actor.scale ?? 1;
  const sk = skeleton(state, sc);
  const P = (v: V3) => proj(v[0], v[1], v[2]);
  const head = P(sk.head);
  const u = head.s; // пикселей на единицу у головы
  const w = (k: number) => k * u * sc;
  const outfit: Outfit = actor.outfit ?? (actor.sleeves === "short" ? "tee" : "hoodie");
  const long = (actor.sleeves ?? "long") === "long";
  const pants = actor.pants;

  const limbPath = (l: Limb, k0 = 0, k1 = 1) => {
    const pts: V3[] = [l.a, l.b, l.c];
    if (k0 === 0 && k1 === 1) return line(pts.map((v) => P(v).xy));
    // доля длины: 0..0.5 — первое звено, 0.5..1 — второе
    const at = (k: number): V3 => (k <= 0.5 ? mix(l.a, l.b, k * 2) : mix(l.b, l.c, (k - 0.5) * 2));
    const list: V3[] = [at(k0)];
    if (k0 < 0.5 && k1 > 0.5) list.push(l.b);
    list.push(at(k1));
    return line(list.map((v) => P(v).xy));
  };

  const arm = (l: Limb, key: string) => {
    const hand = P(l.c);
    return (
      <g key={key}>
        <path d={limbPath(l)} stroke={INK} strokeWidth={w(0.085)} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={limbPath(l, 0, long ? 0.9 : 0.42)} stroke={shirt} strokeWidth={w(0.15)} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={hand.xy[0]} cy={hand.xy[1]} r={w(0.06)} fill={INK} />
      </g>
    );
  };
  const leg = (l: Limb, key: string) => {
    const foot = P(l.c);
    const toe = P(l.d!);
    return (
      <g key={key}>
        <path d={limbPath(l)} stroke={INK} strokeWidth={w(0.1)} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pants ? <path d={limbPath(l, 0, 0.93)} stroke={pants} strokeWidth={w(0.17)} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
        <path d={line([foot.xy, toe.xy])} stroke={INK} strokeWidth={w(0.13)} strokeLinecap="round" />
        <path d={line([foot.xy, toe.xy])} stroke={RIM} strokeOpacity={0.25} strokeWidth={w(0.03)} strokeLinecap="round" transform={`translate(0,${-w(0.045)})`} />
      </g>
    );
  };

  // кто ближе к камере — рисуется позже
  const zOf = (l: Limb) => (l.a[2] + l.b[2] + l.c[2]) / 3;
  const arms = [
    { l: sk.arms.L, k: "aL" },
    { l: sk.arms.R, k: "aR" },
  ].sort((a, b) => zOf(a.l) - zOf(b.l));
  const legs = [
    { l: sk.legs.L, k: "lL" },
    { l: sk.legs.R, k: "lR" },
  ].sort((a, b) => zOf(a.l) - zOf(b.l));

  const pelvis = P(sk.pelvis);
  const chest = P(sk.chest);
  const neck = P(sk.neck);
  const torsoW = w(0.46);
  const shirtDark = shade(shirt, -0.18);

  // тень на полу
  const feet = P([state.x, 0, state.z]);
  const lying = Math.abs(state.pose.rootX) > 1;

  // лицо
  const face = state.face;
  const fz = sk.facing[2];
  const showFace = onHead(sk.headM, 0, 0).nz > -0.15;
  const period = 3.2 + (Math.round(seed * 97) % 13) / 10;
  const blink = (state.t + seed) % period < 0.13;
  const feature = (x: number, y: number) => {
    const h = onHead(sk.headM, x, y);
    const p = P(h.p);
    return { xy: p.xy, k: Math.max(0.25, h.nz), vis: h.nz > 0.05, nx: h.nx };
  };
  const big = face === "scared" || face === "surprised" ? 1.3 : 1;
  const eye = (x: number) => {
    const f = feature(x, 0.06);
    if (!f.vis) return null;
    const rx = w(0.055 * big) * f.k;
    const ry = blink || face === "sleepy" ? w(0.012) : w(0.072 * big);
    return (
      <g key={`e${x}`}>
        <ellipse cx={f.xy[0]} cy={f.xy[1]} rx={rx} ry={ry} fill="#fff" />
        {!blink && face !== "sleepy" ? <circle cx={f.xy[0] + f.nx * rx * 0.55} cy={f.xy[1] + ry * 0.15} r={Math.min(rx, ry) * 0.45} fill={INK} /> : null}
      </g>
    );
  };
  const brows = (() => {
    switch (face as FaceName) {
      case "sad":
      case "worried":
        return { y: 0.18, a: -0.35 };
      case "angry":
        return { y: 0.155, a: 0.45 };
      case "scared":
      case "surprised":
        return { y: 0.21, a: 0 };
      default:
        return null;
    }
  })();
  const brow = (x: number, side: 1 | -1) => {
    if (!brows) return null;
    const f = feature(x, brows.y);
    if (!f.vis) return null;
    const len = w(0.1) * f.k;
    const ang = brows.a * side;
    const dx = Math.cos(ang) * len * 0.5;
    const dy = Math.sin(ang) * len * 0.5;
    return <path key={`b${x}`} d={`M${f.xy[0] - dx},${f.xy[1] + dy} L${f.xy[0] + dx},${f.xy[1] - dy}`} stroke="#fff" strokeWidth={w(0.024)} strokeLinecap="round" />;
  };
  const mouth = (() => {
    const f = feature(0, -0.12);
    if (!f.vis) return null;
    const [x, y] = f.xy;
    const k = f.k;
    const s = w(1);
    const stroke = { stroke: "#fff", strokeWidth: w(0.024), fill: "none", strokeLinecap: "round" as const };
    if (state.talking) {
      const open = Math.abs(Math.sin((state.t + seed) * 11)) * (0.6 + 0.4 * Math.sin((state.t + seed) * 3.7));
      return <ellipse cx={x} cy={y} rx={0.06 * s * k} ry={(0.018 + 0.045 * open) * s} fill="#fff" />;
    }
    switch (face) {
      case "happy":
        return <path d={`M${x - 0.075 * s * k},${y - 0.02 * s} Q${x},${y + 0.07 * s} ${x + 0.075 * s * k},${y - 0.02 * s}`} {...stroke} />;
      case "grin":
        return <path d={`M${x - 0.1 * s * k},${y - 0.03 * s} Q${x},${y + 0.12 * s} ${x + 0.1 * s * k},${y - 0.03 * s} Z`} fill="#fff" />;
      case "sad":
        return <path d={`M${x - 0.065 * s * k},${y + 0.03 * s} Q${x},${y - 0.04 * s} ${x + 0.065 * s * k},${y + 0.03 * s}`} {...stroke} />;
      case "scared":
        return <ellipse cx={x} cy={y} rx={0.035 * s * k} ry={0.045 * s} {...stroke} />;
      case "surprised":
        return <ellipse cx={x} cy={y} rx={0.05 * s * k} ry={0.06 * s} {...stroke} />;
      case "smirk":
        return <path d={`M${x - 0.06 * s * k},${y} Q${x + 0.02 * s * k},${y + 0.03 * s} ${x + 0.07 * s * k},${y - 0.04 * s}`} {...stroke} />;
      case "angry":
        return <path d={`M${x - 0.07 * s * k},${y + 0.01 * s} Q${x - 0.035 * s * k},${y - 0.03 * s} ${x},${y + 0.01 * s} Q${x + 0.035 * s * k},${y + 0.04 * s} ${x + 0.07 * s * k},${y}`} {...stroke} />;
      case "worried":
        return <path d={`M${x - 0.06 * s * k},${y + 0.012 * s} L${x + 0.06 * s * k},${y - 0.012 * s}`} {...stroke} />;
      case "sleepy":
        return <path d={`M${x - 0.04 * s * k},${y} L${x + 0.04 * s * k},${y}`} {...stroke} />;
      default:
        return <path d={`M${x - 0.06 * s * k},${y} L${x + 0.06 * s * k},${y}`} {...stroke} />;
    }
  })();

  // волосы/кепка — в экранных координатах головы
  const hr = w(R_HEAD);
  const [hx, hy] = head.xy;
  const side = Math.sign(sk.facing[0] || 0.0001); // куда повёрнут (лево/право)
  const hairColor = actor.hairColor ?? "#3a2a20";
  const hair = (() => {
    switch (actor.hair ?? "none") {
      case "cap":
        return (
          <g>
            <path d={`M${hx - hr * 1.02},${hy - hr * 0.28} A${hr * 1.02},${hr * 1.02} 0 0 1 ${hx + hr * 1.02},${hy - hr * 0.28} Z`} fill={hairColor} />
            <path d={`M${hx + side * hr * 0.2},${hy - hr * 0.3} L${hx + side * hr * 1.55},${hy - hr * 0.22} L${hx + side * hr * 1.5},${hy - hr * 0.36} L${hx + side * hr * 0.2},${hy - hr * 0.45} Z`} fill={shade(hairColor, -0.2)} />
          </g>
        );
      case "bun":
        return (
          <g>
            <path d={`M${hx - hr * 1.03},${hy - hr * 0.05} A${hr * 1.03},${hr * 1.03} 0 0 1 ${hx + hr * 1.03},${hy - hr * 0.05} Q${hx},${hy - hr * 0.55} ${hx - hr * 1.03},${hy - hr * 0.05} Z`} fill={hairColor} />
            <circle cx={hx - side * hr * 0.55} cy={hy - hr * 1.0} r={hr * 0.36} fill={hairColor} />
          </g>
        );
      case "bob":
        return <path d={`M${hx - hr * 1.08},${hy + hr * 0.45} L${hx - hr * 1.08},${hy - hr * 0.1} A${hr * 1.08},${hr * 1.08} 0 0 1 ${hx + hr * 1.08},${hy - hr * 0.1} L${hx + hr * 1.08},${hy + hr * 0.45} L${hx + hr * 0.75},${hy + hr * 0.45} Q${hx},${hy - hr * 0.7} ${hx - hr * 0.75},${hy + hr * 0.45} Z`} fill={hairColor} />;
      case "puff":
        return (
          <g fill={hairColor}>
            {[
              [0, -0.95, 0.42],
              [0.55, -0.75, 0.36],
              [-0.55, -0.75, 0.36],
            ].map(([x, y, r], i) => (
              <circle key={i} cx={hx + x * hr} cy={hy + y * hr} r={r * hr} />
            ))}
          </g>
        );
      case "headband":
        return <path d={`M${hx - hr},${hy - hr * 0.35} Q${hx},${hy - hr * 0.6} ${hx + hr},${hy - hr * 0.35}`} stroke={hairColor} strokeWidth={hr * 0.22} fill="none" />;
      default:
        return null;
    }
  })();

  // предмет в правой руке
  const held = (() => {
    const kind = actor.held ?? "none";
    if (kind === "none") return null;
    const hp = P(toWorld(sk.holdM, [0, 0, 0.05]));
    const [x, y] = hp.xy;
    const s = w(1);
    switch (kind) {
      case "phone":
        return (
          <g>
            <rect x={x - 0.07 * s} y={y - 0.13 * s} width={0.14 * s} height={0.24 * s} rx={0.025 * s} fill="#23262f" />
            <rect x={x - 0.055 * s} y={y - 0.11 * s} width={0.11 * s} height={0.19 * s} rx={0.015 * s} fill="#7fd3ff" />
          </g>
        );
      case "bottle":
        return (
          <g>
            <rect x={x - 0.06 * s} y={y - 0.2 * s} width={0.12 * s} height={0.26 * s} rx={0.03 * s} fill="#5fd0e3" />
            <rect x={x - 0.03 * s} y={y - 0.28 * s} width={0.06 * s} height={0.09 * s} fill="#9aa0aa" />
          </g>
        );
      case "cup":
        return (
          <g>
            <path d={`M${x - 0.07 * s},${y - 0.14 * s} L${x + 0.07 * s},${y - 0.14 * s} L${x + 0.055 * s},${y + 0.05 * s} L${x - 0.055 * s},${y + 0.05 * s} Z`} fill="#fff" />
            <rect x={x - 0.075 * s} y={y - 0.16 * s} width={0.15 * s} height={0.035 * s} rx={0.01 * s} fill="#8a5a3c" />
          </g>
        );
      case "coin":
        return <circle cx={x} cy={y} r={0.09 * s} fill="#f2c230" stroke="#c99a14" strokeWidth={0.02 * s} />;
      case "book":
        return <rect x={x - 0.13 * s} y={y - 0.17 * s} width={0.26 * s} height={0.32 * s} rx={0.02 * s} fill="#c0453a" />;
      case "sign": {
        const text = (actor.heldText ?? "").toUpperCase();
        const bw = 0.62 * s;
        const bh = 0.36 * s;
        // конверт/табличка в руке
        return (
          <g>
            <rect x={x - bw / 2} y={y - bh * 0.8} width={bw} height={bh} rx={0.03 * s} fill="#fbf8f1" stroke="#d9d2c3" strokeWidth={0.015 * s} />
            <path d={`M${x - bw / 2},${y - bh * 0.8} L${x},${y - bh * 0.35} L${x + bw / 2},${y - bh * 0.8}`} stroke="#d9d2c3" strokeWidth={0.015 * s} fill="none" />
            {text ? (
              <text x={x} y={y + bh * 0.12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={Math.min(0.11 * s, (bw * 1.6) / Math.max(4, text.length))} fill={INK}>
                {text}
              </text>
            ) : null}
          </g>
        );
      }
      default:
        return null;
    }
  })();

  return (
    <g>
      <ellipse cx={lying ? P([state.x - Math.sin(state.yaw) * 1, 0, state.z - Math.cos(state.yaw) * 1]).xy[0] : feet.xy[0]} cy={feet.xy[1]} rx={w(lying ? 1.1 : 0.45)} ry={w(0.08)} fill="#000" opacity={0.18} />
      {arms[0] ? arm(arms[0].l, arms[0].k) : null}
      {legs.map((x) => leg(x.l, x.k))}
      {/* шея */}
      <path d={line([chest.xy, head.xy])} stroke={INK} strokeWidth={w(0.1)} strokeLinecap="round" />
      {/* капюшон за шеей */}
      {outfit === "hoodie" ? (
        <ellipse cx={neck.xy[0] - side * w(0.12) * Math.abs(sk.facing[0])} cy={neck.xy[1] + w(0.03)} rx={w(0.24)} ry={w(0.13)} fill={shirtDark} />
      ) : null}
      {/* корпус */}
      <path d={line([pelvis.xy, chest.xy])} stroke={shirt} strokeWidth={torsoW} strokeLinecap="round" />
      {outfit === "suit" ? (
        <g>
          <path d={`M${chest.xy[0] - w(0.12)},${chest.xy[1] - w(0.14)} L${chest.xy[0]},${chest.xy[1] + w(0.12)} L${chest.xy[0] + w(0.12)},${chest.xy[1] - w(0.14)} Z`} fill="#f2f2f2" />
          <path d={line([[chest.xy[0], chest.xy[1] - w(0.08)], [chest.xy[0], chest.xy[1] + w(0.36)]])} stroke="#1c2233" strokeWidth={w(0.06)} strokeLinecap="round" />
        </g>
      ) : null}
      {outfit === "hoodie" ? (
        <g>
          <path d={line([[chest.xy[0] - w(0.05), chest.xy[1] - w(0.08)], [chest.xy[0] - w(0.06), chest.xy[1] + w(0.16)]])} stroke="#f2f2f2" strokeWidth={w(0.022)} strokeLinecap="round" />
          <path d={line([[chest.xy[0] + w(0.05), chest.xy[1] - w(0.08)], [chest.xy[0] + w(0.06), chest.xy[1] + w(0.16)]])} stroke="#f2f2f2" strokeWidth={w(0.022)} strokeLinecap="round" />
          <path d={line([[pelvis.xy[0] - w(0.17), pelvis.xy[1] - w(0.03)], [pelvis.xy[0] + w(0.17), pelvis.xy[1] - w(0.03)]])} stroke={shirtDark} strokeWidth={w(0.07)} strokeLinecap="round" />
        </g>
      ) : null}
      {arms[1] ? arm(arms[1].l, arms[1].k) : null}
      {held}
      {/* голова */}
      <circle cx={hx} cy={hy} r={hr} fill={INK} />
      <path d={`M${hx - hr * 0.86},${hy - hr * 0.42} A${hr * 0.95},${hr * 0.95} 0 0 1 ${hx + hr * 0.2},${hy - hr * 0.93}`} stroke={RIM} strokeWidth={hr * 0.1} fill="none" strokeLinecap="round" opacity={0.95} />
      {hair}
      {showFace && fz > -0.75 ? (
        <g>
          {eye(0.115)}
          {eye(-0.115)}
          {brow(0.12, 1)}
          {brow(-0.12, -1)}
          {mouth}
        </g>
      ) : null}
    </g>
  );
};
