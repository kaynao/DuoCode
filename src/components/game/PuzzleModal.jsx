import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Zap, AlertCircle } from 'lucide-react';

const puzzles = [
  {
    type: 'password',
    title: '🔒 Desbloqueio de Tela',
    question: 'Seu computador travou! Digite a senha para continuar.',
    hint: 'Dica: A senha é o resultado de 2³ + 5',
    answer: '13'
  },
  {
    type: 'logic',
    title: '🧩 Desafio de Lógica',
    question: 'Qual é o próximo número na sequência: 2, 4, 8, 16, __?',
    hint: 'Dica: Cada número é multiplicado por 2',
    answer: '32'
  },
  {
    type: 'password',
    title: '🔐 Acesso Negado',
    question: 'Sistema bloqueado! Quantos bits tem 1 byte?',
    hint: 'Dica: É um conceito básico de computação',
    answer: '8'
  },
  {
    type: 'logic',
    title: '💡 Raciocínio Rápido',
    question: 'Se A=1, B=2, C=3... Quanto vale a palavra "CODE"?',
    hint: 'Dica: Some os valores de cada letra (C+O+D+E)',
    answer: '40'
  },
  {
    type: 'password',
    title: '🛡️ Verificação de Segurança',
    question: 'Quantos elementos tem um array: [1, 2, 3, 4, 5]?',
    hint: 'Dica: Conte os elementos',
    answer: '5'
  },
  {
    type: 'logic',
    title: '🎯 Teste de Algoritmo',
    question: 'Qual o resultado de: 10 % 3? (operador módulo)',
    hint: 'Dica: Módulo retorna o resto da divisão',
    answer: '1'
  }
];

export default function PuzzleModal({ onSolve }) {
  const [puzzle] = useState(puzzles[Math.floor(Math.random() * puzzles.length)]);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Mostra a dica após 10 segundos
    const timer = setTimeout(() => {
      setShowHint(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim().toLowerCase() === puzzle.answer.toLowerCase()) {
      onSolve();
    } else {
      setError(true);
      setAttempts(attempts + 1);
      setTimeout(() => setError(false), 1000);
      setAnswer('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border-4 border-red-500"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">{puzzle.title}</h3>
            <p className="text-xs text-red-600">Resolva para continuar</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
          <p className="text-slate-800 font-medium mb-2">{puzzle.question}</p>
          {attempts > 2 && (
            <p className="text-xs text-slate-600 mt-2">
              {attempts} tentativas feitas...
            </p>
          )}
        </div>

        {showHint && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-yellow-50 rounded-lg p-3 mb-4 border border-yellow-200"
          >
            <div className="flex items-center gap-2 text-yellow-800 text-sm">
              <Zap className="w-4 h-4" />
              <span>{puzzle.hint}</span>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Digite sua resposta..."
              className={`text-lg text-center font-bold ${error ? 'border-red-500 animate-shake' : ''}`}
              autoFocus
            />
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-600 text-sm text-center mt-2 flex items-center justify-center gap-1"
              >
                <AlertCircle className="w-4 h-4" />
                Resposta incorreta! Tente novamente.
              </motion.p>
            )}
          </div>

          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
            Verificar Resposta
          </Button>

          {!showHint && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowHint(true)}
              className="w-full text-xs"
            >
              Ver Dica
            </Button>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
}