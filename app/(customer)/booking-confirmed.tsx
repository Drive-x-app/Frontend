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

export default function BookingConfirmedScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktopOrTablet =
    windowWidth > 600 ||
    (Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth > 600);

  // Zustand State
  const pickupLocation = useBookingStore((state) => state.pickupLocation);
  const dropLocation = useBookingStore((state) => state.dropLocation);
  const selectedDurationId = useBookingStore((state) => state.selectedDurationId);
  const selectedDate = useBookingStore((state) => state.selectedDate);
  const selectedTime = useBookingStore((state) => state.selectedTime);

  const selectedDuration =
    DURATION_OPTIONS.find((d) => d.id === selectedDurationId) ||
    DURATION_OPTIONS[0]; // Default 1 hour if not matched

  const hourlyRate = 300;
  const durationHours = selectedDuration?.hours || 1;
  const estimatedFare = durationHours * hourlyRate;

  const bookingId = 'DXB126789';
  const [copied, setCopied] = useState(false);

  // Format Date string: "2026-10-29" -> "Thu, 29 Oct 2026"
  const formatDisplayDate = (dateStr: string) => {
    try {
      if (!dateStr || !dateStr.includes('-')) return 'Thu, 29 Oct 2026';
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
      return 'Thu, 29 Oct 2026';
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
    router.replace('/(customer)/trip-history');
  };

  // =========================================================================
  // DESKTOP & TABLET VIEW (Matching Reference Mockup Layout)
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

                {/* 2. Success Checkmark Hero */}
                <View style={styles.dtHeroSection}>
                  <View style={styles.dtCheckmarkWrapper}>
                    <View style={styles.dtOuterMintCircle}>
                      <View style={styles.dtInnerTealCircle}>
                        <Check size={36} color="#FFFFFF" strokeWidth={3.5} />
                      </View>
                    </View>
                  </View>

                  <Text style={styles.dtConfirmedTitle}>Booking Confirmed!</Text>
                  <Text style={styles.dtConfirmedSubtitle}>
                    Your driver will be assigned soon.
                  </Text>

                  {/* Booking ID Pill */}
                  <TouchableOpacity
                    style={styles.dtBookingIdPill}
                    activeOpacity={0.75}
                    onPress={handleCopyId}
                    accessibilityLabel="Copy Booking ID"
                  >
                    <Text style={styles.dtBookingIdLabel}>Booking ID</Text>
                    <View style={styles.dtBookingIdRow}>
                      <Text style={styles.dtBookingIdValue}>{bookingId}</Text>
                      <Copy size={14} color="#0E1E38" strokeWidth={2.2} />
                    </View>
                    {copied && <Text style={styles.dtCopiedToast}>Copied to clipboard!</Text>}
                  </TouchableOpacity>
                </View>

                {/* 3. Two-Column Grid: Details & What's Next */}
                <View style={styles.dtContentGrid}>
                  {/* Left Column: Booking Details Card */}
                  <View style={styles.dtDetailsCard}>
                    <View style={styles.dtDetailsCardHeader}>
                      <Text style={styles.dtDetailsCardTitle}>Booking Details</Text>
                      <View style={styles.dtScheduledBadge}>
                        <Calendar size={12} color="#2563EB" strokeWidth={2.2} />
                        <Text style={styles.dtScheduledBadgeText}>Scheduled</Text>
                      </View>
                    </View>

                    <View style={styles.dtDetailsList}>
                      {/* Date & Time */}
                      <View style={styles.dtDetailItemRow}>
                        <View style={[styles.dtDetailIconCircle, { backgroundColor: '#EFF6FF' }]}>
                          <Calendar size={16} color="#2563EB" strokeWidth={2.2} />
                        </View>
                        <View style={styles.dtDetailTextWrapper}>
                          <Text style={styles.dtDetailMicroLabel}>Date & Time</Text>
                          <Text style={styles.dtDetailMainValue}>
                            {formatDisplayDate(selectedDate)}
                            <Text style={styles.dtPipeSeparator}> | </Text>
                            {selectedTime || '10:00 AM'}
                          </Text>
                        </View>
                      </View>

                      {/* Duration */}
                      <View style={styles.dtDetailItemRow}>
                        <View style={[styles.dtDetailIconCircle, { backgroundColor: '#E0F2FE' }]}>
                          <Clock size={16} color="#0284C7" strokeWidth={2.2} />
                        </View>
                        <View style={styles.dtDetailTextWrapper}>
                          <Text style={styles.dtDetailMicroLabel}>Duration</Text>
                          <Text style={styles.dtDetailMainValue}>
                            {selectedDuration?.label || '1 Hour'}
                          </Text>
                        </View>
                      </View>

                      {/* Pickup Location */}
                      <View style={styles.dtDetailItemRow}>
                        <View style={[styles.dtDetailIconCircle, { backgroundColor: '#E6FAF6' }]}>
                          <MapPin size={16} color="#00D2B4" fill="#00D2B4" strokeWidth={1} />
                        </View>
                        <View style={styles.dtDetailTextWrapper}>
                          <Text style={styles.dtDetailMicroLabel}>Pickup Location</Text>
                          <Text style={styles.dtDetailMainValue} numberOfLines={2}>
                            {pickupLocation || 'Pickup location'}
                          </Text>
                        </View>
                      </View>

                      {/* Drop Location */}
                      <View style={styles.dtDetailItemRow}>
                        <View style={[styles.dtDetailIconCircle, { backgroundColor: '#FEE2E2' }]}>
                          <MapPin size={16} color="#EF4444" fill="#EF4444" strokeWidth={1} />
                        </View>
                        <View style={styles.dtDetailTextWrapper}>
                          <Text style={styles.dtDetailMicroLabel}>Drop Location (Optional)</Text>
                          <Text style={styles.dtDetailMainValue} numberOfLines={2}>
                            {dropLocation || 'Not specified'}
                          </Text>
                        </View>
                      </View>

                      {/* Total Fare */}
                      <View style={styles.dtDetailItemRow}>
                        <View style={[styles.dtDetailIconCircle, { backgroundColor: '#F1F5F9' }]}>
                          <Car size={16} color="#0E1E38" strokeWidth={2.2} />
                        </View>
                        <View style={styles.dtDetailTextWrapper}>
                          <Text style={styles.dtDetailMicroLabel}>Total Fare</Text>
                          <View style={styles.dtFareRowInline}>
                            <Text style={styles.dtDetailMainValue}>
                              ₹ {estimatedFare.toLocaleString('en-IN')}
                            </Text>
                            <Info size={13} color="#64748B" strokeWidth={2.2} />
                          </View>
                        </View>
                      </View>

                      {/* Payment Method */}
                      <View style={styles.dtDetailItemRow}>
                        <View style={[styles.dtDetailIconCircle, { backgroundColor: '#F1F5F9' }]}>
                          <CreditCard size={16} color="#0E1E38" strokeWidth={2.2} />
                        </View>
                        <View style={styles.dtDetailTextWrapper}>
                          <Text style={styles.dtDetailMicroLabel}>Payment Method</Text>
                          <View style={styles.dtPaymentMethodInline}>
                            <View style={styles.dtVisaBadgeMini}>
                              <Text style={styles.dtVisaMiniText}>VISA</Text>
                            </View>
                            <View>
                              <Text style={styles.dtDetailMainValue}>•••• 4242</Text>
                              <Text style={styles.dtCardHolderSubtext}>John Doe</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Right Column: Next Steps & Feature Perks */}
                  <View style={styles.dtRightColumn}>
                    {/* What's Next Box */}
                    <View style={styles.dtWhatsNextCard}>
                      <View style={styles.dtWhatsNextHeader}>
                        <Info size={18} color="#0284C7" strokeWidth={2.4} />
                        <Text style={styles.dtWhatsNextTitle}>What's Next?</Text>
                      </View>
                      <Text style={styles.dtWhatsNextBody}>
                        We will assign a professional driver closer to your pickup time.
                        You will receive real-time notifications with full driver details and contact information.
                      </Text>
                    </View>

                    {/* Features Highlights Box */}
                    <View style={styles.dtFeaturesBox}>
                      <View style={styles.dtFeatureItem}>
                        <View style={styles.dtFeatureIconCircle}>
                          <Bell size={18} color="#00D2B4" strokeWidth={2.2} />
                        </View>
                        <View style={styles.dtFeatureTextWrap}>
                          <Text style={styles.dtFeatureItemTitle}>Real-time Updates</Text>
                          <Text style={styles.dtFeatureItemSubtitle}>Instant SMS & app alerts on driver status</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.dtFeatureItem}
                        activeOpacity={0.8}
                        onPress={() => router.push('/(customer)/track-driver')}
                      >
                        <View style={styles.dtFeatureIconCircle}>
                          <ShieldCheck size={18} color="#00D2B4" strokeWidth={2.2} />
                        </View>
                        <View style={styles.dtFeatureTextWrap}>
                          <Text style={styles.dtFeatureItemTitle}>Track Your Driver</Text>
                          <Text style={styles.dtFeatureItemSubtitle}>Live GPS tracking when driver is en route</Text>
                        </View>
                      </TouchableOpacity>

                      <View style={styles.dtFeatureItem}>
                        <View style={styles.dtFeatureIconCircle}>
                          <Phone size={18} color="#00D2B4" strokeWidth={2.2} />
                        </View>
                        <View style={styles.dtFeatureTextWrap}>
                          <Text style={styles.dtFeatureItemTitle}>24/7 Priority Support</Text>
                          <Text style={styles.dtFeatureItemSubtitle}>Dedicated assistance whenever you need help</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* 4. Bottom Action Buttons */}
                <View style={styles.dtActionsRow}>
                  <TouchableOpacity
                    style={styles.dtSecondaryBtn}
                    activeOpacity={0.8}
                    onPress={handleViewDetails}
                  >
                    <Text style={styles.dtSecondaryBtnText}>View Trip History</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dtPrimaryBtn}
                    activeOpacity={0.88}
                    onPress={handleGoHome}
                  >
                    <Text style={styles.dtPrimaryBtnText}>Go to Home</Text>
                    <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>
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

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Centered Top Brand Header */}
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
            <View style={styles.checkmarkWrapper}>
              <View style={[styles.burstDash, styles.burstDash1]} />
              <View style={[styles.burstDash, styles.burstDash2]} />
              <View style={[styles.burstDash, styles.burstDash3]} />
              <View style={[styles.burstDash, styles.burstDash4]} />
              <View style={[styles.burstDash, styles.burstDash5]} />
              <View style={[styles.burstDash, styles.burstDash6]} />

              <View style={styles.outerMintCircle}>
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
                    {selectedDuration?.label || '1 Hour'}
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
                    {pickupLocation || 'Pickup location'}
                  </Text>
                </View>
              </View>

              {/* Drop Location */}
              <View style={styles.detailItemRow}>
                <View style={[styles.detailIconCircle, { backgroundColor: '#FEE2E2' }]}>
                  <MapPin size={15} color="#EF4444" fill="#EF4444" strokeWidth={1} />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={styles.detailMicroLabel}>Drop Location (Optional)</Text>
                  <Text style={styles.detailMainValue} numberOfLines={2}>
                    {dropLocation || 'Not specified'}
                  </Text>
                </View>
              </View>

              {/* Total Fare */}
              <View style={styles.detailItemRow}>
                <View style={[styles.detailIconCircle, { backgroundColor: '#F1F5F9' }]}>
                  <Car size={15} color="#0E1E38" strokeWidth={2.2} />
                </View>
                <View style={styles.detailTextWrapper}>
                  <Text style={styles.detailMicroLabel}>Total Fare</Text>
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
            <View style={styles.featureColumn}>
              <View style={styles.featureIconCircle}>
                <Bell size={18} color="#00D2B4" strokeWidth={2.2} />
              </View>
              <Text style={styles.featureText}>Get Real-time{'\n'}Updates</Text>
            </View>

            <View style={styles.featureDivider} />

            <TouchableOpacity
              style={styles.featureColumn}
              activeOpacity={0.8}
              onPress={() => router.push('/(customer)/track-driver')}
            >
              <View style={styles.featureIconCircle}>
                <ShieldCheck size={18} color="#00D2B4" strokeWidth={2.2} />
              </View>
              <Text style={styles.featureText}>Track Your{'\n'}Driver</Text>
            </TouchableOpacity>

            <View style={styles.featureDivider} />

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

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={handleViewDetails}
          >
            <Text style={styles.secondaryButtonText}>View Trip History</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  // =========================================================================
  // DESKTOP SPECIFIC STYLES
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
    justifyContent: 'center',
    marginBottom: 20,
  },
  dtBrandCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dtLogoEmblem: {
    width: 34,
    height: 22,
  },
  brandTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextNavy: {
    fontFamily: FONT.bold,
    fontSize: 20,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  brandTextTeal: {
    fontFamily: FONT.bold,
    fontSize: 20,
    color: '#00D2B4',
    letterSpacing: -0.4,
  },

  /* Desktop Hero Checkmark Section */
  dtHeroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  dtCheckmarkWrapper: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dtOuterMintCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dtInnerTealCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00D2B4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  dtConfirmedTitle: {
    fontFamily: FONT.bold,
    fontSize: 26,
    color: '#0E1E38',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  dtConfirmedSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 14.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  dtBookingIdPill: {
    backgroundColor: '#F0FDF9',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 14,
    paddingVertical: 9,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 14,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtBookingIdLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  dtBookingIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dtBookingIdValue: {
    fontFamily: FONT.bold,
    fontSize: 17,
    color: '#0E1E38',
    letterSpacing: 0.5,
  },
  dtCopiedToast: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#00D2B4',
    marginTop: 3,
  },

  /* 2-Column Desktop Grid */
  dtContentGrid: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 28,
  },
  dtDetailsCard: {
    flex: 1.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    padding: 20,
  },
  dtDetailsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  dtDetailsCardTitle: {
    fontFamily: FONT.bold,
    fontSize: 15.5,
    color: '#0E1E38',
  },
  dtScheduledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dtScheduledBadgeText: {
    fontFamily: FONT.semiBold,
    fontSize: 11.5,
    color: '#2563EB',
  },
  dtDetailsList: {
    gap: 14,
  },
  dtDetailItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dtDetailIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  dtDetailTextWrapper: {
    flex: 1,
  },
  dtDetailMicroLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  dtDetailMainValue: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    color: '#0E1E38',
  },
  dtPipeSeparator: {
    color: '#CBD5E1',
    fontWeight: 'normal',
  },
  dtFareRowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dtPaymentMethodInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  dtVisaBadgeMini: {
    width: 40,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dtVisaMiniText: {
    fontFamily: FONT.bold,
    fontSize: 10.5,
    color: '#1A1F71',
    letterSpacing: 0.5,
  },
  dtCardHolderSubtext: {
    fontFamily: FONT.regular,
    fontSize: 10.5,
    color: '#64748B',
  },

  /* Right Column */
  dtRightColumn: {
    flex: 1,
    gap: 16,
  },
  dtWhatsNextCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 18,
  },
  dtWhatsNextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dtWhatsNextTitle: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#0E1E38',
  },
  dtWhatsNextBody: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: '#0369A1',
    lineHeight: 18,
  },
  dtFeaturesBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    padding: 18,
    gap: 16,
  },
  dtFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dtFeatureIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dtFeatureTextWrap: {
    flex: 1,
  },
  dtFeatureItemTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#0E1E38',
  },
  dtFeatureItemSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },

  /* Bottom Actions Row */
  dtActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 24,
  },
  dtSecondaryBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtSecondaryBtnText: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
  },
  dtPrimaryBtn: {
    backgroundColor: '#00D2B4',
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 36,
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtPrimaryBtnText: {
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
    display: 'flex',
    flexDirection: 'column',
  },
  topBrandHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
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
});
