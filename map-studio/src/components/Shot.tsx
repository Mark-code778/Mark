import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {VideoData} from '../lib/types';
import {cameraAt, globe, globeWeight, mercator, smooth} from '../lib/camera';
import {loadImage, loadJson, loadPixels, useAsset} from '../lib/load';
import {GlobeImagery, LoadedImage, MapImagery} from './Imagery';
import {GeoLayers, Overlays} from './Overlays';
import {Hud, OnScreenText, TitleCard, Vignette} from './Text';

type S = VideoData['shots'][number];

export const Shot: React.FC<{shot: S}> = ({shot}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cam0 = shot.camera as {from: any; to: any};
  const needsGlobe = [0, 0.5, 1].some((p) => globeWeight(cameraAt(cam0, p).span) > 0) || globeWeight(cam0.from.span) > 0;

  const assets = useAsset(async () => {
    const [geo, world, images, tex] = await Promise.all([
      loadJson('current/geo.json'),
      needsGlobe ? loadJson('current/world.json') : Promise.resolve(null),
      Promise.all(shot.images.map(async (im) => ({...im, img: await loadImage(im.file)}) as LoadedImage)),
      needsGlobe ? loadPixels('tiles/world.jpg') : Promise.resolve(null),
    ]);
    const local: GeoLayers = {coast: geo.coast.features, borders: geo.borders.features, maritime: geo.maritime.features, states: geo.states.features, countries: geo.countries.features};
    const glob: GeoLayers | null = world ? {coast: world.features, borders: [], maritime: [], states: [], countries: world.features} : null;
    return {local, glob, images, tex};
  }, shot.id);
  if (!assets) return null;

  const t = frame / fps;
  const dur = shot.frames / fps;
  const cam = cameraAt(cam0, Math.min(1, frame / Math.max(1, shot.frames - 1)));
  const gw = globeWeight(cam.span);
  const overlays = shot.overlays ?? [];
  const isTitle = shot.kind === 'title';
  const fadeIn = shot.transition === 'fade' ? smooth(frame / 12) : 1;

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: fadeIn, filter: isTitle ? 'blur(6px) brightness(0.45)' : undefined}}>
        {gw < 1 && (
          <AbsoluteFill>
            <MapImagery images={assets.images} proj={mercator(cam)} cam={cam} />
            <Overlays overlays={overlays} proj={mercator(cam)} t={t} cam={cam} geo={assets.local} />
          </AbsoluteFill>
        )}
        {gw > 0 && assets.tex && assets.glob && (
          <AbsoluteFill style={{opacity: gw}}>
            <GlobeImagery tex={assets.tex} cam={cam} />
            <Overlays overlays={overlays} proj={globe(cam)} t={t} cam={cam} geo={assets.glob} />
          </AbsoluteFill>
        )}
        <Vignette />
        {!isTitle && <Hud cam={cam} />}
      </AbsoluteFill>
      {isTitle && shot.title && <TitleCard kicker={shot.title.kicker} text={shot.title.text} t={t} dur={dur} />}
      {shot.onScreenText && <OnScreenText v={shot.onScreenText} t={t} dur={dur} />}
    </AbsoluteFill>
  );
};
