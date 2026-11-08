import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Plus,
  Tag as TagIcon,
  Star,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTagColorClasses } from '../../utils/tagColors';

export const AllNotesView: React.FC = () => {
  const {
    pages,
    selectPage,
    createPage,
    selectedTag,
    filterByTag,
    allTags,
    toggleFavorite,
  } = useWorkspace();

  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'title' | 'created'>('updated');

  const filteredNotes = useMemo(() => {
    return pages
      .filter(p => !p.isInbox)
      .filter(p => {
        if (selectedTag && !p.tags.includes(selectedTag)) return false;
        if (!searchFilter.trim()) return true;
        const q = searchFilter.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'created') return b.createdAt - a.createdAt;
        return b.updatedAt - a.updatedAt;
      });
  }, [pages, selectedTag, searchFilter, sortBy]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-10 md:px-12 py-5 sm:py-8 max-w-5xl mx-auto w-full pb-28 md:pb-12 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#30332E] dark:text-[#EEEEEE] mb-1 font-heading">
            All Documents
          </h1>
          <p className="text-xs text-[#777B73] dark:text-[#A2A5AC]">
            {filteredNotes.length} document{filteredNotes.length === 1 ? '' : 's'}
            {selectedTag && (
              <>
                {' '}filtered by tag <span className="font-bold text-[#7B8E73] dark:text-[#EEEEEE]">#{selectedTag}</span>
                <button
                  onClick={() => filterByTag(null)}
                  className="ml-2 text-[#777B73] dark:text-[#A2A5AC] hover:text-[#30332E] dark:hover:text-[#EEEEEE] underline cursor-pointer"
                >
                  Clear filter
                </button>
              </>
            )}
          </p>
        </div>

        <button
          onClick={() => createPage({ title: 'Untitled Note', content: '# Untitled Note\n\n' })}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7B8E73] hover:bg-[#6E8066] text-white dark:bg-[#EEEEEE] dark:hover:bg-[#FFFFFF] dark:text-[#161719] rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[44px] shadow-2xs active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#777B73] dark:text-[#6C7078] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Filter documents by title, content, or tag..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F9F9F5] dark:bg-[#222428] border border-[#E3E4DC] dark:border-[#32353C] rounded-xl text-xs text-[#30332E] dark:text-[#EEEEEE] placeholder-[#969990] dark:placeholder-[#6C7078] outline-none focus:border-[#7B8E73] dark:focus:border-[#4B4F58] transition-colors min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-[#F9F9F5] dark:bg-[#222428] border border-[#E3E4DC] dark:border-[#32353C] rounded-xl p-1 text-xs text-[#777B73] dark:text-[#A2A5AC] min-h-[44px]">
            <span className="text-[11px] text-[#969990] dark:text-[#6C7078] px-2 font-medium">Sort:</span>
            <button
              onClick={() => setSortBy('updated')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer min-h-[34px] ${
                sortBy === 'updated'
                  ? 'bg-[#EEEEEA] dark:bg-[#32353C] font-bold text-[#30332E] dark:text-[#EEEEEE] shadow-2xs'
                  : 'hover:text-[#30332E] dark:hover:text-[#EEEEEE]'
              }`}
            >
              Updated
            </button>
            <button
              onClick={() => setSortBy('title')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer min-h-[34px] ${
                sortBy === 'title'
                  ? 'bg-[#EEEEEA] dark:bg-[#32353C] font-bold text-[#30332E] dark:text-[#EEEEEE] shadow-2xs'
                  : 'hover:text-[#30332E] dark:hover:text-[#EEEEEE]'
              }`}
            >
              Title
            </button>
            <button
              onClick={() => setSortBy('created')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer min-h-[34px] ${
                sortBy === 'created'
                  ? 'bg-[#EEEEEA] dark:bg-[#32353C] font-bold text-[#30332E] dark:text-[#EEEEEE] shadow-2xs'
                  : 'hover:text-[#30332E] dark:hover:text-[#EEEEEE]'
              }`}
            >
              Created
            </button>
          </div>
        </div>
      </div>

      {/* Tags Bar */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar pb-2 mb-5">
          <span className="text-xs text-[#969990] dark:text-[#6C7078] flex items-center gap-1 mr-1 shrink-0">
            <TagIcon className="w-3.5 h-3.5 text-[#7B8E73] dark:text-[#A2A5AC]" />
            Tags:
          </span>
          <button
            onClick={() => filterByTag(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer min-h-[34px] ${
              selectedTag === null
                ? 'bg-[#7B8E73] text-white dark:bg-[#EEEEEE] dark:text-[#161719] shadow-2xs font-bold'
                : 'bg-[#F9F9F5] dark:bg-[#222428] border border-[#E3E4DC] dark:border-[#32353C] text-[#777B73] dark:text-[#A2A5AC] hover:bg-[#EAECE6] dark:hover:bg-[#282A2F]'
            }`}
          >
            All
          </button>
          {allTags.map(tag => {
            const isSelected = selectedTag === tag.name;
            const tagClasses = getTagColorClasses(tag.name);
            return (
              <button
                key={tag.name}
                onClick={() => filterByTag(isSelected ? null : tag.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[34px] ${tagClasses} ${
                  isSelected ? 'ring-2 ring-[#7B8E73] dark:ring-[#EEEEEE] font-bold shadow-2xs' : 'opacity-90 hover:opacity-100 hover:scale-[1.02]'
                }`}
              >
                <span>#{tag.name}</span>
                <span className="text-[10px] opacity-75 tabular-nums">({tag.count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Notes List */}
      {filteredNotes.length > 0 ? (
        <div className="border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl bg-[#F9F9F5] dark:bg-[#222428] divide-y divide-[#E3E4DC] dark:divide-[#32353C]/70 overflow-hidden shadow-2xs">
          {filteredNotes.map(note => {
            const dateStr = new Date(note.updatedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={note.id}
                onClick={() => selectPage(note.id)}
                className="p-4 flex items-center justify-between gap-3 sm:gap-4 hover:bg-[#F2F2ED] dark:hover:bg-[#282A2F] cursor-pointer transition-colors group active:bg-[#EAECE6] dark:active:bg-[#2F3238] min-h-[60px]"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleFavorite(note.id);
                    }}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#969990] hover:text-[#B5944B] dark:text-[#6C7078] dark:hover:text-[#CFA862] transition-colors shrink-0 cursor-pointer"
                    aria-label="Toggle favorite"
                  >
                    <Star
                      className={`w-4 h-4 transition-transform ${
                        note.isFavorite ? 'text-[#B5944B] dark:text-[#CFA862] fill-[#B5944B] dark:fill-[#CFA862] scale-110' : ''
                      }`}
                    />
                  </button>
                  <span className="text-xl shrink-0 p-1 rounded-lg bg-[#F4F4F0] dark:bg-[#1B1C1F]">{note.icon || '📄'}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[#30332E] dark:text-[#EEEEEE] group-hover:text-[#7B8E73] dark:group-hover:text-[#FFFFFF] transition-colors truncate font-heading">
                      {note.title}
                    </div>
                    <div className="text-xs text-[#777B73] dark:text-[#A2A5AC] truncate mt-0.5">
                      {note.content.replace(/^[#\s\-*]+/gm, '').slice(0, 90) || 'Empty document'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs text-[#777B73] dark:text-[#A2A5AC]">
                  {note.tags.length > 0 && (
                    <div className="hidden md:flex items-center gap-1.5">
                      {note.tags.slice(0, 2).map(t => (
                        <span
                          key={t}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${getTagColorClasses(t)}`}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="tabular-nums font-medium">{dateStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-[#E3E4DC] dark:border-[#32353C] rounded-2xl bg-[#F9F9F5]/40 dark:bg-[#222428]/40">
          <FileText className="w-10 h-10 text-[#969990] dark:text-[#6C7078] mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-bold text-[#30332E] dark:text-[#EEEEEE] mb-1 font-heading">
            No documents found
          </h3>
          <p className="text-xs text-[#777B73] dark:text-[#A2A5AC] max-w-xs mx-auto mb-4">
            Try adjusting your search query or tag filter, or create a new document.
          </p>
          <button
            onClick={() => createPage({ title: 'Untitled Note', content: '# Untitled Note\n\n' })}
            className="px-4 py-2 bg-[#7B8E73] dark:bg-[#EEEEEE] text-white dark:text-[#161719] rounded-xl text-xs font-bold hover:opacity-90 cursor-pointer shadow-2xs"
          >
            Create Note
          </button>
        </div>
      )}
    </div>
  );
};
