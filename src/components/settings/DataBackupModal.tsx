import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Database,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { storageAdapter } from '../../storage/adapter';
import { db, INITIAL_SEED_PAGES } from '../../storage/db';

export const DataBackupModal: React.FC = () => {
  const {
    isBackupModalOpen,
    setIsBackupModalOpen,
    pages,
    archivedPages,
    exportCompleteBackup,
    refreshPages,
    openDashboard,
  } = useWorkspace();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  const jsonInputRef = useRef<HTMLInputElement>(null);
  const mdInputRef = useRef<HTMLInputElement>(null);

  if (!isBackupModalOpen) return null;

  // Handle JSON backup import
  const handleJsonFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus(null);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const text = event.target?.result as string;
        const count = await storageAdapter.importBackup(text, importMode);
        await refreshPages();
        setImportStatus(`Successfully imported ${count} documents (${importMode} mode).`);
      } catch (err: any) {
        setImportError(err.message || 'Failed to import JSON backup file.');
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read the selected file.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Markdown file import (.md)
  const handleMdFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImportStatus(null);
    setImportError(null);

    try {
      let importedCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await file.text();
        await storageAdapter.importMarkdown(file.name, content, false);
        importedCount++;
      }
      await refreshPages();
      setImportStatus(`Successfully imported ${importedCount} Markdown file(s) into your workspace.`);
    } catch (err: any) {
      setImportError(err.message || 'Failed to import Markdown files.');
    }
    e.target.value = '';
  };

  // Reset to default seed notes
  const handleResetToSeeds = async () => {
    const confirm = window.confirm(
      'Reset workspace to initial onboarding notes? This will clear existing notes and reload the starter knowledge base.'
    );
    if (!confirm) return;

    try {
      await db.pages.clear();
      await db.pages.bulkAdd(INITIAL_SEED_PAGES);
      await refreshPages();
      openDashboard();
      setImportStatus('Workspace reset to initial seed notes.');
    } catch (err: any) {
      setImportError(err.message || 'Failed to reset workspace.');
    }
  };

  return (
    <div
      onClick={() => setIsBackupModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#161719]/60 backdrop-blur-xs font-body"
    >
      <div
        className="w-full max-w-lg bg-[#F2F2ED] dark:bg-[#24262C] border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#E3E4DC] dark:border-[#32353C] flex items-center justify-between shrink-0 bg-[#F4F4F0] dark:bg-[#1C1D21]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2EB] dark:bg-[#282A2F] text-[#4F6348] dark:text-[#A2A5AC] border dark:border-[#32353C] flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#30332E] dark:text-[#EEEEEE]">
                Data Management & Backup
              </h2>
              <p className="text-[11px] text-[#777B73] dark:text-[#A2A5AC]">Local IndexedDB workspace</p>
            </div>
          </div>
          <button
            onClick={() => setIsBackupModalOpen(false)}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-[#777B73] hover:text-[#30332E] dark:text-[#A2A5AC] dark:hover:text-[#EEEEEE] rounded-lg hover:bg-[#EAECE6] dark:hover:bg-[#2F3238] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-6 overflow-y-auto text-xs">
          {/* Status Notifications */}
          {importStatus && (
            <div className="p-3 bg-[#EEF2EB] dark:bg-[#282A2F] border border-[#D6DFD1] dark:border-[#383B43] rounded-xl text-[#4F6348] dark:text-[#CBD5E1] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}

          {importError && (
            <div className="p-3 bg-[#F7EFEA] dark:bg-[#282A2F] border border-[#EDDACF] dark:border-[#383B43] rounded-xl text-[#8C5237] dark:text-[#DEB29E] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          {/* Section 1: Storage Overview */}
          <div className="bg-[#F4F4F0] dark:bg-[#1C1D21] p-4 rounded-xl border border-[#E3E4DC] dark:border-[#32353C]">
            <div className="font-semibold text-[#30332E] dark:text-[#EEEEEE] mb-1">
              Local-First IndexedDB Storage
            </div>
            <p className="text-[#777B73] dark:text-[#A2A5AC] leading-relaxed">
              Your notes never leave your device. All documents, properties, and internal links are persisted inside your browser's IndexedDB engine via Dexie.
            </p>
            <div className="mt-3 flex items-center gap-4 text-[#777B73] dark:text-[#A2A5AC] font-medium">
              <span>Active notes: <strong className="tabular-nums text-[#30332E] dark:text-[#EEEEEE]">{pages.length}</strong></span>
              <span>Trash: <strong className="tabular-nums text-[#30332E] dark:text-[#EEEEEE]">{archivedPages.length}</strong></span>
            </div>
          </div>

          {/* Section 2: Complete JSON Backup */}
          <div>
            <div className="font-semibold text-[#30332E] dark:text-[#EEEEEE] mb-1.5 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#7B8E73] dark:text-[#A2A5AC]" />
              <span>Export Complete Backup</span>
            </div>
            <p className="text-[#777B73] dark:text-[#A2A5AC] mb-3 leading-relaxed">
              Downloads a full JSON archive containing all pages, hierarchies, tags, properties, and edit history.
            </p>
            <button
              onClick={exportCompleteBackup}
              className="px-4 py-2.5 bg-[#7B8E73] hover:bg-[#6E8066] dark:bg-[#EEEEEE] dark:hover:bg-[#FFFFFF] dark:text-[#161719] text-white rounded-xl font-semibold shadow-2xs transition-colors cursor-pointer min-h-[44px] flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Full Backup (.json)</span>
            </button>
          </div>

          {/* Section 3: Import JSON Backup */}
          <div className="pt-4 border-t border-[#E3E4DC] dark:border-[#32353C]">
            <div className="font-semibold text-[#30332E] dark:text-[#EEEEEE] mb-1.5 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#6B8B9B] dark:text-[#7C9EB2]" />
              <span>Restore Backup</span>
            </div>
            <p className="text-[#777B73] dark:text-[#A2A5AC] mb-3 leading-relaxed">
              Select a previously exported Kiroku JSON backup file to restore.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
              <label className="text-[#30332E] dark:text-[#A2A5AC] flex items-center gap-2 cursor-pointer py-1">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="accent-[#7B8E73] dark:accent-[#EEEEEE] h-4 w-4"
                />
                <span>Merge (keep existing & add new)</span>
              </label>

              <label className="text-[#30332E] dark:text-[#A2A5AC] flex items-center gap-2 cursor-pointer py-1">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-[#7B8E73] dark:accent-[#EEEEEE] h-4 w-4"
                />
                <span>Replace (overwrite workspace)</span>
              </label>
            </div>

            <input
              ref={jsonInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleJsonFileChange}
              className="hidden"
            />

            <button
              onClick={() => jsonInputRef.current?.click()}
              className="px-4 py-2.5 border border-[#E3E4DC] dark:border-[#32353C] hover:bg-[#EEEEEA] dark:hover:bg-[#282A2F] rounded-xl font-semibold transition-colors text-[#30332E] dark:text-[#EEEEEE] cursor-pointer min-h-[44px] flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Select JSON Backup File</span>
            </button>
          </div>

          {/* Section 4: Import Markdown Files */}
          <div className="pt-4 border-t border-[#E3E4DC] dark:border-[#32353C]">
            <div className="font-semibold text-[#30332E] dark:text-[#EEEEEE] mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#C7876A] dark:text-[#DEB29E]" />
              <span>Import Markdown Documents (.md)</span>
            </div>
            <p className="text-[#777B73] dark:text-[#A2A5AC] mb-3 leading-relaxed">
              Bring notes from Obsidian, Notion, or text editors directly into your workspace.
            </p>

            <input
              ref={mdInputRef}
              type="file"
              accept=".md,.markdown,text/markdown,text/plain"
              multiple
              onChange={handleMdFileChange}
              className="hidden"
            />

            <button
              onClick={() => mdInputRef.current?.click()}
              className="px-4 py-2.5 border border-[#E3E4DC] dark:border-[#32353C] hover:bg-[#EEEEEA] dark:hover:bg-[#282A2F] rounded-xl font-semibold transition-colors text-[#30332E] dark:text-[#EEEEEE] cursor-pointer min-h-[44px] flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Import Markdown File(s)</span>
            </button>
          </div>

          {/* Section 5: Reset Starter Templates */}
          <div className="pt-4 border-t border-[#E3E4DC] dark:border-[#32353C] flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#30332E] dark:text-[#EEEEEE]">
                Sample Starter Notes
              </div>
              <div className="text-[#777B73] dark:text-[#6C7078]">
                Reload the original starter knowledge base
              </div>
            </div>
            <button
              onClick={handleResetToSeeds}
              className="px-3 py-2 text-[#777B73] hover:text-[#8C5237] dark:text-[#6C7078] dark:hover:text-[#DEB29E] hover:bg-[#F7EFEA] dark:hover:bg-[#282A2F] rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Notes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
