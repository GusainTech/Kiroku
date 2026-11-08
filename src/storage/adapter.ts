import Dexie from 'dexie';
import { db, INITIAL_SEED_PAGES } from './db';
import type { Page, PageId, StorageAdapter, BacklinkInfo, InternalLinkItem } from '../types';

export class DexieStorageAdapter implements StorageAdapter {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      await db.open();
      const count = await db.pages.count();
      if (count === 0) {
        // Check if user previously had data in KomorebiNotesDB
        let migrated = false;
        try {
          const exists = await Dexie.exists('KomorebiNotesDB');
          if (exists) {
            const oldDb = new Dexie('KomorebiNotesDB');
            await oldDb.open();
            if (oldDb.tables.some(t => t.name === 'pages')) {
              const oldPages = await oldDb.table('pages').toArray();
              if (oldPages.length > 0) {
                await db.pages.bulkAdd(oldPages);
                migrated = true;
              }
            }
            oldDb.close();
          }
        } catch (e) {
          console.warn('Could not check or migrate previous database:', e);
        }

        if (!migrated) {
          await db.pages.bulkAdd(INITIAL_SEED_PAGES);
        }
      }
      this.initialized = true;
    } catch (err) {
      console.error('Failed to initialize DexieStorageAdapter:', err);
      throw err;
    }
  }

  async getAllPages(includeArchived = false): Promise<Page[]> {
    await this.init();
    if (includeArchived) {
      return await db.pages.toArray();
    }
    return await db.pages.filter(p => !p.isArchived).toArray();
  }

  async getPageById(id: PageId): Promise<Page | undefined> {
    await this.init();
    return await db.pages.get(id);
  }

  async getPageByTitle(title: string): Promise<Page | undefined> {
    await this.init();
    const clean = title.trim().toLowerCase();
    const all = await this.getAllPages(true);
    return all.find(p => p.title.trim().toLowerCase() === clean);
  }

  async createPage(partial: Partial<Page>): Promise<Page> {
    await this.init();
    const now = Date.now();
    const newPage: Page = {
      id: partial.id || `page-${now}-${Math.random().toString(36).substring(2, 7)}`,
      title: partial.title?.trim() || 'Untitled',
      icon: partial.icon || '📄',
      coverColor: partial.coverColor ?? null,
      content: partial.content ?? '',
      parentId: partial.parentId ?? null,
      isFavorite: partial.isFavorite ?? false,
      isArchived: false,
      isInbox: partial.isInbox ?? false,
      tags: partial.tags ? Array.from(new Set(partial.tags)) : [],
      properties: partial.properties ?? {},
      createdAt: partial.createdAt || now,
      updatedAt: now,
    };

    await db.pages.add(newPage);
    return newPage;
  }

  async updatePage(id: PageId, partial: Partial<Page>): Promise<Page> {
    await this.init();

    // Construct patch with only defined fields to ensure atomic partial updates
    const patch: Partial<Page> = {};
    if (partial.title !== undefined) patch.title = partial.title;
    if (partial.content !== undefined) patch.content = partial.content;
    if (partial.icon !== undefined) patch.icon = partial.icon;
    if (partial.coverColor !== undefined) patch.coverColor = partial.coverColor;
    if (partial.parentId !== undefined) patch.parentId = partial.parentId;
    if (partial.isFavorite !== undefined) patch.isFavorite = partial.isFavorite;
    if (partial.isArchived !== undefined) patch.isArchived = partial.isArchived;
    if (partial.isInbox !== undefined) patch.isInbox = partial.isInbox;
    if (partial.tags !== undefined) patch.tags = Array.from(new Set(partial.tags));
    if (partial.properties !== undefined) patch.properties = partial.properties;

    patch.updatedAt = partial.updatedAt || Date.now();

    const count = await db.pages.update(id, patch);
    if (count === 0) {
      const exists = await db.pages.get(id);
      if (!exists) {
        throw new Error(`Page with id "${id}" not found.`);
      }
    }

    const updated = await db.pages.get(id);
    if (!updated) {
      throw new Error(`Page with id "${id}" not found after update.`);
    }

    return updated;
  }

  async deletePage(id: PageId, permanent = false): Promise<void> {
    await this.init();
    if (permanent) {
      // Re-parent children to parent of this page so they aren't orphaned
      const current = await db.pages.get(id);
      const parentId = current ? current.parentId : null;
      const children = await db.pages.where('parentId').equals(id).toArray();
      for (const child of children) {
        await db.pages.update(child.id, { parentId });
      }
      await db.pages.delete(id);
    } else {
      // Soft-delete to Trash
      await db.pages.update(id, { isArchived: true, updatedAt: Date.now() });
    }
  }

  async restorePage(id: PageId): Promise<void> {
    await this.init();
    await db.pages.update(id, { isArchived: false, updatedAt: Date.now() });
  }

  async searchPages(query: string, tag?: string): Promise<Page[]> {
    await this.init();
    const pages = await this.getAllPages(false);
    const q = query.trim().toLowerCase();

    return pages.filter(page => {
      if (tag && !page.tags.includes(tag)) {
        return false;
      }
      if (!q) return true;
      const titleMatch = page.title.toLowerCase().includes(q);
      const contentMatch = page.content.toLowerCase().includes(q);
      const tagMatch = page.tags.some(t => t.toLowerCase().includes(q));
      const propMatch = Object.entries(page.properties).some(
        ([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q)
      );
      return titleMatch || contentMatch || tagMatch || propMatch;
    });
  }

  async exportBackup(): Promise<string> {
    await this.init();
    const pages = await db.pages.toArray();
    const backup = {
      app: 'Kiroku',
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      pageCount: pages.length,
      pages,
    };
    return JSON.stringify(backup, null, 2);
  }

  async importBackup(jsonString: string, mode: 'merge' | 'replace' = 'merge'): Promise<number> {
    await this.init();
    let data: { pages?: Page[] };
    try {
      data = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid JSON format for backup file.');
    }

    if (!data || !Array.isArray(data.pages)) {
      throw new Error('Backup data does not contain a valid pages array.');
    }

    if (mode === 'replace') {
      await db.pages.clear();
      await db.pages.bulkAdd(data.pages);
      return data.pages.length;
    } else {
      let imported = 0;
      for (const p of data.pages) {
        if (!p.id || !p.title) continue;
        const existing = await db.pages.get(p.id);
        if (existing) {
          // If collision, keep the one with newer updatedAt
          if (p.updatedAt > existing.updatedAt) {
            await db.pages.put(p);
            imported++;
          }
        } else {
          await db.pages.add(p);
          imported++;
        }
      }
      return imported;
    }
  }

  async importMarkdown(title: string, markdown: string, isInbox = false): Promise<Page> {
    await this.init();
    // Extract frontmatter tags or title if available
    const cleanTitle = title.replace(/\.md$/i, '').trim() || 'Imported Note';
    
    // Extract tags from #tag in markdown
    const tagMatches = markdown.match(/#[a-zA-Z0-9_-]+/g) || [];
    const extractedTags = tagMatches
      .map(t => t.slice(1).toLowerCase())
      .filter(t => t.length > 1 && !/^\d+$/.test(t));

    return await this.createPage({
      title: cleanTitle,
      content: markdown,
      isInbox,
      tags: extractedTags,
      icon: isInbox ? '📥' : '📝',
    });
  }
}

// Singleton storage adapter instance
export const storageAdapter = new DexieStorageAdapter();

// Helper to extract [[Internal Links]] from markdown text
export function extractInternalLinks(content: string): string[] {
  const matches = content.match(/\[\[([^\]]+)\]\]/g) || [];
  const titles = matches.map(m => m.slice(2, -2).trim()).filter(Boolean);
  return Array.from(new Set(titles));
}

// Helper to compute backlinks for a specific page
export function computeBacklinks(targetPage: Page, allPages: Page[]): BacklinkInfo[] {
  const targetTitleLower = targetPage.title.trim().toLowerCase();
  const backlinks: BacklinkInfo[] = [];

  for (const page of allPages) {
    if (page.id === targetPage.id || page.isArchived) continue;
    
    // Match [[targetTitle]] case-insensitively
    const regex = new RegExp(`\\[\\[([^\\]]*${escapeRegExp(targetTitleLower)}[^\\]]*)\\]\\]`, 'i');
    if (regex.test(page.content)) {
      // Find context snippet around the link
      const matchIndex = page.content.toLowerCase().indexOf(`[[${targetTitleLower}`);
      let snippet = '';
      if (matchIndex !== -1) {
        const start = Math.max(0, matchIndex - 60);
        const end = Math.min(page.content.length, matchIndex + targetTitleLower.length + 80);
        snippet = (start > 0 ? '...' : '') + page.content.slice(start, end).replace(/\n/g, ' ') + (end < page.content.length ? '...' : '');
      } else {
        snippet = page.content.slice(0, 100).replace(/\n/g, ' ') + '...';
      }

      backlinks.push({
        sourceId: page.id,
        sourceTitle: page.title,
        sourceIcon: page.icon || '📄',
        contextSnippet: snippet,
        updatedAt: page.updatedAt,
      });
    }
  }

  return backlinks;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
