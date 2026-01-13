import React, { useState, useEffect, useRef } from 'react';
import FishGame from './components/FishGame';
import SlotMachine from './components/SlotMachine';
import LandingPage from './components/LandingPage';
import CreativeStudio from './components/CreativeStudio';
import { GameMode, ChatMessage } from './types';
import { generatePitBossResponse } from './services/geminiService';
import { Bot, MessageSquare, Menu, X, Gamepad2, Coins, Palette, Sparkles, Megaphone, Flame, Crown, Zap } from 'lucide-react';

// --- ASSETS ---
// Using absolute string paths ensures the browser requests the image file directly
// without trying to process it as a JavaScript module.
const ASSETS = {
  fireKirin: { src: '/games/firekirin-banner.png', fallback: 'https://images.unsplash.com/photo-1582967788606-a171f1080ca8?q=80' },
  goldenDragon: { src: '/games/goldendragon-banner.png', fallback: 'https://images.unsplash.com/photo-1605870445919-838d190e8e1b?q=80' },
  milkyWay: { src: '/games/milkyway-banner.png', fallback: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80' },
  blueDragon: { src: '/games/bluedragon-banner.png', fallback: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80' },
  juwa: { src: '/games/juwa-banner.png', fallback: 'https://images.unsplash.com/photo-1635326444826-06c8f8e9e789?q=80' },
  panda: { src: '/games/panda-banner.png', fallback: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?q=80' },
};

// Ticker Generators
const NAME_PREFIXES = ['Dragon', 'Lucky', 'Fire', 'Super', 'Mega', 'Gold', 'Fish', 'King', 'Master', 'Slot', 'Vegas', 'Royal', 'Star'];
const NAME_SUFFIXES = ['Slayer', 'Winner', '777', '88', '99', 'King', 'Boy', 'Girl', 'Pro', 'X', 'Hunter'];
const PRIZES = ['5.00', '10.00', '25.00', '50.00', '8.88', '15.00', '99.00', '110.00', '45.00', '12.50', '5.50', '115.00', '88.00', '105.00', '60.00'];

const generateRandomActivity = () => {
    const user = `${NAME_PREFIXES[Math.floor(Math.random() * NAME_PREFIXES.length)]}${NAME_SUFFIXES[Math.floor(Math.random() * NAME_SUFFIXES.length)]}`;
    const prize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
    return { user, prize };
};

export const App = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedGame, setSelectedGame] = useState("Fire Kirin");
  const [mode, setMode] = useState<GameMode>(GameMode.LOBBY);
  const [balance, setBalance] = useState(10000);
  const [jackpot, setJackpot] = useState(50000);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  
  const [tickerItem, setTickerItem] = useState(generateRandomActivity());
  const [showTicker, setShowTicker] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const tickerInterval = setInterval(() => {
        setShowTicker(false);
        setTimeout(() => {
            setTickerItem(generateRandomActivity());
            setShowTicker(true);
        }, 500);
    }, 5000);
    return () => clearInterval(tickerInterval);
  }, []);

  const handleLogin = (user: string, game: string) => {
      setUsername(user);
      setSelectedGame(game);
      setMessages([
        { role: 'model', text: `Welcome to ${game} on JACKPOT US, ${user}! I'm the Boss here. Need chips? Just ask!` }
      ]);
      setHasEntered(true);
      if ((window as any)._VR) { (window as any)._VR(); }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsLoadingChat(true);

    if (chatInput.toLowerCase().includes("add coins") || chatInput.toLowerCase().includes("cheat")) {
       setTimeout(() => {
           setMessages(prev => [...prev, { role: 'model', text: '🤫 Giving you a stimulus package. Don\'t tell the owner.' }]);
           setBalance(b => b + 5000);
           setIsLoadingChat(false);
       }, 1000);
       return;
    }

    const responseText = await generatePitBossResponse(messages, chatInput, balance);
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoadingChat(false);
  };

  const onGameEvent = async (eventDescription: string) => {
    if (Math.random() > 0.7) {
        const responseText = await generatePitBossResponse(messages, `[System Event: Player triggered: ${eventDescription}]`, balance);
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    }
  };

  const goBack = () => setMode(GameMode.LOBBY);

  if (!hasEntered) {
      return <LandingPage onLogin={handleLogin} />;
  }

  if (mode === GameMode.FISH) {
      return <FishGame balance={balance} setBalance={setBalance} onGameEvent={onGameEvent} goBack={goBack} />;
  }

  if (mode === GameMode.SLOTS) {
      return <SlotMachine balance={balance} setBalance={setBalance} jackpot={jackpot} setJackpot={setJackpot} onGameEvent={onGameEvent} goBack={goBack} />;
  }

  if (mode === GameMode.CREATIVE) {
      return <CreativeStudio goBack={goBack} onGameEvent={onGameEvent} />;
  }

  return (
    <div className="min-h-screen bg-[#050b14] text-white flex flex-col relative overflow-x-hidden font-sans">
      {/* Navbar */}
      <nav className="p-4 flex justify-between items-center bg-slate-900/80 backdrop-blur border-b border-white/10 z-20 sticky top-0">
        <div className="flex items-center gap-2">
           <div className="relative">
             <span className="text-2xl animate-pulse">🔥</span>
             <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-spin-slow" />
           </div>
           <div className="flex flex-col">
               <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500 arcade-font leading-none drop-shadow-lg">
                JACKPOT US
              </h1>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{selectedGame}</span>
          </div>
         
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center text-xs text-gray-400 font-bold mr-2">
              ID: <span className="text-white ml-1 font-mono">{username.toUpperCase()}</span>
           </div>
           <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-kirin-gold/50 shadow-[0_0_10px_rgba(255,215,0,0.2)]">
              <Coins className="w-4 h-4 text-kirin-gold" />
              <span className="font-bold font-mono">{balance.toLocaleString()}</span>
           </div>
           <button onClick={() => setChatOpen(!chatOpen)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 relative transition-colors">
              <MessageSquare className="w-5 h-5 text-purple-300" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
           </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center p-6 relative z-10">
         {/* Background Effects */}
         <div className="absolute inset-0 z-[-1] overflow-hidden opacity-30 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(139,92,246,0.15),_transparent_70%)]"></div>
            <div className="absolute top-1/4 left-1/4 text-6xl animate-float opacity-30 blur-sm">🐠</div>
            <div className="absolute bottom-1/4 right-1/4 text-6xl animate-spin-slow opacity-30 blur-sm">🎰</div>
         </div>
         
         {/* Ticker Bar */}
         <div className={`mb-6 transition-all duration-500 transform ${showTicker ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            <div className="inline-flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-6 py-2 backdrop-blur-md shadow-lg">
                <Megaphone className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-300">
                    <span className="font-bold text-white">{tickerItem.user}</span> just won <span className="text-yellow-400 font-bold">${tickerItem.prize}</span>
                </span>
            </div>
         </div>
         
         {/* Global Jackpot */}
         <div className="mb-10 bg-gradient-to-r from-transparent via-red-950/80 to-transparent px-16 py-4 border-y border-red-500/20 backdrop-blur-sm w-full text-center">
            <span className="text-red-400 font-bold tracking-[0.3em] text-[10px] uppercase animate-pulse">Live Progressive Jackpot</span>
            <div className="text-5xl md:text-6xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] tabular-nums mt-1 font-mono">
              ${jackpot.toLocaleString()}
            </div>
         </div>

         <div className="w-full max-w-6xl space-y-8">
             
             {/* FEATURED GAMES */}
             <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Flame className="w-5 h-5 text-orange-500" /> FEATURED TABLES</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Fish Game Card */}
                    <button 
                    onClick={() => setMode(GameMode.FISH)}
                    className="group relative h-64 bg-slate-900 rounded-3xl border border-blue-500/30 overflow-hidden hover:scale-[1.02] transition duration-300 shadow-[0_0_30px_rgba(0,100,255,0.15)]"
                    >
                        <img src={ASSETS.fireKirin.src} onError={(e) => e.currentTarget.src = ASSETS.fireKirin.fallback} alt="Ocean King" className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110 opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-end p-6">
                            <Gamepad2 className="w-10 h-10 text-cyan-400 mb-2 drop-shadow-lg group-hover:animate-bounce" />
                            <h3 className="text-xl font-black text-white uppercase tracking-wider arcade-font drop-shadow-md">Ocean King</h3>
                            <p className="text-cyan-300 text-xs font-bold uppercase tracking-widest opacity-80">Fish Hunter</p>
                        </div>
                    </button>

                    {/* Slots Card */}
                    <button 
                    onClick={() => setMode(GameMode.SLOTS)}
                    className="group relative h-64 bg-slate-900 rounded-3xl border border-purple-500/30 overflow-hidden hover:scale-[1.02] transition duration-300 shadow-[0_0_30px_rgba(147,51,234,0.15)]"
                    >
                        <img src={ASSETS.goldenDragon.src} onError={(e) => e.currentTarget.src = ASSETS.goldenDragon.fallback} alt="Dragon Slots" className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110 opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-end p-6">
                            <div className="text-4xl mb-2 drop-shadow-lg group-hover:animate-pulse">7️⃣</div>
                            <h3 className="text-xl font-black text-white uppercase tracking-wider arcade-font drop-shadow-md">Dragon Slots</h3>
                            <p className="text-purple-300 text-xs font-bold uppercase tracking-widest opacity-80">Jackpot 500x</p>
                        </div>
                    </button>
                    
                    {/* Creative Studio Card */}
                    <button 
                    onClick={() => setMode(GameMode.CREATIVE)}
                    className="group relative h-64 bg-slate-900 rounded-3xl border border-pink-500/30 overflow-hidden hover:scale-[1.02] transition duration-300 shadow-[0_0_30px_rgba(236,72,153,0.15)]"
                    >
                        <img src={ASSETS.milkyWay.src} onError={(e) => e.currentTarget.src = ASSETS.milkyWay.fallback} alt="Nano Studio" className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110 opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-end p-6">
                            <Palette className="w-10 h-10 text-pink-400 mb-2 drop-shadow-lg group-hover:rotate-12 transition" />
                            <h3 className="text-xl font-black text-white uppercase tracking-wider arcade-font drop-shadow-md">Nano Studio</h3>
                            <p className="text-pink-300 text-xs font-bold uppercase tracking-widest opacity-80">AI Art Gen</p>
                        </div>
                    </button>
                </div>
             </div>

             {/* MORE GAMES */}
             <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Crown className="w-5 h-5 text-yellow-500" /> CLASSIC ARCADE</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     {[
                         { name: 'Blue Dragon', img: ASSETS.blueDragon, type: 'Fish' },
                         { name: 'Juwa', img: ASSETS.juwa, type: 'Slots' },
                         { name: 'Panda Master', img: ASSETS.panda, type: 'Arcade' }
                     ].map((game, i) => (
                        <button 
                            key={i} 
                            onClick={() => {
                                // For now, these redirect to fish game logic but with a different skin context if implemented
                                setMode(GameMode.FISH);
                            }}
                            className="group relative h-40 bg-slate-900 rounded-2xl border border-white/10 overflow-hidden hover:border-yellow-500/50 hover:scale-[1.02] transition-all"
                        >
                            <img src={game.img.src} onError={(e) => e.currentTarget.src = game.img.fallback} alt={game.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                            <div className="absolute bottom-3 left-3">
                                <h4 className="font-black text-white italic uppercase leading-none">{game.name}</h4>
                                <span className="text-[10px] text-yellow-400 font-bold uppercase">{game.type}</span>
                            </div>
                        </button>
                     ))}
                </div>
             </div>

         </div>
      </main>

      {/* AI Chat Overlay */}
      {chatOpen && (
          <div className="fixed bottom-4 right-4 w-80 h-96 bg-slate-900/95 border border-vault-purple/50 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-md animate-in slide-in-from-bottom-5">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-3 flex justify-between items-center border-b border-white/10">
                  <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow-lg border border-red-400">
                          <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                          <div className="font-bold text-sm text-white">PIT BOSS</div>
                          <div className="text-[10px] text-green-400 flex items-center gap-1 font-bold">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> ONLINE
                          </div>
                      </div>
                  </div>
                  <button onClick={() => setChatOpen(false)} className="hover:bg-white/10 rounded-full p-1"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-2.5 rounded-xl text-sm shadow-md ${
                              m.role === 'user' 
                              ? 'bg-purple-600 text-white rounded-br-none' 
                              : 'bg-slate-700 text-gray-100 rounded-bl-none border border-slate-600'
                          }`}>
                              <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
                          </div>
                      </div>
                  ))}
                  {isLoadingChat && <div className="text-xs text-gray-500 animate-pulse pl-2 font-mono">Pit Boss is typing...</div>}
                  <div ref={chatEndRef}></div>
              </div>

              <div className="p-3 bg-slate-900 border-t border-white/5">
                  <div className="flex gap-2">
                      <input 
                          type="text" 
                          className="flex-1 bg-black/50 border border-slate-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-purple-500 text-white placeholder:text-gray-600 transition-colors"
                          placeholder="Ask for luck..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button onClick={handleSendMessage} className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-full p-2 hover:opacity-90 transition shadow-lg">
                          <MessageSquare className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};