import React from 'react';
import { render } from '@testing-library/react-native';
import { DesktopHeader } from '../src/components/common/DesktopHeader';

// Mock lucide-react-native
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockIcon = (props: any) => React.createElement(View, props);
  return new Proxy(
    {},
    {
      get: () => MockIcon,
    }
  );
});

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light' },
}));

describe('DesktopHeader Component', () => {
  it('renders the brand logo and notifications button without profile dropdown or drawer', async () => {
    const { getByText, getByLabelText, queryByLabelText } = await render(
      <DesktopHeader activeTab="home" />
    );

    // Brand logo
    expect(getByText('Driver')).toBeTruthy();
    expect(getByText('X')).toBeTruthy();

    // Notifications button
    expect(getByLabelText('Notifications')).toBeTruthy();

    // Profile button and hamburger menu are removed
    expect(queryByLabelText('User profile')).toBeNull();
    expect(queryByLabelText('Open navigation menu')).toBeNull();
  });
});
