# Kiroku

> **A calm, local-first personal knowledge workspace combining the structured spatial clarity of Notion with the networked thought of Obsidian.**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%20%2F%207.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Dexie.js](https://img.shields.io/badge/IndexedDB-Dexie.js_v4-2C8EBB?logo=databricks&logoColor=white)](https://dexie.org/)
[![Local First](https://img.shields.io/badge/Storage-100%25_Local--First-2E7D32)](https://localfirstweb.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌿 The Kiroku Philosophy

In Japanese, **Kiroku (記録)** means *to chronicle, record, and preserve*.

Most modern productivity tools force an uncomfortable compromise:
- **Cloud-first database tools (Notion)** are structured and visually elegant, but they introduce network latency, vendor lock-in, recurring subscription paywalls, and privacy concerns for sensitive personal thoughts.
- **File-over-app tools (Obsidian)** provide unmatched privacy and networked linking, but often feel visually spartan, require complex plugin setups, and lack intuitive spatial page nesting.

**Kiroku was created as a sanctuary for your thoughts.** It unites the warm, tactile clarity of physical stationery with the organic power of bi-directional graph thinking. Everything runs entirely within your browser's IndexedDB engine: zero latency, zero telemetry, zero server dependencies, and instant offline accessibility.

```
       Structured Spatial Clarity (Notion)
                       +
        Organic Networked Thought (Obsidian)
                       +
          Uncompromising Local Privacy (Dexie)
                       =
                  記録 KIROKU
```

---

## ✨ Features at a Glance

### 🔒 100% Local-First & Zero Latency
- **Direct IndexedDB Persistence**: Every page, tag, link, and property is committed locally using Dexie.js. Your thoughts never touch a remote server.
- **Immediate Startup**: Zero cold boots, zero network lag, and full offline functionality right out of the box.

### 🛡️ Hardened Save Coordinator & Safe Navigation
- **Atomic Partial Updates**: Writes to note content (`title`, `content`) only patch those specific fields, ensuring concurrent edits to tags, properties, or favorites are never overwritten.
- **Awaited Navigation Guard**: Switching notes, returning to the dashboard, or clicking internal links automatically flushes and awaits persistence before unmounting.
- **Sequential Write Serialization**: Eliminates race conditions between rapid keystrokes and in-flight database transactions.
- **Real-Time Save Indicator**: Unobtrusive status feedback: `Saved`, `Saving...`, `Unsaved changes`, and `Save failed — Retry`.

### 🖋️ Notion-Inspired Spatial Organization
- **Infinite Page Nesting**: Structure notes into parent and sub-pages just like a real notebook or Notion workspace.
- **Custom Properties & Metadata**: Attach structured key-value pairs (e.g., `Status`, `Category`, `Due Date`) to any page.
- **Curated Visual Accents**: Choose from curated emoji icons and understated accent color strips (Slate, Stone, Warm Sand, Terracotta, Sage, Charcoal).

### 🕸️ Obsidian-Style Bi-Directional Links
- **Instant Wikilinks `[[...]]`**: Type `[[` anywhere in the editor to trigger a real-time autocomplete palette for linking documents or creating new ones.
- **Connected Backlinks**: An automatic linked references section at the bottom of each document shows all other pages that reference it, complete with contextual snippets.

### 📥 Quick Capture Inbox
- **Fleeting Thoughts Queue**: A dedicated capture scratchpad on the dashboard lets you jot down ideas, links, or tasks without friction.
- **One-Click Promotion**: Easily triage inbox items into permanent workspace pages when you are ready to organize.

### 🎨 "Cozy Modern" Dual Aesthetic
- **Soft Paper (Light Mode)**: Warm, glare-free `#F4F4F0` canvas with `#F9F9F5` editor cards, subtle dividers, and earthy accents—comfortable for hours of deep writing.
- **True Charcoal Graphite (Dark Mode)**: Deep `#161719` canvas and `#222428` editor with neutral `#32353C` borders—free of purple tints, olive casts, or AI-slop gradients.
- **Reading Typeface Switcher**: Toggle instantly between **Inter (Sans)**, **Newsreader (Serif)**, and **JetBrains Mono (Monospace)**.

### 📦 Open Data Portability
- **Markdown Export**: Download any note as a clean `.md` document with YAML frontmatter.
- **Bulk Markdown Import**: Import folders of Markdown documents with automated `#tag` extraction.
- **Full JSON Snapshot**: Export and restore your complete knowledge base with both *Merge* and *Replace* modes.

### 📱 Responsive & Mobile-First
- Fully adaptive interface optimized for smartphones, tablets, laptops, and ultra-wide desktop monitors.
- Touch-friendly tap targets (≥44px), sliding drawer navigation, and a floating mobile navigation bar.

---

## 🛠️ Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Concurrent rendering, modern functional components & hooks |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict type safety across data adapters, schemas, and UI |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | Instantaneous Hot Module Replacement & production tree-shaking |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern CSS variable tokens, `@custom-variant dark`, fluid typography |
| **Local Database**| [Dexie.js v4](https://dexie.org/) | High-performance, indexed, transactional wrapper for native IndexedDB |
| **Iconography** | [Lucide React](https://lucide.dev/) | Consistent, clean stroke icons matching a minimalist visual tone |

---

## 🚀 Local Installation & Setup

Kiroku runs seamlessly across **macOS**, **Linux**, and **Windows**.

### Prerequisites

Ensure you have **Node.js** (v18.0.0 or higher; v20 LTS recommended) and **npm** installed.

Verify your environment:
```bash
node --version
npm --version
```

*(You can also use **pnpm**, **yarn**, or **bun** if preferred).*

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

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open Kiroku:**
   Navigate to [http://localhost:3456](http://localhost:3456) in your web browser.

---

### 🐧 Linux Setup (Ubuntu / Debian / Fedora / Arch)

1. **Install Node.js & Git (if needed):**
   - *Ubuntu / Debian:*
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

4. **Launch development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Open [http://localhost:3456](http://localhost:3456).

---

### 🪟 Windows Setup (PowerShell / Git Bash / Command Prompt)

1. **Install Node.js & Git:**
   - Download the LTS installer from [nodejs.org](https://nodejs.org/), or install via Windows Package Manager:
     ```powershell
     winget install OpenJS.NodeJS.LTS
     winget install Git.Git
     ```

2. **Clone the repository:**
   ```powershell
   git clone https://github.com/your-username/kiroku.git
   cd kiroku
   ```

3. **Install project dependencies:**
   ```powershell
   npm install
   ```

4. **Start the local server:**
   ```powershell
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3456](http://localhost:3456).

---

## 💻 Guidelines for Running Locally

### Development Workflow & Port Configuration
- Kiroku defaults to unique port **`3456`** with `--host=0.0.0.0` to avoid conflicts with projects already running on common ports like `3000`, `8080`, or Vite's `5173`.
- You can preview the workspace on any other device (like a phone or tablet) connected to your local Wi-Fi network at `http://<your-local-ip>:3456`.
- To specify a custom port:
  ```bash
  npm run dev -- --port 8080
  ```

### Inspecting Local Data in Browser DevTools
Since Kiroku is 100% local-first, you can inspect your active database in real-time:
1. Open Chrome, Edge, Brave, or Firefox Developer Tools (`F12` or `Option + Cmd + I`).
2. Go to the **Application** (or **Storage**) tab.
3. Under **Storage > IndexedDB**, expand **`KirokuNotesDB`**.
4. You will see two object stores:
   - `pages`: Stores documents, titles, markdown content, tags, custom properties, and hierarchies.
   - `settings`: Stores local user preferences.

### Running Automated Reliability Tests
Kiroku includes an automated test suite verifying 31 assertions covering race condition prevention, atomic Dexie updates, debounced save flushes, and failure recovery:
```bash
npx tsx src/storage/__tests__/saveCoordinator.test.ts
```

### Production Build & Preview
To create an optimized, production-ready static build:
```bash
npm run build
npm run preview
```
The compiled assets will be placed in the `dist/` directory, ready to be served by any static host (Cloudflare Pages, Vercel, Netlify, GitHub Pages, or a self-hosted Nginx/Caddy container).

### Type Checking
To validate TypeScript types across the entire project:
```bash
npm run lint
```

---

## 📂 Project Architecture & Directory Structure

```
kiroku/
├── index.html                   # HTML entry point, typography & dark theme setup
├── LICENSE                      # Official MIT License
├── package.json                 # Dependencies & project scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler configuration
├── src/
│   ├── main.tsx                 # React DOM mount point
│   ├── App.tsx                  # Root shell and view coordination
│   ├── index.css                # Tailwind CSS v4 setup & theme design tokens
│   ├── types/
│   │   └── index.ts             # TypeScript definitions (Page, StorageAdapter, etc.)
│   ├── storage/
│   │   ├── db.ts                # Dexie database instance ('KirokuNotesDB') & seeds
│   │   ├── adapter.ts           # StorageAdapter abstraction & atomic updates
│   │   ├── saveCoordinator.ts   # Autosave engine, revision queue & navigation guard
│   │   └── __tests__/           # Automated 31-assertion storage test suite
│   ├── context/
│   │   └── WorkspaceContext.tsx # Central workspace state & safe navigation coordination
│   ├── utils/
│   │   └── tagColors.ts         # Deterministic pastel color palette generator
│   └── components/
│       ├── layout/              # AppShell, TopNav, MobileTabBar
│       ├── dashboard/           # WorkspaceDashboard & quick capture scratchpad
│       ├── editor/              # NoteEditor & live MarkdownRenderer
│       ├── inbox/               # Quick capture triage view
│       ├── all-notes/           # Search, sort, and tag filtering view
│       ├── search/              # Command Search Modal (Cmd/Ctrl + K)
│       ├── settings/            # Data backup & Markdown import/export modal
│       └── trash/               # Soft-deleted document recovery & permanent purge
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| `⌘ K` / `Ctrl + K` | Open global search palette from anywhere |
| `[[` *(inside editor)* | Trigger Obsidian-style internal note link autocomplete |
| `Esc` | Close any modal, search palette, or popover |
| `Enter` *(in search)* | Open highlighted document (or create new note if query has no matches) |

---

## 🛡️ Privacy, Security & Data Ownership

- **Zero Tracking**: No Google Analytics, no third-party trackers, and no background network telemetry.
- **Device-Bound Storage**: Your data lives solely inside your browser's local sandbox.
- **Portability by Default**: You are never locked in. Export your entire workspace anytime as standard Markdown files or an open JSON snapshot.

---

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes: `git commit -m 'feat: add amazing feature'`.
4. Push to the branch: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  <i>Crafted with care for calm, focused, and resilient personal thinking.</i><br />
  <strong>記録 · Kiroku</strong>
</p>
