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
  ArrowLeft,
  Pencil,
  MapPin,
  Clock,
  Calendar,
  Info,
  Check,
  CreditCard,
  Landmark,
  ShieldCheck,
  ChevronRight,
  MoreVertical,
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

export default function ChoosePaymentScreen() {
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

  // Selected Payment Method State
  const [selectedMethod, setSelectedMethod] = useState<'visa' | 'mastercard' | 'upi' | 'card' | 'netbanking'>('visa');

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
      router.replace('/(customer)/booking-summary');
    }
  };

  const handleEditSummary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push('/(customer)/booking-summary');
  };

  const handleSelectMethod = (method: 'visa' | 'mastercard' | 'upi' | 'card' | 'netbanking') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedMethod(method);
  };

  const handlePay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    router.push('/(customer)/booking-confirmed');
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
            <Text style={styles.pageTitle}>Choose Payment Method</Text>
            <Text style={styles.pageSubtitle}>
              Make a secure payment to confirm your booking.
            </Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Booking Summary Compact Card */}
            <View style={styles.cardContainer}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardHeaderTitle}>Booking Summary</Text>
                <TouchableOpacity
                  style={styles.editPillButton}
                  activeOpacity={0.75}
                  onPress={handleEditSummary}
                >
                  <Pencil size={11} color="#0284C7" strokeWidth={2.2} />
                  <Text style={styles.editPillText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.summaryDetailsList}>
                {/* Date & Time Row */}
                <View style={styles.summaryItemRow}>
                  <Calendar size={15} color="#0E1E38" strokeWidth={2.2} />
                  <Text style={styles.summaryItemText}>
                    {formatDisplayDate(selectedDate)}
                    <Text style={styles.summaryPipe}> | </Text>
                    {selectedTime || '10:00 AM'}
                  </Text>
                </View>

                {/* Duration Row */}
                <View style={styles.summaryItemRow}>
                  <Clock size={15} color="#64748B" strokeWidth={2.2} />
                  <Text style={styles.summaryItemText}>
                    {selectedDuration?.label || '4 Hours'}
                  </Text>
                </View>

                {/* Pickup Location Row */}
                <View style={styles.summaryItemRow}>
                  <MapPin size={15} color="#00D2B4" fill="#00D2B4" strokeWidth={1} />
                  <Text style={styles.summaryItemText} numberOfLines={1}>
                    {pickupLocation || '123, Anna Nagar, Coimbatore'}
                  </Text>
                </View>

                {/* Vertical Dotted Line */}
                <View style={styles.dottedConnectorContainer}>
                  <View style={styles.dottedDot} />
                  <View style={styles.dottedDot} />
                </View>

                {/* Drop Location Row */}
                <View style={styles.summaryItemRow}>
                  <MapPin size={15} color="#EF4444" fill="#EF4444" strokeWidth={1} />
                  <Text style={styles.summaryItemText} numberOfLines={1}>
                    {dropLocation || 'RS Puram, Coimbatore'}
                    <Text style={styles.optionalGrayText}> (Optional)</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* 2. Total Amount & Booking Includes Card */}
            <View style={styles.amountIncludesCard}>
              {/* Left Column: Total Amount */}
              <View style={styles.amountColumn}>
                <Text style={styles.amountHeaderLabel}>Total Amount</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceAmountText}>
                    ₹ {estimatedFare.toLocaleString('en-IN')}
                  </Text>
                  <Info size={14} color="#64748B" strokeWidth={2.2} />
                </View>
                <Text style={styles.fareFormulaText}>
                  (₹ {hourlyRate} per hour × {durationHours} hours)
                </Text>
              </View>

              {/* Right Column: Booking Includes */}
              <View style={styles.includesColumn}>
                <Text style={styles.includesHeaderLabel}>Booking Includes</Text>
                <View style={styles.includesList}>
                  <View style={styles.includesRow}>
                    <Check size={11} color="#00D2B4" strokeWidth={2.6} />
                    <Text style={styles.includesText}>Professional driver service</Text>
                  </View>
                  <View style={styles.includesRow}>
                    <Check size={11} color="#00D2B4" strokeWidth={2.6} />
                    <Text style={styles.includesText}>Selected booking duration</Text>
                  </View>
                  <View style={styles.includesRow}>
                    <Check size={11} color="#00D2B4" strokeWidth={2.6} />
                    <Text style={styles.includesText}>Pickup at the selected location</Text>
                  </View>
                  <View style={styles.includesRow}>
                    <Check size={11} color="#00D2B4" strokeWidth={2.6} />
                    <Text style={styles.includesText}>Optional drop location, if provided</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 3. Saved Payment Methods Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Saved Payment Methods</Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.addNewButton}>
                <Text style={styles.addNewText}>+ Add New</Text>
              </TouchableOpacity>
            </View>

            {/* VISA Option Card */}
            <TouchableOpacity
              style={styles.paymentMethodCard}
              activeOpacity={0.8}
              onPress={() => handleSelectMethod('visa')}
            >
              {/* Radio Indicator */}
              <View style={styles.radioOuter}>
                {selectedMethod === 'visa' ? (
                  <View style={styles.radioInnerSelected} />
                ) : null}
              </View>

              {/* VISA Badge */}
              <View style={styles.cardLogoBadge}>
                <Text style={styles.visaText}>VISA</Text>
              </View>

              {/* Card Details */}
              <View style={styles.paymentDetailsWrapper}>
                <Text style={styles.cardNumberText}>•••• 4242</Text>
                <Text style={styles.cardHolderText}>John Doe</Text>
              </View>

              {/* Three dots options */}
              <TouchableOpacity
                style={styles.moreOptionsButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MoreVertical size={16} color="#94A3B8" />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* MasterCard Option Card */}
            <TouchableOpacity
              style={styles.paymentMethodCard}
              activeOpacity={0.8}
              onPress={() => handleSelectMethod('mastercard')}
            >
              {/* Radio Indicator */}
              <View style={styles.radioOuter}>
                {selectedMethod === 'mastercard' ? (
                  <View style={styles.radioInnerSelected} />
                ) : null}
              </View>

              {/* MasterCard Overlapping Circles Logo */}
              <View style={styles.cardLogoBadge}>
                <View style={styles.mcCirclesContainer}>
                  <View style={styles.mcCircleRed} />
                  <View style={styles.mcCircleOrange} />
                </View>
              </View>

              {/* Card Details */}
              <View style={styles.paymentDetailsWrapper}>
                <Text style={styles.cardNumberText}>•••• 5678</Text>
                <Text style={styles.cardHolderText}>John Doe</Text>
              </View>

              {/* Three dots options */}
              <TouchableOpacity
                style={styles.moreOptionsButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MoreVertical size={16} color="#94A3B8" />
              </TouchableOpacity>
            </TouchableOpacity>

            {/* 4. Other Payment Options Section */}
            <Text style={styles.otherOptionsTitle}>Other Payment Options</Text>

            {/* UPI Option */}
            <TouchableOpacity
              style={styles.otherOptionCard}
              activeOpacity={0.8}
              onPress={() => handleSelectMethod('upi')}
            >
              <View style={styles.radioOuter}>
                {selectedMethod === 'upi' ? (
                  <View style={styles.radioInnerSelected} />
                ) : null}
              </View>

              <View style={styles.upiBadge}>
                <Text style={styles.upiText}>UPI</Text>
              </View>

              <Text style={styles.otherOptionLabel}>UPI</Text>
              <ChevronRight size={17} color="#94A3B8" strokeWidth={2.2} />
            </TouchableOpacity>

            {/* Credit / Debit Card Option */}
            <TouchableOpacity
              style={styles.otherOptionCard}
              activeOpacity={0.8}
              onPress={() => handleSelectMethod('card')}
            >
              <View style={styles.radioOuter}>
                {selectedMethod === 'card' ? (
                  <View style={styles.radioInnerSelected} />
                ) : null}
              </View>

              <View style={styles.cardIconBadge}>
                <CreditCard size={18} color="#0E1E38" strokeWidth={2} />
              </View>

              <Text style={styles.otherOptionLabel}>Credit / Debit Card</Text>
              <ChevronRight size={17} color="#94A3B8" strokeWidth={2.2} />
            </TouchableOpacity>

            {/* Net Banking Option */}
            <TouchableOpacity
              style={styles.otherOptionCard}
              activeOpacity={0.8}
              onPress={() => handleSelectMethod('netbanking')}
            >
              <View style={styles.radioOuter}>
                {selectedMethod === 'netbanking' ? (
                  <View style={styles.radioInnerSelected} />
                ) : null}
              </View>

              <View style={styles.cardIconBadge}>
                <Landmark size={18} color="#0E1E38" strokeWidth={2} />
              </View>

              <Text style={styles.otherOptionLabel}>Net Banking</Text>
              <ChevronRight size={17} color="#94A3B8" strokeWidth={2.2} />
            </TouchableOpacity>

            {/* 5. Secure Payment Card */}
            <View style={styles.secureCard}>
              <ShieldCheck size={18} color="#0284C7" strokeWidth={2.2} />
              <View style={styles.secureTextWrapper}>
                <Text style={styles.secureTitle}>Secure Payment</Text>
                <Text style={styles.secureSubtitle}>
                  Your payment information is encrypted and secure. We do not store your card details.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Pinned Bottom CTA Container */}
          <View style={styles.bottomCtaContainer}>
            <TouchableOpacity
              style={styles.payButtonWrapper}
              activeOpacity={0.88}
              onPress={handlePay}
            >
              <LinearGradient
                colors={['#00E5C4', '#00D2B4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.payButton}
              >
                <Text style={styles.payButtonText}>
                  Pay ₹ {estimatedFare.toLocaleString('en-IN')}
                </Text>
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardHeaderTitle: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
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
  summaryDetailsList: {
    gap: 7,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryItemText: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#0E1E38',
  },
  summaryPipe: {
    color: '#CBD5E1',
    fontWeight: 'normal',
  },
  optionalGrayText: {
    fontFamily: FONT.regular,
    color: '#64748B',
    fontSize: 11,
  },
  dottedConnectorContainer: {
    marginLeft: 7,
    height: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: -2,
  },
  dottedDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#94A3B8',
  },
  amountIncludesCard: {
    backgroundColor: '#F2FCF9',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#CCFBF1',
    padding: 13,
    flexDirection: 'row',
    marginBottom: 14,
  },
  amountColumn: {
    flex: 1.05,
    paddingRight: 10,
  },
  amountHeaderLabel: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: '#0D9488',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  priceAmountText: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: '#0E1E38',
  },
  fareFormulaText: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: '#64748B',
  },
  includesColumn: {
    flex: 1.2,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
    paddingLeft: 12,
  },
  includesHeaderLabel: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: '#0D9488',
    marginBottom: 6,
  },
  includesList: {
    gap: 4,
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
  addNewButton: {
    paddingVertical: 2,
  },
  addNewText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#0284C7',
  },
  paymentMethodCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: '#00D2B4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInnerSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00D2B4',
  },
  cardLogoBadge: {
    width: 46,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  visaText: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#1A1F71',
    letterSpacing: 0.5,
  },
  mcCirclesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 26,
    height: 18,
    justifyContent: 'center',
  },
  mcCircleRed: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EB001B',
    marginRight: -7,
  },
  mcCircleOrange: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F79E1B',
    opacity: 0.9,
  },
  paymentDetailsWrapper: {
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
  moreOptionsButton: {
    padding: 4,
  },
  otherOptionsTitle: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#0E1E38',
    marginTop: 12,
    marginBottom: 8,
  },
  otherOptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  upiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginRight: 12,
  },
  upiText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: '#0E1E38',
    letterSpacing: 0.5,
  },
  cardIconBadge: {
    width: 32,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  otherOptionLabel: {
    flex: 1,
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: '#0E1E38',
  },
  secureCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  secureTextWrapper: {
    flex: 1,
  },
  secureTitle: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: '#0E1E38',
  },
  secureSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: '#64748B',
    lineHeight: 13.5,
    marginTop: 1,
  },
  bottomCtaContainer: {
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  payButtonWrapper: {
    width: '100%',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
  },
  payButton: {
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payButtonText: {
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
