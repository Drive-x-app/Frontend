import { create } from 'zustand';

export interface DurationOption {
  id: string;
  label: string;
  hours: number;
}

export const DURATION_OPTIONS: DurationOption[] = [
  { id: '1h', label: '1 Hour', hours: 1 },
  { id: '2h', label: '2 Hours', hours: 2 },
  { id: '4h', label: '4 Hours', hours: 4 },
  { id: '6h', label: '6 Hours', hours: 6 },
  { id: 'fullday', label: 'Full Day', hours: 12 },
  { id: '1week', label: '1 Week', hours: 84 },
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

export const INITIAL_SAVED_PLACES: SavedPlace[] = [
  {
    id: 'place-home',
    title: 'Home',
    address: '123, Anna Nagar, Coimbatore',
    type: 'home',
  },
  {
    id: 'place-office',
    title: 'Office',
    address: 'RS Puram, Coimbatore',
    type: 'office',
  },
  {
    id: 'place-parents',
    title: 'Parents Home',
    address: 'Saibaba Colony, Coimbatore',
    type: 'parents',
  },
  {
    id: 'place-other',
    title: 'Other',
    address: 'Add New Location',
    type: 'other',
  },
];

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

export interface BookingState {
  selectedDurationId: string;
  pickupLocation: string;
  dropLocation: string;
  activeTab: 'home' | 'bookings' | 'history' | 'profile';
  savedPlaces: SavedPlace[];
  recentPlaces: RecentPlace[];
  isBooking: boolean;

  // Actions
  setSelectedDurationId: (id: string) => void;
  setPickupLocation: (location: string) => void;
  setDropLocation: (location: string) => void;
  setActiveTab: (tab: 'home' | 'bookings' | 'history' | 'profile') => void;
  applySavedPlace: (place: SavedPlace) => void;
  applyRecentPlace: (place: RecentPlace) => void;
  clearRecentPlaces: () => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedDurationId: '2h',
  pickupLocation: '123, Anna Nagar, Coimbatore',
  dropLocation: 'RS Puram, Coimbatore',
  activeTab: 'home',
  savedPlaces: INITIAL_SAVED_PLACES,
  recentPlaces: INITIAL_RECENT_PLACES,
  isBooking: false,

  setSelectedDurationId: (id: string) => set({ selectedDurationId: id }),
  setPickupLocation: (location: string) => set({ pickupLocation: location }),
  setDropLocation: (location: string) => set({ dropLocation: location }),
  setActiveTab: (activeTab: 'home' | 'bookings' | 'history' | 'profile') => set({ activeTab }),
  applySavedPlace: (place: SavedPlace) => {
    if (place.type !== 'other') {
      set({ pickupLocation: place.address });
    }
  },
  applyRecentPlace: (place: RecentPlace) => set({ dropLocation: `${place.title}, ${place.address}` }),
  clearRecentPlaces: () => set({ recentPlaces: [] }),
  resetBooking: () =>
    set({
      selectedDurationId: '2h',
      pickupLocation: '123, Anna Nagar, Coimbatore',
      dropLocation: 'RS Puram, Coimbatore',
      isBooking: false,
    }),
}));
