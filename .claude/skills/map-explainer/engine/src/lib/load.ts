import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

const cache = new Map<string, Promise<any>>();

function once<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key)!;
}

export const loadJson = (p: string) => once('json:' + p, () => fetch(staticFile(p)).then((r) => r.json()));

export const loadImage = (p: string) =>
  once('img:' + p, () => new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error('image failed: ' + p));
    img.src = staticFile(p);
  }));

/** Globe texture as raw pixels for per-pixel reprojection. */
export const loadPixels = (p: string) =>
  once('px:' + p, async () => {
    const img = await loadImage(p);
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    return {w: c.width, h: c.height, data: ctx.getImageData(0, 0, c.width, c.height).data};
  });

const fontsReady = once('fonts', async () => {
  const faces: [string, string, string, string?][] = [
    ['Inter', 'fonts/Inter-400.ttf', '400'],
    ['Inter', 'fonts/Inter-600.ttf', '600'],
    ['Inter', 'fonts/Inter-800.ttf', '800'],
    ['Playfair Display', 'fonts/PlayfairDisplay-600.ttf', '600'],
    ['Playfair Display', 'fonts/PlayfairDisplay-800.ttf', '800'],
    ['Playfair Display', 'fonts/PlayfairDisplay-600i.ttf', '600', 'italic'],
  ];
  await Promise.all(faces.map(async ([fam, file, weight, style]) => {
    const f = new FontFace(fam, `url(${staticFile(file)})`, {weight, style: style ?? 'normal'});
    await f.load();
    document.fonts.add(f);
  }));
});

/** Suspends rendering until the promise resolves. */
export function useAsset<T>(p: () => Promise<T>, key: string): T | null {
  const [val, setVal] = useState<T | null>(null);
  const [handle] = useState(() => delayRender('asset ' + key, {timeoutInMilliseconds: 120000}));
  useEffect(() => {
    Promise.all([p(), fontsReady]).then(([v]) => {
      setVal(v);
      continueRender(handle);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return val;
}
