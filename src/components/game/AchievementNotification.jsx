import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Award, Crown, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

const iconMap = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  award: Award,
  crown: Crown,
  target: Target,
};

export default function AchievementNotification({ achievement, onClose }) {
  const Icon = iconMap[achievement.icon] || Trophy;

  useEffect(() => {
    // Confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed top-20 right-6 z-50 w-96"
    >
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl shadow-2xl overflow-hidden border-4 border-yellow-300">
        <div className="p-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
            <Icon className="w-10 h-10 text-yellow-500" />
          </div>
          <div className="flex-1 text-white">
            <div className="text-xs font-bold uppercase tracking-wide mb-1">🏆 Conquista Desbloqueada!</div>
            <h4 className="font-bold text-lg mb-1">{achievement.title}</h4>
            <p className="text-sm opacity-90">{achievement.description}</p>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-yellow-200 to-yellow-500"></div>
      </div>
    </motion.div>
  );
}