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

export default function ChoosePaymentScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
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
    DURATION_OPTIONS[0]; // Default 1 hour

  const hourlyRate = 300;
  const durationHours = selectedDuration?.hours || 1;
  const estimatedFare = durationHours * hourlyRate;

  // Selected Payment Method State
  const [selectedMethod, setSelectedMethod] = useState<'visa' | 'mastercard' | 'upi' | 'card' | 'netbanking'>('visa');

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
                {/* 1. Header Row: Title & Subtitle */}
                <View style={styles.dtCardHeaderRow}>
                  <View style={styles.dtTitleColumn}>
                    <Text style={styles.dtPageTitle}>Choose Payment Method</Text>
                    <Text style={styles.dtPageSubtitle}>
                      Make a secure payment to confirm your booking.
                    </Text>
                  </View>
                </View>

                {/* 2. Compact Booking Summary Card */}
                <View style={styles.dtSummaryCompactCard}>
                  <View style={styles.dtSummaryCompactHeader}>
                    <Text style={styles.dtSummaryCompactTitle}>Booking Summary</Text>
                    <TouchableOpacity
                      style={styles.dtSummaryEditBtn}
                      activeOpacity={0.75}
                      onPress={handleEditSummary}
                    >
                      <Pencil size={12} color="#0284C7" strokeWidth={2.4} />
                      <Text style={styles.dtSummaryEditText}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dtSummaryInfoGrid}>
                    <View style={styles.dtSummaryInfoItem}>
                      <Calendar size={15} color="#0E1E38" strokeWidth={2.2} />
                      <Text style={styles.dtSummaryInfoText}>
                        {formatDisplayDate(selectedDate)} | {selectedTime || '10:00 AM'}
                      </Text>
                    </View>

                    <View style={styles.dtSummaryInfoItem}>
                      <Clock size={15} color="#64748B" strokeWidth={2.2} />
                      <Text style={styles.dtSummaryInfoText}>
                        {selectedDuration.label}
                      </Text>
                    </View>

                    <View style={styles.dtSummaryInfoItem}>
                      <MapPin size={15} color="#00D2B4" fill="#00D2B4" strokeWidth={1} />
                      <Text style={styles.dtSummaryInfoText} numberOfLines={1}>
                        {pickupLocation || 'Pickup not specified'}
                      </Text>
                    </View>

                    <View style={styles.dtSummaryInfoItem}>
                      <MapPin size={15} color="#EF4444" fill="#EF4444" strokeWidth={1} />
                      <Text style={styles.dtSummaryInfoText} numberOfLines={1}>
                        {dropLocation ? (
                          <>
                            {dropLocation} <Text style={styles.optionalGrayText}>(Optional)</Text>
                          </>
                        ) : (
                          <Text style={styles.optionalGrayText}>No drop location specified (Optional)</Text>
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* Amount and Inclusions Row */}
                  <View style={styles.dtAmountIncludesSplit}>
                    {/* Total Amount */}
                    <View style={styles.dtAmountBlock}>
                      <Text style={styles.dtAmountMicroLabel}>Total Amount</Text>
                      <View style={styles.dtAmountValRow}>
                        <Text style={styles.dtAmountValText}>₹ {estimatedFare}</Text>
                        <Info size={14} color="#64748B" strokeWidth={2.2} />
                      </View>
                      <Text style={styles.dtAmountFormulaText}>
                        (₹ {hourlyRate} per hour × {durationHours} hour{durationHours > 1 ? 's' : ''})
                      </Text>
                    </View>

                    {/* Booking Includes */}
                    <View style={styles.dtIncludesBlock}>
                      <Text style={styles.dtIncludesMicroLabel}>Booking Includes</Text>
                      <View style={styles.dtIncludesCompactList}>
                        <View style={styles.dtIncludesCompactItem}>
                          <Check size={12} color="#00D2B4" strokeWidth={2.6} />
                          <Text style={styles.dtIncludesCompactText}>Professional driver service</Text>
                        </View>
                        <View style={styles.dtIncludesCompactItem}>
                          <Check size={12} color="#00D2B4" strokeWidth={2.6} />
                          <Text style={styles.dtIncludesCompactText}>Selected booking duration</Text>
                        </View>
                        <View style={styles.dtIncludesCompactItem}>
                          <Check size={12} color="#00D2B4" strokeWidth={2.6} />
                          <Text style={styles.dtIncludesCompactText}>Pickup at the selected location</Text>
                        </View>
                        <View style={styles.dtIncludesCompactItem}>
                          <Check size={12} color="#00D2B4" strokeWidth={2.6} />
                          <Text style={styles.dtIncludesCompactText}>Optional drop location, if provided</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* 3. Saved Payment Methods */}
                <View style={styles.dtSectionHeaderRow}>
                  <Text style={styles.dtSectionHeading}>Saved Payment Methods</Text>
                  <TouchableOpacity activeOpacity={0.7} style={styles.dtAddNewBtn}>
                    <Text style={styles.dtAddNewText}>+ Add New</Text>
                  </TouchableOpacity>
                </View>

                {/* VISA Card Option */}
                <TouchableOpacity
                  style={[
                    styles.dtPaymentCard,
                    selectedMethod === 'visa' && styles.dtPaymentCardSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSelectMethod('visa')}
                >
                  <View style={styles.dtRadioOuter}>
                    {selectedMethod === 'visa' ? <View style={styles.dtRadioInner} /> : null}
                  </View>
                  <View style={styles.dtVisaBadge}>
                    <Text style={styles.dtVisaText}>VISA</Text>
                  </View>
                  <View style={styles.dtCardDetails}>
                    <Text style={styles.dtCardNumberText}>•••• 4242</Text>
                    <Text style={styles.dtCardHolderText}>John Doe</Text>
                  </View>
                  <MoreVertical size={16} color="#94A3B8" />
                </TouchableOpacity>

                {/* MasterCard Option */}
                <TouchableOpacity
                  style={[
                    styles.dtPaymentCard,
                    selectedMethod === 'mastercard' && styles.dtPaymentCardSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSelectMethod('mastercard')}
                >
                  <View style={styles.dtRadioOuter}>
                    {selectedMethod === 'mastercard' ? <View style={styles.dtRadioInner} /> : null}
                  </View>
                  <View style={styles.dtMasterCardBadge}>
                    <View style={styles.mcCirclesContainer}>
                      <View style={styles.mcCircleRed} />
                      <View style={styles.mcCircleOrange} />
                    </View>
                  </View>
                  <View style={styles.dtCardDetails}>
                    <Text style={styles.dtCardNumberText}>•••• 5678</Text>
                    <Text style={styles.dtCardHolderText}>John Doe</Text>
                  </View>
                  <MoreVertical size={16} color="#94A3B8" />
                </TouchableOpacity>

                {/* 4. Other Payment Options */}
                <Text style={styles.dtOtherHeading}>Other Payment Options</Text>

                {/* UPI Option */}
                <TouchableOpacity
                  style={[
                    styles.dtOtherCard,
                    selectedMethod === 'upi' && styles.dtPaymentCardSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSelectMethod('upi')}
                >
                  <View style={styles.dtRadioOuter}>
                    {selectedMethod === 'upi' ? <View style={styles.dtRadioInner} /> : null}
                  </View>
                  <View style={styles.dtUpiBadge}>
                    <Text style={styles.dtUpiText}>UPI</Text>
                  </View>
                  <Text style={styles.dtOtherLabel}>UPI (Google Pay, PhonePe, Paytm)</Text>
                  <ChevronRight size={17} color="#94A3B8" strokeWidth={2.2} />
                </TouchableOpacity>

                {/* Credit / Debit Card Option */}
                <TouchableOpacity
                  style={[
                    styles.dtOtherCard,
                    selectedMethod === 'card' && styles.dtPaymentCardSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSelectMethod('card')}
                >
                  <View style={styles.dtRadioOuter}>
                    {selectedMethod === 'card' ? <View style={styles.dtRadioInner} /> : null}
                  </View>
                  <View style={styles.dtCardIconBadge}>
                    <CreditCard size={18} color="#0E1E38" strokeWidth={2} />
                  </View>
                  <Text style={styles.dtOtherLabel}>Credit / Debit Card</Text>
                  <ChevronRight size={17} color="#94A3B8" strokeWidth={2.2} />
                </TouchableOpacity>

                {/* Net Banking Option */}
                <TouchableOpacity
                  style={[
                    styles.dtOtherCard,
                    selectedMethod === 'netbanking' && styles.dtPaymentCardSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSelectMethod('netbanking')}
                >
                  <View style={styles.dtRadioOuter}>
                    {selectedMethod === 'netbanking' ? <View style={styles.dtRadioInner} /> : null}
                  </View>
                  <View style={styles.dtCardIconBadge}>
                    <Landmark size={18} color="#0E1E38" strokeWidth={2} />
                  </View>
                  <Text style={styles.dtOtherLabel}>Net Banking</Text>
                  <ChevronRight size={17} color="#94A3B8" strokeWidth={2.2} />
                </TouchableOpacity>

                {/* 5. Secure Payment Notice */}
                <View style={styles.dtSecureNotice}>
                  <ShieldCheck size={18} color="#0284C7" strokeWidth={2.2} />
                  <Text style={styles.dtSecureNoticeText}>
                    Your payment information is encrypted and secure. We do not store your card details.
                  </Text>
                </View>

                {/* 6. Pay Button */}
                <TouchableOpacity
                  style={styles.dtPayButton}
                  activeOpacity={0.88}
                  onPress={handlePay}
                  accessibilityLabel={`Pay ${estimatedFare}`}
                >
                  <Text style={styles.dtPayButtonText}>Pay ₹ {estimatedFare}</Text>
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
                    {pickupLocation || 'Pickup not specified'}
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
                    {dropLocation ? (
                      <>
                        {dropLocation}
                        <Text style={styles.optionalGrayText}> (Optional)</Text>
                      </>
                    ) : (
                      <Text style={styles.optionalGrayText}>No drop location specified (Optional)</Text>
                    )}
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
              <View style={styles.radioOuter}>
                {selectedMethod === 'visa' ? (
                  <View style={styles.radioInnerSelected} />
                ) : null}
              </View>

              <View style={styles.cardLogoBadge}>
                <Text style={styles.visaText}>VISA</Text>
              </View>

              <View style={styles.paymentDetailsWrapper}>
                <Text style={styles.cardNumberText}>•••• 4242</Text>
                <Text style={styles.cardHolderText}>John Doe</Text>
              </View>

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
              <View style={styles.radioOuter}>
                {selectedMethod === 'mastercard' ? (
                  <View style={styles.radioInnerSelected} />
                ) : null}
              </View>

              <View style={styles.cardLogoBadge}>
                <View style={styles.mcCirclesContainer}>
                  <View style={styles.mcCircleRed} />
                  <View style={styles.mcCircleOrange} />
                </View>
              </View>

              <View style={styles.paymentDetailsWrapper}>
                <Text style={styles.cardNumberText}>•••• 5678</Text>
                <Text style={styles.cardHolderText}>John Doe</Text>
              </View>

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

  /* Compact Summary Card */
  dtSummaryCompactCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  dtSummaryCompactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dtSummaryCompactTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: '#0E1E38',
  },
  dtSummaryEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtSummaryEditText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#0284C7',
  },
  dtSummaryInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  dtSummaryInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexBasis: '46%',
    flexGrow: 1,
  },
  dtSummaryInfoText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#1E293B',
    flex: 1,
  },
  dtAmountIncludesSplit: {
    flexDirection: 'row',
    backgroundColor: '#F0FCF9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    padding: 16,
    gap: 20,
  },
  dtAmountBlock: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#D1F4ED',
    paddingRight: 16,
  },
  dtAmountMicroLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#00A892',
    marginBottom: 2,
  },
  dtAmountValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  dtAmountValText: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: '#0E1E38',
  },
  dtAmountFormulaText: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#64748B',
  },
  dtIncludesBlock: {
    flex: 1.4,
  },
  dtIncludesMicroLabel: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: '#0F766E',
    marginBottom: 6,
  },
  dtIncludesCompactList: {
    gap: 5,
  },
  dtIncludesCompactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dtIncludesCompactText: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#334155',
  },

  /* Payment Section Header */
  dtSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dtSectionHeading: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: '#0E1E38',
  },
  dtAddNewBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtAddNewText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#0284C7',
  },

  /* Payment Cards */
  dtPaymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtPaymentCardSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#00D2B4',
    borderWidth: 1.5,
  },
  dtRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#00D2B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dtRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00D2B4',
  },
  dtVisaBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dtVisaText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#1E3A8A',
  },
  dtMasterCardBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dtCardDetails: {
    flex: 1,
  },
  dtCardNumberText: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
  },
  dtCardHolderText: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
  },

  /* Other Options */
  dtOtherHeading: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: '#0E1E38',
    marginTop: 14,
    marginBottom: 12,
  },
  dtOtherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtUpiBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dtUpiText: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#059669',
  },
  dtCardIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dtOtherLabel: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: 13.5,
    color: '#0E1E38',
  },

  /* Secure Notice */
  dtSecureNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 6,
    marginBottom: 24,
  },
  dtSecureNoticeText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#0369A1',
    flex: 1,
    lineHeight: 16,
  },

  /* Pay Button */
  dtPayButton: {
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
  dtPayButtonText: {
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
    paddingTop: 8,
    paddingBottom: 24,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
  },
  editPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  editPillText: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#0284C7',
  },
  summaryDetailsList: {
    gap: 8,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryItemText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#0E1E38',
    flex: 1,
  },
  summaryPipe: {
    color: '#CBD5E1',
  },
  dottedConnectorContainer: {
    paddingLeft: 7,
    marginVertical: -2,
    gap: 2,
  },
  dottedDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#CBD5E1',
  },
  optionalGrayText: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#94A3B8',
  },
  amountIncludesCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDFA',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    padding: 14,
    marginBottom: 18,
    gap: 16,
  },
  amountColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#CCFBF1',
    paddingRight: 10,
  },
  amountHeaderLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#0D9488',
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceAmountText: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: '#0E1E38',
  },
  fareFormulaText: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  includesColumn: {
    flex: 1.2,
  },
  includesHeaderLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#0D9488',
    marginBottom: 6,
  },
  includesList: {
    gap: 4,
  },
  includesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  includesText: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: '#334155',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
  },
  addNewButton: {
    paddingVertical: 2,
  },
  addNewText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: '#0284C7',
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#00D2B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInnerSelected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D2B4',
  },
  cardLogoBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  visaText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: '#1E3A8A',
  },
  mcCirclesContainer: {
    flexDirection: 'row',
    width: 28,
    height: 16,
    alignItems: 'center',
  },
  mcCircleRed: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EB001B',
  },
  mcCircleOrange: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F79E1B',
    marginLeft: -6,
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
    fontSize: 11,
    color: '#64748B',
  },
  moreOptionsButton: {
    padding: 4,
  },
  otherOptionsTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
    marginTop: 12,
    marginBottom: 10,
  },
  otherOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  upiBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  upiText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: '#059669',
  },
  cardIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherOptionLabel: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#0E1E38',
  },
  secureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 8,
    marginBottom: 16,
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  payButtonWrapper: {
    width: '100%',
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
