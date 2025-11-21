import { clsx } from "clsx";
import {
  ArrowLeft,
  Circle,
  Download,
  Eraser,
  MousePointer2,
  Play,
  Square,
  Upload,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import type { Level, Point, Rect } from "../types";

interface LevelCreatorProps {
  onBack: () => void;
  onPlay: (level: Level) => void;
}

type Tool = "wall" | "start" | "end" | "eraser";

export function LevelCreator({ onBack, onPlay }: LevelCreatorProps) {
  const [level, setLevel] = useState<Level>({
    id: `custom-${Date.now()}`,
    name: "My Custom Maze",
    size: { width: 800, height: 600 },
    start: { x: 50, y: 50, radius: 20 },
    end: { x: 750, y: 550, width: 30, height: 30 },
    walls: [],
  });

  const [tool, setTool] = useState<Tool>("wall");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [currentWall, setCurrentWall] = useState<Rect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getMousePos = (e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);

    if (tool === "wall") {
      setIsDragging(true);
      setDragStart(pos);
      setCurrentWall({ x: pos.x, y: pos.y, width: 0, height: 0 });
    } else if (tool === "start") {
      setLevel((prev) => ({ ...prev, start: { ...prev.start, x: pos.x, y: pos.y } }));
    } else if (tool === "end") {
      setLevel((prev) => ({
        ...prev,
        end: { ...prev.end, x: pos.x - prev.end.width / 2, y: pos.y - prev.end.height / 2 },
      }));
    } else if (tool === "eraser") {
      // Simple hit detection for walls
      setLevel((prev) => ({
        ...prev,
        walls: prev.walls.filter((w) => !isPointInRect(pos, w)),
      }));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;

    const pos = getMousePos(e);
    const width = pos.x - dragStart.x;
    const height = pos.y - dragStart.y;

    setCurrentWall({
      x: width > 0 ? dragStart.x : pos.x,
      y: height > 0 ? dragStart.y : pos.y,
      width: Math.abs(width),
      height: Math.abs(height),
    });
  };

  const handleMouseUp = () => {
    if (isDragging && currentWall && currentWall.width > 5 && currentWall.height > 5) {
      setLevel((prev) => ({
        ...prev,
        walls: [...prev.walls, currentWall],
      }));
    }
    setIsDragging(false);
    setDragStart(null);
    setCurrentWall(null);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(level));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `${level.name.replace(/\s+/g, "-").toLowerCase()}.json`,
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation could go here
        setLevel({ ...json, id: `imported-${Date.now()}` });
      } catch (_err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-8 flex gap-8">
      {/* Sidebar */}
      <div className="w-64 flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={onBack}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-light">Editor</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
              Level Name
            </label>
            <input
              type="text"
              value={level.name}
              onChange={(e) => setLevel((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 mt-1 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                Width
              </label>
              <input
                type="text"
                value={level.size.width}
                onChange={(e) =>
                  setLevel((prev) => ({
                    ...prev,
                    size: { ...prev.size, width: Math.max(100, Number(e.target.value)) },
                  }))
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 mt-1 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                Height
              </label>
              <input
                type="text"
                value={level.size.height}
                onChange={(e) =>
                  setLevel((prev) => ({
                    ...prev,
                    size: { ...prev.size, height: Math.max(100, Number(e.target.value)) },
                  }))
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 mt-1 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2 block">
              Tools
            </label>
            <div className="grid grid-cols-2 gap-2">
              <ToolButton
                active={tool === "wall"}
                onClick={() => setTool("wall")}
                icon={<Square size={18} />}
                label="Wall"
              />
              <ToolButton
                active={tool === "eraser"}
                onClick={() => setTool("eraser")}
                icon={<Eraser size={18} />}
                label="Erase"
              />
              <ToolButton
                active={tool === "start"}
                onClick={() => setTool("start")}
                icon={<Circle size={18} />}
                label="Start"
              />
              <ToolButton
                active={tool === "end"}
                onClick={() => setTool("end")}
                icon={<MousePointer2 size={18} />}
                label="Goal"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 space-y-2">
            <button
              type="button"
              onClick={() => onPlay(level)}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded transition-colors"
            >
              <Play size={18} /> Test Play
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded transition-colors"
            >
              <Download size={18} /> Export JSON
            </button>
            <label className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2 rounded transition-colors cursor-pointer">
              <Upload size={18} /> Import JSON
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center bg-zinc-950/50 rounded-xl border border-zinc-800 overflow-hidden relative">
        <div
          ref={containerRef}
          className="relative bg-zinc-900 shadow-2xl cursor-crosshair"
          style={{ width: level.size.width, height: level.size.height }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid Background (Optional visual aid) */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Start */}
          <div
            className="absolute rounded-full bg-zinc-700/50 border border-zinc-500 flex items-center justify-center"
            style={{
              left: level.start.x - level.start.radius,
              top: level.start.y - level.start.radius,
              width: level.start.radius * 2,
              height: level.start.radius * 2,
            }}
          >
            <span className="text-[10px] text-zinc-400 font-medium">S</span>
          </div>

          {/* End */}
          <div
            className="absolute bg-zinc-700/50 border border-zinc-500 flex items-center justify-center"
            style={{
              left: level.end.x,
              top: level.end.y,
              width: level.end.width,
              height: level.end.height,
            }}
          >
            <span className="text-[10px] text-zinc-400 font-medium">G</span>
          </div>

          {/* Walls */}
          {level.walls.map((wall, i) => (
            <div
              key={i}
              className="absolute bg-zinc-200 shadow-sm hover:bg-rose-500/50 transition-colors"
              style={{
                left: wall.x,
                top: wall.y,
                width: wall.width,
                height: wall.height,
              }}
            />
          ))}

          {/* Current Dragging Wall */}
          {currentWall && (
            <div
              className="absolute bg-zinc-200/50 border border-zinc-200 border-dashed"
              style={{
                left: currentWall.x,
                top: currentWall.y,
                width: currentWall.width,
                height: currentWall.height,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex flex-col items-center justify-center p-3 rounded transition-all",
        active
          ? "bg-indigo-600 text-white shadow-lg"
          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200",
      )}
    >
      {icon}
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );
}

// Helper
function isPointInRect(p: Point, r: Rect) {
  return p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;
}
