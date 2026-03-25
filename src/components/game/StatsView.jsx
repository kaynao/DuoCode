import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Zap, TrendingUp, Award, Clock } from 'lucide-react';

export default function StatsView({ playerStats, submissions, challenges }) {
  const stats = [
    {
      label: 'XP Total',
      value: playerStats.totalXP || 0,
      icon: Zap,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      label: 'Desafios Completados',
      value: playerStats.completed || 0,
      icon: Target,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Taxa de Sucesso',
      value: `${challenges.length > 0 ? Math.round((playerStats.completed / challenges.length) * 100) : 0}%`,
      icon: TrendingUp,
      color: 'from-blue-500 to-indigo-500'
    },
    {
      label: 'Cargo Atual',
      value: playerStats.rank || 'Júnior',
      icon: Award,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const difficultyBreakdown = {
    junior: submissions.filter(s => challenges.find(c => c.id === s.challenge_id)?.difficulty === 'junior').length,
    pleno: submissions.filter(s => challenges.find(c => c.id === s.challenge_id)?.difficulty === 'pleno').length,
    senior: submissions.filter(s => challenges.find(c => c.id === s.challenge_id)?.difficulty === 'senior').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">📊 Estatísticas</h2>
        <p className="text-slate-600">Acompanhe seu desempenho e evolução</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 border border-slate-200"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Breakdown por Dificuldade */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Desafios por Nível</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-600">Júnior</span>
              <span className="text-sm font-bold text-green-600">{difficultyBreakdown.junior}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(difficultyBreakdown.junior / (playerStats.completed || 1)) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-600">Pleno</span>
              <span className="text-sm font-bold text-yellow-600">{difficultyBreakdown.pleno}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all"
                style={{ width: `${(difficultyBreakdown.pleno / (playerStats.completed || 1)) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-600">Sênior</span>
              <span className="text-sm font-bold text-red-600">{difficultyBreakdown.senior}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${(difficultyBreakdown.senior / (playerStats.completed || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}