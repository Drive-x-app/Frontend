import React, { useState } from 'react';
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
  Check,
  Copy,
  Calendar,
  Clock,
  MapPin,
  Car,
  CreditCard,
  Info,
  Bell,
  ShieldCheck,
  Phone,
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

export default function BookingConfirmedScreen() {
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

  const bookingId = 'DXB126789';
  const [copied, setCopied] = useState(false);

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

  const handleCopyId = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(bookingId).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.replace('/(customer)');
  };

  const handleViewDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.replace('/(customer)');
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

          {/* Centered Top Brand Header (No back button on confirmation) */}
          <View style={styles.topBrandHeader}>
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
          </View>

          {/* Main Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Success Checkmark Hero */}
            <View style={styles.heroSection}>
              {/* Checkmark with decorative bursts */}
              <View style={styles.checkmarkWrapper}>
                {/* Decorative confetti burst dashes */}
                <View style={[styles.burstDash, styles.burstDash1]} />
                <View style={[styles.burstDash, styles.burstDash2]} />
                <View style={[styles.burstDash, styles.burstDash3]} />
                <View style={[styles.burstDash, styles.burstDash4]} />
                <View style={[styles.burstDash, styles.burstDash5]} />
                <View style={[styles.burstDash, styles.burstDash6]} />

                {/* Outer mint circle */}
                <View style={styles.outerMintCircle}>
                  {/* Inner vibrant teal circle */}
                  <View style={styles.innerTealCircle}>
                    <Check size={28} color="#FFFFFF" strokeWidth={3.5} />
                  </View>
                </View>
              </View>

              <Text style={styles.confirmedTitle}>Booking Confirmed!</Text>
              <Text style={styles.confirmedSubtitle}>
                Your driver will be assigned soon.
              </Text>

              {/* Booking ID Pill */}
              <TouchableOpacity
                style={styles.bookingIdPill}
                activeOpacity={0.75}
                onPress={handleCopyId}
              >
                <Text style={styles.bookingIdLabel}>Booking ID</Text>
                <View style={styles.bookingIdRow}>
                  <Text style={styles.bookingIdValue}>{bookingId}</Text>
                  <Copy size={14} color="#0E1E38" strokeWidth={2.2} />
                </View>
                {copied && <Text style={styles.copiedToast}>Copied!</Text>}
              </TouchableOpacity>
            </View>

            {/* 2. Booking Details Card */}
            <View style={styles.detailsCard}>
              <View style={styles.detailsCardHeader}>
                <Text style={styles.detailsCardTitle}>Booking Details</Text>
                <View style={styles.scheduledBadge}>
                  <Calendar size={11} color="#2563EB" strokeWidth={2.2} />
                  <Text style={styles.scheduledBadgeText}>Scheduled</Text>
                </View>
              </View>

              <View style={styles.detailsList}>
                {/* Date & Time */}
                <View style={styles.detailItemRow}>
                  <View style={[styles.detailIconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <Calendar size={15} color="#2563EB" strokeWidth={2.2} />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={styles.detailMicroLabel}>Date & Time</Text>
                    <Text style={styles.detailMainValue}>
                      {formatDisplayDate(selectedDate)}
                      <Text style={styles.pipeSeparator}> | </Text>
                      {selectedTime || '10:00 AM'}
                    </Text>
                  </View>
                </View>

                {/* Duration */}
                <View style={styles.detailItemRow}>
                  <View style={[styles.detailIconCircle, { backgroundColor: '#E0F2FE' }]}>
                    <Clock size={15} color="#0284C7" strokeWidth={2.2} />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={styles.detailMicroLabel}>Duration</Text>
                    <Text style={styles.detailMainValue}>
                      {selectedDuration?.label || '4 Hours'}
                    </Text>
                  </View>
                </View>

                {/* Pickup Location */}
                <View style={styles.detailItemRow}>
                  <View style={[styles.detailIconCircle, { backgroundColor: '#E6FAF6' }]}>
                    <MapPin size={15} color="#00D2B4" fill="#00D2B4" strokeWidth={1} />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={styles.detailMicroLabel}>Pickup Location</Text>
                    <Text style={styles.detailMainValue} numberOfLines={2}>
                      {pickupLocation || '123, Anna Nagar, Coimbatore'}
                    </Text>
                  </View>
                </View>

                {/* Drop Location */}
                <View style={styles.detailItemRow}>
                  <View style={[styles.detailIconCircle, { backgroundColor: '#FEE2E2' }]}>
                    <MapPin size={15} color="#EF4444" fill="#EF4444" strokeWidth={1} />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={styles.detailMicroLabel}>
                      Drop Location (Optional)
                    </Text>
                    <Text style={styles.detailMainValue} numberOfLines={2}>
                      {dropLocation || 'RS Puram, Coimbatore'}
                    </Text>
                  </View>
                </View>

                {/* Estimated Fare */}
                <View style={styles.detailItemRow}>
                  <View style={[styles.detailIconCircle, { backgroundColor: '#F1F5F9' }]}>
                    <Car size={15} color="#0E1E38" strokeWidth={2.2} />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={styles.detailMicroLabel}>Estimated Fare</Text>
                    <View style={styles.fareRowInline}>
                      <Text style={styles.detailMainValue}>
                        ₹ {estimatedFare.toLocaleString('en-IN')}
                      </Text>
                      <Info size={13} color="#64748B" strokeWidth={2.2} />
                    </View>
                  </View>
                </View>

                {/* Payment Method */}
                <View style={styles.detailItemRow}>
                  <View style={[styles.detailIconCircle, { backgroundColor: '#F1F5F9' }]}>
                    <CreditCard size={15} color="#0E1E38" strokeWidth={2.2} />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={styles.detailMicroLabel}>Payment Method</Text>
                    <View style={styles.paymentMethodInline}>
                      <View style={styles.visaBadgeMini}>
                        <Text style={styles.visaMiniText}>VISA</Text>
                      </View>
                      <View>
                        <Text style={styles.detailMainValue}>•••• 4242</Text>
                        <Text style={styles.cardHolderSubtext}>John Doe</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* 3. What's Next? Info Box */}
            <View style={styles.whatsNextCard}>
              <View style={styles.whatsNextHeader}>
                <Info size={16} color="#0284C7" strokeWidth={2.4} />
                <Text style={styles.whatsNextTitle}>What's Next?</Text>
              </View>
              <Text style={styles.whatsNextBody}>
                We will assign a professional driver closer to your pickup time.
                You will receive a notification with driver details.
              </Text>
            </View>

            {/* 4. 3-Feature Highlights Row */}
            <View style={styles.featuresRow}>
              {/* Feature 1 */}
              <View style={styles.featureColumn}>
                <View style={styles.featureIconCircle}>
                  <Bell size={18} color="#00D2B4" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureText}>Get Real-time{'\n'}Updates</Text>
              </View>

              <View style={styles.featureDivider} />

              {/* Feature 2 */}
              <View style={styles.featureColumn}>
                <View style={styles.featureIconCircle}>
                  <ShieldCheck size={18} color="#00D2B4" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureText}>Track Your{'\n'}Driver</Text>
              </View>

              <View style={styles.featureDivider} />

              {/* Feature 3 */}
              <View style={styles.featureColumn}>
                <View style={styles.featureIconCircle}>
                  <Phone size={18} color="#00D2B4" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureText}>24/7{'\n'}Support</Text>
              </View>
            </View>
          </ScrollView>

          {/* Pinned Bottom CTA Actions */}
          <View style={styles.bottomCtaContainer}>
            {/* Primary Button: Go to Home */}
            <TouchableOpacity
              style={styles.primaryButtonWrapper}
              activeOpacity={0.88}
              onPress={handleGoHome}
            >
              <LinearGradient
                colors={['#00E5C4', '#00D2B4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Go to Home</Text>
                <ArrowRight size={18} color="#072038" strokeWidth={2.6} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Secondary Button: View Booking Details */}
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
              onPress={handleViewDetails}
            >
              <Text style={styles.secondaryButtonText}>View Booking Details</Text>
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
  topBrandHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  checkmarkWrapper: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  burstDash: {
    position: 'absolute',
    width: 4,
    height: 8,
    borderRadius: 2,
  },
  burstDash1: {
    top: 6,
    left: 20,
    transform: [{ rotate: '-40deg' }],
    backgroundColor: '#00D2B4',
  },
  burstDash2: {
    top: 6,
    right: 20,
    transform: [{ rotate: '40deg' }],
    backgroundColor: '#00D2B4',
  },
  burstDash3: {
    top: 24,
    right: 6,
    transform: [{ rotate: '70deg' }],
    backgroundColor: '#FBBF24',
  },
  burstDash4: {
    bottom: 24,
    right: 8,
    transform: [{ rotate: '120deg' }],
    backgroundColor: '#3B82F6',
  },
  burstDash5: {
    bottom: 24,
    left: 8,
    transform: [{ rotate: '-120deg' }],
    backgroundColor: '#00D2B4',
  },
  burstDash6: {
    top: 24,
    left: 6,
    transform: [{ rotate: '-70deg' }],
    backgroundColor: '#FBBF24',
  },
  outerMintCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerTealCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00D2B4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmedTitle: {
    fontFamily: FONT.bold,
    fontSize: 23,
    color: '#0E1E38',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  confirmedSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  bookingIdPill: {
    backgroundColor: '#F0FDF9',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 22,
    alignItems: 'center',
    marginTop: 12,
  },
  bookingIdLabel: {
    fontFamily: FONT.medium,
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 2,
  },
  bookingIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingIdValue: {
    fontFamily: FONT.bold,
    fontSize: 15.5,
    color: '#0E1E38',
    letterSpacing: 0.5,
  },
  copiedToast: {
    fontFamily: FONT.semiBold,
    fontSize: 10,
    color: '#00D2B4',
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  detailsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  detailsCardTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: '#0E1E38',
  },
  scheduledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  scheduledBadgeText: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#2563EB',
  },
  detailsList: {
    gap: 12,
  },
  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  detailIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  detailTextWrapper: {
    flex: 1,
  },
  detailMicroLabel: {
    fontFamily: FONT.medium,
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 1,
  },
  detailMainValue: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#0E1E38',
  },
  pipeSeparator: {
    color: '#CBD5E1',
    fontWeight: 'normal',
  },
  fareRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  paymentMethodInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  visaBadgeMini: {
    width: 38,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visaMiniText: {
    fontFamily: FONT.bold,
    fontSize: 10,
    color: '#1A1F71',
    letterSpacing: 0.5,
  },
  cardHolderSubtext: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: '#64748B',
  },
  whatsNextCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    padding: 13,
    marginBottom: 12,
  },
  whatsNextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  whatsNextTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#0E1E38',
  },
  whatsNextBody: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  featureColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontFamily: FONT.semiBold,
    fontSize: 10.5,
    color: '#0E1E38',
    textAlign: 'center',
    lineHeight: 13.5,
  },
  featureDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
  },
  bottomCtaContainer: {
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  primaryButtonWrapper: {
    width: '100%',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontFamily: FONT.bold,
    fontSize: 15.5,
    color: '#072038',
    letterSpacing: -0.2,
  },
  secondaryButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0E1E38',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#0E1E38',
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
