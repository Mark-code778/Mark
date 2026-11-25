// THE STYLE. Change nothing here per-video; every video shares this look.
export const W = 1920;
export const H = 1080;
export const FPS = 30;
export const EARTH_KM = 6371;

export const COLORS = {
  accent: '#FFD24A', // warm yellow: the subject, distance lines, highlights
  red: '#FF5A4E', // the "other side", danger, borders in dispute
  white: '#FFFFFF',
  blue: '#8FD3FF', // water names, sea borders
  ink: 'rgba(8,12,18,0.82)', // pill / box background
  border: 'rgba(255,255,255,0.72)', // land borders
  coast: 'rgba(255,255,255,0.45)',
  states: 'rgba(255,255,255,0.28)',
  space: '#02040a',
};

export const FONT_SANS = 'Inter, sans-serif';
export const FONT_SERIF = '"Playfair Display", serif';

export const SHADOW = '0 2px 6px rgba(0,0,0,0.85), 0 0 18px rgba(0,0,0,0.55)';

// Imagery colour grade (applied to satellite rasters)
export const GRADE = 'brightness(0.84) saturate(0.92) contrast(1.08)';

// Projection switch: above GLOBE_FULL km across we see a globe, below MAP_FULL a flat Mercator map.
export const GLOBE_FULL = 10000;
export const MAP_FULL = 6000;
// Imagery: Landsat (30 m) fades in below CLOSE_START km across.
export const CLOSE_START = 300;
export const CLOSE_FULL = 160;

// Animation defaults (seconds)
export const DRAW_DUR = 1.6;
export const LABEL_IN = 0.45;
export const DEFAULT_PUSH = 0.93; // when a shot gives no camera: continue and push in 7%

export const colorOf = (c?: string) => (COLORS as Record<string, string>)[c ?? 'accent'] ?? COLORS.accent;
