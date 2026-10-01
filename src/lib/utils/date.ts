/**
 * Centralized date & time utilities for parsing UTC timestamps and localized UI display.
 */

/**
 * Parses an ISO UTC string or Date object safely.
 */
export function parseUtcDate(dateInput: string | Date | number | null | undefined): Date | null {
  if (!dateInput) return null;
  const d = new Date(dateInput);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a date into localized date string (e.g. "12 Sep 2026").
 */
export function formatDate(
  dateInput: string | Date | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseUtcDate(dateInput);
  if (!d) return '—';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(d);
}

/**
 * Formats a date into localized date and time string (e.g. "12 Sep 2026, 02:30 PM").
 */
export function formatDateTime(
  dateInput: string | Date | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseUtcDate(dateInput);
  if (!d) return '—';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  };

  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(d);
}

/**
 * Formats a time string (e.g. "02:30 PM").
 */
export function formatTime(
  dateInput: string | Date | number | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseUtcDate(dateInput);
  if (!d) return '—';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options,
  };

  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(d);
}

/**
 * Relative time formatter (e.g. "5 mins ago", "yesterday", "in 2 hours").
 */
export function formatRelativeTime(
  dateInput: string | Date | number | null | undefined
): string {
  const d = parseUtcDate(dateInput);
  if (!d) return '—';

  const now = Date.now();
  const diffMs = d.getTime() - now;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' });

  if (Math.abs(diffSec) < 60) return 'just now';
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour');
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day');

  return formatDate(d);
}
