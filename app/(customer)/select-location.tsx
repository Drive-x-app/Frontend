import React, { useRef } from 'react';
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
  Building2,
  Train,
  Bus,
  Plane,
  Trees,
  ShoppingBag,
  Wifi,
  Battery,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  useBookingStore,
  SavedPlace,
  RecentPlace,
} from '../../src/store/bookingStore';
import { FONT } from '../../src/theme/typography';

export default function SelectLocationScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktopOrTablet = windowWidth > 600;

  const pickupLocation = useBookingStore((state) => state.pickupLocation);
  const dropLocation = useBookingStore((state) => state.dropLocation);
  const savedPlaces = useBookingStore((state) => state.savedPlaces);
  const recentPlaces = useBookingStore((state) => state.recentPlaces);

  const setPickupLocation = useBookingStore((state) => state.setPickupLocation);
  const setDropLocation = useBookingStore((state) => state.setDropLocation);
  const applySavedPlace = useBookingStore((state) => state.applySavedPlace);
  const applyRecentPlace = useBookingStore((state) => state.applyRecentPlace);
  const clearRecentPlaces = useBookingStore((state) => state.clearRecentPlaces);

  const pickupInputRef = useRef<any>(null);
  const dropInputRef = useRef<any>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(customer)');
    }
  };

  const handleUseCurrentLocation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPickupLocation('123, Anna Nagar, Coimbatore');
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    // Proceed to driver selection or confirmation
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

  return (
    <View style={styles.outerContainer}>
      <StatusBar style="dark" />

      {/* Responsive App Frame */}
      <View
        style={[
          styles.appFrame,
          isDesktopOrTablet
            ? [styles.appFrameDesktop, { height: desktopFrameHeight }]
            : { height: '100%', flex: 1 },
        ]}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          {/* Simulated iOS Status Bar on Desktop/Web */}
          {isDesktopOrTablet && (
            <View style={styles.simulatedStatusBar}>
              <Text style={styles.simulatedStatusTime}>9:41</Text>
              <View style={styles.simulatedStatusIcons}>
                <View style={styles.cellularBars}>
                  <View style={[styles.cellularBar, { height: 4 }]} />
                  <View style={[styles.cellularBar, { height: 6 }]} />
                  <View style={[styles.cellularBar, { height: 8 }]} />
                  <View style={[styles.cellularBar, { height: 10 }]} />
                </View>
                <Wifi size={14} color="#0E1E38" strokeWidth={2.2} />
                <Battery size={16} color="#0E1E38" strokeWidth={2.2} />
              </View>
            </View>
          )}

          {/* Upper Section: Coimbatore Interactive Map Background with Overlaid Controls */}
          <View style={styles.mapContainer}>
            <Image
              source={require('../../assets/coimbatore_map_bg.jpg')}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />

            {/* Top Floating Map Controls: Back Button & Centered Logo */}
            <View style={styles.topMapHeader}>
              <TouchableOpacity
                style={styles.backButtonCircle}
                activeOpacity={0.8}
                onPress={handleBack}
                accessibilityLabel="Go back"
              >
                <ArrowLeft size={19} color="#0E1E38" strokeWidth={2.4} />
              </TouchableOpacity>

              <View style={styles.brandCenter}>
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
              <View style={{ width: 42 }} />
            </View>

            {/* "Use Current Location" Floating Pill on top-left of map */}
            <TouchableOpacity
              style={styles.useCurrentLocationPill}
              activeOpacity={0.85}
              onPress={handleUseCurrentLocation}
            >
              <Crosshair size={14} color="#0E1E38" strokeWidth={2.6} />
              <Text style={styles.useCurrentLocationText}>Use Current Location</Text>
            </TouchableOpacity>

            {/* Map Landmark Callouts matching design */}
            <View style={[styles.mapLandmarkBadge, { top: 38, right: 18 }]}>
              <ShoppingBag size={11} color="#0284C7" strokeWidth={2.2} />
              <Text style={styles.landmarkText}>Brookefields Mall</Text>
            </View>

            <View style={[styles.mapLandmarkBadge, { top: 78, left: 165 }]}>
              <Train size={11} color="#475569" strokeWidth={2.2} />
              <Text style={styles.landmarkText}>Coimbatore Railway Station</Text>
            </View>

            <Text style={[styles.mapPlainLabel, { top: 104, right: 28 }]}>RS Puram</Text>

            <View style={[styles.mapLandmarkBadge, { top: 135, left: 16 }]}>
              <Bus size={11} color="#475569" strokeWidth={2.2} />
              <Text style={styles.landmarkText}>Gandhipuram Bus Stand</Text>
            </View>

            <View style={[styles.mapLandmarkBadge, { top: 145, right: 20 }]}>
              <Building2 size={11} color="#475569" strokeWidth={2.2} />
              <Text style={styles.landmarkText}>Tidel Park Coimbatore</Text>
            </View>

            <Text style={[styles.mapPlainLabel, { top: 188, right: 75 }]}>Peelamedu</Text>

            <View style={[styles.mapLandmarkBadge, { top: 206, right: 16 }]}>
              <Plane size={11} color="#0284C7" strokeWidth={2.2} />
              <Text style={styles.landmarkText}>Coimbatore International Airport</Text>
            </View>

            {/* "Your Location" Pulsing GPS Marker & Callout */}
            <View style={styles.yourLocationContainer}>
              <View style={styles.yourLocationTooltip}>
                <Text style={styles.yourLocationTooltipText}>Your Location</Text>
                <View style={styles.tooltipArrow} />
              </View>

              <View style={styles.radarPulseRing}>
                <View style={styles.radarCoreWhite}>
                  <View style={styles.radarBlueDot} />
                </View>
              </View>

              <View style={styles.vocParkRow}>
                <Trees size={12} color="#15803D" strokeWidth={2.2} />
                <Text style={styles.vocParkText}>VOC Park</Text>
              </View>

              <Text style={styles.coimbatoreCityLabel}>Coimbatore</Text>
            </View>
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
              <View style={styles.locationInputBox}>
                <View style={[styles.pinIconBadge, { backgroundColor: '#E6FAF6' }]}>
                  <MapPin size={17} color="#00D2B4" fill="#00D2B4" strokeWidth={1} />
                </View>

                <Pressable
                  style={styles.inputInnerWrapper}
                  onPress={() => pickupInputRef.current?.focus()}
                >
                  <Text style={styles.inputMicroLabel}>Pickup Location</Text>
                  <TextInput
                    ref={pickupInputRef}
                    style={styles.locationTextInput}
                    placeholder="Enter pickup location"
                    placeholderTextColor="#94A3B8"
                    value={pickupLocation}
                    onChangeText={setPickupLocation}
                  />
                </Pressable>

                {pickupLocation.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearIconButton}
                    onPress={() => setPickupLocation('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={14} color="#94A3B8" strokeWidth={2.4} />
                  </TouchableOpacity>
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
              <View style={[styles.locationInputBox, { marginTop: 10 }]}>
                <View style={[styles.pinIconBadge, { backgroundColor: '#FEE2E2' }]}>
                  <MapPin size={17} color="#EF4444" fill="#EF4444" strokeWidth={1} />
                </View>

                <Pressable
                  style={styles.inputInnerWrapper}
                  onPress={() => dropInputRef.current?.focus()}
                >
                  <Text style={styles.inputMicroLabel}>Drop Location (Optional)</Text>
                  <TextInput
                    ref={dropInputRef}
                    style={styles.locationTextInput}
                    placeholder="Enter drop location (optional)"
                    placeholderTextColor="#94A3B8"
                    value={dropLocation}
                    onChangeText={setDropLocation}
                  />
                </Pressable>

                {dropLocation.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearIconButton}
                    onPress={() => setDropLocation('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={14} color="#94A3B8" strokeWidth={2.4} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.actionRoundButtonBlue}
                  activeOpacity={0.8}
                  accessibilityLabel="Route waypoint options"
                >
                  <GitBranch size={15} color="#0284C7" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>

              {/* 3. Add via Map Row */}
              <TouchableOpacity
                style={styles.addViaMapRow}
                activeOpacity={0.75}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      applySavedPlace(place);
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
                style={styles.continueButtonWrapper}
                activeOpacity={0.88}
                onPress={handleContinue}
              >
                <LinearGradient
                  colors={['#00E5C4', '#00D2B4']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.continueButton}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                  <ArrowRight size={18} color="#072038" strokeWidth={2.6} />
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
    width: '100%',
    height: '100%',
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    width: 86,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  savedPlaceCircleBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  savedPlaceCardTitle: {
    fontFamily: FONT.bold,
    fontSize: 11.5,
    color: '#0E1E38',
    textAlign: 'center',
    marginBottom: 2,
  },
  savedPlaceCardSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 12.5,
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
});
