import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Target, CheckCircle2, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SearchChallenge({ onComplete, difficulty = 'easy' }) {
  const [numbers, setNumbers] = useState([]);
  const [targetNumber, setTargetNumber] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  const arraySize = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 16;

  useEffect(() => {
    initializeChallenge();
  }, [difficulty]);

  const initializeChallenge = () => {
    const nums = Array.from({ length: arraySize }, (_, i) => i + 1);
    // Embaralhar
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    const target = nums[Math.floor(Math.random() * nums.length)];
    
    setNumbers(nums);
    setTargetNumber(target);
    setSelectedIndex(null);
    setAttempts(0);
    setCompleted(false);
    setStartTime(Date.now());
    setSearchHistory([]);
  };

  const handleNumberClick = (index) => {
    if (completed) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setSelectedIndex(index);
    setSearchHistory([...searchHistory, index]);

    if (numbers[index] === targetNumber) {
      setCompleted(true);
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const score = calculateScore(newAttempts, timeTaken);
      setTimeout(() => {
        onComplete({ attempts: newAttempts, time: timeTaken, score });
      }, 1000);
    }
  };

  const calculateScore = (attempts, time) => {
    const optimalAttempts = 1;
    const attemptScore = Math.max(0, 100 - (attempts - optimalAttempts) * 10);
    const timeScore = Math.max(0, 100 - time * 3);
    return Math.floor((attemptScore + timeScore) / 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-slate-900">Desafio de Busca</h3>
          <p className="text-sm text-slate-600">Encontre o número alvo clicando nos cards</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">Tentativas</div>
            <div className="text-2xl font-bold text-indigo-600">{attempts}</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-slate-200">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Target className="w-6 h-6 text-purple-600" />
          <span className="text-slate-600 font-medium">Número alvo:</span>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-4xl font-bold text-purple-600 px-6 py-2 bg-white rounded-xl shadow-md border-2 border-purple-200"
          >
            {targetNumber}
          </motion.div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {numbers.map((num, index) => {
            const isSelected = selectedIndex === index;
            const isCorrect = completed && num === targetNumber;
            const wasSearched = searchHistory.includes(index) && !isCorrect;

            return (
              <motion.button
                key={index}
                whileHover={{ scale: wasSearched ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberClick(index)}
                disabled={completed || wasSearched}
                className={cn(
                  "aspect-square rounded-xl text-2xl font-bold transition-all duration-300 relative overflow-hidden",
                  wasSearched && "opacity-30 cursor-not-allowed bg-slate-200 text-slate-400",
                  !wasSearched && !isCorrect && "bg-white text-slate-700 shadow-md hover:shadow-lg border-2 border-slate-200",
                  isCorrect && "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-300 border-2 border-green-400"
                )}
              >
                {!wasSearched && (
                  <span className="relative z-10">{num}</span>
                )}
                {wasSearched && (
                  <span className="text-lg">✕</span>
                )}
                {isCorrect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center bg-white rounded-xl p-6 shadow-lg border-2 border-green-200"
          >
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="text-2xl font-bold text-slate-900 mb-2">Encontrado!</h4>
            <p className="text-slate-600">
              Você encontrou em <span className="font-bold text-purple-600">{attempts}</span> tentativa{attempts > 1 ? 's' : ''}
            </p>
          </motion.div>
        )}
      </div>

      <Button 
        onClick={initializeChallenge}
        variant="outline"
        className="w-full"
      >
        <Search className="w-4 h-4 mr-2" />
        Novo Desafio
      </Button>
    </div>
  );
}