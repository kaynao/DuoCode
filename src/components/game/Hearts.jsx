import React from 'react';
import { Heart, Clock } from 'lucide-react';
import { MAX_LIVES } from './useHearts';

function formatTime(ms) {
  if (!ms) return '';
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

export default function Hearts({ lives, timeToNext }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-1">
        {[...Array(MAX_LIVES)].map((_, i) => (
          <Heart
            key={i}
            className={`w-5 h-5 transition-all ${i < lives ? 'text-red-500 fill-red-500' : 'text-slate-300 fill-slate-300'}`}
          />
        ))}
      </div>
      {timeToNext !== null && lives < MAX_LIVES && (
        <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
          <Clock className="w-3 h-3" />
          <span>{formatTime(timeToNext)}</span>
        </div>
      )}
    </div>
  );
}