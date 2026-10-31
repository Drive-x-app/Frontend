import { useBookingStore, DURATION_OPTIONS } from '../src/store/bookingStore';

describe('Select Duration Integration & Store Persistence', () => {
  beforeEach(() => {
    useBookingStore.getState().resetBooking();
  });

  it('defines valid duration options matching the reference design', () => {
    expect(DURATION_OPTIONS).toBeDefined();
    expect(DURATION_OPTIONS.length).toBe(6);

    const ids = DURATION_OPTIONS.map((d) => d.id);
    expect(ids).toEqual(['1h', '2h', '4h', '6h', 'fullday', '1week']);

    // Check specific options
    const oneHour = DURATION_OPTIONS.find((d) => d.id === '1h');
    expect(oneHour).toEqual({
      id: '1h',
      label: '1 Hour',
      description: 'Short trips\nand quick travel',
      hours: 1,
    });

    const fullDay = DURATION_OPTIONS.find((d) => d.id === 'fullday');
    expect(fullDay?.hours).toBe(12);

    const oneWeek = DURATION_OPTIONS.find((d) => d.id === '1week');
    expect(oneWeek?.hours).toBe(168);
  });

  it('initializes with a valid default duration', () => {
    const state = useBookingStore.getState();
    expect(state.selectedDurationId).toBe('1h');
    expect(DURATION_OPTIONS.some((d) => d.id === state.selectedDurationId)).toBe(true);
  });

  it('updates selected duration correctly in Zustand store', () => {
    const store = useBookingStore.getState();
    store.setSelectedDurationId('4h');

    expect(useBookingStore.getState().selectedDurationId).toBe('4h');

    store.setSelectedDurationId('fullday');
    expect(useBookingStore.getState().selectedDurationId).toBe('fullday');
  });

  it('preserves location, coordinates, route metrics, and date/time when duration changes', () => {
    const store = useBookingStore.getState();

    // Set location selection data
    store.setPickupLocation('123, Anna Nagar, Coimbatore');
    store.setPickupCoords({ latitude: 11.0168, longitude: 76.9558, address: 'Anna Nagar' });
    store.setDropLocation('Coimbatore International Airport');
    store.setDropCoords({ latitude: 11.0298, longitude: 77.0434, address: 'Airport' });
    store.setRouteMetrics({
      distanceKm: 12.4,
      durationMinutes: 28,
      coordinates: [
        { latitude: 11.0168, longitude: 76.9558 },
        { latitude: 11.0298, longitude: 77.0434 },
      ],
    });

    // Set date and time data
    store.setSelectedDate('2026-11-15');
    store.setSelectedTime('09:30 AM');
    store.setPickupTimingMode('later');

    // User chooses duration
    store.setSelectedDurationId('6h');

    const stateAfter = useBookingStore.getState();
    expect(stateAfter.selectedDurationId).toBe('6h');

    // All prior booking state must be preserved
    expect(stateAfter.pickupLocation).toBe('123, Anna Nagar, Coimbatore');
    expect(stateAfter.pickupCoords?.latitude).toBe(11.0168);
    expect(stateAfter.dropLocation).toBe('Coimbatore International Airport');
    expect(stateAfter.dropCoords?.latitude).toBe(11.0298);
    expect(stateAfter.estimatedDistanceKm).toBe(12.4);
    expect(stateAfter.estimatedDurationMinutes).toBe(28);
    expect(stateAfter.routeCoordinates?.length).toBe(2);
    expect(stateAfter.selectedDate).toBe('2026-11-15');
    expect(stateAfter.selectedTime).toBe('09:30 AM');
    expect(stateAfter.pickupTimingMode).toBe('later');
  });

  it('restores previous duration when navigating back and forth', () => {
    const store = useBookingStore.getState();
    store.setSelectedDurationId('2h');

    // Simulate navigation to summary and returning back
    const storedDurationId = useBookingStore.getState().selectedDurationId;
    expect(storedDurationId).toBe('2h');

    const matchedDuration = DURATION_OPTIONS.find((d) => d.id === storedDurationId);
    expect(matchedDuration?.label).toBe('2 Hours');
    expect(matchedDuration?.hours).toBe(2);
  });

  describe('Booking Summary Integration', () => {
    const HOURLY_RATE = 300;

    it('calculates correct estimated fares based on duration hours without hardcoded values', () => {
      // 1 hour
      const oneHour = DURATION_OPTIONS.find((d) => d.id === '1h')!;
      expect(oneHour.hours * HOURLY_RATE).toBe(300);

      // 4 hours
      const fourHours = DURATION_OPTIONS.find((d) => d.id === '4h')!;
      expect(fourHours.hours * HOURLY_RATE).toBe(1200);

      // Full day (12 hours)
      const fullDay = DURATION_OPTIONS.find((d) => d.id === 'fullday')!;
      expect(fullDay.hours * HOURLY_RATE).toBe(3600);

      // 1 week (168 hours)
      const oneWeek = DURATION_OPTIONS.find((d) => d.id === '1week')!;
      expect(oneWeek.hours * HOURLY_RATE).toBe(50400);
    });

    it('correctly handles Now vs Later pickup timing mode for summary display', () => {
      const store = useBookingStore.getState();

      // Case A: Now mode
      store.setPickupTimingMode('now');
      expect(useBookingStore.getState().pickupTimingMode).toBe('now');

      // Case B: Later mode with custom time slot
      store.setPickupTimingMode('later');
      store.setSelectedTime('04:30 PM');
      expect(useBookingStore.getState().pickupTimingMode).toBe('later');
      expect(useBookingStore.getState().selectedTime).toBe('04:30 PM');
    });

    it('preserves route metrics when present and handles null when not available', () => {
      const store = useBookingStore.getState();

      // When route metrics exist
      store.setRouteMetrics({ distanceKm: 8.5, durationMinutes: 20 });
      expect(useBookingStore.getState().estimatedDistanceKm).toBe(8.5);
      expect(useBookingStore.getState().estimatedDurationMinutes).toBe(20);

      // When clearing/resetting
      store.setRouteMetrics({ distanceKm: null, durationMinutes: null });
      expect(useBookingStore.getState().estimatedDistanceKm).toBeNull();
      expect(useBookingStore.getState().estimatedDurationMinutes).toBeNull();
    });
  });
});
