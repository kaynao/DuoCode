import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, Minus, CheckCircle2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StackChallenge({ onComplete, difficulty = 'easy' }) {
  const [stack, setStack] = useState([]);
  const [targetSequence, setTargetSequence] = useState([]);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [moves, setMoves] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const stackSize = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 5 : 6;

  useEffect(() => {
    initializeChallenge();
  }, [difficulty]);

  const initializeChallenge = () => {
    const sequence = Array.from({ length: stackSize }, (_, i) => i + 1);
    const available = [...sequence].sort(() => Math.random() - 0.5);
    
    setStack([]);
    setTargetSequence(sequence);
    setAvailableNumbers(available);
    setMoves(0);
    setCompleted(false);
    setStartTime(Date.now());
  };

  const handlePush = (number) => {
    if (completed) return;
    const newStack = [...stack, number];
    setStack(newStack);
    setAvailableNumbers(availableNumbers.filter(n => n !== number));
    setMoves(moves + 1);

    if (newStack.length === targetSequence.length && arraysEqual(newStack, targetSequence)) {
      setCompleted(true);
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      setTimeout(() => {
        onComplete({ moves, time: timeTaken, score: calculateScore(moves, timeTaken) });
      }, 1000);
    }
  };

  const handlePop = () => {
    if (completed || stack.length === 0) return;
    const newStack = [...stack];
    const popped = newStack.pop();
    setStack(newStack);
    setAvailableNumbers([...availableNumbers, popped].sort((a, b) => a - b));
    setMoves(moves + 1);
  };

  const arraysEqual = (arr1, arr2) => {
    return arr1.length === arr2.length && arr1.every((val, idx) => val === arr2[idx]);
  };

  const calculateScore = (moves, time) => {
    const optimalMoves = stackSize;
    const moveScore = Math.max(0, 100 - (moves - optimalMoves) * 8);
    const timeScore = Math.max(0, 100 - time * 2);
    return Math.floor((moveScore + timeScore) / 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-slate-900">Desafio de Pilha (Stack)</h3>
          <p className="text-sm text-slate-600">Empilhe os números na ordem correta: {targetSequence.join(', ')}</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">Movimentos</div>
            <div className="text-2xl font-bold text-indigo-600">{moves}</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pilha */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-amber-600" />
            <h4 className="text-lg font-bold text-slate-900">Pilha</h4>
          </div>
          
          <div className="space-y-2 min-h-[300px] flex flex-col-reverse">
            <AnimatePresence>
              {stack.map((num, index) => (
                <motion.div
                  key={`${index}-${num}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={cn(
                    "w-full py-4 rounded-xl text-center text-2xl font-bold shadow-md border-2",
                    index === stack.length - 1 && !completed
                      ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white border-amber-500"
                      : completed && num === targetSequence[index]
                      ? "bg-gradient-to-r from-green-400 to-green-500 text-white border-green-500"
                      : "bg-white text-slate-700 border-slate-200"
                  )}
                >
                  {num}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Button
            onClick={handlePop}
            disabled={stack.length === 0 || completed}
            variant="outline"
            className="w-full mt-4"
          >
            <Minus className="w-4 h-4 mr-2" />
            Pop (Remover do Topo)
          </Button>
        </div>

        {/* Números Disponíveis */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-slate-200">
          <h4 className="text-lg font-bold text-slate-900 mb-6">Números Disponíveis</h4>
          
          <div className="grid grid-cols-2 gap-3">
            {availableNumbers.map((num) => (
              <motion.button
                key={num}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePush(num)}
                disabled={completed}
                className="py-6 rounded-xl text-2xl font-bold bg-white text-slate-700 shadow-md hover:shadow-lg border-2 border-slate-200 transition-all"
              >
                {num}
              </motion.button>
            ))}
          </div>

          {completed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 bg-white rounded-xl p-6 shadow-lg border-2 border-green-200 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="text-2xl font-bold text-slate-900 mb-2">Perfeito!</h4>
              <p className="text-slate-600">Pilha montada corretamente!</p>
            </motion.div>
          )}
        </div>
      </div>

      <Button 
        onClick={initializeChallenge}
        variant="outline"
        className="w-full"
      >
        <Layers className="w-4 h-4 mr-2" />
        Novo Desafio
      </Button>
    </div>
  );
}