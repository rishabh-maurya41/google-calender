import {
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  differenceInMinutes,
  parseISO,
} from 'date-fns';

/**
 * Get the start date of the week (Monday) for any given date
 * @param date - The date to get the week start for
 * @returns The Monday of the week containing the given date
 */
export const getWeekStart = (date: Date): Date => {
  return startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
};

/**
 * Get the end date of the week (Sunday) for any given date
 * @param date - The date to get the week end for
 * @returns The Sunday of the week containing the given date
 */
export const getWeekEnd = (date: Date): Date => {
  return endOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
};

/**
 * Generate an array of 7 days for the current week starting from Monday
 * @param weekStart - The Monday of the week (from getWeekStart)
 * @returns Array of 7 Date objects representing Monday through Sunday
 */
export const getWeekDays = (weekStart: Date): Date[] => {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
};

/**
 * Format a date for display in the calendar header
 * @param date - The date to format
 * @param formatString - The format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDateForDisplay = (
  date: Date,
  formatString: string = 'MMM d, yyyy'
): string => {
  return format(date, formatString);
};

/**
 * Format a date range for display (e.g., "Dec 18 - Dec 24, 2023")
 * @param startDate - The start date of the range
 * @param endDate - The end date of the range
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const startMonth = format(startDate, 'MMM');
  const startDay = format(startDate, 'd');
  const endMonth = format(endDate, 'MMM');
  const endDay = format(endDate, 'd');
  const year = format(endDate, 'yyyy');

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
};

/**
 * Format time for display (e.g., "9:00 AM")
 * @param date - The date/time to format
 * @returns Formatted time string
 */
export const formatTimeForDisplay = (date: Date): string => {
  return format(date, 'h:mm a');
};

/**
 * Calculate the top position (in pixels) for an event block based on its start time
 * The calendar grid starts at 12:00 AM (0:00) and each hour is represented by a fixed height
 * @param startTime - The event start time
 * @param hourHeight - The height of one hour in pixels (default: 60)
 * @returns The top position in pixels from the start of the day
 */
export const calculateEventTop = (
  startTime: Date | string,
  hourHeight: number = 60
): number => {
  const date = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  // Calculate position: hours * hourHeight + (minutes / 60) * hourHeight
  return hours * hourHeight + (minutes / 60) * hourHeight;
};

/**
 * Calculate the height (in pixels) for an event block based on its duration
 * @param startTime - The event start time
 * @param endTime - The event end time
 * @param hourHeight - The height of one hour in pixels (default: 60)
 * @returns The height in pixels
 */
export const calculateEventHeight = (
  startTime: Date | string,
  endTime: Date | string,
  hourHeight: number = 60
): number => {
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  
  const durationInMinutes = differenceInMinutes(end, start);
  
  // Convert minutes to pixels: (minutes / 60) * hourHeight
  return (durationInMinutes / 60) * hourHeight;
};

/**
 * Calculate both position and height for an event block
 * @param startTime - The event start time
 * @param endTime - The event end time
 * @param hourHeight - The height of one hour in pixels (default: 60)
 * @returns Object with top position and height in pixels
 */
export const calculateEventPosition = (
  startTime: Date | string,
  endTime: Date | string,
  hourHeight: number = 60
): { top: number; height: number } => {
  return {
    top: calculateEventTop(startTime, hourHeight),
    height: calculateEventHeight(startTime, endTime, hourHeight),
  };
};

/**
 * Check if a date is today
 * @param date - The date to check
 * @returns True if the date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if both dates are on the same day
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

/**
 * Get the current hour (0-23)
 * @returns The current hour
 */
export const getCurrentHour = (): number => {
  return new Date().getHours();
};

/**
 * Check if a given hour is the current hour on today
 * @param date - The date to check
 * @param hour - The hour to check (0-23)
 * @returns True if the date is today and the hour is the current hour
 */
export const isCurrentTimeSlot = (date: Date, hour: number): boolean => {
  if (!isToday(date)) {
    return false;
  }
  const currentHour = getCurrentHour();
  return hour === currentHour;
};

/**
 * Validate that a value is a valid Date object
 * @param date - The value to check
 * @returns True if the value is a valid Date
 */
export const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Safely parse a date string or Date object
 * @param value - The value to parse
 * @returns A valid Date object or null if parsing fails
 */
export const safeParseDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) {
    return null;
  }
  
  try {
    if (value instanceof Date) {
      return isValidDate(value) ? value : null;
    }
    
    const parsed = typeof value === 'string' ? parseISO(value) : new Date(value);
    return isValidDate(parsed) ? parsed : null;
  } catch (error) {
    console.error('Error parsing date:', value, error);
    return null;
  }
};

/**
 * Validate event time range
 * @param startTime - The start time
 * @param endTime - The end time
 * @returns Object with validation result and error message
 */
export const validateEventTimeRange = (
  startTime: Date | null | undefined,
  endTime: Date | null | undefined
): { valid: boolean; error?: string } => {
  if (!startTime || !isValidDate(startTime)) {
    return { valid: false, error: 'Invalid start time' };
  }
  
  if (!endTime || !isValidDate(endTime)) {
    return { valid: false, error: 'Invalid end time' };
  }
  
  if (endTime <= startTime) {
    return { valid: false, error: 'End time must be after start time' };
  }
  
  // Check if the event duration is reasonable (not more than 24 hours)
  const durationInHours = differenceInMinutes(endTime, startTime) / 60;
  if (durationInHours > 24) {
    return { valid: false, error: 'Event duration cannot exceed 24 hours' };
  }
  
  return { valid: true };
};
