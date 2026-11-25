// Shot-list schema. shots.json = { meta, shots: Shot[] }. All times in seconds, relative to the shot start.
export type LonLat = [number, number];

/** A camera is a point and how many kilometres fit across the 1920px frame. */
export type Cam = {center: LonLat; span: number};

export type Color = 'accent' | 'red' | 'white' | 'blue';

export type Overlay =
  | {type: 'coast'; t?: number; d?: number}
  | {type: 'borders'; t?: number; d?: number; states?: boolean}
  | {type: 'country'; code: string; t?: number; d?: number; color?: Color; fill?: boolean; focus?: boolean}
  | {type: 'label'; text: string; pos: LonLat; kind: 'country' | 'region' | 'water' | 'place' | 'callout'; t?: number; side?: 'left' | 'right'}
  | {type: 'marker'; pos: LonLat; text?: string; t?: number; color?: Color; side?: 'left' | 'right'}
  | {type: 'distance'; from: LonLat; to: LonLat; text: string; t?: number; d?: number; color?: Color}
  | {type: 'line'; coords: LonLat[]; text?: string; t?: number; d?: number; color?: Color; dashed?: boolean}
  | {type: 'ring'; pos: LonLat; km: number; text?: string; t?: number; d?: number; color?: Color};

export type OnScreenText =
  | string
  | {text: string; style?: 'hook' | 'number' | 'caption' | 'chapter'; kicker?: string; t?: number};

export type Shot = {
  id: string;
  narration: string;
  visual: string; // human description of the shot
  duration: number; // estimate (seconds) until the voiceover is aligned
  kind?: 'map' | 'title';
  camera?: {from?: Cam; to?: Cam};
  overlays?: Overlay[];
  keep?: boolean; // carry previous shot's overlays (already drawn)
  onScreenText?: OnScreenText;
  transition?: 'cut' | 'fade';
  title?: {kicker?: string; text: string};
};

export type VideoMeta = {title: string; slug: string; lang: 'ru'};

export type GeoImage = {file: string; layer: 'wide' | 'close'; w: number; s: number; e: number; n: number; level: number};

/** public/current/video.json, written by scripts/prepare.ts */
export type VideoData = {
  meta: VideoMeta;
  fps: number;
  shots: (Shot & {from: number; frames: number; images: GeoImage[]})[];
  audio: string | null;
  totalFrames: number;
};
