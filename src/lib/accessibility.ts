/**
 * Accessibility utilities for PhotoMemory AI Dashboard
 * Provides helpers for ARIA patterns, keyboard navigation, and screen reader support
 */

// Generate unique IDs for ARIA relationships
export function generateId(prefix: string = 'element'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ARIA live region announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Keyboard navigation helpers
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End'
} as const;

export type KeyboardKey = typeof KeyboardKeys[keyof typeof KeyboardKeys];

// Focus management utilities
export class FocusManager {
  private static focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ');

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  static getFirstFocusable(container: HTMLElement): HTMLElement | null {
    const elements = this.getFocusableElements(container);
    return elements[0] || null;
  }

  static getLastFocusable(container: HTMLElement): HTMLElement | null {
    const elements = this.getFocusableElements(container);
    return elements[elements.length - 1] || null;
  }

  static trapFocus(container: HTMLElement, event: KeyboardEvent): void {
    if (event.key !== KeyboardKeys.TAB) return;

    const focusableElements = this.getFocusableElements(container);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable?.focus();
      }
    }
  }
}

// ARIA live region manager
export class LiveRegionManager {
  private static instance: LiveRegionManager;
  private politeRegion: HTMLElement;
  private assertiveRegion: HTMLElement;

  private constructor() {
    this.politeRegion = this.createLiveRegion('polite');
    this.assertiveRegion = this.createLiveRegion('assertive');
  }

  static getInstance(): LiveRegionManager {
    if (!this.instance) {
      this.instance = new LiveRegionManager();
    }
    return this.instance;
  }

  private createLiveRegion(priority: 'polite' | 'assertive'): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.id = `live-region-${priority}`;
    document.body.appendChild(region);
    return region;
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const region = priority === 'polite' ? this.politeRegion : this.assertiveRegion;
    region.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      region.textContent = '';
    }, 1000);
  }
}

// Progress announcement helper
export function announceProgress(current: number, total: number, label: string): void {
  const percentage = Math.round((current / total) * 100);
  const message = `${label}: ${percentage}% complete. ${current} of ${total} items processed.`;
  LiveRegionManager.getInstance().announce(message, 'polite');
}

// Form validation announcements
export function announceFormError(fieldName: string, errorMessage: string): void {
  const message = `Error in ${fieldName}: ${errorMessage}`;
  LiveRegionManager.getInstance().announce(message, 'assertive');
}

export function announceFormSuccess(message: string): void {
  LiveRegionManager.getInstance().announce(message, 'polite');
}

// Upload progress announcements
export function announceUploadProgress(filename: string, progress: number): void {
  if (progress === 0) {
    LiveRegionManager.getInstance().announce(`Started uploading ${filename}`, 'polite');
  } else if (progress === 100) {
    LiveRegionManager.getInstance().announce(`Finished uploading ${filename}`, 'polite');
  } else if (progress % 25 === 0) { // Announce at 25%, 50%, 75%
    LiveRegionManager.getInstance().announce(`${filename} upload ${progress}% complete`, 'polite');
  }
}

// Generation status announcements
export function announceGenerationStatus(projectTitle: string, status: string, progress?: number): void {
  let message = '';
  
  switch (status) {
    case 'queued':
      message = `${projectTitle} has been added to the generation queue`;
      break;
    case 'processing':
      message = progress !== undefined 
        ? `${projectTitle} generation ${progress}% complete`
        : `${projectTitle} generation has started`;
      break;
    case 'completed':
      message = `${projectTitle} generation completed successfully`;
      break;
    case 'failed':
      message = `${projectTitle} generation failed`;
      break;
    case 'cancelled':
      message = `${projectTitle} generation was cancelled`;
      break;
    default:
      message = `${projectTitle} status updated to ${status}`;
  }
  
  const priority = status === 'Failed' ? 'assertive' : 'polite';
  LiveRegionManager.getInstance().announce(message, priority);
}

// Keyboard shortcut helpers
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
}

export class KeyboardShortcutManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();

  register(shortcut: KeyboardShortcut): void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.set(key, shortcut);
  }

  unregister(shortcut: KeyboardShortcut): void {
    const key = this.getShortcutKey(shortcut);
    this.shortcuts.delete(key);
  }

  private getShortcutKey(shortcut: KeyboardShortcut): string {
    const modifiers = [];
    if (shortcut.ctrlKey) modifiers.push('ctrl');
    if (shortcut.shiftKey) modifiers.push('shift');
    if (shortcut.altKey) modifiers.push('alt');
    if (shortcut.metaKey) modifiers.push('meta');
    return `${modifiers.join('+')}-${shortcut.key.toLowerCase()}`;
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('ctrl');
    if (event.shiftKey) modifiers.push('shift');
    if (event.altKey) modifiers.push('alt');
    if (event.metaKey) modifiers.push('meta');
    
    const key = `${modifiers.join('+')}-${event.key.toLowerCase()}`;
    const shortcut = this.shortcuts.get(key);
    
    if (shortcut) {
      event.preventDefault();
      shortcut.action();
      return true;
    }
    
    return false;
  }

  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }
}

// Screen reader utilities
export const ScreenReaderUtils = {
  // Hide content from screen readers
  hideFromScreenReader: (element: HTMLElement): void => {
    element.setAttribute('aria-hidden', 'true');
  },

  // Show content to screen readers only
  showToScreenReaderOnly: (element: HTMLElement): void => {
    element.className = `${element.className} sr-only`.trim();
  },

  // Describe element for screen readers
  describe: (element: HTMLElement, description: string): void => {
    const descId = generateId('desc');
    const descElement = document.createElement('span');
    descElement.id = descId;
    descElement.className = 'sr-only';
    descElement.textContent = description;
    
    element.parentNode?.insertBefore(descElement, element.nextSibling);
    element.setAttribute('aria-describedby', descId);
  },

  // Label element for screen readers
  label: (element: HTMLElement, label: string): void => {
    const labelId = generateId('label');
    const labelElement = document.createElement('span');
    labelElement.id = labelId;
    labelElement.className = 'sr-only';
    labelElement.textContent = label;
    
    element.parentNode?.insertBefore(labelElement, element);
    element.setAttribute('aria-labelledby', labelId);
  }
};

// Initialize live regions on page load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    LiveRegionManager.getInstance();
  });
}