import { useState } from 'react';
import { LevelSelector } from './components/LevelSelector';
import { MazeGame } from './components/MazeGame';
import type { Level } from './types';

function App() {
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won' | 'lost'>('menu');

  const [retryCount, setRetryCount] = useState(0);

  const handleLevelSelect = (level: Level) => {
    setCurrentLevel(level);
    setGameState('playing');
    setRetryCount(0);
  };

  const handleWin = () => {
    setGameState('won');
  };

  const handleLose = () => {
    setGameState('lost');
  };

  const handleBack = () => {
    setGameState('menu');
    setCurrentLevel(null);
  };

  const handleRetry = () => {
    setGameState('playing');
    setRetryCount(c => c + 1);
  };

  if (!currentLevel || gameState === 'menu') {
    return <LevelSelector onSelectLevel={handleLevelSelect} />;
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
      {(gameState === 'won' || gameState === 'lost') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm animate-in fade-in duration-300 cursor-default">
          <div className="bg-white text-zinc-900 p-12 rounded-2xl max-w-md w-full text-center shadow-2xl transform scale-100">
            <h2 className="text-3xl font-light mb-4 tracking-tight">
              {gameState === 'won' ? 'Level Complete' : 'Game Over'}
            </h2>
            <p className="text-zinc-500 mb-10">
              {gameState === 'won' 
                ? "Precision achieved." 
                : "Concentration broken."}
            </p>
            
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleBack}
                className="px-8 py-3 rounded-full border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors"
              >
                Menu
              </button>
              <button 
                onClick={handleRetry}
                className={clsx(
                  "px-8 py-3 rounded-full font-medium text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5",
                  gameState === 'won' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-zinc-900 hover:bg-zinc-800"
                )}
              >
                {gameState === 'won' ? 'Replay' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper for conditional classes in the overlay
import { clsx } from 'clsx';

export default App;
