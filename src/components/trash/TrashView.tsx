import React from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const TrashView: React.FC = () => {
  const { archivedPages, restorePage, deletePage } = useWorkspace();

  const handleEmptyTrash = async () => {
    if (archivedPages.length === 0) return;
    const confirm = window.confirm(
      `Are you sure you want to permanently delete all ${archivedPages.length} items in the trash? This action cannot be undone.`
    );
    if (confirm) {
      for (const p of archivedPages) {
        await deletePage(p.id, true);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-10 md:px-12 py-5 sm:py-8 max-w-4xl mx-auto w-full pb-28 md:pb-12 font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C5237] dark:text-[#DEB29E] uppercase tracking-wider mb-1">
            <Trash2 className="w-3.5 h-3.5" />
            <span>Trash</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#30332E] dark:text-[#EEEEEE] font-heading">
            Archived Documents
          </h1>
          <p className="text-xs text-[#777B73] dark:text-[#6C7078] mt-1">
            Items in trash can be restored anytime or deleted permanently.
          </p>
        </div>

        {archivedPages.length > 0 && (
          <button
            onClick={handleEmptyTrash}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold text-[#8C5237] dark:text-[#DEB29E] border border-[#E3E4DC] dark:border-[#383B43] hover:bg-[#F7EFEA] dark:hover:bg-[#282A2F] transition-colors cursor-pointer min-h-[40px]"
          >
            Empty Trash
          </button>
        )}
      </div>

      {archivedPages.length > 0 ? (
        <div className="border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl bg-[#F9F9F5] dark:bg-[#222428] divide-y divide-[#E3E4DC] dark:divide-[#32353C]/70 overflow-hidden shadow-2xs">
          {archivedPages.map(page => {
            const dateStr = new Date(page.updatedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={page.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-[#F2F2ED] dark:hover:bg-[#282A2F] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl shrink-0 opacity-80 p-1 rounded-lg bg-[#F4F4F0] dark:bg-[#1B1C1F]">{page.icon || '📄'}</span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#30332E] dark:text-[#EEEEEE] truncate font-heading">
                      {page.title}
                    </h3>
                    <div className="text-xs text-[#777B73] dark:text-[#6C7078] truncate mt-0.5">
                      Archived on {dateStr}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E3E4DC] dark:border-[#32353C]/70">
                  <button
                    onClick={() => restorePage(page.id)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#EEEEEA] dark:bg-[#282A2F] hover:bg-[#E2E4DC] dark:hover:bg-[#32353C] text-[#30332E] dark:text-[#EEEEEE] transition-colors cursor-pointer min-h-[40px]"
                    title="Restore document"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#7B8E73] dark:text-[#A2A5AC]" />
                    <span>Restore</span>
                  </button>

                  <button
                    onClick={() => {
                      const confirm = window.confirm(
                        `Permanently delete "${page.title}"? This cannot be undone.`
                      );
                      if (confirm) deletePage(page.id, true);
                    }}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#777B73] hover:text-[#8C5237] dark:text-[#6C7078] dark:hover:text-[#DEB29E] hover:bg-[#F7EFEA] dark:hover:bg-[#282A2F] transition-colors cursor-pointer"
                    title="Delete permanently"
                    aria-label="Delete permanently"
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
          <Trash2 className="w-10 h-10 text-[#969990] dark:text-[#6C7078] mx-auto mb-2 opacity-40" />
          <h3 className="text-sm font-semibold text-[#30332E] dark:text-[#EEEEEE] mb-1 font-heading">
            Trash is empty
          </h3>
          <p className="text-xs text-[#777B73] dark:text-[#6C7078] max-w-xs mx-auto">
            Deleted notes appear here before being permanently removed.
          </p>
        </div>
      )}
    </div>
  );
};
