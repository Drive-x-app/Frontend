import {
  TRIP_HISTORY_DATA,
  TripHistoryItem,
  TripStatus,
} from '../src/services/trip/tripHistoryData';

describe('Trip History Page Data & Filtering', () => {
  it('defines valid trip history records matching the reference screenshot', () => {
    expect(TRIP_HISTORY_DATA).toBeDefined();
    expect(TRIP_HISTORY_DATA.length).toBeGreaterThanOrEqual(5);

    // Verify first trip (Ramesh Kumar)
    const trip1 = TRIP_HISTORY_DATA.find((t) => t.id === 'trip-101');
    expect(trip1).toBeDefined();
    expect(trip1?.dateFormatted).toBe('Tue, 14 Oct 2026');
    expect(trip1?.timeSlot).toBe('10:00 AM – 02:05 PM');
    expect(trip1?.status).toBe('Completed');
    expect(trip1?.pickupAddress).toBe('123, Anna Nagar, Coimbatore');
    expect(trip1?.dropAddress).toBe('RS Puram, Coimbatore');
    expect(trip1?.durationLabel).toBe('4 Hours');
    expect(trip1?.fare).toBe(1200);
    expect(trip1?.driver.name).toBe('Ramesh Kumar');
    expect(trip1?.driver.rating).toBe(4.8);
    expect(trip1?.driver.carModel).toBe('White Toyota Etios');
    expect(trip1?.driver.plateNumber).toBe('TN 38 AB 1234');
  });

  it('correctly filters trips by status', () => {
    // All Trips
    expect(TRIP_HISTORY_DATA.length).toBe(5);

    // Completed
    const completed = TRIP_HISTORY_DATA.filter((t) => t.status === 'Completed');
    expect(completed.length).toBe(4);
    expect(completed.every((t) => t.status === 'Completed')).toBe(true);

    // Cancelled
    const cancelled = TRIP_HISTORY_DATA.filter((t) => t.status === 'Cancelled');
    expect(cancelled.length).toBe(1);
    expect(cancelled[0].id).toBe('trip-104');
    expect(cancelled[0].fare).toBe(0);
    expect(cancelled[0].driver.name).toBe('Manoj');

    // Scheduled
    const scheduled = TRIP_HISTORY_DATA.filter((t) => t.status === 'Scheduled');
    expect(scheduled.length).toBe(0);
  });

  it('correctly groups trips by month section', () => {
    const grouped = TRIP_HISTORY_DATA.reduce((acc, trip) => {
      if (!acc[trip.monthSection]) acc[trip.monthSection] = [];
      acc[trip.monthSection].push(trip);
      return acc;
    }, {} as Record<string, TripHistoryItem[]>);

    const months = Object.keys(grouped);
    expect(months).toContain('October 2026');
    expect(months).toContain('September 2026');
    expect(months).toContain('August 2026');

    expect(grouped['October 2026'].length).toBe(2);
    expect(grouped['September 2026'].length).toBe(2);
    expect(grouped['August 2026'].length).toBe(1);
  });

  it('correctly maps backend booking response model to TripHistoryItem', () => {
    const {
      mapBookingToTripHistoryItem,
      mapBackendStatusToTripStatus,
      formatMonthSection,
      formatTripDate,
    } = require('../src/services/trip/tripHistoryData');

    expect(mapBackendStatusToTripStatus('COMPLETED')).toBe('Completed');
    expect(mapBackendStatusToTripStatus('CANCELLED')).toBe('Cancelled');
    expect(mapBackendStatusToTripStatus('PENDING')).toBe('Scheduled');
    expect(mapBackendStatusToTripStatus('SEARCHING')).toBe('Scheduled');
    expect(mapBackendStatusToTripStatus('IN_PROGRESS')).toBe('Scheduled');

    expect(formatMonthSection('2026-10-28T05:01:33.598Z')).toBe('October 2026');
    expect(formatTripDate('2026-10-28T05:01:33.598Z', '2026-10-28')).toContain('Oct 2026');

    const backendMock = {
      id: 'b1f7b9e0-82a1-42e5-bc02-9a3d132b145a',
      customerId: 'c1f7b9e0-82a1-42e5-bc02-9a3d132b145a',
      status: 'COMPLETED',
      durationId: '2h',
      durationLabel: '2 Hours',
      pickupLocation: '123, Anna Nagar, Coimbatore',
      dropLocation: 'RS Puram, Coimbatore',
      pickupDate: '2026-10-28',
      pickupTime: '10:00 AM',
      timingMode: 'now',
      fare: 499,
      currency: 'INR',
      paymentMethod: 'UPI',
      paymentStatus: 'COMPLETED',
      driverId: 'd1f7b9e0-82a1-42e5-bc02-9a3d132b145a',
      driverName: 'Suresh Kumar',
      createdAt: '2026-10-28T05:01:33.598Z',
      completedAt: null,
    };

    const item = mapBookingToTripHistoryItem(backendMock);
    expect(item.id).toBe('b1f7b9e0-82a1-42e5-bc02-9a3d132b145a');
    expect(item.status).toBe('Completed');
    expect(item.pickupAddress).toBe('123, Anna Nagar, Coimbatore');
    expect(item.dropAddress).toBe('RS Puram, Coimbatore');
    expect(item.durationLabel).toBe('2 Hours');
    expect(item.fare).toBe(499);
    expect(item.driver.name).toBe('Suresh Kumar');
    expect(item.monthSection).toBe('October 2026');
  });
});
