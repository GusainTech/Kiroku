import Dexie, { type Table } from 'dexie';
import type { Page } from '../types';

export interface UserSetting {
  key: string;
  value: string;
}

export class KirokuDatabase extends Dexie {
  pages!: Table<Page, string>;
  settings!: Table<UserSetting, string>;

  constructor() {
    super('KirokuNotesDB');
    this.version(1).stores({
      pages: 'id, title, parentId, isFavorite, isArchived, isInbox, *tags, createdAt, updatedAt',
      settings: 'key',
    });
  }
}

export const db = new KirokuDatabase();

export const INITIAL_SEED_PAGES: Page[] = [
  {
    id: 'seed-welcome',
    title: 'Welcome to Kiroku',
    icon: '🌿',
    coverColor: '#5b7c6c',
    parentId: null,
    isFavorite: true,
    isArchived: false,
    isInbox: false,
    tags: ['guide', 'overview', 'pkm'],
    properties: {
      Status: 'Active',
      Type: 'Knowledge Base',
      Author: 'You',
    },
    content: `# Welcome to Kiroku 記録 🌿

*Kiroku (記録 — to record, chronicle, and preserve knowledge) is a calm, local-first personal knowledge workspace combining Notion's structured clarity with Obsidian's networked thought.*

---

### What makes Kiroku special?
- **100% Local-First**: Everything is stored in your browser's IndexedDB via Dexie. No cloud servers required, zero latency, offline ready.
- **Nested Hierarchies**: Organize notes into parent and sub-pages just like Notion.
- **Bi-directional Internal Links**: Type \`[[Page Title]]\` to link any note to another (e.g., check out [[Project Atlas]] or your [[Daily Notes]]).
- **Connected Backlinks**: Look at the bottom of any note to see all other pages that reference it.
- **Quick Capture Inbox**: Jot down fleeting thoughts in the Inbox and promote them into your main knowledge tree later.
- **Real Markdown & Portable Export**: Export all notes as JSON backup or individual Markdown files anytime.

---

### Key Navigation Tips
1. Press **⌘K** or **Ctrl+K** anywhere to open instantaneous search.
2. Click **+ New Sub-page** in the sidebar to nest documents.
3. Switch between **Edit**, **Preview**, and **Split View** in the top navigation bar.
4. Try clicking [[Project Atlas]] below to see how internal links work!
`,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'seed-project-atlas',
    title: 'Project Atlas',
    icon: '🗺️',
    coverColor: '#7c6ca0',
    parentId: null,
    isFavorite: true,
    isArchived: false,
    isInbox: false,
    tags: ['projects', 'architecture', 'active'],
    properties: {
      Status: 'In Progress',
      Priority: 'High',
      Category: 'Software Design',
    },
    content: `# Project Atlas 🗺️

A deep-dive research hub for modular systems and resilient client storage.

### Core Objectives
- [x] Architect resilient \`StorageAdapter\` interface
- [x] Integrate Dexie for atomic IndexedDB persistence
- [ ] Implement bi-directional graph indexing
- [ ] Add markdown folder zip exporter

### Related Documentation
- Connected to [[Welcome to Kiroku]] for onboarding principles.
- Track daily reflections in [[Daily Notes]].
- Check the sub-page [[Architecture Decisions]] for schema trade-offs.

> *"Knowledge is not a hierarchy; it is an organic, interconnected mesh of ideas."*
`,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'seed-arch-decisions',
    title: 'Architecture Decisions',
    icon: '📐',
    coverColor: '#627d98',
    parentId: 'seed-project-atlas', // Nested child page!
    isFavorite: false,
    isArchived: false,
    isInbox: false,
    tags: ['architecture', 'specs'],
    properties: {
      Status: 'Approved',
      Version: 'v0.1',
    },
    content: `# Architecture Decisions (ADR-01) 📐

*Parent document:* [[Project Atlas]]

### Decision: Local-First IndexedDB
We prioritize local persistence via Dexie.js over remote servers.
- **Why**: Zero network lag, instantaneous autosaves, total user privacy.
- **Portability**: All data can be extracted as standardized Markdown files or a portable JSON snapshot.

### Storage Adapter Pattern
All React components communicate through a unified \`StorageAdapter\` contract. When sync capabilities are added in the future, the UI layer remains 100% untouched.
`,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
  },
  {
    id: 'seed-daily-notes',
    title: 'Daily Notes',
    icon: '☕',
    coverColor: '#9c7a5b',
    parentId: null,
    isFavorite: false,
    isArchived: false,
    isInbox: false,
    tags: ['journal', 'daily'],
    properties: {
      Format: 'Log',
      Cadence: 'Daily',
    },
    content: `# Daily Notes ☕

Reflections, task progress, and scratchpad items.

### Today's Focus
- [x] Test responsive sidebar and workspace layout
- [x] Verify tag filtering and internal link resolution
- [ ] Capture 3 new ideas into [[Welcome to Kiroku]]

### Quick Scratchpad
Keep thoughts organized with bullet lists and internal links to [[Project Atlas]].
`,
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'seed-inbox-item-1',
    title: 'Explore local vector similarity for offline search',
    icon: '💡',
    coverColor: null,
    parentId: null,
    isFavorite: false,
    isArchived: false,
    isInbox: true,
    tags: ['inbox', 'ideas'],
    properties: {
      CaptureSource: 'Quick Jot',
    },
    content: `Captured idea: Explore client-side cosine similarity or n-gram matching for notes without needing external servers. See [[Project Atlas]].`,
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
  },
];
