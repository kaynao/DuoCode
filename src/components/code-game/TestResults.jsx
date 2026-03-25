import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TestResults({ results, isRunning }) {
  if (isRunning) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
          <span className="text-slate-600">Executando testes...</span>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-slate-600 text-sm">Nenhum teste executado ainda</p>
      </div>
    );
  }

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const allPassed = passed === total;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className={cn(
        "rounded-xl p-6 border-2",
        allPassed ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
      )}>
        <div className="flex items-center gap-3 mb-4">
          {allPassed ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
          <div>
            <h3 className={cn(
              "text-lg font-bold",
              allPassed ? "text-green-900" : "text-red-900"
            )}>
              {allPassed ? 'Todos os testes passaram! 🎉' : 'Alguns testes falharam'}
            </h3>
            <p className="text-sm text-slate-600">
              {passed} de {total} testes passaram
            </p>
          </div>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(passed / total) * 100}%` }}
            transition={{ duration: 0.5 }}
            className={cn(
              "h-full rounded-full",
              allPassed ? "bg-green-500" : "bg-red-500"
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "p-4 rounded-lg border",
                result.passed 
                  ? "bg-white border-green-200" 
                  : "bg-white border-red-200"
              )}
            >
              <div className="flex items-start gap-3">
                {result.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-slate-900 mb-1">
                    Teste {index + 1}
                  </div>
                  {result.input && (
                    <div className="text-xs text-slate-600 mb-2">
                      <span className="font-semibold">Input:</span> {result.input}
                    </div>
                  )}
                  <div className="flex gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Esperado:</span>
                      <code className="ml-1 px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                        {result.expected}
                      </code>
                    </div>
                    <div>
                      <span className="text-slate-500">Obtido:</span>
                      <code className={cn(
                        "ml-1 px-2 py-0.5 rounded",
                        result.passed 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      )}>
                        {result.actual || 'N/A'}
                      </code>
                    </div>
                  </div>
                  {result.error && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                      <span className="font-semibold">Erro:</span> {result.error}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}