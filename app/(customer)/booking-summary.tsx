import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Pencil,
  MapPin,
  Map,
  Clock,
  Calendar,
  CircleDollarSign,
  Info,
  Check,
  CreditCard,
  ChevronRight,
  ArrowRight,
  Navigation,
  Car,
  AlertCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  useBookingStore,
  DURATION_OPTIONS,
} from '../../src/store/bookingStore';
import { DesktopHeader } from '../../src/components/common/DesktopHeader';
import { DesktopSidebar } from '../../src/components/common/DesktopSidebar';
import { FONT } from '../../src/theme/typography';
import { getTodayDateKey } from '../../src/utils/dateTime';

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

export default function BookingSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktopOrTablet = windowWidth > 600;

  // Zustand State
  const pickupLocation = useBookingStore((state) => state.pickupLocation);
  const dropLocation = useBookingStore((state) => state.dropLocation);
  const selectedDurationId = useBookingStore((state) => state.selectedDurationId);
  const selectedDate = useBookingStore((state) => state.selectedDate);
  const selectedTime = useBookingStore((state) => state.selectedTime);
  const pickupTimingMode = useBookingStore((state) => state.pickupTimingMode);
  const estimatedDistanceKm = useBookingStore((state) => state.estimatedDistanceKm);
  const estimatedDurationMinutes = useBookingStore((state) => state.estimatedDurationMinutes);

  const isNavigatingRef = useRef(false);

  const selectedDuration =
    DURATION_OPTIONS.find((d) => d.id === selectedDurationId) ||
    DURATION_OPTIONS[0]; // Default 1 hour

  const hourlyRate = 300;
  const durationHours = selectedDuration?.hours || 1;
  const estimatedFare = durationHours * hourlyRate;

  // Format Date string: "YYYY-MM-DD" -> "Thu, 29 Oct 2026"
  const formatDisplayDate = (dateStr: string) => {
    try {
      const targetStr = dateStr && dateStr.includes('-') ? dateStr : getTodayDateKey();
      const parts = targetStr.split('-');
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(year, month, day);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return `${dayNames[dateObj.getDay()]}, ${day} ${monthNames[month]} ${year}`;
    } catch {
      return 'Today';
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(customer)/select-duration');
    }
  };

  const handleEditLocations = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push('/(customer)/select-location');
  };

  const handleEditDuration = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push('/(customer)/select-duration');
  };

  const handleEditDateTime = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push('/(customer)/select-datetime');
  };

  const handleConfirmBooking = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push('/(customer)/payment');

    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  };

  // =========================================================================
  // DESKTOP & TABLET VIEW (Matching Reference Mockup Exactly)
  // =========================================================================
  if (isDesktopOrTablet) {
    return (
      <View style={styles.desktopOuterContainer}>
        <StatusBar style="dark" />
        {/* Top Header */}
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
              <View style={styles.desktopMainCard}>
                {/* 1. Header Row: Title & Subtitle */}
                <View style={styles.dtCardHeaderRow}>
                  <View style={styles.dtTitleColumn}>
                    <Text style={styles.dtPageTitle}>Booking Summary</Text>
                    <Text style={styles.dtPageSubtitle}>
                      Review your booking details and confirm.
                    </Text>
                  </View>
                </View>

                {/* 2. Trip Locations Card */}
                <View style={styles.dtLocationsCard}>
                  <View style={styles.dtCardTopHeader}>
                    <View style={styles.dtCardTitleWithIcon}>
                      <View style={styles.dtIconCircleBlue}>
                        <MapPin size={17} color="#0284C7" strokeWidth={2.4} />
                      </View>
                      <Text style={styles.dtSectionCardTitle}>Trip Locations</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.dtEditPillBtn}
                      activeOpacity={0.75}
                      onPress={handleEditLocations}
                    >
                      <Pencil size={13} color="#0284C7" strokeWidth={2.4} />
                      <Text style={styles.dtEditPillText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dtLocationsSplitRow}>
                    {/* Left: Pickup & Drop Points */}
                    <View style={styles.dtLocationDetailsColumn}>
                      {/* Pickup */}
                      <View style={styles.dtLocationPointRow}>
                        <View style={styles.dtMarkerDotGreen} />
                        <View style={styles.dtLocationTextWrap}>
                          <Text style={styles.dtMicroLabel}>Pickup Location</Text>
                          <Text style={styles.dtAddressTitle} numberOfLines={1}>
                            {pickupLocation || 'Pickup not specified'}
                          </Text>
                        </View>
                      </View>

                      {/* Dotted Connecting Line */}
                      <View style={styles.dtDottedLineContainer}>
                        <View style={styles.dtDottedSegment} />
                        <View style={styles.dtDottedSegment} />
                      </View>

                      {/* Drop */}
                      <View style={styles.dtLocationPointRow}>
                        <View style={styles.dtMarkerDotRed} />
                        <View style={styles.dtLocationTextWrap}>
                          <Text style={styles.dtMicroLabel}>Drop Location (Optional)</Text>
                          <Text style={styles.dtAddressTitle} numberOfLines={1}>
                            {dropLocation || 'Not specified (Driver on hourly rental)'}
                          </Text>
                        </View>
                      </View>

                      {/* Distance & Route Metrics Banner */}
                      <View style={styles.dtRouteMetricsBanner}>
                        <Navigation size={14} color="#00A892" strokeWidth={2.4} />
                        <Text style={styles.dtRouteMetricsText}>
                          {estimatedDistanceKm
                            ? `${estimatedDistanceKm.toFixed(2)} km road distance • ~${estimatedDurationMinutes || 1} mins estimated route`
                            : 'Flexible route • As directed by customer'}
                        </Text>
                      </View>
                    </View>

                    {/* Right: Map Thumbnail View */}
                    <TouchableOpacity
                      style={styles.dtMapThumbnailContainer}
                      activeOpacity={0.85}
                      onPress={handleEditLocations}
                    >
                      <Image
                        source={require('../../assets/trip_route_thumb.jpg')}
                        style={styles.dtMapThumbnailImage}
                        resizeMode="cover"
                      />
                      <View style={styles.dtViewMapOverlayPill}>
                        <Map size={14} color="#0284C7" strokeWidth={2.2} />
                        <Text style={styles.dtViewMapOverlayText}>View on Map</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 3. Three Metrics Cards Row (Duration, Date & Time, Estimated Fare) */}
                <View style={styles.dtThreeCardsRow}>
                  {/* Card 1: Duration */}
                  <View style={styles.dtSummaryTile}>
                    <View style={styles.dtTileHeaderRow}>
                      <View style={styles.dtTileIconLabel}>
                        <View style={styles.dtIconCircleBlue}>
                          <Clock size={16} color="#0284C7" strokeWidth={2.4} />
                        </View>
                        <Text style={styles.dtTileLabel}>Duration</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.dtMiniEditBtn}
                        activeOpacity={0.7}
                        onPress={handleEditDuration}
                      >
                        <Pencil size={12} color="#0284C7" strokeWidth={2.4} />
                        <Text style={styles.dtMiniEditText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.dtTilePrimaryValue}>{selectedDuration.label}</Text>
                    <Text style={styles.dtTileSecondaryDesc} numberOfLines={2}>
                      {selectedDuration.description.replace(/\n/g, ' ')}
                    </Text>
                  </View>

                  {/* Card 2: Date & Time */}
                  <View style={styles.dtSummaryTile}>
                    <View style={styles.dtTileHeaderRow}>
                      <View style={styles.dtTileIconLabel}>
                        <View style={styles.dtIconCircleGreen}>
                          <Calendar size={16} color="#00A892" strokeWidth={2.4} />
                        </View>
                        <Text style={styles.dtTileLabel}>Date & Time</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.dtMiniEditBtn}
                        activeOpacity={0.7}
                        onPress={handleEditDateTime}
                      >
                        <Pencil size={12} color="#0284C7" strokeWidth={2.4} />
                        <Text style={styles.dtMiniEditText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.dtTilePrimaryValue}>
                      {formatDisplayDate(selectedDate)}
                    </Text>
                    <View style={styles.dtTimeRowInsideTile}>
                      <Clock size={13} color="#64748B" strokeWidth={2.2} />
                      <Text style={styles.dtTimeValueInsideTile}>
                        {pickupTimingMode === 'now' ? 'Now (Immediate)' : selectedTime || '04:00 PM'}
                      </Text>
                    </View>
                  </View>

                  {/* Card 3: Estimated Fare */}
                  <View style={styles.dtSummaryTile}>
                    <View style={styles.dtTileHeaderRow}>
                      <View style={styles.dtTileIconLabel}>
                        <View style={styles.dtIconCircleTeal}>
                          <CircleDollarSign size={16} color="#00A892" strokeWidth={2.4} />
                        </View>
                        <Text style={styles.dtTileLabel}>Estimated Fare</Text>
                      </View>
                    </View>
                    <View style={styles.dtFareValueRow}>
                      <Text style={styles.dtFareLargeText}>₹ {estimatedFare}</Text>
                      <View style={styles.dtInfoCircleSmall}>
                        <Info size={13} color="#64748B" strokeWidth={2.2} />
                      </View>
                    </View>
                    <Text style={styles.dtFareBreakdownSubtext}>
                      (₹ {hourlyRate} per hour × {durationHours} hour{durationHours > 1 ? 's' : ''})
                    </Text>
                    <Text style={styles.dtFareDisclaimerText}>
                      Final amount may vary based on distance, stops and actual usage.
                    </Text>
                  </View>
                </View>

                {/* 4. Booking Includes Card */}
                <View style={styles.dtIncludesCard}>
                  <View style={styles.dtIncludesHeaderRow}>
                    <View style={styles.dtIconCircleTeal}>
                      <Car size={16} color="#00A892" strokeWidth={2.4} />
                    </View>
                    <Text style={styles.dtIncludesTitle}>Booking Includes</Text>
                  </View>

                  <View style={styles.dtIncludesList}>
                    <View style={styles.dtIncludeItemRow}>
                      <Check size={14} color="#00D2B4" strokeWidth={2.6} />
                      <Text style={styles.dtIncludeItemText}>Professional driver service</Text>
                    </View>
                    <View style={styles.dtIncludeItemRow}>
                      <Check size={14} color="#00D2B4" strokeWidth={2.6} />
                      <Text style={styles.dtIncludeItemText}>Selected booking duration</Text>
                    </View>
                    <View style={styles.dtIncludeItemRow}>
                      <Check size={14} color="#00D2B4" strokeWidth={2.6} />
                      <Text style={styles.dtIncludeItemText}>Pickup at the selected location</Text>
                    </View>
                    <View style={styles.dtIncludeItemRow}>
                      <Check size={14} color="#00D2B4" strokeWidth={2.6} />
                      <Text style={styles.dtIncludeItemText}>Optional drop location, if provided</Text>
                    </View>
                  </View>
                </View>

                {/* 5. Bottom Action Button */}
                <TouchableOpacity
                  style={styles.dtConfirmButton}
                  activeOpacity={0.88}
                  onPress={handleConfirmBooking}
                  accessibilityLabel="Proceed to payment"
                >
                  <Text style={styles.dtConfirmButtonText}>Proceed to Payment</Text>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  // =========================================================================
  // MOBILE APP VIEW
  // =========================================================================
  return (
    <View style={styles.outerContainer}>
      <StatusBar style="dark" />

      {/* Responsive App Frame */}
      <View style={{ height: '100%', flex: 1, backgroundColor: '#FFFFFF' }}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          {/* Top Header: Back Button & Centered Logo */}
          <View style={styles.topHeaderBar}>
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
            <View style={{ width: 40 }} />
          </View>

          {/* Title Header */}
          <View style={styles.titleSection}>
            <Text style={styles.pageTitle}>Booking Summary</Text>
            <Text style={styles.pageSubtitle}>Review and confirm your driver details</Text>
          </View>

          {/* Scrollable Summary Cards */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Trip Locations Card */}
            <View style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <MapPin size={17} color="#0E1E38" strokeWidth={2.2} />
                  <Text style={styles.cardTitle}>Trip Locations</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  activeOpacity={0.7}
                  onPress={handleEditLocations}
                  accessibilityLabel="Edit pickup and drop locations"
                >
                  <Pencil size={13} color="#00D2B4" strokeWidth={2.4} />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.locationContainer}>
                {/* Pickup Point */}
                <View style={styles.pointRow}>
                  <View style={styles.dotPickup} />
                  <View style={styles.addressWrap}>
                    <Text style={styles.microLabel}>Pickup Location</Text>
                    <Text style={styles.addressText} numberOfLines={1}>
                      {pickupLocation}
                    </Text>
                  </View>
                </View>

                {/* Connecting Dotted Line */}
                <View style={styles.dottedLineContainer}>
                  <View style={styles.dotSegment} />
                  <View style={styles.dotSegment} />
                  <View style={styles.dotSegment} />
                </View>

                {/* Drop Point */}
                <View style={styles.pointRow}>
                  <View style={styles.dotDrop} />
                  <View style={styles.addressWrap}>
                    <Text style={styles.microLabel}>Drop Location (Optional)</Text>
                    <Text style={styles.addressText} numberOfLines={1}>
                      {dropLocation || 'Not specified (Driver on hourly rental)'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Distance & Route Metrics Banner */}
              <View style={styles.routeMetricsRow}>
                <View style={styles.metricItem}>
                  <Navigation size={14} color="#00D2B4" strokeWidth={2.4} />
                  <Text style={styles.metricLabel}>
                    {estimatedDistanceKm ? `${estimatedDistanceKm.toFixed(1)} km road distance` : 'Flexible route'}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Clock size={14} color="#64748B" strokeWidth={2.2} />
                  <Text style={styles.metricLabel}>
                    {estimatedDurationMinutes
                      ? `~${estimatedDurationMinutes} mins estimated route`
                      : 'Hourly driver rental'}
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. Duration Details Card */}
            <View style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <Clock size={17} color="#0E1E38" strokeWidth={2.2} />
                  <Text style={styles.cardTitle}>Selected Duration</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  activeOpacity={0.7}
                  onPress={handleEditDuration}
                  accessibilityLabel="Edit booking duration"
                >
                  <Pencil size={13} color="#00D2B4" strokeWidth={2.4} />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.durationContentRow}>
                <View style={styles.durationPillBadge}>
                  <Text style={styles.durationPillText}>{selectedDuration.label}</Text>
                </View>
                <Text style={styles.durationDescText} numberOfLines={2}>
                  {selectedDuration.description.replace(/\n/g, ' ')}
                </Text>
              </View>
            </View>

            {/* 3. Date & Time Card */}
            <View style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <Calendar size={17} color="#0E1E38" strokeWidth={2.2} />
                  <Text style={styles.cardTitle}>Date & Time</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  activeOpacity={0.7}
                  onPress={handleEditDateTime}
                  accessibilityLabel="Edit date and time"
                >
                  <Pencil size={13} color="#00D2B4" strokeWidth={2.4} />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateTimeGrid}>
                <View style={styles.dateTimeBox}>
                  <Text style={styles.microLabel}>Scheduled Date</Text>
                  <Text style={styles.dateTimeValText}>
                    {formatDisplayDate(selectedDate)}
                  </Text>
                </View>
                <View style={styles.dateTimeBox}>
                  <Text style={styles.microLabel}>Pickup Time</Text>
                  <Text style={styles.dateTimeValText}>
                    {pickupTimingMode === 'now' ? 'Now (Immediate)' : selectedTime}
                  </Text>
                </View>
              </View>
            </View>

            {/* 4. Fare Breakdown Card */}
            <View style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <CircleDollarSign size={17} color="#0E1E38" strokeWidth={2.2} />
                  <Text style={styles.cardTitle}>Fare Breakdown</Text>
                </View>
              </View>

              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>Base Rate ({selectedDuration.label})</Text>
                <Text style={styles.fareAmount}>₹ {estimatedFare}</Text>
              </View>
              <View style={styles.fareRow}>
                <Text style={styles.fareLabelSub}>Rate per hour: ₹ {hourlyRate}</Text>
                <Text style={styles.fareLabelSub}>Duration: {durationHours}h</Text>
              </View>

              <View style={styles.fareDivider} />

              <View style={styles.fareTotalRow}>
                <View>
                  <Text style={styles.fareTotalTitle}>Estimated Total</Text>
                  <Text style={styles.fareTotalSub}>Includes GST & all driver charges</Text>
                </View>
                <Text style={styles.fareTotalValue}>₹ {estimatedFare}</Text>
              </View>
            </View>

            {/* 5. Booking Inclusions */}
            <View style={styles.inclusionsCard}>
              <View style={styles.inclusionItem}>
                <Check size={16} color="#00D2B4" strokeWidth={2.4} />
                <Text style={styles.inclusionText}>Verified & police background-checked driver</Text>
              </View>
              <View style={styles.inclusionItem}>
                <Check size={16} color="#00D2B4" strokeWidth={2.4} />
                <Text style={styles.inclusionText}>Fuel, driver allowance & return trip covered</Text>
              </View>
              <View style={styles.inclusionItem}>
                <Check size={16} color="#00D2B4" strokeWidth={2.4} />
                <Text style={styles.inclusionText}>Free cancellation up to 1 hour before pickup</Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom CTA */}
          <View
            style={[
              styles.bottomCtaContainer,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <TouchableOpacity
              style={styles.continueButtonWrapper}
              activeOpacity={0.88}
              onPress={handleConfirmBooking}
              accessibilityLabel="Proceed to payment"
            >
              <LinearGradient
                colors={['#00E5C4', '#00D2B4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.continueButton}
              >
                <Text style={styles.continueButtonText}>Proceed to Payment</Text>
                <ArrowRight size={18} color="#072038" strokeWidth={2.6} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Simulated iOS Home Indicator */}
            <View style={styles.homeIndicator} />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // =========================================================================
  // DESKTOP SPECIFIC STYLES (Matching Reference Design)
  // =========================================================================
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
    paddingHorizontal: 36,
    paddingVertical: 28,
    alignItems: 'center',
  },
  desktopMainCard: {
    width: '100%',
    maxWidth: 960,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#071226',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  dtCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dtCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dtBackButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtTitleColumn: {
    gap: 2,
  },
  dtPageTitle: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  dtPageSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#64748B',
  },
  dtBrandCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dtLogoEmblem: {
    width: 32,
    height: 20,
  },
  brandTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextNavy: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  brandTextTeal: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: '#00D2B4',
    letterSpacing: -0.4,
  },

  /* Locations Card */
  dtLocationsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  dtCardTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dtCardTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dtIconCircleBlue: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dtIconCircleGreen: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dtIconCircleTeal: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dtSectionCardTitle: {
    fontFamily: FONT.bold,
    fontSize: 15.5,
    color: '#0E1E38',
  },
  dtEditPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtEditPillText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#0284C7',
  },
  dtLocationsSplitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  dtLocationDetailsColumn: {
    flex: 1.3,
  },
  dtLocationPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dtMarkerDotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#D1FAE5',
  },
  dtMarkerDotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FEE2E2',
  },
  dtLocationTextWrap: {
    flex: 1,
  },
  dtMicroLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: '#94A3B8',
  },
  dtAddressTitle: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    color: '#0E1E38',
    marginTop: 1,
  },
  dtDottedLineContainer: {
    paddingLeft: 5,
    marginVertical: 4,
    gap: 3,
  },
  dtDottedSegment: {
    width: 2,
    height: 4,
    borderRadius: 1,
    backgroundColor: '#CBD5E1',
  },
  dtRouteMetricsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginTop: 14,
  },
  dtRouteMetricsText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#059669',
  },
  dtMapThumbnailContainer: {
    flex: 0.9,
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtMapThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  dtViewMapOverlayPill: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dtViewMapOverlayText: {
    fontFamily: FONT.bold,
    fontSize: 11.5,
    color: '#0284C7',
  },

  /* Three Summary Tiles Row */
  dtThreeCardsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  dtSummaryTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    borderRadius: 18,
    padding: 18,
  },
  dtTileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dtTileIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dtTileLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 13.5,
    color: '#64748B',
  },
  dtMiniEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtMiniEditText: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#0284C7',
  },
  dtTilePrimaryValue: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#0E1E38',
    marginBottom: 4,
  },
  dtTileSecondaryDesc: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  dtTimeRowInsideTile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  dtTimeValueInsideTile: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#0E1E38',
  },
  dtFareValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  dtFareLargeText: {
    fontFamily: FONT.bold,
    fontSize: 20,
    color: '#0E1E38',
  },
  dtInfoCircleSmall: {
    marginTop: 2,
  },
  dtFareBreakdownSubtext: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 6,
  },
  dtFareDisclaimerText: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
  },

  /* Inclusions Card */
  dtIncludesCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    borderRadius: 18,
    padding: 20,
    marginBottom: 26,
  },
  dtIncludesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  dtIncludesTitle: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#0E1E38',
  },
  dtIncludesList: {
    gap: 8,
  },
  dtIncludeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dtIncludeItemText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#334155',
  },

  /* Continue Button */
  dtConfirmButton: {
    backgroundColor: '#00D2B4',
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-end',
    paddingHorizontal: 36,
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtConfirmButtonText: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },

  // =========================================================================
  // MOBILE BASE STYLES
  // =========================================================================
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'column',
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoEmblem: {
    width: 32,
    height: 20,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  pageTitle: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#0E1E38',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#00D2B4',
  },
  locationContainer: {
    gap: 4,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dotPickup: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00D2B4',
  },
  dotDrop: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  addressWrap: {
    flex: 1,
  },
  microLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: '#94A3B8',
  },
  addressText: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: '#0E1E38',
  },
  dottedLineContainer: {
    paddingLeft: 4,
    marginVertical: 2,
    gap: 3,
  },
  dotSegment: {
    width: 2,
    height: 3,
    borderRadius: 1,
    backgroundColor: '#CBD5E1',
  },
  routeMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricLabel: {
    fontFamily: FONT.medium,
    fontSize: 11.5,
    color: '#64748B',
  },
  durationContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationPillBadge: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  durationPillText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#00A896',
  },
  durationDescText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#64748B',
  },
  dateTimeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  dateTimeBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
  },
  dateTimeValText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#0E1E38',
    marginTop: 2,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fareLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#334155',
  },
  fareAmount: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
  },
  fareLabelSub: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
  },
  fareDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  fareTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareTotalTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
  },
  fareTotalSub: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  fareTotalValue: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: '#00A896',
  },
  inclusionsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inclusionText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#334155',
  },
  bottomCtaContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  continueButtonWrapper: {
    width: '100%',
  },
  continueButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonText: {
    fontFamily: FONT.bold,
    fontSize: 15.5,
    color: '#072038',
  },
  homeIndicator: {
    width: 134,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000000',
    alignSelf: 'center',
    marginTop: 10,
  },
});
