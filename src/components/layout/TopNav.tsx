import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Star,
  Download,
  Trash2,
  Plus,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  Home,
  Check,
  Type,
  Eye,
  Edit3,
  Columns,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import type { NoteFontFamily } from '../../types';

export const TopNav: React.FC = () => {
  const {
    activePage,
    pages,
    activeView,
    openDashboard,
    selectPage,
    createPage,
    deletePage,
    toggleFavorite,
    fontFamily,
    setFontFamily,
    viewMode,
    setViewMode,
    exportPageMarkdown,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useWorkspace();

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) {
        setShowFontMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumbs path
  const breadcrumbs = React.useMemo(() => {
    if (!activePage) return [];
    const trail = [activePage];
    let curr = activePage;
    let safeguard = 0;
    while (curr.parentId && safeguard < 10) {
      const parent = pages.find(p => p.id === curr.parentId);
      if (parent) {
        trail.unshift(parent);
        curr = parent;
      } else {
        break;
      }
      safeguard++;
    }
    return trail;
  }, [activePage, pages]);

  return (
    <header className="h-14 border-b border-[#E3E4DC] dark:border-[#32353C] bg-[#F4F4F0]/95 dark:bg-[#161719]/95 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4 shrink-0 z-20 sticky top-0 font-body">
      {/* Zone 1: Sidebar Toggle & Responsive Navigation Path */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#777B73] hover:text-[#30332E] dark:text-[#A2A5AC] dark:hover:text-[#EEEEEE] hover:bg-[#EAECE6] dark:hover:bg-[#282A2F] transition-all shrink-0 cursor-pointer"
          title="Toggle sidebar drawer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Mobile Back Button */}
        {activeView === 'page' && (
          <button
            onClick={openDashboard}
            className="md:hidden flex items-center gap-1 text-xs font-semibold text-[#777B73] dark:text-[#A2A5AC] hover:text-[#30332E] dark:hover:text-[#EEEEEE] min-h-[40px] px-2 rounded-lg hover:bg-[#EAECE6] dark:hover:bg-[#282A2F] shrink-0 transition-colors"
            title="Back to home"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Home</span>
          </button>
        )}

        {/* Desktop Breadcrumb Path */}
        <nav
          aria-label="Breadcrumb"
          className="hidden md:flex items-center gap-1.5 text-xs text-[#777B73] dark:text-[#A2A5AC] min-w-0 truncate"
        >
          <button
            onClick={openDashboard}
            className="hover:text-[#30332E] dark:hover:text-[#EEEEEE] flex items-center gap-1 shrink-0 cursor-pointer transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-[#7B8E73] dark:text-[#A2A5AC]" />
            <span className="font-medium">Workspace</span>
          </button>

          {activeView === 'dashboard' && (
            <>
              <ChevronRight className="w-3 h-3 text-[#969990] dark:text-[#6C7078] shrink-0" />
              <span className="font-semibold text-[#30332E] dark:text-[#EEEEEE] truncate">
                Dashboard
              </span>
            </>
          )}

          {activeView === 'inbox' && (
            <>
              <ChevronRight className="w-3 h-3 text-[#969990] dark:text-[#6C7078] shrink-0" />
              <span className="font-semibold text-[#8C5237] dark:text-[#DEB29E] truncate">
                Inbox
              </span>
            </>
          )}

          {activeView === 'all-notes' && (
            <>
              <ChevronRight className="w-3 h-3 text-[#969990] dark:text-[#6C7078] shrink-0" />
              <span className="font-semibold text-[#30332E] dark:text-[#EEEEEE] truncate">
                All Documents
              </span>
            </>
          )}

          {activeView === 'trash' && (
            <>
              <ChevronRight className="w-3 h-3 text-[#969990] dark:text-[#6C7078] shrink-0" />
              <span className="font-semibold text-[#8C5237] dark:text-[#DEB29E] truncate">
                Trash
              </span>
            </>
          )}

          {activeView === 'page' &&
            breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight className="w-3 h-3 text-[#969990] dark:text-[#6C7078] shrink-0" />
                <button
                  onClick={() => selectPage(crumb.id)}
                  className={`truncate flex items-center gap-1.5 cursor-pointer transition-colors ${
                    idx === breadcrumbs.length - 1
                      ? 'font-semibold text-[#30332E] dark:text-[#EEEEEE]'
                      : 'hover:text-[#30332E] dark:hover:text-[#EEEEEE]'
                  }`}
                >
                  <span className="shrink-0">{crumb.icon || '📄'}</span>
                  <span className="truncate max-w-[160px]">{crumb.title}</span>
                </button>
              </React.Fragment>
            ))}
        </nav>

        {/* Mobile current title display */}
        {activeView === 'page' && activePage && (
          <div className="md:hidden flex items-center gap-1.5 text-xs font-semibold text-[#30332E] dark:text-[#EEEEEE] truncate min-w-0">
            <span className="shrink-0">{activePage.icon || '📄'}</span>
            <span className="truncate">{activePage.title}</span>
          </div>
        )}
      </div>

      {/* Zone 2: View mode & Typeface Switcher */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {activeView === 'page' && activePage && (
          <>
            {/* Desktop View Switcher (Edit / Split / Preview) */}
            <div className="hidden sm:flex items-center gap-0.5 p-1 bg-[#EEEEEA] dark:bg-[#1B1C1F] border border-[#E3E4DC] dark:border-[#32353C] rounded-xl text-xs">
              <button
                onClick={() => setViewMode('edit')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'edit'
                    ? 'bg-[#F9F9F5] dark:bg-[#282A2F] text-[#30332E] dark:text-[#EEEEEE] shadow-2xs font-semibold'
                    : 'text-[#777B73] dark:text-[#A2A5AC] hover:text-[#30332E] dark:hover:text-[#EEEEEE]'
                }`}
                title="Edit mode"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#7B8E73] dark:text-[#CBD5E1]" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-[#F9F9F5] dark:bg-[#282A2F] text-[#30332E] dark:text-[#EEEEEE] shadow-2xs font-semibold'
                    : 'text-[#777B73] dark:text-[#A2A5AC] hover:text-[#30332E] dark:hover:text-[#EEEEEE]'
                }`}
                title="Split view"
              >
                <Columns className="w-3.5 h-3.5 text-[#6B8B9B] dark:text-[#7C9EB2]" />
                <span>Split</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-[#F9F9F5] dark:bg-[#282A2F] text-[#30332E] dark:text-[#EEEEEE] shadow-2xs font-semibold'
                    : 'text-[#777B73] dark:text-[#A2A5AC] hover:text-[#30332E] dark:hover:text-[#EEEEEE]'
                }`}
                title="Reading preview mode"
              >
                <Eye className="w-3.5 h-3.5 text-[#659174] dark:text-[#A2A5AC]" />
                <span>Preview</span>
              </button>
            </div>

            {/* Mobile View Toggle Button (Edit <-> Preview) */}
            <button
              onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
              className="sm:hidden flex items-center justify-center min-h-[40px] min-w-[40px] rounded-xl text-xs font-semibold text-[#30332E] dark:text-[#EEEEEE] bg-[#F9F9F5] dark:bg-[#282A2F] border border-[#E3E4DC] dark:border-[#32353C] shadow-2xs transition-all cursor-pointer"
              title={viewMode === 'edit' ? 'Switch to Preview' : 'Switch to Edit'}
            >
              {viewMode === 'edit' ? (
                <Eye className="w-4 h-4 text-[#659174] dark:text-[#A2A5AC]" />
              ) : (
                <Edit3 className="w-4 h-4 text-[#7B8E73] dark:text-[#CBD5E1]" />
              )}
            </button>

            {/* Typeface Switcher */}
            <div className="relative" ref={fontMenuRef}>
              <button
                onClick={() => setShowFontMenu(!showFontMenu)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#777B73] hover:text-[#30332E] dark:text-[#A2A5AC] dark:hover:text-[#EEEEEE] hover:bg-[#EAECE6] dark:hover:bg-[#282A2F] transition-all cursor-pointer"
                title="Change reading typeface"
                aria-label="Change reading typeface"
              >
                <Type className="w-4 h-4" />
              </button>

              {showFontMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#F2F2ED] dark:bg-[#24262C] border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl shadow-xl z-40 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 text-[10px] text-[#969990] dark:text-[#6C7078] font-bold uppercase tracking-wider">
                    Reading Typeface
                  </div>
                  {(['sans', 'serif', 'mono'] as NoteFontFamily[]).map(f => (
                    <button
                      key={f}
                      onClick={() => {
                        setFontFamily(f);
                        setShowFontMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#EAECE6] dark:hover:bg-[#2F3238] cursor-pointer transition-colors ${
                        fontFamily === f
                          ? 'font-semibold text-[#7B8E73] dark:text-[#EEEEEE] bg-[#EEF2EB] dark:bg-[#32353C]'
                          : 'text-[#30332E] dark:text-[#EEEEEE]'
                      }`}
                    >
                      <span>
                        {f === 'sans'
                          ? 'Inter / Sans'
                          : f === 'serif'
                          ? 'Newsreader Serif'
                          : 'JetBrains Mono'}
                      </span>
                      {fontFamily === f && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Zone 3: Primary Actions (Star / Export / More) */}
        {activeView === 'page' && activePage && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleFavorite(activePage.id)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#777B73] hover:text-[#B5944B] dark:text-[#A2A5AC] dark:hover:text-[#CFA862] hover:bg-[#EAECE6] dark:hover:bg-[#282A2F] transition-all cursor-pointer"
              title={activePage.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label="Toggle favorite"
            >
              <Star
                className={`w-4 h-4 transition-transform ${
                  activePage.isFavorite ? 'text-[#B5944B] dark:text-[#CFA862] fill-[#B5944B] dark:fill-[#CFA862] scale-110' : ''
                }`}
              />
            </button>

            <button
              onClick={() => exportPageMarkdown(activePage.id)}
              className="hidden sm:flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-[#777B73] hover:text-[#30332E] dark:text-[#A2A5AC] dark:hover:text-[#EEEEEE] hover:bg-[#EAECE6] dark:hover:bg-[#282A2F] transition-all cursor-pointer"
              title="Export note as Markdown (.md)"
              aria-label="Export Markdown file"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* More Menu Dropdown */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#777B73] hover:text-[#30332E] dark:text-[#A2A5AC] dark:hover:text-[#EEEEEE] hover:bg-[#EAECE6] dark:hover:bg-[#282A2F] transition-all cursor-pointer"
                aria-label="More actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#F2F2ED] dark:bg-[#24262C] border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl shadow-xl z-40 p-1.5 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={async () => {
                      setShowMoreMenu(false);
                      await createPage(
                        {
                          title: 'New Sub-page',
                          content: `# New Sub-page\n\nNested under ${activePage.title}`,
                        },
                        activePage.id
                      );
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#EEF2EB] dark:hover:bg-[#2F3238] flex items-center gap-2.5 text-[#30332E] dark:text-[#EEEEEE] cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#7B8E73] dark:text-[#CBD5E1]" />
                    <span>Add Sub-page</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      exportPageMarkdown(activePage.id);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#EAECE6] dark:hover:bg-[#2F3238] flex items-center gap-2.5 text-[#30332E] dark:text-[#EEEEEE] cursor-pointer transition-colors"
                  >
                    <Download className="w-4 h-4 text-[#6B8B9B] dark:text-[#7C9EB2]" />
                    <span>Export Markdown (.md)</span>
                  </button>

                  <div className="h-[1px] bg-[#E3E4DC] dark:bg-[#32353C] my-1" />

                  <button
                    onClick={() => {
                      setShowMoreMenu(false);
                      deletePage(activePage.id);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F7EFEA] dark:hover:bg-[#2F3238] text-[#8C5237] dark:text-[#DEB29E] flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Move to Trash</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
