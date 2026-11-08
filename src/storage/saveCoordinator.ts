import { storageAdapter } from './adapter';
import type { Page, PageId } from '../types';

export type SaveStatus = 'saved' | 'saving' | 'dirty' | 'error';

export interface SaveState {
  status: SaveStatus;
  documentId: PageId | null;
  isDirty: boolean;
  errorMessage: string | null;
  lastSavedAt: number | null;
}

type SaveListener = (state: SaveState) => void;
type PageSavedCallback = (page: Page) => void;

export class SaveCoordinator {
  private currentDocId: PageId | null = null;
  private draftTitle = '';
  private draftContent = '';
  private savedTitle = '';
  private savedContent = '';
  private revision = 0;
  private savedRevision = 0;
  private status: SaveStatus = 'saved';
  private errorMessage: string | null = null;
  private lastSavedAt: number | null = null;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly debounceDelay = 400; // ms
  private inFlightPromise: Promise<boolean> | null = null;
  private listeners = new Set<SaveListener>();
  private onPageSaved: PageSavedCallback | null = null;

  /**
   * Register a callback to be called whenever a document is successfully saved to storage.
   */
  public setOnPageSaved(callback: PageSavedCallback | null): void {
    this.onPageSaved = callback;
  }

  /**
   * Subscribe to state updates (status, dirty state, error messages).
   */
  public subscribe(listener: SaveListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): SaveState {
    return {
      status: this.status,
      documentId: this.currentDocId,
      isDirty: this.isDirty(),
      errorMessage: this.errorMessage,
      lastSavedAt: this.lastSavedAt,
    };
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach(fn => {
      try {
        fn(state);
      } catch (err) {
        console.error('Error in SaveCoordinator listener:', err);
      }
    });
  }

  public isDirty(): boolean {
    return this.savedRevision < this.revision;
  }

  public getDocumentId(): PageId | null {
    return this.currentDocId;
  }

  public getDraft(): { title: string; content: string } {
    return {
      title: this.draftTitle,
      content: this.draftContent,
    };
  }

  /**
   * Initialize or switch the active document being tracked.
   * If there is an unsaved dirty draft for the previous document, it will be flushed first.
   */
  public async setDocument(docId: PageId, title: string, content: string): Promise<boolean> {
    if (this.currentDocId === docId) {
      // Same document - only update baseline if not dirty
      if (!this.isDirty()) {
        this.savedTitle = title;
        this.savedContent = content;
        this.draftTitle = title;
        this.draftContent = content;
      }
      return true;
    }

    // Switching to a different document: flush any pending dirty work on the old document
    if (this.currentDocId && this.isDirty()) {
      const flushResult = await this.flushPendingSave();
      if (!flushResult.success) {
        // Return false to indicate that the previous document could not be saved
        return false;
      }
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.currentDocId = docId;
    this.draftTitle = title;
    this.draftContent = content;
    this.savedTitle = title;
    this.savedContent = content;
    this.revision = 0;
    this.savedRevision = 0;
    this.status = 'saved';
    this.errorMessage = null;
    this.notify();
    return true;
  }

  /**
   * Update the in-memory draft and schedule debounced save.
   */
  public updateDraft(docId: PageId, title: string, content: string): void {
    if (this.currentDocId !== docId) {
      console.warn(`[SaveCoordinator] updateDraft ignored for docId "${docId}" because active doc is "${this.currentDocId}"`);
      return;
    }

    this.draftTitle = title;
    this.draftContent = content;

    // Check if draft matches already saved state
    if (this.draftTitle === this.savedTitle && this.draftContent === this.savedContent) {
      if (this.isDirty()) {
        this.savedRevision = this.revision;
      }
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
      if (this.status !== 'saving') {
        this.status = 'saved';
        this.errorMessage = null;
        this.notify();
      }
      return;
    }

    // Draft has changed
    this.revision++;
    this.errorMessage = null;
    if (this.status !== 'saving') {
      this.status = 'dirty';
    }
    this.notify();

    // Schedule debounced save
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this.triggerSave();
    }, this.debounceDelay);
  }

  /**
   * Trigger an asynchronous save operation for the current draft revision.
   */
  private triggerSave(): Promise<boolean> {
    if (!this.currentDocId || !this.isDirty()) {
      return Promise.resolve(true);
    }

    // Capture the exact document ID, revision, and values to save
    const targetDocId = this.currentDocId;
    const targetRevision = this.revision;
    const targetTitle = this.draftTitle;
    const targetContent = this.draftContent;

    // Serialize saves: if one is already in flight, wait for it then save the latest revision
    if (this.inFlightPromise) {
      this.inFlightPromise = this.inFlightPromise.then(() => {
        // If the revision was already saved while waiting, nothing to do
        if (this.savedRevision >= targetRevision) {
          return true;
        }
        return this.executeSave(targetDocId, targetRevision, targetTitle, targetContent);
      });
      return this.inFlightPromise;
    }

    this.inFlightPromise = this.executeSave(targetDocId, targetRevision, targetTitle, targetContent)
      .finally(() => {
        this.inFlightPromise = null;
      });

    return this.inFlightPromise;
  }

  /**
   * Perform the actual storage write to Dexie via StorageAdapter.
   */
  private async executeSave(
    docId: PageId,
    revisionToSave: number,
    titleToSave: string,
    contentToSave: string
  ): Promise<boolean> {
    this.status = 'saving';
    this.errorMessage = null;
    this.notify();

    try {
      const updatedPage = await storageAdapter.updatePage(docId, {
        title: titleToSave,
        content: contentToSave,
      });

      // Commit successful revision
      this.savedRevision = Math.max(this.savedRevision, revisionToSave);
      this.savedTitle = titleToSave;
      this.savedContent = contentToSave;
      this.lastSavedAt = Date.now();

      // Check if user continued typing while save was in-flight
      if (this.savedRevision >= this.revision) {
        this.status = 'saved';
        this.errorMessage = null;
      } else {
        this.status = 'dirty';
      }

      this.notify();

      // Notify external context of updated page so note lists stay fresh
      if (this.onPageSaved) {
        try {
          this.onPageSaved(updatedPage);
        } catch (callbackErr) {
          console.error('[SaveCoordinator] Error in onPageSaved callback:', callbackErr);
        }
      }

      return true;
    } catch (err: any) {
      console.error(`[SaveCoordinator] Failed to save document "${docId}":`, err);
      this.status = 'error';
      this.errorMessage = err?.message || 'Failed to save note';
      this.notify();
      return false;
    }
  }

  /**
   * Immediately flush and await persistence of any pending draft.
   * Cancels any pending debounce timer and commits the latest draft to IndexedDB.
   */
  public async flushPendingSave(): Promise<{ success: boolean; error?: string }> {
    // Cancel debounce timer if one is waiting
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // If nothing to save and not in flight, we are clean
    if (!this.isDirty() && !this.inFlightPromise) {
      return { success: true };
    }

    // Wait for any in-flight write to complete
    if (this.inFlightPromise) {
      await this.inFlightPromise;
    }

    // If still dirty after in-flight completes (e.g. user typed during save), save the latest revision now
    if (this.isDirty()) {
      const success = await this.triggerSave();
      if (!success) {
        return { success: false, error: this.errorMessage || 'Database write failed' };
      }
    }

    return { success: true };
  }

  /**
   * Retry saving the latest dirty draft after an error.
   */
  public async retrySave(): Promise<boolean> {
    this.errorMessage = null;
    const result = await this.flushPendingSave();
    return result.success;
  }

  /**
   * Cancel pending save without writing (e.g. when permanently deleting this document).
   */
  public cancelPendingSave(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.revision = 0;
    this.savedRevision = 0;
    this.status = 'saved';
    this.errorMessage = null;
    this.notify();
  }
}

// Global coordinator singleton
export const saveCoordinator = new SaveCoordinator();
