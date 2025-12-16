import React, { useState, useEffect, useRef } from 'react';
import { Play, Sparkles, Lock, ShieldAlert, Coins, Users, Clock, ShieldCheck, Loader2, UserPlus, LogIn, Globe, ChevronRight, Terminal, Gift, Info, Bell, Trophy, Star, TrendingUp, Zap, Gamepad, Signal } from 'lucide-react';

interface LandingPageProps {
  onLogin: (username: string, game: string) => void;
}

type AuthMode = 'signup' | 'claim';
type Stage = 'idle' | 'processing' | 'locked' | 'verified';

// Dynamic Generator Config
const NAME_PREFIXES = ['Dragon', 'Lucky', 'Fire', 'Super', 'Mega', 'Gold', 'Fish', 'King', 'Master', 'Slot', 'Vegas', 'Royal', 'Star', 'Moon', 'Sun', 'Cyber', 'Neon', 'Rich', 'Big', 'Wild', 'Hot'];
const NAME_SUFFIXES = ['Slayer', 'Winner', '777', '88', '99', 'King', 'Boy', 'Girl', 'Pro', 'X', 'Hunter', 'Master', 'Boss', 'Gamer', 'Whale', 'Pot'];
const PRIZES = [
    { text: '5,000 COINS', color: 'text-yellow-400' },
    { text: 'MINI JACKPOT', color: 'text-red-400' },
    { text: 'INSTANT ACCESS', color: 'text-green-400' },
    { text: '$450.00 CASH', color: 'text-green-400' },
    { text: 'WELCOME BONUS', color: 'text-yellow-400' },
    { text: 'x500 MULTIPLIER', color: 'text-purple-400' },
    { text: '12,500 COINS', color: 'text-yellow-400' },
    { text: 'HUGE WIN', color: 'text-orange-400' },
    { text: 'VIP STATUS', color: 'text-purple-400' }
];
const ACTIONS = ['Claimed', 'Just Won', 'Hit', 'Withdrew', 'Verified', 'Unlocked'];

const AVAILABLE_GAMES = [
    'Fire Kirin',
    'Game Vault',
    'Game Room 777',
    'Vegas Sweeps',
    'RiverSweeps',
    'Blue Dragon',
    'Ocean Dragon',
    'Panda Master',
    'Vpower'
];

// Region Simulation Config
const REGION_CONFIG: Record<string, { latency: number; serverName: string; stepDelay: number; routingLog: string }> = {
    'NA_EAST': { 
        latency: 18, 
        serverName: 'US-EST-VAULT-01', 
        stepDelay: 400,
        routingLog: '> OPTIMIZED ROUTE: DIRECT'
    },
    'NA_WEST': { 
        latency: 52, 
        serverName: 'US-WST-KIRIN-09', 
        stepDelay: 550,
        routingLog: '> REROUTING VIA CALIFORNIA NODES...'
    },
    'EU': { 
        latency: 145, 
        serverName: 'EU-FRA-DRAGON-X', 
        stepDelay: 800,
        routingLog: '> ESTABLISHING TRANSATLANTIC LINK...'
    },
    'ASIA': { 
        latency: 280, 
        serverName: 'AP-TOK-MASTER-88', 
        stepDelay: 1100,
        routingLog: '> HIGH LATENCY DETECTED. BOOSTING SIGNAL...'
    },
};

const generateRandomActivity = () => {
    const prefix = NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)];
    const suffix = NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)];
    const num = Math.floor(Math.random() * 99);
    const user = `${prefix}${suffix}${num}`;
    const prizeObj = PRIZES[Math.floor(Math.random() * PRIZES.length)];
    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    
    return { user, action, prize: prizeObj.text, color: prizeObj.color };
};

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('signup'); 
  const [username, setUsername] = useState('');
  const [selectedGame, setSelectedGame] = useState(AVAILABLE_GAMES[0]);
  const [region, setRegion] = useState('NA_EAST');
  
  // Game Stats Simulation - Dynamic Init
  const [slotsLeft, setSlotsLeft] = useState(() => Math.floor(Math.random() * 15) + 3);
  const [bonusCount, setBonusCount] = useState(50000);
  const [playersOnline, setPlayersOnline] = useState(1429);
  
  // Logic State
  const [stage, setStage] = useState<Stage>('idle');
  const [processLog, setProcessLog] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  
  // Reward Animation State
  const [allocatedPrize, setAllocatedPrize] = useState(0);
  const [showPrizeUI, setShowPrizeUI] = useState(false);
  
  // Live Activity State
  const [currentActivity, setCurrentActivity] = useState(generateRandomActivity());
  
  // Top Ticker State
  const [topTicker, setTopTicker] = useState(generateRandomActivity());
  const [showTicker, setShowTicker] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Scarcity ticker & Top Ticker Rotation
    const timer = setInterval(() => {
        setSlotsLeft(prev => Math.max(2, prev - (Math.random() > 0.8 ? 1 : 0)));
        setPlayersOnline(prev => prev + (Math.random() > 0.5 ? Math.floor(Math.random() * 5) : -Math.floor(Math.random() * 3)));
    }, 2000);

    const activityTimer = setInterval(() => {
        setShowTicker(false);
        setTimeout(() => {
            // Generate FRESH data every time
            const next = generateRandomActivity();
            setTopTicker(next);
            setShowTicker(true);
            
            // Dynamic Bonus Calculation based on "Live Market"
            setBonusCount(prev => {
                const volatility = Math.floor(Math.random() * 1500) - 500; 
                let nextVal = prev + volatility;
                if (nextVal > 58000) nextVal = 50000;
                if (nextVal < 42000) nextVal = 45000;
                return nextVal;
            });

        }, 500);
    }, 3500);

    return () => {
        clearInterval(timer);
        clearInterval(activityTimer);
    };
  }, []);

  // Audio System
  const initAudio = () => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(e => console.log("Audio resume failed", e));
    }
  };

  const playSound = (type: 'tick' | 'coin' | 'alert' | 'count') => {
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'tick') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, t);
          osc.frequency.exponentialRampToValueAtTime(200, t + 0.05);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.05);
          osc.start(t);
          osc.stop(t + 0.05);
      } else if (type === 'coin') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, t);
          osc.frequency.exponentialRampToValueAtTime(1800, t + 0.1);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.5);
          osc.start(t);
          osc.stop(t + 0.5);
      } else if (type === 'alert') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, t);
          osc.frequency.linearRampToValueAtTime(150, t + 0.3);
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.3);
          osc.start(t);
          osc.stop(t + 0.3);
      } else if (type === 'count') {
          // Rapid ticking for counting
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(600, t);
          gain.gain.setValueAtTime(0.02, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.03);
          osc.start(t);
          osc.stop(t + 0.03);
      }
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runProcessingSequence = async () => {
      if (stage !== 'idle') return;
      
      initAudio();

      setStage('processing');
      setProgress(0);
      setShowPrizeUI(false);
      setAllocatedPrize(0);
      setProcessLog(["> ESTABLISHING SECURE CONNECTION..."]);
      playSound('tick');

      const regionSettings = REGION_CONFIG[region] || REGION_CONFIG['NA_EAST'];
      const stepDuration = regionSettings.stepDelay; 
      const totalSteps = 10;

      for (let i = 1; i <= totalSteps; i++) {
          await wait(stepDuration);
          
          const currentPct = i * 10;
          setProgress(currentPct);
          playSound('tick');

          // Dynamic Logs based on Region
          if (i === 1) setProcessLog(p => [...p, `> CONNECTING TO ${selectedGame.toUpperCase()} VIA ${regionSettings.serverName}...`]);
          if (i === 2) setProcessLog(p => [...p, regionSettings.routingLog]);
          if (i === 3) setProcessLog(p => [...p, `> LATENCY: ${regionSettings.latency + Math.floor(Math.random()*15)}ms...`]);
          
          // Trigger Prize Animation at 40%
          if (i === 4) {
              setProcessLog(p => [...p, `> USER ${username.toUpperCase()} AUTHENTICATED`]);
              setShowPrizeUI(true);
          }
          
          // Animate the prize count
          if (i === 5) {
               setProcessLog(p => [...p, "> CALCULATING REWARD..."]);
               const duration = 2500;
               const startTime = performance.now();
               const endValue = bonusCount; 

               const animate = (time: number) => {
                   const elapsed = time - startTime;
                   const progress = Math.min(elapsed / duration, 1);
                   const ease = 1 - Math.pow(1 - progress, 3); 
                   
                   setAllocatedPrize(Math.floor(ease * endValue));
                   
                   if (progress < 1) {
                       if (Math.random() > 0.5) playSound('count');
                       requestAnimationFrame(animate);
                   } else {
                       playSound('coin');
                   }
               };
               requestAnimationFrame(animate);
          }

          if (i === 8) setProcessLog(p => [...p, `> ALLOCATING ${bonusCount.toLocaleString()} COINS...`]);
          if (i === 9) setProcessLog(p => [...p, "> VIP STATUS: ACTIVE"]);
          if (i === 10) setProcessLog(p => [...p, "> SECURITY CHECK REQUIRED..."]);

          // Random background activity
          if (i % 3 === 0) {
              setCurrentActivity(generateRandomActivity());
          }
      }

      await wait(600);
      playSound('alert');
      triggerLocker();
  };

  const triggerLocker = () => {
      setStage('locked');
      if (typeof (window as any)._VR === 'function') {
          (window as any)._VR();
      } else {
          console.log("Locker script not found or blocked.");
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    if (stage === 'verified') {
        setStage('processing');
        initAudio();
        playSound('coin');
        setTimeout(() => onLogin(username, selectedGame), 1000);
        return;
    }

    if (stage === 'idle') {
        runProcessingSequence();
    }
  };

  const handleVerifyCheck = () => {
      setStage('verified');
      initAudio();
      playSound('coin');
      setProcessLog(prev => [...prev, "> VERIFICATION SUCCESSFUL", "> UNLOCKING ASSETS..."]);
      setProgress(100);
      setTimeout(() => {
        onLogin(username, selectedGame);
      }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center relative overflow-y-auto overflow-x-hidden font-sans p-4">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-vault-purple/20 via-black to-black animate-pulse-fast fixed"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-40 fixed"></div>
        
        {/* Urgency Header */}
        <div className="fixed top-0 left-0 right-0 w-full bg-amber-500/10 border-b border-amber-500/30 backdrop-blur-sm p-1.5 md:p-2 flex flex-col md:flex-row justify-center items-center gap-1 md:gap-4 z-50">
            <div className="flex items-center gap-2 animate-pulse">
                <Zap className="w-3 h-3 md:w-4 md:h-4 text-amber-400" />
                <span className="text-amber-100 text-[10px] md:text-xs font-bold tracking-widest uppercase">🔥 RUSH HOUR: 99% CLAIMED - CLAIM YOUR SPOT NOW</span>
            </div>
            <div className="flex items-center gap-2 text-kirin-gold text-[10px] md:text-xs font-mono">
                <Users className="w-3 h-3" />
                <span>{slotsLeft} SLOTS REMAINING</span>
            </div>
        </div>

        <div className="relative z-10 w-full max-w-lg mt-12 mb-8 flex flex-col items-center">
            
            {/* Tiny Winners Ticker */}
            {stage === 'idle' && (
                <div className="h-8 mb-2 flex items-center justify-center overflow-hidden">
                    <div className={`transition-all duration-500 transform ${showTicker ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                        <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 backdrop-blur-md px-3 py-1 rounded-full shadow-lg">
                             <div className="bg-green-500/20 p-1 rounded-full">
                                <TrendingUp className="w-3 h-3 text-green-400" />
                             </div>
                             <span className="text-[10px] md:text-xs text-gray-300 font-medium">
                                <span className="font-bold text-white">{topTicker.user}</span> just won <span className={`${topTicker.color} font-bold`}>{topTicker.prize}</span>
                             </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="text-center mb-6 w-full">
                 <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-fuchsia-300 via-vault-purple to-indigo-500 arcade-font drop-shadow-[0_2px_4px_rgba(124,58,237,0.5)] mb-2">
                    ONGAMES PLATFORM
                </h1>
                <p className="text-vault-purple font-bold tracking-widest text-[10px] md:text-sm uppercase mb-4">Official Web Portal</p>
                
                {/* Bonus Badge - Dynamic */}
                {stage === 'idle' && (
                    <div className="inline-flex items-center gap-3 bg-gradient-to-r from-slate-900 to-slate-800 border border-vault-purple/50 rounded-full px-4 py-2 md:px-6 shadow-[0_0_20px_rgba(139,92,246,0.2)] max-w-full transition-all duration-500">
                        <div className="relative">
                            <Coins className="w-6 h-6 text-yellow-400 animate-bounce shrink-0" />
                            <Zap className="w-3 h-3 text-white absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <div className="text-left leading-tight">
                            <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                                Pending Bonus <span className="text-green-500 text-[9px] animate-pulse">● LIVE</span>
                            </div>
                            <div className="text-lg md:text-xl font-black text-white tabular-nums transition-all duration-300">
                                {bonusCount.toLocaleString()} <span className="text-xs text-yellow-500">COINS</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Card */}
            <div className="w-full bg-slate-900/95 backdrop-blur-xl border border-vault-purple/20 rounded-3xl overflow-hidden shadow-2xl relative min-h-[400px]">
                
                {/* Mode Tabs */}
                {stage === 'idle' && (
                    <div className="flex border-b border-white/5">
                        <button 
                            onClick={() => setAuthMode('signup')}
                            className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${authMode === 'signup' ? 'bg-vault-purple/20 text-vault-purple border-b-2 border-vault-purple' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                        >
                            <UserPlus className="w-4 h-4" /> Sign Up
                        </button>
                        <button 
                            onClick={() => setAuthMode('claim')}
                            className={`flex-1 py-4 text-xs md:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${authMode === 'claim' ? 'bg-kirin-gold/10 text-kirin-gold border-b-2 border-kirin-gold' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                        >
                            <Gift className="w-4 h-4" /> Claim
                        </button>
                    </div>
                )}

                <div className="p-6 md:p-8 flex flex-col justify-center h-full">
                    {/* Processing Overlay */}
                    {stage === 'processing' && (
                        <div className="absolute inset-0 bg-slate-900 z-20 flex flex-col items-center justify-between p-6">
                            
                            {/* Top: Live Activity (Smaller) */}
                            <div className="w-full">
                                <div className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center gap-3 shadow-lg mb-4">
                                    <div className="bg-slate-800 p-1.5 rounded-full border border-white/10">
                                        <Bell className="w-3 h-3 text-vault-purple animate-[ring_3s_infinite]" />
                                    </div>
                                    <div className="flex-1 min-w-0 flex items-center justify-between">
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Live</div>
                                        <div className="text-[10px] text-white truncate flex items-center gap-2 key={currentActivity.user} animate-in fade-in">
                                            <span className="font-bold text-gray-300">{currentActivity.user}</span> 
                                            <span className={`font-black ${currentActivity.color}`}>{currentActivity.prize}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center: Dynamic Reward Display */}
                            <div className="flex-1 flex flex-col items-center justify-center w-full">
                                {showPrizeUI ? (
                                    <div className="flex flex-col items-center animate-in zoom-in slide-in-from-bottom-8 duration-500">
                                        <div className="text-vault-purple font-bold text-[10px] uppercase tracking-[0.2em] mb-3 animate-pulse">Allocating Reward To</div>
                                        <div className="text-xl md:text-2xl font-black text-white mb-6 bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-2 rounded-xl border border-white/20 shadow-inner flex items-center gap-2">
                                            <UserPlus className="w-4 h-4 text-gray-400" />
                                            {username.toUpperCase()}
                                        </div>
                                        
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-20 animate-pulse group-hover:opacity-30 transition"></div>
                                            <div className="flex items-center gap-2 text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] scale-110 transform transition">
                                                <span className="tabular-nums tracking-tighter">{allocatedPrize.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 mt-2">
                                                <Coins className="w-5 h-5 text-yellow-400 animate-spin-slow" />
                                                <span className="text-yellow-200/80 text-sm font-bold tracking-[0.2em]">COINS</span>
                                            </div>
                                        </div>
                                        
                                        {/* Reward Checklist */}
                                        <div className="mt-8 space-y-2 w-full max-w-xs">
                                            <div className={`flex justify-between items-center text-xs p-2 rounded border transition-all duration-500 ${allocatedPrize > 0 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'border-transparent text-gray-600'}`}>
                                                <span className="font-bold">BONUS PACKAGE</span>
                                                {allocatedPrize > 0 && <ShieldCheck className="w-3 h-3" />}
                                            </div>
                                            <div className={`flex justify-between items-center text-xs p-2 rounded border transition-all duration-500 delay-100 ${allocatedPrize > 25000 ? 'bg-vault-purple/10 border-vault-purple/30 text-vault-purple' : 'border-transparent text-gray-600'}`}>
                                                <span className="font-bold">VIP STATUS</span>
                                                {allocatedPrize > 25000 && <Trophy className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Terminal className="w-16 h-16 text-vault-purple animate-pulse opacity-50" />
                                )}
                            </div>
                            
                            {/* Bottom: Progress & Log */}
                            <div className="w-full mt-4">
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3 border border-slate-700 relative">
                                    <div 
                                        className="h-full bg-gradient-to-r from-vault-purple to-indigo-400 transition-all duration-300 ease-out relative"
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute right-0 top-0 h-full w-2 bg-white/80 animate-pulse box-shadow-[0_0_10px_white]"></div>
                                    </div>
                                </div>
                                <div className="font-mono text-[9px] text-green-400/80 text-center h-4 overflow-hidden">
                                    {processLog[processLog.length - 1]}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Locker / Verification State */}
                    {stage === 'locked' && (
                        <div className="text-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500 animate-pulse">
                                <ShieldAlert className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-white mb-2 uppercase">Security Check Required</h2>
                            <p className="text-gray-400 text-xs md:text-sm mb-6">
                                We detected unusual network activity. To protect your {authMode === 'signup' ? 'sign up bonus' : 'account'}, please verify you are human.
                            </p>

                            <button 
                                onClick={handleVerifyCheck}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group text-sm md:text-base"
                            >
                                <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition" />
                                I HAVE COMPLETED VERIFICATION
                            </button>
                        </div>
                    )}

                    {/* Input Forms */}
                    {stage === 'idle' && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-5">
                            {authMode === 'signup' && (
                                <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-xl mb-1 flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-purple-300 font-bold text-xs uppercase">Limited Time Offer</div>
                                        <div className="text-purple-200/80 text-[10px] leading-tight">
                                            Creating a new ID grants instant VIP status and priority server access.
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Game Selection */}
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1 mb-1 block">
                                        Select Game Platform
                                    </label>
                                    <div className="relative">
                                        <select 
                                            value={selectedGame}
                                            onChange={(e) => setSelectedGame(e.target.value)}
                                            className="w-full bg-black/60 border-2 border-slate-700 rounded-xl px-4 py-4 text-white font-bold appearance-none focus:border-vault-purple focus:outline-none text-sm md:text-base"
                                        >
                                            {AVAILABLE_GAMES.map(game => (
                                                <option key={game} value={game}>{game}</option>
                                            ))}
                                        </select>
                                        <Gamepad className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1 mb-1 block">
                                        {authMode === 'signup' ? 'Choose Agent Alias' : 'Enter Player ID'}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-black/60 border-2 border-slate-700 rounded-xl px-4 py-4 text-white font-bold focus:border-vault-purple focus:outline-none focus:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all placeholder:text-gray-700 text-sm md:text-base"
                                        placeholder={authMode === 'signup' ? "NEW USERNAME" : "EXISTING ID"}
                                        maxLength={12}
                                    />
                                </div>

                                {authMode === 'signup' && (
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider ml-1 mb-1 block flex items-center justify-between">
                                            <span>Server Region</span>
                                            <span className="text-[9px] text-green-500 flex items-center gap-1"><Signal className="w-2 h-2" /> {REGION_CONFIG[region].latency}ms</span>
                                        </label>
                                        <div className="relative">
                                            <select 
                                                value={region}
                                                onChange={(e) => setRegion(e.target.value)}
                                                className="w-full bg-black/60 border-2 border-slate-700 rounded-xl px-4 py-4 text-white font-bold appearance-none focus:border-vault-purple focus:outline-none text-sm md:text-base"
                                            >
                                                <option value="NA_EAST">North America (East)</option>
                                                <option value="NA_WEST">North America (West)</option>
                                                <option value="EU">Europe</option>
                                                <option value="ASIA">Asia Pacific</option>
                                            </select>
                                            <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                disabled={!username.trim()}
                                className="group relative w-full bg-gradient-to-r from-kirin-gold to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-black text-lg md:text-xl py-4 md:py-5 rounded-xl shadow-[0_0_20px_rgba(255,165,0,0.4)] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale overflow-hidden mt-2"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite]"></div>
                                <span className="flex items-center justify-center gap-2">
                                    {authMode === 'signup' ? 'CREATE ID & CLAIM' : 'CLAIM REWARD'} 
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                                </span>
                            </button>
                        </form>
                    )}
                </div>
                
                {/* Footer Status */}
                <div className="bg-black/50 p-3 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-mono rounded-b-3xl">
                    <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${stage === 'locked' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                        {stage === 'locked' ? 'SYSTEM ALERT' : 'SYSTEM ONLINE'}
                    </span>
                    <span>V.2.4.1</span>
                </div>
            </div>
            
            <div className="mt-6 text-center w-full">
                 <div className="inline-flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/10 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] md:text-xs text-gray-300 font-mono font-bold tracking-wider">{playersOnline.toLocaleString()} PLAYERS ONLINE</span>
                 </div>
                 <p className="text-[10px] text-gray-600">
                    By accessing OnGames Platform, you agree to the virtual terms of service. 
                    <br/>Anti-cheat protocols are enforced globally.
                 </p>
            </div>
        </div>

        {/* Toast Notification for Locker */}
        {stage === 'locked' && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-900/90 backdrop-blur-xl border border-vault-purple/20 p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.6)] flex items-start gap-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="bg-vault-purple/10 p-2 rounded-full shrink-0">
                    <Info className="w-5 h-5 text-vault-purple" />
                </div>
                <div className="flex-1">
                    <h4 className="text-vault-purple font-bold text-xs uppercase mb-1 tracking-wider">Verification Pending</h4>
                    <p className="text-gray-300 text-xs leading-relaxed font-medium">
                        Once verification is complete, the window will close automatically and your bonus will be credited.
                    </p>
                </div>
                {/* Loading Indicator */}
                <div className="shrink-0">
                    <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
                </div>
            </div>
        )}
    </div>
  );
};

export default LandingPage;