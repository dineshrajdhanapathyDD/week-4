# AI-Driven Retro Snake Game

A modern take on the classic Snake game featuring an intelligent AI Game Director that adapts gameplay in real-time based on player behavior.

## 🎮 Play Now

- **Full AI Experience**: [http://localhost:8080](http://localhost:8080) - Complete TypeScript implementation with AI features
- **Classic Version**: [Retro Snake Classic](retro-snake-classic/) - Browser-compatible vanilla JavaScript version

## ✨ Features

- **Authentic Retro Visuals**: Pixel art graphics with CRT effects and limited color palette
- **AI Game Director**: Invisible AI system that monitors player behavior and adjusts difficulty
- **Adaptive Gameplay**: Dynamic food placement, speed modulation, and recovery mechanisms
- **Player Profiling**: Session-based behavioral analysis and prediction
- **Explainable AI**: Human-readable explanations for all AI decisions
- **Performance Optimized**: Maintains 60fps while running complex AI algorithms
- **Dual Implementations**: Full-featured TypeScript version + lightweight classic version

## Architecture

The game follows a layered architecture:

```
┌─────────────────────────────────────────┐
│              UI Layer                   │
│  (Retro Renderer, Input Handler)        │
├─────────────────────────────────────────┤
│           AI Decision Layer             │
│  (Game Director, Player Profiler)       │
├─────────────────────────────────────────┤
│          Core Game Engine               │
│  (Game State, Physics, Rules)           │
├─────────────────────────────────────────┤
│          Data & Persistence             │
│  (Session Data, AI Logs)                │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start

### Running the Game

```bash
# Install dependencies
npm install

# Start development server
npm run serve

# Visit http://localhost:8080 for the full AI experience
# Visit http://localhost:8080/retro-snake-classic for the classic version
```

### Development Setup

```bash
# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📁 Project Structure

```text
├── src/                    # TypeScript source (AI-powered version)
│   ├── engine/            # Core game mechanics
│   ├── ai/                # AI systems and player profiling
│   ├── ui/                # Rendering and user interface
│   ├── types/             # TypeScript type definitions
│   └── tests/             # Unit and property-based tests
├── retro-snake-classic/   # Standalone classic version
│   ├── index.html         # Browser-ready Snake game
│   └── README.md          # Classic version documentation
├── public/                # Static assets and main HTML
└── dist/                  # Compiled JavaScript output
```

## 🧪 Testing

The project uses a dual testing approach:

- **Unit Tests**: Specific scenarios and edge cases
- **Property-Based Tests**: Universal properties using fast-check

## 🤖 AI Game Director

The AI system continuously monitors:

- Player reaction times
- Error frequency and patterns
- Risk-taking behavior
- Score progression

And dynamically adjusts:

- Game speed
- Food placement difficulty
- Recovery opportunities
- Visual feedback intensity

All AI decisions are logged with explanations and can optionally be displayed to the player.

## 🎯 Game Versions

### Full AI Experience (`/`)
- Complete TypeScript implementation
- Real-time AI adaptation
- Player behavior profiling
- Explainable AI decisions
- Performance monitoring
- Advanced visual effects

### Retro Snake Classic (`/retro-snake-classic/`)
- Pure vanilla JavaScript
- No dependencies or build process
- Classic Snake gameplay
- Educational AI insights
- Maximum browser compatibility
- Instant play experience

## 📄 License

MIT License - See LICENSE file for details.