// s001 — hoodie guy, late again, argues; the boss points at him. Same composition as the reference, no speech bubble.
import { registerShot, layer, ease, clamp } from '/engine/core.js';
import { office, snow } from '../sets/office.js';
import { drawFlat, OUTFITS, ARMS, blendArm } from '../_flatman.js';

registerShot('s001', { draw(g, t, info) {
  const cam = { z: 1 + 0.035 * ease.inOut(t / info.dur), x: -6 * ease.inOut(t / info.dur) };
  const { GY } = office(g, t, cam);
  layer(g, cam, 1, (g) => {
  // talk without a bubble: mouth flaps + a little forearm pump on the words
  const talk = t > 0.4 && t < 3.6 ? clamp(0.5 + 0.5 * Math.sin(t * 15)) * clamp(0.5 + 0.5 * Math.sin(t * 3.7)) : 0;
  const pump = 0.5 + 0.5 * Math.sin(t * 5.5);
  drawFlat(g, { x: 770, y: GY + 8, s: 1, f: 1, t, seed: 1, outfit: OUTFITS.hoodie,
    armF: blendArm(ARMS.fistUp, { el: [34, 76], ha: [78, 30] }, t > 0.4 && t < 3.6 ? pump : 0),
    face: { brows: 'angry', mouth: 'wavy', talk, blink: (t % 3.3) > 3.18, look: [0.4, 0] } });
  const reach = ease.out(clamp(t / 0.6));
  drawFlat(g, { x: 1236, y: GY + 8, s: 1, f: -1, t, seed: 4, outfit: OUTFITS.suit,
    armF: blendArm(ARMS.down, ARMS.pointFwd, 0.85 + 0.15 * reach),
    face: { glasses: true, brows: 'worried', mouth: 'flat', look: [-0.2, 0] } });
  });
  snow(g, t);
}});
