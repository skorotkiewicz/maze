import type { Level } from '../types';
import level1 from '../levels/level1.json';
import level2 from '../levels/level2.json';
import level3 from '../levels/level3.json';
import level4 from '../levels/level4.json';

const LEVELS: Level[] = [level1, level2, level3, level4];

interface LevelSelectorProps {
  onSelectLevel: (level: Level) => void;
}

export function LevelSelector({ onSelectLevel }: LevelSelectorProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-zinc-900">
      <div className="max-w-4xl w-full">
        <header className="mb-16 text-center">
          <h1 className="text-5xl font-light tracking-tight text-white mb-4">
            Maze
          </h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest font-medium">
            Select a Challenge
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {LEVELS.map((level, index) => (
            <button
              key={level.id}
              onClick={() => onSelectLevel(level)}
              className="group relative bg-zinc-800/50 border border-zinc-700/50 p-10 rounded-2xl hover:bg-zinc-800 hover:border-zinc-600 hover:-translate-y-1 hover:shadow-2xl transition-all text-left"
            >
              <div className="flex justify-between items-start mb-8">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Level {index + 1}
                </span>
                <div className="w-2 h-2 rounded-full bg-zinc-700 group-hover:bg-indigo-500 transition-colors" />
              </div>
              
              <h3 className="text-3xl font-light text-white mb-2 group-hover:text-indigo-400 transition-colors">
                {level.name}
              </h3>
              
              <div className="text-zinc-500 text-sm">
                {level.size.width} &times; {level.size.height}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
