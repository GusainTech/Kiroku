import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Tag,
  Plus,
  X,
  FileText,
  Link as LinkIcon,
  CheckSquare,
  List,
  Heading1,
  Heading2,
  Code,
  Quote,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  Palette,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { MarkdownRenderer } from './MarkdownRenderer';
import { extractInternalLinks } from '../../storage/adapter';
import { getTagColorClasses } from '../../utils/tagColors';
import { saveCoordinator, type SaveState } from '../../storage/saveCoordinator';

const CURATED_ICONS = [
  '🌿', '📝', '💡', '🗺️', '☕', '📐', '🎯', '🚀',
  '📚', '🔬', '🛠️', '🎨', '💼', '📌', '⚡', '🧠',
  '🧩', '🏷️', '🪴', '✨', '💻', '📈', '🔑', '🕊️'
];

// Clean, understated accent colors
const COVER_COLORS = [
  { name: 'None', value: null },
  { name: 'Slate', value: '#64748B' },
  { name: 'Stone', value: '#78716C' },
  { name: 'Warm Sand', value: '#B39A72' },
  { name: 'Terracotta', value: '#BA6A4B' },
  { name: 'Sage', value: '#6B8263' },
  { name: 'Charcoal', value: '#333742' },
];

export const NoteEditor: React.FC = () => {
  const {
    activePage,
    updateCurrentPage,
    createPage,
    pages,
    selectPage,
    fontFamily,
    viewMode,
    activeBacklinks,
    allTags,
  } = useWorkspace();

  if (!activePage) return null;

  // Local input state and coordinator save state
  const [title, setTitle] = useState(activePage.title);
  const [content, setContent] = useState(activePage.content);
  const [saveState, setSaveState] = useState<SaveState>(() => saveCoordinator.getState());
  const [showProperties, setShowProperties] = useState(true);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Custom Property inputs
  const [newPropKey, setNewPropKey] = useState('');
  const [newPropValue, setNewPropValue] = useState('');
  const [isAddingProperty, setIsAddingProperty] = useState(false);

  // Internal Link completion popup
  const [linkSuggestQuery, setLinkSuggestQuery] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Subscribe to SaveCoordinator state updates
  useEffect(() => {
    return saveCoordinator.subscribe(setSaveState);
  }, []);

  // Sync state and SaveCoordinator document baseline when active page changes
  useEffect(() => {
    setTitle(activePage.title);
    setContent(activePage.content);
    saveCoordinator.setDocument(activePage.id, activePage.title, activePage.content);
    setShowIconPicker(false);
    setShowCoverPicker(false);
  }, [activePage.id]);

  // Unmount cleanup: best-effort flush of any pending edits
  useEffect(() => {
    return () => {
      saveCoordinator.flushPendingSave();
    };
  }, []);

  // Outgoing internal links from this note
  const outgoingLinks = useMemo(() => {
    return extractInternalLinks(content);
  }, [content]);

  // Child pages nested under this note
  const childPages = useMemo(() => {
    return pages.filter(p => p.parentId === activePage.id);
  }, [pages, activePage.id]);

  // Handle typing inside textarea to detect `[[` for Obsidian auto-complete
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    setContent(val);
    setCursorPosition(pos);
    saveCoordinator.updateDraft(activePage.id, title, val);

    // Look backward from cursor to see if user typed `[[`
    const textBeforeCursor = val.slice(0, pos);
    const lastOpenIndex = textBeforeCursor.lastIndexOf('[[');
    if (lastOpenIndex !== -1) {
      const textAfterOpen = textBeforeCursor.slice(lastOpenIndex + 2);
      if (!textAfterOpen.includes(']]') && !textAfterOpen.includes('\n')) {
        setLinkSuggestQuery(textAfterOpen);
        return;
      }
    }
    setLinkSuggestQuery(null);
  };

  // Insert internal link at cursor
  const handleInsertLink = (targetTitle: string) => {
    if (!textareaRef.current) return;
    const pos = cursorPosition;
    const textBefore = content.slice(0, pos);
    const textAfter = content.slice(pos);

    let newContent = '';
    const lastOpenIndex = textBefore.lastIndexOf('[[');
    if (lastOpenIndex !== -1 && linkSuggestQuery !== null) {
      newContent = textBefore.slice(0, lastOpenIndex) + `[[${targetTitle}]] ` + textAfter;
    } else {
      newContent = textBefore + `[[${targetTitle}]] ` + textAfter;
    }

    setContent(newContent);
    saveCoordinator.updateDraft(activePage.id, title, newContent);
    setLinkSuggestQuery(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Toolbar actions
  const applyToolbarFormat = (prefix: string, suffix = '') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);

    const replacement = prefix + (selected || 'text') + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    saveCoordinator.updateDraft(activePage.id, title, newContent);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 0);
  };

  // Add Tag
  const handleAddTag = async (tagToAdd: string) => {
    const clean = tagToAdd.trim().toLowerCase().replace(/^#/, '');
    if (!clean) return;
    const currentTags = activePage.tags || [];
    if (!currentTags.includes(clean)) {
      await updateCurrentPage({ tags: [...currentTags, clean] });
    }
    setNewTagInput('');
    setShowTagDropdown(false);
  };

  // Remove Tag
  const handleRemoveTag = async (tagToRemove: string) => {
    const currentTags = activePage.tags || [];
    await updateCurrentPage({ tags: currentTags.filter(t => t !== tagToRemove) });
  };

  // Add Property
  const handleAddProperty = async () => {
    if (!newPropKey.trim()) return;
    const updatedProps = {
      ...activePage.properties,
      [newPropKey.trim()]: newPropValue.trim(),
    };
    await updateCurrentPage({ properties: updatedProps });
    setNewPropKey('');
    setNewPropValue('');
    setIsAddingProperty(false);
  };

  // Delete Property
  const handleDeleteProperty = async (key: string) => {
    const updatedProps = { ...activePage.properties };
    delete updatedProps[key];
    await updateCurrentPage({ properties: updatedProps });
  };

  // Font family class
  const fontClass =
    fontFamily === 'serif'
      ? 'note-prose-serif'
      : fontFamily === 'mono'
      ? 'note-prose-mono'
      : 'note-prose-sans';

  // Filtered pages for link autocomplete
  const linkSuggestions = useMemo(() => {
    if (linkSuggestQuery === null) return [];
    const q = linkSuggestQuery.toLowerCase().trim();
    return pages
      .filter(p => p.id !== activePage.id && p.title.toLowerCase().includes(q))
      .slice(0, 5);
  }, [linkSuggestQuery, pages, activePage.id]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#F7F7F3] dark:bg-[#1B1C1F] font-body">
      {/* Cover Color Strip */}
      {activePage.coverColor && (
        <div
          className="h-8 sm:h-10 w-full transition-all shrink-0 opacity-90 shadow-2xs"
          style={{ backgroundColor: activePage.coverColor }}
        />
      )}

      {/* Editor Content Area */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-10 py-5 sm:py-7 flex-1 flex flex-col pb-28 md:pb-16">
        {/* Top Controls: Cover & Icon Trigger & Save status */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-2xl rounded-2xl hover:bg-[#EAECE6] dark:hover:bg-[#282A2F] transition-all cursor-pointer shadow-2xs hover:scale-105"
              title="Change note icon"
              aria-label="Change note icon"
            >
              {activePage.icon || '📄'}
            </button>

            <button
              onClick={() => setShowCoverPicker(!showCoverPicker)}
              className="flex items-center gap-1.5 min-h-[40px] px-3 py-1.5 text-xs text-[#777B73] dark:text-[#A2A5AC] hover:text-[#30332E] dark:hover:text-[#EEEEEE] hover:bg-[#EAECE6] dark:hover:bg-[#282A2F] rounded-xl transition-all cursor-pointer"
            >
              <Palette className="w-3.5 h-3.5 text-[#7B8E73] dark:text-[#A2A5AC]" />
              <span>{activePage.coverColor ? 'Change Accent' : 'Add Accent'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#777B73] dark:text-[#A2A5AC]">
            {saveState.status === 'saving' && (
              <span className="flex items-center gap-1.5 text-[#C7876A] dark:text-[#DEB29E] font-semibold">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </span>
            )}
            {saveState.status === 'dirty' && (
              <span className="flex items-center gap-1.5 text-[#B5944B] dark:text-[#CFA862] font-semibold" title="Unsaved changes pending save">
                <span className="w-2 h-2 rounded-full bg-[#B5944B] dark:bg-[#CFA862] animate-pulse" />
                Unsaved changes
              </span>
            )}
            {saveState.status === 'saved' && (
              <span className="flex items-center gap-1 text-[#7B8E73] dark:text-[#EEEEEE] font-semibold">
                <span>✓</span>
                Saved
              </span>
            )}
            {saveState.status === 'error' && (
              <button
                type="button"
                onClick={() => saveCoordinator.retrySave()}
                className="flex items-center gap-1.5 text-[#C7876A] dark:text-[#DEB29E] hover:underline font-bold cursor-pointer"
                title={saveState.errorMessage || 'Failed to save note. Click to retry.'}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Save failed — Retry</span>
              </button>
            )}
          </div>
        </div>

        {/* Icon Picker Popover */}
        {showIconPicker && (
          <div className="mb-4 p-3.5 bg-[#F2F2ED] dark:bg-[#24262C] border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <div className="text-xs font-bold text-[#777B73] dark:text-[#A2A5AC] mb-2 uppercase tracking-wider">
              Select an icon
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1.5">
              {CURATED_ICONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    updateCurrentPage({ icon: emoji });
                    setShowIconPicker(false);
                  }}
                  className="w-10 h-10 flex items-center justify-center text-xl rounded-xl hover:bg-[#EAECE6] dark:hover:bg-[#2F3238] cursor-pointer active:scale-95 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cover Accent Picker */}
        {showCoverPicker && (
          <div className="mb-4 p-3.5 bg-[#F2F2ED] dark:bg-[#24262C] border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-100">
            <div className="text-xs font-bold text-[#777B73] dark:text-[#A2A5AC] mb-2 uppercase tracking-wider">
              Select an accent band color
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {COVER_COLORS.map(c => (
                <button
                  key={c.name}
                  onClick={() => {
                    updateCurrentPage({ coverColor: c.value });
                    setShowCoverPicker(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border transition-all cursor-pointer min-h-[36px] ${
                    activePage.coverColor === c.value
                      ? 'border-[#7B8E73] dark:border-[#EEEEEE] font-bold bg-[#EEF2EB] dark:bg-[#282A2F] shadow-2xs'
                      : 'border-[#E3E4DC] dark:border-[#32353C] hover:border-[#7B8E73]/60 dark:hover:border-[#4B4F58]'
                  }`}
                >
                  {c.value ? (
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-2xs"
                      style={{ backgroundColor: c.value }}
                    />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-[#777B73] dark:border-[#A2A5AC] border-dashed" />
                  )}
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={e => {
            const newTitle = e.target.value;
            setTitle(newTitle);
            saveCoordinator.updateDraft(activePage.id, newTitle, content);
          }}
          onBlur={() => saveCoordinator.flushPendingSave()}
          placeholder="Untitled note..."
          className="w-full text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#30332E] dark:text-[#EEEEEE] font-heading bg-transparent border-none outline-none placeholder-[#969990] dark:placeholder-[#6C7078] mb-3"
        />

        {/* Properties Section */}
        <div className="mb-5 border-b border-[#E3E4DC] dark:border-[#32353C]/70 pb-4">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowProperties(!showProperties)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#777B73] dark:text-[#A2A5AC] hover:text-[#30332E] dark:hover:text-[#EEEEEE] transition-colors cursor-pointer py-1"
            >
              {showProperties ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span>Properties & Metadata</span>
            </button>

            {showProperties && !isAddingProperty && (
              <button
                onClick={() => setIsAddingProperty(true)}
                className="text-xs text-[#7B8E73] dark:text-[#A2A5AC] hover:underline flex items-center gap-1 font-bold cursor-pointer py-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Property</span>
              </button>
            )}
          </div>

          {showProperties && (
            <div className="space-y-2.5 pt-1 text-xs">
              {/* Tags row */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <span className="w-24 text-[#777B73] dark:text-[#A2A5AC] flex items-center gap-1.5 shrink-0 pt-1 font-medium">
                  <Tag className="w-3.5 h-3.5 text-[#7B8E73] dark:text-[#A2A5AC]" />
                  Tags
                </span>
                <div className="flex-1 flex flex-wrap items-center gap-1.5">
                  {activePage.tags.map(t => (
                    <span
                      key={t}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs ${getTagColorClasses(t)}`}
                    >
                      #{t}
                      <button
                        onClick={() => handleRemoveTag(t)}
                        className="hover:opacity-75 p-0.5 cursor-pointer"
                        aria-label={`Remove tag ${t}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  <div className="relative inline-block">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={e => {
                        setNewTagInput(e.target.value);
                        setShowTagDropdown(true);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(newTagInput);
                        }
                      }}
                      placeholder="+ Add tag..."
                      className="w-24 sm:w-28 px-2.5 py-1 text-xs bg-transparent border border-dashed border-[#E3E4DC] dark:border-[#32353C] rounded-lg text-[#30332E] dark:text-[#EEEEEE] placeholder-[#969990] dark:placeholder-[#6C7078] focus:outline-none focus:border-[#7B8E73] dark:focus:border-[#4B4F58]"
                    />

                    {showTagDropdown && newTagInput && (
                      <div className="absolute top-full left-0 mt-1.5 w-44 bg-[#F2F2ED] dark:bg-[#24262C] border border-[#E3E4DC] dark:border-[#32353C] rounded-xl shadow-xl z-30 py-1 max-h-40 overflow-y-auto">
                        <button
                          onClick={() => handleAddTag(newTagInput)}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#EAECE6] dark:hover:bg-[#2F3238] font-bold text-[#7B8E73] dark:text-[#EEEEEE] cursor-pointer"
                        >
                          Create #{newTagInput}
                        </button>
                        {allTags
                          .filter(t => t.name.includes(newTagInput.toLowerCase()))
                          .map(t => (
                            <button
                              key={t.name}
                              onClick={() => handleAddTag(t.name)}
                              className="w-full text-left px-3 py-1.5 text-xs hover:bg-[#EAECE6] dark:hover:bg-[#2F3238] text-[#30332E] dark:text-[#EEEEEE] flex justify-between cursor-pointer"
                            >
                              <span>#{t.name}</span>
                              <span className="text-[10px] text-[#969990] dark:text-[#6C7078]">{t.count}</span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Custom Properties */}
              {Object.entries(activePage.properties).map(([key, val]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 group">
                  <span className="w-24 text-[#777B73] dark:text-[#A2A5AC] truncate shrink-0 font-medium">
                    {key}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={val}
                      onBlur={e => {
                        if (e.target.value !== val) {
                          updateCurrentPage({
                            properties: {
                              ...activePage.properties,
                              [key]: e.target.value,
                            },
                          });
                        }
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[#F9F9F5] dark:bg-[#1B1C1F] text-[#30332E] dark:text-[#EEEEEE] border border-[#E3E4DC] dark:border-[#32353C] hover:border-[#7B8E73]/60 dark:hover:border-[#4B4F58] focus:border-[#7B8E73] dark:focus:border-[#6C7078] outline-none transition-colors"
                    />
                    <button
                      onClick={() => handleDeleteProperty(key)}
                      className="p-1 text-[#969990] hover:text-[#8C5237] dark:text-[#6C7078] dark:hover:text-[#DEB29E] transition-colors cursor-pointer"
                      title="Delete property"
                      aria-label={`Delete property ${key}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Property Form */}
              {isAddingProperty && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1.5">
                  <input
                    type="text"
                    value={newPropKey}
                    onChange={e => setNewPropKey(e.target.value)}
                    placeholder="Property name (e.g. Status)"
                    className="w-full sm:w-36 px-3 py-1.5 text-xs bg-[#F9F9F5] dark:bg-[#1B1C1F] border border-[#E3E4DC] dark:border-[#32353C] rounded-xl text-[#30332E] dark:text-[#EEEEEE] focus:outline-none focus:border-[#7B8E73] dark:focus:border-[#6C7078]"
                  />
                  <input
                    type="text"
                    value={newPropValue}
                    onChange={e => setNewPropValue(e.target.value)}
                    placeholder="Value (e.g. In Progress)"
                    className="flex-1 px-3 py-1.5 text-xs bg-[#F9F9F5] dark:bg-[#1B1C1F] border border-[#E3E4DC] dark:border-[#32353C] rounded-xl text-[#30332E] dark:text-[#EEEEEE] focus:outline-none focus:border-[#7B8E73] dark:focus:border-[#6C7078]"
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddProperty();
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddProperty}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#7B8E73] hover:bg-[#6E8066] dark:bg-[#EEEEEE] dark:text-[#161719] rounded-xl cursor-pointer shadow-2xs"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsAddingProperty(false)}
                      className="px-3 py-1.5 text-xs text-[#777B73] hover:text-[#30332E] dark:text-[#A2A5AC] dark:hover:text-[#EEEEEE] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Formatting Toolbar */}
        {viewMode !== 'preview' && (
          <div className="flex items-center gap-1 py-1.5 px-2 bg-[#EEEEEA]/95 dark:bg-[#1B1C1F]/95 border border-[#E3E4DC] dark:border-[#32353C] rounded-xl mb-3 shrink-0 overflow-x-auto no-scrollbar whitespace-nowrap text-[#30332E] dark:text-[#EEEEEE] shadow-2xs">
            <button
              onClick={() => applyToolbarFormat('# ')}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-[#F9F9F5] dark:hover:bg-[#282A2F] cursor-pointer shrink-0 transition-colors"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyToolbarFormat('## ')}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-[#F9F9F5] dark:hover:bg-[#282A2F] cursor-pointer shrink-0 transition-colors"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-[#E3E4DC] dark:bg-[#32353C] mx-1 shrink-0" />
            <button
              onClick={() => applyToolbarFormat('**', '**')}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-xs font-bold hover:bg-[#F9F9F5] dark:hover:bg-[#282A2F] cursor-pointer shrink-0 transition-colors"
              title="Bold"
            >
              B
            </button>
            <button
              onClick={() => applyToolbarFormat('*', '*')}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-xs italic hover:bg-[#F9F9F5] dark:hover:bg-[#282A2F] cursor-pointer shrink-0 transition-colors"
              title="Italic"
            >
              I
            </button>
            <button
              onClick={() => applyToolbarFormat('`', '`')}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-[#F9F9F5] dark:hover:bg-[#282A2F] cursor-pointer shrink-0 transition-colors"
              title="Inline Code"
            >
              <Code className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-[#E3E4DC] dark:bg-[#32353C] mx-1 shrink-0" />
            <button
              onClick={() => applyToolbarFormat('- ')}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-[#F9F9F5] dark:hover:bg-[#282A2F] cursor-pointer shrink-0 transition-colors"
              title="Bullet list"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyToolbarFormat('- [ ] ')}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-[#F9F9F5] dark:hover:bg-[#282A2F] cursor-pointer shrink-0 transition-colors"
              title="Task checkbox"
            >
              <CheckSquare className="w-4 h-4 text-[#7B8E73] dark:text-[#A2A5AC]" />
            </button>
            <button
              onClick={() => applyToolbarFormat('> ')}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-[#F9F9F5] dark:hover:bg-[#282A2F] cursor-pointer shrink-0 transition-colors"
              title="Quote block"
            >
              <Quote className="w-4 h-4 text-[#6B8B9B] dark:text-[#7C9EB2]" />
            </button>
            <button
              onClick={() => applyToolbarFormat('```ts\n', '\n```')}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-xs font-mono hover:bg-[#F9F9F5] dark:hover:bg-[#282A2F] cursor-pointer shrink-0 transition-colors"
              title="Code block"
            >
              {`{ }`}
            </button>
            <div className="w-[1px] h-4 bg-[#E3E4DC] dark:bg-[#32353C] mx-1 shrink-0" />
            <button
              onClick={() => applyToolbarFormat('[[', ']]')}
              className="flex items-center gap-1.5 px-3 min-h-[36px] rounded-lg text-xs font-bold text-[#4F6348] dark:text-[#EEEEEE] bg-[#EEF2EB] dark:bg-[#282A2F] border dark:border-[#32353C] hover:bg-[#E2EBDD] dark:hover:bg-[#32353C] cursor-pointer shrink-0 transition-colors"
              title="Obsidian-style internal link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Link Note</span>
            </button>
          </div>
        )}

        {/* Main Editor Body */}
        <div className="flex-1 relative flex flex-col md:flex-row gap-5 min-h-[380px]">
          {/* Markdown Textarea */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div
              className={`relative flex-1 flex flex-col ${
                viewMode === 'split' ? 'md:w-1/2' : 'w-full'
              }`}
            >
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onBlur={() => saveCoordinator.flushPendingSave()}
                placeholder="Write your note here... Type [[ to link another page, or use Markdown shortcuts."
                className={`w-full flex-1 min-h-[340px] p-5 bg-[#F9F9F5] dark:bg-[#222428] border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl outline-none resize-none text-[#30332E] dark:text-[#EEEEEE] leading-relaxed text-sm ${fontClass} focus:border-[#7B8E73] dark:focus:border-[#4B4F58] transition-colors shadow-2xs`}
              />

              {/* Link Autocomplete Popup */}
              {linkSuggestQuery !== null && (
                <div className="absolute left-2 sm:left-4 top-14 w-[calc(100%-1rem)] sm:w-72 max-w-sm bg-[#F2F2ED] dark:bg-[#24262C] border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl shadow-xl z-30 p-2 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="font-bold text-[#777B73] dark:text-[#A2A5AC] mb-1.5 px-2.5 uppercase tracking-wider text-[10px]">
                    Link to page:
                  </div>
                  {linkSuggestions.length > 0 ? (
                    linkSuggestions.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleInsertLink(p.title)}
                        className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#EAECE6] dark:hover:bg-[#2F3238] flex items-center gap-2 text-[#30332E] dark:text-[#EEEEEE] cursor-pointer transition-colors"
                      >
                        <span className="shrink-0">{p.icon || '📄'}</span>
                        <span className="font-semibold truncate">{p.title}</span>
                      </button>
                    ))
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleInsertLink(linkSuggestQuery)}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#EEF2EB] dark:hover:bg-[#2F3238] text-[#4F6348] dark:text-[#EEEEEE] font-semibold cursor-pointer transition-colors"
                    >
                      + Create new note "<strong>{linkSuggestQuery}</strong>"
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Rendered Markdown Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div
              className={`flex-1 p-5 sm:p-7 bg-[#F9F9F5] dark:bg-[#222428] border border-[#E3E4DC] dark:border-[#32353C] rounded-2xl overflow-y-auto shadow-2xs ${
                viewMode === 'split' ? 'md:w-1/2' : 'w-full'
              }`}
            >
              <MarkdownRenderer
                content={content}
                onContentChange={newVal => {
                  setContent(newVal);
                  saveCoordinator.updateDraft(activePage.id, title, newVal);
                }}
                fontClass={fontClass}
              />
            </div>
          )}
        </div>

        {/* Notion-style Sub-pages list */}
        {childPages.length > 0 && (
          <div className="mt-8 pt-6 border-t border-[#E3E4DC] dark:border-[#32353C]/70">
            <div className="text-xs font-bold text-[#969990] dark:text-[#6C7078] uppercase tracking-wider mb-3">
              Sub-pages ({childPages.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {childPages.map(child => (
                <button
                  key={child.id}
                  onClick={() => selectPage(child.id)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#E3E4DC] dark:border-[#32353C] hover:border-[#7B8E73]/60 dark:hover:border-[#4B4F58] bg-[#F9F9F5] dark:bg-[#222428] text-left transition-all group cursor-pointer active:scale-[0.99] shadow-2xs"
                >
                  <span className="text-lg shrink-0 p-1 rounded-lg bg-[#F4F4F0] dark:bg-[#1B1C1F]">{child.icon || '📄'}</span>
                  <span className="text-xs font-bold text-[#30332E] dark:text-[#EEEEEE] group-hover:text-[#7B8E73] dark:group-hover:text-[#FFFFFF] truncate flex-1 font-heading">
                    {child.title}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#969990] dark:text-[#6C7078] opacity-75 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Obsidian-style Backlinks (Linked References) */}
        <div className="mt-8 pt-6 border-t border-[#E3E4DC] dark:border-[#32353C]/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#969990] dark:text-[#6C7078] uppercase tracking-wider">
              <LinkIcon className="w-3.5 h-3.5 text-[#7B8E73] dark:text-[#A2A5AC]" />
              <span>Linked References ({activeBacklinks.length})</span>
            </div>
            <span className="text-[11px] text-[#969990] dark:text-[#6C7078]">
              Notes mentioning [[{activePage.title}]]
            </span>
          </div>

          {activeBacklinks.length > 0 ? (
            <div className="space-y-2.5">
              {activeBacklinks.map(bl => (
                <div
                  key={bl.sourceId}
                  onClick={() => selectPage(bl.sourceId)}
                  className="p-4 rounded-2xl border border-[#E3E4DC] dark:border-[#32353C] bg-[#F9F9F5] dark:bg-[#222428] hover:border-[#7B8E73]/60 dark:hover:border-[#4B4F58] cursor-pointer transition-all group active:scale-[0.99] shadow-2xs"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#30332E] dark:text-[#EEEEEE] group-hover:text-[#7B8E73] dark:group-hover:text-[#FFFFFF] mb-1.5 font-heading">
                    <span>{bl.sourceIcon}</span>
                    <span>{bl.sourceTitle}</span>
                  </div>
                  <div className="text-xs text-[#55584F] dark:text-[#A2A5AC] line-clamp-2 italic font-mono bg-[#F4F4F0] dark:bg-[#1B1C1F] p-2.5 rounded-xl border border-[#E3E4DC]/60 dark:border-[#32353C]/60">
                    "{bl.contextSnippet}"
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#969990] dark:text-[#6C7078] italic">
              No other notes link to this page yet. Mention [[{activePage.title}]] in any other note to create an automatic bi-directional link.
            </p>
          )}
        </div>

        {/* Outgoing Links summary */}
        {outgoingLinks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#E3E4DC] dark:border-[#32353C]/70 flex items-center gap-2 flex-wrap text-xs text-[#777B73] dark:text-[#A2A5AC]">
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#969990] dark:text-[#6C7078]">Outgoing links:</span>
            {outgoingLinks.map(targetTitle => {
              const exists = pages.some(
                p => p.title.trim().toLowerCase() === targetTitle.toLowerCase()
              );
              return (
                <button
                  key={targetTitle}
                  onClick={async () => {
                    const match = pages.find(
                      p => p.title.trim().toLowerCase() === targetTitle.toLowerCase()
                    );
                    if (match) {
                      selectPage(match.id);
                    } else {
                      const newP = await createPage({
                        title: targetTitle,
                        content: `# ${targetTitle}\n\nCreated from link in ${activePage.title}`,
                      });
                      selectPage(newP.id);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    exists
                      ? 'bg-[#EEF2EB] dark:bg-[#282A2F] text-[#4F6348] dark:text-[#CBD5E1] border border-[#D6DFD1] dark:border-[#32353C] hover:scale-[1.02]'
                      : 'bg-[#F7EFEA] dark:bg-[#282A2F] text-[#8C5237] dark:text-[#DEB29E] border border-dashed border-[#EDDACF] dark:border-[#32353C] hover:scale-[1.02]'
                  }`}
                >
                  [[{targetTitle}]]
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
