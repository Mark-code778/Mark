// Одиночный кадр: превью для YouTube и сравнение стилей.
// Пропсы приходят из scripts/stills.mjs (inputProps): сцена, стиль и крупный текст превью.
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { ProjectCtx } from "./ctx";
import { FONT, useFontReady } from "./fonts";
import { SceneView } from "./SceneView";
import { THEMES } from "./theme";
import type { Project, Scene, ThemeName } from "./types";

export type ThumbLine = { text: string; color: string; size: number };
export type StillProps = { theme: ThemeName; scene: Scene; lines?: ThumbLine[]; label?: string };

export const Still: React.FC<StillProps & { base: Project }> = ({ base, theme, scene, lines, label }) => {
  const fontReady = useFontReady();
  const ctx = useMemo(() => {
    const project: Project = { ...base, theme, letterbox: false, duration: 3, scenes: [{ ...scene, start: 0, end: 3 }] };
    return { project, theme: THEMES[theme], brandColor: "#2bb3b1", brandName: "" };
  }, [base, theme, scene]);
  if (!fontReady) return <AbsoluteFill style={{ background: "#000" }} />;
  return (
    <ProjectCtx.Provider value={ctx}>
      <AbsoluteFill>
        <SceneView scene={ctx.project.scenes[0]} />
        {lines?.length ? (
          <div style={{ position: "absolute", left: 60, top: 50, transform: "rotate(-4deg) skewX(-9deg)", transformOrigin: "left top" }}>
            {lines.map((l, i) => (
              <div
                key={i}
                style={{
                  fontFamily: FONT,
                  fontWeight: 900,
                  fontSize: l.size,
                  lineHeight: 0.98,
                  letterSpacing: -2,
                  color: l.color,
                  WebkitTextStroke: `${Math.round(l.size * 0.11)}px #111`,
                  paintOrder: "stroke fill",
                  textShadow: "0 14px 0 rgba(0,0,0,0.55), 0 0 40px rgba(0,0,0,0.35)",
                  whiteSpace: "nowrap",
                }}
              >
                {l.text}
              </div>
            ))}
          </div>
        ) : null}
        {label ? (
          <div style={{ position: "absolute", left: 40, bottom: 36, fontFamily: FONT, fontWeight: 900, fontSize: 72, color: "#fff", background: "rgba(0,0,0,0.6)", padding: "8px 28px", borderRadius: 18 }}>
            {label}
          </div>
        ) : null}
      </AbsoluteFill>
    </ProjectCtx.Provider>
  );
};
