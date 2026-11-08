import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Page, PageId, ContentViewMode, NoteFontFamily, BacklinkInfo } from '../types';
import { storageAdapter, computeBacklinks } from '../storage/adapter';

export type WorkspaceView = 'dashboard' | 'inbox' | 'all-notes' | 'page' | 'trash';

interface WorkspaceContextType {
  pages: Page[];
  archivedPages: Page[];
  inboxPages: Page[];
  activePage: Page | null;
  activePageId: PageId | null;
  activeView: WorkspaceView;
  selectedTag: string | null;
  theme: 'light' | 'dark';
  fontFamily: NoteFontFamily;
  viewMode: ContentViewMode;
  isSidebarOpen: boolean;
  isSearchOpen: boolean;
  isBackupModalOpen: boolean;
  isQuickCaptureOpen: boolean;
  activeBacklinks: BacklinkInfo[];
  allTags: { name: string; count: number }[];
  
  // Navigation & selection
  selectPage: (id: PageId) => void;
  openDashboard: () => void;
  openInbox: () => void;
  openTrash: () => void;
  openAllNotes: () => void;
  filterByTag: (tag: string | null) => void;
  
  // Page operations
  createPage: (partial?: Partial<Page>, parentId?: PageId | null) => Promise<Page>;
  updateCurrentPage: (partial: Partial<Page>) => Promise<void>;
  updatePageById: (id: PageId, partial: Partial<Page>) => Promise<void>;
  deletePage: (id: PageId, permanent?: boolean) => Promise<void>;
  restorePage: (id: PageId) => Promise<void>;
  toggleFavorite: (id: PageId) => Promise<void>;
  addQuickCapture: (text: string, title?: string) => Promise<Page>;
  promoteInboxToPage: (id: PageId) => Promise<void>;
  
  // View preferences
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setFontFamily: (font: NoteFontFamily) => void;
  setViewMode: (mode: ContentViewMode) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsBackupModalOpen: (open: boolean) => void;
  setIsQuickCaptureOpen: (open: boolean) => void;
  
  // Export/Import triggers
  exportPageMarkdown: (pageId: PageId) => void;
  exportCompleteBackup: () => Promise<void>;
  refreshPages: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<Page[]>([]);
  const [allPagesWithArchived, setAllPagesWithArchived] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<PageId | null>(null);
  const [activeView, setActiveView] = useState<WorkspaceView>('dashboard');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Preferences
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('kiroku_theme') || localStorage.getItem('komorebi_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [fontFamily, setFontFamilyState] = useState<NoteFontFamily>(() => {
    return ((localStorage.getItem('kiroku_font') || localStorage.getItem('komorebi_font')) as NoteFontFamily) || 'sans';
  });

  const [viewMode, setViewModeState] = useState<ContentViewMode>(() => {
    return ((localStorage.getItem('kiroku_view_mode') || localStorage.getItem('komorebi_view_mode')) as ContentViewMode) || 'edit';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  const closeSidebarOnMobile = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState<boolean>(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState<boolean>(false);

  // Sync theme to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kiroku_theme', theme);
  }, [theme]);

  const setTheme = (t: 'light' | 'dark') => setThemeState(t);
  const toggleTheme = () => setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));

  const setFontFamily = (f: NoteFontFamily) => {
    setFontFamilyState(f);
    localStorage.setItem('kiroku_font', f);
  };

  const setViewMode = (m: ContentViewMode) => {
    setViewModeState(m);
    localStorage.setItem('kiroku_view_mode', m);
  };

  // Load all pages
  const refreshPages = useCallback(async () => {
    try {
      const all = await storageAdapter.getAllPages(true);
      setAllPagesWithArchived(all);
      const active = all.filter(p => !p.isArchived);
      setPages(active);
    } catch (err) {
      console.error('Error refreshing pages:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshPages();
  }, [refreshPages]);

  // Global keyboard shortcuts (Cmd+K for search, Cmd+Shift+I for inbox)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Inbox pages & Archived pages
  const inboxPages = useMemo(() => {
    return pages.filter(p => p.isInbox);
  }, [pages]);

  const archivedPages = useMemo(() => {
    return allPagesWithArchived.filter(p => p.isArchived);
  }, [allPagesWithArchived]);

  // Active page object
  const activePage = useMemo(() => {
    if (!activePageId) return null;
    return allPagesWithArchived.find(p => p.id === activePageId) || null;
  }, [allPagesWithArchived, activePageId]);

  // Backlinks for active page
  const activeBacklinks = useMemo(() => {
    if (!activePage) return [];
    return computeBacklinks(activePage, pages);
  }, [activePage, pages]);

  // Tag counts
  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    for (const page of pages) {
      for (const tag of page.tags) {
        map.set(tag, (map.get(tag) || 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [pages]);

  // Navigation handlers
  const selectPage = useCallback((id: PageId) => {
    setActivePageId(id);
    setActiveView('page');
    closeSidebarOnMobile();
  }, [closeSidebarOnMobile]);

  const openDashboard = useCallback(() => {
    setActivePageId(null);
    setActiveView('dashboard');
    setSelectedTag(null);
    closeSidebarOnMobile();
  }, [closeSidebarOnMobile]);

  const openInbox = useCallback(() => {
    setActivePageId(null);
    setActiveView('inbox');
    setSelectedTag(null);
    closeSidebarOnMobile();
  }, [closeSidebarOnMobile]);

  const openTrash = useCallback(() => {
    setActivePageId(null);
    setActiveView('trash');
    closeSidebarOnMobile();
  }, [closeSidebarOnMobile]);

  const openAllNotes = useCallback(() => {
    setActivePageId(null);
    setActiveView('all-notes');
    closeSidebarOnMobile();
  }, [closeSidebarOnMobile]);

  const filterByTag = useCallback((tag: string | null) => {
    setSelectedTag(tag);
    if (tag) {
      setActivePageId(null);
      setActiveView('all-notes');
    }
    closeSidebarOnMobile();
  }, [closeSidebarOnMobile]);

  // Operations
  const createPage = useCallback(
    async (partial?: Partial<Page>, parentId?: PageId | null) => {
      const newPage = await storageAdapter.createPage({
        ...partial,
        parentId: parentId !== undefined ? parentId : null,
      });
      await refreshPages();
      selectPage(newPage.id);
      return newPage;
    },
    [refreshPages, selectPage]
  );

  const updateCurrentPage = useCallback(
    async (partial: Partial<Page>) => {
      if (!activePageId) return;
      const updated = await storageAdapter.updatePage(activePageId, partial);
      // Update local state smoothly
      setPages(prev => prev.map(p => (p.id === activePageId ? updated : p)));
      setAllPagesWithArchived(prev => prev.map(p => (p.id === activePageId ? updated : p)));
    },
    [activePageId]
  );

  const updatePageById = useCallback(
    async (id: PageId, partial: Partial<Page>) => {
      const updated = await storageAdapter.updatePage(id, partial);
      setPages(prev => prev.map(p => (p.id === id ? updated : p)));
      setAllPagesWithArchived(prev => prev.map(p => (p.id === id ? updated : p)));
    },
    []
  );

  const deletePage = useCallback(
    async (id: PageId, permanent = false) => {
      await storageAdapter.deletePage(id, permanent);
      await refreshPages();
      if (activePageId === id) {
        openDashboard();
      }
    },
    [activePageId, openDashboard, refreshPages]
  );

  const restorePage = useCallback(
    async (id: PageId) => {
      await storageAdapter.restorePage(id);
      await refreshPages();
    },
    [refreshPages]
  );

  const toggleFavorite = useCallback(
    async (id: PageId) => {
      const target = allPagesWithArchived.find(p => p.id === id);
      if (!target) return;
      await updatePageById(id, { isFavorite: !target.isFavorite });
    },
    [allPagesWithArchived, updatePageById]
  );

  const addQuickCapture = useCallback(
    async (text: string, title?: string) => {
      const firstLine = text.trim().split('\n')[0] || 'Quick Note';
      const cleanTitle = title || (firstLine.length > 40 ? firstLine.slice(0, 40) + '...' : firstLine);
      
      const newNote = await storageAdapter.createPage({
        title: cleanTitle,
        content: text,
        icon: '💡',
        isInbox: true,
        tags: ['inbox', 'quick-capture'],
      });
      await refreshPages();
      return newNote;
    },
    [refreshPages]
  );

  const promoteInboxToPage = useCallback(
    async (id: PageId) => {
      await storageAdapter.updatePage(id, {
        isInbox: false,
        icon: '📝',
      });
      await refreshPages();
    },
    [refreshPages]
  );

  // Markdown export
  const exportPageMarkdown = useCallback(
    (pageId: PageId) => {
      const target = allPagesWithArchived.find(p => p.id === pageId);
      if (!target) return;

      const propertiesYaml = Object.keys(target.properties).length > 0
        ? `---\n${Object.entries(target.properties)
            .map(([k, v]) => `${k}: "${v}"`)
            .join('\n')}\ntags: [${target.tags.join(', ')}]\n---\n\n`
        : '';

      const content = `${propertiesYaml}${target.content}`;
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${target.title.replace(/[^a-zA-Z0-9_\- ]/g, '') || 'note'}.md`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [allPagesWithArchived]
  );

  // Complete backup export
  const exportCompleteBackup = useCallback(async () => {
    const jsonString = await storageAdapter.exportBackup();
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiroku-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        pages,
        archivedPages,
        inboxPages,
        activePage,
        activePageId,
        activeView,
        selectedTag,
        theme,
        fontFamily,
        viewMode,
        isSidebarOpen,
        isSearchOpen,
        isBackupModalOpen,
        isQuickCaptureOpen,
        activeBacklinks,
        allTags,
        selectPage,
        openDashboard,
        openInbox,
        openTrash,
        openAllNotes,
        filterByTag,
        createPage,
        updateCurrentPage,
        updatePageById,
        deletePage,
        restorePage,
        toggleFavorite,
        addQuickCapture,
        promoteInboxToPage,
        setTheme,
        toggleTheme,
        setFontFamily,
        setViewMode,
        setIsSidebarOpen,
        setIsSearchOpen,
        setIsBackupModalOpen,
        setIsQuickCaptureOpen,
        exportPageMarkdown,
        exportCompleteBackup,
        refreshPages,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
