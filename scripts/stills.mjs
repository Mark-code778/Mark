// Превью для YouTube и кадры во всех стилях -> out/stills/*.png
// Запуск: node scripts/stills.mjs  (в облаке: STICKMAN_CLOUD=1)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const CLOUD = !!process.env.STICKMAN_CLOUD;
const browser = CLOUD ? { browserExecutable: "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell" } : {};
const chromiumOptions = { gl: CLOUD ? "swangle" : "angle" };

const MAX = { id: "max", shirt: "#f28c38", sleeves: "long", pants: "#3a4466", hair: "none" };
const EGOR = { id: "egor", shirt: "#4cb86a", sleeves: "short", pants: "#5a4a3f", hair: "cap", hairColor: "#2e7d46" };
const BOSS = { id: "boss", shirt: "#283a66", sleeves: "long", pants: "#283a66", hair: "none" };

const salon = { location: "office", screen: { lines: [""] }, props: [{ type: "car", x: -3.4, z: -1.6, rotation: 25, color: "#e0453a" }, { type: "clock", x: -3.2, z: -7.8, y: 3.3 }] };
const W = "#ffffff", Y = "#ffe14d";

const jobs = [
  {
    name: "thumb-1",
    frame: 75,
    props: {
      theme: "pastel",
      scene: { ...salon, camera: { shot: "close", move: "static", target: [-0.15, -0.2, 0.6] }, actors: [{ ...MAX, x: 0.85, z: 1.35, face: "scared", action: "scared", facing: -20 }] },
      lines: [{ text: "МОРГНУЛ —", color: W, size: 170 }, { text: "МИНУС", color: Y, size: 210 }, { text: "ГОД?!", color: Y, size: 210 }],
    },
  },
  {
    name: "thumb-2",
    frame: 75,
    props: {
      theme: "golden",
      scene: { location: "studio", bg: "#24345a", camera: { shot: "close", move: "static", target: [-0.15, -0.2, 0.6] }, actors: [{ ...MAX, x: 0.85, z: 1.35, face: "surprised", action: "scared", facing: -20 }] },
      lines: [{ text: "МНЕ УЖЕ", color: W, size: 180 }, { text: "25?!", color: Y, size: 300 }],
    },
  },
];

const styleScene = {
  location: "street",
  camera: { shot: "medium", move: "static", angle: 15 },
  actors: [
    { ...MAX, x: -1.6, z: 0.4, face: "grin", action: "wave", facing: 20 },
    { ...EGOR, x: 0, z: 0.2, face: "happy", action: "talk", talking: true, facing: -10 },
    { ...BOSS, x: 1.6, z: 0.4, face: "smirk", action: "point", facing: -30 },
  ],
};
for (const [theme, label] of [["pastel", "PASTEL — пастель"], ["dusk", "DUSK — закат"], ["golden", "GOLDEN — тёплый"], ["night", "NIGHT — ночь"]]) {
  jobs.push({ name: `style-${theme}`, frame: 45, props: { theme, scene: styleScene, label } });
}

const only = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
mkdirSync("out/stills", { recursive: true });
for (const j of jobs) {
  if (only.length && !only.includes(j.name)) continue;
  const composition = await selectComposition({ serveUrl, id: "Still", inputProps: j.props, chromiumOptions, ...browser, logLevel: "error" });
  const output = `out/stills/${j.name}.png`;
  await renderStill({ serveUrl, composition, frame: j.frame, output, imageFormat: "png", inputProps: j.props, chromiumOptions, ...browser, logLevel: "error" });
  console.log(output);
}
