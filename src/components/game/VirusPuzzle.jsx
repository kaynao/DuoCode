import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Eye, Keyboard, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── PUZZLE 1: Caça ao Vírus ──────────────────────────────────────────────────
function VirusHuntPuzzle({ onSolve }) {
  const files = ['sys32.dll', 'kernel.exe', 'boot.cfg', 'virus.exe', 'net.dll',
    'clean.bat', 'MALWARE.bin', 'readme.txt', 'trojan.js', 'safe.log',
    'explorer.exe', 'hack.py', 'config.json', 'worm.vbs', 'backup.zip'];
  const infected = new Set(['virus.exe', 'MALWARE.bin', 'trojan.js', 'hack.py', 'worm.vbs']);

  const [clicked, setClicked] = useState(new Set());
  const [wrong, setWrong] = useState(null);
  const [solved, setSolved] = useState(false);

  const handleClick = (file) => {
    if (infected.has(file)) {
      const next = new Set([...clicked, file]);
      setClicked(next);
      if ([...infected].every(f => next.has(f))) {
        setSolved(true);
        setTimeout(onSolve, 800);
      }
    } else {
      setWrong(file);
      setTimeout(() => setWrong(null), 600);
    }
  };

  const remaining = [...infected].filter(f => !clicked.has(f)).length;

  return (
    <div className="space-y-4">
      <p className="text-purple-200 text-sm text-center">Clique apenas nos arquivos <span className="text-red-400 font-bold">infectados</span> para eliminá-los</p>
      <div className="text-center text-purple-300 text-xs font-semibold">{remaining} vírus restantes</div>
      <div className="grid grid-cols-3 gap-2">
        {files.map(file => {
          const isInfected = infected.has(file);
          const isDone = clicked.has(file);
          const isWrong = wrong === file;
          return (
            <motion.button
              key={file}
              animate={isWrong ? { x: [-4, 4, -4, 4, 0] } : {}}
              transition={{ duration: 0.3 }}
              onClick={() => !isDone && handleClick(file)}
              disabled={isDone}
              className={`p-2 rounded-lg text-xs font-mono border transition-all ${
                isDone ? 'bg-green-900/40 border-green-600 text-green-400 line-through opacity-50' :
                isWrong ? 'bg-red-900/60 border-red-500 text-red-300' :
                isInfected ? 'bg-slate-800 border-red-800/50 text-slate-300 hover:border-red-500 hover:bg-red-900/20' :
                'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              {isDone ? '✓' : isInfected ? '⚠️' : '📄'} {file}
            </motion.button>
          );
        })}
      </div>
      {solved && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center text-green-400 font-bold text-lg">✓ Sistema limpo!</motion.div>}
    </div>
  );
}

// ── PUZZLE 2: Jogo da Memória ────────────────────────────────────────────────
function MemoryPuzzle({ onSolve }) {
  const symbols = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠'];
  const [cards] = useState(() => {
    const pairs = [...symbols, ...symbols].map((s, i) => ({ id: i, symbol: s, flipped: false, matched: false }));
    return pairs.sort(() => Math.random() - 0.5);
  });
  const [board, setBoard] = useState(cards);
  const [flipped, setFlipped] = useState([]);
  const [locked, setLocked] = useState(false);

  const handleFlip = (idx) => {
    if (locked || board[idx].flipped || board[idx].matched) return;
    const newBoard = board.map((c, i) => i === idx ? { ...c, flipped: true } : c);
    setBoard(newBoard);
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      const [a, b] = newFlipped;
      if (newBoard[a].symbol === newBoard[b].symbol) {
        const matched = newBoard.map((c, i) => newFlipped.includes(i) ? { ...c, matched: true } : c);
        setBoard(matched);
        setFlipped([]);
        setLocked(false);
        if (matched.every(c => c.matched)) setTimeout(onSolve, 600);
      } else {
        setTimeout(() => {
          setBoard(b2 => b2.map((c, i) => newFlipped.includes(i) ? { ...c, flipped: false } : c));
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-purple-200 text-sm text-center">Encontre todos os <span className="text-yellow-400 font-bold">pares</span> para limpar o sistema</p>
      <div className="grid grid-cols-4 gap-2">
        {board.map((card, idx) => (
          <motion.button
            key={card.id}
            onClick={() => handleFlip(idx)}
            animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className={`h-14 rounded-xl border-2 text-xl flex items-center justify-center transition-colors ${
              card.matched ? 'bg-green-900/50 border-green-500' :
              card.flipped ? 'bg-purple-900/60 border-purple-500' :
              'bg-slate-800 border-slate-600 hover:border-purple-400'
            }`}
          >
            {(card.flipped || card.matched) ? card.symbol : '?'}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── PUZZLE 3: Clique Rápido nos Vírus ───────────────────────────────────────
function ClickVirusPuzzle({ onSolve }) {
  const [viruses, setViruses] = useState([]);
  const [score, setScore] = useState(0);
  const [escaped, setEscaped] = useState(0);
  const goal = 8;
  const maxEscape = 4;
  const idRef = useRef(0);

  const spawnVirus = useCallback(() => {
    const id = idRef.current++;
    const x = 5 + Math.random() * 85;
    const y = 5 + Math.random() * 85;
    setViruses(v => [...v, { id, x, y }]);
    setTimeout(() => {
      setViruses(v => {
        if (v.find(vv => vv.id === id)) {
          setEscaped(e => e + 1);
          return v.filter(vv => vv.id !== id);
        }
        return v;
      });
    }, 2200);
  }, []);

  useEffect(() => {
    const interval = setInterval(spawnVirus, 700);
    return () => clearInterval(interval);
  }, [spawnVirus]);

  useEffect(() => {
    if (score >= goal) onSolve();
  }, [score, onSolve]);

  const clickVirus = (id) => {
    setViruses(v => v.filter(vv => vv.id !== id));
    setScore(s => s + 1);
  };

  const failed = escaped >= maxEscape;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm font-semibold px-1">
        <span className="text-green-400">Eliminados: {score}/{goal}</span>
        <span className={escaped > 0 ? 'text-red-400' : 'text-slate-400'}>Escaparam: {escaped}/{maxEscape}</span>
      </div>
      <div className="relative bg-slate-900 rounded-xl border-2 border-purple-800 overflow-hidden" style={{ height: 220 }}>
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-red-400 font-bold">Vírus escaparam! Tente novamente</p>
            <Button size="sm" onClick={() => { setScore(0); setEscaped(0); setViruses([]); }} className="bg-purple-600 hover:bg-purple-500">Reiniciar</Button>
          </div>
        ) : (
          <>
            {viruses.map(v => (
              <motion.button
                key={v.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => clickVirus(v.id)}
                style={{ position: 'absolute', left: `${v.x}%`, top: `${v.y}%`, transform: 'translate(-50%,-50%)' }}
                className="text-2xl hover:scale-110 transition-transform cursor-pointer select-none"
              >
                🦠
              </motion.button>
            ))}
            <div className="absolute bottom-2 left-0 right-0 text-center text-purple-400/40 text-xs pointer-events-none">
              Clique nos vírus antes que escapem!
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── PUZZLE 4: Desafio de Digitação ───────────────────────────────────────────
function TypingPuzzle({ onSolve }) {
  const commands = [
    'sudo rm -rf /virus',
    'antivirus --scan --clean',
    'firewall enable --strict',
    'system restore --safe',
    'delete malware.exe',
  ];
  const [cmd] = useState(() => commands[Math.floor(Math.random() * commands.length)]);
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    const val = e.target.value;
    setTyped(val);
    if (val === cmd) {
      setDone(true);
      setTimeout(onSolve, 500);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-purple-200 text-sm text-center">Digite o comando de limpeza <span className="text-yellow-400 font-bold">exatamente</span> como mostrado</p>
      <div className="bg-black/60 rounded-xl p-4 border border-purple-700 font-mono text-center">
        <span className="text-green-400 text-sm select-none">$ </span>
        <span className="text-white text-sm font-bold tracking-wide">{cmd}</span>
      </div>
      <div className="relative">
        <input
          type="text"
          value={typed}
          onChange={handleChange}
          autoFocus
          placeholder="Digite aqui..."
          className={`w-full bg-slate-900 border-2 rounded-xl px-4 py-3 font-mono text-sm text-white outline-none transition-colors ${
            done ? 'border-green-500 text-green-400' :
            typed.length > 0 && !cmd.startsWith(typed) ? 'border-red-500' :
            'border-purple-600 focus:border-purple-400'
          }`}
        />
        {done && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-xl">✓</motion.div>
        )}
      </div>
      <div className="flex gap-1">
        {cmd.split('').map((char, i) => (
          <div key={i} className={`w-3 h-1 rounded-full transition-colors ${i < typed.length ? (typed[i] === char ? 'bg-green-500' : 'bg-red-500') : 'bg-slate-700'}`} />
        ))}
      </div>
    </div>
  );
}

// ── PUZZLE 5: Sequência de Símbolos ──────────────────────────────────────────
function SequencePuzzle({ onSolve }) {
  const SYMBOLS = ['▲', '●', '■', '◆', '★'];
  const [sequence] = useState(() => Array.from({ length: 4 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]));
  const [phase, setPhase] = useState('show'); // show | input
  const [input, setInput] = useState([]);
  const [highlight, setHighlight] = useState(-1);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (phase !== 'show') return;
    let i = 0;
    const showNext = () => {
      if (i < sequence.length) {
        setHighlight(i);
        i++;
        setTimeout(() => { setHighlight(-1); setTimeout(showNext, 300); }, 600);
      } else {
        setTimeout(() => setPhase('input'), 400);
      }
    };
    const t = setTimeout(showNext, 600);
    return () => clearTimeout(t);
  }, [phase, sequence]);

  const handleInput = (sym) => {
    const next = [...input, sym];
    setInput(next);
    if (sym !== sequence[next.length - 1]) {
      setError(true);
      setTimeout(() => { setInput([]); setError(false); setPhase('show'); }, 900);
      return;
    }
    if (next.length === sequence.length) {
      setTimeout(onSolve, 500);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-purple-200 text-sm text-center">
        {phase === 'show' ? 'Memorize a sequência...' : <span className="text-yellow-400 font-bold">Repita a sequência!</span>}
      </p>
      <div className="flex justify-center gap-3">
        {sequence.map((sym, i) => (
          <motion.div
            key={i}
            animate={highlight === i ? { scale: 1.4, backgroundColor: '#7c3aed' } : { scale: 1 }}
            className="w-12 h-12 rounded-xl bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-xl"
          >
            {phase === 'show' || input.length > i ? sym : '?'}
          </motion.div>
        ))}
      </div>
      {phase === 'input' && (
        <div className="flex justify-center gap-3 flex-wrap">
          {SYMBOLS.map(sym => (
            <motion.button
              key={sym}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleInput(sym)}
              className={`w-14 h-14 rounded-xl text-2xl border-2 transition-colors ${
                error ? 'border-red-600 bg-red-900/40' : 'bg-slate-800 border-purple-600 hover:border-purple-400 hover:bg-purple-900/30'
              }`}
            >
              {sym}
            </motion.button>
          ))}
        </div>
      )}
      <div className="flex justify-center gap-1">
        {sequence.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i < input.length ? 'bg-purple-500' : 'bg-slate-700'}`} />
        ))}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const PUZZLES = [
  { id: 'hunt', label: 'Caça ao Vírus', icon: Eye, component: VirusHuntPuzzle },
  { id: 'memory', label: 'Jogo da Memória', icon: Grid3x3, component: MemoryPuzzle },
  { id: 'click', label: 'Clique Rápido', icon: Zap, component: ClickVirusPuzzle },
  { id: 'typing', label: 'Comando de Limpeza', icon: Keyboard, component: TypingPuzzle },
  { id: 'sequence', label: 'Sequência Secreta', icon: Shield, component: SequencePuzzle },
];

export default function VirusPuzzle({ onSolve }) {
  const [puzzle] = useState(() => PUZZLES[Math.floor(Math.random() * PUZZLES.length)]);
  const [solved, setSolved] = useState(false);

  const handleSolve = () => {
    setSolved(true);
    setTimeout(onSolve, 1200);
  };

  const PuzzleComponent = puzzle.component;
  const PuzzleIcon = puzzle.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10, 0, 30, 0.92)', backdropFilter: 'blur(6px)' }}
    >
      {/* Glitch scanlines */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(120,0,255,0.03) 2px, rgba(120,0,255,0.03) 4px)',
      }} />

      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden border-2 border-purple-600"
        style={{ background: 'linear-gradient(135deg, #0f0820 0%, #1a0535 100%)', boxShadow: '0 0 60px rgba(120,0,255,0.4)' }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-purple-800/60">
          <div className="flex items-center gap-3 mb-1">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-10 h-10 rounded-xl bg-purple-900/80 border border-purple-600 flex items-center justify-center"
            >
              <PuzzleIcon className="w-5 h-5 text-purple-300" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-red-400 text-xs font-bold tracking-widest uppercase">⚠ VÍRUS DETECTADO</span>
              </div>
              <h3 className="text-white font-black text-base">{puzzle.label}</h3>
            </div>
          </div>
          <p className="text-purple-400 text-xs">Desinfecte o sistema para desbloquear esta fase</p>
        </div>

        {/* Puzzle content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {solved ? (
              <motion.div
                key="solved"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center gap-3 py-8"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: 2, duration: 0.4 }}
                  className="text-6xl"
                >
                  🛡️
                </motion.div>
                <p className="text-green-400 font-black text-xl">Sistema desinfectado!</p>
                <p className="text-purple-300 text-sm">Fase desbloqueada com sucesso</p>
              </motion.div>
            ) : (
              <motion.div key="puzzle">
                <PuzzleComponent onSolve={handleSolve} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}