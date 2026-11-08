import React, { useState } from 'react';
import {
  Plus,
  Star,
  Clock,
  ArrowRight,
  Inbox,
  Upload,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getTagColorClasses } from '../../utils/tagColors';

export const WorkspaceDashboard: React.FC = () => {
  const {
    pages,
    inboxPages,
    createPage,
    selectPage,
    openInbox,
    addQuickCapture,
    setIsBackupModalOpen,
  } = useWorkspace();

  const [quickThought, setQuickThought] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick capture submit
  const handleCaptureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickThought.trim()) return;
    setIsSubmitting(true);
    try {
      await addQuickCapture(quickThought.trim());
      setQuickThought('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Favorites
  const favorites = pages.filter(p => p.isFavorite && !p.isInbox);

  // Recent notes (excluding inbox)
  const recentNotes = [...pages]
    .filter(p => !p.isInbox)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 6);

  // Formatted date
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-10 md:px-12 py-5 sm:py-8 max-w-5xl mx-auto w-full pb-28 md:pb-12 font-body">
      {/* Header Greeting */}
      <div className="mb-6 sm:mb-8">
        <div className="text-xs font-semibold text-[#777B73] dark:text-[#A2A5AC] mb-1.5 flex items-center gap-2 tracking-wide">
          <span className="w-2 h-2 rounded-full bg-[#7B8E73] dark:bg-[#A2A5AC]" />
          <span>{today}</span>
          <span aria-hidden="true" className="text-[#969990] dark:text-[#6C7078]">·</span>
          <span>Personal Knowledge Base</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#30332E] dark:text-[#EEEEEE] font-heading">
          Good day. What are you cultivating?
        </h1>
      </div>

      {/* Quick Capture Box (Inbox entry) */}
      <div className="mb-8 bg-[#F9F9F5] dark:bg-[#222428] border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl p-4 sm:p-5 shadow-2xs transition-shadow">
        <form onSubmit={handleCaptureSubmit}>
          <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold text-[#8C5237] dark:text-[#DEB29E] uppercase tracking-wider">
            <Inbox className="w-3.5 h-3.5" />
            <span>Quick Capture (Saves to Inbox)</span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <input
              type="text"
              value={quickThought}
              onChange={e => setQuickThought(e.target.value)}
              placeholder="Jot down a fleeting thought, URL, or quick reflection..."
              className="flex-1 bg-[#F4F4F0] dark:bg-[#1B1C1F] border border-[#E3E4DC] dark:border-[#32353C] rounded-xl px-4 py-3 text-sm text-[#30332E] dark:text-[#EEEEEE] placeholder-[#969990] dark:placeholder-[#6C7078] focus:outline-none focus:border-[#7B8E73] dark:focus:border-[#4B4F58] transition-colors"
            />
            <button
              type="submit"
              disabled={!quickThought.trim() || isSubmitting}
              className="px-5 py-3 bg-[#7B8E73] hover:bg-[#6E8066] text-white dark:bg-[#EEEEEE] dark:hover:bg-[#FFFFFF] dark:text-[#161719] disabled:opacity-40 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[44px] flex items-center justify-center shadow-2xs active:scale-[0.98]"
            >
              Capture
            </button>
          </div>
        </form>

        {inboxPages.length > 0 && (
          <div className="mt-3.5 pt-3.5 border-t border-[#E3E4DC] dark:border-[#32353C]/70 flex items-center justify-between text-xs text-[#777B73] dark:text-[#A2A5AC]">
            <span>
              You have <strong className="text-[#30332E] dark:text-[#EEEEEE] tabular-nums font-bold">{inboxPages.length}</strong> unfiled item{inboxPages.length === 1 ? '' : 's'} in Inbox
            </span>
            <button
              onClick={openInbox}
              className="text-[#8C5237] dark:text-[#DEB29E] hover:underline flex items-center gap-1 font-semibold cursor-pointer min-h-[36px]"
            >
              <span>Review Inbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8">
        <button
          onClick={() => createPage({ title: 'Untitled Note', content: '# Untitled Note\n\n' })}
          className="flex items-center gap-3.5 p-4 rounded-2xl border border-[#E3E4DC] dark:border-[#32353C] bg-[#F9F9F5] dark:bg-[#222428] hover:border-[#7B8E73]/60 dark:hover:border-[#4B4F58] hover:shadow-xs transition-all text-left group cursor-pointer active:scale-[0.99] min-h-[60px]"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EEF2EB] dark:bg-[#282A2F] text-[#4F6348] dark:text-[#CBD5E1] border dark:border-[#32353C] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#30332E] dark:text-[#EEEEEE] group-hover:text-[#7B8E73] dark:group-hover:text-[#FFFFFF] transition-colors truncate font-heading">
              New Blank Note
            </div>
            <div className="text-[11px] text-[#777B73] dark:text-[#A2A5AC] truncate">Start writing in Markdown</div>
          </div>
        </button>

        <button
          onClick={openInbox}
          className="flex items-center gap-3.5 p-4 rounded-2xl border border-[#E3E4DC] dark:border-[#32353C] bg-[#F9F9F5] dark:bg-[#222428] hover:border-[#C7876A]/60 dark:hover:border-[#4B4F58] hover:shadow-xs transition-all text-left group cursor-pointer active:scale-[0.99] min-h-[60px]"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F7EFEA] dark:bg-[#282A2F] text-[#8C5237] dark:text-[#DEB29E] border dark:border-[#32353C] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Inbox className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#30332E] dark:text-[#EEEEEE] group-hover:text-[#8C5237] dark:group-hover:text-[#DEB29E] transition-colors truncate font-heading">
              Inbox ({inboxPages.length})
            </div>
            <div className="text-[11px] text-[#777B73] dark:text-[#A2A5AC] truncate">Triage fleeting ideas</div>
          </div>
        </button>

        <button
          onClick={() => setIsBackupModalOpen(true)}
          className="flex items-center gap-3.5 p-4 rounded-2xl border border-[#E3E4DC] dark:border-[#32353C] bg-[#F9F9F5] dark:bg-[#222428] hover:border-[#6B8B9B]/60 dark:hover:border-[#4B4F58] hover:shadow-xs transition-all text-left group cursor-pointer active:scale-[0.99] min-h-[60px]"
        >
          <div className="w-10 h-10 rounded-xl bg-[#EEF1F5] dark:bg-[#282A2F] text-[#3E5568] dark:text-[#7C9EB2] border dark:border-[#32353C] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-[#30332E] dark:text-[#EEEEEE] group-hover:text-[#6B8B9B] dark:group-hover:text-[#7C9EB2] transition-colors truncate font-heading">
              Import & Export
            </div>
            <div className="text-[11px] text-[#777B73] dark:text-[#A2A5AC] truncate">JSON backup & Markdown</div>
          </div>
        </button>
      </div>

      {/* Pinned / Favorites */}
      {favorites.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[#969990] dark:text-[#6C7078] uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 text-[#B5944B] dark:text-[#CFA862] fill-[#B5944B] dark:fill-[#CFA862]" />
            <span>Pinned Documents</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {favorites.map(fav => (
              <div
                key={fav.id}
                onClick={() => selectPage(fav.id)}
                className="p-4 rounded-2xl border border-[#E3E4DC] dark:border-[#32353C] bg-[#F9F9F5] dark:bg-[#222428] hover:border-[#7B8E73]/50 dark:hover:border-[#4B4F58] hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between min-h-[128px] active:scale-[0.99]"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl shrink-0">{fav.icon || '📄'}</span>
                    <h3 className="text-sm font-bold text-[#30332E] dark:text-[#EEEEEE] group-hover:text-[#7B8E73] dark:group-hover:text-[#FFFFFF] transition-colors truncate font-heading">
                      {fav.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#777B73] dark:text-[#A2A5AC] line-clamp-2 leading-relaxed">
                    {fav.content.replace(/^[#\s\-*]+/gm, '').trim() || 'Empty document'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] mt-2.5 flex-wrap">
                  {fav.tags.slice(0, 2).map(t => (
                    <span
                      key={t}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${getTagColorClasses(t)}`}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Notes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#969990] dark:text-[#6C7078] uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#777B73] dark:text-[#A2A5AC]" />
            <span>Recently Updated</span>
          </div>
          <span className="text-xs text-[#777B73] dark:text-[#A2A5AC] tabular-nums font-medium">
            {pages.filter(p => !p.isInbox).length} total notes
          </span>
        </div>

        <div className="border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl bg-[#F9F9F5] dark:bg-[#222428] divide-y divide-[#E3E4DC] dark:divide-[#32353C]/70 overflow-hidden shadow-2xs">
          {recentNotes.map(note => {
            const dateStr = new Date(note.updatedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });
            return (
              <div
                key={note.id}
                onClick={() => selectPage(note.id)}
                className="p-4 flex items-center justify-between gap-4 hover:bg-[#F2F2ED] dark:hover:bg-[#282A2F] cursor-pointer transition-colors group active:bg-[#EAECE6] dark:active:bg-[#2F3238] min-h-[60px]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="text-xl shrink-0 p-1 rounded-lg bg-[#EEEEEA] dark:bg-[#1B1C1F]">{note.icon || '📄'}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#30332E] dark:text-[#EEEEEE] group-hover:text-[#7B8E73] dark:group-hover:text-[#FFFFFF] transition-colors truncate font-heading">
                      {note.title}
                    </div>
                    <div className="text-xs text-[#777B73] dark:text-[#A2A5AC] truncate mt-0.5">
                      {note.content.replace(/^[#\s\-*]+/gm, '').slice(0, 80) || 'Empty note'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs text-[#777B73] dark:text-[#A2A5AC]">
                  {note.tags.length > 0 && (
                    <span className={`hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-medium ${getTagColorClasses(note.tags[0])}`}>
                      #{note.tags[0]}
                    </span>
                  )}
                  <span className="tabular-nums font-medium">{dateStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
