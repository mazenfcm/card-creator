/**
 * CardCanvas — Dark Cyber-Football theme
 * Renders the FC Mobile card using HTML5 Canvas.
 * Composites: background → render → text (name, ovr, position) → assets (flags/leagues/clubs)
 */
import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";

export interface CardAssetItem {
  url: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CardData {
  backgroundUrl?: string;
  renderUrl?: string;
  name: string;
  ovr: string;
  position: string;
  playerType: "Icon" | "Live";
  nameColor: string;
  ovrColor: string;
  positionColor: string;
  nationUrl?: string;
  clubUrl?: string;
  leagueUrl?: string;
}

export interface CardCanvasHandle {
  exportCanvas: (size: number) => Promise<Blob | null>;
}

const BASE = 1024;

// Font sizes relative to 1024 base
const FONT_NAME_SIZE = 88;  // 90 - 2
const FONT_OVR_SIZE = 144;  // 145 - 1
const FONT_POS_SIZE = 96;   // 92 + 4

// Text boxes (x, y, w, h) at 1024 base
const COORDS = {
  name:     { x: 348, y: 672, w: 324, h: 91 },  // x -2, y +8
  ovr:      { x: 218, y: 133, w: 162, h: 103 }, // x -5, y +13
  position: { x: 269, y: 274, w: 98,  h: 69 },  // x +12, y +15, size +4
};

// Asset positions at 1024 base
const ASSET_POSITIONS = {
  Icon: {
    nation: { x: 329, y: 752, w: 96, h: 96 },
    league: { x: 585, y: 752, w: 96, h: 96 },
  },
  Live: {
    nation: { x: 255, y: 752, w: 96, h: 96 },
    league: { x: 468, y: 752, w: 96, h: 96 },
    club:   { x: 672, y: 752, w: 96, h: 96 },
  },
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: { x: number; y: number; w: number; h: number },
  color: string,
  font: string
) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

interface CardCanvasProps {
  data: CardData;
  onRenderComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const CardCanvas = forwardRef<CardCanvasHandle, CardCanvasProps>(
  ({ data, onRenderComplete, className, style }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const render = useCallback(async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Wait for font to load
      try {
        await document.fonts.load('700 100px CruyffSans');
      } catch (e) {
        console.warn('Font loading failed, using fallback');
      }

      canvas.width = BASE;
      canvas.height = BASE;

      // Clear with transparent background
      ctx.clearRect(0, 0, BASE, BASE);

      // Ensure font is set for context and composite mode
      ctx.font = 'bold 100px CruyffSans, sans-serif';
      ctx.globalCompositeOperation = 'source-over';

      // 1. Background (optional - if not provided, transparent)
      if (data.backgroundUrl) {
        try {
          const bg = await loadImage(data.backgroundUrl);
          ctx.drawImage(bg, 0, 0, BASE, BASE);
        } catch {/* ignore */}
      } else {
        // Keep transparent if no background provided
        ctx.clearRect(0, 0, BASE, BASE);
      }

      // 2. Render layer
      if (data.renderUrl) {
        try {
          const render = await loadImage(data.renderUrl);
          ctx.drawImage(render, 0, 0, BASE, BASE);
        } catch {/* ignore */}
      }

      // 3. Text
      if (data.name) {
        ctx.font = `bold ${FONT_NAME_SIZE}px CruyffSans, sans-serif`;
        drawCenteredText(
          ctx,
          data.name.toUpperCase(),
          COORDS.name,
          data.nameColor || "#FFFFFF",
          `bold ${FONT_NAME_SIZE}px CruyffSans, sans-serif`
        );
      }
      if (data.ovr) {
        ctx.font = `bold ${FONT_OVR_SIZE}px CruyffSans, sans-serif`;
        drawCenteredText(
          ctx,
          data.ovr,
          COORDS.ovr,
          data.ovrColor || "#FFFFFF",
          `bold ${FONT_OVR_SIZE}px CruyffSans, sans-serif`
        );
      }
      if (data.position) {
        ctx.font = `bold ${FONT_POS_SIZE}px CruyffSans, sans-serif`;
        drawCenteredText(
          ctx,
          data.position.toUpperCase(),
          COORDS.position,
          data.positionColor || "#FFFFFF",
          `bold ${FONT_POS_SIZE}px CruyffSans, sans-serif`
        );
      }

      // 4. Assets (nation, league, club)
      const positions = data.playerType === "Icon" ? ASSET_POSITIONS.Icon : ASSET_POSITIONS.Live;

      const drawAsset = async (url: string | undefined, pos: { x: number; y: number; w: number; h: number }) => {
        if (!url) return;
        try {
          const img = await loadImage(url);
          ctx.drawImage(img, pos.x, pos.y, pos.w, pos.h);
        } catch {/* ignore */}
      };

      await drawAsset(data.nationUrl, positions.nation);
      await drawAsset(data.leagueUrl, positions.league);
      if (data.playerType === "Live") {
        await drawAsset(data.clubUrl, (positions as typeof ASSET_POSITIONS.Live).club);
      }

      onRenderComplete?.();
    }, [data, onRenderComplete]);

    useEffect(() => {
      render();
    }, [render]);

    // Expose export function
    useImperativeHandle(ref, () => ({
      exportCanvas: async (size: number): Promise<Blob | null> => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        if (size === BASE) {
          return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        }

        // Resize to target size
        const offscreen = document.createElement("canvas");
        offscreen.width = size;
        offscreen.height = size;
        const offCtx = offscreen.getContext("2d");
        if (!offCtx) return null;
        offCtx.drawImage(canvas, 0, 0, size, size);
        return new Promise((resolve) => offscreen.toBlob(resolve, "image/png"));
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        width={BASE}
        height={BASE}
        className={className}
        style={{ imageRendering: "pixelated", ...style }}
      />
    );
  }
);

CardCanvas.displayName = "CardCanvas";
export default CardCanvas;
