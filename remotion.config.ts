import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// 3D рисуется через WebGL: на Windows и Mac нужен режим angle
Config.setChromiumOpenGlRenderer("angle");
Config.setEntryPoint("src/index.ts");
// В облачном контейнере: готовый headless-браузер и программный WebGL (видеокарты нет)
if (process.env.STICKMAN_CLOUD) {
  Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell");
  Config.setChromiumOpenGlRenderer("swangle");
}
