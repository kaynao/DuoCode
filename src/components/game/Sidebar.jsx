import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Menu, X, Home, Trophy, User, BarChart3, 
  ChevronRight, Medal, Star, TrendingUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar({ 
  currentView, 
  onViewChange, 
  playerStats,
  leaderboard 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'challenges', label: 'Desafios', icon: Home },
    { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'ranking', label: 'Ranking', icon: Trophy },
  ];

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-40 bg-indigo-600 hover:bg-indigo-700"
        size="icon"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-40 overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">CodeQuest</h2>
                <p className="text-sm text-slate-600">Menu de Navegação</p>
              </div>

              {/* Navigation */}
              <div className="space-y-2 mb-8">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onViewChange(item.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                        isActive 
                          ? "bg-indigo-600 text-white shadow-md" 
                          : "hover:bg-slate-100 text-slate-700"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium flex-1 text-left">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>

              {/* Quick Stats */}
              {playerStats && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 mb-6 border border-indigo-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Seu Progresso</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600">XP Total</span>
                      <span className="text-sm font-bold text-indigo-600">{playerStats.totalXP || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600">Desafios</span>
                      <span className="text-sm font-bold text-indigo-600">{playerStats.completed || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600">Cargo</span>
                      <span className="text-sm font-bold text-indigo-600">{playerStats.rank || 'Júnior'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mini Ranking */}
              {leaderboard && leaderboard.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">🏆 Top 5</h3>
                    <button
                      onClick={() => {
                        onViewChange('ranking');
                        setIsOpen(false);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      Ver todos
                    </button>
                  </div>
                  <div className="space-y-2">
                    {leaderboard.slice(0, 5).map((player, index) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          index === 0 && "bg-yellow-500 text-white",
                          index === 1 && "bg-slate-400 text-white",
                          index === 2 && "bg-orange-600 text-white",
                          index > 2 && "bg-slate-200 text-slate-600"
                        )}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">
                            {player.user_email?.split('@')[0] || 'Jogador'}
                          </p>
                          <p className="text-xs text-slate-500">{player.total_score || 0} XP</p>
                        </div>
                        {index < 3 && <Medal className="w-4 h-4 text-yellow-600" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}