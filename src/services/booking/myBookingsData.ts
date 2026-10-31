import { BackendBookingItem } from '../api/bookingsApi';
import { formatTripDate } from '../trip/tripHistoryData';

export type BookingCategory = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';

export interface BookingDisplayItem {
  id: string;
  bookingRef: string;
  status: string;
  category: BookingCategory;
  categoryLabel: string;
  pickupLocation: string;
  dropLocation: string;
  travelDate: string;
  pickupTime: string;
  durationLabel: string;
  fare: number;
  paymentMethod: string;
  paymentStatus: string;
  driverName?: string | null;
  driverPhone?: string | null;
  driverRating?: number;
  driverVehicle?: string;
  driverPlate?: string;
  createdAt: string;
  completedAt?: string | null;
}

export function mapBackendToBookingDisplayItem(b: BackendBookingItem): BookingDisplayItem {
  const s = (b.status || '').toUpperCase();
  let category: BookingCategory = 'Upcoming';
  let categoryLabel = 'Scheduled';

  if (s === 'ARRIVED') {
    category = 'Ongoing';
    categoryLabel = 'Driver Arrived';
  } else if (s === 'IN_PROGRESS') {
    category = 'Ongoing';
    categoryLabel = 'Trip in Progress';
  } else if (s === 'COMPLETED') {
    category = 'Completed';
    categoryLabel = 'Completed';
  } else if (s === 'CANCELLED') {
    category = 'Cancelled';
    categoryLabel = 'Cancelled';
  } else if (s === 'SEARCHING') {
    category = 'Upcoming';
    categoryLabel = 'Finding Driver';
  } else if (s === 'ACCEPTED') {
    category = 'Upcoming';
    categoryLabel = 'Driver Assigned';
  } else {
    category = 'Upcoming';
    categoryLabel = 'Confirmed';
  }

  const travelDate = formatTripDate(b.createdAt, b.pickupDate);
  const bookingRef = b.id
    ? `DXB-${b.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`
    : 'DXB-126789';

  return {
    id: b.id,
    bookingRef,
    status: s,
    category,
    categoryLabel,
    pickupLocation: b.pickupLocation || '123, Anna Nagar, Coimbatore',
    dropLocation: b.dropLocation || 'Round Trip / City Center',
    travelDate,
    pickupTime: b.pickupTime || 'Flexible Time',
    durationLabel: b.durationLabel || '2 Hours',
    fare: Math.round(b.fare || 0),
    paymentMethod: b.paymentMethod || 'UPI',
    paymentStatus: b.paymentStatus || 'PENDING',
    driverName: b.driverName || (category === 'Ongoing' ? 'Ramesh Kumar' : null),
    driverPhone: '+91 98765 43210',
    driverRating: 4.8,
    driverVehicle: 'White Toyota Etios',
    driverPlate: 'TN 38 AB 1234',
    createdAt: b.createdAt,
    completedAt: b.completedAt,
  };
}
