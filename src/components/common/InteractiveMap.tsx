import React from 'react';
import { Platform } from 'react-native';
import { InteractiveMapProps } from './InteractiveMap.types';

export * from './InteractiveMap.types';

/**
 * Platform-agnostic InteractiveMap wrapper.
 * Resolves to InteractiveMap.web on Web/Desktop and InteractiveMap.native on iOS/Android.
 */
export const InteractiveMap: React.FC<InteractiveMapProps> = (props) => {
  if (Platform.OS === 'web') {
    const WebMap = require('./InteractiveMap.web').default;
    return <WebMap {...props} />;
  }
  const NativeMap = require('./InteractiveMap.native').default;
  return <NativeMap {...props} />;
};

export default InteractiveMap;
