export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export function getGuessStatuses(guess: string, target: string): LetterStatus[] {
  const statuses: LetterStatus[] = Array(5).fill('absent');
  const targetChars = target.split('');
  const guessChars = guess.split('');

  // First pass: correct
  for (let i = 0; i < 5; i++) {
    if (guessChars[i] === targetChars[i]) {
      statuses[i] = 'correct';
      targetChars[i] = null as any;
      guessChars[i] = null as any;
    }
  }

  // Second pass: present
  for (let i = 0; i < 5; i++) {
    if (guessChars[i] && targetChars.includes(guessChars[i])) {
      if (statuses[i] !== 'correct') {
        statuses[i] = 'present';
        targetChars[targetChars.indexOf(guessChars[i])] = null as any;
      }
    }
  }

  return statuses;
}

export function getKeyboardStatuses(guesses: string[], target: string): Record<string, LetterStatus> {
  const statuses: Record<string, LetterStatus> = {};
  
  for (const guess of guesses) {
    const guessStatuses = getGuessStatuses(guess, target);
    for (let i = 0; i < 5; i++) {
      const char = guess[i];
      const status = guessStatuses[i];
      const current = statuses[char];
      
      if (current === 'correct') continue;
      if (current === 'present' && status === 'absent') continue;
      
      statuses[char] = status;
    }
  }
  
  return statuses;
}
