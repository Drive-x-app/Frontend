export type TripStatus = 'Completed' | 'Scheduled' | 'Cancelled';

export interface TripHistoryDriver {
  name: string;
  rating: number;
  carModel: string;
  plateNumber: string;
}

export interface TripHistoryItem {
  id: string;
  monthSection: string; // e.g. "October 2026"
  dateFormatted: string; // e.g. "Tue, 14 Oct 2026"
  timeSlot: string; // e.g. "10:00 AM – 02:05 PM"
  status: TripStatus;
  pickupAddress: string;
  dropAddress: string;
  durationLabel: string;
  fare: number;
  driver: TripHistoryDriver;
}

export const TRIP_HISTORY_DATA: TripHistoryItem[] = [
  {
    id: 'trip-101',
    monthSection: 'October 2026',
    dateFormatted: 'Tue, 14 Oct 2026',
    timeSlot: '10:00 AM – 02:05 PM',
    status: 'Completed',
    pickupAddress: '123, Anna Nagar, Coimbatore',
    dropAddress: 'RS Puram, Coimbatore',
    durationLabel: '4 Hours',
    fare: 1200,
    driver: {
      name: 'Ramesh Kumar',
      rating: 4.8,
      carModel: 'White Toyota Etios',
      plateNumber: 'TN 38 AB 1234',
    },
  },
  {
    id: 'trip-102',
    monthSection: 'October 2026',
    dateFormatted: 'Wed, 08 Oct 2026',
    timeSlot: '06:00 PM – 08:00 PM',
    status: 'Completed',
    pickupAddress: 'Saibaba Colony, Coimbatore',
    dropAddress: 'Gandhipuram, Coimbatore',
    durationLabel: '2 Hours',
    fare: 600,
    driver: {
      name: 'Karthik',
      rating: 4.9,
      carModel: 'Maruti Dzire',
      plateNumber: 'TN 37 CD 5678',
    },
  },
  {
    id: 'trip-103',
    monthSection: 'September 2026',
    dateFormatted: 'Sat, 27 Sep 2026',
    timeSlot: '11:00 AM – 05:00 PM',
    status: 'Completed',
    pickupAddress: 'Avinashi Road, Coimbatore',
    dropAddress: 'RS Puram, Coimbatore',
    durationLabel: '6 Hours',
    fare: 1800,
    driver: {
      name: 'Suresh',
      rating: 4.7,
      carModel: 'Honda City',
      plateNumber: 'TN 38 EF 9012',
    },
  },
  {
    id: 'trip-104',
    monthSection: 'September 2026',
    dateFormatted: 'Tue, 16 Sep 2026',
    timeSlot: '09:00 AM – 01:00 PM',
    status: 'Cancelled',
    pickupAddress: 'Peelamedu, Coimbatore',
    dropAddress: 'Gandhipuram, Coimbatore',
    durationLabel: '4 Hours',
    fare: 0,
    driver: {
      name: 'Manoj',
      rating: 4.6,
      carModel: 'Hyundai Aura',
      plateNumber: 'TN 37 GH 3456',
    },
  },
  {
    id: 'trip-105',
    monthSection: 'August 2026',
    dateFormatted: 'Mon, 25 Aug 2026',
    timeSlot: '02:00 PM – 06:00 PM',
    status: 'Completed',
    pickupAddress: 'Saravanampatti, Coimbatore',
    dropAddress: 'Ukkadam, Coimbatore',
    durationLabel: '4 Hours',
    fare: 1400,
    driver: {
      name: 'Pravin',
      rating: 4.8,
      carModel: 'Toyota Innova',
      plateNumber: 'TN 38 IJ 7890',
    },
  },
];

import { BackendBookingItem } from '../api/bookingsApi';

export function mapBackendStatusToTripStatus(backendStatus: string): TripStatus {
  const normalized = (backendStatus || '').toUpperCase();
  if (normalized === 'COMPLETED') {
    return 'Completed';
  }
  if (normalized === 'CANCELLED') {
    return 'Cancelled';
  }
  // PENDING, SEARCHING, ACCEPTED, ARRIVED, IN_PROGRESS
  return 'Scheduled';
}

export function formatMonthSection(dateInput: string | Date | null | undefined): string {
  try {
    const date = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(date.getTime())) {
      return 'Recent Trips';
    }
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  } catch {
    return 'Recent Trips';
  }
}

export function formatTripDate(
  dateInput: string | Date | null | undefined,
  pickupDateStr?: string | null,
): string {
  try {
    if (pickupDateStr && pickupDateStr.includes('-')) {
      const parts = pickupDateStr.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const date = new Date(y, m, d);
        if (!isNaN(date.getTime())) {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
          ];
          return `${dayNames[date.getDay()]}, ${d < 10 ? '0' + d : d} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        }
      }
    }
    const date = dateInput ? new Date(dateInput) : new Date();
    if (!isNaN(date.getTime())) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      const d = date.getDate();
      return `${dayNames[date.getDay()]}, ${d < 10 ? '0' + d : d} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    }
    return pickupDateStr || 'Today';
  } catch {
    return pickupDateStr || 'Today';
  }
}

export function mapBookingToTripHistoryItem(booking: BackendBookingItem): TripHistoryItem {
  const status = mapBackendStatusToTripStatus(booking.status);
  const monthSection = formatMonthSection(booking.createdAt);
  const dateFormatted = formatTripDate(booking.createdAt, booking.pickupDate);
  const timeSlot = booking.pickupTime || 'Flexible Time';

  const defaultDriverName =
    booking.driverName ||
    (status === 'Scheduled' ? 'Driver Assigning...' : 'Professional Driver');

  return {
    id: booking.id,
    monthSection,
    dateFormatted,
    timeSlot,
    status,
    pickupAddress: booking.pickupLocation || 'Coimbatore',
    dropAddress: booking.dropLocation || 'Round Trip / City Center',
    durationLabel: booking.durationLabel || '2 Hours',
    fare: Math.round(booking.fare || 0),
    driver: {
      name: defaultDriverName,
      rating: 4.8,
      carModel: 'Chauffeured Vehicle',
      plateNumber: 'TN 38 DriverX',
    },
  };
}
