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
  Clock,
  Sun,
  Calendar,
  Info,
  ArrowRight,
  Wifi,
  Battery,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  useBookingStore,
  DURATION_OPTIONS,
  DurationOption,
} from '../../src/store/bookingStore';
import { FONT } from '../../src/theme/typography';

export default function SelectDurationScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktopOrTablet = windowWidth > 600;

  // Zustand state
  const selectedDurationId = useBookingStore((state) => state.selectedDurationId);
  const setSelectedDurationId = useBookingStore((state) => state.setSelectedDurationId);

  const handleDurationSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    // Next step in flow (e.g. driver matching / booking summary)
  };

  const renderDurationIcon = (id: string, isSelected: boolean) => {
    const iconColor = '#0E1E38';
    const iconSize = 18;
    if (id === 'fullday') return <Sun size={iconSize} color={iconColor} strokeWidth={2.4} />;
    if (id === '1week') return <Calendar size={iconSize} color={iconColor} strokeWidth={2.2} />;
    return <Clock size={iconSize} color={iconColor} strokeWidth={2.4} />;
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
            <Text style={styles.pageTitle}>Select Duration</Text>
            <Text style={styles.pageSubtitle}>
              Choose how long you need a professional driver.
            </Text>
          </View>

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
                  >
                    <View style={styles.durationIconBadge}>
                      {renderDurationIcon(item.id, isSelected)}
                    </View>

                    <Text style={styles.durationTitle}>{item.label}</Text>
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
    paddingHorizontal: 18,
    paddingBottom: 24,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 16,
  },
  durationCard: {
    width: '31%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 124,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  durationCardSelected: {
    borderColor: '#00D2B4',
    borderWidth: 1.8,
    backgroundColor: '#E6FAF6',
  },
  durationIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  durationTitle: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#0E1E38',
    textAlign: 'center',
    marginBottom: 4,
  },
  durationSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 12.5,
  },
  infoCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    padding: 14,
    marginBottom: 14,
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
    lineHeight: 16.5,
  },
  illustrationWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
  },
  illustrationImage: {
    width: '100%',
    height: 140,
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
