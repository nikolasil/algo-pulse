# 💠 ALGO PULSE | Visual Algorithm Terminal

**Algo Pulse** is a high-performance, interactive visualizer designed to demystify complex computational logic. Built with a "Cyber-Terminal" aesthetic, it combines real-time data visualization, auditory sonification, and live code execution tracing.

## ⚡ Core Features

* **📊 Multi-Module Visualizers**: Support for Sorting, Pathfinding (Coming Soon), and Searching.
* **🔊 Audio Sonification**: Real-time sound synthesis where bar values are mapped to frequencies.
* **💻 Live Code Trace**: Watch the algorithm execute line-by-line with syntax highlighting.
* **⏱️ Benchmark Mode**: Compare different algorithms on the exact same dataset to see theoretical complexity in action.
* **📜 Telemetry History**: Results panel that tracks execution time, data size, and algorithm efficiency.
* **📱 Adaptive UI**: Fully responsive dashboard built with Tailwind CSS and Framer Motion.

## 🛠️ Technical Stack

* **Framework**: [Next.js 16+](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Audio**: Web Audio API (OscillatorNode)
* **Syntax Highlighting**: [React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
* **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm / yarn / pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/nikolasil/algo-pulse.git](https://github.com/nikolasil/algo-pulse.git)
   cd algo-pulse
   npm install
   npm run dev
   ```
### Project Structure

src/
├── algorithms/      # Generator functions and code strings
├── app/             # Next.js App Router (Sorting, Pathfinding, etc.)
├── components/      # UI Components (CodeViewer, ControlPanel, Cards)
├── hooks/           # Custom Logic (useSorting, useAudio)
└── constants/       # Global metadata and complexity stats