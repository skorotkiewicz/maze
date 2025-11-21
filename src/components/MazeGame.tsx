import { clsx } from "clsx";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Level, Point } from "../types";
import { isPointInCircle, isPointInRect, lineIntersectsRect } from "../utils/collision";

interface MazeGameProps {
  level: Level;
  onWin: () => void;
  onLose: () => void;
  onBack: () => void;
}

type GameStatus = "idle" | "playing" | "won" | "lost";

export function MazeGame({ level, onWin, onLose, onBack }: MazeGameProps) {
  const [status, setStatus] = useState<GameStatus>("idle");
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const lastPos = useRef<Point | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when level changes
  useEffect(() => {
    setStatus("idle");
    lastPos.current = null;
  }, [level]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const currentPos = { x, y };

      setMousePos(currentPos);

      if (status === "playing") {
        // Check for wall collisions
        const prev = lastPos.current || currentPos;
        const CURSOR_RADIUS = 6; // Match the visual cursor size (w-3 h-3 = 12px dia => 6px rad)

        // 1. Check if we hit any walls (expand walls by cursor radius to account for edge hits)
        const hitWall = level.walls.some((wall) => {
          const expandedWall = {
            x: wall.x - CURSOR_RADIUS,
            y: wall.y - CURSOR_RADIUS,
            width: wall.width + CURSOR_RADIUS * 2,
            height: wall.height + CURSOR_RADIUS * 2,
          };
          return lineIntersectsRect(prev, currentPos, expandedWall);
        });

        if (hitWall) {
          setStatus("lost");
          onLose();
          return;
        }

        // 2. Check if we reached the end
        if (isPointInRect(currentPos, level.end)) {
          setStatus("won");
          onWin();
          return;
        }

        // 3. Check if we went out of bounds (optional, but good for anti-cheat)
        if (x < 0 || x > level.size.width || y < 0 || y > level.size.height) {
          setStatus("lost");
          onLose();
          return;
        }
      } else if (status === "idle") {
        // Check if we entered the start zone
        if (isPointInCircle(currentPos, level.start, level.start.radius)) {
          setStatus("playing");
        }
      }

      lastPos.current = currentPos;
    },
    [status, level, onWin, onLose],
  );

  const handleMouseLeave = useCallback(() => {
    if (status === "playing") {
      setStatus("lost");
      onLose();
    }
  }, [status, onLose]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-zinc-100 p-4">
      <div className="mb-8 flex justify-between items-center w-full max-w-[800px]">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
        >
          ← Back
        </button>
        <div className="text-xl font-light tracking-tight">{level.name}</div>
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      <div
        ref={containerRef}
        className={clsx(
          "relative bg-zinc-800/30 rounded-xl overflow-hidden shadow-2xl transition-colors duration-500 cursor-none",
          status === "lost" && "bg-rose-900/10",
          status === "won" && "bg-emerald-900/10",
        )}
        style={{ width: level.size.width, height: level.size.height }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Start Zone */}
        <div
          className={clsx(
            "absolute rounded-full bg-zinc-700/50 border border-zinc-600 flex items-center justify-center transition-all duration-300",
            status === "idle" &&
              "z-20 bg-zinc-700 border-zinc-500 shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-110",
          )}
          style={{
            left: level.start.x - level.start.radius,
            top: level.start.y - level.start.radius,
            width: level.start.radius * 2,
            height: level.start.radius * 2,
          }}
        >
          <span className="text-[10px] text-zinc-400 font-medium tracking-wider">START</span>
        </div>

        {/* End Zone */}
        <div
          className="absolute bg-zinc-700/50 border border-zinc-600 flex items-center justify-center"
          style={{
            left: level.end.x,
            top: level.end.y,
            width: level.end.width,
            height: level.end.height,
          }}
        >
          <span className="text-[10px] text-zinc-400 font-medium tracking-wider">GOAL</span>
        </div>

        {/* Walls */}
        {level.walls.map((wall, i) => (
          <div
            key={i}
            className="absolute bg-zinc-200 shadow-sm"
            style={{
              left: wall.x,
              top: wall.y,
              width: wall.width,
              height: wall.height,
            }}
          />
        ))}

        {/* Cursor (Custom) */}
        <div
          className="absolute w-4 h-4 bg-indigo-500 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 border-2 border-white z-[100] shadow-lg"
          style={{
            left: mousePos.x,
            top: mousePos.y,
            opacity: 1,
          }}
        />

        {/* Status Overlays */}
        {status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-zinc-900/40 backdrop-blur-sm z-10">
            <div className="bg-white/90 text-zinc-900 px-6 py-3 rounded-full shadow-xl border border-zinc-200/50">
              <p className="font-medium text-sm">Move to Start</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
