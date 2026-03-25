import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Code2, Bug, Zap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const challengeIcons = {
  complete: Code2,
  fix_bug: Bug,
  optimize: Zap,
};

const difficultyColors = {
  junior: 'from-green-500 to-emerald-500',
  pleno: 'from-yellow-500 to-orange-500',
  senior: 'from-red-500 to-pink-500',
};

const challengeTypeLabels = {
  complete: 'Completar Código',
  fix_bug: 'Corrigir Bug',
  optimize: 'Otimizar',
};

export default function ChallengeCard({ challenge, onSelect, completed = false }) {
  const Icon = challengeIcons[challenge.challenge_type] || Code2;
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group"
    >
      <button
        onClick={() => onSelect(challenge)}
        className="w-full bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 text-left"
      >
        <div className={cn(
          "h-24 bg-gradient-to-br flex items-center justify-between px-6",
          difficultyColors[challenge.difficulty]
        )}>
          <div>
            <div className="text-white/80 text-xs font-medium mb-1">
              {challenge.language === 'python' ? 'Python' : 'C++'}
            </div>
            <div className="text-white text-xs font-semibold uppercase tracking-wide">
              {challenge.difficulty}
            </div>
          </div>
          <Icon className="w-10 h-10 text-white/90" />
        </div>
        
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-slate-900 flex-1 group-hover:text-indigo-600 transition-colors">
              {challenge.title}
            </h3>
            {completed && (
              <div className="ml-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
          
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {challenge.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs">
              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded">
                {challengeTypeLabels[challenge.challenge_type]}
              </span>
              <span className="text-indigo-600 font-semibold">
                {challenge.points} pts
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </button>
    </motion.div>
  );
}