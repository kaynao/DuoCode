import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Trophy, Calendar, Star, Code2, LogOut, FileText } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function ProfileView({ user, playerStats, submissions, challenges, onLogout }) {
  const recentSubmissions = submissions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">👤 Perfil</h2>
        <p className="text-slate-600">Informações sobre sua conta</p>
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white"
      >
        <div className="flex items-center gap-6">
          <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
            <AvatarFallback className="bg-white text-indigo-600 text-2xl font-bold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-2xl font-bold mb-1">
              {user?.full_name || user?.email?.split('@')[0] || 'Desenvolvedor'}
            </h3>
            <p className="text-indigo-100 text-sm mb-3">{user?.email}</p>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                {playerStats.rank || 'Dev Júnior'}
              </div>
              <div className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                {playerStats.totalXP || 0} XP
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-5 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{playerStats.completed || 0}</p>
              <p className="text-xs text-slate-600">Concluídos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{playerStats.totalXP || 0}</p>
              <p className="text-xs text-slate-600">Total XP</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {challenges.length - playerStats.completed || 0}
              </p>
              <p className="text-xs text-slate-600">Restantes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Atividade Recente</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {recentSubmissions.length > 0 ? (
            recentSubmissions.map((submission, index) => {
              const challenge = challenges.find(c => c.id === submission.challenge_id);
              return (
                <div key={submission.id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {challenge?.title || 'Desafio Concluído'}
                    </p>
                    <p className="text-xs text-slate-500">
                      +{submission.points_earned || 0} XP
                    </p>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(submission.created_date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <Code2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">Nenhuma atividade ainda</p>
              <p className="text-sm text-slate-500">Complete desafios para ver seu histórico</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {user?.role === 'admin' && (
          <Link to="/TeacherReports">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              <FileText className="w-4 h-4 mr-2" />
              Relatórios do Professor
            </Button>
          </Link>
        )}
        
        <Button 
          onClick={onLogout}
          variant="outline" 
          className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da Conta
        </Button>
      </div>
    </div>
  );
}