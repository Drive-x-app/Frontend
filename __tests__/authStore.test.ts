import { useAuthStore } from '../src/store/authStore';

describe('signup profile completion', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    useAuthStore.getState().setAuthMode('signup');
  });

  it('stores the completed profile on the verified user session', async () => {
    const verification = await useAuthStore.getState().verifyOtp('123456');
    expect(verification).toEqual({ success: true, isNewUser: true });

    const completion = await useAuthStore.getState().completeProfile({
      fullName: 'Alex Customer',
      email: 'alex@example.com',
      city: 'Chennai',
      preferredLanguage: 'Tamil',
      avatarUrl: 'file:///profile-photo.jpg',
    });

    const state = useAuthStore.getState();
    expect(completion).toEqual({ success: true });
    expect(state.hasProfile).toBe(true);
    expect(state.profile).toEqual({
      fullName: 'Alex Customer',
      email: 'alex@example.com',
      city: 'Chennai',
      preferredLanguage: 'Tamil',
      avatarUrl: 'file:///profile-photo.jpg',
    });
    expect(state.user).toMatchObject({
      fullName: 'Alex Customer',
      email: 'alex@example.com',
      avatarUrl: 'file:///profile-photo.jpg',
    });
  });

  describe('sign-in routing', () => {
    beforeEach(() => {
      useAuthStore.getState().reset();
    });

    it('does not require profile completion after sign-in', async () => {
      const verification = await useAuthStore.getState().verifyOtp('123456');
      expect(verification).toEqual({ success: true, isNewUser: false });
      expect(useAuthStore.getState().hasProfile).toBe(true);
    });
  });
});
