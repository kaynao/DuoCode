import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function StreakBadge({ streak }) {
  if (streak < 1) return null;
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1.5 bg-orange-100 border-2 border-orange-300 rounded-full px-3 py-1"
    >
      <Flame className="w-5 h-5 text-orange-500 fill-orange-400" />
      <span className="font-black text-orange-600 text-sm">{streak}</span>
    </motion.div>
  );
}