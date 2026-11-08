import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { AppShell } from './components/layout/AppShell';
import { TopNav } from './components/layout/TopNav';
import { WorkspaceDashboard } from './components/dashboard/WorkspaceDashboard';
import { InboxView } from './components/inbox/InboxView';
import { AllNotesView } from './components/all-notes/AllNotesView';
import { TrashView } from './components/trash/TrashView';
import { NoteEditor } from './components/editor/NoteEditor';
import { SearchCommandModal } from './components/search/SearchCommandModal';
import { DataBackupModal } from './components/settings/DataBackupModal';

const MainViewContent: React.FC = () => {
  const { activeView, activePage } = useWorkspace();

  if (activeView === 'dashboard') {
    return <WorkspaceDashboard />;
  }

  if (activeView === 'inbox') {
    return <InboxView />;
  }

  if (activeView === 'all-notes') {
    return <AllNotesView />;
  }

  if (activeView === 'trash') {
    return <TrashView />;
  }

  if (activeView === 'page' && activePage) {
    return <NoteEditor />;
  }

  // Fallback to dashboard
  return <WorkspaceDashboard />;
};

export default function App() {
  return (
    <WorkspaceProvider>
      <AppShell>
        <TopNav />
        <main className="flex-1 overflow-hidden flex flex-col relative">
          <MainViewContent />
        </main>
        {/* Global Modals */}
        <SearchCommandModal />
        <DataBackupModal />
      </AppShell>
    </WorkspaceProvider>
  );
}
