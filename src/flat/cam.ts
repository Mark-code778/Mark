// 2D-камера: всегда смотрит прямо (как в плоской анимации), планы и движения — через масштаб и сдвиг.
import type { Actor, CameraSpec, Vec3 } from "../types";
import { actorStateAt, type buildSegments } from "../three/actor";
import { clamp, easeInOut, easeOut, lerp, noise1 } from "../util";

export type Projected = { xy: [number, number]; s: number };
export type Proj = (x: number, y: number, z: number) => Projected;

// W — видимая ширина кадра (в единицах мира) на глубине цели; look — высота центра кадра
const SHOTS = {
  wide: { W: 15, look: 1.75 },
  medium: { W: 7.6, look: 1.35 },
  close: { W: 3.3, look: 2.0 },
  extreme: { W: 2.0, look: 2.1 },
};

export const flatCamera = (
  spec: CameraSpec | undefined,
  actors: Actor[],
  len: number,
  t: number,
  segsFor: (a: Actor) => ReturnType<typeof buildSegments>,
  width: number,
  height: number,
) => {
  const shot = SHOTS[spec?.shot ?? "medium"];
  const u = easeInOut(clamp(t / Math.max(0.01, len)));
  let target: Vec3 = [0, 0, 0];
  if (Array.isArray(spec?.target)) target = spec!.target as Vec3;
  else if (typeof spec?.target === "string") {
    const a = actors.find((x) => x.id === spec!.target);
    if (a) {
      const st = actorStateAt(a, segsFor(a), t);
      target = [st.x, 0, st.z];
    }
  } else if (actors.length) {
    const main = actors.filter((a) => !a.id.startsWith("crowd-"));
    const list = main.length ? main : actors;
    target = [list.reduce((s, a) => s + a.x, 0) / list.length, 0, list.reduce((s, a) => s + a.z, 0) / list.length];
  }
  let sc = 1;
  if (typeof spec?.target === "string") sc = actors.find((x) => x.id === spec!.target)?.scale ?? 1;
  else if (!Array.isArray(spec?.target) && actors.length) {
    const main = actors.filter((a) => !a.id.startsWith("crowd-"));
    if (main.length) sc = Math.max(...main.map((a) => a.scale ?? 1));
  }
  const k = { wide: 0, medium: 0.6, close: 1, extreme: 1 }[spec?.shot ?? "medium"];
  const f = lerp(1, sc, k);
  let W = shot.W * f;
  let look = shot.look * f + target[1] + (spec?.height ?? 0) * 0.3;
  let tx = target[0];
  // небольшой сдвиг вместо поворота камеры
  tx += (spec?.angle ?? 0) * 0.004 * W;
  switch (spec?.move ?? "static") {
    case "dolly-in":
      W *= lerp(1.12, 0.84, u);
      break;
    case "dolly-out":
      W *= lerp(0.86, 1.14, u);
      break;
    case "pan-left":
      tx += lerp(0.12, -0.12, u) * W;
      break;
    case "pan-right":
      tx += lerp(-0.12, 0.12, u) * W;
      break;
    case "orbit":
      tx += lerp(-0.06, 0.06, u) * W;
      W *= lerp(1.04, 0.94, u);
      break;
    case "push":
      W *= lerp(1, 0.58, easeOut(clamp(t / Math.max(0.01, len))));
      break;
    case "rise":
      look += lerp(-0.3, 0.6, u);
      break;
    default:
      break;
  }
  const shake = spec?.move === "shake" ? 0.012 * W : 0.0012 * W;
  tx += noise1(t * (spec?.move === "shake" ? 9 : 0.8), 1) * shake;
  look += noise1(t * (spec?.move === "shake" ? 11 : 0.7), 5) * shake;

  const tz = target[2];
  const D = Math.max(10, W * 1.6); // «дистанция»: чем меньше, тем сильнее глубина
  const S = width / W;
  const proj: Proj = (x, y, z) => {
    const kz = D / Math.max(0.6, D + (tz - z));
    const s = S * kz;
    return { xy: [width / 2 + (x - tx) * s, height / 2 + (look - y) * s], s };
  };
  return { proj, W, tx, tz, look, D, S };
};
