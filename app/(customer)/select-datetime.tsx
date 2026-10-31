import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  Wifi,
  Battery,
  AlertCircle,
  Zap,
  Calendar,
  Check,
  Info,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useBookingStore } from '../../src/store/bookingStore';
import { DesktopHeader } from '../../src/components/common/DesktopHeader';
import { DesktopSidebar } from '../../src/components/common/DesktopSidebar';
import { FONT } from '../../src/theme/typography';
import {
  CalendarDay,
  MONTH_NAMES,
  WEEKDAY_NAMES,
  generateCalendarDays,
  generateDailyTimeSlots,
  filterAvailableTimeSlots,
  canGoToPrevMonth,
  isDateInPast,
  parseDateKey,
  getTodayDateKey,
} from '../../src/utils/dateTime';

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

export default function SelectDateTimeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktopOrTablet = windowWidth > 600;

  // Zustand State
  const selectedDate = useBookingStore((state) => state.selectedDate);
  const selectedTime = useBookingStore((state) => state.selectedTime);
  const pickupTimingMode = useBookingStore((state) => state.pickupTimingMode);

  const setSelectedDate = useBookingStore((state) => state.setSelectedDate);
  const setSelectedTime = useBookingStore((state) => state.setSelectedTime);
  const setPickupTimingMode = useBookingStore((state) => state.setPickupTimingMode);

  // Validation & Navigation guards
  const [validationError, setValidationError] = useState<string | null>(null);
  const isNavigatingRef = useRef(false);

  // Initialize month and year dynamically from selectedDate or today
  const [currentYear, setCurrentYear] = useState(() => {
    const parsed = parseDateKey(selectedDate);
    const now = new Date();
    return parsed && !isDateInPast(selectedDate, now) ? parsed.year : now.getFullYear();
  });

  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    const parsed = parseDateKey(selectedDate);
    const now = new Date();
    return parsed && !isDateInPast(selectedDate, now) ? parsed.monthIndex : now.getMonth();
  });

  // Ensure selectedDate is valid and not in the past
  useEffect(() => {
    const now = new Date();
    if (!selectedDate || isDateInPast(selectedDate, now)) {
      const todayKey = getTodayDateKey(now);
      setSelectedDate(todayKey);
      const parsedToday = parseDateKey(todayKey);
      if (parsedToday) {
        setCurrentYear(parsedToday.year);
        setCurrentMonthIndex(parsedToday.monthIndex);
      }
    }
  }, [selectedDate, setSelectedDate]);

  // Daily 30-minute time slots (06:00 AM to 11:30 PM)
  const allDailySlots = useMemo(() => generateDailyTimeSlots(6, 23, 30), []);

  // Filter available slots based on selected date & current time
  const availableSlots = useMemo(() => {
    return filterAvailableTimeSlots(allDailySlots, selectedDate, new Date(), 15);
  }, [allDailySlots, selectedDate]);

  // Synchronize selectedTime when available slots change
  useEffect(() => {
    if (pickupTimingMode === 'later') {
      if (availableSlots.length > 0) {
        if (!selectedTime || !availableSlots.includes(selectedTime)) {
          setSelectedTime(availableSlots[0]);
        }
      } else {
        // No slots available today
        setSelectedTime('');
      }
    }
  }, [availableSlots, pickupTimingMode, selectedTime, setSelectedTime]);

  const canGoPrev = canGoToPrevMonth(currentYear, currentMonthIndex, new Date());

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setValidationError(null);
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setValidationError(null);
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleDaySelect = (dayObj: CalendarDay) => {
    if (!dayObj.isCurrentMonth || dayObj.isPast) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setValidationError(null);
    setSelectedDate(dayObj.dateKey);

    // If currently in Later mode, verify if selectedTime will still be valid
    const newAvailable = filterAvailableTimeSlots(allDailySlots, dayObj.dateKey, new Date(), 15);
    if (newAvailable.length > 0 && (!selectedTime || !newAvailable.includes(selectedTime))) {
      setSelectedTime(newAvailable[0]);
    }
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setValidationError(null);
    setSelectedTime(timeSlot);
  };

  const handleTimingModeToggle = (mode: 'now' | 'later') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setValidationError(null);
    setPickupTimingMode(mode);

    if (mode === 'now') {
      const todayKey = getTodayDateKey();
      setSelectedDate(todayKey);
      const parsedToday = parseDateKey(todayKey);
      if (parsedToday) {
        setCurrentYear(parsedToday.year);
        setCurrentMonthIndex(parsedToday.monthIndex);
      }
    } else {
      // Later mode
      if (availableSlots.length > 0 && (!selectedTime || !availableSlots.includes(selectedTime))) {
        setSelectedTime(availableSlots[0]);
      }
    }
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
    if (isNavigatingRef.current) return;

    // 1. Validate date
    if (!selectedDate || isDateInPast(selectedDate, new Date())) {
      setValidationError('Please select a valid upcoming travel date.');
      return;
    }

    // 2. Validate time when in Later mode
    if (pickupTimingMode === 'later') {
      if (availableSlots.length === 0) {
        setValidationError(
          'No pickup time slots are available for today. Please select tomorrow or choose "Now" for immediate pickup.'
        );
        return;
      }
      if (!selectedTime) {
        setValidationError('Please select a pickup time slot.');
        return;
      }
      if (!availableSlots.includes(selectedTime)) {
        setValidationError('The selected time slot has passed. Please select a future time slot.');
        return;
      }
    }

    setValidationError(null);
    isNavigatingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push('/(customer)/select-duration');

    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  };

  // Generate calendar days for the current displayed month
  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentYear, currentMonthIndex, new Date());
  }, [currentYear, currentMonthIndex]);

  // Formatter for display date matching screenshot (e.g., "29 Oct 2026")
  const formatSelectedDisplayDate = (dateKey: string) => {
    const parsed = parseDateKey(dateKey);
    if (!parsed) return dateKey;
    const monthShort = MONTH_NAMES[parsed.monthIndex]?.slice(0, 3) || '';
    return `${parsed.day} ${monthShort} ${parsed.year}`;
  };

  // =========================================================================
  // DESKTOP & TABLET VIEW (Matches the user's reference mockup exactly)
  // =========================================================================
  if (isDesktopOrTablet) {
    return (
      <View style={styles.desktopOuterContainer}>
        <StatusBar style="dark" />
        {/* Top Header with Hamburger, Logo, Search, and Profile */}
        <DesktopHeader activeTab="home" />

        <View style={styles.desktopBodyRow}>
          {/* Left Persistent Navigation Sidebar */}
          <DesktopSidebar activeTab="home" />

          {/* Main Content Area */}
          <View style={styles.desktopContentArea}>
            {/* Decorative Matrix Dots (Top-Right & Bottom-Right) */}
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
                    <Text style={styles.dtPageTitle}>Select Date & Time</Text>
                    <Text style={styles.dtPageSubtitle}>
                      Choose your preferred date and pickup time.
                    </Text>
                  </View>
                </View>

                {/* 2. Date Selection Two-Column Section */}
                <View style={styles.dtDateSectionRow}>
                  {/* Left Column: Calendar Card */}
                  <View style={styles.dtCalendarCard}>
                    {/* Month Header Navigation */}
                    <View style={styles.dtMonthNavRow}>
                      <TouchableOpacity
                        style={[
                          styles.dtMonthNavBtn,
                          !canGoPrev && styles.dtMonthNavBtnDisabled,
                        ]}
                        onPress={handlePrevMonth}
                        disabled={!canGoPrev}
                        accessibilityLabel="Previous month"
                      >
                        <ChevronLeft
                          size={18}
                          color={canGoPrev ? '#0E1E38' : '#CBD5E1'}
                          strokeWidth={2.4}
                        />
                      </TouchableOpacity>

                      <Text style={styles.dtMonthNavTitle}>
                        {MONTH_NAMES[currentMonthIndex]} {currentYear}
                      </Text>

                      <TouchableOpacity
                        style={styles.dtMonthNavBtn}
                        onPress={handleNextMonth}
                        accessibilityLabel="Next month"
                      >
                        <ChevronRight size={18} color="#0E1E38" strokeWidth={2.4} />
                      </TouchableOpacity>
                    </View>

                    {/* Weekday Names Row */}
                    <View style={styles.dtWeekdayRow}>
                      {WEEKDAY_NAMES.map((name) => (
                        <Text key={name} style={styles.dtWeekdayLabel}>
                          {name}
                        </Text>
                      ))}
                    </View>

                    {/* Calendar Days 7-Column Grid */}
                    <View style={styles.dtDaysGrid}>
                      {calendarDays.map((dayObj, index) => {
                        const isSelected = selectedDate === dayObj.dateKey;
                        return (
                          <TouchableOpacity
                            key={`${dayObj.dateKey}-${index}`}
                            style={styles.dtDayCellContainer}
                            activeOpacity={0.7}
                            onPress={() => handleDaySelect(dayObj)}
                            disabled={!dayObj.isCurrentMonth || dayObj.isPast}
                          >
                            <View
                              style={[
                                styles.dtDayPill,
                                isSelected && styles.dtDayPillSelected,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.dtDayText,
                                  isSelected && styles.dtDayTextSelected,
                                  !dayObj.isCurrentMonth && styles.dtDayTextOtherMonth,
                                  dayObj.isPast && styles.dtDayTextPast,
                                ]}
                              >
                                {dayObj.day}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Right Column: Selected Date Card */}
                  <View style={styles.dtSelectedDateCard}>
                    <View style={styles.dtSelectedDateIconCircle}>
                      <Calendar size={22} color="#00D2B4" strokeWidth={2.4} />
                    </View>
                    <Text style={styles.dtSelectedDateMicroLabel}>Selected Date</Text>
                    <Text style={styles.dtSelectedDateLargeText}>
                      {formatSelectedDisplayDate(selectedDate)}
                    </Text>
                    <View style={styles.dtAvailableBadge}>
                      <Check size={14} color="#059669" strokeWidth={2.5} />
                      <Text style={styles.dtAvailableBadgeText}>Available</Text>
                    </View>
                  </View>
                </View>

                {/* 3. Pickup Time Section */}
                <View style={styles.dtTimeSection}>
                  <View style={styles.dtTimeSectionHeader}>
                    <View style={styles.dtTimeTitleRow}>
                      <Clock size={19} color="#00D2B4" strokeWidth={2.4} />
                      <Text style={styles.dtTimeSectionTitle}>Select Pickup Time</Text>
                    </View>

                    {/* Now / Later Toggle Pills */}
                    <View style={styles.dtTimingToggleContainer}>
                      <TouchableOpacity
                        style={[
                          styles.dtTimingToggleBtn,
                          pickupTimingMode === 'now' && styles.dtTimingToggleBtnActive,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => handleTimingModeToggle('now')}
                      >
                        <Text
                          style={[
                            styles.dtTimingToggleText,
                            pickupTimingMode === 'now' && styles.dtTimingToggleTextActive,
                          ]}
                        >
                          Now
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.dtTimingToggleBtn,
                          pickupTimingMode === 'later' && styles.dtTimingToggleBtnActive,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => handleTimingModeToggle('later')}
                      >
                        <Text
                          style={[
                            styles.dtTimingToggleText,
                            pickupTimingMode === 'later' && styles.dtTimingToggleTextActive,
                          ]}
                        >
                          Later
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Time Slots Grid (4 Columns) */}
                  {pickupTimingMode === 'now' ? (
                    <View style={styles.dtNowModeNotice}>
                      <Zap size={18} color="#00D2B4" strokeWidth={2.2} />
                      <Text style={styles.dtNowNoticeText}>
                        Instant pickup: Driver arrives as soon as possible (estimated 15–20 mins).
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.dtTimeSlotsGrid}>
                      {(availableSlots.length > 0 ? availableSlots.slice(0, 16) : allDailySlots.slice(0, 16)).map((slot) => {
                        const isSelected = selectedTime === slot;
                        return (
                          <TouchableOpacity
                            key={slot}
                            style={[
                              styles.dtTimeSlotPill,
                              isSelected && styles.dtTimeSlotPillSelected,
                            ]}
                            activeOpacity={0.7}
                            onPress={() => handleTimeSlotSelect(slot)}
                          >
                            <Text
                              style={[
                                styles.dtTimeSlotText,
                                isSelected && styles.dtTimeSlotTextSelected,
                              ]}
                            >
                              {slot}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* 4. Important Information Card */}
                <View style={styles.dtImportantInfoCard}>
                  <View style={styles.dtImportantInfoHeader}>
                    <Info size={17} color="#00D2B4" strokeWidth={2.4} />
                    <Text style={styles.dtImportantInfoTitle}>Important Information</Text>
                  </View>
                  <View style={styles.dtBulletList}>
                    <Text style={styles.dtBulletItem}>
                      • The driver will be available from the selected pickup time.
                    </Text>
                    <Text style={styles.dtBulletItem}>
                      • Waiting time is included within the selected duration.
                    </Text>
                    <Text style={styles.dtBulletItem}>
                      • You can modify the date and time before payment.
                    </Text>
                  </View>
                </View>

                {/* 5. Validation error & Action Button */}
                {validationError && (
                  <View style={styles.dtErrorBanner}>
                    <AlertCircle size={16} color="#DC2626" strokeWidth={2.2} />
                    <Text style={styles.dtErrorText}>{validationError}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.dtContinueButton}
                  activeOpacity={0.85}
                  onPress={handleContinue}
                  accessibilityLabel="Continue to duration"
                >
                  <Text style={styles.dtContinueButtonText}>Continue</Text>
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

          {/* Step Indicator */}
          <View style={styles.stepIndicatorRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>Step 2 of 4</Text>
            </View>
            <View style={styles.stepProgressBarBg}>
              <View style={styles.stepProgressBarFill} />
            </View>
          </View>

          {/* Title & Timing Mode Toggle */}
          <View style={styles.headerSection}>
            <View>
              <Text style={styles.mainTitle}>Select Date & Time</Text>
              <Text style={styles.subTitle}>When do you need the driver?</Text>
            </View>

            {/* Now / Later Toggle */}
            <View style={styles.timingToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.timingTogglePill,
                  pickupTimingMode === 'now' && styles.timingTogglePillActive,
                ]}
                activeOpacity={0.8}
                onPress={() => handleTimingModeToggle('now')}
                accessibilityRole="button"
                accessibilityState={{ selected: pickupTimingMode === 'now' }}
                accessibilityLabel="Pickup now"
              >
                <Zap
                  size={14}
                  color={pickupTimingMode === 'now' ? '#FFFFFF' : '#64748B'}
                  strokeWidth={2.2}
                />
                <Text
                  style={[
                    styles.timingToggleText,
                    pickupTimingMode === 'now' && styles.timingToggleTextActive,
                  ]}
                >
                  Now
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.timingTogglePill,
                  pickupTimingMode === 'later' && styles.timingTogglePillActive,
                ]}
                activeOpacity={0.8}
                onPress={() => handleTimingModeToggle('later')}
                accessibilityRole="button"
                accessibilityState={{ selected: pickupTimingMode === 'later' }}
                accessibilityLabel="Schedule for later"
              >
                <Clock
                  size={14}
                  color={pickupTimingMode === 'later' ? '#FFFFFF' : '#64748B'}
                  strokeWidth={2.2}
                />
                <Text
                  style={[
                    styles.timingToggleText,
                    pickupTimingMode === 'later' && styles.timingToggleTextActive,
                  ]}
                >
                  Later
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Validation Error Banner */}
            {validationError && (
              <View style={styles.errorBanner}>
                <AlertCircle size={18} color="#DC2626" strokeWidth={2.2} />
                <Text style={styles.errorBannerText}>{validationError}</Text>
              </View>
            )}

            {pickupTimingMode === 'now' ? (
              /* Instant Booking Mode Card */
              <View style={styles.nowModeCard}>
                <View style={styles.nowModeHeader}>
                  <View style={styles.nowIconBadge}>
                    <Zap size={22} color="#00D2B4" strokeWidth={2.4} />
                  </View>
                  <View style={styles.nowModeTitleWrap}>
                    <Text style={styles.nowModeTitle}>Immediate Departure</Text>
                    <Text style={styles.nowModeSubtitle}>
                      Nearest verified driver will be assigned
                    </Text>
                  </View>
                </View>

                <View style={styles.nowModeMetricsRow}>
                  <View style={styles.nowMetricItem}>
                    <Clock size={16} color="#64748B" strokeWidth={2} />
                    <Text style={styles.nowMetricLabel}>Estimated Arrival</Text>
                    <Text style={styles.nowMetricValue}>10 – 15 Mins</Text>
                  </View>
                  <View style={styles.nowMetricDivider} />
                  <View style={styles.nowMetricItem}>
                    <Calendar size={16} color="#64748B" strokeWidth={2} />
                    <Text style={styles.nowMetricLabel}>Scheduled Date</Text>
                    <Text style={styles.nowMetricValue}>Today</Text>
                  </View>
                </View>
              </View>
            ) : (
              /* Later Mode: Calendar + Time Slots */
              <>
                {/* Calendar Card */}
                <View style={styles.calendarCard}>
                  {/* Month Navigation Row */}
                  <View style={styles.monthHeaderRow}>
                    <TouchableOpacity
                      style={[
                        styles.monthNavButton,
                        !canGoPrev && styles.monthNavButtonDisabled,
                      ]}
                      onPress={handlePrevMonth}
                      disabled={!canGoPrev}
                      accessibilityLabel="Previous month"
                    >
                      <ChevronLeft
                        size={20}
                        color={canGoPrev ? '#0E1E38' : '#CBD5E1'}
                        strokeWidth={2.2}
                      />
                    </TouchableOpacity>

                    <Text style={styles.monthTitleText}>
                      {MONTH_NAMES[currentMonthIndex]} {currentYear}
                    </Text>

                    <TouchableOpacity
                      style={styles.monthNavButton}
                      onPress={handleNextMonth}
                      accessibilityLabel="Next month"
                    >
                      <ChevronRight size={20} color="#0E1E38" strokeWidth={2.2} />
                    </TouchableOpacity>
                  </View>

                  {/* Weekday Header Labels */}
                  <View style={styles.weekdayRow}>
                    {WEEKDAY_NAMES.map((weekday) => (
                      <Text key={weekday} style={styles.weekdayLabel}>
                        {weekday}
                      </Text>
                    ))}
                  </View>

                  {/* Calendar Days Grid */}
                  <View style={styles.daysGrid}>
                    {calendarDays.map((dayObj, index) => {
                      const isSelected = selectedDate === dayObj.dateKey;
                      return (
                        <TouchableOpacity
                          key={`${dayObj.dateKey}-${index}`}
                          style={styles.dayCellTouch}
                          activeOpacity={0.7}
                          onPress={() => handleDaySelect(dayObj)}
                          disabled={!dayObj.isCurrentMonth || dayObj.isPast}
                        >
                          <View
                            style={[
                              styles.dayCircle,
                              isSelected && styles.dayCircleSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.dayText,
                                isSelected && styles.dayTextSelected,
                                !dayObj.isCurrentMonth && styles.dayTextOtherMonth,
                                dayObj.isPast && styles.dayTextPast,
                              ]}
                            >
                              {dayObj.day}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Time Slots Section */}
                <View style={styles.timeSlotsSection}>
                  <View style={styles.timeSectionHeaderRow}>
                    <Text style={styles.timeSectionTitle}>Available Pickup Times</Text>
                    <Text style={styles.timeSectionSub}>
                      {availableSlots.length} slots available
                    </Text>
                  </View>

                  {availableSlots.length === 0 ? (
                    <View style={styles.noSlotsBox}>
                      <Clock size={24} color="#94A3B8" strokeWidth={2} />
                      <Text style={styles.noSlotsTitle}>No More Slots Today</Text>
                      <Text style={styles.noSlotsText}>
                        All scheduled slots for today have closed. Please select tomorrow or switch to "Now" mode.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.slotsGrid}>
                      {availableSlots.map((timeSlot) => {
                        const isSelected = selectedTime === timeSlot;
                        return (
                          <TouchableOpacity
                            key={timeSlot}
                            style={[
                              styles.slotPill,
                              isSelected && styles.slotPillSelected,
                            ]}
                            activeOpacity={0.75}
                            onPress={() => handleTimeSlotSelect(timeSlot)}
                          >
                            <Text
                              style={[
                                styles.slotText,
                                isSelected && styles.slotTextSelected,
                              ]}
                            >
                              {timeSlot}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              </>
            )}

            {/* Information Card */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Clock size={16} color="#00D2B4" strokeWidth={2.2} />
                <Text style={styles.infoCardTitle}>Booking Information</Text>
              </View>
              <View style={styles.infoBulletRow}>
                <Text style={styles.bulletSymbol}>•</Text>
                <Text style={styles.bulletText}>
                  Your driver will report 10 minutes prior to scheduled pickup time.
                </Text>
              </View>
              <View style={styles.infoBulletRow}>
                <Text style={styles.bulletSymbol}>•</Text>
                <Text style={styles.bulletText}>
                  Free cancellation up to 1 hour before pickup starts.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Sticky Bottom Continue Button */}
          <View
            style={[
              styles.bottomCtaContainer,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <TouchableOpacity
              style={styles.continueButtonWrapper}
              activeOpacity={0.88}
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue to select duration"
            >
              <LinearGradient
                colors={['#00D2B4', '#00B89C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueButton}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <ArrowRight size={18} color="#072038" strokeWidth={2.4} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // =========================================================================
  // DESKTOP SPECIFIC STYLES (Matching reference screenshot)
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
  dtDateSectionRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 26,
  },
  dtCalendarCard: {
    flex: 1.6,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  dtMonthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dtMonthNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtMonthNavBtnDisabled: {
    opacity: 0.4,
  },
  dtMonthNavTitle: {
    fontFamily: FONT.bold,
    fontSize: 15.5,
    color: '#0E1E38',
  },
  dtWeekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    marginBottom: 8,
  },
  dtWeekdayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#64748B',
  },
  dtDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dtDayCellContainer: {
    width: '14.28%',
    aspectRatio: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtDayPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dtDayPillSelected: {
    backgroundColor: '#00D2B4',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  dtDayText: {
    fontFamily: FONT.medium,
    fontSize: 13.5,
    color: '#0E1E38',
  },
  dtDayTextSelected: {
    fontFamily: FONT.bold,
    color: '#FFFFFF',
  },
  dtDayTextOtherMonth: {
    color: '#CBD5E1',
  },
  dtDayTextPast: {
    color: '#CBD5E1',
  },
  dtSelectedDateCard: {
    flex: 1,
    backgroundColor: '#F2FCFA',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4F7EE',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  dtSelectedDateIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#D1FAF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dtSelectedDateMicroLabel: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#64748B',
    marginBottom: 4,
  },
  dtSelectedDateLargeText: {
    fontFamily: FONT.bold,
    fontSize: 23,
    color: '#0E1E38',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  dtAvailableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  dtAvailableBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: '#059669',
  },
  dtTimeSection: {
    marginBottom: 24,
  },
  dtTimeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dtTimeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dtTimeSectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: '#0E1E38',
  },
  dtTimingToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    padding: 3,
    gap: 2,
  },
  dtTimingToggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtTimingToggleBtnActive: {
    backgroundColor: '#00D2B4',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  dtTimingToggleText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#64748B',
  },
  dtTimingToggleTextActive: {
    fontFamily: FONT.bold,
    color: '#FFFFFF',
  },
  dtTimeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dtTimeSlotPill: {
    width: '23.2%',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        } as any)
      : {}),
  },
  dtTimeSlotPillSelected: {
    backgroundColor: '#E6FAF7',
    borderColor: '#00D2B4',
    borderWidth: 1.5,
  },
  dtTimeSlotText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#334155',
  },
  dtTimeSlotTextSelected: {
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  dtNowModeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F0FCF9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  dtNowNoticeText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#0F766E',
    flex: 1,
  },
  dtImportantInfoCard: {
    backgroundColor: '#F0FDFB',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  dtImportantInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dtImportantInfoTitle: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    color: '#0F766E',
  },
  dtBulletList: {
    gap: 4,
  },
  dtBulletItem: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  dtErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  dtErrorText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#DC2626',
    flex: 1,
  },
  dtContinueButton: {
    backgroundColor: '#00D2B4',
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-end',
    paddingHorizontal: 32,
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtContinueButtonText: {
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
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  stepBadge: {
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  stepBadgeText: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#0D9488',
  },
  stepProgressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginLeft: 12,
    overflow: 'hidden',
  },
  stepProgressBarFill: {
    width: '50%',
    height: '100%',
    backgroundColor: '#00D2B4',
    borderRadius: 2,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  mainTitle: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: '#0E1E38',
    letterSpacing: -0.5,
  },
  subTitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  timingToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    padding: 3,
    marginTop: 12,
  },
  timingTogglePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 20,
  },
  timingTogglePillActive: {
    backgroundColor: '#0E1E38',
  },
  timingToggleText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#64748B',
  },
  timingToggleTextActive: {
    fontFamily: FONT.bold,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorBannerText: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#DC2626',
  },
  nowModeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  nowModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nowIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6FAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nowModeTitleWrap: {
    flex: 1,
  },
  nowModeTitle: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: '#0E1E38',
  },
  nowModeSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  nowModeMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  nowMetricItem: {
    alignItems: 'center',
    gap: 3,
  },
  nowMetricLabel: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  nowMetricValue: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
  },
  nowMetricDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginTop: 6,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavButtonDisabled: {
    opacity: 0.4,
  },
  monthTitleText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#0E1E38',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    marginBottom: 6,
  },
  weekdayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontFamily: FONT.semiBold,
    fontSize: 11.5,
    color: '#94A3B8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellTouch: {
    width: '14.28%',
    aspectRatio: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: '#00D2B4',
  },
  dayText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#0E1E38',
  },
  dayTextSelected: {
    fontFamily: FONT.bold,
    color: '#FFFFFF',
  },
  dayTextOtherMonth: {
    color: '#CBD5E1',
  },
  dayTextPast: {
    color: '#CBD5E1',
  },
  timeSlotsSection: {
    marginTop: 18,
  },
  timeSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeSectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#0E1E38',
  },
  timeSectionSub: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#64748B',
  },
  noSlotsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noSlotsTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
    marginTop: 8,
  },
  noSlotsText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  slotPillSelected: {
    backgroundColor: '#E6FAF7',
    borderColor: '#00D2B4',
  },
  slotText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#64748B',
  },
  slotTextSelected: {
    fontFamily: FONT.bold,
    color: '#00A892',
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 12.5,
    color: '#0E1E38',
  },
  infoBulletRow: {
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
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
});
