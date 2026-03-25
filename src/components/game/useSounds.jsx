// Sound effects using Web Audio API - no external files needed
let ctx = null;

function getCtx() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function playTone(frequency, duration, type = 'sine', gain = 0.3, delay = 0) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g);
  g.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, c.currentTime + delay);
  g.gain.setValueAtTime(gain, c.currentTime + delay);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
  osc.start(c.currentTime + delay);
  osc.stop(c.currentTime + delay + duration + 0.05);
}

export const soundEffects = {
  correct: () => {
    playTone(523, 0.1, 'sine', 0.3);
    playTone(659, 0.1, 'sine', 0.3, 0.1);
    playTone(784, 0.2, 'sine', 0.3, 0.2);
  },
  wrong: () => {
    playTone(300, 0.15, 'sawtooth', 0.2);
    playTone(220, 0.3, 'sawtooth', 0.2, 0.15);
  },
  complete: () => {
    [523, 587, 659, 698, 784, 880].forEach((f, i) => playTone(f, 0.12, 'sine', 0.25, i * 0.07));
  },
  unitComplete: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => playTone(f, 0.18, 'triangle', 0.3, i * 0.09));
    setTimeout(() => [784, 1047].forEach((f, i) => playTone(f, 0.3, 'sine', 0.2, i * 0.1)), 700);
  },
  loseHeart: () => {
    playTone(400, 0.08, 'sawtooth', 0.3);
    playTone(300, 0.15, 'sawtooth', 0.3, 0.08);
    playTone(200, 0.25, 'sawtooth', 0.3, 0.2);
  },
  gainHeart: () => {
    playTone(784, 0.1, 'sine', 0.2);
    playTone(1047, 0.15, 'sine', 0.2, 0.1);
  },
  click: () => {
    playTone(800, 0.05, 'sine', 0.12);
  },
  streak: () => {
    [659, 784, 1047].forEach((f, i) => playTone(f, 0.1, 'sine', 0.2, i * 0.08));
  }
};

import { useState } from 'react';

export function useSounds() {
  const [muted, setMuted] = useState(() => localStorage.getItem('cq_muted') === 'true');

  const play = (name) => {
    if (muted) return;
    soundEffects[name]?.();
  };

  const toggleMute = () => {
    setMuted(m => {
      localStorage.setItem('cq_muted', String(!m));
      return !m;
    });
  };

  return { play, muted, toggleMute };
}