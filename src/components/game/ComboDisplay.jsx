import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap } from 'lucide-react';

export default function ComboDisplay({ streak }) {
  if (streak < 2) return null;

  const getComboMessage = () => {
    if (streak >= 10) return 'LENDÁRIO! 🔥🔥🔥';
    if (streak >= 7) return 'IMPRESSIONANTE! 🔥🔥';
    if (streak >= 5) return 'EM CHAMAS! 🔥';
    if (streak >= 3) return 'COMBO! ⚡';
    return 'BOA! ✨';
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full shadow-2xl p-8 border-4 border-yellow-300">
        <div className="text-center text-white">
          <Flame className="w-16 h-16 mx-auto mb-2 animate-pulse" />
          <div className="text-5xl font-black mb-2">{streak}x</div>
          <div className="text-xl font-bold">{getComboMessage()}</div>
        </div>
      </div>
    </motion.div>
  );
}