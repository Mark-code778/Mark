import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";

// Шрифт Montserrat лежит локально (public/fonts) — рендер не зависит от интернета
const FAMILY = "Montserrat";
const faces = [
  ["fonts/montserrat-lat.woff2", "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD"],
  ["fonts/montserrat-cyr.woff2", "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116"],
];
const font = {
  fontFamily: FAMILY,
  waitUntilDone: () =>
    Promise.all(
      faces.map(([src, range]) => {
        const f = new FontFace(FAMILY, `url(${staticFile(src)}) format("woff2")`, { weight: "100 900", unicodeRange: range });
        (document.fonts as unknown as Set<FontFace>).add(f);
        return f.load();
      }),
    ).then(() => undefined),
};
export const FONT = font.fontFamily;

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
