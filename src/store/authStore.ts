import { create } from 'zustand';
import { UserSummary } from '../types';

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flag: '🇸🇬' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
];

export const DEFAULT_COUNTRY: Country = COUNTRIES[0];

export interface AuthState {
  phoneNumber: string;
  selectedCountry: Country;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  user: UserSummary | null;

  // Actions
  setPhoneNumber: (phone: string) => void;
  setSelectedCountry: (country: Country) => void;
  requestOtp: () => Promise<{ success: boolean; formattedPhone: string }>;
  setUserSession: (user: UserSummary, token: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  phoneNumber: '',
  selectedCountry: DEFAULT_COUNTRY,
  isLoading: false,
  error: null,
  token: null,
  user: null,

  setPhoneNumber: (phone: string) => {
    // Only accept numeric input up to 10 digits
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length <= 10) {
      set({ phoneNumber: cleaned, error: null });
    }
  },

  setSelectedCountry: (country: Country) => {
    set({ selectedCountry: country });
  },

  requestOtp: async () => {
    const { phoneNumber, selectedCountry } = get();
    if (phoneNumber.trim().length < 10) {
      set({ error: 'Please enter a valid 10-digit mobile number' });
      return { success: false, formattedPhone: '' };
    }

    set({ isLoading: true, error: null });
    try {
      const formattedPhone = `${selectedCountry.dialCode}${phoneNumber}`;
      // Simulated delay for OTP request dispatch
      await new Promise((resolve) => setTimeout(resolve, 800));

      set({ isLoading: false });
      return { success: true, formattedPhone };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP';
      set({ isLoading: false, error: message });
      return { success: false, formattedPhone: '' };
    }
  },

  setUserSession: (user: UserSummary, token: string) => {
    set({ user, token, error: null });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set({
      phoneNumber: '',
      selectedCountry: DEFAULT_COUNTRY,
      isLoading: false,
      error: null,
      token: null,
      user: null,
    });
  },
}));
