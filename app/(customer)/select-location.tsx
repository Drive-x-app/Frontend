import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  useWindowDimensions,
  Platform,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Crosshair,
  MapPin,
  X,
  Plus,
  ChevronRight,
  Home as HomeIcon,
  Briefcase,
  Users,
  Star,
  Clock,
  ArrowRight,
  GitBranch,
  Wifi,
  Battery,
  Navigation,
  AlertCircle,
  Zap,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  useBookingStore,
  SavedPlace,
  RecentPlace,
} from '../../src/store/bookingStore';
import {
  getCurrentLocation,
  reverseGeocodeLocation,
  searchPlaces,
  LocationSuggestion,
} from '../../src/services/location/locationService';
import {
  getDrivingRoute,
  RouteResult,
} from '../../src/services/location/routingService';
import { InteractiveMap } from '../../src/components/common/InteractiveMap';
import { DesktopHeader } from '../../src/components/common/DesktopHeader';
import { DesktopSidebar } from '../../src/components/common/DesktopSidebar';
import { GeoCoordinates } from '../../src/types';
import { FONT } from '../../src/theme/typography';

/**
 * Decorative 6x6 dot matrix pattern component matching desktop reference design
 */
const DotGrid = () => {
  const rows = [0, 1, 2, 3, 4, 5];
  const cols = [0, 1, 2, 3, 4, 5];
  return (
    <View style={styles.dotGridContainer}>
      {rows.map((r) => (
        <View key={r} style={styles.dotGridRow}>
          {cols.map((c) => (
            <View key={c} style={styles.dotGridDot} />
          ))}
        </View>
      ))}
    </View>
  );
};

export default function SelectLocationScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktopOrTablet =
    windowWidth > 600 ||
    (Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth > 600);
  const [isLocating, setIsLocating] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [activeField, setActiveField] = useState<'pickup' | 'drop'>('pickup');

  // Race condition protection & duplicate avoidance
  const latestGeocodeRequestId = useRef(0);
  const lastGeocodedCoords = useRef<{ lat: number; lng: number } | null>(null);

  const pickupLocation = useBookingStore((state) => state.pickupLocation);
  const pickupCoords = useBookingStore((state) => state.pickupCoords);
  const dropLocation = useBookingStore((state) => state.dropLocation);
  const dropCoords = useBookingStore((state) => state.dropCoords);
  const savedPlaces = useBookingStore((state) => state.savedPlaces);
  const recentPlaces = useBookingStore((state) => state.recentPlaces);

  const setPickupLocation = useBookingStore((state) => state.setPickupLocation);
  const setPickupCoords = useBookingStore((state) => state.setPickupCoords);
  const setDropLocation = useBookingStore((state) => state.setDropLocation);
  const setDropCoords = useBookingStore((state) => state.setDropCoords);
  const setRouteMetrics = useBookingStore((state) => state.setRouteMetrics);
  const applySavedPlace = useBookingStore((state) => state.applySavedPlace);
  const applyRecentPlace = useBookingStore((state) => state.applyRecentPlace);
  const clearRecentPlaces = useBookingStore((state) => state.clearRecentPlaces);

  const pickupInputRef = useRef<any>(null);
  const dropInputRef = useRef<any>(null);

  // Route calculation state
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const latestRouteRequestId = useRef(0);
  const abortRouteControllerRef = useRef<AbortController | null>(null);
  const lastCalculatedEndpoints = useRef<{
    pLat: number;
    pLng: number;
    dLat: number;
    dLng: number;
  } | null>(null);

  // Autocomplete search state
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRequestId = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      abortControllerRef.current?.abort();
      abortRouteControllerRef.current?.abort();
    };
  }, []);

  // Driving route calculation effect triggered when both endpoints are present
  useEffect(() => {
    // If either endpoint is missing, immediately reset route metrics
    if (!pickupCoords || !dropCoords) {
      setRouteResult(null);
      setIsCalculatingRoute(false);
      setRouteError(null);
      lastCalculatedEndpoints.current = null;
      setRouteMetrics({ distanceKm: null, durationMinutes: null, coordinates: null });
      return;
    }

    // Avoid duplicate request if coordinates haven't changed
    const last = lastCalculatedEndpoints.current;
    if (
      last &&
      Math.abs(last.pLat - pickupCoords.latitude) < 0.00001 &&
      Math.abs(last.pLng - pickupCoords.longitude) < 0.00001 &&
      Math.abs(last.dLat - dropCoords.latitude) < 0.00001 &&
      Math.abs(last.dLng - dropCoords.longitude) < 0.00001
    ) {
      return;
    }

    lastCalculatedEndpoints.current = {
      pLat: pickupCoords.latitude,
      pLng: pickupCoords.longitude,
      dLat: dropCoords.latitude,
      dLng: dropCoords.longitude,
    };

    const currentReqId = ++latestRouteRequestId.current;
    abortRouteControllerRef.current?.abort();
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    if (controller) {
      abortRouteControllerRef.current = controller;
    }

    setIsCalculatingRoute(true);
    setRouteError(null);

    getDrivingRoute(pickupCoords, dropCoords, { signal: controller?.signal })
      .then((res) => {
        if (currentReqId !== latestRouteRequestId.current) return;

        if (res.success) {
          setRouteResult(res);
          setRouteError(null);
          setRouteMetrics({
            distanceKm: res.distanceKm,
            durationMinutes: Math.round(res.durationSeconds / 60),
            coordinates: res.coordinates,
          });
        } else {
          setRouteResult(null);
          setRouteError(res.message);
          setRouteMetrics({ distanceKm: null, durationMinutes: null, coordinates: null });
        }
      })
      .catch(() => {
        if (currentReqId !== latestRouteRequestId.current) return;
        setRouteResult(null);
        setRouteError('Unable to calculate driving route. Please try again.');
        setRouteMetrics({ distanceKm: null, durationMinutes: null, coordinates: null });
      })
      .finally(() => {
        if (currentReqId === latestRouteRequestId.current) {
          setIsCalculatingRoute(false);
        }
      });
  }, [
    pickupCoords?.latitude,
    pickupCoords?.longitude,
    dropCoords?.latitude,
    dropCoords?.longitude,
  ]);

  const handleLocationTextChange = (field: 'pickup' | 'drop', text: string) => {
    if (field === 'pickup') {
      setPickupLocation(text);
    } else {
      setDropLocation(text);
    }
    setActiveField(field);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = text.trim();
    if (trimmed.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setShowSuggestions(true);
    setIsSearching(true);

    debounceTimerRef.current = setTimeout(async () => {
      const currentReqId = ++searchRequestId.current;
      abortControllerRef.current?.abort();
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      if (controller) {
        abortControllerRef.current = controller;
      }

      try {
        const proximity = (field === 'drop' ? pickupCoords : null) || {
          latitude: 11.0168,
          longitude: 76.9558,
        };

        const results = await searchPlaces(trimmed, {
          proximity,
          limit: 5,
          signal: controller?.signal,
        });

        if (currentReqId === searchRequestId.current) {
          setSuggestions(results);
          setIsSearching(false);
        }
      } catch {
        if (currentReqId === searchRequestId.current) {
          setSuggestions([]);
          setIsSearching(false);
        }
      }
    }, 350);
  };

  const handleClearLocationInput = (field: 'pickup' | 'drop') => {
    if (field === 'pickup') {
      setPickupLocation('');
      setPickupCoords(null);
    } else {
      setDropLocation('');
      setDropCoords(null);
    }
    setShowSuggestions(false);
    setSuggestions([]);
    setIsSearching(false);
  };

  const handleQuickPlaceSelect = (place: SavedPlace) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setShowSuggestions(false);
    if (place.type === 'other') {
      router.push('/(customer)/saved-locations');
      return;
    }
    if (activeField === 'drop') {
      setDropLocation(place.address);
      setDropCoords(null);
    } else {
      setPickupLocation(place.address);
      setPickupCoords(null);
    }
  };

  const handleSwapLocations = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const tempLoc = pickupLocation;
    const tempCoords = pickupCoords;
    setPickupLocation(dropLocation);
    setPickupCoords(dropCoords);
    setDropLocation(tempLoc);
    setDropCoords(tempCoords);
  };

  const handleSelectSuggestion = (item: LocationSuggestion) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setShowSuggestions(false);
    setSuggestions([]);

    if (activeField === 'drop') {
      setDropLocation(item.fullAddress);
      setDropCoords(item.coords);
    } else {
      setPickupLocation(item.fullAddress);
      setPickupCoords(item.coords);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(customer)');
    }
  };

  const handleUseCurrentLocation = async () => {
    if (isLocating || isResolvingAddress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setShowSuggestions(false);
    setIsLocating(true);

    try {
      const result = await getCurrentLocation();
      if (result.success) {
        // Set coordinates immediately
        setPickupCoords({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
          address: pickupLocation,
        });

        // Reverse geocode device GPS coordinates
        setIsResolvingAddress(true);
        const currentRequestId = ++latestGeocodeRequestId.current;
        try {
          const geocodeResult = await reverseGeocodeLocation(result.coords);
          if (currentRequestId === latestGeocodeRequestId.current) {
            setPickupLocation(geocodeResult.address);
            setPickupCoords({
              latitude: result.coords.latitude,
              longitude: result.coords.longitude,
              address: geocodeResult.address,
            });
          }
        } finally {
          if (currentRequestId === latestGeocodeRequestId.current) {
            setIsResolvingAddress(false);
          }
        }
      } else {
        Alert.alert('Location Unavailable', result.message);
      }
    } catch {
      Alert.alert('Location Error', 'Unable to retrieve your current location. Please try again.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleMapSelectCoords = async (coords: GeoCoordinates) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setShowSuggestions(false);

    // 1. Immediately update coordinates in Zustand to update map pins
    if (activeField === 'drop') {
      setDropCoords({
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: dropLocation,
      });
    } else {
      setPickupCoords({
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: pickupLocation,
      });
    }

    // 2. Duplicate avoidance check
    const last = lastGeocodedCoords.current;
    if (
      last &&
      Math.abs(last.lat - coords.latitude) < 0.00001 &&
      Math.abs(last.lng - coords.longitude) < 0.00001
    ) {
      return;
    }
    lastGeocodedCoords.current = { lat: coords.latitude, lng: coords.longitude };

    // 3. Increment request ID to prevent race conditions
    const currentRequestId = ++latestGeocodeRequestId.current;
    setIsResolvingAddress(true);

    try {
      const result = await reverseGeocodeLocation(coords);

      // Discard stale request if a newer coordinate selection occurred
      if (currentRequestId !== latestGeocodeRequestId.current) {
        return;
      }

      const resolvedAddress = result.address;

      if (activeField === 'drop') {
        setDropLocation(resolvedAddress);
        setDropCoords({
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: resolvedAddress,
        });
      } else {
        setPickupLocation(resolvedAddress);
        setPickupCoords({
          latitude: coords.latitude,
          longitude: coords.longitude,
          address: resolvedAddress,
        });
      }
    } finally {
      if (currentRequestId === latestGeocodeRequestId.current) {
        setIsResolvingAddress(false);
      }
    }
  };

  const handleContinue = () => {
    if (isResolvingAddress) {
      Alert.alert('Please Wait', 'Resolving the selected location address...');
      return;
    }
    if (!pickupLocation || !pickupLocation.trim()) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Please enter or select a pickup location to continue.');
      } else {
        Alert.alert('Pickup Location Required', 'Please enter or select a pickup location to continue.');
      }
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push('/(customer)/select-datetime');
  };

  const desktopFrameHeight = isDesktopOrTablet ? Math.min(windowHeight - 24, 880) : '100%';

  const renderSavedPlaceIcon = (type: SavedPlace['type']) => {
    const iconSize = 18;
    const iconColor = '#00D2B4';
    if (type === 'home') return <HomeIcon size={iconSize} color={iconColor} strokeWidth={2.2} />;
    if (type === 'office') return <Briefcase size={iconSize} color={iconColor} strokeWidth={2.2} />;
    if (type === 'parents') return <Users size={iconSize} color={iconColor} strokeWidth={2.2} />;
    return <Star size={iconSize} color={iconColor} strokeWidth={2.2} />;
  };

  // DESKTOP SCREEN VIEW (Matching user desktop screenshot)
  if (isDesktopOrTablet) {
    return (
      <View style={styles.desktopOuterContainer}>
        <StatusBar style="dark" />
        <DesktopHeader activeTab="home" />

        <View style={styles.desktopBodyRow}>
          {/* Left Persistent Navigation Sidebar */}
          <DesktopSidebar activeTab="home" />

          {/* Main Content Area */}
          <View style={styles.desktopContentArea}>
            {/* Decorative Matrix Dots */}
            <View style={styles.topRightDots} pointerEvents="none">
              <DotGrid />
            </View>
            <View style={styles.bottomRightDots} pointerEvents="none">
              <DotGrid />
            </View>

            <ScrollView
              style={styles.desktopScroll}
              contentContainerStyle={styles.desktopScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.desktopMainContent}>
                {/* Left Column: Interactive Map */}
                <View style={styles.desktopMapPanel}>
            <InteractiveMap
              pickupCoords={pickupCoords}
              dropCoords={dropCoords}
              routeCoordinates={routeResult?.coordinates}
              activeField={activeField}
              onSelectCoords={handleMapSelectCoords}
              showControls={true}
            />

            {/* Floating "Use Current Location" button on top-left of the map */}
            <TouchableOpacity
              style={styles.desktopUseCurrentLocationBtn}
              activeOpacity={0.85}
              onPress={handleUseCurrentLocation}
              accessibilityLabel="Use Current Location"
            >
              <Crosshair size={15} color="#0E1E38" strokeWidth={2.4} />
              <Text style={styles.desktopUseCurrentLocationText}>
                {isLocating ? 'Locating...' : 'Use Current Location'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Right Column: Floating "Select Locations" Card */}
          <View style={styles.desktopCardPanel}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.desktopCardScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.desktopCardTitle}>Select Locations</Text>
              <Text style={styles.desktopCardSubtitle}>
                Choose your pickup and drop locations to find available drivers.
              </Text>

              {/* Pickup Location Box */}
              <View
                style={[
                  styles.desktopInputCard,
                  activeField === 'pickup' && styles.desktopInputCardActive,
                ]}
              >
                <View style={[styles.pinIconBadge, { backgroundColor: '#E6FAF6' }]}>
                  <MapPin size={18} color="#00D2B4" fill="#00D2B4" strokeWidth={1} />
                </View>
                <Pressable
                  style={styles.desktopInputInner}
                  onPress={() => {
                    setActiveField('pickup');
                    pickupInputRef.current?.focus();
                  }}
                >
                  <Text style={styles.desktopInputMicroLabel}>Pickup Location</Text>
                  <TextInput
                    ref={pickupInputRef}
                    style={styles.desktopTextInput}
                    placeholder="Enter pickup location"
                    placeholderTextColor="#94A3B8"
                    value={pickupLocation}
                    onFocus={() => setActiveField('pickup')}
                    onChangeText={(text) => handleLocationTextChange('pickup', text)}
                  />
                </Pressable>
                {pickupLocation.length > 0 && (
                  <TouchableOpacity
                    style={styles.desktopFieldActionBtn}
                    activeOpacity={0.7}
                    onPress={() => handleClearLocationInput('pickup')}
                    accessibilityLabel="Clear pickup location"
                  >
                    <X size={15} color="#64748B" strokeWidth={2.4} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.desktopFieldActionBtn}
                  activeOpacity={0.7}
                  onPress={handleUseCurrentLocation}
                  accessibilityLabel="Locate current position"
                >
                  <Crosshair size={16} color="#00D2B4" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>

              {/* Drop Location Box */}
              <View
                style={[
                  styles.desktopInputCard,
                  activeField === 'drop' && styles.desktopInputCardActive,
                ]}
              >
                <View style={[styles.pinIconBadge, { backgroundColor: '#FEE2E2' }]}>
                  <MapPin size={18} color="#EF4444" fill="#EF4444" strokeWidth={1} />
                </View>
                <Pressable
                  style={styles.desktopInputInner}
                  onPress={() => {
                    setActiveField('drop');
                    dropInputRef.current?.focus();
                  }}
                >
                  <Text style={styles.desktopInputMicroLabel}>Drop Location (Optional)</Text>
                  <TextInput
                    ref={dropInputRef}
                    style={styles.desktopTextInput}
                    placeholder="Where do you want to go?"
                    placeholderTextColor="#94A3B8"
                    value={dropLocation}
                    onFocus={() => setActiveField('drop')}
                    onChangeText={(text) => handleLocationTextChange('drop', text)}
                  />
                </Pressable>
                {dropLocation.length > 0 && (
                  <TouchableOpacity
                    style={styles.desktopFieldActionBtn}
                    activeOpacity={0.7}
                    onPress={() => handleClearLocationInput('drop')}
                    accessibilityLabel="Clear drop location"
                  >
                    <X size={15} color="#64748B" strokeWidth={2.4} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.desktopFieldActionBtn}
                  activeOpacity={0.7}
                  onPress={handleSwapLocations}
                  accessibilityLabel="Swap pickup and drop"
                >
                  <GitBranch size={16} color="#64748B" strokeWidth={2.2} />
                </TouchableOpacity>
              </View>

              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <View style={styles.desktopSuggestionsContainer}>
                  {suggestions.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.desktopSuggestionRow}
                      activeOpacity={0.7}
                      onPress={() => handleSelectSuggestion(item)}
                    >
                      <MapPin size={16} color="#00D2B4" strokeWidth={2} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.desktopSuggestionPrimary} numberOfLines={1}>
                          {item.primaryText}
                        </Text>
                        <Text style={styles.desktopSuggestionSecondary} numberOfLines={1}>
                          {item.secondaryText}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Route Metrics Row */}
              {routeResult && (
                <View style={styles.desktopRouteMetricsBar}>
                  <View style={styles.desktopMetricItem}>
                    <Navigation size={17} color="#00D2B4" strokeWidth={2.2} />
                    <View>
                      <Text style={styles.desktopMetricLabel}>ROAD DISTANCE</Text>
                      <Text style={styles.desktopMetricValue}>
                        {routeResult.formattedDistance || `${routeResult.distanceKm?.toFixed(1) || '0'} km`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.desktopMetricDivider} />

                  <View style={styles.desktopMetricItem}>
                    <Clock size={17} color="#00D2B4" strokeWidth={2.2} />
                    <View>
                      <Text style={styles.desktopMetricLabel}>EST. TRAVEL TIME</Text>
                      <Text style={styles.desktopMetricValue}>
                        {routeResult.formattedDuration || `${Math.round(routeResult.durationSeconds / 60)} mins`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.desktopFastestBadge}>
                    <Zap size={13} color="#047857" strokeWidth={2.6} />
                    <Text style={styles.desktopFastestText}>Fastest Route</Text>
                  </View>
                </View>
              )}

              {/* Quick Saved Places */}
              <View style={styles.desktopSavedPlacesSection}>
                <Text style={styles.desktopSavedPlacesHeading}>Quick Places</Text>
                <View style={styles.desktopSavedPlacesChips}>
                  {savedPlaces.map((place) => (
                    <TouchableOpacity
                      key={place.id}
                      style={styles.desktopSavedPlaceChip}
                      activeOpacity={0.7}
                      onPress={() => handleQuickPlaceSelect(place)}
                    >
                      {renderSavedPlaceIcon(place.type)}
                      <Text style={styles.desktopSavedPlaceChipText}>{place.title || (place as any).name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Continue CTA Button */}
              <TouchableOpacity
                style={styles.desktopContinueBtn}
                activeOpacity={0.85}
                onPress={handleContinue}
              >
                <LinearGradient
                  colors={['#00D2B4', '#00B89C']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.desktopContinueGradient}
                >
                  <Text style={styles.desktopContinueBtnText}>Continue</Text>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  </View>
</View>
    );
  }

  // MOBILE VIEW
  return (
    <View style={styles.outerContainer}>
      <StatusBar style="dark" />

      {/* Responsive App Frame */}
      <View style={{ height: '100%', flex: 1, backgroundColor: '#FFFFFF' }}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          {/* Upper Section: Interactive Map with Floating Overlaid Controls */}
          <View style={styles.mapContainer}>
            <InteractiveMap
              pickupCoords={pickupCoords}
              dropCoords={dropCoords}
              routeCoordinates={routeResult?.coordinates}
              activeField={activeField}
              onSelectCoords={handleMapSelectCoords}
            />

            {/* Top Floating Map Controls: Back Button & Centered Logo */}
            <View style={styles.topMapHeader} pointerEvents="box-none">
              <TouchableOpacity
                style={styles.backButtonCircle}
                activeOpacity={0.8}
                onPress={handleBack}
                accessibilityLabel="Go back"
              >
                <ArrowLeft size={19} color="#0E1E38" strokeWidth={2.4} />
              </TouchableOpacity>

              <View style={styles.brandCenter} pointerEvents="none">
                <Image
                  source={require('../../assets/DriveX_Logo.png')}
                  style={styles.logoEmblem}
                  resizeMode="contain"
                />
                <View style={styles.brandTextRow}>
                  <Text style={styles.brandTextNavy}>Driver</Text>
                  <Text style={styles.brandTextTeal}>X</Text>
                </View>
              </View>

              {/* Placeholder to balance back button */}
              <View style={{ width: 42 }} pointerEvents="none" />
            </View>

            {/* "Use Current Location" Floating Pill on top-left of map */}
            <TouchableOpacity
              style={styles.useCurrentLocationPill}
              activeOpacity={0.85}
              onPress={handleUseCurrentLocation}
            >
              <Crosshair size={14} color="#0E1E38" strokeWidth={2.6} />
              <Text style={styles.useCurrentLocationText}>
                {isLocating ? 'Locating...' : 'Use Current Location'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Lower Section: Bottom Sheet "Select Locations" Card */}
          <View style={styles.bottomSheetCard}>
            {/* Draggable Handle */}
            <View style={styles.sheetHandleWrapper}>
              <View style={styles.sheetHandle} />
            </View>

            {/* Sheet Scrollable Content */}
            <ScrollView
              style={styles.sheetScrollView}
              contentContainerStyle={styles.sheetScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Header Title & Subtitle */}
              <Text style={styles.sheetTitle}>Select Locations</Text>
              <Text style={styles.sheetSubtitle}>
                Choose your pickup and drop locations to find available drivers.
              </Text>

              {/* 1. Pickup Location Input Box */}
              <View
                style={[
                  styles.locationInputBox,
                  activeField === 'pickup' && styles.locationInputBoxActive,
                ]}
              >
                <View style={[styles.pinIconBadge, { backgroundColor: '#E6FAF6' }]}>
                  <MapPin size={17} color="#00D2B4" fill="#00D2B4" strokeWidth={1} />
                </View>

                <Pressable
                  style={styles.inputInnerWrapper}
                  onPress={() => {
                    setActiveField('pickup');
                    pickupInputRef.current?.focus();
                  }}
                >
                  <Text style={styles.inputMicroLabel}>Pickup Location</Text>
                  <TextInput
                    ref={pickupInputRef}
                    style={styles.locationTextInput}
                    placeholder="Enter pickup location"
                    placeholderTextColor="#94A3B8"
                    value={pickupLocation}
                    onFocus={() => setActiveField('pickup')}
                    onChangeText={(text) => handleLocationTextChange('pickup', text)}
                  />
                </Pressable>

                {pickupLocation.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearIconButton}
                    onPress={() => handleClearLocationInput('pickup')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={14} color="#94A3B8" strokeWidth={2.4} />
                  </TouchableOpacity>
                )}

                {activeField === 'pickup' && isResolvingAddress && (
                  <View style={{ marginRight: 6 }}>
                    <ActivityIndicator size="small" color="#00D2B4" />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.actionRoundButtonTeal}
                  activeOpacity={0.8}
                  onPress={handleUseCurrentLocation}
                  accessibilityLabel="Locate current position"
                >
                  <Crosshair size={15} color="#0E1E38" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>

              {/* 2. Drop Location Input Box */}
              <View
                style={[
                  styles.locationInputBox,
                  { marginTop: 10 },
                  activeField === 'drop' && styles.locationInputBoxActive,
                ]}
              >
                <View style={[styles.pinIconBadge, { backgroundColor: '#FEE2E2' }]}>
                  <MapPin size={17} color="#EF4444" fill="#EF4444" strokeWidth={1} />
                </View>

                <Pressable
                  style={styles.inputInnerWrapper}
                  onPress={() => {
                    setActiveField('drop');
                    dropInputRef.current?.focus();
                  }}
                >
                  <Text style={styles.inputMicroLabel}>Drop Location (Optional)</Text>
                  <TextInput
                    ref={dropInputRef}
                    style={styles.locationTextInput}
                    placeholder="Enter drop location (optional)"
                    placeholderTextColor="#94A3B8"
                    value={dropLocation}
                    onFocus={() => setActiveField('drop')}
                    onChangeText={(text) => handleLocationTextChange('drop', text)}
                  />
                </Pressable>

                {dropLocation.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearIconButton}
                    onPress={() => handleClearLocationInput('drop')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={14} color="#94A3B8" strokeWidth={2.4} />
                  </TouchableOpacity>
                )}

                {activeField === 'drop' && isResolvingAddress && (
                  <View style={{ marginRight: 6 }}>
                    <ActivityIndicator size="small" color="#EF4444" />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.actionRoundButtonBlue}
                  activeOpacity={0.8}
                  accessibilityLabel="Route waypoint options"
                >
                  <GitBranch size={15} color="#0284C7" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>

              {/* Autocomplete Suggestions Dropdown Card */}
              {showSuggestions && (
                <View style={styles.suggestionsCard}>
                  <View style={styles.suggestionsHeaderRow}>
                    <Text style={styles.suggestionsHeaderTitle}>
                      Matching Locations ({activeField === 'pickup' ? 'Pickup' : 'Drop'})
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowSuggestions(false)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessibilityLabel="Close suggestions"
                    >
                      <X size={15} color="#64748B" strokeWidth={2.2} />
                    </TouchableOpacity>
                  </View>

                  {isSearching && (
                    <View style={styles.suggestionsStatusRow}>
                      <ActivityIndicator size="small" color="#00D2B4" />
                      <Text style={styles.suggestionsStatusText}>Searching locations...</Text>
                    </View>
                  )}

                  {!isSearching && suggestions.length === 0 && (
                    <View style={styles.suggestionsStatusRow}>
                      <Text style={styles.suggestionsEmptyText}>
                        No matching locations found. Try another place or landmark.
                      </Text>
                    </View>
                  )}

                  {!isSearching && suggestions.length > 0 && (
                    <View style={styles.suggestionsList}>
                      {suggestions.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.suggestionItem}
                          activeOpacity={0.7}
                          onPress={() => handleSelectSuggestion(item)}
                        >
                          <View
                            style={[
                              styles.suggestionPinBadge,
                              activeField === 'drop'
                                ? { backgroundColor: '#FEE2E2' }
                                : { backgroundColor: '#E6FAF6' },
                            ]}
                          >
                            <MapPin
                              size={15}
                              color={activeField === 'drop' ? '#EF4444' : '#00D2B4'}
                              strokeWidth={2.2}
                            />
                          </View>
                          <View style={styles.suggestionTextWrapper}>
                            <Text style={styles.suggestionPrimaryText} numberOfLines={1}>
                              {item.primaryText}
                            </Text>
                            {item.secondaryText ? (
                              <Text style={styles.suggestionSecondaryText} numberOfLines={1}>
                                {item.secondaryText}
                              </Text>
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* Driving Route Distance & Estimated Travel Duration Card */}
              {(isCalculatingRoute || routeResult || routeError) && (
                <View style={styles.routeSummaryCard}>
                  {isCalculatingRoute ? (
                    <View style={styles.routeCalculatingRow}>
                      <ActivityIndicator size="small" color="#00D2B4" />
                      <Text style={styles.routeCalculatingText}>
                        Calculating driving route & ETA...
                      </Text>
                    </View>
                  ) : routeError ? (
                    <View style={styles.routeErrorRow}>
                      <View style={styles.routeErrorIconBadge}>
                        <AlertCircle size={15} color="#EF4444" strokeWidth={2.4} />
                      </View>
                      <Text style={styles.routeErrorText} numberOfLines={2}>
                        {routeError}
                      </Text>
                    </View>
                  ) : routeResult ? (
                    <View style={styles.routeSuccessRow}>
                      <View style={styles.routeMetricsBlock}>
                        <View style={styles.routeMetricItem}>
                          <View style={styles.routeMetricIconBadge}>
                            <Navigation size={14} color="#00D2B4" strokeWidth={2.4} />
                          </View>
                          <View>
                            <Text style={styles.routeMetricLabel}>Road Distance</Text>
                            <Text style={styles.routeMetricValue}>
                              {routeResult.formattedDistance}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.routeMetricDivider} />

                        <View style={styles.routeMetricItem}>
                          <View style={styles.routeMetricIconBadge}>
                            <Clock size={14} color="#00D2B4" strokeWidth={2.4} />
                          </View>
                          <View>
                            <Text style={styles.routeMetricLabel}>Est. Travel Time</Text>
                            <Text style={styles.routeMetricValue}>
                              {routeResult.formattedDuration}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.routeBadgePill}>
                        <Text style={styles.routeBadgePillText}>Fastest Route</Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              )}

              {/* 3. Add via Map Row */}
              <TouchableOpacity
                style={styles.addViaMapRow}
                activeOpacity={0.75}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setShowSuggestions(false);
                }}
              >
                <View style={styles.addMapPlusBadge}>
                  <Plus size={16} color="#00D2B4" strokeWidth={2.8} />
                </View>
                <View style={styles.addMapTextWrapper}>
                  <Text style={styles.addMapTitle}>Add via Map</Text>
                  <Text style={styles.addMapSubtitle}>Tap on the map to select a location</Text>
                </View>
                <ChevronRight size={17} color="#94A3B8" strokeWidth={2.2} />
              </TouchableOpacity>

              {/* 4. Saved Places Section */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Saved Places</Text>
                <TouchableOpacity activeOpacity={0.7} style={styles.headerActionLink}>
                  <Text style={styles.headerActionText}>Manage</Text>
                  <ChevronRight size={13} color="#64748B" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.savedPlacesContainer}
              >
                {savedPlaces.map((place: SavedPlace) => (
                  <TouchableOpacity
                    key={place.id}
                    style={styles.savedPlaceSquareCard}
                    activeOpacity={0.75}
                    onPress={() => {
                      handleQuickPlaceSelect(place);
                    }}
                  >
                    <View style={styles.savedPlaceCircleBadge}>
                      {renderSavedPlaceIcon(place.type)}
                    </View>
                    <Text style={styles.savedPlaceCardTitle}>{place.title}</Text>
                    <Text style={styles.savedPlaceCardSubtitle} numberOfLines={2}>
                      {place.address}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* 5. Recent Places Section */}
              {recentPlaces.length > 0 && (
                <>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Recent Places</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={clearRecentPlaces}
                    >
                      <Text style={styles.headerActionText}>Clear All</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.recentPlacesList}>
                    {recentPlaces.map((item: RecentPlace) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.recentPlaceItem}
                        activeOpacity={0.75}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          setShowSuggestions(false);
                          applyRecentPlace(item);
                        }}
                      >
                        <View style={styles.recentClockBadge}>
                          <Clock size={16} color="#64748B" strokeWidth={2.2} />
                        </View>
                        <View style={styles.recentPlaceContent}>
                          <Text style={styles.recentPlaceTitle}>{item.title}</Text>
                          <Text style={styles.recentPlaceAddress}>{item.address}</Text>
                        </View>
                        <ChevronRight size={16} color="#94A3B8" strokeWidth={2.2} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Extra spacing for continue button */}
              <View style={{ height: 16 }} />
            </ScrollView>

            {/* Pinned Bottom Continue CTA Button */}
            <View style={styles.bottomActionContainer}>
              <TouchableOpacity
                style={[
                  styles.continueButtonWrapper,
                  isResolvingAddress && { opacity: 0.75 },
                ]}
                activeOpacity={0.88}
                onPress={handleContinue}
                disabled={isResolvingAddress}
              >
                <LinearGradient
                  colors={isResolvingAddress ? ['#94A3B8', '#64748B'] : ['#00E5C4', '#00D2B4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.continueButton}
                >
                  <Text style={styles.continueButtonText}>
                    {isResolvingAddress ? 'Resolving Address...' : 'Continue'}
                  </Text>
                  {!isResolvingAddress && (
                    <ArrowRight size={18} color="#072038" strokeWidth={2.6} />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* iOS Home Indicator Bar */}
              <View style={styles.homeIndicatorWrapper}>
                <View style={styles.homeIndicator} />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  appFrame: {
    width: '100%',
    maxWidth: '100%',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  appFrameDesktop: {
    maxWidth: 420,
    borderRadius: 38,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 36,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  safeArea: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
  },
  simulatedStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 20,
  },
  simulatedStatusTime: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: '#0E1E38',
  },
  simulatedStatusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cellularBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1.5,
    height: 10,
    marginRight: 2,
  },
  cellularBar: {
    width: 2.5,
    backgroundColor: '#0E1E38',
    borderRadius: 1,
  },
  topMapHeader: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 12 : 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 25,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  brandCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoEmblem: {
    width: 44,
    height: 22,
    marginBottom: -2,
  },
  brandTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextNavy: {
    fontFamily: FONT.bold,
    fontSize: 19,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  brandTextTeal: {
    fontFamily: FONT.bold,
    fontSize: 19,
    color: '#00D2B4',
    letterSpacing: -0.4,
  },
  mapContainer: {
    height: 295,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  useCurrentLocationPill: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 62 : 68,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 20,
  },
  useCurrentLocationText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: '#0E1E38',
  },
  mapLandmarkBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.6,
    borderColor: '#E2E8F0',
  },
  landmarkText: {
    fontFamily: FONT.medium,
    fontSize: 9.5,
    color: '#334155',
  },
  mapPlainLabel: {
    position: 'absolute',
    fontFamily: FONT.semiBold,
    fontSize: 10.5,
    color: '#475569',
  },
  yourLocationContainer: {
    position: 'absolute',
    top: 96,
    left: '42%',
    alignItems: 'center',
  },
  yourLocationTooltip: {
    backgroundColor: '#0E1E38',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 4,
  },
  yourLocationTooltipText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0E1E38',
    position: 'absolute',
    bottom: -5,
  },
  radarPulseRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 122, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCoreWhite: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  radarBlueDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  vocParkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  vocParkText: {
    fontFamily: FONT.semiBold,
    fontSize: 9.5,
    color: '#15803D',
  },
  coimbatoreCityLabel: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#475569',
    marginTop: 2,
    letterSpacing: -0.2,
  },
  bottomSheetCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  sheetHandleWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  sheetScrollView: {
    flex: 1,
  },
  sheetScrollContent: {
    paddingHorizontal: 18,
    paddingTop: 2,
    paddingBottom: 8,
  },
  sheetTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: '#0E1E38',
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  locationInputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  locationInputBoxActive: {
    borderColor: '#00D2B4',
    borderWidth: 1.5,
  },
  pinIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputInnerWrapper: {
    flex: 1,
  },
  inputMicroLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#64748B',
    marginBottom: 1,
  },
  locationTextInput: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#0E1E38',
    padding: 0,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
        } as any)
      : {}),
  },
  clearIconButton: {
    padding: 4,
  },
  actionRoundButtonTeal: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRoundButtonBlue: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addViaMapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    marginBottom: 16,
  },
  addMapPlusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  addMapTextWrapper: {
    flex: 1,
  },
  addMapTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#0E1E38',
  },
  addMapSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#64748B',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#0E1E38',
  },
  headerActionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  headerActionText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#64748B',
  },
  savedPlacesContainer: {
    gap: 10,
    paddingBottom: 4,
    marginBottom: 16,
  },
  savedPlaceSquareCard: {
    width: 118,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    flexShrink: 0,
  },
  savedPlaceCircleBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  savedPlaceCardTitle: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#0E1E38',
    textAlign: 'left',
    marginBottom: 2,
  },
  savedPlaceCardSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: '#64748B',
    textAlign: 'left',
    lineHeight: 13,
  },
  recentPlacesList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  recentPlaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  recentClockBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  recentPlaceContent: {
    flex: 1,
  },
  recentPlaceTitle: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#0E1E38',
    marginBottom: 1,
  },
  recentPlaceAddress: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#64748B',
  },
  bottomActionContainer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  continueButtonWrapper: {
    borderRadius: 26,
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  continueButton: {
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#072038',
  },
  suggestionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 12,
    marginTop: 10,
    marginBottom: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  suggestionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 4,
  },
  suggestionsHeaderTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#64748B',
  },
  suggestionsStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  suggestionsStatusText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#64748B',
  },
  suggestionsEmptyText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 6,
    width: '100%',
  },
  suggestionsList: {
    paddingTop: 2,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 0.6,
    borderBottomColor: '#F8FAFC',
  },
  suggestionPinBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  suggestionTextWrapper: {
    flex: 1,
  },
  suggestionPrimaryText: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#0E1E38',
    marginBottom: 1,
  },
  suggestionSecondaryText: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#64748B',
  },
  routeSummaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 12,
    marginTop: 10,
    marginBottom: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  routeCalculatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  routeCalculatingText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#0E1E38',
  },
  routeErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  routeErrorIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeErrorText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#EF4444',
    flex: 1,
  },
  routeSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeMetricsBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  routeMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeMetricIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeMetricLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  routeMetricValue: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
  },
  routeMetricDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#E2E8F0',
  },
  routeBadgePill: {
    backgroundColor: '#E6FAF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: '#A7F3D0',
  },
  routeBadgePillText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    color: '#047857',
  },
  homeIndicatorWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#000000',
  },

  // Desktop Styles
  desktopOuterContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    minHeight: '100%',
  },
  desktopBodyRow: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100%',
  },
  desktopContentArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F7FAFC',
  },
  topRightDots: {
    position: 'absolute',
    top: 40,
    right: 28,
    zIndex: 0,
  },
  bottomRightDots: {
    position: 'absolute',
    bottom: 40,
    right: 28,
    zIndex: 0,
  },
  dotGridContainer: {
    flexDirection: 'column',
    gap: 9,
  },
  dotGridRow: {
    flexDirection: 'row',
    gap: 9,
  },
  dotGridDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
    backgroundColor: '#00D2B4',
    opacity: 0.38,
  },
  desktopScroll: {
    flex: 1,
    zIndex: 1,
  },
  desktopScrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  desktopMainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 24,
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
  },
  desktopMapPanel: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 520,
  },
  desktopUseCurrentLocationBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0E1E38',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 999,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  desktopUseCurrentLocationText: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: '#0E1E38',
  },
  desktopCardPanel: {
    width: 460,
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#071226',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
  desktopCardScroll: {
    paddingBottom: 8,
  },
  desktopCardTitle: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: '#0E1E38',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  desktopCardSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 22,
  },
  desktopInputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  desktopInputCardActive: {
    borderColor: '#00D2B4',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  desktopInputInner: {
    flex: 1,
    justifyContent: 'center',
  },
  desktopInputMicroLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  desktopTextInput: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
    padding: 0,
    margin: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  desktopFieldActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  desktopSuggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#071226',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  desktopSuggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  desktopSuggestionPrimary: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: '#0E1E38',
  },
  desktopSuggestionSecondary: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
  },
  desktopRouteMetricsBar: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  desktopMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  desktopMetricLabel: {
    fontFamily: FONT.bold,
    fontSize: 9.5,
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  desktopMetricValue: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
  },
  desktopMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  desktopFastestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6FAF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: '#A7F3D0',
  },
  desktopFastestText: {
    fontFamily: FONT.bold,
    fontSize: 10.5,
    color: '#047857',
  },
  desktopSavedPlacesSection: {
    marginBottom: 18,
  },
  desktopSavedPlacesHeading: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  desktopSavedPlacesChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  desktopSavedPlaceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  desktopSavedPlaceChipText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#0E1E38',
  },
  desktopContinueBtn: {
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
    marginTop: 8,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  desktopContinueGradient: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  desktopContinueBtnText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
