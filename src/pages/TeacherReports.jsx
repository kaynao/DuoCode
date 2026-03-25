import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { 
  Download, FileText, TrendingUp, Award, Clock, 
  CheckCircle, XCircle, Target, BarChart3, User
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeacherReports() {
  const [user, setUser] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [reportType, setReportType] = useState('general');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allProgress = [] } = useQuery({
    queryKey: ['allProgress'],
    queryFn: () => base44.entities.GameProgress.list('-total_score', 500),
    initialData: [],
  });

  const { data: allSubmissions = [] } = useQuery({
    queryKey: ['allSubmissions'],
    queryFn: () => base44.entities.CodeSubmission.list('-created_date', 1000),
    initialData: [],
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.CodeChallenge.list(),
    initialData: [],
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['allAchievements'],
    queryFn: () => base44.entities.Achievement.list('-unlocked_at', 500),
    initialData: [],
  });

  // Filtrar dados por aluno
  const filteredProgress = selectedStudent === 'all' 
    ? allProgress 
    : allProgress.filter(p => p.user_email === selectedStudent);

  const filteredSubmissions = selectedStudent === 'all'
    ? allSubmissions
    : allSubmissions.filter(s => s.user_email === selectedStudent);

  const filteredAchievements = selectedStudent === 'all'
    ? achievements
    : achievements.filter(a => a.user_email === selectedStudent);

  // Estatísticas gerais
  const totalStudents = new Set(allProgress.map(p => p.user_email)).size;
  const totalSubmissions = allSubmissions.length;
  const passedSubmissions = allSubmissions.filter(s => s.status === 'passed').length;
  const failedSubmissions = allSubmissions.filter(s => s.status === 'failed').length;
  const successRate = totalSubmissions > 0 ? Math.round((passedSubmissions / totalSubmissions) * 100) : 0;
  const averageScore = allProgress.length > 0 
    ? Math.round(allProgress.reduce((sum, p) => sum + (p.total_score || 0), 0) / allProgress.length) 
    : 0;

  // Estatísticas por dificuldade
  const getSubmissionsByDifficulty = () => {
    const stats = { junior: 0, pleno: 0, senior: 0 };
    filteredSubmissions.filter(s => s.status === 'passed').forEach(sub => {
      const challenge = challenges.find(c => c.id === sub.challenge_id);
      if (challenge) {
        stats[challenge.difficulty] = (stats[challenge.difficulty] || 0) + 1;
      }
    });
    return stats;
  };

  // Alunos com mais dificuldade
  const getStudentsWithDifficulties = () => {
    const studentStats = {};
    allSubmissions.forEach(sub => {
      if (!studentStats[sub.user_email]) {
        studentStats[sub.user_email] = { total: 0, failed: 0 };
      }
      studentStats[sub.user_email].total++;
      if (sub.status === 'failed') {
        studentStats[sub.user_email].failed++;
      }
    });

    return Object.entries(studentStats)
      .map(([email, stats]) => ({
        email,
        failRate: stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0,
        totalAttempts: stats.total,
        failedAttempts: stats.failed
      }))
      .sort((a, b) => b.failRate - a.failRate)
      .slice(0, 5);
  };

  // Desafios mais difíceis
  const getMostDifficultChallenges = () => {
    const challengeStats = {};
    allSubmissions.forEach(sub => {
      if (!challengeStats[sub.challenge_id]) {
        challengeStats[sub.challenge_id] = { total: 0, failed: 0 };
      }
      challengeStats[sub.challenge_id].total++;
      if (sub.status === 'failed') {
        challengeStats[sub.challenge_id].failed++;
      }
    });

    return Object.entries(challengeStats)
      .map(([id, stats]) => {
        const challenge = challenges.find(c => c.id === id);
        return {
          id,
          title: challenge?.title || 'Desconhecido',
          difficulty: challenge?.difficulty || 'unknown',
          failRate: stats.total > 0 ? Math.round((stats.failed / stats.total) * 100) : 0,
          totalAttempts: stats.total,
          failedAttempts: stats.failed
        };
      })
      .sort((a, b) => b.failRate - a.failRate)
      .slice(0, 5);
  };

  const exportReport = () => {
    const diffStats = getSubmissionsByDifficulty();
    const report = {
      data_geracao: new Date().toLocaleString('pt-BR'),
      professor: user?.full_name || user?.email,
      filtro_aluno: selectedStudent === 'all' ? 'Todos os alunos' : selectedStudent,
      resumo: {
        total_alunos: totalStudents,
        total_submissoes: totalSubmissions,
        submissoes_aprovadas: passedSubmissions,
        submissoes_reprovadas: failedSubmissions,
        taxa_sucesso: `${successRate}%`,
        pontuacao_media: averageScore
      },
      desempenho_por_nivel: {
        junior: diffStats.junior,
        pleno: diffStats.pleno,
        senior: diffStats.senior
      },
      alunos_analisados: filteredProgress.map(p => ({
        email: p.user_email,
        pontuacao_total: p.total_score || 0,
        streak_atual: p.current_streak || 0,
        melhor_streak: p.best_streak || 0,
        desafios_completos: p.challenges_completed?.length || 0
      })),
      submissoes_recentes: filteredSubmissions.slice(0, 50).map(s => ({
        aluno: s.user_email,
        desafio_id: s.challenge_id,
        status: s.status,
        pontos: s.points_earned || 0,
        data: new Date(s.created_date).toLocaleString('pt-BR')
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_codequest_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório exportado com sucesso!');
  };

  const isDark = document.documentElement.classList.contains('dark');

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Apenas professores (administradores) podem acessar os relatórios.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              📊 Relatórios do Professor
            </h1>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
              Acompanhe o desempenho dos alunos no CodeQuest
            </p>
          </div>
          <Button onClick={exportReport} className="bg-green-500 hover:bg-green-600">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório (JSON)
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className={`text-sm font-semibold mb-2 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Filtrar por Aluno
                </label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Alunos</SelectItem>
                    {Array.from(new Set(allProgress.map(p => p.user_email))).map(email => (
                      <SelectItem key={email} value={email}>{email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards de Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Total de Alunos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black">{totalStudents}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Taxa de Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black">{successRate}%</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Pontuação Média
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black">{averageScore}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }}>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Total de Tentativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black">{totalSubmissions}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Desempenho por Nível */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Desempenho por Nível de Dificuldade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(getSubmissionsByDifficulty()).map(([level, count]) => {
                const colors = {
                  junior: 'bg-green-500',
                  pleno: 'bg-blue-500',
                  senior: 'bg-purple-500'
                };
                const labels = {
                  junior: '🌱 Júnior',
                  pleno: '⚡ Pleno',
                  senior: '🚀 Sênior'
                };
                const total = passedSubmissions;
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {labels[level]}
                      </span>
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {count} conclusões ({percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[level]} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alunos com Mais Dificuldade */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Alunos Precisando de Atenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getStudentsWithDifficulties().length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Nenhum dado disponível
                  </p>
                ) : (
                  getStudentsWithDifficulties().map((student, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {student.email}
                        </span>
                        <span className="text-red-600 font-bold text-sm">
                          {student.failRate}% erros
                        </span>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {student.failedAttempts} erros de {student.totalAttempts} tentativas
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Desafios Mais Difíceis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Desafios Mais Difíceis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getMostDifficultChallenges().length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Nenhum dado disponível
                  </p>
                ) : (
                  getMostDifficultChallenges().map((challenge, i) => (
                    <div key={i} className={`p-3 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {challenge.title}
                        </span>
                        <span className="text-orange-600 font-bold text-sm">
                          {challenge.failRate}% erros
                        </span>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {challenge.failedAttempts} erros de {challenge.totalAttempts} tentativas
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista Detalhada de Alunos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detalhamento por Aluno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <th className={`text-left py-3 px-4 font-semibold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Aluno
                    </th>
                    <th className={`text-center py-3 px-4 font-semibold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Pontuação
                    </th>
                    <th className={`text-center py-3 px-4 font-semibold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Desafios
                    </th>
                    <th className={`text-center py-3 px-4 font-semibold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Streak
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProgress.map((progress, i) => {
                    const studentSubs = allSubmissions.filter(s => s.user_email === progress.user_email);
                    const passed = studentSubs.filter(s => s.status === 'passed').length;
                    const failed = studentSubs.filter(s => s.status === 'failed').length;
                    
                    return (
                      <tr key={i} className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                        <td className={`py-3 px-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {progress.user_email}
                        </td>
                        <td className={`py-3 px-4 text-center font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                          {progress.total_score || 0}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-green-600 font-semibold">{passed}</span>
                          <span className={`mx-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/</span>
                          <span className="text-red-600 font-semibold">{failed}</span>
                        </td>
                        <td className={`py-3 px-4 text-center font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                          {progress.current_streak || 0}x
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}