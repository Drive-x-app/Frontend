import React, { useState, useRef } from 'react';
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
  Bell,
  Clock,
  Sun,
  Calendar,
  MapPin,
  LocateFixed,
  ArrowRight,
  ShieldCheck,
  Car,
  CreditCard,
  Headphones,
  Home as HomeIcon,
  Briefcase,
  MoreVertical,
  History,
  User,
  ChevronRight,
  Check,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  useBookingStore,
  DURATION_OPTIONS,
  SavedPlace,
} from '../../src/store/bookingStore';

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktopOrTablet = windowWidth > 600;

  // Zustand state
  const selectedDurationId = useBookingStore((state) => state.selectedDurationId);
  const pickupLocation = useBookingStore((state) => state.pickupLocation);
  const dropLocation = useBookingStore((state) => state.dropLocation);
  const activeTab = useBookingStore((state) => state.activeTab);
  const savedPlaces = useBookingStore((state) => state.savedPlaces);

  const setSelectedDurationId = useBookingStore((state) => state.setSelectedDurationId);
  const setPickupLocation = useBookingStore((state) => state.setPickupLocation);
  const setDropLocation = useBookingStore((state) => state.setDropLocation);
  const setActiveTab = useBookingStore((state) => state.setActiveTab);
  const applySavedPlace = useBookingStore((state) => state.applySavedPlace);

  const pickupInputRef = useRef<any>(null);
  const dropInputRef = useRef<any>(null);

  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);

  const handleDurationSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedDurationId(id);
  };

  const handleUseCurrentLocation = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPickupLocation('Current Location (Gandhipuram, Coimbatore)');
  };

  const handleBookDriver = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    // Prepared for booking confirmation flow
  };

  const handleTabPress = (tab: 'home' | 'bookings' | 'history' | 'profile') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveTab(tab);
  };

  const renderDurationIcon = (id: string, isSelected: boolean) => {
    const iconColor = isSelected ? '#00D2B4' : '#64748B';
    const iconSize = 18;
    if (id === 'fullday') return <Sun size={iconSize} color={iconColor} strokeWidth={2.2} />;
    if (id === '1week') return <Calendar size={iconSize} color={iconColor} strokeWidth={2.2} />;
    return <Clock size={iconSize} color={iconColor} strokeWidth={2.2} />;
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar style="dark" />

      {/* Responsive Container (centered on desktop/tablets, full width on mobile) */}
      <View style={[styles.appFrame, isDesktopOrTablet && styles.appFrameDesktop, { minHeight: windowHeight }]}>
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
                  setHasUnreadNotification(false);
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
            {/* 1. Hero Promo Banner */}
            <View style={styles.heroBanner}>
              <LinearGradient
                colors={['#F0F7FF', '#E4F1FE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                <View style={styles.heroTextSection}>
                  <Text style={styles.heroTitleNavy}>Professional</Text>
                  <Text style={styles.heroTitleNavy}>Drivers,</Text>
                  <Text style={styles.heroTitleTeal}>On Your Time</Text>
                  <Text style={styles.heroSubtitle}>
                    Safe, reliable and convenient driver service for any duration.
                  </Text>
                </View>

                <View style={styles.heroImageSection}>
                  <Image
                    source={require('../../assets/home_hero_driver.jpg')}
                    style={styles.heroDriverImage}
                    resizeMode="cover"
                  />
                </View>
              </LinearGradient>
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
              {DURATION_OPTIONS.map((item) => {
                const isSelected = item.id === selectedDurationId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.durationPill,
                      isSelected && styles.durationPillSelected,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => handleDurationSelect(item.id)}
                  >
                    <View
                      style={[
                        styles.durationIconCircle,
                        isSelected && styles.durationIconCircleSelected,
                      ]}
                    >
                      {renderDurationIcon(item.id, isSelected)}
                    </View>
                    <Text
                      style={[
                        styles.durationLabel,
                        isSelected && styles.durationLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 3. Location Input Card */}
            <View style={styles.locationCard}>
              {/* Pickup Location Row */}
              <Pressable
                style={styles.locationRow}
                onPress={() => pickupInputRef.current?.focus()}
              >
                <View style={[styles.locationPinBadge, { backgroundColor: '#E6FAF6' }]}>
                  <MapPin size={17} color="#00D2B4" strokeWidth={2.4} />
                </View>

                <View style={styles.locationInputWrapper}>
                  <Text style={styles.locationLabel}>Pickup Location</Text>
                  <TextInput
                    ref={pickupInputRef}
                    style={styles.locationTextInput}
                    placeholder="Enter pickup location"
                    placeholderTextColor="#94A3B8"
                    value={pickupLocation}
                    onChangeText={setPickupLocation}
                  />
                </View>

                <TouchableOpacity
                  style={styles.locateButton}
                  activeOpacity={0.7}
                  onPress={handleUseCurrentLocation}
                  accessibilityLabel="Use current location"
                >
                  <LocateFixed size={18} color="#94A3B8" strokeWidth={2} />
                </TouchableOpacity>
              </Pressable>

              {/* Divider Line */}
              <View style={styles.locationDivider} />

              {/* Drop Location Row */}
              <Pressable
                style={styles.locationRow}
                onPress={() => dropInputRef.current?.focus()}
              >
                <View style={[styles.locationPinBadge, { backgroundColor: '#FEE2E2' }]}>
                  <MapPin size={17} color="#EF4444" strokeWidth={2.4} />
                </View>

                <View style={styles.locationInputWrapper}>
                  <Text style={styles.locationLabel}>Drop Location (Optional)</Text>
                  <TextInput
                    ref={dropInputRef}
                    style={styles.locationTextInput}
                    placeholder="Enter drop location (optional)"
                    placeholderTextColor="#94A3B8"
                    value={dropLocation}
                    onChangeText={setDropLocation}
                  />
                </View>
              </Pressable>
            </View>

            {/* 4. Book a Driver Main Action Button */}
            <TouchableOpacity
              style={styles.bookButtonWrapper}
              activeOpacity={0.88}
              onPress={handleBookDriver}
            >
              <LinearGradient
                colors={['#00E5C4', '#00D2B4', '#00C2A4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bookButton}
              >
                <Text style={styles.bookButtonText}>Book a Driver</Text>
                <ArrowRight size={19} color="#072038" strokeWidth={2.6} />
              </LinearGradient>
            </TouchableOpacity>

            {/* 5. Trust / Feature Badges */}
            <View style={styles.featuresRow}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconBadge}>
                  <ShieldCheck size={20} color="#00D2B4" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureTitle}>Verified</Text>
                <Text style={styles.featureTitle}>Drivers</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconBadge}>
                  <Car size={20} color="#00D2B4" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureTitle}>Real-time</Text>
                <Text style={styles.featureTitle}>Tracking</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconBadge}>
                  <CreditCard size={20} color="#00D2B4" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureTitle}>Secure</Text>
                <Text style={styles.featureTitle}>Payments</Text>
              </View>

              <View style={styles.featureItem}>
                <View style={styles.featureIconBadge}>
                  <Headphones size={20} color="#00D2B4" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureTitle}>24/7</Text>
                <Text style={styles.featureTitle}>Support</Text>
              </View>
            </View>

            {/* 6. Saved Places Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Saved Places</Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>Manage</Text>
                <ChevronRight size={14} color="#64748B" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            <View style={styles.savedPlacesRow}>
              {savedPlaces.map((place: SavedPlace) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.savedPlaceCard}
                  activeOpacity={0.75}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    applySavedPlace(place);
                  }}
                >
                  <View style={styles.savedPlaceIconBadge}>
                    {place.type === 'home' ? (
                      <HomeIcon size={18} color="#00D2B4" strokeWidth={2.2} />
                    ) : (
                      <Briefcase size={18} color="#00D2B4" strokeWidth={2.2} />
                    )}
                  </View>

                  <View style={styles.savedPlaceContent}>
                    <Text style={styles.savedPlaceTitle}>{place.title}</Text>
                    <Text style={styles.savedPlaceAddress} numberOfLines={2}>
                      {place.address}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.savedPlaceOptionsButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MoreVertical size={16} color="#94A3B8" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>

            {/* 7. Recent Bookings Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Bookings</Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight size={14} color="#64748B" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            {/* Recent Booking Card */}
            <View style={styles.recentBookingCard}>
              {/* Left Car Thumbnail */}
              <View style={styles.bookingCarThumbnailWrapper}>
                <Image
                  source={require('../../assets/car_sedan_thumb.jpg')}
                  style={styles.bookingCarThumbnail}
                  resizeMode="contain"
                />
              </View>

              {/* Middle Booking Details */}
              <View style={styles.bookingMiddleDetails}>
                <Text style={styles.bookingDateText}>Today, 10:00 AM</Text>
                <Text style={styles.bookingDurationText}>2 Hours</Text>
                <View style={styles.completedBadge}>
                  <Check size={11} color="#10B981" strokeWidth={3} />
                  <Text style={styles.completedBadgeText}>Completed</Text>
                </View>
              </View>

              {/* Right Route Timeline */}
              <View style={styles.bookingRouteContainer}>
                <View style={styles.timelineRow}>
                  <View style={[styles.timelineDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.timelineText} numberOfLines={1}>
                    Home
                  </Text>
                </View>

                <View style={styles.timelineLine} />

                <View style={styles.timelineRow}>
                  <View style={[styles.timelineDot, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.timelineText} numberOfLines={1}>
                    RS Puram, Coimbatore
                  </Text>
                </View>
              </View>

              <ChevronRight size={16} color="#94A3B8" strokeWidth={2.4} style={styles.bookingArrow} />
            </View>

            {/* Bottom Padding for Fixed Tab Bar */}
            <View style={{ height: 90 }} />
          </ScrollView>

          {/* 8. Bottom Navigation Tab Bar */}
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
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F3F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appFrame: {
    width: '100%',
    maxWidth: '100%',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  appFrameDesktop: {
    maxWidth: 440,
    borderRadius: 24,
    marginVertical: 20,
    shadowColor: '#071226',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
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
    fontSize: 21,
    fontWeight: '800',
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  brandTextTeal: {
    fontSize: 21,
    fontWeight: '800',
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
    borderWidth: 1,
    borderColor: '#F1F5F9',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  heroGradient: {
    flexDirection: 'row',
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 16,
    alignItems: 'center',
  },
  heroTextSection: {
    flex: 1.25,
    paddingRight: 6,
  },
  heroTitleNavy: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0E1E38',
    lineHeight: 23,
    letterSpacing: -0.3,
  },
  heroTitleTeal: {
    fontSize: 19,
    fontWeight: '800',
    color: '#00D2B4',
    lineHeight: 24,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    fontWeight: '400',
  },
  heroImageSection: {
    flex: 1,
    height: 125,
    borderRadius: 12,
    overflow: 'hidden',
  },
  heroDriverImage: {
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
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0E1E38',
    letterSpacing: -0.3,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '600',
  },
  durationListContainer: {
    paddingBottom: 4,
    gap: 10,
    marginBottom: 18,
  },
  durationPill: {
    width: 65,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#EBF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  durationPillSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00D2B4',
    borderWidth: 1.5,
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  durationIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationIconCircleSelected: {
    backgroundColor: '#E6FAF6',
  },
  durationLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  durationLabelSelected: {
    color: '#0E1E38',
    fontWeight: '700',
  },
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  locationPinBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  locationInputWrapper: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0E1E38',
    marginBottom: 2,
  },
  locationTextInput: {
    fontSize: 13,
    color: '#0E1E38',
    padding: 0,
    fontWeight: '500',
  },
  locateButton: {
    padding: 6,
  },
  locationDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 42,
  },
  bookButtonWrapper: {
    borderRadius: 27,
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 24,
  },
  bookButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#072038',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  featureItem: {
    alignItems: 'center',
    width: '23%',
  },
  featureIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0E1E38',
    textAlign: 'center',
    lineHeight: 14,
  },
  savedPlacesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  savedPlaceCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  savedPlaceIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  savedPlaceContent: {
    flex: 1,
  },
  savedPlaceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0E1E38',
    marginBottom: 2,
  },
  savedPlaceAddress: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 13,
  },
  savedPlaceOptionsButton: {
    paddingLeft: 4,
  },
  recentBookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  bookingCarThumbnailWrapper: {
    width: 60,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  bookingCarThumbnail: {
    width: '90%',
    height: '90%',
  },
  bookingMiddleDetails: {
    flex: 1.1,
  },
  bookingDateText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0E1E38',
    marginBottom: 2,
  },
  bookingDurationText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  bookingRouteContainer: {
    flex: 1.3,
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timelineText: {
    fontSize: 10.5,
    color: '#0E1E38',
    fontWeight: '500',
  },
  timelineLine: {
    width: 1.5,
    height: 10,
    backgroundColor: '#CBD5E1',
    marginLeft: 2.25,
    marginVertical: 2,
  },
  bookingArrow: {
    marginLeft: 6,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 14 : 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
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
    fontSize: 10.5,
    fontWeight: '500',
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#00D2B4',
    fontWeight: '700',
  },
});
