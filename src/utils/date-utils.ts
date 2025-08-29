/**
 * Centralized Date/Time Utility Functions
 * Provides consistent date and time formatting across the entire application
 */

export interface DateFormatOptions {
  locale?: string;
  timeZone?: string;
  hour12?: boolean;
  showSeconds?: boolean;
  showYear?: boolean;
  showTime?: boolean;
  businessTimezone?: string; // Business-specific timezone
}

export interface RelativeTimeOptions {
  includeTime?: boolean;
  showAgo?: boolean;
}

/**
 * Safely converts any date-like value to a Date object
 */
export const toDate = (dateValue: Date | string | number | undefined | null): Date | null => {
  if (!dateValue) return null;
  
  try {
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Error converting to Date:', error);
    return null;
  }
};

/**
 * Formats a date with consistent styling
 */
export const formatDate = (
  dateValue: Date | string | number | undefined | null,
  options: DateFormatOptions = {}
): string => {
  const date = toDate(dateValue);
  if (!date) return 'Invalid Date';

  const {
    locale = 'en-US',
    timeZone,
    businessTimezone,
    showYear = true
  } = options;

  // Use business timezone if provided, otherwise fall back to default or local
  const effectiveTimeZone = businessTimezone || timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    timeZone: effectiveTimeZone
  };

  if (showYear) {
    formatOptions.year = 'numeric';
  }

  return date.toLocaleDateString(locale, formatOptions);
};

/**
 * Formats time with AM/PM by default
 */
export const formatTime = (
  dateValue: Date | string | number | undefined | null,
  options: DateFormatOptions = {}
): string => {
  const date = toDate(dateValue);
  if (!date) return 'Invalid Time';

  const {
    locale = 'en-US',
    timeZone,
    businessTimezone,
    hour12 = true,
    showSeconds = false
  } = options;

  // Use business timezone if provided, otherwise fall back to default or local
  const effectiveTimeZone = businessTimezone || timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: effectiveTimeZone,
    hour12
  };

  if (showSeconds) {
    formatOptions.second = '2-digit';
  }

  return date.toLocaleTimeString(locale, formatOptions);
};

/**
 * Formats date and time together with AM/PM
 */
export const formatDateTime = (
  dateValue: Date | string | number | undefined | null,
  options: DateFormatOptions = {}
): string => {
  const date = toDate(dateValue);
  if (!date) return 'Invalid Date & Time';

  const {
    locale = 'en-US',
    timeZone,
    businessTimezone,
    hour12 = true,
    showSeconds = false,
    showYear = true
  } = options;

  const dateStr = formatDate(date, { locale, timeZone, businessTimezone, showYear });
  const timeStr = formatTime(date, { locale, timeZone, businessTimezone, hour12, showSeconds });

  return `${dateStr} ${timeStr}`;
};

/**
 * Formats date and time in a compact format (e.g., "Dec 25, 2024 2:30 PM")
 */
export const formatCompactDateTime = (
  dateValue: Date | string | number | undefined | null,
  options: DateFormatOptions = {}
): string => {
  const date = toDate(dateValue);
  if (!date) return 'Invalid Date & Time';

  const {
    locale = 'en-US',
    timeZone,
    businessTimezone,
    hour12 = true
  } = options;

  // Use business timezone if provided, otherwise fall back to default or local
  const effectiveTimeZone = businessTimezone || timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: effectiveTimeZone,
    hour12
  };

  return date.toLocaleDateString(locale, formatOptions);
};

/**
 * Formats date and time in a short format (e.g., "12/25/24 2:30 PM")
 */
export const formatShortDateTime = (
  dateValue: Date | string | number | undefined | null,
  options: DateFormatOptions = {}
): string => {
  const date = toDate(dateValue);
  if (!date) return 'Invalid Date & Time';

  const {
    locale = 'en-US',
    timeZone = 'America/New_York',
    hour12 = true
  } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
    hour12
  };

  return date.toLocaleDateString(locale, formatOptions);
};

/**
 * Formats date and time in ISO format for database storage
 */
export const formatISO = (
  dateValue: Date | string | number | undefined | null
): string => {
  const date = toDate(dateValue);
  if (!date) return new Date().toISOString();

  return date.toISOString();
};

/**
 * Formats date and time in a format suitable for file names
 */
export const formatForFileName = (
  dateValue: Date | string | number | undefined | null
): string => {
  const date = toDate(dateValue);
  if (!date) return new Date().toISOString().split('T')[0];

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

/**
 * Formats relative time (e.g., "2 hours ago", "yesterday", "last week")
 */
export const formatRelativeTime = (
  dateValue: Date | string | number | undefined | null,
  options: RelativeTimeOptions = {}
): string => {
  const date = toDate(dateValue);
  if (!date) return 'Unknown';

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays === 1) {
    return 'yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
};

/**
 * Formats date for display in tables (compact format)
 */
export const formatTableDate = (
  dateValue: Date | string | number | undefined | null
): string => {
  return formatDate(dateValue, { showYear: false });
};

/**
 * Formats time for display in tables (time only)
 */
export const formatTableTime = (
  dateValue: Date | string | number | undefined | null
): string => {
  return formatTime(dateValue, { hour12: true, showSeconds: false });
};

/**
 * Formats date and time for display in tables
 */
export const formatTableDateTime = (
  dateValue: Date | string | number | undefined | null
): string => {
  return formatDateTime(dateValue, { hour12: true, showSeconds: false });
};

/**
 * Formats date for chart axes (short format)
 */
export const formatChartDate = (
  dateValue: Date | string | number | undefined | null
): string => {
  const date = toDate(dateValue);
  if (!date) return '';

  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${month}/${day}`;
};

/**
 * Formats time for chart axes (time only)
 */
export const formatChartTime = (
  dateValue: Date | string | number | undefined | null
): string => {
  const date = toDate(dateValue);
  if (!date) return '';

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

/**
 * Checks if a date is today
 */
export const isToday = (dateValue: Date | string | number | undefined | null): boolean => {
  const date = toDate(dateValue);
  if (!date) return false;

  const today = new Date();
  return date.toDateString() === today.toDateString();
};

/**
 * Checks if a date is yesterday
 */
export const isYesterday = (dateValue: Date | string | number | undefined | null): boolean => {
  const date = toDate(dateValue);
  if (!date) return false;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

/**
 * Gets the start of day for a given date
 */
export const getStartOfDay = (dateValue: Date | string | number | undefined | null): Date => {
  const date = toDate(dateValue);
  if (!date) return new Date();

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

/**
 * Gets the end of day for a given date
 */
export const getEndOfDay = (dateValue: Date | string | number | undefined | null): Date => {
  const date = toDate(dateValue);
  if (!date) return new Date();

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

/**
 * Gets the start of week for a given date
 */
export const getStartOfWeek = (dateValue: Date | string | number | undefined | null): Date => {
  const date = toDate(dateValue);
  if (!date) return new Date();

  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

/**
 * Gets the start of month for a given date
 */
export const getStartOfMonth = (dateValue: Date | string | number | undefined | null): Date => {
  const date = toDate(dateValue);
  if (!date) return new Date();

  const startOfMonth = new Date(date);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  return startOfMonth;
};

/**
 * Gets the end of month for a given date
 */
export const getEndOfMonth = (dateValue: Date | string | number | undefined | null): Date => {
  const date = toDate(dateValue);
  if (!date) return new Date();

  const endOfMonth = new Date(date);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  return endOfMonth;
};

/**
 * Adds days to a date
 */
export const addDays = (
  dateValue: Date | string | number | undefined | null,
  days: number
): Date => {
  const date = toDate(dateValue);
  if (!date) return new Date();

  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

/**
 * Subtracts days from a date
 */
export const subtractDays = (
  dateValue: Date | string | number | undefined | null,
  days: number
): Date => {
  return addDays(dateValue, -days);
};

/**
 * Gets the difference in days between two dates
 */
export const getDaysDifference = (
  date1: Date | string | number | undefined | null,
  date2: Date | string | number | undefined | null
): number => {
  const d1 = toDate(date1);
  const d2 = toDate(date2);
  
  if (!d1 || !d2) return 0;

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Formats a date range for display
 */
export const formatDateRange = (
  startDate: Date | string | number | undefined | null,
  endDate: Date | string | number | undefined | null,
  options: DateFormatOptions = {}
): string => {
  const start = toDate(startDate);
  const end = toDate(endDate);
  
  if (!start || !end) return 'Invalid Date Range';

  if (start.toDateString() === end.toDateString()) {
    // Same day, show date and time range
    const dateStr = formatDate(start, options);
    const startTimeStr = formatTime(start, options);
    const endTimeStr = formatTime(end, options);
    return `${dateStr} ${startTimeStr} - ${endTimeStr}`;
  } else {
    // Different days, show date range
    const startStr = formatDate(start, options);
    const endStr = formatDate(end, options);
    return `${startStr} - ${endStr}`;
  }
};

/**
 * Default export for backward compatibility
 */
export default {
  toDate,
  formatDate,
  formatTime,
  formatDateTime,
  formatCompactDateTime,
  formatShortDateTime,
  formatISO,
  formatForFileName,
  formatRelativeTime,
  formatTableDate,
  formatTableTime,
  formatTableDateTime,
  formatChartDate,
  formatChartTime,
  isToday,
  isYesterday,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  addDays,
  subtractDays,
  getDaysDifference,
  formatDateRange
};
