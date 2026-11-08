export type PageId = string;

export interface PageProperty {
  id: string;
  name: string;
  type: 'text' | 'select' | 'date';
  value: string;
}

export interface Page {
  id: PageId;
  title: string;
  icon: string;
  coverColor?: string | null;
  content: string;
  parentId: PageId | null; // Notion-style nesting
  isFavorite: boolean;
  isArchived: boolean;
  isInbox: boolean;
  tags: string[];
  properties: Record<string, string>;
  createdAt: number;
  updatedAt: number;
}

export interface BacklinkInfo {
  sourceId: PageId;
  sourceTitle: string;
  sourceIcon: string;
  contextSnippet: string;
  updatedAt: number;
}

export interface InternalLinkItem {
  targetTitle: string;
  targetId?: PageId;
  exists: boolean;
}

export type ContentViewMode = 'edit' | 'preview' | 'split';
export type NoteFontFamily = 'sans' | 'serif' | 'mono';

export interface StorageAdapter {
  init(): Promise<void>;
  getAllPages(includeArchived?: boolean): Promise<Page[]>;
  getPageById(id: PageId): Promise<Page | undefined>;
  getPageByTitle(title: string): Promise<Page | undefined>;
  createPage(partial: Partial<Page>): Promise<Page>;
  updatePage(id: PageId, partial: Partial<Page>): Promise<Page>;
  deletePage(id: PageId, permanent?: boolean): Promise<void>;
  restorePage(id: PageId): Promise<void>;
  searchPages(query: string, tag?: string): Promise<Page[]>;
  exportBackup(): Promise<string>;
  importBackup(jsonString: string, mode?: 'merge' | 'replace'): Promise<number>;
  importMarkdown(title: string, markdown: string, isInbox?: boolean): Promise<Page>;
}
