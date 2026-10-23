import React from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
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
  Wifi,
  Battery,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  useBookingStore,
  DURATION_OPTIONS,
} from '../../src/store/bookingStore';
import { FONT } from '../../src/theme/typography';

export default function BookingSummaryScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktopOrTablet = windowWidth > 600;

  // Zustand State
  const pickupLocation = useBookingStore((state) => state.pickupLocation);
  const dropLocation = useBookingStore((state) => state.dropLocation);
  const selectedDurationId = useBookingStore((state) => state.selectedDurationId);
  const selectedDate = useBookingStore((state) => state.selectedDate);
  const selectedTime = useBookingStore((state) => state.selectedTime);

  const selectedDuration =
    DURATION_OPTIONS.find((d) => d.id === selectedDurationId) ||
    DURATION_OPTIONS[2]; // Default 4 hours if not matched

  const hourlyRate = 300;
  const durationHours = selectedDuration?.hours || 4;
  const estimatedFare = durationHours * hourlyRate;

  // Format Date string: "2026-10-14" -> "Tue, 14 Oct 2026"
  const formatDisplayDate = (dateStr: string) => {
    try {
      if (!dateStr || !dateStr.includes('-')) return 'Tue, 14 Oct 2026';
      const parts = dateStr.split('-');
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
      return 'Tue, 14 Oct 2026';
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    // Proceed to driver search matching or confirmation
  };

  const desktopFrameHeight = isDesktopOrTablet ? Math.min(windowHeight - 24, 880) : '100%';

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
          {/* Simulated iOS Status Bar on Desktop/Web for exact design replication */}
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
            <Text style={styles.pageSubtitle}>
              Review your booking details and confirm.
            </Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Trip Locations Card */}
            <View style={styles.cardContainer}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderTitle}>Trip Locations</Text>
                <TouchableOpacity
                  style={styles.editPillButton}
                  activeOpacity={0.75}
                  onPress={handleEditLocations}
                >
                  <Pencil size={11} color="#0284C7" strokeWidth={2.2} />
                  <Text style={styles.editPillText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tripLocationsBody}>
                {/* Left Locations Column */}
                <View style={styles.timelineColumn}>
                  {/* Pickup Row */}
                  <View style={styles.locationTimelineRow}>
                    <View style={styles.locationPinCircleTeal}>
                      <MapPin size={13} color="#00D2B4" fill="#00D2B4" strokeWidth={1} />
                    </View>
                    <View style={styles.locationTextWrapper}>
                      <Text style={styles.locationMicroLabel}>Pickup Location</Text>
                      <Text style={styles.locationAddressText} numberOfLines={2}>
                        {pickupLocation || '123, Anna Nagar, Coimbatore'}
                      </Text>
                    </View>
                  </View>

                  {/* Vertical Dotted Connector */}
                  <View style={styles.dottedConnectorContainer}>
                    <View style={styles.dottedDot} />
                    <View style={styles.dottedDot} />
                    <View style={styles.dottedDot} />
                  </View>

                  {/* Drop Row */}
                  <View style={styles.locationTimelineRow}>
                    <View style={styles.locationPinCircleRed}>
                      <MapPin size={13} color="#EF4444" fill="#EF4444" strokeWidth={1} />
                    </View>
                    <View style={styles.locationTextWrapper}>
                      <Text style={styles.locationMicroLabel}>
                        Drop Location (Optional)
                      </Text>
                      <Text style={styles.locationAddressText} numberOfLines={2}>
                        {dropLocation || 'RS Puram, Coimbatore'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Right Mini Map Thumbnail */}
                <View style={styles.miniMapWrapper}>
                  <Image
                    source={require('../../assets/trip_route_thumb.jpg')}
                    style={styles.miniMapImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.viewOnMapButton}
                    activeOpacity={0.85}
                    onPress={handleEditLocations}
                  >
                    <Map size={11} color="#0284C7" strokeWidth={2.2} />
                    <Text style={styles.viewOnMapText}>View on Map</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 2. Duration Card & Date & Time Card Row */}
            <View style={styles.twoColumnRow}>
              {/* Duration Card */}
              <View style={[styles.cardContainer, styles.halfColumnCard]}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.iconTitleRow}>
                    <Clock size={15} color="#0E1E38" strokeWidth={2.2} />
                    <Text style={styles.cardHeaderTitleSmall}>Duration</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editPillButton}
                    activeOpacity={0.75}
                    onPress={handleEditDuration}
                  >
                    <Pencil size={11} color="#0284C7" strokeWidth={2.2} />
                    <Text style={styles.editPillText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.cardInnerContent}>
                  <Text style={styles.highlightBoldText}>
                    {selectedDuration?.label || '4 Hours'}
                  </Text>
                  <Text style={styles.subtextSmall}>
                    {selectedDuration?.description?.replace('\n', ' ') ||
                      'Multiple stops in the city'}
                  </Text>
                </View>
              </View>

              {/* Date & Time Card */}
              <View style={[styles.cardContainer, styles.halfColumnCard]}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.iconTitleRow}>
                    <Calendar size={15} color="#0E1E38" strokeWidth={2.2} />
                    <Text style={styles.cardHeaderTitleSmall}>Date & Time</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editPillButton}
                    activeOpacity={0.75}
                    onPress={handleEditDateTime}
                  >
                    <Pencil size={11} color="#0284C7" strokeWidth={2.2} />
                    <Text style={styles.editPillText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.dateTimeLines}>
                  <View style={styles.dateTimeLine}>
                    <Calendar size={13} color="#00D2B4" strokeWidth={2.2} />
                    <Text style={styles.dateTimeValueText}>
                      {formatDisplayDate(selectedDate)}
                    </Text>
                  </View>

                  <View style={styles.dateTimeLine}>
                    <Clock size={13} color="#64748B" strokeWidth={2.2} />
                    <Text style={styles.dateTimeValueText}>
                      {selectedTime || '10:00 AM'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 3. Estimated Fare & Booking Includes Row */}
            <View style={styles.twoColumnRow}>
              {/* Estimated Fare Card */}
              <View style={[styles.cardContainer, styles.halfColumnCard]}>
                <View style={styles.cardHeaderRow}>
                  <View style={styles.iconTitleRow}>
                    <CircleDollarSign size={15} color="#0E1E38" strokeWidth={2.2} />
                    <Text style={styles.cardHeaderTitleSmall}>Estimated Fare</Text>
                  </View>
                </View>

                <View style={styles.cardInnerContent}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceAmountText}>
                      ₹ {estimatedFare.toLocaleString('en-IN')}
                    </Text>
                    <Info size={13} color="#64748B" strokeWidth={2.2} />
                  </View>
                  <Text style={styles.fareFormulaText}>
                    (₹ {hourlyRate} per hour × {durationHours} hours)
                  </Text>
                  <Text style={styles.fareNoticeText}>
                    Final amount may vary based on distance, stops and actual usage.
                  </Text>
                </View>
              </View>

              {/* Booking Includes Card */}
              <View style={[styles.cardContainer, styles.halfColumnCard]}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeaderTitleSmall}>Booking Includes</Text>
                </View>

                <View style={styles.includesList}>
                  <View style={styles.includesRow}>
                    <Check size={12} color="#00D2B4" strokeWidth={2.6} />
                    <Text style={styles.includesText}>Professional driver service</Text>
                  </View>

                  <View style={styles.includesRow}>
                    <Check size={12} color="#00D2B4" strokeWidth={2.6} />
                    <Text style={styles.includesText}>Selected booking duration</Text>
                  </View>

                  <View style={styles.includesRow}>
                    <Check size={12} color="#00D2B4" strokeWidth={2.6} />
                    <Text style={styles.includesText}>Pickup at the selected location</Text>
                  </View>

                  <View style={styles.includesRow}>
                    <Check size={12} color="#00D2B4" strokeWidth={2.6} />
                    <Text style={styles.includesText}>
                      Optional drop location, if provided
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 4. Payment Method Card */}
            <View style={styles.cardContainer}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.iconTitleRow}>
                  <CreditCard size={15} color="#0E1E38" strokeWidth={2.2} />
                  <Text style={styles.cardHeaderTitle}>Payment Method</Text>
                </View>
                <TouchableOpacity style={styles.editPillButton} activeOpacity={0.75}>
                  <Pencil size={11} color="#0284C7" strokeWidth={2.2} />
                  <Text style={styles.editPillText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.paymentCardInner} activeOpacity={0.8}>
                <View style={styles.visaBadge}>
                  <Text style={styles.visaText}>VISA</Text>
                </View>
                <View style={styles.paymentCardDetails}>
                  <Text style={styles.cardNumberText}>•••• 4242</Text>
                  <Text style={styles.cardHolderText}>John Doe</Text>
                </View>
                <ChevronRight size={17} color="#94A3B8" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* 5. Cancellation Policy Card */}
            <View style={styles.policyCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.iconTitleRow}>
                  <Info size={15} color="#0284C7" strokeWidth={2.4} />
                  <Text style={styles.policyTitle}>Cancellation Policy</Text>
                </View>
                <TouchableOpacity activeOpacity={0.75}>
                  <Text style={styles.viewPolicyText}>View Policy →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletSymbol}>•</Text>
                <Text style={styles.bulletText}>
                  You can cancel or modify the booking before the scheduled time.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletSymbol}>•</Text>
                <Text style={styles.bulletText}>
                  Cancellation charges may apply as per our policy.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletSymbol}>•</Text>
                <Text style={styles.bulletText}>
                  For any assistance, contact our 24/7 support.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Pinned Bottom CTA Container */}
          <View style={styles.bottomCtaContainer}>
            <TouchableOpacity
              style={styles.confirmButtonWrapper}
              activeOpacity={0.88}
              onPress={handleConfirmBooking}
            >
              <LinearGradient
                colors={['#00E5C4', '#00D2B4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>Confirm Booking</Text>
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
  outerContainer: {
    flex: 1,
    backgroundColor: '#0A111F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appFrame: {
    width: '100%',
    maxWidth: 412,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  appFrameDesktop: {
    borderRadius: 36,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
  },
  simulatedStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
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
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  brandCenter: {
    alignItems: 'center',
    justifyContent: 'center',
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
  titleSection: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  pageTitle: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 13,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  halfColumnCard: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardHeaderTitle: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#0E1E38',
  },
  cardHeaderTitleSmall: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#0E1E38',
  },
  editPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 10,
  },
  editPillText: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#0284C7',
  },
  tripLocationsBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineColumn: {
    flex: 1,
  },
  locationTimelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  locationPinCircleTeal: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  locationPinCircleRed: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  locationTextWrapper: {
    flex: 1,
  },
  locationMicroLabel: {
    fontFamily: FONT.medium,
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 1,
  },
  locationAddressText: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#0E1E38',
    lineHeight: 16,
  },
  dottedConnectorContainer: {
    marginLeft: 10,
    height: 18,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  dottedDot: {
    width: 2,
    height: 2.5,
    borderRadius: 1,
    backgroundColor: '#94A3B8',
  },
  miniMapWrapper: {
    width: 126,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  miniMapImage: {
    width: '100%',
    height: '100%',
  },
  viewOnMapButton: {
    position: 'absolute',
    bottom: 5,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  viewOnMapText: {
    fontFamily: FONT.bold,
    fontSize: 9.5,
    color: '#0284C7',
  },
  cardInnerContent: {
    paddingTop: 2,
  },
  highlightBoldText: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#0E1E38',
    marginBottom: 2,
  },
  subtextSmall: {
    fontFamily: FONT.regular,
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
  },
  dateTimeLines: {
    gap: 6,
    paddingTop: 2,
  },
  dateTimeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeValueText: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#0E1E38',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  priceAmountText: {
    fontFamily: FONT.bold,
    fontSize: 19,
    color: '#0E1E38',
  },
  fareFormulaText: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
  },
  fareNoticeText: {
    fontFamily: FONT.regular,
    fontSize: 9,
    color: '#94A3B8',
    lineHeight: 12,
  },
  includesList: {
    gap: 5,
    paddingTop: 2,
  },
  includesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
  },
  includesText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 9.8,
    color: '#475569',
    lineHeight: 13,
  },
  paymentCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 2,
  },
  visaBadge: {
    width: 44,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaText: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#1A1F71',
    letterSpacing: 0.5,
  },
  paymentCardDetails: {
    flex: 1,
  },
  cardNumberText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#0E1E38',
  },
  cardHolderText: {
    fontFamily: FONT.regular,
    fontSize: 10.5,
    color: '#64748B',
  },
  policyCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    padding: 13,
    marginTop: 2,
    marginBottom: 10,
  },
  policyTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#0E1E38',
  },
  viewPolicyText: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#0284C7',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 3,
  },
  bulletSymbol: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  bulletText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  bottomCtaContainer: {
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  confirmButtonWrapper: {
    width: '100%',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  confirmButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    fontFamily: FONT.bold,
    fontSize: 15.5,
    color: '#072038',
    letterSpacing: -0.2,
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
