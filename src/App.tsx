import { useState } from "react";
import { LevelCreator } from "./components/LevelCreator";
import { LevelSelector } from "./components/LevelSelector";
import { MazeGame } from "./components/MazeGame";
import type { Level } from "./types";

function App() {
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [gameState, setGameState] = useState<"menu" | "playing" | "won" | "lost" | "editor">(
    "menu",
  );
  const [retryCount, setRetryCount] = useState(0);
  const [isTestPlay, setIsTestPlay] = useState(false);
  const [gameStats, setGameStats] = useState<{
    score: number;
    userLength: number;
    optimalLength: number;
  } | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleLevelSelect = (level: Level) => {
    setCurrentLevel(level);
    setGameState("playing");
    setRetryCount(0);
    setIsTestPlay(false);
    setGameStats(null);
    setShowOverlay(false);
  };

  const handleCreateLevel = () => {
    setGameState("editor");
    setCurrentLevel(null);
    setIsTestPlay(false);
    setGameStats(null);
    setShowOverlay(false);
  };

  const handleWin = (stats?: { score: number; userLength: number; optimalLength: number }) => {
    setGameState("won");
    if (stats) setGameStats(stats);
    setShowOverlay(true);
  };

  const handleLose = () => {
    setGameState("lost");
    setGameStats(null);
    setShowOverlay(true);
  };

  const handleBack = () => {
    if (isTestPlay) {
      setGameState("editor");
      // Keep currentLevel to pass back to editor
    } else {
      setGameState("menu");
      setCurrentLevel(null);
    }
    setGameStats(null);
    setShowOverlay(false);
  };

  const handleEditorBack = () => {
    setGameState("menu");
    setCurrentLevel(null);
    setGameStats(null);
    setShowOverlay(false);
  };

  const handleTestPlay = (level: Level) => {
    setCurrentLevel(level);
    setGameState("playing");
    setRetryCount(0);
    setIsTestPlay(true);
    setGameStats(null);
    setShowOverlay(false);
  };

  const handleRetry = () => {
    setGameState("playing");
    setRetryCount((c) => c + 1);
    setGameStats(null);
    setShowOverlay(false);
  };

  if (gameState === "editor") {
    return (
      <LevelCreator onBack={handleEditorBack} onPlay={handleTestPlay} initialLevel={currentLevel} />
    );
  }

  if (!currentLevel || gameState === "menu") {
    return (
      <LevelSelector
        onSelectLevel={handleLevelSelect}
        onCreateLevel={handleCreateLevel}
        onImportLevel={handleLevelSelect}
      />
    );
  }

  return (
    <>
      <MazeGame
        key={`${currentLevel.id}-${retryCount}`}
        level={currentLevel}
        onWin={handleWin}
        onLose={handleLose}
        onBack={handleBack}
      />

      {/* Overlay for Game Over / Win */}
      {(gameState === "won" || gameState === "lost") && showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm animate-in fade-in duration-300 cursor-default">
          <div className="bg-white text-zinc-900 p-12 rounded-2xl max-w-md w-full text-center shadow-2xl transform scale-100">
            <h2 className="text-3xl font-light mb-4 tracking-tight">
              {gameState === "won" ? "Level Complete" : "Game Over"}
            </h2>
            <p className="text-zinc-500 mb-6">
              {gameState === "won" ? "Precision achieved." : "Concentration broken."}
            </p>

            {gameState === "won" && gameStats && (
              <div className="mb-8 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="text-sm text-zinc-400 uppercase tracking-wider font-medium mb-1">
                  Efficiency
                </div>
                <div className="text-4xl font-light text-indigo-600">{gameStats.score}%</div>
                <div className="text-xs text-zinc-400 mt-2">
                  Path: {gameStats.userLength}px / Optimal: {gameStats.optimalLength}px
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => setShowOverlay(false)}
                className="px-6 py-2 rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors text-sm font-medium"
              >
                View Path
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className="px-6 py-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors text-sm font-medium"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors text-sm font-medium"
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
