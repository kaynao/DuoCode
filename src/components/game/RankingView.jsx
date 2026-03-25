import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RankingView({ leaderboard, currentUserEmail }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">🏆 Ranking Global</h2>
        <p className="text-slate-600">Veja como você se compara com outros desenvolvedores</p>
      </div>

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8">
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-2">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <div className="bg-slate-200 rounded-t-xl px-6 py-4 h-24 flex flex-col items-center justify-end">
              <p className="text-sm font-bold text-slate-900 truncate max-w-[100px]">
                {leaderboard[1]?.user_email?.split('@')[0]}
              </p>
              <p className="text-xs text-slate-600">{leaderboard[1]?.total_score || 0} XP</p>
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center -mt-8"
          >
            <Crown className="w-8 h-8 text-yellow-500 mb-2" />
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl mb-2">
              <span className="text-3xl font-bold text-white">1</span>
            </div>
            <div className="bg-yellow-100 rounded-t-xl px-6 py-4 h-32 flex flex-col items-center justify-end border-2 border-yellow-300">
              <p className="text-base font-bold text-slate-900 truncate max-w-[120px]">
                {leaderboard[0]?.user_email?.split('@')[0]}
              </p>
              <p className="text-sm text-yellow-700 font-semibold">{leaderboard[0]?.total_score || 0} XP</p>
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg mb-2">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <div className="bg-orange-100 rounded-t-xl px-6 py-4 h-20 flex flex-col items-center justify-end">
              <p className="text-sm font-bold text-slate-900 truncate max-w-[100px]">
                {leaderboard[2]?.user_email?.split('@')[0]}
              </p>
              <p className="text-xs text-orange-700">{leaderboard[2]?.total_score || 0} XP</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Full Ranking List */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h3 className="text-lg font-bold text-white">Classificação Completa</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {leaderboard.map((player, index) => {
            const isCurrentUser = player.user_email === currentUserEmail;
            
            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "px-6 py-4 flex items-center gap-4",
                  isCurrentUser && "bg-indigo-50 border-l-4 border-indigo-600"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                  index === 0 && "bg-yellow-500 text-white",
                  index === 1 && "bg-slate-400 text-white",
                  index === 2 && "bg-orange-600 text-white",
                  index > 2 && "bg-slate-100 text-slate-600"
                )}>
                  {index + 1}
                </div>

                <div className="flex-1">
                  <p className={cn(
                    "font-bold text-slate-900",
                    isCurrentUser && "text-indigo-700"
                  )}>
                    {player.user_email?.split('@')[0] || 'Jogador'}
                    {isCurrentUser && <span className="ml-2 text-xs text-indigo-600">(Você)</span>}
                  </p>
                  <p className="text-xs text-slate-500">
                    {player.challenges_completed?.length || 0} desafios completados
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-indigo-600">{player.total_score || 0}</p>
                  <p className="text-xs text-slate-500">XP</p>
                </div>

                {index < 3 && (
                  <Medal className="w-6 h-6 text-yellow-600" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}