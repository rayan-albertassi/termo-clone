import React from 'react';
import { getGuessStatuses } from '../utils';
import { motion } from 'motion/react';
import { ACCENTED_WORDS } from '../validWords';

interface BoardProps {
  key?: React.Key;
  target: string;
  guesses: string[];
  currentGuess: string[];
  activeCellIndex: number;
  onCellClick: (index: number) => void;
  maxGuesses: number;
  isWon: boolean;
  isActive: boolean;
}

export function Board({ target, guesses, currentGuess, activeCellIndex, onCellClick, maxGuesses, isWon, isActive }: BoardProps) {
  const emptyRowsCount = maxGuesses - guesses.length - (isWon || !isActive ? 0 : 1);
  const emptyRows = Array.from({ length: Math.max(0, emptyRowsCount) });

  return (
    <div translate="no" className="flex flex-col gap-1 p-1 bg-[#110d0e] rounded-lg w-full mx-auto">
      {guesses.map((guess, i) => (
        <CompletedRow key={i} guess={guess} target={target} />
      ))}
      
      {!isWon && isActive && guesses.length < maxGuesses && (
        <CurrentRow guess={currentGuess} activeCellIndex={activeCellIndex} onCellClick={onCellClick} />
      )}
      
      {emptyRows.map((_, i) => (
        <EmptyRow key={`empty-${i}`} />
      ))}
    </div>
  );
}

function CompletedRow({ guess, target }: { guess: string; target: string; key?: React.Key }) {
  const statuses = getGuessStatuses(guess, target);
  const displayGuess = ACCENTED_WORDS[guess] || guess;
  
  return (
    <div className="grid grid-cols-5 gap-1">
      {displayGuess.split('').map((letter, i) => (
        <motion.div
          key={i}
          initial={{ rotateX: 90 }}
          animate={{ rotateX: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className={`aspect-square flex items-center justify-center text-base sm:text-2xl font-bold uppercase rounded text-[#fafafa]
            ${statuses[i] === 'correct' ? 'bg-[#3aa394]' : 
              statuses[i] === 'present' ? 'bg-[#d3ad69]' : 'bg-[#312a2c]'}`}
        >
          {letter}
        </motion.div>
      ))}
    </div>
  );
}

function CurrentRow({ guess, activeCellIndex, onCellClick }: { guess: string[]; activeCellIndex: number; onCellClick: (index: number) => void; key?: React.Key }) {
  return (
    <div className="grid grid-cols-5 gap-1">
      {guess.map((letter, i) => (
        <div 
          key={i} 
          onClick={() => onCellClick(i)}
          className={`aspect-square flex items-center justify-center text-base sm:text-2xl font-bold uppercase rounded cursor-pointer transition-colors
            ${letter ? 'bg-[#4c4347] border-2 border-[#6e5c62] text-[#fafafa]' : 'bg-[#312a2c]'}
            ${i === activeCellIndex ? 'border-b-4 border-b-[#fafafa]' : ''}
          `}
        >
          {letter}
        </div>
      ))}
    </div>
  );
}

function EmptyRow() {
  return (
    <div className="grid grid-cols-5 gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="aspect-square rounded bg-[#312a2c]"></div>
      ))}
    </div>
  );
}
