import React from 'react';
import { render } from '@testing-library/react-native';
import { TrustFeaturesBar } from '../src/components/common/TrustFeaturesBar';

// Mock lucide-react-native to prevent ESM CommonJS import issues in Jest
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

describe('TrustFeaturesBar Component', () => {
  it('renders all four trust feature highlights in mobile layout', async () => {
    const { getByText } = await render(<TrustFeaturesBar variant="mobile" />);

    expect(getByText('Verified')).toBeTruthy();
    expect(getByText('Drivers')).toBeTruthy();
    expect(getByText('Real-time')).toBeTruthy();
    expect(getByText('Tracking')).toBeTruthy();
    expect(getByText('Secure')).toBeTruthy();
    expect(getByText('Payments')).toBeTruthy();
    expect(getByText('24/7')).toBeTruthy();
    expect(getByText('Support')).toBeTruthy();
  });

  it('renders all four trust feature highlights in desktop layout', async () => {
    const { getByText } = await render(<TrustFeaturesBar variant="desktop" />);

    expect(getByText('Verified\nDrivers')).toBeTruthy();
    expect(getByText('Real-time\nTracking')).toBeTruthy();
    expect(getByText('Secure\nPayments')).toBeTruthy();
    expect(getByText('24/7\nSupport')).toBeTruthy();
  });
});
