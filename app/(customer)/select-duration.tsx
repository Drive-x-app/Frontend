import React, { useEffect, useRef, useState } from 'react';
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
  Clock,
  Sun,
  Calendar,
  Info,
  ArrowRight,
  Wifi,
  Battery,
  AlertCircle,
  Check,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  useBookingStore,
  DURATION_OPTIONS,
  DurationOption,
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

export default function SelectDurationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktopOrTablet = windowWidth > 600;

  // Zustand State
  const selectedDurationId = useBookingStore((state) => state.selectedDurationId);
  const setSelectedDurationId = useBookingStore((state) => state.setSelectedDurationId);

  // Validation State
  const [validationError, setValidationError] = useState<string | null>(null);
  const isNavigatingRef = useRef(false);

  // Ensure default duration is selected if none currently set
  useEffect(() => {
    if (!selectedDurationId) {
      setSelectedDurationId(DURATION_OPTIONS[0].id);
    }
  }, [selectedDurationId, setSelectedDurationId]);

  const handleDurationSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setValidationError(null);
    setSelectedDurationId(id);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(customer)/select-datetime');
    }
  };

  const handleContinue = () => {
    if (isNavigatingRef.current) return;

    if (!selectedDurationId) {
      setValidationError('Please select a booking duration to proceed.');
      return;
    }

    setValidationError(null);
    isNavigatingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push('/(customer)/booking-summary');

    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1000);
  };

  const renderDurationIcon = (id: string, isSelected: boolean) => {
    const iconColor = isSelected ? '#00A896' : '#0E1E38';
    const iconSize = 18;
    if (id === 'fullday') return <Sun size={iconSize} color={iconColor} strokeWidth={2.4} />;
    if (id === '1week') return <Calendar size={iconSize} color={iconColor} strokeWidth={2.2} />;
    return <Clock size={iconSize} color={iconColor} strokeWidth={2.4} />;
  };

  // =========================================================================
  // DESKTOP & TABLET VIEW (Matching Select Date & Time Desktop Layout)
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
                {/* 1. Card Header Row: Title & Subtitle */}
                <View style={styles.dtCardHeaderRow}>
                  <View style={styles.dtTitleColumn}>
                    <Text style={styles.dtPageTitle}>Select Duration</Text>
                    <Text style={styles.dtPageSubtitle}>
                      Choose how long you need a professional driver.
                    </Text>
                  </View>
                </View>

                {/* Validation Feedback Banner */}
                {validationError && (
                  <View style={styles.dtErrorBanner}>
                    <AlertCircle size={16} color="#DC2626" strokeWidth={2.2} />
                    <Text style={styles.dtErrorText}>{validationError}</Text>
                  </View>
                )}

                {/* 2. Duration 3-Column Grid */}
                <View style={styles.dtDurationGrid}>
                  {DURATION_OPTIONS.map((item: DurationOption) => {
                    const isSelected = item.id === selectedDurationId;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.dtDurationCard,
                          isSelected && styles.dtDurationCardSelected,
                        ]}
                        activeOpacity={0.78}
                        onPress={() => handleDurationSelect(item.id)}
                        accessibilityLabel={`${item.label}, ${item.description.replace(/\n/g, ' ')}${isSelected ? ', selected' : ''}`}
                      >
                        <View style={styles.dtCardTopRow}>
                          <View
                            style={[
                              styles.dtDurationIconBadge,
                              isSelected && styles.dtDurationIconBadgeSelected,
                            ]}
                          >
                            {renderDurationIcon(item.id, isSelected)}
                          </View>
                          {isSelected && (
                            <View style={styles.dtSelectedCheckBadge}>
                              <Check size={12} color="#FFFFFF" strokeWidth={3} />
                            </View>
                          )}
                        </View>

                        <Text
                          style={[
                            styles.dtDurationTitle,
                            isSelected && styles.dtDurationTitleSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text style={styles.dtDurationSubtitle} numberOfLines={3}>
                          {item.description}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 3. About Duration Info Box */}
                <View style={styles.dtInfoCard}>
                  <View style={styles.dtInfoHeaderRow}>
                    <Info size={17} color="#00D2B4" strokeWidth={2.4} />
                    <Text style={styles.dtInfoTitle}>About Duration</Text>
                  </View>

                  <View style={styles.dtBulletList}>
                    <Text style={styles.dtBulletItem}>
                      • The driver will be available for the selected duration from the pickup time.
                    </Text>
                    <Text style={styles.dtBulletItem}>
                      • You can make multiple stops within the selected duration.
                    </Text>
                    <Text style={styles.dtBulletItem}>
                      • Waiting time within the booking duration is included.
                    </Text>
                    <Text style={styles.dtBulletItem}>
                      • For extended requirements, you can choose a longer duration or make a new booking.
                    </Text>
                  </View>
                </View>

                {/* 4. Bottom Illustration */}
                <View style={styles.dtIllustrationWrapper}>
                  <Image
                    source={require('../../assets/duration_car_banner.jpg')}
                    style={styles.dtIllustrationImage}
                    resizeMode="contain"
                  />
                </View>

                {/* 5. Continue Button */}
                <TouchableOpacity
                  style={styles.dtContinueButton}
                  activeOpacity={0.88}
                  onPress={handleContinue}
                  accessibilityLabel="Continue to booking summary"
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

          {/* Title Header */}
          <View style={styles.titleSection}>
            <Text style={styles.pageTitle}>Select Duration</Text>
            <Text style={styles.pageSubtitle}>
              Choose how long you need a professional driver.
            </Text>
          </View>

          {/* Validation Feedback Banner */}
          {validationError && (
            <View style={styles.validationBanner}>
              <AlertCircle size={16} color="#DC2626" strokeWidth={2.2} />
              <Text style={styles.validationBannerText}>{validationError}</Text>
            </View>
          )}

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Duration 3-Column Grid */}
            <View style={styles.durationGrid}>
              {DURATION_OPTIONS.map((item: DurationOption) => {
                const isSelected = item.id === selectedDurationId;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.durationCard,
                      isSelected && styles.durationCardSelected,
                    ]}
                    activeOpacity={0.78}
                    onPress={() => handleDurationSelect(item.id)}
                    accessibilityLabel={`${item.label}, ${item.description.replace(/\n/g, ' ')}${isSelected ? ', selected' : ''}`}
                  >
                    <View
                      style={[
                        styles.durationIconBadge,
                        isSelected && styles.durationIconBadgeSelected,
                      ]}
                    >
                      {renderDurationIcon(item.id, isSelected)}
                    </View>

                    <Text
                      style={[
                        styles.durationTitle,
                        isSelected && styles.durationTitleSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.durationSubtitle} numberOfLines={3}>
                      {item.description}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. About Duration Info Box */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeaderRow}>
                <Info size={16} color="#0284C7" strokeWidth={2.4} />
                <Text style={styles.infoTitle}>About Duration</Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletSymbol}>•</Text>
                <Text style={styles.bulletText}>
                  The driver will be available for the selected duration from the pickup time.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletSymbol}>•</Text>
                <Text style={styles.bulletText}>
                  You can make multiple stops within the selected duration.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletSymbol}>•</Text>
                <Text style={styles.bulletText}>
                  Waiting time within the booking duration is included.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletSymbol}>•</Text>
                <Text style={styles.bulletText}>
                  For extended requirements, you can choose a longer duration or make a new booking.
                </Text>
              </View>
            </View>

            {/* 3. Bottom Car City Illustration */}
            <View style={styles.illustrationWrapper}>
              <Image
                source={require('../../assets/duration_car_banner.jpg')}
                style={styles.illustrationImage}
                resizeMode="contain"
              />
            </View>
          </ScrollView>

          {/* Pinned Bottom CTA Container */}
          <View
            style={[
              styles.bottomCtaContainer,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <TouchableOpacity
              style={styles.continueButtonWrapper}
              activeOpacity={0.88}
              onPress={handleContinue}
              accessibilityLabel="Continue to booking summary"
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
  dtErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  dtErrorText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#DC2626',
    flex: 1,
  },
  dtDurationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  dtDurationCard: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        } as any)
      : {}),
  },
  dtDurationCardSelected: {
    backgroundColor: '#E6FAF7',
    borderColor: '#00D2B4',
    borderWidth: 1.5,
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  dtCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dtDurationIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dtDurationIconBadgeSelected: {
    backgroundColor: '#CCFBF1',
  },
  dtSelectedCheckBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00D2B4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dtDurationTitle: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#0E1E38',
    marginBottom: 4,
  },
  dtDurationTitleSelected: {
    color: '#00A892',
  },
  dtDurationSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  dtInfoCard: {
    backgroundColor: '#F0FDFB',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
  },
  dtInfoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dtInfoTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0F766E',
  },
  dtBulletList: {
    gap: 5,
  },
  dtBulletItem: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 19,
  },
  dtIllustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingVertical: 10,
  },
  dtIllustrationImage: {
    width: '100%',
    height: 140,
    maxWidth: 420,
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
    paddingHorizontal: 36,
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
  validationBanner: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validationBannerText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#DC2626',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  durationCard: {
    width: '31%',
    aspectRatio: 0.95,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationCardSelected: {
    borderColor: '#00D2B4',
    borderWidth: 2,
    backgroundColor: '#F0FDFA',
  },
  durationIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  durationIconBadgeSelected: {
    backgroundColor: '#CCFBF1',
  },
  durationTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#0E1E38',
    textAlign: 'center',
    marginBottom: 3,
  },
  durationTitleSelected: {
    color: '#00A896',
  },
  durationSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 13,
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 14,
    marginBottom: 16,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: '#0369A1',
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
    color: '#0284C7',
    lineHeight: 16,
  },
  bulletText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#334155',
    lineHeight: 16,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  illustrationImage: {
    width: '100%',
    height: 120,
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
