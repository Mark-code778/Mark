import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import faces from "./montserrat.json";

// Montserrat из public/fonts (скачан заранее): рендер не зависит от сети
export const FONT = "Montserrat";
const font = {
  waitUntilDone: () =>
    Promise.all(
      faces.map(async (f) => {
        const face = new FontFace(FONT, `url(${staticFile(f.file)}) format("woff2")`, { weight: f.weight, unicodeRange: f.range });
        document.fonts.add(await face.load());
      }),
    ),
};

// Ждём шрифт перед рисованием текста на 3D-текстурах (экраны, таблички)
let ready = false;
const readyPromise = font.waitUntilDone().then(() => {
  ready = true;
});

export const useFontReady = () => {
  const [ok, setOk] = useState(ready);
  const [handle] = useState(() => (ready ? null : delayRender("font")));
  useEffect(() => {
    if (ready) {
      if (handle !== null) continueRender(handle);
      return;
    }
    readyPromise.then(() => {
      setOk(true);
      if (handle !== null) continueRender(handle);
    });
  }, [handle]);
  return ok;
};
