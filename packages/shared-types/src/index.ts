/**
 * DriverX Shared Domain Types
 * Shared TypeScript definitions across mobile, admin, and backend.
 */

export type UserRole = 'CUSTOMER' | 'DRIVER' | 'ADMIN';

export type RideStatus =
  | 'PENDING'
  | 'SEARCHING'
  | 'ACCEPTED'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type VehicleType = 'SEDAN' | 'SUV' | 'PREMIUM' | 'AUTO' | 'BIKE';

export type PaymentMethod = 'CASH' | 'CARD' | 'WALLET' | 'UPI';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface DriverProfileSummary {
  id: string;
  userId: string;
  isAvailable: boolean;
  vehicleType: VehicleType;
  vehicleNumber: string;
  vehicleModel?: string;
  rating: number;
  totalRides: number;
  currentLocation?: GeoCoordinates;
}

export interface RideSummary {
  id: string;
  customerId: string;
  driverId?: string;
  pickupLocation: GeoCoordinates;
  dropoffLocation: GeoCoordinates;
  status: RideStatus;
  vehicleType: VehicleType;
  fareEstimate: number;
  actualFare?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
  completedAt?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
