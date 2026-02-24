import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WORDS } from './words';
import { VALID_WORDS, ACCENTED_WORDS } from './validWords';
import { getKeyboardStatuses, LetterStatus } from './utils';
import { Board } from './components/Board';
import { Keyboard } from './components/Keyboard';
import { RefreshCw, ChevronDown } from 'lucide-react';

type GameMode = 'termo' | 'dueto' | 'quarteto';

export default function App() {
  const [mode, setMode] = useState<GameMode>('termo');
  const [targets, setTargets] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>(Array(5).fill(''));
  const [activeCellIndex, setActiveCellIndex] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [toast, setToast] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const numBoards = mode === 'termo' ? 1 : mode === 'dueto' ? 2 : 4;
  const maxGuesses = mode === 'termo' ? 6 : mode === 'dueto' ? 7 : 9;

  const initGame = useCallback((newMode: GameMode) => {
    const newNumBoards = newMode === 'termo' ? 1 : newMode === 'dueto' ? 2 : 4;
    const newTargets: string[] = [];
    const availableWords = [...WORDS];
    
    for (let i = 0; i < newNumBoards; i++) {
      const idx = Math.floor(Math.random() * availableWords.length);
      newTargets.push(availableWords[idx]);
      availableWords.splice(idx, 1);
    }
    
    setMode(newMode);
    setTargets(newTargets);
    setGuesses([]);
    setCurrentGuess(Array(5).fill(''));
    setActiveCellIndex(0);
    setGameStatus('playing');
    setToast(null);
  }, []);

  useEffect(() => {
    initGame('termo');
  }, [initGame]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const onKeyPress = useCallback((key: string) => {
    if (gameStatus !== 'playing') return;

    if (key === 'enter') {
      const guessWord = currentGuess.join('');
      if (guessWord.length !== 5) {
        showToast('Palavra muito curta');
        return;
      }
      if (!VALID_WORDS.has(guessWord)) {
        showToast('Palavra não reconhecida');
        return;
      }

      const newGuesses = [...guesses, guessWord];
      setGuesses(newGuesses);
      setCurrentGuess(Array(5).fill(''));
      setActiveCellIndex(0);

      const boardStatuses = targets.map(target => {
        if (newGuesses.includes(target)) return 'won';
        if (newGuesses.length >= maxGuesses) return 'lost';
        return 'playing';
      });

      if (boardStatuses.every(s => s === 'won')) {
        setGameStatus('won');
        showToast('Parabéns!');
      } else if (newGuesses.length >= maxGuesses) {
        setGameStatus('lost');
      }
    } else if (key === 'backspace') {
      setCurrentGuess(prev => {
        const newGuess = [...prev];
        if (newGuess[activeCellIndex] !== '') {
          newGuess[activeCellIndex] = '';
        } else if (activeCellIndex > 0) {
          newGuess[activeCellIndex - 1] = '';
          setActiveCellIndex(activeCellIndex - 1);
        }
        return newGuess;
      });
    } else if (/^[a-z]$/.test(key)) {
      setCurrentGuess(prev => {
        const newGuess = [...prev];
        newGuess[activeCellIndex] = key;
        return newGuess;
      });
      if (activeCellIndex < 4) {
        setActiveCellIndex(activeCellIndex + 1);
      }
    } else if (key === 'ArrowLeft') {
      if (activeCellIndex > 0) setActiveCellIndex(activeCellIndex - 1);
    } else if (key === 'ArrowRight') {
      if (activeCellIndex < 4) setActiveCellIndex(activeCellIndex + 1);
    }
  }, [currentGuess, activeCellIndex, gameStatus, guesses, maxGuesses, targets]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === 'Enter' || key === 'Backspace' || key === 'ArrowLeft' || key === 'ArrowRight' || /^[a-z]$/.test(key)) {
        onKeyPress(key.toLowerCase() === 'enter' ? 'enter' : key.toLowerCase() === 'backspace' ? 'backspace' : key);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);

  // Calculate keyboard statuses for each board
  const keyStatuses: Record<string, LetterStatus[]> = {};
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  
  alphabet.forEach(letter => {
    keyStatuses[letter] = targets.map(target => {
      const boardWinIndex = guesses.indexOf(target);
      const isWon = boardWinIndex !== -1;
      const boardGuesses = isWon ? guesses.slice(0, boardWinIndex + 1) : guesses;
      
      const statuses = getKeyboardStatuses(boardGuesses, target);
      return statuses[letter] || 'empty';
    });
  });

  if (targets.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#110d0e] text-[#fafafa]">
      <header className="w-full max-w-4xl flex items-center justify-between p-4 border-b border-[#312a2c] relative">
        <div className="flex items-center gap-2 relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-bold uppercase bg-[#312a2c] text-[#fafafa] hover:bg-[#4c4347] transition-colors"
          >
            {mode} <ChevronDown size={16} />
          </button>
          
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-2 bg-[#312a2c] rounded shadow-lg flex flex-col overflow-hidden z-50 min-w-[120px]">
              {(['termo', 'dueto', 'quarteto'] as GameMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => {
                    initGame(m);
                    setIsMenuOpen(false);
                  }}
                  className={`px-4 py-3 text-sm font-bold uppercase text-left transition-colors
                    ${mode === m ? 'bg-[#3aa394] text-white' : 'text-gray-400 hover:bg-[#4c4347] hover:text-white'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold tracking-widest uppercase absolute left-1/2 -translate-x-1/2">
          TERMO
        </h1>
        
        <button
          onClick={() => initGame(mode)}
          className="p-2 rounded-full hover:bg-[#312a2c] transition-colors"
          title="Recomeçar"
        >
          <RefreshCw size={20} />
        </button>
      </header>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#fafafa] text-[#110d0e] px-4 py-2 rounded font-bold shadow-lg">
          {toast}
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#fafafa] text-[#110d0e] px-4 py-2 rounded font-bold shadow-lg flex gap-4">
          {targets.map((t, i) => (
            <span key={i} className="uppercase tracking-widest">
              {ACCENTED_WORDS[t] || t}
            </span>
          ))}
        </div>
      )}

      <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center p-4 gap-8">
        <div className={`grid gap-4 sm:gap-8 ${
          mode === 'termo' ? 'grid-cols-1' : 
          mode === 'dueto' ? 'grid-cols-1 sm:grid-cols-2' : 
          'grid-cols-2'
        }`}>
          {targets.map((target, i) => {
            const winIndex = guesses.indexOf(target);
            const isWon = winIndex !== -1;
            const boardGuesses = isWon ? guesses.slice(0, winIndex + 1) : guesses;
            const isActive = !isWon && gameStatus === 'playing';

            return (
              <Board
                key={i}
                target={target}
                guesses={boardGuesses}
                currentGuess={isActive ? currentGuess : Array(5).fill('')}
                activeCellIndex={isActive ? activeCellIndex : -1}
                onCellClick={(index) => isActive && setActiveCellIndex(index)}
                maxGuesses={maxGuesses}
                isWon={isWon}
                isActive={isActive}
              />
            );
          })}
        </div>
      </main>

      <div className="w-full pb-8">
        <Keyboard 
          onKeyPress={onKeyPress} 
          keyStatuses={keyStatuses} 
          numBoards={numBoards} 
        />
      </div>
    </div>
  );
}
