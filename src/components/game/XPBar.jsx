import React from 'react';
import { motion } from 'framer-motion';

export default function XPBar({ xp, level }) {
  const xpForNextLevel = level * 500;
  const xpThisLevel = xp % xpForNextLevel;
  const progress = Math.min((xpThisLevel / xpForNextLevel) * 100, 100);

  return (
    <div className="flex items-center gap-3 min-w-[200px]">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-md">
        {level}
      </div>
      <div className="flex-1">
        <div className="h-4 bg-slate-200 rounded-full overflow-hidden border-2 border-slate-300">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
          />
        </div>
        <div className="text-xs text-slate-500 mt-0.5 text-center">{xpThisLevel} / {xpForNextLevel} XP</div>
      </div>
    </div>
  );
}