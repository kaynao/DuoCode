import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MessageCircle, ShoppingCart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const notificationTypes = [
  {
    type: 'email',
    icon: Mail,
    title: 'Nova mensagem de RH',
    message: 'Lembrete: Preencher relatório de horas trabalhadas até sexta-feira',
    color: 'from-blue-500 to-blue-600'
  },
  {
    type: 'social',
    icon: Users,
    title: 'João comentou sua foto',
    message: '"Parabéns pelo novo cargo! 🎉"',
    color: 'from-purple-500 to-pink-600'
  },
  {
    type: 'ad',
    icon: ShoppingCart,
    title: '🔥 PROMOÇÃO RELÂMPAGO',
    message: 'Curso de algoritmos com 90% OFF! Apenas hoje!',
    color: 'from-orange-500 to-red-600'
  },
  {
    type: 'chat',
    icon: MessageCircle,
    title: 'Maria (Gerente)',
    message: 'Oi! Tem um minuto? Preciso falar sobre o projeto...',
    color: 'from-green-500 to-emerald-600'
  },
  {
    type: 'email',
    icon: Mail,
    title: 'Newsletter TechNews',
    message: '10 dicas para aumentar sua produtividade como desenvolvedor',
    color: 'from-indigo-500 to-blue-600'
  },
  {
    type: 'social',
    icon: Users,
    title: 'Você tem 15 notificações',
    message: 'Confira as últimas atualizações dos seus amigos!',
    color: 'from-pink-500 to-purple-600'
  }
];

export default function DistractingNotification({ onClose }) {
  const notification = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
  const Icon = notification.icon;
  
  const position = Math.random() > 0.5 ? 'right' : 'left';
  const topPosition = 20 + Math.random() * 50; // 20% a 70% da tela

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 8000); // Auto-fecha após 8 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ x: position === 'right' ? 400 : -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: position === 'right' ? 400 : -400, opacity: 0 }}
      style={{ top: `${topPosition}%` }}
      className={`fixed ${position === 'right' ? 'right-6' : 'left-6'} z-50 w-80`}
    >
      <div className={`bg-gradient-to-r ${notification.color} rounded-xl shadow-2xl overflow-hidden border-2 border-white`}>
        <div className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 text-white">
            <h4 className="font-bold text-sm mb-1">{notification.title}</h4>
            <p className="text-xs opacity-90">{notification.message}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 text-white hover:bg-white/20 -mt-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}