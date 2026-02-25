import React from 'react';
import { LetterStatus } from '../utils';
import { Delete } from 'lucide-react';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  keyStatuses: Record<string, LetterStatus[]>; // Array of statuses for each board
  numBoards: number;
}

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'backspace'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'enter']
];

const STATUS_COLORS = {
  correct: '#3aa394',
  present: '#d3ad69',
  absent: '#1a1516',
  empty: '#4c4347'
};

export function Keyboard({ onKeyPress, keyStatuses, numBoards }: KeyboardProps) {
  const getKeyBackground = (key: string) => {
    const statuses = keyStatuses[key] || Array(numBoards).fill('empty');
    
    if (numBoards === 1) {
      return STATUS_COLORS[statuses[0]];
    }
    
    if (numBoards === 2) {
      const c1 = STATUS_COLORS[statuses[0]];
      const c2 = STATUS_COLORS[statuses[1]];
      return `linear-gradient(to right, ${c1} 50%, ${c2} 50%)`;
    }
    
    if (numBoards === 4) {
      const c1 = STATUS_COLORS[statuses[0]]; // TL
      const c2 = STATUS_COLORS[statuses[1]]; // TR
      const c3 = STATUS_COLORS[statuses[2]]; // BL
      const c4 = STATUS_COLORS[statuses[3]]; // BR
      
      return `conic-gradient(
        ${c2} 0deg 90deg,
        ${c4} 90deg 180deg,
        ${c3} 180deg 270deg,
        ${c1} 270deg 360deg
      )`;
    }
    
    return STATUS_COLORS.empty;
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto p-2">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1 sm:gap-2 w-full">
          {i === 1 && <div style={{ flex: 0.5 }}></div>}
          {i === 2 && <div style={{ flex: 1 }}></div>}
          {row.map((key) => {
            const isSpecial = key === 'enter' || key === 'backspace';
            const statuses = keyStatuses[key] || Array(numBoards).fill('empty');
            const isFullyAbsent = statuses.every(s => s === 'absent');
            
            let flexValue = 1;
            if (key === 'backspace') flexValue = 1.5;
            if (key === 'enter') flexValue = 3;

            return (
              <button
                key={key}
                translate="no"
                onClick={() => onKeyPress(key)}
                className={`
                  flex items-center justify-center rounded font-bold text-xs sm:text-base uppercase
                  transition-transform active:scale-95 select-none py-3 sm:py-4
                  ${isSpecial ? 'bg-[#4c4347] text-[#fafafa]' : ''}
                `}
                style={{
                  flex: flexValue,
                  ...(!isSpecial ? { 
                    background: getKeyBackground(key),
                    color: isFullyAbsent ? '#6e5c62' : '#fafafa'
                  } : {})
                }}
              >
                {key === 'backspace' ? <Delete size={20} /> : key === 'enter' ? 'ENTER' : key}
              </button>
            );
          })}
          {i === 0 && <div style={{ flex: 1 }}></div>}
        </div>
      ))}
    </div>
  );
}
