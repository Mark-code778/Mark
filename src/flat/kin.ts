// Кинематика стикмена для 2D-отрисовки: те же позы, что у 3D-рига (poses.ts),
// но на выходе — мировые координаты суставов, которые потом проецируются в плоскость.
import * as THREE from "three";
import type { ActorState } from "../three/actor";

export const R_HEAD = 0.34;
const HIP_Y = 1.04;

export type V3 = [number, number, number];
export type Limb = { a: V3; b: V3; c: V3; d?: V3 }; // плечо/бедро → локоть/колено → кисть/стопа (→ носок)
export type Skeleton = {
  pelvis: V3;
  chest: V3;
  neck: V3;
  head: V3;
  headM: THREE.Matrix4; // матрица головы: для черт лица на сфере
  arms: { L: Limb; R: Limb };
  legs: { L: Limb; R: Limb };
  holdM: THREE.Matrix4; // правая кисть: для предмета в руке
  facing: V3; // куда смотрит корпус (мир)
};

const m4 = (pos: V3, rot: V3, order: THREE.EulerOrder = "XYZ") =>
  new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2], order)), new THREE.Vector3(1, 1, 1));

const pt = (m: THREE.Matrix4, p: V3): V3 => {
  const v = new THREE.Vector3(...p).applyMatrix4(m);
  return [v.x, v.y, v.z];
};

export const skeleton = (st: ActorState, scale = 1): Skeleton => {
  const p = st.pose;
  const root = new THREE.Matrix4()
    .compose(new THREE.Vector3(st.x, 0, st.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, st.yaw, 0)), new THREE.Vector3(scale, scale, scale))
    .multiply(m4([0, p.lift, 0], [p.rootX, 0, p.rootZ]));
  const pelvisM = root.clone().multiply(m4([0, HIP_Y + p.bob, 0], [0, p.twist, 0]));
  const torsoM = pelvisM.clone().multiply(m4([0, 0, 0], [p.lean, 0, 0]));

  const leg = (side: 1 | -1): Limb => {
    const hip = side === 1 ? p.lHip : p.rHip;
    const out = side === 1 ? p.lHipOut : p.rHipOut;
    const knee = side === 1 ? p.lKnee : p.rKnee;
    const hm = pelvisM.clone().multiply(m4([0.11 * side, 0.02, 0], [-hip, 0, out * side]));
    const km = hm.clone().multiply(m4([0, -0.5, 0], [knee, 0, 0]));
    return { a: pt(hm, [0, 0, 0]), b: pt(km, [0, 0, 0]), c: pt(km, [0, -0.5, 0]), d: pt(km, [0, -0.52, 0.17]) };
  };
  let holdM = new THREE.Matrix4();
  const arm = (side: 1 | -1): Limb => {
    const fwd = side === 1 ? p.lFwd : p.rFwd;
    const out = side === 1 ? p.lOut : p.rOut;
    const elbow = side === 1 ? p.lElbow : p.rElbow;
    const sm = torsoM.clone().multiply(m4([0.25 * side, 0.6, 0], [-fwd, 0, out * side]));
    const em = sm.clone().multiply(m4([0, -0.38, 0], [-elbow, 0, 0]));
    if (side === -1) holdM = em.clone().multiply(m4([0, -0.42, 0], [0, 0, 0]));
    return { a: pt(sm, [0, 0, 0]), b: pt(em, [0, 0, 0]), c: pt(em, [0, -0.4, 0]) };
  };
  const headM = torsoM.clone().multiply(m4([0, 1.08, 0], [p.headX, p.headY, p.headZ]));
  const f = new THREE.Vector3(0, 0, 1).transformDirection(torsoM);
  return {
    pelvis: pt(torsoM, [0, 0.08, 0]),
    chest: pt(torsoM, [0, 0.62, 0]),
    neck: pt(torsoM, [0, 0.78, 0]),
    head: pt(headM, [0, 0, 0]),
    headM,
    arms: { L: arm(1), R: arm(-1) },
    legs: { L: leg(1), R: leg(-1) },
    holdM,
    facing: [f.x, f.y, f.z],
  };
};

// точка на поверхности головы (x, y — в радиусах от центра лица) и её нормаль
export const onHead = (headM: THREE.Matrix4, x: number, y: number): { p: V3; nz: number; nx: number } => {
  const z = Math.sqrt(Math.max(0.0001, R_HEAD * R_HEAD - x * x - y * y));
  const v = new THREE.Vector3(x, y, z).applyMatrix4(headM);
  const c = new THREE.Vector3(0, 0, 0).applyMatrix4(headM);
  const n = v.clone().sub(c).normalize();
  return { p: [v.x, v.y, v.z], nz: n.z, nx: n.x };
};

export const toWorld = (m: THREE.Matrix4, p: V3): V3 => pt(m, p);
