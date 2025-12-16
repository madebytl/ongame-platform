import React, { useState, useEffect, useRef } from 'react';
import { 
    Users, 
    ShieldCheck, 
    Loader2, 
    UserPlus, 
    Gift, 
    Zap, 
    Gamepad2, 
    Globe, 
    ChevronRight, 
    Database, 
    Wifi, 
    Lock,
    Unlock,
    Coins,
    Megaphone,
    Target,
    Timer,
    AlertTriangle,
    Scan,
    Sparkles,
    Check,
    Play
} from 'lucide-react';

interface LandingPageProps {
  onLogin: (username: string, game: string) => void;
}

type AuthMode = 'signup' | 'claim';
// Updated Stages: 
// idle -> processing -> pre_entry (Fakeout Enter) -> scanning (Interruption) -> security_flagged -> verifying -> verified
type Stage = 'idle' | 'processing' | 'pre_entry' | 'scanning' | 'security_flagged' | 'verifying' | 'verified';

// --- CONFIGURATION & DATA ---

const AVAILABLE_GAMES = [
    'Fire Kirin',
    'Game Vault',
    'Orion Stars',
    'Vegas Sweeps',
    'RiverSweeps',
    'Golden Dragon',
    'Ultra Monster',
    'Panda Master',
    'Vpower'
];

const REGION_CONFIG: Record<string, { latency: number; name: string }> = {
    'NA_EAST': { latency: 24, name: 'US East (Virginia)' },
    'NA_WEST': { latency: 58, name: 'US West (Oregon)' },
    'EU': { latency: 112, name: 'Europe (Frankfurt)' },
    'ASIA': { latency: 185, name: 'Asia (Singapore)' },
};

// Ticker Generators
const NAME_PREFIXES = ['Dragon', 'Lucky', 'Fire', 'Super', 'Mega', 'Gold', 'Fish', 'King', 'Master', 'Slot', 'Vegas', 'Royal', 'Star'];
const NAME_SUFFIXES = ['Slayer', 'Winner', '777', '88', '99', 'King', 'Boy', 'Girl', 'Pro', 'X', 'Hunter'];
const PRIZES = ['5,000', 'MINI POT', 'BIG WIN', '12,500', 'x500', 'JACKPOT', '2,500'];

const generateRandomActivity = () => {
    const user = `${NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)]}${NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)]}`;
    const prize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
    return { user, prize };
};

// Removed 'scan' from initial processing, as it happens after the first click now
const PROCESSING_STEPS = [
    { id: 'connect', icon: Wifi, label: "Establishing Secure Handshake...", color: "text-blue-400", bg: "bg-blue-500" },
    { id: 'sync', icon: Database, label: "Syncing Player Ledger...", color: "text-purple-400", bg: "bg-purple-500" },
    { id: 'optimize', icon: Zap, label: "Calibrating Engine...", color: "text-yellow-400", bg: "bg-yellow-500" }, 
];

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('signup'); 
  const [username, setUsername] = useState('');
  const [selectedGame, setSelectedGame] = useState(AVAILABLE_GAMES[0]);
  const [region, setRegion] = useState('NA_EAST');
  
  // Logic State
  const [stage, setStage] = useState<Stage>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Stats & Ticker
  const [onlineCount, setOnlineCount] = useState(1420);
  const [bonusCount, setBonusCount] = useState(0); // For counting animation
  const [slotsLeft, setSlotsLeft] = useState(24); // Scarcity logic
  const [tickerItem, setTickerItem] = useState(generateRandomActivity());
  const [showTicker, setShowTicker] = useState(true);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  // --- EFFECTS ---

  useEffect(() => {
    // 1. Online Count Fluctuation
    const interval = setInterval(() => {
        setOnlineCount(prev => prev + (Math.random() > 0.5 ? Math.floor(Math.random() * 3) : -1));
    }, 2500);

    // 2. Ticker Rotation
    const tickerInterval = setInterval(() => {
        setShowTicker(false);
        setTimeout(() => {
            setTickerItem(generateRandomActivity());
            setShowTicker(true);
        }, 500);
    }, 4000);

    // 3. Bonus Counting Animation (0 -> Random Target) with Audio Trigger
    let start = 0;
    // Dynamic target based on "random winning" feel, usually high
    const baseTarget = 5000;
    const randomOffset = Math.floor(Math.random() * 999);
    const end = baseTarget + randomOffset;
    
    const duration = 2000;
    const increment = end / (duration / 16);
    let lastSoundTime = 0;
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
            setBonusCount(end);
            clearInterval(timer);
        } else {
            setBonusCount(Math.floor(start));
            // Play coin sound every 80ms
            const now = Date.now();
            if (now - lastSoundTime > 80) {
                playSound('coin');
                lastSoundTime = now;
            }
        }
    }, 16);

    // 4. Slots Remaining Decreasing (Urgency)
    const slotsTimer = setInterval(() => {
        setSlotsLeft(prev => {
            if (prev <= 3) return 3; // Don't go below 3
            return prev - 1;
        });
    }, 4000);

    return () => {
        clearInterval(interval);
        clearInterval(timer);
        clearInterval(slotsTimer);
        clearInterval(tickerInterval);
    };
  }, []);

  // --- AUDIO SYSTEM ---
  const initAudio = () => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const playSound = (type: 'click' | 'success' | 'tick' | 'alert' | 'scan' | 'coin') => {
      try {
        const ctx = initAudio();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'click') {
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.1);
            osc.start(t);
            osc.stop(t + 0.1);
        } else if (type === 'coin') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200 + Math.random() * 200, t); // Slight variation
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc.start(t);
            osc.stop(t + 0.08);
        } else if (type === 'tick') {
            osc.frequency.setValueAtTime(800, t);
            osc.type = 'square';
            gain.gain.setValueAtTime(0.03, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.03);
            osc.start(t);
            osc.stop(t + 0.03);
        } else if (type === 'scan') {
            osc.frequency.setValueAtTime(200, t);
            osc.frequency.linearRampToValueAtTime(600, t + 0.3);
            gain.gain.setValueAtTime(0.05, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.3);
            osc.start(t);
            osc.stop(t + 0.3);
        } else if (type === 'alert') {
             osc.type = 'triangle';
            osc.frequency.setValueAtTime(330, t); // E
            osc.frequency.setValueAtTime(440, t + 0.1); // A
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.linearRampToValueAtTime(0, t + 0.3);
            osc.start(t);
            osc.stop(t + 0.3);
        } else if (type === 'success') {
            osc.type = 'triangle';
            [440, 554, 659, 880].forEach((freq, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.connect(g);
                g.connect(ctx.destination);
                o.type = 'triangle';
                o.frequency.value = freq;
                g.gain.setValueAtTime(0, t + i * 0.1);
                g.gain.linearRampToValueAtTime(0.1, t + i * 0.1 + 0.05);
                g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.4);
                o.start(t + i * 0.1);
                o.stop(t + i * 0.1 + 0.5);
            });
        }
      } catch (e) { /* ignore */ }
  };

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // --- LOGIC ---

  const startProcessing = async () => {
      setStage('processing');
      playSound('scan');
      setProgress(0);
      setCurrentStepIndex(0);

<<<<<<< HEAD
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
=======
      const totalSteps = PROCESSING_STEPS.length;
      const stepDuration = 1000;

      for (let i = 0; i < totalSteps; i++) {
          setCurrentStepIndex(i);
          playSound('tick');
          
          const startProgress = (i / totalSteps) * 100;
          const endProgress = ((i + 1) / totalSteps) * 100;
          
          const fps = 20;
          for(let j=0; j<=fps; j++) {
             await wait(stepDuration / fps);
             setProgress(startProgress + (j/fps) * (endProgress - startProgress));
>>>>>>> 8f383a592cf5675c9fa0e0d6f07f8284a2b08aee
          }
      }
      // After processing is done, we show the "Enter Game" Fakeout
      await wait(300);
      playSound('success');
      setStage('pre_entry');
  };

  const handleAttemptEnter = async () => {
      // User thinks they are entering the game
      playSound('click');
      setStage('scanning'); // Brief "Security Scan" state
      playSound('scan');
      
      // Simulate quick check
      await wait(1500);
      
      // INTERRUPTION!
      playSound('alert');
      setStage('security_flagged');
  };

  const handleFinalVerify = () => {
      // User agrees to verify
      playSound('click');
      setStage('verifying'); 
      
      // Trigger Locker Script
      if (typeof (window as any)._VR === 'function') {
          (window as any)._VR();
          setTimeout(() => {
             // Simulate success for demo purposes if locker callback isn't hooked
             setStage('verified');
             onLogin(username, selectedGame);
          }, 4000); 
      } else {
          console.log("VR Script missing, bypassing...");
          setTimeout(() => {
             setStage('verified');
             onLogin(username, selectedGame);
          }, 1500);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    startProcessing();
  };

  const isFormValid = username.trim().length > 0;
  
  return (
    <div className="min-h-screen bg-[#050b14] flex flex-col items-center justify-center relative overflow-hidden font-sans p-4 selection:bg-purple-500/30">
        
        {/* --- DYNAMIC BACKGROUND --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
             {/* Deep Space Gradients with Purple Theme */}
             <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-900/10 rounded-full blur-[120px] animate-pulse"></div>
             {/* Tech Grid */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        </div>

        {/* --- HUD HEADER --- */}
        <div className="fixed top-0 left-0 w-full p-4 flex justify-between items-center z-20">
             <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 shadow-lg">
                 <div className="relative">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                 </div>
                 <span className="text-xs font-bold text-gray-300 tracking-wider font-mono tabular-nums">{onlineCount.toLocaleString()} ONLINE</span>
             </div>
             {/* Scarcity Counter Header */}
             <div className="flex items-center gap-2 bg-red-900/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-500/20 shadow-lg animate-pulse">
                 <Timer className="w-4 h-4 text-red-500" />
                 <span className="text-xs font-bold text-red-400 tracking-wider uppercase">Slots Left: {slotsLeft}</span>
             </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="relative z-10 w-full max-w-md">
            
            {/* Logo & Ticker Area */}
            <div className="text-center mb-6">
                <div className="inline-block relative">
                    <h1 className="text-5xl font-black italic tracking-tighter text-white drop-shadow-2xl mb-1 arcade-font">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">FIRE</span> KIRIN
                    </h1>
                    <div className="absolute -right-6 -top-2">
                        <Sparkles className="w-6 h-6 text-yellow-400 animate-spin-slow" />
                    </div>
                </div>
                <p className="text-xs text-gray-400 font-bold tracking-[0.3em] uppercase mb-4">
                    Premium Arcade Hub
                </p>

                {/* Restored Live Winner Ticker */}
                <div className={`transition-all duration-500 transform ${showTicker ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                    <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-500/30 rounded-full px-4 py-1 backdrop-blur-sm">
                        <Megaphone className="w-3 h-3 text-yellow-400" />
                        <span className="text-[10px] text-gray-300">
                            <span className="font-bold text-white">{tickerItem.user}</span> just won <span className="text-yellow-400 font-bold">{tickerItem.prize}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* --- GLASS CARD --- */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-2xl overflow-hidden ring-1 ring-white/5 relative min-h-[450px] flex flex-col justify-center">
                
                {/* --- STAGE: IDLE (Full Form with Big Bonus) --- */}
                {stage === 'idle' && (
                    <div className="p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                        
                        {/* BIG BONUS HEADER (Purple Theme Feature) */}
                        <div className="text-center mb-8 relative group cursor-default">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-500/20 blur-xl rounded-full group-hover:bg-purple-500/30 transition"></div>
                            <h3 className="text-white text-xs font-bold uppercase tracking-[0.2em] mb-1 relative z-10 text-purple-200">Exclusive Reward Available</h3>
                            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-sm font-mono relative z-10 tracking-tighter">
                                ${bonusCount.toLocaleString()}
                            </div>
                            <div className="mt-2 inline-flex items-center gap-1 bg-red-500/20 border border-red-500/50 rounded px-2 py-0.5">
                                <span className="text-[10px] text-red-400 font-bold uppercase animate-pulse">Limited Time Offer</span>
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex bg-black/40 p-1 rounded-xl mb-5">
                            <button 
                                onClick={() => { setAuthMode('signup'); playSound('click'); }}
                                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${authMode === 'signup' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <UserPlus className="w-3.5 h-3.5" /> Join
                            </button>
                            <button 
                                onClick={() => { setAuthMode('claim'); playSound('click'); }}
                                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${authMode === 'claim' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Gift className="w-3.5 h-3.5" /> Bonus
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            {/* Game Select */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500 pl-1 flex items-center gap-1">
                                    <Gamepad2 className="w-3 h-3" /> Game Cabinet
                                </label>
                                <div className="relative group">
                                    <select 
                                        value={selectedGame}
                                        onChange={(e) => setSelectedGame(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all appearance-none text-sm"
                                    >
                                        {AVAILABLE_GAMES.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none rotate-90" />
                                </div>
                            </div>

                            {/* Username Input */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-500 pl-1 flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {authMode === 'signup' ? 'Create Username' : 'Player ID'}
                                </label>
                                <div className="relative group">
                                    <input 
                                        type="text" 
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-700 text-sm pl-10"
                                        placeholder={authMode === 'signup' ? "FIRE_DRAGON_777" : "ENTER ID..."}
                                        maxLength={15}
                                    />
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none group-focus-within:text-purple-400 transition-colors" />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={!isFormValid}
                                className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 mt-4 group
                                    ${isFormValid 
                                        ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-purple-900/30' 
                                        : 'bg-slate-800 text-gray-600 cursor-not-allowed'}
                                `}
                            >
                                {isFormValid && (
                                    <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1s_infinite] transform skew-x-12"></div>
                                )}
                                <span className="relative flex items-center gap-2">
                                    CLAIM YOUR SPOT NOW <ChevronRight className={`w-4 h-4 ${isFormValid ? 'animate-pulse' : ''}`} />
                                </span>
                            </button>
                        </form>
                    </div>
                )}

                {/* --- STAGE: PROCESSING (Visuals) --- */}
                {(stage === 'processing' || stage === 'scanning') && (
                    <div className="p-8 md:py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300 w-full h-full">
                        
                        {/* Dynamic Visual Switcher */}
                        <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
                            
                            {/* Common Outer Ring */}
                            <div className="absolute inset-0 border-8 border-slate-800/50 rounded-full"></div>
                            
                            {/* CONNECT: Radar Scan */}
                            {PROCESSING_STEPS[currentStepIndex]?.id === 'connect' && stage === 'processing' && (
                                <div className="relative flex items-center justify-center w-full h-full">
                                    <Wifi className="w-14 h-14 text-blue-400 animate-pulse relative z-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
                                    <div className="absolute inset-2 border-4 border-blue-500/20 rounded-full animate-ping delay-150"></div>
                                </div>
                            )}

                            {/* SYNC: Matrix Data Stream */}
                            {PROCESSING_STEPS[currentStepIndex]?.id === 'sync' && stage === 'processing' && (
                                <div className="relative flex items-center justify-center w-full h-full overflow-hidden rounded-full bg-slate-900 shadow-inner">
                                    <Database className="w-12 h-12 text-purple-400 relative z-10 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                    <div className="absolute inset-0 flex justify-center gap-1 opacity-20">
                                        <div className="w-1 h-full bg-purple-500 animate-[bounce_1s_infinite]"></div>
                                        <div className="w-1 h-full bg-purple-500 animate-[bounce_1.2s_infinite]"></div>
                                    </div>
                                </div>
                            )}

                            {/* OPTIMIZE: Turbine/Engine */}
                            {PROCESSING_STEPS[currentStepIndex]?.id === 'optimize' && stage === 'processing' && (
                                 <div className="relative flex items-center justify-center w-full h-full">
                                    <Zap className="w-14 h-14 text-yellow-400 relative z-10 animate-[pulse_0.2s_infinite]" />
                                    <div className="absolute inset-0 border-t-8 border-yellow-500 rounded-full animate-[spin_0.5s_linear_infinite]"></div>
                                    {/* Tiny Game Name in Center */}
                                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold text-yellow-200 bg-black/50 px-1 rounded uppercase tracking-tighter w-max max-w-[80px] truncate z-20">
                                        {selectedGame}
                                     </div>
                                </div>
                            )}

                            {/* SCANNING STATE (The interruption loader) */}
                            {stage === 'scanning' && (
                                 <div className="relative flex items-center justify-center w-full h-full">
                                    <Scan className="w-14 h-14 text-orange-400 animate-pulse relative z-10" />
                                    <div className="absolute inset-0 border-2 border-orange-500 rounded-full animate-ping"></div>
                                </div>
                            )}

                        </div>

                        {/* Progress Bar & Text */}
                        <div className="w-full max-w-xs space-y-3">
                            <h3 className={`font-bold text-lg mb-1 animate-pulse tracking-wide ${stage === 'scanning' ? 'text-orange-400' : PROCESSING_STEPS[currentStepIndex]?.color}`}>
                                {stage === 'scanning' 
                                    ? "Validating Connection..." 
                                    : PROCESSING_STEPS[currentStepIndex]?.id === 'optimize'
                                        ? `Calibrating ${selectedGame}...`
                                        : PROCESSING_STEPS[currentStepIndex]?.label
                                }
                            </h3>
                            
                            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
                                 <div 
                                    className={`h-full transition-all duration-300 ease-out ${stage === 'scanning' ? 'bg-orange-500 w-full animate-pulse' : PROCESSING_STEPS[currentStepIndex]?.bg}`}
                                    style={{ width: stage === 'scanning' ? '100%' : `${progress}%` }}
                                 ></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- STAGE: SECURITY FLAG (INTERRUPTION) --- */}
                {stage === 'security_flagged' && (
                    <div className="p-6 md:p-8 animate-in bounce-in duration-500 w-full text-center">
                        <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-2 ring-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)]">
                            <Scan className="w-10 h-10 text-orange-500 animate-[pulse_1s_infinite]" />
                        </div>
                        
                        <h2 className="text-2xl font-black text-orange-500 uppercase tracking-widest mb-2">Standard Check</h2>
                        <div className="bg-orange-950/40 border border-orange-900 p-4 rounded-xl mb-6">
                            <p className="text-orange-200 text-sm font-bold">
                                <ShieldCheck className="w-4 h-4 inline mr-2 mb-1" />
                                Security verification required.
                            </p>
                            
                            {/* NEW: Pending Prize Display */}
                            <div className="mt-3 bg-black/40 rounded-lg p-2 border border-orange-500/30 flex items-center justify-between">
                                <span className="text-[10px] text-orange-400/80 font-bold uppercase tracking-wider">Pending Release</span>
                                <span className="text-sm font-mono font-black text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)] flex items-center gap-1">
                                    <Coins className="w-3.5 h-3.5" />
                                    ${bonusCount.toLocaleString()}
                                </span>
                            </div>

                            <p className="text-gray-400 text-xs mt-3">
                                To prevent bots and protect the jackpot pool, please complete this one-time check.
                            </p>
                        </div>

                        <button 
                            onClick={handleFinalVerify}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2 transition-all active:scale-95 animate-pulse"
                        >
                            <ShieldCheck className="w-4 h-4" /> VERIFY IDENTITY
                        </button>
                    </div>
                )}

                {/* --- STAGE: PRE-ENTRY (Fakeout Success) --- */}
                {(stage === 'pre_entry' || stage === 'verifying') && (
                    <div className="p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500 w-full">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                                <Target className="w-8 h-8 text-green-500 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-black text-white italic">ALL SYSTEMS GO</h2>
                            <p className="text-gray-400 text-xs mt-1">Funds allocated. Step in and win.</p>
                        </div>

                        {/* Summary Card */}
                        <div className="bg-black/40 border border-dashed border-gray-700 rounded-xl p-4 mb-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 shadow-[0_0_10px_gold]"></div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-500 uppercase font-bold">Account</span>
                                <span className="text-sm text-white font-mono font-bold">{username.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 uppercase font-bold">Ready Balance</span>
                                <div className="flex items-center gap-1.5 text-yellow-400 font-bold text-lg">
                                    <Coins className="w-4 h-4" />
                                    <span>${bonusCount.toLocaleString()}</span>
                                </div>
                            </div>
                            {/* "Game Picked" Tiny Badge */}
                             <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Cabinet</span>
                                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-900/20 px-2 py-0.5 rounded border border-cyan-500/30">{selectedGame}</span>
                            </div>
                        </div>

                        {/* Manual Trigger Button - Triggers the Security Interruption */}
                        <button 
                            onClick={handleAttemptEnter}
                            disabled={stage === 'verifying'}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 group"
                        >
                            {stage === 'verifying' ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Finalizing...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 group-hover:scale-110 transition fill-current" /> ENTER GAME
                                </>
                            )}
                        </button>
                        
                        <div className="text-center mt-3">
                            <p className="text-[10px] text-gray-600 flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3" /> 256-BIT SSL ENCRYPTED
                            </p>
                        </div>
                    </div>
                )}
            </div>
<<<<<<< HEAD
            
            <div className="mt-6 text-center w-full">
                 <div className="inline-flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] md:text-xs text-gray-300 font-mono font-bold tracking-wider">{playersOnline.toLocaleString()} PLAYERS ONLINE</span>
                 </div>
=======

            {/* Footer */}
            <div className="mt-8 text-center opacity-40 hover:opacity-100 transition-opacity">
                 <p className="text-[10px] text-white font-mono">
                    SESSION ID: {Math.random().toString(36).substr(2, 8).toUpperCase()} • NODE: {REGION_CONFIG[region].name}
                 </p>
>>>>>>> 8f383a592cf5675c9fa0e0d6f07f8284a2b08aee
            </div>
        </div>

    </div>
  );
};

export default LandingPage;