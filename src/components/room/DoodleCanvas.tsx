import { useCallback, useEffect, useRef } from "react";
import { makeId } from "@/utils/storage";
import type { Stroke } from "@/types";

interface DoodleCanvasProps {
  strokes: Stroke[];
  readOnly: boolean;
  brush: { color: string; size: number; erase: boolean };
  authorId: string;
  onStroke: (stroke: Stroke, final: boolean) => void;
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  width: number,
  height: number,
) {
  const points = stroke.points;
  if (points.length === 0) return;

  ctx.save();
  ctx.globalCompositeOperation = stroke.erase ? "destination-out" : "source-over";
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (points.length === 1) {
    const p = points[0];
    ctx.beginPath();
    ctx.arc(p.x * width, p.y * height, stroke.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x * width, points[0].y * height);
  for (let i = 1; i < points.length; i += 1) {
    ctx.lineTo(points[i].x * width, points[i].y * height);
  }
  ctx.stroke();
  ctx.restore();
}

/** 涂鸦画布：仅画手可落笔，笔画以 0~1 归一化坐标存储 */
export function DoodleCanvas({
  strokes,
  readOnly,
  brush,
  authorId,
  onStroke,
}: DoodleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Stroke[]>(strokes);
  const liveRef = useRef<Stroke | null>(null);
  const lastSentRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  strokesRef.current = strokes;

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    for (const stroke of strokesRef.current) drawStroke(ctx, stroke, width, height);
    if (liveRef.current) drawStroke(ctx, liveRef.current, width, height);
  }, []);

  useEffect(() => {
    paint();
  }, [strokes, paint]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      paint();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [paint]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const schedulePaint = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      paint();
    });
  }, [paint]);

  const toNorm = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    };
  };

  const handleDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    liveRef.current = {
      id: makeId("s"),
      playerId: authorId,
      color: brush.color,
      size: brush.size,
      erase: brush.erase,
      points: [toNorm(event)],
    };
    lastSentRef.current = 0;
    schedulePaint();
  };

  const handleMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly || !liveRef.current) return;
    liveRef.current.points.push(toNorm(event));
    schedulePaint();
    const now = performance.now();
    if (now - lastSentRef.current > 60) {
      lastSentRef.current = now;
      onStroke({ ...liveRef.current, points: [...liveRef.current.points] }, false);
    }
  };

  const handleUp = () => {
    if (!liveRef.current) return;
    const stroke = liveRef.current;
    liveRef.current = null;
    paint();
    onStroke(stroke, true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border-[3px] border-ink bg-paper shadow-sticker">
      {/* 淡淡的点阵，让画布不那么空 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: "radial-gradient(#14141412 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      />
      <canvas
        ref={canvasRef}
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onPointerLeave={handleUp}
        className={`doodle-surface relative h-full w-full ${readOnly ? "cursor-not-allowed" : ""}`}
      />
      {readOnly && (
        <span className="pointer-events-none absolute left-3 top-3 rounded-full border-[3px] border-ink bg-lemon-300 px-3 py-1 text-xs font-bold shadow-sticker-sm">
          观战中 · 画手正在狂涂
        </span>
      )}
    </div>
  );
}
