import React from 'react';
import {Audio, Composition, Sequence, staticFile} from 'remotion';
import {VideoData} from './lib/types';
import {FPS, H, W} from './lib/theme';
import {Shot} from './components/Shot';

const MapExplainer: React.FC<{data: VideoData | null}> = ({data}) => {
  if (!data) return null;
  return (
    <>
      {data.shots.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.frames} name={`${s.id}: ${s.narration.slice(0, 40)}`}>
          <Shot shot={s} />
        </Sequence>
      ))}
      {data.audio && <Audio src={staticFile(data.audio)} />}
    </>
  );
};

export const Root: React.FC = () => (
  <Composition
    id="MapExplainer"
    component={MapExplainer}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={FPS * 10}
    defaultProps={{data: null as VideoData | null}}
    calculateMetadata={async () => {
      const data = (await fetch(staticFile('current/video.json')).then((r) => r.json())) as VideoData;
      return {durationInFrames: Math.max(1, data.totalFrames), props: {data}};
    }}
  />
);
