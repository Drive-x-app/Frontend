import { apiClient } from './apiClient';

export interface BackendBookingItem {
  id: string;
  customerId: string;
  status: string;
  durationId: string;
  durationLabel: string;
  pickupLocation: string;
  dropLocation: string | null;
  pickupDate: string | null;
  pickupTime: string | null;
  timingMode: string;
  fare: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  driverId: string | null;
  driverName: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface PaginatedBookingsResponse {
  items: BackendBookingItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
}

export const bookingsApi = {
  /**
   * GET /api/v1/bookings
   * Retrieves paginated bookings list scoped to current customer with optional status filtering
   */
  getBookings: async (params?: QueryBookingsParams): Promise<PaginatedBookingsResponse> => {
    const response = await apiClient.get<PaginatedBookingsResponse>('/bookings', {
      params,
    });
    return response.data;
  },

  /**
   * GET /api/v1/bookings/:id
   * Retrieves single booking details by UUID
   */
  getBookingById: async (id: string, userId?: string): Promise<BackendBookingItem> => {
    const response = await apiClient.get<BackendBookingItem>(`/bookings/${id}`, {
      params: userId ? { userId } : undefined,
    });
    return response.data;
  },

  /**
   * PATCH /api/v1/bookings/:id/cancel
   * Cancels a booking with domain state transitions
   */
  cancelBooking: async (id: string, reason?: string, userId?: string): Promise<BackendBookingItem> => {
    const response = await apiClient.patch<BackendBookingItem>(
      `/bookings/${id}/cancel`,
      { reason },
      { params: userId ? { userId } : undefined },
    );
    return response.data;
  },
};
