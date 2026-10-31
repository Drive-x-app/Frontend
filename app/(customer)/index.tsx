import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  Bell,
  Clock,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Home as HomeIcon,
  MoreVertical,
  History,
  User,
  ChevronRight,
  ChevronDown,
  Wifi,
  Battery,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  useBookingStore,
  DURATION_OPTIONS,
  SavedPlace,
} from '../../src/store/bookingStore';
import {
  getCurrentLocation,
  reverseGeocodeLocation,
} from '../../src/services/location/locationService';
import { FONT } from '../../src/theme/typography';
import { TrustFeaturesBar } from '../../src/components/common/TrustFeaturesBar';
import { SavedPlaceCard } from '../../src/components/common/SavedPlaceCard';
import { RecentBookingCard } from '../../src/components/common/RecentBookingCard';
import { DesktopHeader } from '../../src/components/common/DesktopHeader';
import { DesktopSidebar } from '../../src/components/common/DesktopSidebar';
import { DurationPill } from '../../src/components/common/DurationPill';
import { LocationInputCard } from '../../src/components/common/LocationInputCard';

const DESKTOP_DURATION_ITEMS = [
  { id: '1h', label: '1 Hour', subtitle: 'Quick Rides', iconType: 'clock' },
  { id: '2h', label: '2 Hours', subtitle: 'Business Trips', iconType: 'clock' },
  { id: '4h', label: '4 Hours', subtitle: 'City Tours', iconType: 'clock' },
  { id: '6h', label: '6 Hours', subtitle: 'Longer Trips', iconType: 'clock' },
  { id: 'fullday', label: 'Full Day', subtitle: 'Full Day', iconType: 'sun' },
];

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

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktopOrTablet =
    windowWidth > 600 ||
    (Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth > 600);
  const [isLocating, setIsLocating] = useState(false);

  // Zustand state
  const selectedDurationId = useBookingStore((state) => state.selectedDurationId);
  const pickupLocation = useBookingStore((state) => state.pickupLocation);
  const dropLocation = useBookingStore((state) => state.dropLocation);
  const activeTab = useBookingStore((state) => state.activeTab);
  const savedPlaces = useBookingStore((state) => state.savedPlaces);
  const userName = useBookingStore((state) => state.userName);
  const unreadNotifications = useBookingStore((state) => state.unreadNotifications);
  const recentBookings = useBookingStore((state) => state.recentBookings);
  const loadHomeScreenData = useBookingStore((state) => state.loadHomeScreenData);
  const markNotificationsAsRead = useBookingStore((state) => state.markNotificationsAsRead);

  const setSelectedDurationId = useBookingStore((state) => state.setSelectedDurationId);
  const setPickupLocation = useBookingStore((state) => state.setPickupLocation);
  const setPickupCoords = useBookingStore((state) => state.setPickupCoords);
  const setDropLocation = useBookingStore((state) => state.setDropLocation);
  const setActiveTab = useBookingStore((state) => state.setActiveTab);
  const applySavedPlace = useBookingStore((state) => state.applySavedPlace);

  const hasUnreadNotification = unreadNotifications > 0;

  useEffect(() => {
    loadHomeScreenData();
  }, []);

  const handleDurationSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedDurationId(id);
  };

  const handleUseCurrentLocation = async () => {
    if (isLocating) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsLocating(true);

    try {
      const result = await getCurrentLocation();
      if (result.success) {
        // Resolve readable street address for acquired device position
        const geocodeResult = await reverseGeocodeLocation(result.coords);
        setPickupLocation(geocodeResult.address);
        setPickupCoords({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
          address: geocodeResult.address,
        });
      } else {
        Alert.alert('Location Unavailable', result.message);
      }
    } catch {
      Alert.alert('Location Error', 'Unable to retrieve your current location. Please try again.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleBookDriver = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push('/(customer)/select-location');
  };

  const handleTabPress = (tab: 'home' | 'bookings' | 'history' | 'profile') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveTab(tab);
    if (tab === 'bookings') {
      router.push('/(customer)/my-bookings');
    } else if (tab === 'history') {
      router.push('/(customer)/trip-history');
    } else if (tab === 'profile') {
      router.push('/(customer)/profile');
    }
  };



  // DESKTOP HOME SCREEN VIEW
  if (isDesktopOrTablet) {
    return (
      <View style={styles.desktopOuterContainer}>
        <StatusBar style="dark" />

        {/* 1. Top Navigation Bar Header */}
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
              <View style={styles.desktopMainRow}>
                {/* LEFT COLUMN: Hero Banner Card */}
                <View style={styles.desktopHeroCard}>
                  <Image
                    source={require('../../assets/Login page image desktop.png')}
                    style={styles.desktopHeroBgImage}
                    resizeMode="cover"
                  />

                  {/* Top Hero Text */}
                  <View style={styles.desktopHeroTextContainer}>
                    <Text style={styles.desktopHeroTitleNavy}>Professional Drivers,</Text>
                    <Text style={styles.desktopHeroTitleTeal}>On Your Time</Text>
                    <Text style={styles.desktopHeroSubtitle}>
                      Safe, reliable and convenient driver service{"\n"}for any duration.
                    </Text>
                  </View>

                  {/* Floating Bottom Trust Badges Card */}
                  <TrustFeaturesBar variant="desktop" />
                </View>

                {/* RIGHT COLUMN: Booking Form Card */}
                <View style={styles.desktopBookingCard}>
                  {/* Premium Pill Badge */}
                  <View style={styles.desktopPremiumBadge}>
                    <ShieldCheck size={14} color="#00D2B4" strokeWidth={2.2} />
                    <Text style={styles.desktopPremiumBadgeText}>Premium Chauffeur Service</Text>
                  </View>

                  {/* Title & Subtitle */}
                  <Text style={styles.desktopBookingTitle}>Book a Driver</Text>
                  <Text style={styles.desktopBookingSubtitle}>
                    Safe, reliable and convenient driver service{"\n"}for any occasion.
                  </Text>

                  {/* Select Duration Section Header */}
                  <View style={styles.desktopDurationHeaderRow}>
                    <Clock size={16} color="#0E1E38" strokeWidth={2.2} />
                    <Text style={styles.desktopDurationTitle}>Select Duration</Text>
                  </View>

                  {/* 5 Duration Options Grid/Row */}
                  <View style={styles.desktopDurationGrid}>
                    {DESKTOP_DURATION_ITEMS.map((item) => (
                      <DurationPill
                        key={item.id}
                        item={item}
                        isSelected={item.id === selectedDurationId}
                        onPress={handleDurationSelect}
                        variant="desktop"
                      />
                    ))}
                  </View>

                  {/* Pickup & Drop Location Cards */}
                  <LocationInputCard
                    pickupLocation={pickupLocation}
                    dropLocation={dropLocation}
                    onPressPickup={() => router.push('/(customer)/select-location')}
                    onPressDrop={() => router.push('/(customer)/select-location')}
                    onUseCurrentLocation={handleUseCurrentLocation}
                    variant="desktop"
                  />

                  {/* Book a Driver Action Button */}
                  <TouchableOpacity
                    style={styles.desktopBookButtonWrapper}
                    activeOpacity={0.88}
                    onPress={handleBookDriver}
                  >
                    <LinearGradient
                      colors={['#00E5C4', '#00D2B4']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.desktopBookButton}
                    >
                      <Text style={styles.desktopBookButtonText}>Book a Driver</Text>
                      <ArrowRight size={19} color="#FFFFFF" strokeWidth={2.6} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  // MOBILE APP VIEW
  return (
    <View style={styles.outerContainer}>
      <StatusBar style="dark" />

      {/* Responsive App Frame */}
      <View style={{ height: '100%', flex: 1, backgroundColor: '#FFFFFF' }}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          {/* Top Bar Header */}
          <View style={styles.headerBar}>
            {/* Brand Logo & Wordmark */}
            <View style={styles.brandRow}>
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

            {/* Header Right Actions: Notification Bell + Avatar */}
            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.notificationButton}
                activeOpacity={0.7}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  markNotificationsAsRead();
                }}
                accessibilityLabel="Notifications"
              >
                <Bell size={21} color="#0E1E38" strokeWidth={2.2} />
                {hasUnreadNotification && <View style={styles.notificationDot} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.avatarButton}
                activeOpacity={0.8}
                onPress={() => handleTabPress('profile')}
                accessibilityLabel="User profile"
              >
                <Image
                  source={require('../../assets/avatar_user.jpg')}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Hero Promo Banner (Using exact user-provided asset) */}
            <View style={styles.heroBanner}>
              <Image
                source={require('../../assets/Home hero.png')}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>

            {/* 2. Book a Driver Duration Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Book a Driver</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.viewAllButton}
                onPress={() => {}}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight size={14} color="#64748B" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* Duration Pill Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.durationListContainer}
            >
              {DURATION_OPTIONS.map((item) => (
                <DurationPill
                  key={item.id}
                  item={item}
                  isSelected={item.id === selectedDurationId}
                  onPress={handleDurationSelect}
                />
              ))}
            </ScrollView>

            {/* 3. Location Input Card */}
            <LocationInputCard
              pickupLocation={pickupLocation}
              dropLocation={dropLocation}
              onPressPickup={() => router.push('/(customer)/select-location')}
              onPressDrop={() => router.push('/(customer)/select-location')}
              onUseCurrentLocation={handleUseCurrentLocation}
            />

            {/* 4. Book a Driver Main Action Button */}
            <TouchableOpacity
              style={styles.bookButtonWrapper}
              activeOpacity={0.88}
              onPress={handleBookDriver}
            >
              <LinearGradient
                colors={['#00E5C4', '#00D2B4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bookButton}
              >
                <Text style={styles.bookButtonText}>Book a Driver</Text>
                <ArrowRight size={18} color="#072038" strokeWidth={2.6} />
              </LinearGradient>
            </TouchableOpacity>

            {/* 5. Trust / Feature Badges with vertical dividers */}
            <TrustFeaturesBar />

            {/* 6. Saved Places Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Saved Places</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.viewAllButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  router.push('/(customer)/saved-locations');
                }}
                accessibilityLabel="Manage saved locations"
              >
                <Text style={styles.viewAllText}>Manage</Text>
                <ChevronRight size={14} color="#64748B" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.savedPlacesScrollContainer}
            >
              {savedPlaces.map((place: SavedPlace) => (
                <SavedPlaceCard
                  key={place.id}
                  place={place}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    applySavedPlace(place);
                  }}
                />
              ))}
            </ScrollView>

            {/* 7. Recent Bookings Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Bookings</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.viewAllButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setActiveTab('history');
                  router.push('/(customer)/trip-history');
                }}
                accessibilityLabel="View all trip history"
              >
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight size={14} color="#64748B" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* Recent Booking Card */}
            {recentBookings && recentBookings.length > 0 ? (
              <RecentBookingCard
                booking={recentBookings[0]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setActiveTab('history');
                  router.push('/(customer)/trip-history');
                }}
              />
            ) : (
              <RecentBookingCard
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setActiveTab('history');
                  router.push('/(customer)/trip-history');
                }}
              />
            )}

            {/* Bottom Padding */}
            <View style={{ height: 16 }} />
          </ScrollView>

          {/* 8. Bottom Navigation Tab Bar with Home Indicator */}
          <View style={styles.bottomTabBarContainer}>
            <View style={styles.bottomTabBar}>
              {/* Home Tab */}
              <TouchableOpacity
                style={styles.tabItem}
                activeOpacity={0.8}
                onPress={() => handleTabPress('home')}
              >
                <View style={[styles.tabActivePill, activeTab === 'home' && styles.tabActivePillSelected]}>
                  <HomeIcon
                    size={20}
                    color={activeTab === 'home' ? '#00D2B4' : '#94A3B8'}
                    strokeWidth={2.4}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === 'home' && styles.tabLabelActive,
                  ]}
                >
                  Home
                </Text>
              </TouchableOpacity>

              {/* My Bookings Tab */}
              <TouchableOpacity
                style={styles.tabItem}
                activeOpacity={0.8}
                onPress={() => handleTabPress('bookings')}
              >
                <View style={[styles.tabActivePill, activeTab === 'bookings' && styles.tabActivePillSelected]}>
                  <Calendar
                    size={20}
                    color={activeTab === 'bookings' ? '#00D2B4' : '#94A3B8'}
                    strokeWidth={2.2}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === 'bookings' && styles.tabLabelActive,
                  ]}
                >
                  My Bookings
                </Text>
              </TouchableOpacity>

              {/* Trip History Tab */}
              <TouchableOpacity
                style={styles.tabItem}
                activeOpacity={0.8}
                onPress={() => handleTabPress('history')}
              >
                <View style={[styles.tabActivePill, activeTab === 'history' && styles.tabActivePillSelected]}>
                  <History
                    size={20}
                    color={activeTab === 'history' ? '#00D2B4' : '#94A3B8'}
                    strokeWidth={2.2}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === 'history' && styles.tabLabelActive,
                  ]}
                >
                  Trip History
                </Text>
              </TouchableOpacity>

              {/* Profile Tab */}
              <TouchableOpacity
                style={styles.tabItem}
                activeOpacity={0.8}
                onPress={() => handleTabPress('profile')}
              >
                <View style={[styles.tabActivePill, activeTab === 'profile' && styles.tabActivePillSelected]}>
                  <User
                    size={20}
                    color={activeTab === 'profile' ? '#00D2B4' : '#94A3B8'}
                    strokeWidth={2.2}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === 'profile' && styles.tabLabelActive,
                  ]}
                >
                  Profile
                </Text>
              </TouchableOpacity>
            </View>

            {/* iOS Bottom Indicator Bar */}
            <View style={styles.homeIndicatorWrapper}>
              <View style={styles.homeIndicator} />
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoEmblem: {
    width: 38,
    height: 24,
    marginRight: 6,
  },
  brandTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextNavy: {
    fontFamily: FONT.bold,
    fontSize: 21,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  brandTextTeal: {
    fontFamily: FONT.bold,
    fontSize: 21,
    color: '#00D2B4',
    letterSpacing: -0.4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 4,
  },
  heroBanner: {
    width: '100%',
    aspectRatio: 783 / 273,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#EDF5FE',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#0E1E38',
    letterSpacing: -0.3,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#64748B',
  },
  durationListContainer: {
    paddingBottom: 4,
    gap: 10,
    marginBottom: 18,
  },
  bookButtonWrapper: {
    borderRadius: 26,
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 22,
  },
  bookButton: {
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bookButtonText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#072038',
  },
  savedPlacesScrollContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
    marginBottom: 20,
  },
  bottomTabBarContainer: {
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  bottomTabBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabActivePill: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 14,
  },
  tabActivePillSelected: {
    backgroundColor: '#E6FAF6',
  },
  tabLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    color: '#94A3B8',
  },
  tabLabelActive: {
    fontFamily: FONT.bold,
    color: '#00D2B4',
  },
  homeIndicatorWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#000000',
  },

  // Desktop Layout Styles
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
    paddingHorizontal: 28,
    paddingVertical: 24,
    alignItems: 'center',
  },
  desktopMainRow: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 24,
  },
  desktopBookingCard: {
    flex: 1,
    maxWidth: 600,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#071226',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  desktopPremiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E6FAF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C3F3EB',
  },
  desktopPremiumBadgeText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#00B89C',
  },
  desktopBookingTitle: {
    fontFamily: FONT.bold,
    fontSize: 32,
    color: '#0E1E38',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  desktopBookingSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    marginBottom: 24,
  },
  desktopDurationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  desktopDurationTitle: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#0E1E38',
    marginLeft: 8,
  },
  desktopDurationGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  desktopBookButtonWrapper: {
    marginTop: 10,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  desktopBookButton: {
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  desktopBookButtonText: {
    fontFamily: FONT.bold,
    fontSize: 16.5,
    color: '#FFFFFF',
  },
  desktopHeroCard: {
    flex: 1.35,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 560,
    backgroundColor: '#EBF6FC',
    justifyContent: 'space-between',
  },
  desktopHeroBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web'
      ? ({
          objectFit: 'cover',
          objectPosition: '26% bottom',
        } as any)
      : {}),
  },
  desktopHeroTextContainer: {
    paddingTop: 42,
    paddingHorizontal: 38,
    zIndex: 1,
  },
  desktopHeroTitleNavy: {
    fontFamily: FONT.bold,
    fontSize: 38,
    color: '#0E1E38',
    letterSpacing: -0.6,
    lineHeight: 44,
  },
  desktopHeroTitleTeal: {
    fontFamily: FONT.bold,
    fontSize: 38,
    color: '#00D2B4',
    letterSpacing: -0.6,
    lineHeight: 44,
  },
  desktopHeroSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 14.5,
    color: '#556987',
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 440,
  },
});
