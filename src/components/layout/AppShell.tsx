import React, { useState } from 'react';
import {
  Home,
  Inbox,
  FileText,
  Trash2,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Star,
  Tag as TagIcon,
  Sun,
  Moon,
  Database,
  X,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { MobileTabBar } from './MobileTabBar';
import { getTagColorClasses } from '../../utils/tagColors';
import type { Page } from '../../types';

// Recursive Nested Page Tree Item
const PageTreeItem: React.FC<{
  page: Page;
  allPages: Page[];
  depth?: number;
}> = ({ page, allPages, depth = 0 }) => {
  const { activePageId, selectPage, createPage } = useWorkspace();
  const [isOpen, setIsOpen] = useState(true);

  const children = allPages.filter(p => p.parentId === page.id && !p.isInbox && !p.isArchived);
  const hasChildren = children.length > 0;
  const isSelected = activePageId === page.id;

  return (
    <div className="select-none">
      <div
        className={`group flex items-center justify-between py-1.5 px-2 rounded-xl text-xs cursor-pointer transition-all min-h-[36px] ${
          isSelected
            ? 'bg-[#F9F9F5] dark:bg-[#282A2F] font-semibold text-[#30332E] dark:text-[#EEEEEE] shadow-2xs border-l-2 border-[#7B8E73] dark:border-[#EEEEEE]'
            : 'text-[#777B73] dark:text-[#A2A5AC] hover:bg-[#EAECE6] dark:hover:bg-[#282A2F] hover:text-[#30332E] dark:hover:text-[#EEEEEE]'
        }`}
        style={{ paddingLeft: `${Math.max(8, depth * 14 + 8)}px` }}
        onClick={() => selectPage(page.id)}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {hasChildren ? (
            <button
              onClick={e => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              className="p-1 hover:bg-[#E2E4DC] dark:hover:bg-[#383B43] rounded-md text-[#777B73] dark:text-[#6C7078] shrink-0 cursor-pointer transition-colors"
              aria-label={isOpen ? 'Collapse folder' : 'Expand folder'}
            >
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}
          <span className="shrink-0 text-sm">{page.icon || '📄'}</span>
          <span className="truncate">{page.title}</span>
        </div>

        {/* Quick Add Sub-page on hover or active */}
        <button
          onClick={async e => {
            e.stopPropagation();
            const newP = await createPage(
              {
                title: 'Untitled Sub-page',
                content: `# Untitled Sub-page\n\nNested under ${page.title}`,
              },
              page.id
            );
            setIsOpen(true);
            selectPage(newP.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#E2E4DC] dark:hover:bg-[#383B43] rounded-md text-[#777B73] dark:text-[#A2A5AC] hover:text-[#30332E] dark:hover:text-[#EEEEEE] transition-all cursor-pointer shrink-0"
          title="Add sub-page"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {hasChildren && isOpen && (
        <div className="space-y-0.5 mt-0.5">
          {children.map(child => (
            <PageTreeItem
              key={child.id}
              page={child}
              allPages={allPages}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    pages,
    inboxPages,
    archivedPages,
    activeView,
    openDashboard,
    openInbox,
    openTrash,
    openAllNotes,
    createPage,
    theme,
    toggleTheme,
    setIsSearchOpen,
    setIsBackupModalOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    allTags,
    selectedTag,
    filterByTag,
  } = useWorkspace();

  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);
  const [isPagesOpen, setIsPagesOpen] = useState(true);

  // Top-level workspace pages
  const rootPages = pages.filter(p => !p.parentId && !p.isInbox && !p.isArchived);
  const favoritePages = pages.filter(p => p.isFavorite && !p.isInbox && !p.isArchived);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F4F0] dark:bg-[#161719] text-[#30332E] dark:text-[#EEEEEE] font-body">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-[#161719]/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation Drawer */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 sm:w-64 bg-[#EEEEEA] dark:bg-[#1B1C1F] border-r border-[#E3E4DC] dark:border-[#32353C] flex flex-col transition-all duration-200 ease-in-out shrink-0 shadow-2xl md:shadow-none ${
          isSidebarOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden md:border-none'
        }`}
      >
        {/* Brand Lockup */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#E3E4DC] dark:border-[#32353C] shrink-0">
          <button
            onClick={openDashboard}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer group"
          >
            <span className="text-lg p-1.5 rounded-xl bg-[#F9F9F5] dark:bg-[#282A2F] border border-[#E3E4DC]/60 dark:border-[#32353C] shadow-2xs group-hover:scale-105 transition-transform">
              🖋️
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold tracking-tight text-[#30332E] dark:text-[#EEEEEE] font-heading">
                Kiroku
              </span>
              <span className="text-[11px] font-medium text-[#7B8E73] dark:text-[#A2A5AC] font-serif tracking-widest">
                記録
              </span>
            </div>
          </button>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-[#777B73] hover:text-[#30332E] dark:text-[#A2A5AC] dark:hover:text-[#EEEEEE] rounded-xl cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Quick Action Bar */}
        <div className="p-3 space-y-2 shrink-0 border-b border-[#E3E4DC] dark:border-[#32353C]/70">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#F7F7F3] dark:bg-[#222428] border border-[#E3E4DC] dark:border-[#32353C] text-xs text-[#777B73] dark:text-[#A2A5AC] hover:bg-[#F2F2ED] dark:hover:bg-[#282A2F] hover:border-[#7B8E73]/50 dark:hover:border-[#4B4F58] transition-all cursor-pointer min-h-[40px] shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#777B73] dark:text-[#6C7078] group-hover:text-[#30332E] dark:group-hover:text-[#EEEEEE] transition-colors" />
              <span>Search notes...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[#EEEEEA] dark:bg-[#161719] text-[#777B73] dark:text-[#A2A5AC] rounded-md shadow-2xs border border-[#E3E4DC] dark:border-[#32353C]">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() =>
              createPage({ title: 'Untitled Note', content: '# Untitled Note\n\n' })
            }
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#7B8E73] hover:bg-[#6E8066] text-white dark:bg-[#EEEEEE] dark:hover:bg-[#FFFFFF] dark:text-[#161719] transition-all cursor-pointer min-h-[40px] shadow-2xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Document</span>
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {/* Main Navigation Views */}
          <div className="space-y-0.5">
            <button
              onClick={openDashboard}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer min-h-[40px] ${
                activeView === 'dashboard'
                  ? 'bg-[#F9F9F5] dark:bg-[#282A2F] text-[#30332E] dark:text-[#EEEEEE] font-semibold shadow-2xs border-l-2 border-[#7B8E73] dark:border-[#EEEEEE]'
                  : 'text-[#777B73] dark:text-[#A2A5AC] hover:bg-[#EAECE6] dark:hover:bg-[#282A2F] hover:text-[#30332E] dark:hover:text-[#EEEEEE]'
              }`}
            >
              <Home className="w-4 h-4 shrink-0 text-[#7B8E73] dark:text-[#A2A5AC]" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={openInbox}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer min-h-[40px] ${
                activeView === 'inbox'
                  ? 'bg-[#F7EFEA] dark:bg-[#282A2F] text-[#8C5237] dark:text-[#DEB29E] font-semibold shadow-2xs border-l-2 border-[#C7876A] dark:border-[#C28B75]'
                  : 'text-[#777B73] dark:text-[#A2A5AC] hover:bg-[#EAECE6] dark:hover:bg-[#282A2F] hover:text-[#30332E] dark:hover:text-[#EEEEEE]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4 text-[#C7876A] dark:text-[#C28B75] shrink-0" />
                <span>Inbox</span>
              </div>
              {inboxPages.length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#C7876A] dark:bg-[#383B43] text-white dark:text-[#EEEEEE] border dark:border-[#32353C] rounded-full tabular-nums shadow-2xs">
                  {inboxPages.length}
                </span>
              )}
            </button>

            <button
              onClick={openAllNotes}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer min-h-[40px] ${
                activeView === 'all-notes'
                  ? 'bg-[#F9F9F5] dark:bg-[#282A2F] text-[#30332E] dark:text-[#EEEEEE] font-semibold shadow-2xs border-l-2 border-[#7B8E73] dark:border-[#EEEEEE]'
                  : 'text-[#777B73] dark:text-[#A2A5AC] hover:bg-[#EAECE6] dark:hover:bg-[#282A2F] hover:text-[#30332E] dark:hover:text-[#EEEEEE]'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0 text-[#6B8B9B] dark:text-[#7C9EB2]" />
              <span>All Documents</span>
            </button>
          </div>

          {/* Pinned / Favorites */}
          {favoritePages.length > 0 && (
            <div>
              <div
                onClick={() => setIsFavoritesOpen(!isFavoritesOpen)}
                className="flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold text-[#969990] dark:text-[#6C7078] uppercase tracking-wider cursor-pointer hover:text-[#30332E] dark:hover:text-[#EEEEEE]"
              >
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-[#B5944B] dark:text-[#CFA862] fill-[#B5944B] dark:fill-[#CFA862]" />
                  <span>Favorites</span>
                </div>
                {isFavoritesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </div>

              {isFavoritesOpen && (
                <div className="mt-1 space-y-0.5">
                  {favoritePages.map(fav => (
                    <PageTreeItem
                      key={fav.id}
                      page={fav}
                      allPages={pages}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Workspace Pages Tree */}
          <div>
            <div className="flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold text-[#969990] dark:text-[#6C7078] uppercase tracking-wider">
              <div
                onClick={() => setIsPagesOpen(!isPagesOpen)}
                className="flex items-center gap-1.5 cursor-pointer hover:text-[#30332E] dark:hover:text-[#EEEEEE] flex-1"
              >
                <span>Documents</span>
                {isPagesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </div>
              <button
                onClick={() =>
                  createPage({ title: 'Untitled Note', content: '# Untitled Note\n\n' })
                }
                className="p-1 hover:bg-[#E2E4DC] dark:hover:bg-[#383B43] rounded-md text-[#777B73] hover:text-[#30332E] dark:text-[#A2A5AC] dark:hover:text-[#EEEEEE] cursor-pointer"
                title="Create top-level document"
                aria-label="Add document"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {isPagesOpen && (
              <div className="mt-1 space-y-0.5">
                {rootPages.map(page => (
                  <PageTreeItem
                    key={page.id}
                    page={page}
                    allPages={pages}
                  />
                ))}

                {rootPages.length === 0 && (
                  <p className="text-[11px] text-[#969990] dark:text-[#6C7078] px-3 py-2 italic">
                    No documents yet. Click + to create your first note.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tags Section */}
          {allTags.length > 0 && (
            <div>
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#969990] dark:text-[#6C7078] uppercase tracking-wider flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-[#7B8E73] dark:text-[#A2A5AC]" />
                <span>Tags</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5 px-1">
                {allTags.map(tag => {
                  const tagClasses = getTagColorClasses(tag.name);
                  const isSelected = selectedTag === tag.name;
                  return (
                    <button
                      key={tag.name}
                      onClick={() => filterByTag(isSelected ? null : tag.name)}
                      className={`px-2 py-0.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1 ${tagClasses} ${
                        isSelected ? 'ring-2 ring-[#7B8E73] dark:ring-[#A2A5AC] font-bold shadow-2xs' : 'opacity-85 hover:opacity-100 hover:scale-[1.02]'
                      }`}
                    >
                      <span>#{tag.name}</span>
                      <span className="text-[10px] opacity-75 tabular-nums">({tag.count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trash */}
          <div className="pt-2 border-t border-[#E3E4DC] dark:border-[#32353C]/70">
            <button
              onClick={openTrash}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer min-h-[40px] ${
                activeView === 'trash'
                  ? 'bg-[#F7EFEA] dark:bg-[#282A2F] text-[#8C5237] dark:text-[#DEB29E] font-semibold border-l-2 border-[#C7876A] dark:border-[#C28B75]'
                  : 'text-[#777B73] dark:text-[#A2A5AC] hover:bg-[#EAECE6] dark:hover:bg-[#282A2F] hover:text-[#8C5237] dark:hover:text-[#DEB29E]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-4 h-4 shrink-0" />
                <span>Trash</span>
              </div>
              {archivedPages.length > 0 && (
                <span className="text-[10px] tabular-nums text-[#969990] dark:text-[#6C7078]">
                  {archivedPages.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#E3E4DC] dark:border-[#32353C] shrink-0 space-y-2 bg-[#EEEEEA]/95 dark:bg-[#1B1C1F]/95 backdrop-blur-xs">
          {/* Theme & Backup Buttons */}
          <div className="flex items-center justify-between text-xs">
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="flex items-center gap-1.5 text-[#777B73] dark:text-[#A2A5AC] hover:text-[#30332E] dark:hover:text-[#EEEEEE] min-h-[36px] cursor-pointer transition-colors"
              title="Backup, export and import"
            >
              <Database className="w-4 h-4 text-[#7B8E73] dark:text-[#A2A5AC] shrink-0" />
              <span>Data & Backup</span>
            </button>

            <button
              onClick={toggleTheme}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-[#F9F9F5] dark:bg-[#282A2F] border border-[#E3E4DC] dark:border-[#32353C] hover:bg-[#EAECE6] dark:hover:bg-[#2F3238] text-[#30332E] dark:text-[#EEEEEE] transition-all cursor-pointer shadow-2xs active:scale-95"
              title={`Switch to ${theme === 'dark' ? 'Soft Paper (Light)' : 'Charcoal Graphite (Dark)'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#CFA862]" />
              ) : (
                <Moon className="w-4 h-4 text-[#7B8E73]" />
              )}
            </button>
          </div>

          <div className="text-[10px] text-[#969990] dark:text-[#6C7078] flex items-center justify-between px-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7B8E73] dark:bg-[#6C7078]" />
              Local IndexedDB
            </span>
            <span className="font-serif italic text-[#777B73] dark:text-[#6C7078]">記録</span>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-14 md:pb-0">
          {children}
        </div>
        {/* Mobile Fixed Bottom Navigation Bar */}
        <MobileTabBar />
      </div>
    </div>
  );
};
