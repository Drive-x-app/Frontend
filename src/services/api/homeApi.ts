import { apiClient } from './apiClient';

export interface BackendDuration {
  id: string;
  label: string;
  subtitle: string;
  hours: number;
  baseFare: number;
  description: string;
  iconType: 'clock' | 'sun' | 'calendar';
}

export interface BackendSavedPlace {
  id: string;
  title: string;
  address: string;
  type: 'home' | 'office' | 'parents' | 'other';
  latitude?: number;
  longitude?: number;
}

export interface BackendRecentBooking {
  id: string;
  dateTime: string;
  durationLabel: string;
  status: 'Completed' | 'Pending' | 'In Progress' | 'Cancelled' | 'COMPLETED' | 'PENDING' | 'SEARCHING' | 'ACCEPTED' | 'ARRIVED' | 'IN_PROGRESS' | 'CANCELLED';
  pickupAddress: string;
  dropAddress: string;
  fare: number;
  driverName?: string;
  vehicleModel?: string;
}

export interface BackendDriverDetail {
  id: string;
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
  vehicleModel: string;
  vehicleNumber: string;
  rating: number;
  totalRides: number;
}

export interface BackendActiveBooking {
  id: string;
  status: string;
  durationId: string;
  durationLabel: string;
  hours: number;
  pickupAddress: string;
  dropAddress: string | null;
  pickupDate: string;
  pickupTime: string;
  fare: number;
  etaMinutes?: number;
  driver: BackendDriverDetail | null;
  createdAt: string;
}

export interface BackendPromoBanner {
  id: string;
  title: string;
  subtitle: string;
  highlightText: string;
  couponCode: string;
  imageUrl: string;
}

export interface BackendHomeScreenData {
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
    avatarUrl: string;
    hasUnreadNotification: boolean;
    unreadNotificationCount: number;
  };
  durations: BackendDuration[];
  savedPlaces: BackendSavedPlace[];
  recentBookings: BackendRecentBooking[];
  trustFeatures: Array<{ id: string; title: string; icon: string }>;
  banners: BackendPromoBanner[];
  activeBooking: BackendActiveBooking | null;
}

export const homeApi = {
  getHomeScreenData: async (): Promise<BackendHomeScreenData> => {
    const response = await apiClient.get<BackendHomeScreenData>('/home');
    return response.data;
  },

  getDurations: async (): Promise<BackendDuration[]> => {
    const response = await apiClient.get<BackendDuration[]>('/home/durations');
    return response.data;
  },

  getBanners: async (): Promise<BackendPromoBanner[]> => {
    const response = await apiClient.get<BackendPromoBanner[]>('/home/banners');
    return response.data;
  },

  getActiveBooking: async (): Promise<BackendActiveBooking | null> => {
    const response = await apiClient.get<BackendActiveBooking | null>('/home/active-booking');
    return response.data;
  },

  cancelActiveBooking: async (bookingId: string, reason?: string) => {
    const response = await apiClient.patch(`/home/active-booking/${bookingId}/cancel`, { reason });
    return response.data;
  },

  getSavedPlaces: async (): Promise<BackendSavedPlace[]> => {
    const response = await apiClient.get<BackendSavedPlace[]>('/home/saved-places');
    return response.data;
  },

  addSavedPlace: async (params: {
    title: string;
    address: string;
    type: 'home' | 'office' | 'parents' | 'other';
    latitude?: number;
    longitude?: number;
  }): Promise<BackendSavedPlace> => {
    const response = await apiClient.post<BackendSavedPlace>('/home/saved-places', params);
    return response.data;
  },

  updateSavedPlace: async (
    id: string,
    params: Partial<{
      title: string;
      address: string;
      type: 'home' | 'office' | 'parents' | 'other';
      latitude?: number;
      longitude?: number;
    }>,
  ): Promise<BackendSavedPlace> => {
    const response = await apiClient.patch<BackendSavedPlace>(`/home/saved-places/${id}`, params);
    return response.data;
  },

  deleteSavedPlace: async (id: string) => {
    const response = await apiClient.delete(`/home/saved-places/${id}`);
    return response.data;
  },

  estimateFare: async (params: { durationId: string; pickupLocation: string; dropLocation?: string }) => {
    const response = await apiClient.post('/home/estimate', params);
    return response.data;
  },

  createBooking: async (params: {
    durationId: string;
    pickupLocation: string;
    dropLocation?: string;
    pickupDate?: string;
    pickupTime?: string;
    timingMode?: 'now' | 'later';
  }) => {
    const response = await apiClient.post('/home/bookings', params);
    return response.data;
  },

  markNotificationsAsRead: async () => {
    const response = await apiClient.patch('/home/notifications/read');
    return response.data;
  },
};
