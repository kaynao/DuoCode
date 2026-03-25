import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Zap, ArrowRight } from 'lucide-react';

export default function LessonComplete({ points, streak, onContinue }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-8"
    >
      {/* Celebration */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
        className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-8 shadow-2xl"
      >
        <Trophy className="w-16 h-16 text-white" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-4xl font-black text-slate-900 mb-2"
      >
        Incrível! 🎉
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xl text-slate-500 mb-10"
      >
        Você completou o desafio!
      </motion.p>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-6 mb-12"
      >
        <div className="flex flex-col items-center gap-2 bg-yellow-50 border-2 border-yellow-200 rounded-2xl px-8 py-5">
          <Star className="w-8 h-8 text-yellow-500 fill-yellow-400" />
          <span className="text-3xl font-black text-yellow-600">+{points}</span>
          <span className="text-sm text-yellow-700 font-semibold">XP</span>
        </div>
        {streak >= 2 && (
          <div className="flex flex-col items-center gap-2 bg-orange-50 border-2 border-orange-200 rounded-2xl px-8 py-5">
            <Zap className="w-8 h-8 text-orange-500 fill-orange-400" />
            <span className="text-3xl font-black text-orange-600">{streak}x</span>
            <span className="text-sm text-orange-700 font-semibold">Combo!</span>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          onClick={onContinue}
          className="bg-green-500 hover:bg-green-600 text-white font-black text-lg px-12 py-6 rounded-2xl shadow-lg shadow-green-200 gap-2"
        >
          Continuar
          <ArrowRight className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
}