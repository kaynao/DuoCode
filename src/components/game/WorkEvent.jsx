import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Bug, Users, Briefcase, AlertTriangle, Sparkles } from 'lucide-react';

const eventTypes = [
  {
    type: 'coffee',
    icon: Coffee,
    title: '☕ Pausa para o Café',
    message: 'Você merece uma pausa! Tome um café e recarregue as energias.',
    effect: '+20 Energia',
    color: 'from-amber-500 to-orange-600',
    duration: 3000
  },
  {
    type: 'bug',
    icon: Bug,
    title: '🐛 Bug Crítico em Produção!',
    message: 'Alerta! Um bug foi encontrado em produção. A pressão aumentou!',
    effect: '-15 Energia',
    color: 'from-red-500 to-red-700',
    duration: 4000
  },
  {
    type: 'meeting',
    icon: Users,
    title: '📅 Reunião Surpresa',
    message: 'Convocada uma reunião de alinhamento em 5 minutos. Prepare-se!',
    effect: '-10 Energia',
    color: 'from-blue-500 to-indigo-600',
    duration: 4000
  },
  {
    type: 'praise',
    icon: Sparkles,
    title: '🎉 Elogio do Gerente',
    message: 'Parabéns! Seu gerente elogiou seu trabalho recente!',
    effect: '+25 Energia',
    color: 'from-green-500 to-emerald-600',
    duration: 3000
  },
  {
    type: 'deadline',
    icon: AlertTriangle,
    title: '⏰ Deadline Apertado',
    message: 'O cliente pediu para antecipar a entrega. Pressão nas alturas!',
    effect: '-20 Energia',
    color: 'from-orange-500 to-red-600',
    duration: 4000
  },
  {
    type: 'bonus',
    icon: Briefcase,
    title: '💰 Bônus Anunciado',
    message: 'A empresa anunciou bônus para a equipe! Motivação total!',
    effect: '+30 Energia',
    color: 'from-purple-500 to-pink-600',
    duration: 3000
  }
];

export default function WorkEvent({ onComplete }) {
  const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const Icon = event.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(event);
    }, event.duration);

    return () => clearTimeout(timer);
  }, [event, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className={`bg-gradient-to-r ${event.color} rounded-2xl shadow-2xl max-w-lg w-full p-8 border-4 border-white`}
      >
        <div className="flex flex-col items-center text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <Icon className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-bold mb-2">{event.title}</h3>
          <p className="text-lg mb-4 opacity-90">{event.message}</p>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
            <span className="text-xl font-bold">{event.effect}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}