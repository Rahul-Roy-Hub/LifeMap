/**
 * Date utility functions for handling timezone-aware operations
 */

/**
 * Get the current date in the user's local timezone formatted as YYYY-MM-DD
 */
export const getCurrentLocalDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format a date object to YYYY-MM-DD in local timezone
 */
export const formatDateForDatabase = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse a YYYY-MM-DD date string to a Date object in local timezone
 */
export const parseDateFromDatabase = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Check if a date string represents today in local timezone
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getCurrentLocalDate();
};

/**
 * Check if a date string represents yesterday in local timezone
 */
export const isYesterday = (dateString: string): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateString === formatDateForDatabase(yesterday);
};

/**
 * Get the start of week date in local timezone (Sunday)
 */
export const getStartOfWeek = (date: Date = new Date()): Date => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
};

/**
 * Get the start of month date in local timezone
 */
export const getStartOfMonth = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Check if two date strings represent the same date
 */
export const isSameDate = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

/**
 * Get a date string for a specific number of days ago
 */
export const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateForDatabase(date);
};

/**
 * Get the week range (start and end dates) for a given date
 */
export const getWeekRange = (date: Date = new Date()): { start: string; end: string } => {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return {
    start: formatDateForDatabase(startOfWeek),
    end: formatDateForDatabase(endOfWeek)
  };
};

/**
 * Get all dates in the current week as an array of date strings
 */
export const getCurrentWeekDates = (): string[] => {
  const startOfWeek = getStartOfWeek();
  const dates: string[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(formatDateForDatabase(date));
  }
  
  return dates;
};

/**
 * Check if a date string is within the current week
 */
export const isThisWeek = (dateString: string): boolean => {
  const weekDates = getCurrentWeekDates();
  return weekDates.includes(dateString);
};

/**
 * Check if a date string is within the current month
 */
export const isThisMonth = (dateString: string): boolean => {
  const date = parseDateFromDatabase(dateString);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
};