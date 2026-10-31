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

export interface UserProfileData {
  fullName: string;
  email?: string;
  city: string;
  preferredLanguage: string;
  avatarUrl?: string;
}

export interface AuthState {
  phoneNumber: string;
  selectedCountry: Country;
  authMode: 'signin' | 'signup';
  isLoading: boolean;
  error: string | null;
  token: string | null;
  user: UserSummary | null;
  hasProfile: boolean;
  profile: UserProfileData | null;

  // Actions
  setPhoneNumber: (phone: string) => void;
  setSelectedCountry: (country: Country) => void;
  setAuthMode: (mode: 'signin' | 'signup') => void;
  requestOtp: () => Promise<{ success: boolean; formattedPhone: string }>;
  verifyOtp: (otp: string) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  completeProfile: (profileData: UserProfileData) => Promise<{ success: boolean; error?: string }>;
  setUserSession: (user: UserSummary, token: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  phoneNumber: '',
  selectedCountry: DEFAULT_COUNTRY,
  authMode: 'signin',
  isLoading: false,
  error: null,
  token: null,
  user: null,
  hasProfile: true, // Default to true for existing sign in, becomes false on sign up
  profile: null,

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

  setAuthMode: (mode: 'signin' | 'signup') => {
    set({
      authMode: mode,
      error: null,
      hasProfile: mode === 'signin',
    });
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

  verifyOtp: async (otp: string) => {
    if (otp.length < 6) {
      set({ error: 'Please enter a valid 6-digit verification code' });
      return { success: false, error: 'Please enter a valid 6-digit verification code' };
    }

    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const { phoneNumber, selectedCountry, authMode, hasProfile } = get();
      const formattedPhone = `${selectedCountry.dialCode} ${phoneNumber || '98765 43210'}`;

      // Sign up mode requires completing profile
      const isNewUser = authMode === 'signup' || !hasProfile;

      const mockUser: UserSummary = {
        id: 'usr_dx_' + Date.now(),
        email: isNewUser ? '' : 'priya.sharma@example.com',
        fullName: isNewUser ? '' : 'Priya Sharma',
        phoneNumber: formattedPhone,
        role: 'CUSTOMER',
        createdAt: new Date().toISOString(),
      };

      set({
        isLoading: false,
        user: mockUser,
        hasProfile: !isNewUser,
        token: 'auth_token_' + Math.random().toString(36).substring(2),
        error: null,
      });

      return { success: true, isNewUser };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid verification code';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  completeProfile: async (profileData: UserProfileData) => {
    if (!profileData.fullName.trim()) {
      set({ error: 'Please enter your full name' });
      return { success: false, error: 'Please enter your full name' };
    }

    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const { user } = get();

      if (user) {
        set({
          user: {
            ...user,
            fullName: profileData.fullName.trim(),
            email: profileData.email?.trim() || user.email,
            avatarUrl: profileData.avatarUrl,
          },
          profile: profileData,
          hasProfile: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          profile: profileData,
          hasProfile: true,
          isLoading: false,
          error: null,
        });
      }

      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  setUserSession: (user: UserSummary, token: string) => {
    set({ user, token, hasProfile: true, error: null });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set({
      phoneNumber: '',
      selectedCountry: DEFAULT_COUNTRY,
      authMode: 'signin',
      isLoading: false,
      error: null,
      token: null,
      user: null,
      hasProfile: true,
      profile: null,
    });
  },
}));
