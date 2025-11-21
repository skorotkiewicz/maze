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

  const handleLevelSelect = (level: Level) => {
    setCurrentLevel(level);
    setGameState("playing");
    setRetryCount(0);
    setIsTestPlay(false);
  };

  const handleCreateLevel = () => {
    setGameState("editor");
    setCurrentLevel(null);
    setIsTestPlay(false);
  };

  const handleWin = () => {
    setGameState("won");
  };

  const handleLose = () => {
    setGameState("lost");
  };

  const handleBack = () => {
    if (isTestPlay) {
      setGameState("editor");
      // Keep currentLevel to pass back to editor
    } else {
      setGameState("menu");
      setCurrentLevel(null);
    }
  };

  const handleEditorBack = () => {
    setGameState("menu");
    setCurrentLevel(null);
  };

  const handleTestPlay = (level: Level) => {
    setCurrentLevel(level);
    setGameState("playing");
    setRetryCount(0);
    setIsTestPlay(true);
  };

  const handleRetry = () => {
    setGameState("playing");
    setRetryCount((c) => c + 1);
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
      {(gameState === "won" || gameState === "lost") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm animate-in fade-in duration-300 cursor-default">
          <div className="bg-white text-zinc-900 p-12 rounded-2xl max-w-md w-full text-center shadow-2xl transform scale-100">
            <h2 className="text-3xl font-light mb-4 tracking-tight">
              {gameState === "won" ? "Level Complete" : "Game Over"}
            </h2>
            <p className="text-zinc-500 mb-10">
              {gameState === "won" ? "Precision achieved." : "Concentration broken."}
            </p>

            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={handleBack}
                className="px-8 py-3 rounded-full border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors"
              >
                {isTestPlay ? "Back to Editor" : "Menu"}
              </button>
              <button
                type="button"
                onClick={handleRetry}
                className={clsx(
                  "px-8 py-3 rounded-full font-medium text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5",
                  gameState === "won"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-zinc-900 hover:bg-zinc-800",
                )}
              >
                {gameState === "won" ? "Replay" : "Try Again"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper for conditional classes in the overlay
import { clsx } from "clsx";

export default App;
