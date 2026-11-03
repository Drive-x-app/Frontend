import { create } from 'zustand';

export interface DurationOption {
  id: string;
  label: string;
  description: string;
  hours: number;
}

export const DURATION_OPTIONS: DurationOption[] = [
  {
    id: '1h',
    label: '1 Hour',
    description: 'Short trips\nand quick travel',
    hours: 1,
  },
  {
    id: '2h',
    label: '2 Hours',
    description: 'Meetings,\nshopping, personal\nwork',
    hours: 2,
  },
  {
    id: '4h',
    label: '4 Hours',
    description: 'Multiple stops\nin the city',
    hours: 4,
  },
  {
    id: '6h',
    label: '6 Hours',
    description: 'Business or\npersonal travel',
    hours: 6,
  },
  {
    id: 'fullday',
    label: 'Full Day',
    description: 'Complete day\nwith a driver',
    hours: 12,
  },
  {
    id: '1week',
    label: '1 Week',
    description: 'Long-term\nrequirement',
    hours: 168,
  },
];

export interface SavedPlace {
  id: string;
  title: string;
  address: string;
  type: 'home' | 'office' | 'parents' | 'other';
}

export interface RecentPlace {
  id: string;
  title: string;
  address: string;
}

export const INITIAL_RECENT_PLACES: RecentPlace[] = [
  {
    id: 'recent-1',
    title: 'Brookefields Mall',
    address: 'Avinashi Road, Coimbatore',
  },
  {
    id: 'recent-2',
    title: 'Coimbatore International Airport',
    address: 'Peelamedu, Coimbatore',
  },
];

import { homeApi, BackendHomeScreenData, BackendRecentBooking, BackendActiveBooking, BackendDuration, BackendPromoBanner } from '../services/api/homeApi';
import { useAuthStore } from './authStore';
import { GeoCoordinates } from '../types';
import { RouteGeometryPoint } from '../services/location/routingService';
import { getTodayDateKey } from '../utils/dateTime';

export { GeoCoordinates, RouteGeometryPoint };

export interface BookingState {
  selectedDurationId: string;
  pickupLocation: string;
  pickupCoords: GeoCoordinates | null;
  dropLocation: string;
  dropCoords: GeoCoordinates | null;
  estimatedDistanceKm: number | null;
  estimatedDurationMinutes: number | null;
  routeCoordinates: RouteGeometryPoint[] | null;
  activeTab: 'home' | 'bookings' | 'history' | 'profile';
  savedPlaces: SavedPlace[];
  recentPlaces: RecentPlace[];
  recentBookings: BackendRecentBooking[];
  activeBooking: BackendActiveBooking | null;
  durations: BackendDuration[];
  banners: BackendPromoBanner[];
  isBooking: boolean;
  isLoadingHome: boolean;
  userName: string;
  unreadNotifications: number;
  selectedDate: string;
  selectedTime: string;
  pickupTimingMode: 'now' | 'later';

  // Actions
  setSelectedDurationId: (id: string) => void;
  setPickupLocation: (location: string) => void;
  setPickupCoords: (coords: GeoCoordinates | null) => void;
  setDropLocation: (location: string) => void;
  setDropCoords: (coords: GeoCoordinates | null) => void;
  setRouteMetrics: (metrics: { distanceKm: number | null; durationMinutes: number | null; coordinates?: RouteGeometryPoint[] | null }) => void;
  setActiveTab: (tab: 'home' | 'bookings' | 'history' | 'profile') => void;
  setActiveBooking: (booking: BackendActiveBooking | null) => void;
  setSavedPlaces: (places: SavedPlace[] | ((currentPlaces: SavedPlace[]) => SavedPlace[])) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTime: (time: string) => void;
  setPickupTimingMode: (mode: 'now' | 'later') => void;
  applySavedPlace: (place: SavedPlace) => void;
  applyRecentPlace: (place: RecentPlace) => void;
  clearRecentPlaces: () => void;
  loadHomeScreenData: () => Promise<void>;
  markNotificationsAsRead: () => Promise<void>;
  resetBooking: () => void;
}

export const DEFAULT_PICKUP_LOCATION = '';
export const DEFAULT_PICKUP_COORDS: GeoCoordinates | null = null;

export const DEFAULT_DROP_LOCATION = '';
export const DEFAULT_DROP_COORDS: GeoCoordinates | null = null;

export const useBookingStore = create<BookingState>((set) => ({
  selectedDurationId: '1h',
  pickupLocation: DEFAULT_PICKUP_LOCATION,
  pickupCoords: DEFAULT_PICKUP_COORDS,
  dropLocation: DEFAULT_DROP_LOCATION,
  dropCoords: DEFAULT_DROP_COORDS,
  estimatedDistanceKm: null,
  estimatedDurationMinutes: null,
  routeCoordinates: null,
  activeTab: 'home',
  savedPlaces: [],
  recentPlaces: INITIAL_RECENT_PLACES,
  recentBookings: [],
  activeBooking: null,
  durations: [],
  banners: [],
  isBooking: false,
  isLoadingHome: false,
  userName: 'Hariharan',
  unreadNotifications: 2,
  selectedDate: getTodayDateKey(),
  selectedTime: '10:00 AM',
  pickupTimingMode: 'later',

  setSelectedDurationId: (id: string) => set({ selectedDurationId: id }),
  setPickupLocation: (location: string) =>
    set((state) => ({
      pickupLocation: location,
      pickupCoords: state.pickupCoords?.address === location ? state.pickupCoords : null,
      ...(state.pickupCoords?.address !== location
        ? {
            estimatedDistanceKm: null,
            estimatedDurationMinutes: null,
            routeCoordinates: null,
          }
        : {}),
    })),
  setPickupCoords: (coords: GeoCoordinates | null) =>
    set({
      pickupCoords: coords,
      ...(!coords
        ? {
            estimatedDistanceKm: null,
            estimatedDurationMinutes: null,
            routeCoordinates: null,
          }
        : {}),
    }),
  setDropLocation: (location: string) =>
    set((state) => ({
      dropLocation: location,
      dropCoords: state.dropCoords?.address === location ? state.dropCoords : null,
      ...(state.dropCoords?.address !== location
        ? {
            estimatedDistanceKm: null,
            estimatedDurationMinutes: null,
            routeCoordinates: null,
          }
        : {}),
    })),
  setDropCoords: (coords: GeoCoordinates | null) =>
    set({
      dropCoords: coords,
      ...(!coords
        ? {
            estimatedDistanceKm: null,
            estimatedDurationMinutes: null,
            routeCoordinates: null,
          }
        : {}),
    }),
  setRouteMetrics: (metrics) =>
    set({
      estimatedDistanceKm: metrics.distanceKm,
      estimatedDurationMinutes: metrics.durationMinutes,
      routeCoordinates: metrics.coordinates || null,
    }),
  setActiveTab: (activeTab: 'home' | 'bookings' | 'history' | 'profile') => set({ activeTab }),
  setActiveBooking: (activeBooking) => set({ activeBooking }),
  setSavedPlaces: (places) =>
    set((state) => ({
      savedPlaces: typeof places === 'function' ? places(state.savedPlaces) : places,
    })),
  setSelectedDate: (selectedDate: string) => set({ selectedDate }),
  setSelectedTime: (selectedTime: string) => set({ selectedTime }),
  setPickupTimingMode: (pickupTimingMode: 'now' | 'later') => set({ pickupTimingMode }),
  applySavedPlace: (place: SavedPlace) => {
    if (place.type !== 'other') {
      set({ pickupLocation: place.address, pickupCoords: null });
    }
  },
  applyRecentPlace: (place: RecentPlace) => set({ dropLocation: `${place.title}, ${place.address}`, dropCoords: null }),
  clearRecentPlaces: () => set({ recentPlaces: [] }),
  loadHomeScreenData: async () => {
    try {
      set({ isLoadingHome: true });
      const phoneNumber = useAuthStore.getState().user?.phoneNumber;
      if (!phoneNumber) {
        set({ savedPlaces: [], isLoadingHome: false });
        return;
      }

      const data: BackendHomeScreenData = await homeApi.getHomeScreenData(phoneNumber);
      if (data) {
        set({
          userName: data.user?.fullName || 'Hariharan',
          unreadNotifications: data.user?.unreadNotificationCount || 0,
          savedPlaces: data.savedPlaces || [],
          recentBookings: data.recentBookings || [],
          activeBooking: data.activeBooking || null,
          durations: data.durations || [],
          banners: data.banners || [],
          isLoadingHome: false,
        });
      }
    } catch {
      set({ savedPlaces: [], isLoadingHome: false });
    }
  },
  markNotificationsAsRead: async () => {
    try {
      set({ unreadNotifications: 0 });
      await homeApi.markNotificationsAsRead();
    } catch {
      // Ignore network errors on local notification read
    }
  },
  resetBooking: () =>
    set({
      selectedDurationId: '1h',
      pickupLocation: DEFAULT_PICKUP_LOCATION,
      pickupCoords: DEFAULT_PICKUP_COORDS,
      dropLocation: DEFAULT_DROP_LOCATION,
      dropCoords: DEFAULT_DROP_COORDS,
      estimatedDistanceKm: null,
      estimatedDurationMinutes: null,
      routeCoordinates: null,
      selectedDate: getTodayDateKey(),
      selectedTime: '10:00 AM',
      pickupTimingMode: 'later',
      isBooking: false,
    }),
}));
