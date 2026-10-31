import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Phone,
  ChevronDown,
  Check,
  X,
  ShieldCheck,
  Car,
  CreditCard,
  Headphones,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore, COUNTRIES, Country } from '../../src/store/authStore';
import { FONT } from '../../src/theme/typography';

const IndianFlagBadge = () => (
  <View style={styles.flagBadge}>
    <View style={[styles.flagStripe, { backgroundColor: '#FF9933' }]} />
    <View style={[styles.flagStripe, { backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }]}>
      <View style={styles.ashokaChakra} />
    </View>
    <View style={[styles.flagStripe, { backgroundColor: '#138808' }]} />
  </View>
);

export default function LoginScreen() {
  const router = useRouter();
  const inputRef = useRef<any>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktop = windowWidth >= 960;
  const isDesktopOrTablet = windowWidth > 600;

  // Zustand Global State
  const phoneNumber = useAuthStore((state) => state.phoneNumber);
  const selectedCountry = useAuthStore((state) => state.selectedCountry);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const setPhoneNumber = useAuthStore((state) => state.setPhoneNumber);
  const setSelectedCountry = useAuthStore((state) => state.setSelectedCountry);
  const requestOtp = useAuthStore((state) => state.requestOtp);
  const authMode = useAuthStore((state) => state.authMode);
  const setAuthMode = useAuthStore((state) => state.setAuthMode);

  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleContinue = async () => {
    if (phoneNumber.trim().length < 10 || isLoading) {
      return;
    }
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      (document.activeElement as HTMLElement)?.blur?.();
    }
    inputRef.current?.blur?.();
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const result = await requestOtp();
    if (result.success) {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        (document.activeElement as HTMLElement)?.blur?.();
      }
      router.push('/(auth)/otp');
    }
  };

  const openLink = async (url: string) => {
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        await WebBrowser.openBrowserAsync(url);
      }
    } catch {
      // Fallback
    }
  };

  const isFormValid = phoneNumber.trim().length >= 10;

  // Reusable Phone Input Component
  const renderPhoneInput = () => (
    <View style={styles.formSection}>
      {/* Segmented Auth Mode Switch: Sign In vs Sign Up */}
      <View style={styles.authModeTabs}>
        <TouchableOpacity
          style={[
            styles.authModeTab,
            authMode === 'signin' && styles.authModeTabActive,
          ]}
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setAuthMode('signin');
          }}
        >
          <Text
            style={[
              styles.authModeTabText,
              authMode === 'signin' && styles.authModeTabTextActive,
            ]}
          >
            Sign In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.authModeTab,
            authMode === 'signup' && styles.authModeTabActive,
          ]}
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setAuthMode('signup');
          }}
        >
          <Text
            style={[
              styles.authModeTabText,
              authMode === 'signup' && styles.authModeTabTextActive,
            ]}
          >
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.inputLabel}>Mobile Number</Text>

      {/* Phone Input Box */}
      <View
        style={[
          styles.inputCard,
          isInputFocused && styles.inputCardFocused,
        ]}
      >
        {/* Country Code Selector */}
        <TouchableOpacity
          style={styles.countryPickerButton}
          activeOpacity={0.7}
          onPress={() => {
            if (Platform.OS === 'web' && typeof document !== 'undefined') {
              (document.activeElement as HTMLElement)?.blur?.();
            }
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setIsCountryModalVisible(true);
          }}
          accessibilityLabel={`Selected country: ${selectedCountry.name}, code ${selectedCountry.dialCode}`}
        >
          {selectedCountry.code === 'IN' ? (
            <IndianFlagBadge />
          ) : (
            <Text style={styles.flagEmoji}>{selectedCountry.flag}</Text>
          )}
          <Text style={styles.countryCodeText}>{selectedCountry.dialCode}</Text>
          <ChevronDown size={15} color="#0E1E38" strokeWidth={2.4} style={styles.chevronIcon} />
        </TouchableOpacity>

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Phone Icon & TextInput */}
        <Pressable
          style={styles.phoneInputRow}
          onPress={() => inputRef.current?.focus()}
        >
          <Phone size={18} color="#94A3B8" strokeWidth={1.9} style={styles.phoneIcon} />
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Enter mobile number"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
            inputMode="tel"
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            maxLength={10}
            selectionColor="#00D2B4"
            editable={true}
          />
        </Pressable>
      </View>

      {/* Helper Subtext / Error message */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Text style={styles.helperText}>
          {authMode === 'signin'
            ? "We'll send an OTP to verify and log you in directly."
            : "We'll send an OTP to verify and set up your profile."}
        </Text>
      )}

      {/* Continue Action Button */}
      <TouchableOpacity
        style={[
          styles.continueButtonWrapper,
          !isFormValid && styles.continueButtonWrapperDisabled,
        ]}
        activeOpacity={0.88}
        onPress={handleContinue}
        disabled={!isFormValid || isLoading}
      >
        <LinearGradient
          colors={['#00E5C4', '#00D2B4', '#00C2A4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.continueButton}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>
                {authMode === 'signin' ? 'Sign In with OTP' : 'Sign Up with OTP'}
              </Text>
              <ArrowRight size={19} color="#FFFFFF" strokeWidth={2.6} />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Quick toggle link between Sign In & Sign Up */}
      <TouchableOpacity
        style={styles.switchModeButton}
        activeOpacity={0.7}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
        }}
      >
        <Text style={styles.switchModeText}>
          {authMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <Text style={styles.switchModeHighlight}>
            {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
          </Text>
        </Text>
      </TouchableOpacity>

      {/* Terms of Service & Privacy Policy */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text
            style={styles.termsLink}
            onPress={() => openLink('https://driverx.com/terms')}
          >
            Terms of Service
          </Text>
        </Text>
        <Text style={styles.termsText}>
          and{' '}
          <Text
            style={styles.termsLink}
            onPress={() => openLink('https://driverx.com/privacy')}
          >
            Privacy Policy.
          </Text>
        </Text>
      </View>
    </View>
  );

  // Country Picker Modal
  const renderCountryModal = () => (
    <Modal
      visible={isCountryModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsCountryModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setIsCountryModalVisible(false)}>
        <View style={[styles.modalOverlay, isDesktop && styles.modalOverlayDesktop]}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, (isDesktop || isDesktopOrTablet) && styles.modalContentDesktop]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Country</Text>
                <TouchableOpacity
                  onPress={() => setIsCountryModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Close country selector"
                >
                  <X size={22} color="#0E1E38" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={COUNTRIES}
                keyExtractor={(item) => item.code}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isSelected = item.code === selectedCountry.code;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.countryItem,
                        isSelected && styles.countryItemSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (Platform.OS === 'web' && typeof document !== 'undefined') {
                          (document.activeElement as HTMLElement)?.blur?.();
                        }
                        setSelectedCountry(item);
                        setIsCountryModalVisible(false);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      }}
                    >
                      <View style={styles.countryItemLeft}>
                        <Text style={styles.countryItemFlag}>{item.flag}</Text>
                        <Text style={styles.countryItemName}>{item.name}</Text>
                      </View>
                      <View style={styles.countryItemRight}>
                        <Text style={styles.countryItemDialCode}>{item.dialCode}</Text>
                        {isSelected && <Check size={18} color="#00D2B4" strokeWidth={2.5} />}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // DESKTOP SPLIT VIEW
  if (isDesktop) {
    return (
      <View style={styles.desktopOuterContainer}>
        <StatusBar style="dark" />

        {/* LEFT PANE: Hero with background, branding, title, badges, car & chauffeur */}
        <View style={styles.desktopLeftPane}>
          <Image
            source={require('../../assets/Login page image desktop.png')}
            style={styles.desktopBackgroundImage}
            resizeMode="cover"
          />

          <View style={styles.desktopHeroContent}>
            {/* Top Brand Logo */}
            <View style={styles.desktopBrandRow}>
              <Image
                source={require('../../assets/DriveX_Logo.png')}
                style={styles.desktopLogoEmblem}
                resizeMode="contain"
              />
              <View style={styles.brandTitleRow}>
                <Text style={styles.desktopBrandNavy}>Driver</Text>
                <Text style={styles.desktopBrandTeal}>X</Text>
              </View>
            </View>

            {/* Headline */}
            <View style={styles.desktopHeadlineSection}>
              <Text style={styles.desktopHeadlineNavy}>Your Journey</Text>
              <Text style={styles.desktopHeadlineTeal}>Starts Here</Text>
            </View>

            {/* Subtitle */}
            <Text style={styles.desktopSubtitle}>
              Safe, reliable and convenient driver service{"\n"}for any duration.
            </Text>

            {/* Feature Badges */}
            <View style={styles.desktopFeaturesRow}>
              {/* Badge 1: Verified Drivers */}
              <View style={styles.desktopFeatureItem}>
                <View style={styles.featureIconCircle}>
                  <ShieldCheck size={20} color="#00C4A7" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureLabel}>Verified{"\n"}Drivers</Text>
              </View>

              {/* Badge 2: Real-time Tracking */}
              <View style={styles.desktopFeatureItem}>
                <View style={styles.featureIconCircle}>
                  <Car size={20} color="#00C4A7" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureLabel}>Real-time{"\n"}Tracking</Text>
              </View>

              {/* Badge 3: Secure Payments */}
              <View style={styles.desktopFeatureItem}>
                <View style={styles.featureIconCircle}>
                  <CreditCard size={20} color="#00C4A7" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureLabel}>Secure{"\n"}Payments</Text>
              </View>

              {/* Badge 4: 24/7 Support */}
              <View style={styles.desktopFeatureItem}>
                <View style={styles.featureIconCircle}>
                  <Headphones size={20} color="#00C4A7" strokeWidth={2.2} />
                </View>
                <Text style={styles.featureLabel}>24/7{"\n"}Support</Text>
              </View>
            </View>
          </View>
        </View>

        {/* RIGHT PANE: Back button, Logo, Welcome Back, Form */}
        <View style={styles.desktopRightPane}>
          {/* Top navigation Back button */}
          <View style={styles.desktopTopBar}>
            <TouchableOpacity
              style={styles.desktopBackButton}
              activeOpacity={0.7}
              onPress={handleBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={18} color="#64748B" strokeWidth={2.2} />
              <Text style={styles.desktopBackText}>Back</Text>
            </TouchableOpacity>
          </View>

          {/* Form Content Area (Centered) */}
          <View style={styles.desktopFormWrapper}>
            <View style={styles.desktopFormContainer}>
              {/* Centered Brand Logo */}
              <View style={styles.desktopCenterLogoRow}>
                <Image
                  source={require('../../assets/DriveX_Logo.png')}
                  style={styles.desktopRightLogoEmblem}
                  resizeMode="contain"
                />
                <View style={styles.brandTitleRow}>
                  <Text style={styles.desktopCenterBrandNavy}>Driver</Text>
                  <Text style={styles.desktopCenterBrandTeal}>X</Text>
                </View>
              </View>

              {/* Welcome Back Heading */}
              <Text style={styles.desktopWelcomeTitle}>
                {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </Text>
              <Text style={styles.desktopWelcomeSubtitle}>
                {authMode === 'signin'
                  ? "Enter your mobile number to sign in directly with OTP."
                  : "Enter your mobile number to sign up and create your profile."}
              </Text>

              {/* Form Input & Actions */}
              {renderPhoneInput()}
            </View>
          </View>
        </View>

        {renderCountryModal()}
      </View>
    );
  }

  // MOBILE / TABLET VIEW
  const desktopFrameHeight = isDesktopOrTablet ? Math.min(windowHeight - 24, 880) : '100%';

  const screenBody = (
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
        {/* Background illustration containing car, road, phone pin graphic & bottom cityscape */}
        <View pointerEvents="none" style={styles.backgroundImage}>
          <Image
            source={require('../../assets/auth_background.png')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        </View>

        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
          {/* Top Navigation Bar with Back Button */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={handleBack}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={24} color="#0E1E38" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.contentContainer}
          >
            {/* Header Content Section */}
            <View style={styles.headerSection}>
              {/* DriverX Brand Logo & Wordmark */}
              <View style={styles.brandRow}>
                <Image
                  source={require('../../assets/DriveX_Logo.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
                <View style={styles.brandTitleRow}>
                  <Text style={styles.brandTitleNavy}>Driver</Text>
                  <Text style={styles.brandTitleTeal}>X</Text>
                </View>
              </View>

              {/* Title Section */}
              <View style={styles.titleContainer}>
                <Text style={styles.titleNavy}>
                  {authMode === 'signin' ? 'Welcome Back' : 'Get Started'}
                </Text>
                <Text style={styles.titleTeal}>
                  {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
                </Text>
              </View>

              {/* Subtitle Description */}
              <Text style={styles.subtitle}>
                {authMode === 'signin'
                  ? "Enter your mobile number to sign in directly with OTP."
                  : "Enter your mobile number to sign up and create your profile."}
              </Text>
            </View>

            {/* Input & Form Area */}
            {renderPhoneInput()}
          </KeyboardAvoidingView>
        </SafeAreaView>

        {renderCountryModal()}
      </View>
    </View>
  );

  // On Web, render screenBody directly without TouchableWithoutFeedback to prevent event interception
  if (Platform.OS === 'web') {
    return screenBody;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {screenBody}
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F3F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appFrame: {
    width: '100%',
    maxWidth: '100%',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  appFrameDesktop: {
    maxWidth: 440,
    borderRadius: 24,
    marginVertical: 24,
    shadowColor: '#071226',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  topBar: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: 'flex-start',
  },
  headerSection: {
    marginTop: 4,
    width: '68%', // Leaves space for the top-right illustration
  },
  brandRow: {
    marginBottom: 8,
  },
  logoImage: {
    width: 72,
    height: 34,
    marginBottom: 4,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitleNavy: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: '#0E1E38',
    letterSpacing: -0.5,
  },
  brandTitleTeal: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: '#00D2B4',
    letterSpacing: -0.5,
  },
  titleContainer: {
    marginTop: 6,
    marginBottom: 10,
  },
  titleNavy: {
    fontFamily: FONT.bold,
    fontSize: 27,
    color: '#0C1E3D',
    letterSpacing: -0.4,
    lineHeight: 33,
  },
  titleTeal: {
    fontFamily: FONT.bold,
    fontSize: 27,
    color: '#00D2B4',
    letterSpacing: -0.4,
    lineHeight: 33,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 19.5,
  },
  formSection: {
    marginTop: 20,
  },
  authModeTabs: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  authModeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  authModeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0E1E38',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  authModeTabText: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: '#64748B',
  },
  authModeTabTextActive: {
    color: '#0E1E38',
    fontFamily: FONT.bold,
  },
  switchModeButton: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  switchModeText: {
    fontFamily: FONT.regular,
    fontSize: 13.5,
    color: '#64748B',
  },
  switchModeHighlight: {
    fontFamily: FONT.bold,
    color: '#00D2B4',
    textDecorationLine: 'underline',
  },
  inputLabel: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#0E1E38',
    marginBottom: 9,
  },
  inputCard: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#DDE4EE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    zIndex: 2,
  },
  inputCardFocused: {
    borderColor: '#00D2B4',
    borderWidth: 1.5,
    shadowColor: '#00D2B4',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },
  flagBadge: {
    width: 24,
    height: 16,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 0.6,
    borderColor: '#D0D8E2',
    marginRight: 6,
  },
  flagStripe: {
    flex: 1,
    width: '100%',
  },
  ashokaChakra: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    borderWidth: 0.7,
    borderColor: '#000080',
  },
  flagEmoji: {
    fontSize: 19,
    marginRight: 6,
  },
  countryCodeText: {
    fontFamily: FONT.semiBold,
    fontSize: 15,
    color: '#0E1E38',
  },
  chevronIcon: {
    marginLeft: 4,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  phoneInputRow: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneIcon: {
    marginRight: 8,
  },
  textInput: {
    fontFamily: FONT.medium,
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#0E1E38',
    paddingVertical: 0,
    paddingHorizontal: 4,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
        } as any)
      : {}),
  },
  helperText: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 8,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#EF4444',
    marginTop: 8,
  },
  continueButtonWrapper: {
    marginTop: 26,
    borderRadius: 27,
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 6,
  },
  continueButtonWrapperDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
    opacity: 0.65,
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
    fontSize: 16.5,
    color: '#FFFFFF',
  },
  termsContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  termsText: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    fontFamily: FONT.medium,
    color: '#00A896',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 18, 38, 0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalOverlayDesktop: {
    justifyContent: 'center',
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 22,
    paddingBottom: 36,
    maxHeight: '65%',
  },
  modalContentDesktop: {
    maxWidth: 440,
    borderRadius: 24,
    marginBottom: 0,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontFamily: FONT.bold,
    fontSize: 17,
    color: '#0E1E38',
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  countryItemSelected: {
    backgroundColor: '#F0FDF9',
  },
  countryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countryItemFlag: {
    fontSize: 22,
  },
  countryItemName: {
    fontFamily: FONT.medium,
    fontSize: 15,
    color: '#0E1E38',
  },
  countryItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryItemDialCode: {
    fontFamily: FONT.semiBold,
    fontSize: 14.5,
    color: '#64748B',
  },

  // Desktop specific styles
  desktopOuterContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  desktopLeftPane: {
    flex: 1.35,
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#EBF6FC',
  },
  desktopBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web'
      ? ({
          objectFit: 'cover',
          objectPosition: '-80px bottom',
        } as any)
      : {}),
  },
  desktopHeroContent: {
    flex: 1,
    paddingTop: 36,
    paddingHorizontal: 48,
    zIndex: 1,
  },
  desktopBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 26,
  },
  desktopLogoEmblem: {
    width: 42,
    height: 28,
  },
  desktopBrandNavy: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: '#0E1E38',
    letterSpacing: -0.5,
  },
  desktopBrandTeal: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: '#00D2B4',
    letterSpacing: -0.5,
  },
  desktopHeadlineSection: {
    marginBottom: 10,
  },
  desktopHeadlineNavy: {
    fontFamily: FONT.bold,
    fontSize: 38,
    color: '#0E1E38',
    letterSpacing: -0.8,
    lineHeight: 44,
  },
  desktopHeadlineTeal: {
    fontFamily: FONT.bold,
    fontSize: 38,
    color: '#00D2B4',
    letterSpacing: -0.8,
    lineHeight: 44,
  },
  desktopSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 14.5,
    color: '#556987',
    lineHeight: 22,
    marginBottom: 22,
    maxWidth: 440,
  },
  desktopFeaturesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  desktopFeatureItem: {
    alignItems: 'center',
    width: 74,
  },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6FAF7',
    borderWidth: 1.2,
    borderColor: '#C3F3EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureLabel: {
    fontFamily: FONT.medium,
    fontSize: 11.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 15,
  },
  desktopRightPane: {
    flex: 1,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#F1F5F9',
  },
  desktopTopBar: {
    paddingTop: 36,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'flex-start',
  },
  desktopBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginLeft: -8,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  desktopBackText: {
    fontFamily: FONT.medium,
    fontSize: 14.5,
    color: '#64748B',
  },
  desktopFormWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    paddingBottom: 48,
  },
  desktopFormContainer: {
    width: '100%',
    maxWidth: 420,
  },
  desktopCenterLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 34,
  },
  desktopRightLogoEmblem: {
    width: 52,
    height: 36,
  },
  desktopCenterBrandNavy: {
    fontFamily: FONT.bold,
    fontSize: 32,
    color: '#0E1E38',
    letterSpacing: -0.6,
  },
  desktopCenterBrandTeal: {
    fontFamily: FONT.bold,
    fontSize: 32,
    color: '#00D2B4',
    letterSpacing: -0.6,
  },
  desktopWelcomeTitle: {
    fontFamily: FONT.bold,
    fontSize: 32,
    color: '#0E1E38',
    letterSpacing: -0.6,
    marginBottom: 8,
  },
  desktopWelcomeSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 28,
  },
});
