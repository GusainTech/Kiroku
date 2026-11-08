# Kiroku

> **A calm, local-first personal knowledge workspace combining the structured clarity of Notion with the networked thought of Obsidian.**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%20%2F%207.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Dexie.js](https://img.shields.io/badge/IndexedDB-Dexie.js_v4-2C8EBB?logo=databricks&logoColor=white)](https://dexie.org/)
[![Local First](https://img.shields.io/badge/Storage-100%25_Local--First-2E7D32)](https://localfirstweb.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Overview

**Kiroku** (記録 — *to record, chronicle, and preserve knowledge*) is an open-source, private, local-first personal knowledge management (PKM) web application. Designed for thinkers, writers, engineers, and researchers, Kiroku unites:

- **Notion's structured spatial clarity**: Nested sub-page hierarchies, custom properties, cover accent bands, and curated icon selectors.
- **Obsidian's organic networked thinking**: Fast `[[Wikilinks]]` autocomplete, bi-directional backlinks, and Markdown portability.
- **True Local-First Privacy**: Stored directly in your browser's IndexedDB via Dexie.js. Zero trackers, zero cloud dependencies, instant load times, and complete offline capability.

---

## ✨ Key Features

### 🌿 100% Local-First & Zero Latency
- All pages, tags, properties, and edit histories are committed to your browser's **IndexedDB** engine.
- Instantaneous startup with zero server network latency. Works completely offline.

### 🛡️ Hardened Save Coordinator & Safe Navigation
- **Atomic Partial Updates**: Content updates only patch modified fields (`title`, `content`), guaranteeing that concurrent metadata changes (tags, custom properties, favorites) are never overwritten.
- **Awaited Navigation Guard**: Switching documents, opening the dashboard, or clicking wikilinks automatically flushes and awaits persistence before unmounting, preventing data clipping.
- **Sequential Write Serialization**: Eliminates race conditions between rapid keystrokes and in-flight database transactions.
- **Status Transparency**: Real-time save indicators (`Saved`, `Saving...`, `Unsaved changes`, and `Save failed — Retry`).

### 🖋️ Notion-Inspired Hierarchies & Metadata
- **Infinite Page Nesting**: Create sub-pages and organize knowledge in intuitive trees without rigid folders.
- **Custom Properties & Tags**: Attach custom key-value pairs (e.g., `Status`, `Category`, `Author`) and auto-color-hashed tags.
- **Cozy Personalization**: Curated emoji icons and understated accent color bands (Slate, Stone, Warm Sand, Terracotta, Sage, Charcoal).

### 🕸️ Obsidian-Style Networked Connections
- **Instant Wikilinks**: Type `[[` anywhere in the editor to open an autocomplete popup of existing documents, or press enter to create linked notes on the fly.
- **Connected Backlinks**: Every note displays an automatic linked references panel showing other notes that reference it, complete with contextual snippets.

### 📥 Quick Capture Inbox
- A dedicated scratchpad on the home dashboard to jot down fleeting thoughts, links, or ideas without organizing first.
- One-click **"Move to Pages"** promotes inbox items into permanent workspace documents.

### 🎨 "Cozy Modern" Dual Aesthetic
- **Soft Paper (Light Mode)**: Warm, glare-free `#F4F4F0` canvas and `#F9F9F5` editor surface designed for long writing sessions without harsh white glare.
- **True Charcoal Graphite (Dark Mode)**: Deep, neutral `#161719` canvas and `#222428` editor with zero greenish tint or generic AI-slop gradients.
- **Typography Switching**: Seamlessly toggle between **Inter (Sans)**, **Newsreader (Serif)**, and **JetBrains Mono (Monospace)**.

### 📦 Portable Data Ownership
- **Markdown Export**: Download individual documents as clean `.md` files with YAML frontmatter.
- **Bulk Markdown Import**: Drag-and-drop or select external `.md` files (from Obsidian, Logseq, or Bear) with automatic `#tag` extraction.
- **Full JSON Snapshot**: One-click complete backup and restore with both *Merge* and *Replace* modes.

### 📱 Responsive & Mobile-First
- Designed for mobile phones, tablets, and desktop displays.
- Floating mobile navigation tab bar, touch-friendly hit targets (≥44px), and sliding drawer sidebar.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Modern component architecture, functional hooks, concurrent rendering |
| **TypeScript** | Strict end-to-end type safety |
| **Vite 8** | Next-generation lightweight frontend bundler and development server |
| **Tailwind CSS v4** | CSS-variables-driven design system with native light/dark mode |
| **Dexie.js v4** | Robust, indexed relational database wrapper for IndexedDB |
| **Lucide Icons** | Clean, minimalist, consistent interface iconography |

---

## 🚀 Installation & Setup

Kiroku can be run on **macOS**, **Linux**, and **Windows**.

### Prerequisites

Ensure you have **Node.js** (version 18.x or higher, 20.x recommended) and `npm` installed.

Check your installation:
```bash
node -v
npm -v
```

*(You can also use **pnpm**, **yarn**, or **bun** if preferred.)*

---

### 🍎 macOS Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/kiroku.git
   cd kiroku
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000` (or `http://localhost:5173`).

---

### 🐧 Linux Setup (Ubuntu / Debian / Fedora / Arch)

1. **Install Git & Node.js (if not already installed):**
   - *Ubuntu/Debian:*
     ```bash
     sudo apt update && sudo apt install -y git nodejs npm
     ```
   - *Fedora:*
     ```bash
     sudo dnf install -y git nodejs npm
     ```
   - *Arch Linux:*
     ```bash
     sudo pacman -S git nodejs npm
     ```

2. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/kiroku.git
   cd kiroku
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Launch the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Open `http://localhost:3000`.

---

### 🪟 Windows Setup (PowerShell / Git Bash / Command Prompt)

1. **Install Node.js & Git:**
   - Download the official Node.js installer from [nodejs.org](https://nodejs.org/) (LTS recommended).
   - Alternatively via Windows Package Manager:
     ```powershell
     winget install OpenJS.NodeJS.LTS
     winget install Git.Git
     ```

2. **Clone the repository:**
   ```powershell
   git clone https://github.com/your-username/kiroku.git
   cd kiroku
   ```

3. **Install dependencies:**
   ```powershell
   npm install
   ```

4. **Run the development server:**
   ```powershell
   npm run dev
   ```

5. **Open in browser:**
   Navigate to `http://localhost:3000`.

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server on port `3000` with host binding |
| `npm run build` | Compiles TypeScript and creates an optimized production bundle in `dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npx tsx src/storage/__tests__/saveCoordinator.test.ts` | Runs the automated 31-assertion storage & autosave test suite |

---

## 📂 Project Directory Structure

```
kiroku/
├── index.html                   # HTML entry point with metadata & dark mode setup
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler configuration
├── src/
│   ├── main.tsx                 # React application mounting point
│   ├── App.tsx                  # Root shell and view router
│   ├── index.css                # Global CSS variables, fonts, and dark theme tokens
│   ├── types/
│   │   └── index.ts             # Data models (Page, BacklinkInfo, StorageAdapter)
│   ├── storage/
│   │   ├── db.ts                # Dexie database instance ('KirokuNotesDB') & seeds
│   │   ├── adapter.ts           # StorageAdapter implementation & atomic updates
│   │   ├── saveCoordinator.ts   # Autosave engine, revision queue & navigation guard
│   │   └── __tests__/           # Storage reliability verification test suite
│   ├── context/
│   │   └── WorkspaceContext.tsx # Central workspace state & safe navigation coordination
│   ├── utils/
│   │   └── tagColors.ts         # Harmonious tag color palette hashing
│   └── components/
│       ├── layout/              # AppShell, TopNav, MobileTabBar
│       ├── dashboard/           # WorkspaceDashboard & quick capture
│       ├── editor/              # NoteEditor & MarkdownRenderer
│       ├── inbox/               # Quick capture triage view
│       ├── all-notes/           # Search, sort, and tag filtering view
│       ├── search/              # Cmd+K Command Search Palette
│       ├── settings/            # JSON backup & Markdown export/import modal
│       └── trash/               # Soft-deleted document restore & purge
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌘ K` / `Ctrl + K` | Open global search command palette |
| `[[` (while typing) | Open Obsidian-style internal link autocomplete |
| `Esc` | Close modal / search dialog |
| `Enter` (in search) | Open selected note (or create if note does not exist) |

---

## 🔒 Privacy & Security

- **No Remote Telemetry**: Kiroku contains zero tracking cookies, remote analytics, or background telemetry.
- **Sandboxed Local Storage**: Your notes exist exclusively inside your device's browser profile.
- **Portability by Default**: You can export your entire knowledge base as standardized Markdown files or a JSON snapshot at any time.

---

## 🤝 Contributing

Contributions are welcome! If you would like to help improve Kiroku:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m 'Add amazing feature'`.
4. Push to the branch: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

*Crafted with care for calm, focused, and resilient personal thinking.* 記録
