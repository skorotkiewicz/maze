import { clsx } from "clsx";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Level, Point } from "../types";
import { isPointInCircle, isPointInRect, lineIntersectsRect } from "../utils/collision";
import { calculatePathLength, findOptimalPath } from "../utils/pathfinding";

interface MazeGameProps {
  level: Level;
  onWin: (stats?: { score: number; userLength: number; optimalLength: number }) => void;
  onLose: () => void;
  onBack: () => void;
}

type GameStatus = "idle" | "playing" | "won" | "lost";

export function MazeGame({ level, onWin, onLose, onBack }: MazeGameProps) {
  const [status, setStatus] = useState<GameStatus>("idle");
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [userPath, setUserPath] = useState<Point[]>([]);
  const [optimalPath, setOptimalPath] = useState<Point[]>([]);

  const lastPos = useRef<Point | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<Point[]>([]); // Ref for mutable path access in loop

  // Reset state when level changes
  useEffect(() => {
    setStatus("idle");
    lastPos.current = null;
    setUserPath([]);
    setOptimalPath([]);
    pathRef.current = [];
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
        // Track path
        pathRef.current.push(currentPos);
        // Throttle state updates for path to avoid lag, or just update on win?
        // Updating every frame might be heavy for React state, but we need it for drawing if we want live drawing.
        // For now, let's just keep it in ref and set state on finish.

        // Check for wall collisions
        const prev = lastPos.current || currentPos;
        const CURSOR_RADIUS = 6;

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
          setUserPath(pathRef.current);
          onLose();
          return;
        }

        // Check win
        if (isPointInRect(currentPos, level.end)) {
          setStatus("won");
          const finalUserPath = pathRef.current;
          setUserPath(finalUserPath);

          // Calculate optimal path
          const optimal = findOptimalPath(level);
          setOptimalPath(optimal);

          // Calculate score
          const userLen = calculatePathLength(finalUserPath);
          const optLen = calculatePathLength(optimal);
          // Score is percentage of optimality.
          // If user is perfect, score is 100%.
          // If user is 2x longer, score is 50%.
          const score = Math.min(100, Math.round((optLen / userLen) * 100));

          onWin({ score, userLength: Math.round(userLen), optimalLength: Math.round(optLen) });
          return;
        }

        // Check bounds
        if (x < 0 || x > level.size.width || y < 0 || y > level.size.height) {
          setStatus("lost");
          setUserPath(pathRef.current);
          onLose();
          return;
        }
      } else if (status === "idle") {
        if (isPointInCircle(currentPos, level.start, level.start.radius)) {
          setStatus("playing");
          pathRef.current = [currentPos];
        }
      }

      lastPos.current = currentPos;
    },
    [status, level, onWin, onLose],
  );

  const handleMouseLeave = useCallback(() => {
    if (status === "playing") {
      setStatus("lost");
      setUserPath(pathRef.current);
      onLose();
    }
  }, [status, onLose]);

  // Helper to render SVG path
  const pointsToSvgPath = (points: Point[]) => {
    if (points.length === 0) return "";
    return (
      `M ${points[0].x} ${points[0].y} ` +
      points
        .slice(1)
        .map((p) => `L ${p.x} ${p.y}`)
        .join(" ")
    );
  };

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

        {/* Paths Visualization */}
        <svg className="absolute inset-0 pointer-events-none z-10" width="100%" height="100%">
          <title>Path Visualization</title>
          {/* Optimal Path */}
          {status === "won" && optimalPath.length > 0 && (
            <path
              d={pointsToSvgPath(optimalPath)}
              fill="none"
              stroke="#10b981" // Emerald-500
              strokeWidth="2"
              strokeDasharray="4 4"
              className="opacity-50"
            />
          )}
          {/* User Path */}
          {(status === "won" || status === "lost") && userPath.length > 0 && (
            <path
              d={pointsToSvgPath(userPath)}
              fill="none"
              stroke={status === "won" ? "#6366f1" : "#f43f5e"} // Indigo-500 or Rose-500
              strokeWidth="2"
              className="opacity-80"
            />
          )}
        </svg>

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
