import React, { useState } from 'react';
import { Inbox, Plus, FileEdit, Trash2, CheckCircle2 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const InboxView: React.FC = () => {
  const { inboxPages, addQuickCapture, promoteInboxToPage, deletePage, selectPage } = useWorkspace();
  const [quickInput, setQuickInput] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    setIsCapturing(true);
    try {
      await addQuickCapture(quickInput.trim());
      setQuickInput('');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-10 md:px-12 py-5 sm:py-8 max-w-4xl mx-auto w-full pb-28 md:pb-12 font-body">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C5237] dark:text-[#DEB29E] uppercase tracking-wider mb-1">
            <Inbox className="w-4 h-4" />
            <span>Quick Capture Inbox</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#30332E] dark:text-[#EEEEEE] font-heading">
            Unfiled Thoughts & Fleeting Ideas
          </h1>
        </div>
        <div className="text-xs text-[#777B73] dark:text-[#DEB29E] tabular-nums font-semibold px-2.5 py-1 rounded-full bg-[#F7EFEA] dark:bg-[#282A2F] border dark:border-[#32353C]">
          {inboxPages.length} item{inboxPages.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Quick Input Bar */}
      <form onSubmit={handleSubmit} className="mb-7">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-[#F9F9F5] dark:bg-[#222428] border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl p-2.5 shadow-2xs">
          <input
            type="text"
            value={quickInput}
            onChange={e => setQuickInput(e.target.value)}
            placeholder="Type a fleeting idea, link, or note to capture..."
            className="flex-1 px-3 py-2 text-sm bg-transparent outline-none text-[#30332E] dark:text-[#EEEEEE] placeholder-[#969990] dark:placeholder-[#6C7078] min-h-[44px]"
            autoFocus
          />
          <button
            type="submit"
            disabled={!quickInput.trim() || isCapturing}
            className="px-5 py-2.5 bg-[#C7876A] hover:bg-[#B87556] text-white dark:bg-[#EEEEEE] dark:hover:bg-[#FFFFFF] dark:text-[#161719] disabled:opacity-40 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] shadow-2xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Capture</span>
          </button>
        </div>
      </form>

      {/* Inbox Items List */}
      {inboxPages.length > 0 ? (
        <div className="space-y-3">
          {inboxPages.map(item => {
            const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 bg-[#F9F9F5] dark:bg-[#222428] border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl hover:border-[#C7876A]/50 dark:hover:border-[#4B4F58] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 group shadow-2xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg shrink-0 p-1 rounded-lg bg-[#F4F4F0] dark:bg-[#1B1C1F]">{item.icon || '💡'}</span>
                    <h3 className="text-sm font-bold text-[#30332E] dark:text-[#EEEEEE] truncate font-heading">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#777B73] dark:text-[#A2A5AC] line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                  <div className="mt-2 text-[11px] text-[#969990] dark:text-[#6C7078]">
                    Captured {dateStr}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E3E4DC] dark:border-[#32353C]/70">
                  <button
                    onClick={() => promoteInboxToPage(item.id)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#EEF2EB] dark:bg-[#282A2F] text-[#4F6348] dark:text-[#CBD5E1] border dark:border-[#383B43] hover:bg-[#E2EBDD] dark:hover:bg-[#32353C] transition-colors min-h-[40px] cursor-pointer"
                    title="Promote to full workspace document"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Move to Pages</span>
                  </button>

                  <button
                    onClick={() => selectPage(item.id)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#777B73] hover:text-[#30332E] dark:text-[#A2A5AC] dark:hover:text-[#EEEEEE] hover:bg-[#EAECE6] dark:hover:bg-[#282A2F] transition-colors cursor-pointer"
                    title="Open in editor"
                    aria-label="Edit item"
                  >
                    <FileEdit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deletePage(item.id)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#777B73] hover:text-[#8C5237] dark:text-[#A2A5AC] dark:hover:text-[#DEB29E] hover:bg-[#F7EFEA] dark:hover:bg-[#282A2F] transition-colors cursor-pointer"
                    title="Delete item"
                    aria-label="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-[#E3E4DC] dark:border-[#32353C] rounded-2xl bg-[#F9F9F5]/40 dark:bg-[#222428]/40">
          <div className="w-12 h-12 rounded-full bg-[#F7EFEA] dark:bg-[#282A2F] border dark:border-[#32353C] text-[#8C5237] dark:text-[#DEB29E] flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#30332E] dark:text-[#EEEEEE] mb-1 font-heading">
            Inbox is clear
          </h3>
          <p className="text-xs text-[#777B73] dark:text-[#A2A5AC] max-w-sm mx-auto leading-relaxed">
            Your capture queue is empty. Capture thoughts on the go and organize them into your knowledge base when you are ready.
          </p>
        </div>
      )}
    </div>
  );
};
