import { StyleProp, ViewStyle } from 'react-native';
import { GeoCoordinates } from '../../types';
import { RouteGeometryPoint } from '../../services/location/routingService';

export interface InteractiveMapProps {
  pickupCoords: GeoCoordinates | null;
  dropCoords: GeoCoordinates | null;
  routeCoordinates?: RouteGeometryPoint[] | null;
  activeField?: 'pickup' | 'drop';
  onSelectCoords?: (coords: GeoCoordinates) => void;
  style?: StyleProp<ViewStyle>;
  showControls?: boolean;
}

export const COIMBATORE_DEFAULT_COORDS: GeoCoordinates = {
  latitude: 11.0168,
  longitude: 76.9558,
  address: 'Coimbatore, Tamil Nadu',
};
