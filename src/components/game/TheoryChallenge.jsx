import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TheoryChallenge({ challenge, onComplete }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  // Parse test_cases como opções de múltipla escolha
  const options = challenge.test_cases || [];
  const correctAnswer = challenge.expected_output;

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    const isCorrect = options[selectedAnswer]?.expected === correctAnswer;
    
    setTimeout(() => {
      onComplete(isCorrect);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{challenge.title}</h3>
            <p className="text-sm text-slate-600">Desafio Teórico</p>
          </div>
        </div>

        <p className="text-slate-700 leading-relaxed mb-6 whitespace-pre-wrap">
          {challenge.description}
        </p>

        <div className="space-y-3">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = option.expected === correctAnswer;
            const showCorrect = showResult && isCorrect;
            const showIncorrect = showResult && isSelected && !isCorrect;

            return (
              <motion.button
                key={index}
                whileHover={{ scale: showResult ? 1 : 1.02 }}
                whileTap={{ scale: showResult ? 1 : 0.98 }}
                onClick={() => !showResult && setSelectedAnswer(index)}
                disabled={showResult}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all",
                  isSelected && !showResult && "border-indigo-500 bg-indigo-50",
                  !isSelected && !showResult && "border-slate-200 hover:border-slate-300 bg-white",
                  showCorrect && "border-green-500 bg-green-50",
                  showIncorrect && "border-red-500 bg-red-50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-medium">
                    {String.fromCharCode(65 + index)}. {option.input}
                  </span>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  {showIncorrect && <XCircle className="w-5 h-5 text-red-600" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        {!showResult && (
          <Button
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
          >
            Enviar Resposta
          </Button>
        )}

        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-6 p-4 rounded-lg border-2",
              options[selectedAnswer]?.expected === correctAnswer
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            )}
          >
            <p className={cn(
              "text-center font-bold",
              options[selectedAnswer]?.expected === correctAnswer
                ? "text-green-800"
                : "text-red-800"
            )}>
              {options[selectedAnswer]?.expected === correctAnswer
                ? "🎉 Resposta Correta!"
                : "❌ Resposta Incorreta"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}