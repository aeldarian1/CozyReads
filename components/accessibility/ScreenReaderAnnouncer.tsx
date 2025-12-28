'use client';

import { useEffect, useState } from 'react';

interface Announcement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
}

let announceQueue: Announcement[] = [];
let listeners: Set<(announcements: Announcement[]) => void> = new Set();

/**
 * Queue an announcement for screen readers.
 *
 * @param message - The message to announce
 * @param priority - 'polite' (default) or 'assertive' for urgent messages
 *
 * @example
 * announce('Book added to collection', 'polite');
 * announce('Error: Failed to save', 'assertive');
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement: Announcement = {
    id: Math.random().toString(36).substring(7),
    message,
    priority,
  };

  announceQueue.push(announcement);
  listeners.forEach((listener) => listener([...announceQueue]));

  // Auto-remove after 5 seconds
  setTimeout(() => {
    announceQueue = announceQueue.filter((a) => a.id !== announcement.id);
    listeners.forEach((listener) => listener([...announceQueue]));
  }, 5000);
}

/**
 * Global screen reader announcer component.
 * Must be placed once at the root level of the app.
 *
 * Uses ARIA live regions to announce dynamic changes to screen reader users.
 */
export function ScreenReaderAnnouncer() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const listener = (newAnnouncements: Announcement[]) => {
      setAnnouncements(newAnnouncements);
    };

    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const politeAnnouncements = announcements.filter((a) => a.priority === 'polite');
  const assertiveAnnouncements = announcements.filter((a) => a.priority === 'assertive');

  return (
    <>
      {/* Polite announcements - don't interrupt current speech */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {politeAnnouncements.map((announcement) => (
          <div key={announcement.id}>{announcement.message}</div>
        ))}
      </div>

      {/* Assertive announcements - interrupt current speech */}
      <div
        className="sr-only"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        {assertiveAnnouncements.map((announcement) => (
          <div key={announcement.id}>{announcement.message}</div>
        ))}
      </div>
    </>
  );
}

/**
 * Hook to announce messages from components.
 *
 * @example
 * const announcer = useAnnounce();
 *
 * const handleSave = () => {
 *   announcer.polite('Book saved successfully');
 * };
 */
export function useAnnounce() {
  return {
    polite: (message: string) => announce(message, 'polite'),
    assertive: (message: string) => announce(message, 'assertive'),
  };
}
