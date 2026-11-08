import React from 'react';
import { Home, Inbox, Plus, FileText, Search } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const MobileTabBar: React.FC = () => {
  const {
    activeView,
    openDashboard,
    openInbox,
    openAllNotes,
    inboxPages,
    createPage,
    setIsSearchOpen,
  } = useWorkspace();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#F4F4F0]/95 dark:bg-[#161719]/95 backdrop-blur-md border-t border-[#E3E4DC] dark:border-[#32353C] px-2 py-1.5 shadow-lg"
    >
      <div className="grid grid-cols-5 items-center h-12 max-w-md mx-auto">
        {/* Tab 1: Dashboard */}
        <button
          onClick={openDashboard}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all cursor-pointer ${
            activeView === 'dashboard'
              ? 'text-[#7B8E73] dark:text-[#EEEEEE] font-bold'
              : 'text-[#777B73] dark:text-[#A2A5AC] hover:text-[#30332E] dark:hover:text-[#EEEEEE]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* Tab 2: Inbox */}
        <button
          onClick={openInbox}
          className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all cursor-pointer ${
            activeView === 'inbox'
              ? 'text-[#8C5237] dark:text-[#DEB29E] font-bold'
              : 'text-[#777B73] dark:text-[#A2A5AC] hover:text-[#30332E] dark:hover:text-[#EEEEEE]'
          }`}
        >
          <div className="relative">
            <Inbox className="w-5 h-5" />
            {inboxPages.length > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold bg-[#C7876A] dark:bg-[#383B43] text-white dark:text-[#EEEEEE] border dark:border-[#32353C] rounded-full min-w-[14px] h-[14px] flex items-center justify-center tabular-nums shadow-xs">
                {inboxPages.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Inbox</span>
        </button>

        {/* Tab 3: Quick New Note Action */}
        <div className="flex items-center justify-center">
          <button
            onClick={() =>
              createPage({ title: 'Untitled Note', content: '# Untitled Note\n\n' })
            }
            className="w-10 h-10 rounded-full bg-[#7B8E73] text-white dark:bg-[#EEEEEE] dark:text-[#161719] flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer font-bold"
            title="Create new note"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 4: All Notes */}
        <button
          onClick={openAllNotes}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-all cursor-pointer ${
            activeView === 'all-notes'
              ? 'text-[#6B8B9B] dark:text-[#CBD5E1] font-bold'
              : 'text-[#777B73] dark:text-[#A2A5AC] hover:text-[#30332E] dark:hover:text-[#EEEEEE]'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Notes</span>
        </button>

        {/* Tab 5: Search Modal Trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-[#777B73] dark:text-[#A2A5AC] hover:text-[#30332E] dark:hover:text-[#EEEEEE] transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Search</span>
        </button>
      </div>
    </nav>
  );
};
