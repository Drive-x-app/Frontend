import {
  mapBackendToBookingDisplayItem,
  BookingCategory,
  BookingDisplayItem,
} from '../src/services/booking/myBookingsData';
import { BackendBookingItem } from '../src/services/api/bookingsApi';

describe('My Bookings Page Functionality & Status Mapping', () => {
  const baseMockBooking: BackendBookingItem = {
    id: 'b1f7b9e0-82a1-42e5-bc02-9a3d132b145a',
    customerId: 'c1f7b9e0-82a1-42e5-bc02-9a3d132b145a',
    status: 'PENDING',
    durationId: '2h',
    durationLabel: '2 Hours',
    pickupLocation: '123, Anna Nagar, Coimbatore',
    dropLocation: 'RS Puram, Coimbatore',
    pickupDate: '2026-10-30',
    pickupTime: '10:30 AM',
    timingMode: 'later',
    fare: 630,
    currency: 'INR',
    paymentMethod: 'UPI',
    paymentStatus: 'PENDING',
    driverId: null,
    driverName: null,
    createdAt: '2026-10-30T09:00:00.000Z',
    completedAt: null,
  };

  it('correctly maps PENDING status to Upcoming category with Confirmed label', () => {
    const item = mapBackendToBookingDisplayItem(baseMockBooking);
    expect(item.id).toBe(baseMockBooking.id);
    expect(item.bookingRef).toBe('DXB-B1F7B9E0');
    expect(item.category).toBe('Upcoming');
    expect(item.categoryLabel).toBe('Confirmed');
    expect(item.pickupLocation).toBe('123, Anna Nagar, Coimbatore');
    expect(item.dropLocation).toBe('RS Puram, Coimbatore');
    expect(item.pickupTime).toBe('10:30 AM');
    expect(item.durationLabel).toBe('2 Hours');
    expect(item.fare).toBe(630);
  });

  it('correctly maps SEARCHING status to Upcoming category with Finding Driver label', () => {
    const searchingBooking: BackendBookingItem = {
      ...baseMockBooking,
      status: 'SEARCHING',
    };
    const item = mapBackendToBookingDisplayItem(searchingBooking);
    expect(item.category).toBe('Upcoming');
    expect(item.categoryLabel).toBe('Finding Driver');
  });

  it('correctly maps ACCEPTED status to Upcoming category with Driver Assigned label', () => {
    const acceptedBooking: BackendBookingItem = {
      ...baseMockBooking,
      status: 'ACCEPTED',
      driverName: 'Ramesh Kumar',
    };
    const item = mapBackendToBookingDisplayItem(acceptedBooking);
    expect(item.category).toBe('Upcoming');
    expect(item.categoryLabel).toBe('Driver Assigned');
    expect(item.driverName).toBe('Ramesh Kumar');
  });

  it('correctly maps ARRIVED and IN_PROGRESS statuses to Ongoing category', () => {
    const arrivedBooking: BackendBookingItem = {
      ...baseMockBooking,
      status: 'ARRIVED',
    };
    const arrivedItem = mapBackendToBookingDisplayItem(arrivedBooking);
    expect(arrivedItem.category).toBe('Ongoing');
    expect(arrivedItem.categoryLabel).toBe('Driver Arrived');

    const inProgressBooking: BackendBookingItem = {
      ...baseMockBooking,
      status: 'IN_PROGRESS',
    };
    const inProgressItem = mapBackendToBookingDisplayItem(inProgressBooking);
    expect(inProgressItem.category).toBe('Ongoing');
    expect(inProgressItem.categoryLabel).toBe('Trip in Progress');
  });

  it('correctly maps COMPLETED status to Completed category', () => {
    const completedBooking: BackendBookingItem = {
      ...baseMockBooking,
      status: 'COMPLETED',
      completedAt: '2026-10-30T12:30:00.000Z',
    };
    const item = mapBackendToBookingDisplayItem(completedBooking);
    expect(item.category).toBe('Completed');
    expect(item.categoryLabel).toBe('Completed');
  });

  it('correctly maps CANCELLED status to Cancelled category', () => {
    const cancelledBooking: BackendBookingItem = {
      ...baseMockBooking,
      status: 'CANCELLED',
    };
    const item = mapBackendToBookingDisplayItem(cancelledBooking);
    expect(item.category).toBe('Cancelled');
    expect(item.categoryLabel).toBe('Cancelled');
  });

  it('gracefully handles missing optional fields', () => {
    const minimalBooking: BackendBookingItem = {
      id: '',
      customerId: 'user-1',
      status: 'PENDING',
      durationId: '1h',
      durationLabel: '',
      pickupLocation: '',
      dropLocation: null,
      pickupDate: null,
      pickupTime: null,
      timingMode: 'now',
      fare: 0,
      currency: 'INR',
      paymentMethod: '',
      paymentStatus: '',
      driverId: null,
      driverName: null,
      createdAt: '',
      completedAt: null,
    };

    const item = mapBackendToBookingDisplayItem(minimalBooking);
    expect(item.pickupLocation).toBeDefined();
    expect(item.dropLocation).toBe('Round Trip / City Center');
    expect(item.durationLabel).toBe('2 Hours');
    expect(item.fare).toBe(0);
    expect(item.bookingRef).toBe('DXB-126789');
  });

  it('filters a collection of bookings into appropriate categories', () => {
    const bookingsList: BackendBookingItem[] = [
      { ...baseMockBooking, id: '1', status: 'PENDING' },
      { ...baseMockBooking, id: '2', status: 'IN_PROGRESS' },
      { ...baseMockBooking, id: '3', status: 'COMPLETED' },
      { ...baseMockBooking, id: '4', status: 'CANCELLED' },
      { ...baseMockBooking, id: '5', status: 'SEARCHING' },
    ];

    const mapped = bookingsList.map(mapBackendToBookingDisplayItem);
    const upcoming = mapped.filter((b) => b.category === 'Upcoming');
    const ongoing = mapped.filter((b) => b.category === 'Ongoing');
    const completed = mapped.filter((b) => b.category === 'Completed');
    const cancelled = mapped.filter((b) => b.category === 'Cancelled');

    expect(upcoming.length).toBe(2);
    expect(ongoing.length).toBe(1);
    expect(completed.length).toBe(1);
    expect(cancelled.length).toBe(1);
  });
});
