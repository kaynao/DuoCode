import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flame, Trophy, Star, Lock, ChevronRight, Code2, BookOpen, Zap, BarChart2, User, Sun, Moon, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import Hearts from '../components/game/Hearts';
import XPBar from '../components/game/XPBar';
import StreakBadge from '../components/game/StreakBadge';
import LessonComplete from '../components/game/LessonComplete';
import DuolingoChallenge from '../components/game/DuolingoChallenge';
import VirusPuzzle from '../components/game/VirusPuzzle';
import StatsView from '../components/game/StatsView';
import RankingView from '../components/game/RankingView';
import ProfileView from '../components/game/ProfileView';
import AchievementNotification from '../components/game/AchievementNotification';
import { useHearts } from '../components/game/useHearts';
import { useSounds } from '../components/game/useSounds';
import { useTheme } from '../components/game/useTheme';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const UNITS = [
  { id: 'junior', label: 'Dev Júnior', color: 'from-green-400 to-emerald-500', icon: '🌱', description: 'Fundamentos de programação' },
  { id: 'pleno', label: 'Dev Pleno', color: 'from-blue-400 to-indigo-500', icon: '⚡', description: 'Estruturas de dados e algoritmos' },
  { id: 'senior', label: 'Dev Sênior', color: 'from-purple-400 to-pink-500', icon: '🚀', description: 'Otimização e desafios avançados' },
];

export default function Game() {
  const [user, setUser] = useState(null);
  const [gameProgress, setGameProgress] = useState(null);
  const [activeView, setActiveView] = useState('map');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showComplete, setShowComplete] = useState(false);
  const [lastEarnedXP, setLastEarnedXP] = useState(0);
  const [corruptedIds, setCorruptedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('cq_corrupted') || '[]')); } catch { return new Set(); }
  });
  const [virusPuzzleChallenge, setVirusPuzzleChallenge] = useState(null);
  const [showAchievement, setShowAchievement] = useState(null);
  const queryClient = useQueryClient();

  const { play, muted, toggleMute } = useSounds();
  const { theme, toggleTheme } = useTheme();
  const { lives, loseHeart, timeToNext } = useHearts(() => {
    play('gainHeart');
    toast.success('❤️ Coração recuperado!');
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.CodeChallenge.list(),
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions', user?.email],
    queryFn: () => base44.entities.CodeSubmission.filter({ user_email: user.email, status: 'passed' }),
    enabled: !!user?.email,
  });

  // Track failed challenges (only most recent per challenge)
  const { data: failedSubmissions = [] } = useQuery({
    queryKey: ['failed_submissions', user?.email],
    queryFn: () => base44.entities.CodeSubmission.filter({ user_email: user.email, status: 'failed' }),
    enabled: !!user?.email,
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ['allProgress'],
    queryFn: () => base44.entities.GameProgress.list('-total_score', 50),
    initialData: [],
  });

  useEffect(() => {
    if (!user?.email) return;
    base44.entities.GameProgress.filter({ user_email: user.email }).then(list => {
      if (list.length > 0) {
        setGameProgress(list[0]);
      } else {
        base44.entities.GameProgress.create({
          user_email: user.email,
          current_streak: 0, best_streak: 0,
          energy: 100, total_score: 0, challenges_completed: []
        }).then(p => setGameProgress(p));
      }
    });
  }, [user?.email]);

  const submitCode = useMutation({
    mutationFn: (data) => base44.entities.CodeSubmission.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['failed_submissions'] });
    },
  });

  // Passed challenge IDs
  const completedIds = new Set(submissions.map(s => s.challenge_id));
  // Failed challenge IDs (that were never passed)
  const failedIds = new Set(failedSubmissions.map(s => s.challenge_id).filter(id => !completedIds.has(id)));

  const totalPoints = submissions.reduce((s, sub) => s + (sub.points_earned || 0), 0);
  const getLevel = () => Math.floor(totalPoints / 500) + 1;

  const challengesByUnit = (unitId) => challenges.filter(c => c.difficulty === unitId);

  const unitProgress = (unitId) => {
    const total = challengesByUnit(unitId).length;
    const done = challengesByUnit(unitId).filter(c => completedIds.has(c.id)).length;
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  };

  const isUnitUnlocked = (unitId) => {
    if (unitId === 'junior') return true;
    if (unitId === 'pleno') return unitProgress('junior').pct >= 50;
    if (unitId === 'senior') return unitProgress('pleno').pct >= 50;
    return false;
  };

  // Assign corrupted status to ~25% of uncompleted challenges when challenges load
  useEffect(() => {
    if (challenges.length === 0) return;
    const stored = localStorage.getItem('cq_corrupted');
    if (stored) return; // already assigned
    const ids = challenges
      .filter(c => Math.random() < 0.25)
      .map(c => c.id);
    const s = new Set(ids);
    setCorruptedIds(s);
    localStorage.setItem('cq_corrupted', JSON.stringify(ids));
  }, [challenges]);

  const handleSelectChallenge = (challenge) => {
    if (lives <= 0) {
      toast.error('Sem corações! Aguarde a recuperação ou tente mais tarde.', { duration: 3000 });
      return;
    }
    play('click');
    // If corrupted, show virus puzzle first
    if (corruptedIds.has(challenge.id)) {
      setVirusPuzzleChallenge(challenge);
      return;
    }
    setSelectedChallenge(challenge);
    setActiveView('challenge');
  };

  const handleVirusSolved = () => {
    const challenge = virusPuzzleChallenge;
    // Remove from corrupted set
    const next = new Set(corruptedIds);
    next.delete(challenge.id);
    setCorruptedIds(next);
    localStorage.setItem('cq_corrupted', JSON.stringify([...next]));
    setVirusPuzzleChallenge(null);
    // Now start the challenge
    setSelectedChallenge(challenge);
    setActiveView('challenge');
    toast.success('🛡️ Fase desbloqueada!', { duration: 2000 });
  };

  const handleChallengeComplete = () => {
    const xpMultiplier = { junior: 1, pleno: 1.5, senior: 2 };
    const earned = Math.floor((selectedChallenge.points || 100) * (xpMultiplier[selectedChallenge.difficulty] || 1));
    const newStreak = (gameProgress?.current_streak || 0) + 1;
    setLastEarnedXP(earned);

    // Check if this completes a unit
    const unitId = selectedChallenge.difficulty;
    const unitChallenges = challengesByUnit(unitId);
    const doneAfter = unitChallenges.filter(c => completedIds.has(c.id) || c.id === selectedChallenge.id).length;
    const isUnitDone = doneAfter === unitChallenges.length;

    if (isUnitDone) {
      play('unitComplete');
      confetti({ particleCount: 400, spread: 160, origin: { y: 0.5 } });
      setTimeout(() => confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, angle: 60 }), 400);
      setTimeout(() => confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 }, angle: 120 }), 600);
    } else {
      play('complete');
      confetti({ particleCount: 200, spread: 120, origin: { y: 0.6 } });
    }

    if (newStreak >= 3) play('streak');

    if (gameProgress) {
      base44.entities.GameProgress.update(gameProgress.id, {
        current_streak: newStreak,
        best_streak: Math.max(newStreak, gameProgress.best_streak || 0),
        total_score: (gameProgress.total_score || 0) + earned,
        challenges_completed: [...(gameProgress.challenges_completed || []), selectedChallenge.id]
      }).then(setGameProgress);
    }

    submitCode.mutate({
      user_email: user.email,
      challenge_id: selectedChallenge.id,
      code: selectedChallenge.challenge_type === 'theory' ? 'teoria' : 'code',
      status: 'passed',
      test_results: [{ passed: true }],
      points_earned: earned,
    });

    checkAchievements(newStreak, submissions.length + 1);
    setShowComplete(true);
  };

  const handleChallengeError = () => {
    loseHeart();
    play('loseHeart');

    // Record failed submission (only if not already passed)
    if (!completedIds.has(selectedChallenge.id)) {
      submitCode.mutate({
        user_email: user.email,
        challenge_id: selectedChallenge.id,
        code: 'failed_attempt',
        status: 'failed',
        test_results: [{ passed: false }],
        points_earned: 0,
      });
    }

    if (lives - 1 <= 0) {
      toast.error('💔 Sem corações! Os corações se recuperam com o tempo.', { duration: 4000 });
    } else {
      toast.error(`💔 Errou! ${lives - 1} corações restantes.`, { duration: 2500 });
    }

    if (gameProgress && (gameProgress.current_streak || 0) > 0) {
      base44.entities.GameProgress.update(gameProgress.id, { current_streak: 0 }).then(setGameProgress);
    }
  };

  const handleCompleteContinue = () => {
    setShowComplete(false);
    setSelectedChallenge(null);
    setActiveView('map');
  };

  const checkAchievements = async (streak, totalCompleted) => {
    const defs = [
      { id: 'first_challenge', title: 'Primeiro Passo', description: 'Complete seu primeiro desafio', icon: 'star', condition: totalCompleted === 1 },
      { id: 'streak_3', title: 'Aquecendo', description: 'Alcance um combo de 3x', icon: 'zap', condition: streak === 3 },
      { id: 'streak_5', title: 'Em Chamas', description: 'Alcance um combo de 5x', icon: 'trophy', condition: streak === 5 },
      { id: 'complete_5', title: 'Dev Dedicado', description: 'Complete 5 desafios', icon: 'target', condition: totalCompleted === 5 },
      { id: 'complete_10', title: 'Dev Experiente', description: 'Complete 10 desafios', icon: 'award', condition: totalCompleted === 10 },
    ];
    const unlocked = new Set(userAchievements.map(a => a.achievement_id));
    for (const a of defs) {
      if (a.condition && !unlocked.has(a.id)) {
        await base44.entities.Achievement.create({
          user_email: user.email, achievement_id: a.id,
          title: a.title, description: a.description,
          icon: a.icon, unlocked_at: new Date().toISOString()
        });
        setShowAchievement(a);
        setTimeout(() => setShowAchievement(null), 5000);
        queryClient.invalidateQueries({ queryKey: ['achievements'] });
        break;
      }
    }
  };

  const playerStats = {
    totalXP: totalPoints,
    completed: submissions.length,
    rank: getLevel() >= 10 ? 'Dev Sênior' : getLevel() >= 5 ? 'Dev Pleno' : 'Dev Júnior'
  };

  const isDark = theme === 'dark';

  // ─── CHALLENGE VIEW ────────────────────────────────────────────────────────
  if (activeView === 'challenge' && selectedChallenge) {
    return (
      <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        {/* Top bar */}
        <div className={`flex items-center justify-between px-6 py-4 border-b-2 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <button
            onClick={() => { setActiveView('map'); setSelectedChallenge(null); play('click'); }}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-7 h-7" />
          </button>
          <div className={`flex-1 mx-6 h-4 rounded-full overflow-hidden border-2 ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300'}`}>
            <div className="h-full w-1/3 bg-green-500 rounded-full transition-all" />
          </div>
          <Hearts lives={lives} timeToNext={timeToNext} />
        </div>

        <AnimatePresence>
          {showAchievement && (
            <AchievementNotification achievement={showAchievement} onClose={() => setShowAchievement(null)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showComplete && (
            <LessonComplete
              points={lastEarnedXP}
              streak={gameProgress?.current_streak || 0}
              onContinue={handleCompleteContinue}
            />
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col">
          <DuolingoChallenge
            challenge={selectedChallenge}
            onComplete={handleChallengeComplete}
            onError={handleChallengeError}
            play={play}
          />
        </div>
      </div>
    );
  }

  // ─── MAIN MAP / OTHER VIEWS ────────────────────────────────────────────────
  
  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <div className="max-w-md mx-auto p-6 text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
            <Code2 className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className={`text-4xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              CodeQuest
            </h1>
            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Aprenda programação de forma gamificada
            </p>
          </div>
          <Button
            onClick={handleLogin}
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-6 text-lg rounded-2xl shadow-lg"
          >
            Entrar com sua Conta
          </Button>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Faça login para começar sua jornada de aprendizado
          </p>
        </div>
      </div>
    );
  }

  return (<>
    {virusPuzzleChallenge && <VirusPuzzle onSolve={handleVirusSolved} />}
    <div className={`min-h-screen flex flex-col max-w-lg mx-auto ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Header */}
      <div className={`border-b-2 px-5 py-4 flex items-center justify-between sticky top-0 z-10 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className={`font-black text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>CodeQuest</span>
        </div>
        <div className="flex items-center gap-2">
          <StreakBadge streak={gameProgress?.current_streak || 0} />
          <div className="flex items-center gap-1 bg-yellow-50 border-2 border-yellow-200 rounded-full px-3 py-1">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="font-black text-yellow-600 text-sm">{totalPoints}</span>
          </div>
          <Hearts lives={lives} timeToNext={timeToNext} />
          {/* Theme toggle */}
          <button
            onClick={() => { toggleTheme(); play('click'); }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {/* Mute toggle */}
          <button
            onClick={() => toggleMute()}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* XP Bar */}
      <div className={`border-b px-5 py-3 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
        <XPBar xp={totalPoints} level={getLevel()} />
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto pb-24">
        {activeView === 'map' && (
          <div className="px-4 py-6 space-y-8">
            {UNITS.map((unit, unitIndex) => {
              const unlocked = isUnitUnlocked(unit.id);
              const unitChallenges = challengesByUnit(unit.id);
              const prog = unitProgress(unit.id);
              return (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: unitIndex * 0.1 }}
                >
                  {/* Unit Header */}
                  <div className={`bg-gradient-to-r ${unit.color} rounded-3xl p-5 mb-4 ${!unlocked ? 'opacity-60 grayscale' : ''}`}>
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <div className="text-2xl mb-1">{unit.icon}</div>
                        <h2 className="font-black text-xl">{unit.label}</h2>
                        <p className="text-white/80 text-sm">{unit.description}</p>
                      </div>
                      <div className="text-right">
                        {unlocked ? (
                          <>
                            <div className="text-3xl font-black">{prog.pct}%</div>
                            <div className="text-white/80 text-sm">{prog.done}/{prog.total} lições</div>
                          </>
                        ) : (
                          <Lock className="w-10 h-10 text-white/60" />
                        )}
                      </div>
                    </div>
                    {unlocked && (
                      <div className="mt-3 h-3 bg-white/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all"
                          style={{ width: `${prog.pct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Challenges */}
                  {unlocked && (
                    <div className="space-y-3 px-2">
                      {unitChallenges.map((challenge) => {
                        const done = completedIds.has(challenge.id);
                        const failed = failedIds.has(challenge.id);
                        const isTheory = challenge.challenge_type === 'theory' || challenge.language === 'theory';
                        const canPlay = !done || failed;
                        const corrupted = corruptedIds.has(challenge.id) && !done;

                        return (
                          <motion.button
                            key={challenge.id}
                            whileTap={{ scale: 0.97 }}
                            animate={corrupted ? { x: [0, -1, 1, -1, 0] } : {}}
                            transition={corrupted ? { repeat: Infinity, duration: 3, repeatDelay: 4 } : {}}
                            onClick={() => canPlay ? handleSelectChallenge(challenge) : toast('✅ Já concluído! Só é possível refazer fases que você errou.', { duration: 2500 })}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                              corrupted
                                ? 'border-purple-600 bg-purple-950/60 hover:border-purple-400'
                                : done && !failed
                                ? isDark ? 'bg-green-900/40 border-green-700 opacity-70' : 'bg-green-50 border-green-300 opacity-80'
                                : failed
                                ? isDark ? 'bg-red-900/30 border-red-700 hover:border-red-500' : 'bg-red-50 border-red-300 hover:border-red-400'
                                : isDark ? 'bg-slate-800 border-slate-600 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                            }`}
                            style={corrupted ? { boxShadow: '0 0 12px rgba(139,0,255,0.35)' } : {}}
                          >
                            {/* Corrupted scanline overlay */}
                            {corrupted && (
                              <motion.div
                                className="absolute inset-0 pointer-events-none rounded-2xl"
                                animate={{ opacity: [0.15, 0.35, 0.15] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{
                                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(120,0,255,0.08) 3px, rgba(120,0,255,0.08) 4px)',
                                }}
                              />
                            )}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                              corrupted ? 'bg-purple-900/80 border border-purple-600' :
                              done && !failed ? 'bg-green-100' : failed ? 'bg-red-100' : isTheory ? 'bg-blue-100' : 'bg-purple-100'
                            }`}>
                              {corrupted ? (
                                <motion.span
                                  animate={{ opacity: [1, 0.5, 1] }}
                                  transition={{ repeat: Infinity, duration: 1 }}
                                  className="text-xl"
                                >🦠</motion.span>
                              ) : done && !failed ? (
                                <Star className="w-6 h-6 text-green-600 fill-green-500" />
                              ) : failed ? (
                                <RotateCcw className="w-6 h-6 text-red-500" />
                              ) : isTheory ? (
                                <BookOpen className="w-6 h-6 text-blue-600" />
                              ) : (
                                <Code2 className="w-6 h-6 text-purple-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-bold text-sm truncate ${
                                corrupted ? 'text-purple-300' :
                                done && !failed ? 'text-green-800' : failed ? isDark ? 'text-red-300' : 'text-red-700' : isDark ? 'text-white' : 'text-slate-900'
                              }`}>
                                {corrupted ? (
                                  <motion.span animate={{ opacity: [1, 0.7, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                                    {'☣'} {challenge.title}
                                  </motion.span>
                                ) : challenge.title}
                              </div>
                              <p className={`text-xs truncate ${corrupted ? 'text-purple-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {corrupted ? '🔒 CORROMPIDO — Desinfecte para jogar' : failed ? '⚠️ Tente novamente' : challenge.description?.slice(0, 55) + '...'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {corrupted ? (
                                <motion.div
                                  animate={{ opacity: [1, 0.6, 1] }}
                                  transition={{ repeat: Infinity, duration: 1.2 }}
                                  className="text-xs font-bold px-2 py-1 rounded-full bg-purple-900/80 text-purple-300 border border-purple-700"
                                >
                                  ⚡ VÍRUS
                                </motion.div>
                              ) : (
                                <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                                  done && !failed ? 'bg-green-200 text-green-700' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {challenge.points} XP
                                </div>
                              )}
                              {canPlay && <ChevronRight className={`w-4 h-4 ${corrupted ? 'text-purple-500' : 'text-slate-400'}`} />}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {!unlocked && (
                    <div className={`text-center py-4 text-sm font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Complete 50% da unidade anterior para desbloquear
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {activeView === 'stats' && (
          <div className="p-4">
            <StatsView playerStats={playerStats} submissions={submissions} challenges={challenges} />
          </div>
        )}
        {activeView === 'ranking' && (
          <div className="p-4">
            <RankingView leaderboard={allProgress} currentUserEmail={user?.email} />
          </div>
        )}
        {activeView === 'profile' && (
          <div className="p-4">
            <ProfileView 
              user={user} 
              playerStats={playerStats} 
              submissions={submissions} 
              challenges={challenges}
              onLogout={() => {
                base44.auth.logout();
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg border-t-2 flex ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
        {[
          { id: 'map', icon: Code2, label: 'Aprender' },
          { id: 'ranking', icon: Trophy, label: 'Ranking' },
          { id: 'stats', icon: BarChart2, label: 'Stats' },
          { id: 'profile', icon: User, label: 'Perfil' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveView(item.id); play('click'); }}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              activeView === item.id ? 'text-green-500' : isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <item.icon className={`w-6 h-6 ${activeView === item.id ? 'stroke-[2.5]' : ''}`} />
            <span className={`text-xs font-bold ${activeView === item.id ? 'text-green-500' : ''}`}>{item.label}</span>
            {activeView === item.id && (
              <motion.div layoutId="nav-indicator" className="absolute bottom-0 h-0.5 w-12 bg-green-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  </>);
}