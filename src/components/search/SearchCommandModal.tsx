import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Plus, ArrowRight, X, Sparkles } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTagColorClasses } from '../../utils/tagColors';

export const SearchCommandModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, pages, selectPage, createPage } = useWorkspace();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [...pages]
        .filter(p => !p.isInbox && !p.isArchived)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 6);
    }

    return pages
      .filter(p => !p.isArchived)
      .filter(p => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const contentMatch = p.content.toLowerCase().includes(q);
        const tagMatch = p.tags.some(t => t.toLowerCase().includes(q));
        const propMatch = Object.entries(p.properties).some(
          ([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
        );
        return titleMatch || contentMatch || tagMatch || propMatch;
      })
      .slice(0, 8);
  }, [query, pages]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < searchResults.length) {
        selectPage(searchResults[selectedIndex].id);
        setIsSearchOpen(false);
      } else if (query.trim()) {
        createPage({ title: query.trim(), content: `# ${query.trim()}\n\n` });
        setIsSearchOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div
      onClick={() => setIsSearchOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-16 md:pt-20 px-3 sm:px-4 bg-[#161719]/60 backdrop-blur-xs font-body"
    >
      <div
        className="w-full max-w-xl bg-[#F2F2ED] dark:bg-[#24262C] border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#E3E4DC] dark:border-[#32353C] flex items-center gap-2.5 bg-[#F4F4F0] dark:bg-[#1C1D21]">
          <Search className="w-5 h-5 text-[#7B8E73] dark:text-[#A2A5AC] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search notes, tags, or content..."
            className="flex-1 text-sm bg-transparent outline-none text-[#30332E] dark:text-[#EEEEEE] placeholder-[#777B73] dark:placeholder-[#6C7078] min-h-[36px]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#777B73] hover:text-[#30332E] dark:text-[#6C7078] dark:hover:text-[#EEEEEE] rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="min-h-[36px] px-2.5 text-xs font-medium text-[#777B73] hover:text-[#30332E] dark:text-[#A2A5AC] dark:hover:text-[#EEEEEE] rounded-lg hover:bg-[#EAECE6] dark:hover:bg-[#2F3238] transition-colors cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto p-2 divide-y divide-[#E3E4DC]/60 dark:divide-[#32353C]/60">
          {searchResults.length > 0 ? (
            searchResults.map((page, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={page.id}
                  onClick={() => {
                    selectPage(page.id);
                    setIsSearchOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors min-h-[52px] ${
                    isSelected
                      ? 'bg-[#EEEEEA] dark:bg-[#2F3238] text-[#30332E] dark:text-[#EEEEEE] shadow-2xs'
                      : 'text-[#30332E] dark:text-[#A2A5AC] hover:bg-[#EAECE6]/60 dark:hover:bg-[#2F3238]/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl shrink-0">{page.icon || '📄'}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate flex items-center gap-1.5 text-[#30332E] dark:text-[#EEEEEE]">
                        <span>{page.title}</span>
                        {page.isInbox && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#F7EFEA] dark:bg-[#383B43] text-[#8C5237] dark:text-[#DEB29E] font-medium border dark:border-[#32353C]">
                            Inbox
                          </span>
                        )}
                      </div>
                      {query ? (
                        <div className="text-[11px] text-[#777B73] dark:text-[#6C7078] truncate mt-0.5">
                          {page.content.replace(/^[#\s\-*]+/gm, '').slice(0, 75)}
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#777B73] dark:text-[#6C7078] truncate mt-0.5">
                          Updated {new Date(page.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 text-[11px] pl-2">
                    {page.tags.slice(0, 2).map(t => (
                      <span
                        key={t}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getTagColorClasses(t)}`}
                      >
                        #{t}
                      </span>
                    ))}
                    <ArrowRight className={`w-3.5 h-3.5 transition-opacity ${isSelected ? 'opacity-100 text-[#7B8E73] dark:text-[#EEEEEE]' : 'opacity-0'}`} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#777B73] dark:text-[#6C7078]">
              No matching documents found
            </div>
          )}

          {/* Quick Create option */}
          {query.trim() && (
            <div
              onClick={() => {
                createPage({ title: query.trim(), content: `# ${query.trim()}\n\n` });
                setIsSearchOpen(false);
              }}
              onMouseEnter={() => setSelectedIndex(searchResults.length)}
              className={`p-3 mt-1 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors text-xs font-semibold min-h-[48px] ${
                selectedIndex === searchResults.length
                  ? 'bg-[#EEF2EB] dark:bg-[#32353C] text-[#4F6348] dark:text-[#EEEEEE] border dark:border-[#4B4F58]'
                  : 'bg-[#EEF2EB]/60 dark:bg-[#282A2F] text-[#4F6348] dark:text-[#A2A5AC] hover:bg-[#EEF2EB] dark:hover:bg-[#32353C]'
              }`}
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>
                Create new document "<strong>{query.trim()}</strong>"
              </span>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-[#F4F4F0] dark:bg-[#1C1D21] border-t border-[#E3E4DC] dark:border-[#32353C] text-[11px] text-[#777B73] dark:text-[#6C7078] flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#F9F9F5] dark:bg-[#282A2F] border border-[#E3E4DC] dark:border-[#32353C] text-[10px]">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#F9F9F5] dark:bg-[#282A2F] border border-[#E3E4DC] dark:border-[#32353C] text-[10px]">↵</kbd>
              Open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#F9F9F5] dark:bg-[#282A2F] border border-[#E3E4DC] dark:border-[#32353C] text-[10px]">ESC</kbd>
              Close
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#7B8E73] dark:text-[#A2A5AC] flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Kiroku Search
          </span>
        </div>
      </div>
    </div>
  );
};
