import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Lightbulb, Code2, BookOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import CodeEditor from '../code-game/CodeEditor';
import { base44 } from '@/api/base44Client';

export default function DuolingoChallenge({ challenge, onComplete, onError, play }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [code, setCode] = useState(challenge.starter_code || '');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const isTheory = challenge.challenge_type === 'theory' || challenge.language === 'theory';
  const options = challenge.test_cases || [];
  const correctAnswer = challenge.expected_output?.trim();

  const handleTheorySubmit = async () => {
    if (selectedAnswer === null) return;
    const selectedOption = options[selectedAnswer];
    // Compare the selected option's expected value with the challenge's correct answer
    const correct = selectedOption?.expected?.trim() === correctAnswer || 
                    selectedOption?.input?.trim() === correctAnswer;
    setIsCorrect(correct);
    setSubmitted(true);
    setIsEvaluating(true);
    
    if (correct) {
      play?.('correct');
      setFeedback('Parabéns! Você acertou.');
      setIsEvaluating(false);
    } else {
      play?.('wrong');
      // Use AI to give didactic feedback without revealing answer
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um professor de Algoritmos experiente e didático. Um aluno respondeu incorretamente a seguinte questão:

PERGUNTA: ${challenge.title}
DESCRIÇÃO: ${challenge.description}
RESPOSTA DO ALUNO: ${selectedOption?.input}

Dê um feedback didático que:
1. Explique gentilmente POR QUE a resposta está incorreta
2. Dê uma DICA sobre o conceito correto, mas SEM revelar qual é a resposta correta
3. Incentive o aluno a tentar novamente pensando no conceito

Seja empático, construtivo e educativo. Máximo 3 frases.`,
        response_json_schema: {
          type: 'object',
          properties: {
            feedback: { type: 'string' }
          }
        }
      });
      setFeedback(result.feedback);
      setIsEvaluating(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (!code.trim() || code.trim() === (challenge.starter_code || '').trim()) {
      setFeedback('Você precisa escrever código antes de verificar!');
      setIsCorrect(false);
      setSubmitted(true);
      return;
    }
    setIsEvaluating(true);
    setSubmitted(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é um professor de Algoritmos experiente e didático. Avalie o código do aluno com empatia e clareza, como faria em sala de aula.

PROBLEMA: ${challenge.title}
DESCRIÇÃO: ${challenge.description}
RESPOSTA ESPERADA / SAÍDA ESPERADA: ${challenge.expected_output || 'Não especificada'}
CÓDIGO INICIAL FORNECIDO: ${challenge.starter_code || 'Nenhum'}
CÓDIGO DO ALUNO:
${code}

INSTRUÇÕES:
- Se estiver CORRETO: elogie o aluno e explique o que ele fez bem, destacando conceitos importantes que ele aplicou corretamente
- Se estiver INCORRETO: seja gentil e construtivo. Explique o erro de forma didática, aponte o conceito que precisa revisar e dê DICAS de como melhorar. NÃO mostre a solução completa, apenas oriente o raciocínio.

Responda SOMENTE com JSON no formato:
{"correct": true/false, "feedback": "feedback didático de 2-3 frases, como um professor falando com o aluno", "hint": "se incorreto, dê uma dica sobre como resolver (NÃO a solução completa)"}`,
      response_json_schema: {
        type: 'object',
        properties: {
          correct: { type: 'boolean' },
          feedback: { type: 'string' },
          hint: { type: 'string' }
        }
      }
    });

    setIsEvaluating(false);
    setIsCorrect(result.correct);
    if (result.correct) {
      play?.('correct');
      setFeedback(result.feedback || 'Ótimo trabalho!');
    } else {
      play?.('wrong');
      setFeedback(result.feedback + (result.hint ? `\n\n💡 Dica: ${result.hint}` : ''));
    }
  };

  const handleContinue = () => {
    if (isCorrect) {
      onComplete();
    } else {
      onError();
      setSubmitted(false);
      setIsCorrect(null);
      setSelectedAnswer(null);
      setFeedback('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Question */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            isTheory ? "bg-blue-100" : "bg-purple-100"
          )}>
            {isTheory
              ? <BookOpen className="w-6 h-6 text-blue-600" />
              : <Code2 className="w-6 h-6 text-purple-600" />
            }
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              {isTheory ? 'Escolha a opção correta' : 'Complete o código'}
            </p>
            <h2 className="text-xl font-black text-slate-900">{challenge.title}</h2>
          </div>
        </div>

        <p className="text-slate-700 text-base leading-relaxed mb-6 whitespace-pre-wrap bg-slate-50 rounded-2xl p-4 border border-slate-200">
          {challenge.description}
        </p>

        {isTheory ? (
          <div className="space-y-3">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = option.expected === correctAnswer;
              let style = 'border-slate-200 bg-white hover:border-slate-300';
              if (submitted) {
                if (isCorrectOption) style = 'border-green-400 bg-green-50';
                else if (isSelected && !isCorrectOption) style = 'border-red-400 bg-red-50';
              } else if (isSelected) {
                style = 'border-blue-400 bg-blue-50';
              }
              return (
                <motion.button
                  key={index}
                  whileTap={{ scale: submitted ? 1 : 0.97 }}
                  onClick={() => !submitted && setSelectedAnswer(index)}
                  disabled={submitted}
                  className={cn(
                    'w-full text-left p-4 rounded-2xl border-2 transition-all font-semibold text-slate-800',
                    style
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{String.fromCharCode(65 + index)}. {option.input}</span>
                    {submitted && isCorrectOption && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    {submitted && isSelected && !isCorrectOption && <XCircle className="w-5 h-5 text-red-600" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden border-2 border-slate-200">
            <CodeEditor
              code={code}
              onChange={setCode}
              language={challenge.language}
            />
          </div>
        )}

        {challenge.hints?.length > 0 && !submitted && (
          <div className="mt-4 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800">
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{challenge.hints[0]}</span>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className={cn(
        'border-t-2 p-6',
        submitted && isCorrect && 'bg-green-50 border-green-300',
        submitted && !isCorrect && 'bg-red-50 border-red-300',
        !submitted && 'bg-white border-slate-200'
      )}>
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              {isEvaluating ? (
                <div className="flex items-center gap-3 text-slate-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="font-bold">Avaliando seu código com IA...</span>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {isCorrect
                      ? <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0 mt-0.5" />
                      : <XCircle className="w-8 h-8 text-red-600 flex-shrink-0 mt-0.5" />
                    }
                    <div className="min-w-0">
                      <p className={cn('font-black text-lg', isCorrect ? 'text-green-700' : 'text-red-700')}>
                        {isCorrect ? 'Ótimo trabalho!' : 'Não foi dessa vez...'}
                      </p>
                      {feedback && (
                        <p className={cn('text-sm mt-1 whitespace-pre-wrap', isCorrect ? 'text-green-600' : 'text-red-600')}>
                          {feedback}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleContinue}
                    className={cn(
                      'font-black text-white px-8 py-5 rounded-2xl text-base flex-shrink-0',
                      isCorrect
                        ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200'
                        : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200'
                    )}
                  >
                    Continuar
                  </Button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="submit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end max-w-3xl mx-auto"
            >
              <Button
                onClick={isTheory ? handleTheorySubmit : handleCodeSubmit}
                disabled={isTheory ? selectedAnswer === null : !code.trim()}
                className="bg-green-500 hover:bg-green-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black px-10 py-5 rounded-2xl text-base shadow-lg shadow-green-200 disabled:shadow-none transition-all"
              >
                Verificar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}