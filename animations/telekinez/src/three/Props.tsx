import React from "react";
import { useCtx } from "../ctx";
import { BLACK } from "../theme";
import type { Prop } from "../types";
import { clamp, deg, easeInOut, lerp } from "../util";
import { shade } from "./geo";
import { Ball, Box, Cyl, Plane, Shadow, TexPlane } from "./prims";
import { useLabelTexture, useScreenTexture } from "./textures";

export const BrandLabel: React.FC<{ p: [number, number, number]; w: number; text?: string; r?: [number, number, number] }> = ({ p, w, text, r }) => {
  const { brandColor, brandName } = useCtx();
  const tex = useLabelTexture(text ?? brandName, brandColor, 3, "#ffffff", true);
  return <TexPlane tex={tex} p={p} s={[w, w / 3, 1]} r={r} />;
};

export const Screen: React.FC<{
  p: [number, number, number];
  w: number;
  h: number;
  lines: string[];
  progress?: Prop["progress"];
  t: number;
  len: number;
  brand?: boolean;
  r?: [number, number, number];
  frame?: string;
}> = ({ p, w, h, lines, progress, t, len, brand, r, frame }) => {
  const { brandColor, brandName } = useCtx();
  const v = progress ? lerp(progress.from, progress.to, easeInOut(clamp(t / Math.max(0.5, len * 0.85)))) : undefined;
  const tex = useScreenTexture(w / h, {
    lines,
    progress,
    progressValue: v,
    brand: brand ? { name: brandName, color: brandColor } : null,
    accent: brandColor,
  });
  return (
    <group position={p} rotation={r}>
      <Box c={frame ?? "#2a2f3d"} s={[w + 0.16, h + 0.16, 0.12]} p={[0, 0, -0.07]} />
      <TexPlane tex={tex} s={[w, h, 1]} />
    </group>
  );
};

export const PropView: React.FC<{ prop: Prop; t: number; len: number }> = ({ prop, t, len }) => {
  const { theme, brandColor } = useCtx();
  const c = prop.color;
  const inner = (() => {
    switch (prop.type) {
      case "bottle":
        return (
          <group>
            <Shadow p={[0, 0.01, 0]} s={[0.55, 0.55]} />
            <Cyl c={c ?? "#5fd0e3"} p={[0, 0.65, 0]} s={[0.36, 1.3, 0.36]} o={0.92} rough={0.3} />
            <Cyl c={shade(c ?? "#5fd0e3", 0.15)} p={[-0.18, 0.7, 0.22]} s={[0.04, 1.0, 0.04]} o={0.7} e />
            <Cyl c="#cfd3da" p={[0, 1.38, 0]} s={[0.2, 0.16, 0.2]} />
            <Cyl c="#9aa0aa" p={[0, 1.52, 0]} s={[0.24, 0.14, 0.24]} />
            <BrandLabel p={[0, 0.7, 0.365]} w={0.62} text={prop.label} />
          </group>
        );
      case "syringe":
        return (
          <group rotation={[0, 0, deg(-20)]}>
            <Cyl c="#bfefff" p={[0, 1.2, 0]} s={[0.12, 1.0, 0.12]} r={[0, 0, Math.PI / 2]} o={0.85} />
            <Cyl c={brandColor} p={[0.1, 1.2, 0]} s={[0.09, 0.6, 0.09]} r={[0, 0, Math.PI / 2]} e />
            <Box c="#e9eef3" p={[0.62, 1.2, 0]} s={[0.24, 0.05, 0.4]} />
            <Cyl c="#d9dee5" p={[0.82, 1.2, 0]} s={[0.04, 0.4, 0.04]} r={[0, 0, Math.PI / 2]} />
            <Cyl c="#cfd5dc" p={[-0.7, 1.2, 0]} s={[0.012, 0.5, 0.012]} r={[0, 0, Math.PI / 2]} />
          </group>
        );
      case "table":
        return (
          <group>
            <Shadow p={[0, 0.01, 0]} s={[1.0, 0.65]} />
            <Box c={c ?? theme.wood} p={[0, 0.76, 0]} s={[1.6, 0.08, 0.9]} />
            {[
              [-0.7, -0.35],
              [0.7, -0.35],
              [-0.7, 0.35],
              [0.7, 0.35],
            ].map(([x, z], i) => (
              <Cyl key={i} c={shade(c ?? theme.wood, -0.12)} p={[x, 0.37, z]} s={[0.04, 0.74, 0.04]} lo />
            ))}
          </group>
        );
      case "chair":
        return (
          <group>
            <Box c={c ?? "#e07b54"} p={[0, 0.5, 0]} s={[0.55, 0.07, 0.55]} />
            <Box c={c ?? "#e07b54"} p={[0, 0.85, -0.25]} s={[0.55, 0.65, 0.07]} />
            {[
              [-0.23, -0.23],
              [0.23, -0.23],
              [-0.23, 0.23],
              [0.23, 0.23],
            ].map(([x, z], i) => (
              <Cyl key={i} c="#3a3a44" p={[x, 0.25, z]} s={[0.025, 0.5, 0.025]} lo />
            ))}
          </group>
        );
      case "tree":
        return (
          <group>
            <Shadow p={[0, 0.01, 0]} s={[1.0, 1.0]} />
            <Cyl c="#8a6244" p={[0, 0.8, 0]} s={[0.14, 1.6, 0.14]} lo />
            <Ball c={c ?? theme.leaf} p={[0, 2.1, 0]} s={0.95} lo />
            <Ball c={shade(c ?? theme.leaf, 0.06)} p={[0.45, 1.8, 0.2]} s={0.6} lo />
            <Ball c={shade(c ?? theme.leaf, -0.05)} p={[-0.4, 1.75, -0.1]} s={0.65} lo />
          </group>
        );
      case "car": {
        const cc = c ?? "#e85d5d";
        return (
          <group>
            <Shadow p={[0, 0.01, 0]} s={[2.2, 1.1]} />
            <Box c={cc} p={[0, 0.6, 0]} s={[3.6, 0.7, 1.6]} />
            <Box c={shade(cc, 0.05)} p={[-0.2, 1.15, 0]} s={[2.0, 0.6, 1.45]} />
            <Box c="#bfe4f7" p={[-0.2, 1.15, 0.735]} s={[1.8, 0.45, 0.02]} e />
            <Box c="#bfe4f7" p={[-0.2, 1.15, -0.735]} s={[1.8, 0.45, 0.02]} e />
            {[
              [-1.2, 0.8],
              [1.2, 0.8],
              [-1.2, -0.8],
              [1.2, -0.8],
            ].map(([x, z], i) => (
              <Cyl key={i} c="#24262e" p={[x, 0.32, z]} s={[0.32, 0.22, 0.32]} r={[Math.PI / 2, 0, 0]} />
            ))}
          </group>
        );
      }
      case "sign": {
        return (
          <group>
            <Cyl c="#7b7f8c" p={[0, 1.1, 0]} s={[0.05, 2.2, 0.05]} lo />
            <SignBoard text={(prop.lines ?? [prop.label ?? "SIGN"]).join(" ")} color={c ?? brandColor} />
          </group>
        );
      }
      case "box":
        return (
          <group>
            <Shadow p={[0, 0.01, 0]} s={[0.55, 0.55]} />
            <Box c={c ?? "#d9a86a"} p={[0, 0.35, 0]} s={[0.7, 0.7, 0.7]} />
            <Box c={shade(c ?? "#d9a86a", -0.08)} p={[0, 0.701, 0]} s={[0.12, 0.01, 0.7]} />
          </group>
        );
      case "coin":
        return <Cyl c="#f2c230" p={[0, 0.5, 0]} s={[0.45, 0.08, 0.45]} r={[Math.PI / 2, t * 2, 0]} rough={0.35} />;
      case "money":
        return (
          <group>
            {[0, 1, 2, 3, 4].map((i) => (
              <Box key={i} c={i % 2 ? "#5cb85c" : "#4fa64f"} p={[0, 0.06 + i * 0.1, 0]} s={[0.9, 0.09, 0.45]} r={[0, i * 0.08, 0]} />
            ))}
          </group>
        );
      case "trophy":
        return (
          <group>
            <Box c="#6b4a2b" p={[0, 0.1, 0]} s={[0.5, 0.2, 0.5]} />
            <Cyl c="#f2c230" p={[0, 0.35, 0]} s={[0.06, 0.3, 0.06]} rough={0.35} />
            <Ball c="#f2c230" p={[0, 0.7, 0]} s={[0.3, 0.32, 0.3]} rough={0.35} />
          </group>
        );
      case "bench":
        return (
          <group>
            <Shadow p={[0, 0.01, 0]} s={[1.2, 0.5]} />
            <Box c={c ?? theme.wood} p={[0, 0.48, 0]} s={[2, 0.08, 0.5]} />
            <Box c={c ?? theme.wood} p={[0, 0.85, -0.22]} s={[2, 0.35, 0.06]} />
            <Box c="#3a3a44" p={[-0.85, 0.24, 0]} s={[0.06, 0.48, 0.45]} />
            <Box c="#3a3a44" p={[0.85, 0.24, 0]} s={[0.06, 0.48, 0.45]} />
          </group>
        );
      case "lamp":
        return (
          <group>
            <Cyl c="#3d4150" p={[0, 1.7, 0]} s={[0.06, 3.4, 0.06]} lo />
            <Ball c="#fff1c2" p={[0, 3.5, 0]} s={0.22} e />
          </group>
        );
      case "screen":
        return <Screen p={[0, 1.5, 0]} w={2.4} h={1.35} lines={prop.lines ?? [prop.label ?? ""]} progress={prop.progress} t={t} len={len} brand />;
      case "bed":
        return (
          <group>
            <Shadow p={[0, 0.01, 0]} s={[1.3, 0.8]} />
            <Box c="#c9ced8" p={[0, 0.45, 0]} s={[2.2, 0.2, 1.0]} />
            <Box c="#ffffff" p={[0, 0.62, 0]} s={[2.1, 0.16, 0.95]} />
            <Box c="#dfe9f5" p={[-0.8, 0.75, 0]} s={[0.45, 0.12, 0.7]} />
            <Box c="#9aa3b2" p={[-1.1, 0.75, 0]} s={[0.06, 0.9, 1.0]} />
          </group>
        );
      case "door":
        return (
          <group>
            <Box c="#ffffff" p={[0, 1.15, 0]} s={[1.2, 2.3, 0.1]} />
            <Box c={c ?? "#2bb3a3"} p={[0, 1.1, 0.03]} s={[1.0, 2.15, 0.1]} />
            <Ball c="#f2c230" p={[0.35, 1.1, 0.1]} s={0.05} />
          </group>
        );
      case "plant":
        return (
          <group>
            <Cyl c="#d97b55" p={[0, 0.25, 0]} s={[0.25, 0.5, 0.25]} lo />
            <Ball c={c ?? theme.leaf} p={[0, 0.75, 0]} s={[0.4, 0.5, 0.4]} lo />
            <Ball c={shade(c ?? theme.leaf, 0.08)} p={[0.15, 0.95, 0.1]} s={0.25} lo />
          </group>
        );
      case "rock":
        return <Ball c={c ?? "#9a9aa6"} p={[0, 0.25, 0]} s={[0.6, 0.4, 0.5]} lo />;
      case "clock": {
        const a = t * 1.2;
        return (
          <group position={[0, 2.6, 0]}>
            <Cyl c="#ffffff" s={[0.45, 0.06, 0.45]} r={[Math.PI / 2, 0, 0]} />
            <Cyl c={BLACK} p={[0, 0, -0.01]} s={[0.5, 0.05, 0.5]} r={[Math.PI / 2, 0, 0]} />
            <Box c={BLACK} p={[Math.sin(a) * 0.15, Math.cos(a) * 0.15, 0.05]} s={[0.03, 0.32, 0.02]} r={[0, 0, -a]} />
            <Box c={BLACK} p={[Math.sin(a / 12) * 0.1, Math.cos(a / 12) * 0.1, 0.05]} s={[0.04, 0.22, 0.02]} r={[0, 0, -a / 12]} />
          </group>
        );
      }
      case "phone":
        return (
          <group position={[0, 0.9, 0]}>
            <Box c="#22252e" s={[0.9, 1.7, 0.08]} />
            <Plane c="#7fd3ff" e p={[0, 0, 0.045]} s={[0.8, 1.55, 1]} />
          </group>
        );
      case "ball":
        return <Ball c={c ?? "#d8f05a"} p={[0, 0.22, 0]} s={0.22} />;
      case "egg":
        return <Ball c={c ?? "#fff3dc"} p={[0, 0.19, 0]} s={[0.14, 0.19, 0.14]} />;
      case "mug":
        return (
          <group>
            <Cyl c={c ?? "#e85d5d"} p={[0, 0.15, 0]} s={[0.16, 0.3, 0.16]} />
            <Box c={c ?? "#e85d5d"} p={[0.2, 0.16, 0]} s={[0.06, 0.16, 0.05]} />
          </group>
        );
      case "pot":
        return (
          <group>
            <Cyl c="#c96f45" p={[0, 0.2, 0]} s={[0.28, 0.4, 0.28]} />
            <Ball c="#4f9a4a" p={[0, 0.5, 0]} s={[0.32, 0.22, 0.32]} lo />
            <Ball c={c ?? "#e2394f"} p={[0.12, 0.66, 0.05]} s={0.09} />
            <Ball c={c ?? "#e2394f"} p={[-0.1, 0.7, -0.04]} s={0.09} />
            <Ball c={c ?? "#e2394f"} p={[0, 0.74, 0.12]} s={0.08} />
          </group>
        );
      case "fridge":
        return (
          <group>
            <Shadow p={[0, 0.01, 0]} s={[0.7, 0.55]} />
            <Box c={c ?? "#f2f4f7"} p={[0, 1.0, 0]} s={[1.0, 2.0, 0.8]} />
            <Box c="#d5dae2" p={[0, 1.3, 0.41]} s={[0.98, 0.02, 0.02]} />
            <Box c="#9aa3b2" p={[0.38, 1.6, 0.43]} s={[0.05, 0.3, 0.05]} />
            <Box c="#9aa3b2" p={[0.38, 0.95, 0.43]} s={[0.05, 0.4, 0.05]} />
          </group>
        );
      case "sofa":
        return (
          <group>
            <Shadow p={[0, 0.01, 0]} s={[1.3, 0.6]} />
            <Box c={c ?? "#6c7fb8"} p={[0, 0.3, 0]} s={[2.2, 0.4, 0.9]} />
            <Box c={shade(c ?? "#6c7fb8", -0.06)} p={[0, 0.75, -0.35]} s={[2.2, 0.6, 0.2]} />
            <Box c={shade(c ?? "#6c7fb8", -0.06)} p={[-1.05, 0.55, 0]} s={[0.2, 0.5, 0.9]} />
            <Box c={shade(c ?? "#6c7fb8", -0.06)} p={[1.05, 0.55, 0]} s={[0.2, 0.5, 0.9]} />
          </group>
        );
      case "washer":
        return (
          <group>
            <Box c="#f4f6f8" p={[0, 0.45, 0]} s={[0.9, 0.9, 0.8]} />
            <Cyl c="#9aa3b2" p={[0, 0.42, 0.4]} s={[0.3, 0.03, 0.3]} r={[Math.PI / 2, 0, 0]} />
            <Cyl c="#7fc6e8" p={[0, 0.42, 0.42]} s={[0.22, 0.03, 0.22]} r={[Math.PI / 2, 0, 0]} />
          </group>
        );
      case "pizza":
        return (
          <group>
            <Box c="#d9b47a" p={[0, 0.05, 0]} s={[0.7, 0.1, 0.7]} />
            <Cyl c="#f2c14e" p={[0, 0.105, 0]} s={[0.28, 0.01, 0.28]} />
            <Ball c="#d0453a" p={[0.1, 0.11, 0.05]} s={[0.05, 0.01, 0.05]} />
            <Ball c="#d0453a" p={[-0.1, 0.11, -0.06]} s={[0.05, 0.01, 0.05]} />
          </group>
        );
      case "remote":
        return (
          <group>
            <Box c="#2a2d36" p={[0, 0.03, 0]} s={[0.14, 0.05, 0.45]} />
            <Ball c="#e2394f" p={[0, 0.06, 0.15]} s={0.025} />
          </group>
        );
      case "key":
        return (
          <group rotation={[Math.PI / 2, 0, 0]}>
            <Cyl c={c ?? "#c9cdd4"} p={[0, 0, 0]} s={[0.1, 0.02, 0.1]} r={[Math.PI / 2, 0, 0]} />
            <Box c={c ?? "#c9cdd4"} p={[0.25, 0, 0]} s={[0.35, 0.05, 0.02]} />
          </group>
        );
      case "wrench":
        return (
          <group position={[0, 0.03, 0]}>
            <Box c={c ?? "#c9cdd4"} p={[0, 0, 0]} s={[0.6, 0.04, 0.08]} />
            <Box c={c ?? "#c9cdd4"} p={[0.32, 0, 0]} s={[0.1, 0.04, 0.18]} />
          </group>
        );
      case "shovel":
        return (
          <group>
            <Cyl c="#a87b52" p={[0, 0.9, 0]} s={[0.035, 1.3, 0.035]} />
            <Box c="#8d939c" p={[0, 0.2, 0]} s={[0.3, 0.4, 0.04]} />
          </group>
        );
      case "jack":
        return (
          <group rotation={[0, 0, deg(prop.tilt ?? 0)]}>
            <Box c="#c0392b" p={[0, 0.06, 0]} s={[0.5, 0.12, 0.3]} />
            <Box c="#7b7f8c" p={[0, 0.3, 0]} s={[0.08, 0.4, 0.08]} />
            <Box c="#c0392b" p={[0, 0.52, 0]} s={[0.25, 0.06, 0.2]} />
          </group>
        );
      case "stand":
        return (
          <group>
            <Box c="#e1b12c" p={[0, 0.25, 0]} s={[0.3, 0.5, 0.3]} />
          </group>
        );
      case "knife":
        return (
          <group>
            <Box c="#d9dee5" p={[0.15, 0, 0]} s={[0.35, 0.07, 0.015]} />
            <Box c="#2a2d36" p={[-0.12, 0, 0]} s={[0.2, 0.06, 0.04]} />
          </group>
        );
      case "pan":
        return (
          <group>
            <Cyl c="#2a2d36" p={[0, 0.04, 0]} s={[0.3, 0.08, 0.3]} />
            <Box c="#2a2d36" p={[0.5, 0.06, 0]} s={[0.45, 0.04, 0.06]} />
          </group>
        );
      case "brain":
        return (
          <group position={[0, 0.5, 0]}>
            <Ball c={c ?? "#f2a3b8"} p={[-0.2, 0, 0]} s={[0.35, 0.33, 0.45]} />
            <Ball c={c ?? "#f2a3b8"} p={[0.2, 0, 0]} s={[0.35, 0.33, 0.45]} />
            <Ball c={shade(c ?? "#f2a3b8", -0.08)} p={[0, -0.25, -0.15]} s={[0.2, 0.15, 0.2]} />
          </group>
        );
      case "soil":
        return <Box c={c ?? "#7a5236"} p={[0, 0.06, 0]} s={[1.4, 0.12, 0.6]} />;
      case "goal":
        return (
          <group>
            <Cyl c="#ffffff" p={[-1.8, 1.0, 0]} s={[0.06, 2.0, 0.06]} />
            <Cyl c="#ffffff" p={[1.8, 1.0, 0]} s={[0.06, 2.0, 0.06]} />
            <Cyl c="#ffffff" p={[0, 2.0, 0]} s={[0.06, 3.66, 0.06]} r={[0, 0, Math.PI / 2]} />
            <Plane c="#e8eef3" o={0.35} p={[0, 1.0, -0.6]} s={[3.6, 2.0, 1]} />
          </group>
        );
      case "stairs":
        return (
          <group>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Box key={i} c={i % 2 ? "#c9ced8" : "#d6dbe4"} p={[0, 0.15 + i * 0.3, -i * 0.45]} s={[2.4, 0.3, 0.45]} />
            ))}
          </group>
        );
      case "toothbrush":
        return (
          <group>
            <Cyl c={c ?? "#4fb3e8"} p={[0, 0, 0]} s={[0.025, 0.4, 0.025]} r={[0, 0, Math.PI / 2]} />
            <Box c="#ffffff" p={[0.18, 0.04, 0]} s={[0.08, 0.06, 0.04]} />
          </group>
        );
      case "bag":
        return (
          <group>
            <Box c={c ?? "#f4f1ea"} p={[0, 0.25, 0]} s={[0.4, 0.5, 0.25]} />
            <Ball c="#8fd16a" p={[0.08, 0.55, 0]} s={0.09} />
            <Ball c="#f2c230" p={[-0.08, 0.53, 0.02]} s={0.08} />
          </group>
        );
      case "socks":
        return (
          <group>
            <Box c={c ?? "#e2394f"} p={[0, 0.15, 0]} s={[0.12, 0.3, 0.1]} />
            <Box c={c ?? "#e2394f"} p={[0.04, 0.02, 0.06]} s={[0.12, 0.08, 0.2]} />
          </group>
        );
      case "glass":
        return <Cyl c="#bfefff" o={0.6} p={[0, 0.14, 0]} s={[0.1, 0.28, 0.1]} />;
      case "needle":
        return <Cyl c="#c9cdd4" p={[0, 0, 0]} s={[0.01, 0.4, 0.01]} r={[0, 0, Math.PI / 2]} />;
      default:
        return null;
    }
  })();
  // Телекинез: предмет поднимается, светится, покачивается и может лететь к точке
  const f = prop.float;
  let px = prop.x, py = prop.y ?? 0, pz = prop.z, spin = 0, k = 0;
  if (f) {
    const at = f.at ?? 0;
    k = easeInOut(clamp((t - at) / 0.8)) * (f.until !== undefined ? 1 - easeInOut(clamp((t - f.until) / 0.6)) : 1);
    if (f.shake) { px += Math.sin(t * 47) * 0.04 * k; pz += Math.cos(t * 39) * 0.03 * k; }
    py += (f.height ?? 1.2) * k + (f.bob === false ? 0 : Math.sin(t * 2.3 + prop.x) * 0.08 * k);
    if (f.spin) spin = (t - at) * 1.4 * k;
    if (f.to) {
      const m = easeInOut(clamp((t - at - 0.8) / (f.dur ?? 1.0)));
      px = lerp(px, f.to[0], m);
      py = lerp(py, f.to[1], m);
      pz = lerp(pz, f.to[2], m);
    }
  }
  const glow = f?.glow ?? "#b06bff";
  const aura = f?.aura ?? 0.95;
  return (
    <group position={[px, py, pz]} rotation={[spin * 0.3 + deg(prop.pitch ?? 0), deg(prop.rotation ?? 0) + spin, 0]} scale={prop.scale ?? 1}>
      {inner}
      {f && k > 0.02 ? (
        <group>
          <Ball c={glow} e o={0.22} p={[0, 0.55, 0]} s={[aura * k, aura * 0.9 * k, aura * k]} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = t * 2 + i * 1.047;
            return <Ball key={i} c={glow} e p={[Math.cos(a) * aura * 0.9, 0.3 + ((t * 0.8 + i * 0.17) % 1) * 0.7 * aura, Math.sin(a) * aura * 0.9]} s={0.05 * k} />;
          })}
        </group>
      ) : null}
    </group>
  );
};

const SignBoard: React.FC<{ text: string; color: string }> = ({ text, color }) => {
  const tex = useLabelTexture(text, color, 2.2);
  return (
    <group position={[0, 2.35, 0.06]}>
      <Box c="#f4f1ea" s={[1.5, 0.72, 0.06]} />
      <TexPlane tex={tex} p={[0, 0, 0.032]} s={[1.42, 0.65, 1]} />
    </group>
  );
};
