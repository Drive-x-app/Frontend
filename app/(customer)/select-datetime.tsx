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
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  Wifi,
  Battery,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useBookingStore } from '../../src/store/bookingStore';
import { FONT } from '../../src/theme/typography';

const TIME_SLOTS = [
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
];

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  dateKey: string;
}

export default function SelectDateTimeScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktopOrTablet = windowWidth > 600;

  // Zustand State
  const selectedDate = useBookingStore((state) => state.selectedDate);
  const selectedTime = useBookingStore((state) => state.selectedTime);
  const pickupTimingMode = useBookingStore((state) => state.pickupTimingMode);

  const setSelectedDate = useBookingStore((state) => state.setSelectedDate);
  const setSelectedTime = useBookingStore((state) => state.setSelectedTime);
  const setPickupTimingMode = useBookingStore((state) => state.setPickupTimingMode);

  // Month navigation (October 2026 default as in screenshot)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // 0-indexed: 9 = October

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleDaySelect = (dayObj: CalendarDay) => {
    if (!dayObj.isCurrentMonth) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedDate(dayObj.dateKey);
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedTime(timeSlot);
  };

  const handleTimingModeToggle = (mode: 'now' | 'later') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setPickupTimingMode(mode);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(customer)/select-location');
    }
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    // Navigate to driver selection or booking review
  };

  // Generate calendar days for October 2026
  // October 2026: Oct 1 is Thursday. Days before: Sun 27, Mon 28, Tue 29, Wed 30 of Sept.
  const buildCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 is Sun
    const totalDaysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const prevMonthTotalDays = new Date(currentYear, currentMonthIndex, 0).getDate();

    // Previous month overflow days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      days.push({
        day: dayNum,
        isCurrentMonth: false,
        dateKey: `prev-${dayNum}`,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthStr = String(currentMonthIndex + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      days.push({
        day: d,
        isCurrentMonth: true,
        dateKey: `${currentYear}-${monthStr}-${dayStr}`,
      });
    }

    return days;
  };

  const calendarDays = buildCalendarDays();
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
            <Text style={styles.pageTitle}>Select Date & Time</Text>
            <Text style={styles.pageSubtitle}>
              Choose your preferred date and pickup time.
            </Text>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Select Date Section */}
            <Text style={styles.sectionHeaderTitle}>Select Date</Text>

            {/* Calendar Container Card */}
            <View style={styles.calendarCard}>
              {/* Month Navigation Row */}
              <View style={styles.monthNavRow}>
                <TouchableOpacity
                  style={styles.monthNavButton}
                  onPress={handlePrevMonth}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <ChevronLeft size={18} color="#0E1E38" strokeWidth={2.4} />
                </TouchableOpacity>

                <Text style={styles.monthYearTitle}>
                  {monthNames[currentMonthIndex]} {currentYear}
                </Text>

                <TouchableOpacity
                  style={styles.monthNavButton}
                  onPress={handleNextMonth}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <ChevronRight size={18} color="#0E1E38" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>

              {/* Day of Week Row */}
              <View style={styles.dayOfWeekRow}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <Text key={d} style={styles.dayOfWeekText}>
                    {d}
                  </Text>
                ))}
              </View>

              {/* Day Grid */}
              <View style={styles.daysGrid}>
                {calendarDays.map((item, index) => {
                  const isSelected = item.isCurrentMonth && item.dateKey === selectedDate;
                  return (
                    <TouchableOpacity
                      key={`${item.dateKey}-${index}`}
                      style={styles.dayCellWrapper}
                      activeOpacity={item.isCurrentMonth ? 0.75 : 1}
                      onPress={() => handleDaySelect(item)}
                      disabled={!item.isCurrentMonth}
                    >
                      <View
                        style={[
                          styles.dayNumberCircle,
                          isSelected && styles.dayNumberCircleSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayNumberText,
                            !item.isCurrentMonth && styles.dayNumberTextOtherMonth,
                            isSelected && styles.dayNumberTextSelected,
                          ]}
                        >
                          {item.day}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 2. Select Pickup Time Section */}
            <View style={styles.pickupTimeHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>Select Pickup Time</Text>

              {/* Now / Later Toggle Pill */}
              <View style={styles.timingTogglePill}>
                <TouchableOpacity
                  style={[
                    styles.toggleOption,
                    pickupTimingMode === 'now' && styles.toggleOptionActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleTimingModeToggle('now')}
                >
                  <Text
                    style={[
                      styles.toggleOptionText,
                      pickupTimingMode === 'now' && styles.toggleOptionTextActive,
                    ]}
                  >
                    Now
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleOption,
                    pickupTimingMode === 'later' && styles.toggleOptionActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleTimingModeToggle('later')}
                >
                  <Text
                    style={[
                      styles.toggleOptionText,
                      pickupTimingMode === 'later' && styles.toggleOptionTextActive,
                    ]}
                  >
                    Later
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Time Slot 4-Column Grid */}
            <View style={styles.timeSlotsGrid}>
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timeSlotPill,
                      isSelected && styles.timeSlotPillSelected,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => handleTimeSlotSelect(slot)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        isSelected && styles.timeSlotTextSelected,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Important Information Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeaderRow}>
                <Clock size={16} color="#0284C7" strokeWidth={2.4} />
                <Text style={styles.infoTitle}>Important Information</Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletSymbol}>•</Text>
                <Text style={styles.bulletText}>
                  The driver will be available from the selected pickup time.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletSymbol}>•</Text>
                <Text style={styles.bulletText}>
                  Waiting time is included within the selected duration.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletSymbol}>•</Text>
                <Text style={styles.bulletText}>
                  You can modify the date and time before payment.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Pinned Bottom CTA Container */}
          <View style={styles.bottomCtaContainer}>
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
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
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
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionHeaderTitle: {
    fontFamily: FONT.bold,
    fontSize: 15.5,
    color: '#0E1E38',
    marginBottom: 12,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
    marginBottom: 20,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthNavButton: {
    padding: 4,
  },
  monthYearTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: '#0E1E38',
  },
  dayOfWeekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  dayOfWeekText: {
    width: '14.28%',
    textAlign: 'center',
    fontFamily: FONT.medium,
    fontSize: 11.5,
    color: '#64748B',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellWrapper: {
    width: '14.28%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberCircleSelected: {
    backgroundColor: '#00D2B4',
  },
  dayNumberText: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: '#0E1E38',
  },
  dayNumberTextOtherMonth: {
    color: '#CBD5E1',
    fontFamily: FONT.regular,
  },
  dayNumberTextSelected: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
  },
  pickupTimeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timingTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 3,
  },
  toggleOption: {
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 16,
  },
  toggleOptionActive: {
    backgroundColor: '#00D2B4',
  },
  toggleOptionText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#64748B',
  },
  toggleOptionTextActive: {
    fontFamily: FONT.semiBold,
    color: '#FFFFFF',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  timeSlotPill: {
    width: '23%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotPillSelected: {
    borderColor: '#00D2B4',
    borderWidth: 1.8,
    backgroundColor: '#E6FAF6',
  },
  timeSlotText: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#0E1E38',
  },
  timeSlotTextSelected: {
    color: '#0E1E38',
    fontFamily: FONT.bold,
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    padding: 14,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    color: '#0E1E38',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  bulletSymbol: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  bulletText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  bottomCtaContainer: {
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  continueButtonWrapper: {
    width: '100%',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 4,
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
