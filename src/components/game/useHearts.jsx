import { useState, useEffect, useCallback, useRef } from 'react';

export const MAX_LIVES = 5;
const STORAGE_KEY = 'cq_hearts_v2';

// Recovery time in ms depending on how many hearts are missing
function recoveryMs(missing) {
  if (missing >= 5) return 1 * 60 * 1000;   // 1 min
  if (missing >= 4) return 2 * 60 * 1000;   // 2 min
  if (missing >= 3) return 3 * 60 * 1000;   // 3 min
  if (missing >= 2) return 4 * 60 * 1000;   // 4 min
  return 5 * 60 * 1000;                       // 5 min
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { lives: MAX_LIVES, nextRecoveryAt: null };
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function useHearts(onGainHeart) {
  const [state, setState] = useState(loadState);
  const onGainRef = useRef(onGainHeart);
  onGainRef.current = onGainHeart;

  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        if (prev.lives >= MAX_LIVES || !prev.nextRecoveryAt) return prev;
        if (Date.now() >= prev.nextRecoveryAt) {
          const newLives = Math.min(prev.lives + 1, MAX_LIVES);
          const missing = MAX_LIVES - newLives;
          const next = newLives < MAX_LIVES ? Date.now() + recoveryMs(missing) : null;
          const newState = { lives: newLives, nextRecoveryAt: next };
          saveState(newState);
          onGainRef.current?.();
          return newState;
        }
        return prev;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loseHeart = useCallback(() => {
    setState(prev => {
      const newLives = Math.max(0, prev.lives - 1);
      const missing = MAX_LIVES - newLives;
      const nextRecoveryAt = prev.nextRecoveryAt ?? (newLives < MAX_LIVES ? Date.now() + recoveryMs(missing) : null);
      const newState = { lives: newLives, nextRecoveryAt };
      saveState(newState);
      return newState;
    });
  }, []);

  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const timeToNext = state.lives < MAX_LIVES && state.nextRecoveryAt
    ? Math.max(0, state.nextRecoveryAt - Date.now())
    : null;

  return { lives: state.lives, loseHeart, timeToNext, MAX_LIVES };
}