import {
  formatDateKey,
  getTodayDateKey,
  parseDateKey,
  isDateInPast,
  isToday,
  canGoToPrevMonth,
  generateCalendarDays,
  generateDailyTimeSlots,
  parseSlotToMinutes,
  filterAvailableTimeSlots,
} from '../src/utils/dateTime';
import { useBookingStore } from '../src/store/bookingStore';

describe('dateTime utilities', () => {
  describe('formatDateKey & parseDateKey', () => {
    it('formats a date as YYYY-MM-DD', () => {
      const date = new Date(2026, 9, 14); // 2026-10-14
      expect(formatDateKey(date)).toBe('2026-10-14');
    });

    it('pads single-digit month and day with zeros', () => {
      const date = new Date(2026, 0, 5); // 2026-01-05
      expect(formatDateKey(date)).toBe('2026-01-05');
    });

    it('parses valid date keys into year, monthIndex, and day', () => {
      const parsed = parseDateKey('2026-10-14');
      expect(parsed).toEqual({
        year: 2026,
        monthIndex: 9,
        day: 14,
      });
    });

    it('returns null for malformed or non-string date keys', () => {
      expect(parseDateKey('')).toBeNull();
      expect(parseDateKey('invalid-date')).toBeNull();
      expect(parseDateKey('2026-10')).toBeNull();
      expect(parseDateKey(null as any)).toBeNull();
    });
  });

  describe('isDateInPast & isToday', () => {
    const mockNow = new Date(2026, 9, 15, 14, 0, 0); // 2026-10-15 2:00 PM

    it('correctly identifies past dates', () => {
      expect(isDateInPast('2026-10-14', mockNow)).toBe(true);
      expect(isDateInPast('2026-09-30', mockNow)).toBe(true);
      expect(isDateInPast('2025-12-31', mockNow)).toBe(true);
    });

    it('identifies today as not past', () => {
      expect(isDateInPast('2026-10-15', mockNow)).toBe(false);
      expect(isToday('2026-10-15', mockNow)).toBe(true);
    });

    it('identifies future dates as not past', () => {
      expect(isDateInPast('2026-10-16', mockNow)).toBe(false);
      expect(isDateInPast('2026-11-01', mockNow)).toBe(false);
      expect(isDateInPast('2027-01-01', mockNow)).toBe(false);
      expect(isToday('2026-10-16', mockNow)).toBe(false);
    });
  });

  describe('canGoToPrevMonth', () => {
    const mockNow = new Date(2026, 9, 15); // October 2026

    it('prevents navigating before current month and year', () => {
      expect(canGoToPrevMonth(2026, 9, mockNow)).toBe(false); // Oct 2026
      expect(canGoToPrevMonth(2026, 8, mockNow)).toBe(false); // Sep 2026
      expect(canGoToPrevMonth(2025, 11, mockNow)).toBe(false); // Dec 2025
    });

    it('permits navigating when on a future month or year', () => {
      expect(canGoToPrevMonth(2026, 10, mockNow)).toBe(true); // Nov 2026
      expect(canGoToPrevMonth(2027, 0, mockNow)).toBe(true); // Jan 2027
    });
  });

  describe('generateCalendarDays', () => {
    const mockNow = new Date(2026, 9, 15); // Oct 15, 2026

    it('generates the correct calendar grid for October 2026', () => {
      const days = generateCalendarDays(2026, 9, mockNow);
      // October 2026 starts on Thursday (Sun=0, Mon=1, Tue=2, Wed=3, Thu=4) -> 4 leading days
      // Total days in Oct = 31
      // Total leading + month = 4 + 31 = 35 -> exactly 5 rows of 7
      expect(days.length % 7).toBe(0);
      expect(days.length).toBe(35);

      // Verify first leading overflow day is Sun Sep 27
      expect(days[0]).toMatchObject({
        day: 27,
        isCurrentMonth: false,
        isPast: true,
      });

      // Verify day 1 of October is Thursday at index 4
      expect(days[4]).toMatchObject({
        day: 1,
        isCurrentMonth: true,
        dateKey: '2026-10-01',
        isPast: true, // Oct 1 is in past relative to Oct 15
      });

      // Verify today is Oct 15 (index 4 + 14 = 18)
      expect(days[18]).toMatchObject({
        day: 15,
        isCurrentMonth: true,
        dateKey: '2026-10-15',
        isPast: false,
        isToday: true,
      });

      // Verify future day Oct 20
      expect(days[23]).toMatchObject({
        day: 20,
        isCurrentMonth: true,
        dateKey: '2026-10-20',
        isPast: false,
        isToday: false,
      });
    });

    it('correctly handles leap year February (2024 has 29 days)', () => {
      const mockLeap = new Date(2024, 1, 10);
      const days = generateCalendarDays(2024, 1, mockLeap);
      const febDays = days.filter((d) => d.isCurrentMonth);
      expect(febDays.length).toBe(29);
      expect(febDays[28].day).toBe(29);
    });

    it('correctly handles non-leap year February (2025 has 28 days)', () => {
      const mockNonLeap = new Date(2025, 1, 10);
      const days = generateCalendarDays(2025, 1, mockNonLeap);
      const febDays = days.filter((d) => d.isCurrentMonth);
      expect(febDays.length).toBe(28);
    });
  });

  describe('generateDailyTimeSlots', () => {
    it('generates 30-minute intervals across given range', () => {
      const slots = generateDailyTimeSlots(8, 10, 30);
      expect(slots).toEqual([
        '08:00 AM',
        '08:30 AM',
        '09:00 AM',
        '09:30 AM',
        '10:00 AM',
      ]);
    });

    it('correctly marks AM and PM across noon', () => {
      const slots = generateDailyTimeSlots(11, 13, 30);
      expect(slots).toEqual([
        '11:00 AM',
        '11:30 AM',
        '12:00 PM',
        '12:30 PM',
        '01:00 PM',
      ]);
    });
  });

  describe('parseSlotToMinutes', () => {
    it('converts 12-hour time slots to minutes from midnight', () => {
      expect(parseSlotToMinutes('12:00 AM')).toBe(0);
      expect(parseSlotToMinutes('06:30 AM')).toBe(6 * 60 + 30);
      expect(parseSlotToMinutes('12:00 PM')).toBe(12 * 60);
      expect(parseSlotToMinutes('02:30 PM')).toBe(14 * 60 + 30);
      expect(parseSlotToMinutes('11:30 PM')).toBe(23 * 60 + 30);
    });
  });

  describe('filterAvailableTimeSlots', () => {
    const slots = [
      '09:00 AM',
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '12:00 PM',
    ];

    it('returns all slots if selected date is in the future', () => {
      const now = new Date(2026, 9, 15, 10, 0, 0);
      const result = filterAvailableTimeSlots(slots, '2026-10-16', now);
      expect(result).toEqual(slots);
    });

    it('returns empty array if selected date is in the past', () => {
      const now = new Date(2026, 9, 15, 10, 0, 0);
      const result = filterAvailableTimeSlots(slots, '2026-10-14', now);
      expect(result).toEqual([]);
    });

    it('filters out past slots on today with 15-minute lead buffer', () => {
      // 10:00 AM + 15 min buffer = 10:15 AM
      const now = new Date(2026, 9, 15, 10, 0, 0);
      const result = filterAvailableTimeSlots(slots, '2026-10-15', now, 15);
      expect(result).toEqual([
        '10:30 AM',
        '11:00 AM',
        '11:30 AM',
        '12:00 PM',
      ]);
    });
  });

  describe('Zustand Booking Store Persistence', () => {
    beforeEach(() => {
      useBookingStore.getState().resetBooking();
    });

    it('maintains selected date, time, and timing mode in store', () => {
      const store = useBookingStore.getState();

      store.setSelectedDate('2026-11-20');
      store.setSelectedTime('02:30 PM');
      store.setPickupTimingMode('later');

      const updated = useBookingStore.getState();
      expect(updated.selectedDate).toBe('2026-11-20');
      expect(updated.selectedTime).toBe('02:30 PM');
      expect(updated.pickupTimingMode).toBe('later');
    });

    it('preserves existing pickup & drop locations and route coordinates when date/time changes', () => {
      const store = useBookingStore.getState();

      store.setPickupLocation('123 Test St, Coimbatore');
      store.setPickupCoords({ latitude: 11.0168, longitude: 76.9558, address: '123 Test St' });
      store.setDropLocation('Brookefields Mall');
      store.setDropCoords({ latitude: 11.0018, longitude: 76.9634, address: 'Brookefields Mall' });
      store.setRouteMetrics({
        distanceKm: 4.5,
        durationMinutes: 12,
        coordinates: [{ latitude: 11.0168, longitude: 76.9558 }],
      });

      // Now change date and timing mode
      store.setSelectedDate('2026-12-01');
      store.setPickupTimingMode('now');

      const stateAfter = useBookingStore.getState();
      expect(stateAfter.pickupLocation).toBe('123 Test St, Coimbatore');
      expect(stateAfter.pickupCoords?.latitude).toBe(11.0168);
      expect(stateAfter.dropLocation).toBe('Brookefields Mall');
      expect(stateAfter.dropCoords?.latitude).toBe(11.0018);
      expect(stateAfter.estimatedDistanceKm).toBe(4.5);
      expect(stateAfter.estimatedDurationMinutes).toBe(12);
      expect(stateAfter.routeCoordinates?.length).toBe(1);
    });

    it('resets booking date dynamically to today', () => {
      const store = useBookingStore.getState();
      store.setSelectedDate('2030-01-01');
      store.resetBooking();

      const today = getTodayDateKey();
      expect(useBookingStore.getState().selectedDate).toBe(today);
    });
  });
});
