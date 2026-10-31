export interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  dateKey: string;
  isPast: boolean;
  isToday: boolean;
}

/**
 * Returns a date key formatted as YYYY-MM-DD in local time.
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date key YYYY-MM-DD.
 */
export function getTodayDateKey(now = new Date()): string {
  return formatDateKey(now);
}

/**
 * Parses YYYY-MM-DD into { year, monthIndex, day }.
 */
export function parseDateKey(dateKey: string): {
  year: number;
  monthIndex: number;
  day: number;
} | null {
  if (!dateKey || typeof dateKey !== 'string') return null;
  const parts = dateKey.split('-');
  if (parts.length !== 3) return null;

  const year = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (Number.isNaN(year) || Number.isNaN(monthIndex) || Number.isNaN(day)) {
    return null;
  }
  return { year, monthIndex, day };
}

/**
 * Checks if a given YYYY-MM-DD date key is in the past relative to today.
 */
export function isDateInPast(dateKey: string, now = new Date()): boolean {
  const parsed = parseDateKey(dateKey);
  if (!parsed) return false;

  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  if (parsed.year < todayYear) return true;
  if (parsed.year > todayYear) return false;

  if (parsed.monthIndex < todayMonth) return true;
  if (parsed.monthIndex > todayMonth) return false;

  return parsed.day < todayDate;
}

/**
 * Checks if a dateKey corresponds to today.
 */
export function isToday(dateKey: string, now = new Date()): boolean {
  return dateKey === getTodayDateKey(now);
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Generates the full 7-column calendar grid for a given month and year.
 * Includes preceding month overflow and marks days as past/today/current.
 */
export function generateCalendarDays(
  year: number,
  monthIndex: number,
  now = new Date()
): CalendarDay[] {
  const days: CalendarDay[] = [];
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay(); // 0 is Sunday
  const totalDaysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, monthIndex, 0).getDate();

  const todayKey = getTodayDateKey(now);

  // 1. Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i;
    const prevMonthIdx = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevYear = monthIndex === 0 ? year - 1 : year;
    const dateKey = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    days.push({
      day: dayNum,
      isCurrentMonth: false,
      dateKey,
      isPast: true, // Overflow from previous month is always treated as disabled
      isToday: false,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const past = isDateInPast(dateKey, now);
    const today = dateKey === todayKey;

    days.push({
      day: d,
      isCurrentMonth: true,
      dateKey,
      isPast: past,
      isToday: today,
    });
  }

  // 3. Next month trailing days to complete the 7-column grid
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let nextDay = 1; nextDay <= remainingCells; nextDay++) {
    const nextMonthIdx = monthIndex === 11 ? 0 : monthIndex + 1;
    const nextYear = monthIndex === 11 ? year + 1 : year;
    const dateKey = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;

    days.push({
      day: nextDay,
      isCurrentMonth: false,
      dateKey,
      isPast: false,
      isToday: false,
    });
  }

  return days;
}

/**
 * Checks whether navigating to the previous month is permitted (i.e. month is after the current month).
 */
export function canGoToPrevMonth(
  year: number,
  monthIndex: number,
  now = new Date()
): boolean {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  if (year > currentYear) return true;
  if (year === currentYear) return monthIndex > currentMonth;
  return false;
}

/**
 * Generates regular 30-minute interval time slots between startHour and endHour.
 * Example: '08:00 AM', '08:30 AM', ... '10:00 PM'
 */
export function generateDailyTimeSlots(
  startHour = 6,
  endHour = 23,
  intervalMinutes = 30
): string[] {
  const slots: string[] = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      if (hour === endHour && minute > 0) break;

      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      const hourStr = String(displayHour).padStart(2, '0');
      const minuteStr = String(minute).padStart(2, '0');

      slots.push(`${hourStr}:${minuteStr} ${period}`);
    }
  }

  return slots;
}

/**
 * Parses a slot string like "09:30 AM" into minutes from start of day.
 */
export function parseSlotToMinutes(slot: string): number {
  const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours < 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Filters out time slots that have already passed if the selected date is today.
 * Includes a lead-time buffer (default: 15 minutes).
 */
export function filterAvailableTimeSlots(
  slots: string[],
  selectedDateKey: string,
  now = new Date(),
  leadTimeMinutes = 15
): string[] {
  if (isDateInPast(selectedDateKey, now)) {
    return [];
  }

  // If date is in the future, all standard slots are available
  if (!isToday(selectedDateKey, now)) {
    return slots;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes() + leadTimeMinutes;

  return slots.filter((slot) => {
    const slotMinutes = parseSlotToMinutes(slot);
    return slotMinutes >= currentMinutes;
  });
}
