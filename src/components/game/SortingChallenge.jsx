import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SortingChallenge({ onComplete, difficulty = 'easy' }) {
  const [numbers, setNumbers] = useState([]);
  const [originalNumbers, setOriginalNumbers] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const arraySize = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 9;

  useEffect(() => {
    initializeChallenge();
  }, [difficulty]);

  const initializeChallenge = () => {
    const nums = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 1);
    setNumbers([...nums]);
    setOriginalNumbers([...nums]);
    setSelectedIndices([]);
    setMoves(0);
    setCompleted(false);
    setStartTime(Date.now());
  };

  const handleNumberClick = (index) => {
    if (completed) return;

    if (selectedIndices.length === 0) {
      setSelectedIndices([index]);
    } else if (selectedIndices.length === 1) {
      if (selectedIndices[0] === index) {
        setSelectedIndices([]);
        return;
      }
      
      const newNumbers = [...numbers];
      const temp = newNumbers[selectedIndices[0]];
      newNumbers[selectedIndices[0]] = newNumbers[index];
      newNumbers[index] = temp;
      
      setNumbers(newNumbers);
      setSelectedIndices([]);
      setMoves(moves + 1);

      if (isSorted(newNumbers)) {
        setCompleted(true);
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        setTimeout(() => {
          onComplete({ moves, time: timeTaken, score: calculateScore(moves, timeTaken) });
        }, 800);
      }
    }
  };

  const isSorted = (arr) => {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) return false;
    }
    return true;
  };

  const calculateScore = (moves, time) => {
    const optimalMoves = arraySize * 2;
    const moveScore = Math.max(0, 100 - (moves - optimalMoves) * 5);
    const timeScore = Math.max(0, 100 - time * 2);
    return Math.floor((moveScore + timeScore) / 2);
  };

  const getBarHeight = (num) => {
    const maxNum = 100;
    return `${(num / maxNum) * 100}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-slate-900">Desafio de Ordenação</h3>
          <p className="text-sm text-slate-600">Clique em dois números para trocá-los de posição</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">Movimentos</div>
            <div className="text-2xl font-bold text-indigo-600">{moves}</div>
          </div>
        </div>
      </div>

      <div className="relative bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-2xl p-8 border border-slate-200">
        <div className="flex justify-around items-end h-64 gap-2">
          <AnimatePresence mode="popLayout">
            {numbers.map((num, index) => (
              <motion.div
                key={`${index}-${num}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: selectedIndices.includes(index) ? 1.1 : 1,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex-1 flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => handleNumberClick(index)}
              >
                <motion.div
                  className={cn(
                    "w-full rounded-t-xl relative transition-all duration-300",
                    selectedIndices.includes(index) 
                      ? "bg-gradient-to-t from-indigo-500 to-indigo-400 shadow-lg shadow-indigo-300" 
                      : completed
                      ? "bg-gradient-to-t from-green-500 to-green-400 shadow-md shadow-green-200"
                      : "bg-gradient-to-t from-cyan-500 to-cyan-400 shadow-md hover:shadow-lg shadow-cyan-200"
                  )}
                  style={{ height: getBarHeight(num) }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </motion.div>
                <div className={cn(
                  "text-lg font-bold px-3 py-1 rounded-lg",
                  selectedIndices.includes(index) 
                    ? "bg-indigo-600 text-white" 
                    : "bg-white text-slate-700"
                )}>
                  {num}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              </motion.div>
              <h4 className="text-3xl font-bold text-slate-900">Parabéns!</h4>
              <p className="text-slate-600">Array ordenado com sucesso!</p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={initializeChallenge}
          variant="outline"
          className="flex-1"
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          Novo Desafio
        </Button>
      </div>
    </div>
  );
}