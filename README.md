# 💠 ALGO PULSE | Visual Algorithm

**Algo Pulse** is a high-performance, interactive visualizer designed to demystify complex computational logic. Built aesthetic, it combines real-time data visualization, auditory sonification, and live code execution tracing.

## ⚡ Core Features

* **📊 Multi-Module Visualizers**: Support for Sorting (Bubble, Quick, Merge, Selection, Insertion) and Pathfinding (Dijkstra, A*).
* **💻 Live Code Trace**: Execution flow visualized through React Syntax Highlighter, synchronized with the current step of the algorithm.
* **⏱️ Benchmark Mode**: Real-time telemetry tracking comparisons between $O(n^2)$ and $O(n \log n)$ algorithms on identical datasets.
* **📜 Telemetry History**: Persistent results panel tracking execution time (ms), swap counts, and comparison metrics.
* **📱 Adaptive UI**: Fully responsive, dark-themed dashboard built with Tailwind CSS and Framer Motion for smooth transitions.
* **🔊 Audio Sonification**: Real-time sound synthesis using the Web Audio API, where array values are mapped to frequencies ($f = 200 + (val \times 2)$) for an immersive debugging experience.

## 🛠️ Technical Stack

* **Framework**: [Next.js 16+](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Audio**: Web Audio API (OscillatorNode / GainNode)
* **Styling**: Tailwind CSS
* **Icons**: Lucide React

## ⚙️ How it Works: The Generator Pattern
To allow users to pause, rewind, or step through algorithms, Algo Pulse utilizes ES6 Generators. Instead of a standard loop, each algorithm yields a "Snapshot" of the current state: