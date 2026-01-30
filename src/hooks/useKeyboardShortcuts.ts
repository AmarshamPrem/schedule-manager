import { useEffect, useCallback } from 'react';

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
}

const registeredShortcuts: ShortcutHandler[] = [];

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Allow Escape in inputs
      if (event.key !== 'Escape') return;
    }

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        shortcut.handler();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function getShortcutLabel(shortcut: Pick<ShortcutHandler, 'key' | 'ctrl' | 'shift' | 'alt'>): string {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('⌘');
  if (shortcut.shift) parts.push('⇧');
  if (shortcut.alt) parts.push('⌥');
  parts.push(shortcut.key.toUpperCase());
  return parts.join('');
}

export const GLOBAL_SHORTCUTS = {
  openCommandPalette: { key: 'k', ctrl: true, description: 'Open command palette' },
  addTask: { key: 'n', ctrl: true, description: 'Add new task' },
  goToInbox: { key: 'i', ctrl: true, description: 'Go to inbox' },
  goToToday: { key: 't', ctrl: true, description: 'Go to today' },
  toggleFocusMode: { key: 'f', ctrl: true, shift: true, description: 'Toggle focus mode' },
  search: { key: '/', description: 'Focus search' },
  escape: { key: 'Escape', description: 'Close/Cancel' },
} as const;
