import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { Plus, Minus, Navigation } from 'lucide-react-native';
import { InteractiveMapProps, COIMBATORE_DEFAULT_COORDS } from './InteractiveMap.types';

declare global {
  interface Window {
    L?: any;
  }
}

export const InteractiveMapWeb: React.FC<InteractiveMapProps> = ({
  pickupCoords,
  dropCoords,
  routeCoordinates,
  activeField = 'pickup',
  onSelectCoords,
  style,
  showControls = true,
}) => {
  const mapContainerId = useRef(`interactive-web-map-${Math.random().toString(36).substring(2, 9)}`);
  const mapInstanceRef = useRef<any>(null);
  const pickupMarkerRef = useRef<any>(null);
  const dropMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const [isLeafletReady, setIsLeafletReady] = useState<boolean>(() => {
    return typeof window !== 'undefined' && !!window.L;
  });

  const targetCoords =
    activeField === 'drop' && dropCoords
      ? dropCoords
      : pickupCoords || dropCoords || COIMBATORE_DEFAULT_COORDS;

  // 1. Inject Leaflet CSS and JS dynamically once on web
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const cssId = 'leaflet-css-bundle';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const scriptId = 'leaflet-js-bundle';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        setIsLeafletReady(true);
      };
      document.body.appendChild(script);
    } else if (window.L) {
      setIsLeafletReady(true);
    }
  }, []);

  // 2. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!isLeafletReady || typeof window === 'undefined' || !window.L) return;

    const container = document.getElementById(mapContainerId.current);
    if (!container || mapInstanceRef.current) return;

    try {
      const map = window.L.map(container, {
        center: [targetCoords.latitude, targetCoords.longitude],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Add high-resolution OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Handle user clicks on the map to update coordinates
      map.on('click', (e: any) => {
        if (onSelectCoords && e.latlng) {
          onSelectCoords({
            latitude: Number(e.latlng.lat.toFixed(6)),
            longitude: Number(e.latlng.lng.toFixed(6)),
          });
        }
      });

      mapInstanceRef.current = map;

      // Invalidate map size after DOM mount
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } catch {
      // Ignore if container is already initialized
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        pickupMarkerRef.current = null;
        dropMarkerRef.current = null;
        routePolylineRef.current = null;
      }
    };
  }, [isLeafletReady]);

  // 3. Update markers, polylines, and pan/fit camera
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || typeof window === 'undefined' || !window.L) return;

    const createPinIcon = (color: string) =>
      window.L.divIcon({
        className: 'driverx-custom-pin',
        html: `
          <div style="
            background-color: ${color};
            width: 26px;
            height: 26px;
            border-radius: 13px;
            border: 3px solid #FFFFFF;
            box-shadow: 0 3px 8px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          ">
            <div style="background-color: #0E1E38; width: 7px; height: 7px; border-radius: 3.5px;"></div>
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

    // Update or create Pickup Marker (Teal)
    if (pickupCoords) {
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng([pickupCoords.latitude, pickupCoords.longitude]);
      } else {
        pickupMarkerRef.current = window.L.marker([pickupCoords.latitude, pickupCoords.longitude], {
          icon: createPinIcon('#00D2B4'),
          title: 'Pickup Location',
        }).addTo(map);
      }
    } else if (pickupMarkerRef.current) {
      pickupMarkerRef.current.remove();
      pickupMarkerRef.current = null;
    }

    // Update or create Drop Marker (Red)
    if (dropCoords) {
      if (dropMarkerRef.current) {
        dropMarkerRef.current.setLatLng([dropCoords.latitude, dropCoords.longitude]);
      } else {
        dropMarkerRef.current = window.L.marker([dropCoords.latitude, dropCoords.longitude], {
          icon: createPinIcon('#EF4444'),
          title: 'Drop Location',
        }).addTo(map);
      }
    } else if (dropMarkerRef.current) {
      dropMarkerRef.current.remove();
      dropMarkerRef.current = null;
    }

    // Draw Route Polyline & Fit Bounds
    if (routeCoordinates && routeCoordinates.length > 1) {
      const latlngs = routeCoordinates.map((c) => [c.latitude, c.longitude]);
      if (routePolylineRef.current) {
        routePolylineRef.current.setLatLngs(latlngs);
      } else {
        routePolylineRef.current = window.L.polyline(latlngs, {
          color: '#00D2B4',
          weight: 4.5,
          opacity: 0.9,
          lineJoin: 'round',
        }).addTo(map);
      }

      try {
        map.fitBounds(routePolylineRef.current.getBounds(), {
          padding: [50, 50],
          animate: true,
        });
      } catch {
        // Safe fallback if bounds are invalid
      }
    } else {
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
        routePolylineRef.current = null;
      }
      // Smoothly pan camera to current target when no polyline is drawn
      if (targetCoords) {
        map.panTo([targetCoords.latitude, targetCoords.longitude], { animate: true });
      }
    }
  }, [
    pickupCoords?.latitude,
    pickupCoords?.longitude,
    dropCoords?.latitude,
    dropCoords?.longitude,
    targetCoords.latitude,
    targetCoords.longitude,
    routeCoordinates,
  ]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetBearing = () => {
    if (mapInstanceRef.current && targetCoords) {
      mapInstanceRef.current.setView([targetCoords.latitude, targetCoords.longitude], 14, {
        animate: true,
      });
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* HTML Div mount container for Leaflet */}
      <div
        id={mapContainerId.current}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: 'crosshair',
        }}
      />

      {/* Floating Zoom & Compass Controls (as shown in desktop screenshot) */}
      {showControls && (
        <View style={styles.floatingControls} pointerEvents="box-none">
          <View style={styles.zoomButtonGroup}>
            <TouchableOpacity
              style={styles.zoomButton}
              activeOpacity={0.8}
              onPress={handleZoomIn}
              accessibilityLabel="Zoom in"
            >
              <Plus size={18} color="#0E1E38" strokeWidth={2.4} />
            </TouchableOpacity>
            <View style={styles.zoomDivider} />
            <TouchableOpacity
              style={styles.zoomButton}
              activeOpacity={0.8}
              onPress={handleZoomOut}
              accessibilityLabel="Zoom out"
            >
              <Minus size={18} color="#0E1E38" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.compassButton}
            activeOpacity={0.8}
            onPress={handleResetBearing}
            accessibilityLabel="Re-center map"
          >
            <Navigation size={17} color="#0E1E38" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      )}

      {/* Loading state indicator before tiles are ready */}
      {!isLeafletReady && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00D2B4" />
          <Text style={styles.loadingText}>Loading interactive map...</Text>
        </View>
      )}
    </View>
  );
};

export const InteractiveMap = InteractiveMapWeb;
export default InteractiveMapWeb;
export * from './InteractiveMap.types';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  floatingControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    gap: 12,
    alignItems: 'center',
    zIndex: 999,
  },
  zoomButtonGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0E1E38',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  zoomButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  zoomDivider: {
    height: 1,
    width: '100%',
    backgroundColor: '#EEF2F6',
  },
  compassButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0E1E38',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4F6',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins-Medium',
  },
});
