# Copilot Instructions for OnGame Platform

## Architecture Overview
This is a React-based gaming platform with multiple mini-games and AI-powered features. The app consists of:

- **Main App (`App.tsx`)**: Central state management for user balance, game mode, chat, and navigation between components
- **Game Components** (`components/`): Individual games like `FishGame` (canvas-based shooting), `SlotMachine` (reel spinning), `CreativeStudio` (AI image generation)
- **Services** (`services/geminiService.ts`): Mocked Gemini AI integration for pit boss chat responses and image generation/editing
- **Types** (`types.ts`): Shared interfaces for game entities (Fish, Bullet, PlayerState) and chat messages

Data flows from App state down to components via props, with events bubbling up through `onGameEvent` callbacks.

## Development Workflow
- **Local Development**: `npm run dev` starts Vite dev server on port 3000
- **Build**: `npm run build` creates production bundle in `dist/`
- **Environment**: Set `GEMINI_API_KEY` in `.env.local` (though service is currently mocked)
- **Assets**: Game banners stored in `/games/` directory with fallback Unsplash URLs

## Key Conventions
- **State Management**: Use React hooks (`useState`, `useEffect`) in functional components; avoid class components
- **Performance**: Games use `useRef` for mutable state (e.g., `fishesRef`, `bulletsRef`) to avoid re-renders during animation loops
- **Icons**: Import from `lucide-react` (e.g., `import { Coins, Sparkles } from 'lucide-react'`)
- **Asset Loading**: Use absolute paths for images (e.g., `/games/firekirin-banner.png`) with fallback URLs in ASSETS object
- **Game Events**: All components receive `onGameEvent: (msg: string) => void` for logging user actions to chat
- **Navigation**: Components receive `goBack: () => void` to return to lobby; use `setMode(GameMode.LOBBY)` in App

## Component Patterns
- **Props Interface**: Define at top of component file (e.g., `interface FishGameProps { balance: number; setBalance: Dispatch<SetStateAction<number>>; ... }`)
- **Canvas Games**: Use `requestAnimationFrame` for smooth 60fps rendering; calculate delta time for consistent physics
- **Audio**: Initialize `AudioContext` on user interaction; handle suspended state for autoplay policies
- **Probability**: Use weighted arrays for random outcomes (e.g., `SYMBOLS` with `WEIGHTS` in SlotMachine)

## AI Integration
- **Gemini Service**: Currently mocked with simulated delays and random responses; real API calls would use `process.env.GEMINI_API_KEY`
- **Chat**: Pit boss responses based on keywords; maintain conversation history for context
- **Image Gen**: `generateCasinoImage(prompt, size)` returns placeholder URLs; `editCasinoImage(base64, prompt)` for modifications

## Common Pitfalls
- **Canvas Sizing**: Use `window.innerWidth/Height` for full-screen games; handle resize events
- **Balance Updates**: Always use functional updates for balance: `setBalance(prev => prev - cost)`
- **Async Operations**: Add loading states for AI calls; handle errors gracefully with user-friendly messages
- **Ticker Animation**: Use `setInterval` with random delays for realistic activity feed

## File Structure Reference
- `components/FishGame.tsx`: Canvas-based fish shooting game with physics
- `components/SlotMachine.tsx`: Reel-based slot machine with audio and jackpot
- `components/CreativeStudio.tsx`: AI image generation interface
- `services/geminiService.ts`: Mocked AI service layer</content>
<parameter name="filePath">/Users/tolapao/Documents/GitHub/ongame-platform-new-2026/.github/copilot-instructions.md