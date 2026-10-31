import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { InteractiveMapProps, COIMBATORE_DEFAULT_COORDS } from './InteractiveMap.types';

export const InteractiveMapNative: React.FC<InteractiveMapProps> = ({
  pickupCoords,
  dropCoords,
  routeCoordinates,
  activeField = 'pickup',
  onSelectCoords,
  style,
}) => {
  const mapRef = useRef<MapView>(null);

  // Target coordinates for focus when viewing single location
  const targetCoords =
    activeField === 'drop' && dropCoords
      ? dropCoords
      : pickupCoords || dropCoords || COIMBATORE_DEFAULT_COORDS;

  const initialRegion: Region = {
    latitude: targetCoords.latitude,
    longitude: targetCoords.longitude,
    latitudeDelta: 0.045,
    longitudeDelta: 0.045,
  };

  // Adjust camera viewport: Fit route/both endpoints if route is active, or animate to target coordinate
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeCoordinates && routeCoordinates.length > 1) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 65, right: 45, bottom: 65, left: 45 },
        animated: true,
      });
    } else if (pickupCoords && dropCoords) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: pickupCoords.latitude, longitude: pickupCoords.longitude },
          { latitude: dropCoords.latitude, longitude: dropCoords.longitude },
        ],
        {
          edgePadding: { top: 65, right: 45, bottom: 65, left: 45 },
          animated: true,
        }
      );
    } else if (targetCoords) {
      mapRef.current.animateToRegion(
        {
          latitude: targetCoords.latitude,
          longitude: targetCoords.longitude,
          latitudeDelta: 0.035,
          longitudeDelta: 0.035,
        },
        500
      );
    }
  }, [
    routeCoordinates,
    pickupCoords?.latitude,
    pickupCoords?.longitude,
    dropCoords?.latitude,
    dropCoords?.longitude,
    targetCoords.latitude,
    targetCoords.longitude,
  ]);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        onPress={(e) => {
          if (onSelectCoords && e.nativeEvent?.coordinate) {
            onSelectCoords({
              latitude: e.nativeEvent.coordinate.latitude,
              longitude: e.nativeEvent.coordinate.longitude,
            });
          }
        }}
        showsCompass={true}
        toolbarEnabled={false}
      >
        {/* Driving Route Polyline */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#00D2B4"
            strokeWidth={4.5}
            lineJoin="round"
            lineCap="round"
          />
        )}

        {pickupCoords && (
          <Marker
            coordinate={{
              latitude: pickupCoords.latitude,
              longitude: pickupCoords.longitude,
            }}
            title="Pickup Location"
            description={pickupCoords.address || 'Selected pickup point'}
            pinColor="#00D2B4"
          />
        )}

        {dropCoords && (
          <Marker
            coordinate={{
              latitude: dropCoords.latitude,
              longitude: dropCoords.longitude,
            }}
            title="Drop Location"
            description={dropCoords.address || 'Selected destination'}
            pinColor="#EF4444"
          />
        )}
      </MapView>
    </View>
  );
};

export const InteractiveMap = InteractiveMapNative;
export default InteractiveMapNative;
export * from './InteractiveMap.types';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
});
