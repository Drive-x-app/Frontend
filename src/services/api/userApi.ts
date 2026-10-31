import { apiClient } from './apiClient';

export interface UserProfileResponse {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string | null;
  avatarUrl: string | null;
  role: string;
  city: string;
  preferredLanguage: string;
  hasUnreadNotification: boolean;
  unreadNotificationCount: number;
}

export interface UpdateUserProfileDto {
  fullName?: string;
  email?: string;
  city?: string;
  preferredLanguage?: string;
  avatarUrl?: string;
}

export const userApi = {
  getProfile: async (userId?: string): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>('/users/me', {
      params: userId ? { userId } : undefined,
    });
    return response.data;
  },

  updateProfile: async (
    dto: UpdateUserProfileDto,
    userId?: string
  ): Promise<UserProfileResponse> => {
    const response = await apiClient.patch<UserProfileResponse>('/users/me', dto, {
      params: userId ? { userId } : undefined,
    });
    return response.data;
  },
};
