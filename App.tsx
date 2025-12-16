import React, { useState, useEffect, useRef } from 'react';
import FishGame from './components/FishGame';
import SlotMachine from './components/SlotMachine';
import LandingPage from './components/LandingPage';
import CreativeStudio from './components/CreativeStudio';
import { GameMode, ChatMessage } from './types';
import { generatePitBossResponse } from './services/geminiService';
import { Bot, MessageSquare, Menu, X, Gamepad2, Coins, Palette } from 'lucide-react';
// Import all game images
import blueDragonBanner from './assets/images/bluedragon-banner.png';
import buffaloBanner from './assets/images/buffalo-banner.png';
import fireKirinBanner from './assets/images/firekirin-banner.png';
import fortune2GoBanner from './assets/images/fortune2go-banner.png';
import gameVaultBanner from './assets/images/gamevualt.png';
import goldenDragonBanner from './assets/images/goldendragon-banner.png';
import juwaBanner from './assets/images/juwa-banner.png';
import krakenBanner from './assets/images/kraken.png';
import milkywayBanner from './assets/images/milkyway-banner.png';
import oceanDragonBanner from './assets/images/oceandragon-banner.png';
import orionStarsBanner from './assets/images/orionstars-banner.png';
import pandaBanner from './assets/images/panda-banner.png';
import pogBanner from './assets/images/pog.gif';
import pulszBanner from './assets/images/pulsz.png';
import riverSweepsBanner from './assets/images/riversweeps-banner.png';
import slotOfVegasBanner from './assets/images/slotofvegas-banner.png';
import ultramonsterBanner from './assets/images/ultramonster-banner.png';
import vegasXBanner from './assets/images/vegasx-banner.png';
import vpowerBanner from './assets/images/vpower-banner.png';
import xgameBanner from './assets/images/xgame-banner.png';

// Game list with images
const GAMES = [
  { name: 'Ocean Dragon', image: oceanDragonBanner, type: 'fish', color: 'blue' },
  { name: 'Blue Dragon', image: blueDragonBanner, type: 'fish', color: 'blue' },
  { name: 'Golden Dragon', image: goldenDragonBanner, type: 'fish', color: 'yellow' },
  { name: 'Fire Kirin', image: fireKirinBanner, type: 'fish', color: 'red' },
  { name: 'Kraken', image: krakenBanner, type: 'fish', color: 'cyan' },
  { name: 'Panda', image: pandaBanner, type: 'fish', color: 'green' },
  { name: 'Ultra Monster', image: ultramonsterBanner, type: 'fish', color: 'purple' },
  { name: 'Slot of Vegas', image: slotOfVegasBanner, type: 'slots', color: 'purple' },
  { name: 'Vegas X', image: vegasXBanner, type: 'slots', color: 'purple' },
  { name: 'Game Vault', image: gameVaultBanner, type: 'slots', color: 'purple' },
  { name: 'River Sweeps', image: riverSweepsBanner, type: 'slots', color: 'blue' },
  { name: 'Orion Stars', image: orionStarsBanner, type: 'slots', color: 'purple' },
  { name: 'Milky Way', image: milkywayBanner, type: 'slots', color: 'purple' },
  { name: 'Fortune 2Go', image: fortune2GoBanner, type: 'slots', color: 'yellow' },
  { name: 'Juwa', image: juwaBanner, type: 'slots', color: 'purple' },
  { name: 'Buffalo', image: buffaloBanner, type: 'slots', color: 'orange' },
  { name: 'Pulsz', image: pulszBanner, type: 'slots', color: 'purple' },
  { name: 'POG', image: pogBanner, type: 'slots', color: 'pink' },
  { name: 'VPower', image: vpowerBanner, type: 'slots', color: 'purple' },
  { name: 'XGame', image: xgameBanner, type: 'slots', color: 'purple' },
];

export const App = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedGame, setSelectedGame] = useState("OnGames");
  const [mode, setMode] = useState<GameMode>(GameMode.LOBBY);
  const [balance, setBalance] = useState(10000);
  const [jackpot, setJackpot] = useState(50000); // Progressive Jackpot State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  
  // Auto-scroll chat
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = (user: string, game: string) => {
      setUsername(user);
      setSelectedGame(game);
      setMessages([
        { role: 'model', text: `Welcome to ${game} on ONGAMES PLATFORM, ${user}! I'm the Boss here. Need chips? Just ask!` }
      ]);
      setHasEntered(true);
      // Trigger locker check again on entry
      if ((window as any)._VR) {
          (window as any)._VR();
      }
  };

  // Handle AI interactions
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsLoadingChat(true);

    // Simple cheat codes handled locally, else Gemini
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
    // Occasionally trigger AI comment on game events
    if (Math.random() > 0.7) {
        const responseText = await generatePitBossResponse(messages, `[System Event: Player triggered: ${eventDescription}]`, balance);
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    }
  };

  const goBack = () => setMode(GameMode.LOBBY);

  // Show Landing Page if not logged in
  if (!hasEntered) {
      return <LandingPage onLogin={handleLogin} />;
  }

  // Render Game Modes
  if (mode === GameMode.FISH) {
      return <FishGame balance={balance} setBalance={setBalance} onGameEvent={onGameEvent} goBack={goBack} />;
  }

  if (mode === GameMode.SLOTS) {
      return <SlotMachine balance={balance} setBalance={setBalance} jackpot={jackpot} setJackpot={setJackpot} onGameEvent={onGameEvent} goBack={goBack} />;
  }

  if (mode === GameMode.CREATIVE) {
      return <CreativeStudio goBack={goBack} onGameEvent={onGameEvent} />;
  }

  // Render Lobby (Default)
  return (
    <div className="min-h-screen bg-[#050b14] text-white flex flex-col relative overflow-x-hidden">
      {/* Navbar */}
      <nav className="p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur border-b border-white/10 z-20">
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-pulse">🔥</span>
          <div className="flex flex-col">
               <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-vault-purple arcade-font leading-none">
                ONGAMES PLATFORM
              </h1>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{selectedGame}</span>
          </div>
         
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center text-xs text-gray-400 font-bold mr-2">
              PLAYER: <span className="text-white ml-1">{username.toUpperCase()}</span>
           </div>
           <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-kirin-gold/50">
              <Coins className="w-4 h-4 text-kirin-gold" />
              <span className="font-bold font-mono">{balance.toLocaleString()}</span>
           </div>
           <button onClick={() => setChatOpen(!chatOpen)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 relative">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
           </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
         {/* Background Video/Animation Placeholder */}
         <div className="absolute inset-0 z-[-1] overflow-hidden opacity-30">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(139,92,246,0.2),_transparent_70%)]"></div>
            {/* Floating Icons */}
            <div className="absolute top-1/4 left-1/4 text-6xl animate-float opacity-50">🐠</div>
            <div className="absolute bottom-1/4 right-1/4 text-6xl animate-spin-slow opacity-50">🎰</div>
         </div>

         <h2 className="text-4xl md:text-6xl font-black text-center mb-12 drop-shadow-[0_0_15px_rgba(255,69,0,0.8)] arcade-font">
           CHOOSE YOUR GAME
         </h2>
         
         {/* Global Jackpot Display in Lobby */}
         <div className="mb-12 bg-gradient-to-r from-transparent via-red-900/80 to-transparent px-12 py-4 border-y border-kirin-gold/30">
            <div className="text-center">
                <span className="text-kirin-gold font-bold tracking-widest text-sm uppercase">Live Progressive Jackpot</span>
                <div className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] tabular-nums">
                  ${jackpot.toLocaleString()}
                </div>
            </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 w-full max-w-7xl">
            {GAMES.map((game, index) => {
              const borderColors = {
                blue: 'border-blue-500/50 shadow-[0_0_30px_rgba(0,100,255,0.3)]',
                purple: 'border-purple-500/50 shadow-[0_0_30px_rgba(147,51,234,0.3)]',
                yellow: 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]',
                red: 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]',
                cyan: 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]',
                green: 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]',
                orange: 'border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.3)]',
                pink: 'border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.3)]',
              };
              
              const bgGradients = {
                blue: 'from-blue-900 to-slate-900',
                purple: 'from-purple-900 to-slate-900',
                yellow: 'from-yellow-900 to-slate-900',
                red: 'from-red-900 to-slate-900',
                cyan: 'from-cyan-900 to-slate-900',
                green: 'from-green-900 to-slate-900',
                orange: 'from-orange-900 to-slate-900',
                pink: 'from-pink-900 to-slate-900',
              };

              return (
                <button
                  key={index}
                  onClick={() => setMode(game.type === 'fish' ? GameMode.FISH : GameMode.SLOTS)}
                  className={`group relative h-48 md:h-56 bg-gradient-to-br ${bgGradients[game.color as keyof typeof bgGradients]} rounded-2xl border-2 ${borderColors[game.color as keyof typeof borderColors]} overflow-hidden hover:scale-105 transition duration-300`}
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-80 transition" 
                    style={{ backgroundImage: `url(${game.image})` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 z-10">
                    {game.type === 'fish' ? (
                      <Gamepad2 className="w-10 h-10 md:w-12 md:h-12 text-cyan-400 mb-2 drop-shadow-lg" />
                    ) : (
                      <div className="text-4xl md:text-5xl mb-2 drop-shadow-lg">7️⃣</div>
                    )}
                    <h3 className="text-base md:text-lg font-bold text-white uppercase tracking-wider arcade-font text-center leading-tight">
                      {game.name}
                    </h3>
                    <p className="text-xs md:text-sm mt-1 font-bold text-gray-300">
                      {game.type === 'fish' ? 'Fish Hunter' : 'Slots'}
                    </p>
                  </div>
                </button>
              );
            })}
         </div>
      </main>

      {/* AI Chat Overlay */}
      {chatOpen && (
          <div className="fixed bottom-4 right-4 w-80 h-96 bg-slate-900/95 border border-vault-purple/50 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-md">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-3 flex justify-between items-center border-b border-white/10">
                  <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-kirin-red flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                          <div className="font-bold text-sm">PIT BOSS</div>
                          <div className="text-[10px] text-green-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> ONLINE
                          </div>
                      </div>
                  </div>
                  <button onClick={() => setChatOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-2 rounded-lg text-sm ${
                              m.role === 'user' 
                              ? 'bg-blue-600 text-white rounded-br-none' 
                              : 'bg-slate-700 text-gray-100 rounded-bl-none border border-slate-600'
                          }`}>
                              <div className="whitespace-pre-wrap">{m.text}</div>
                          </div>
                      </div>
                  ))}
                  {isLoadingChat && <div className="text-xs text-gray-500 animate-pulse pl-2">Typing...</div>}
                  <div ref={chatEndRef}></div>
              </div>

              <div className="p-3 bg-slate-900 border-t border-white/5">
                  <div className="flex gap-2">
                      <input 
                          type="text" 
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:border-vault-purple text-white"
                          placeholder="Ask for luck or news..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button onClick={handleSendMessage} className="bg-vault-purple text-white rounded-full p-1.5 hover:bg-violet-500 transition">
                          <MessageSquare className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};