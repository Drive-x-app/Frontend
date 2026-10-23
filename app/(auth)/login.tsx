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
import { ArrowLeft, ArrowRight, Phone, ChevronDown, Check, X } from 'lucide-react-native';
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
  const isDesktopOrTablet = windowWidth > 600;

  // Zustand Global State
  const phoneNumber = useAuthStore((state) => state.phoneNumber);
  const selectedCountry = useAuthStore((state) => state.selectedCountry);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const setPhoneNumber = useAuthStore((state) => state.setPhoneNumber);
  const setSelectedCountry = useAuthStore((state) => state.setSelectedCountry);
  const requestOtp = useAuthStore((state) => state.requestOtp);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const result = await requestOtp();
    if (result.success) {
      router.push('/(customer)');
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

  const screenBody = (
    <View style={styles.outerContainer}>
      <StatusBar style="dark" />

      {/* Responsive App Frame (centers on tablet/desktop while maintaining 100% on mobile) */}
      <View style={[styles.appFrame, isDesktopOrTablet && styles.appFrameDesktop, { minHeight: windowHeight }]}>
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
                <Text style={styles.titleNavy}>Your Journey</Text>
                <Text style={styles.titleTeal}>Starts Here</Text>
              </View>

              {/* Subtitle Description */}
              <Text style={styles.subtitle}>
                Enter your mobile number to continue.{"\n"}We'll send you a verification code.
              </Text>
            </View>

            {/* Input & Form Area */}
            <View style={styles.formSection}>
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
                  We'll use this number to verify your account.
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
                    <ActivityIndicator size="small" color="#072038" />
                  ) : (
                    <>
                      <Text style={styles.continueButtonText}>Continue</Text>
                      <ArrowRight size={19} color="#072038" strokeWidth={2.6} />
                    </>
                  )}
                </LinearGradient>
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
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Country Picker Modal */}
        <Modal
          visible={isCountryModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsCountryModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsCountryModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={[styles.modalContent, isDesktopOrTablet && styles.modalContentDesktop]}>
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
    marginTop: 34,
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
    color: '#072038',
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 40,
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
});
