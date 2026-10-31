import React, { useState, useRef, useEffect } from 'react';
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
  Pencil,
  ShieldCheck,
  RotateCw,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../src/store/authStore';
import { FONT } from '../../src/theme/typography';

const OTP_LENGTH = 6;
const INITIAL_TIMER_SECONDS = 30;

export default function OtpScreen() {
  const router = useRouter();
  const inputRef = useRef<any>(null);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktop = windowWidth >= 960;
  const isDesktopOrTablet = windowWidth > 600;

  // Zustand State
  const phoneNumber = useAuthStore((state) => state.phoneNumber);
  const selectedCountry = useAuthStore((state) => state.selectedCountry);
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const requestOtp = useAuthStore((state) => state.requestOtp);

  // Local State
  const [otp, setOtp] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(INITIAL_TIMER_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  // Format display phone: +91 98765 43210
  const displayPhone = React.useMemo(() => {
    const code = selectedCountry?.dialCode || '+91';
    const raw = phoneNumber.trim() || '9876543210';
    if (raw.length === 10) {
      return `${code} ${raw.slice(0, 5)} ${raw.slice(5)}`;
    }
    return `${code} ${raw}`;
  }, [phoneNumber, selectedCountry]);

  // Timer countdown
  useEffect(() => {
    if (timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerSeconds]);

  // Focus input automatically on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      (document.activeElement as HTMLElement)?.blur?.();
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtp(cleaned);
    setErrorMessage(null);

    // Auto verify once 6 digits are typed
    if (cleaned.length === OTP_LENGTH) {
      handleVerify(cleaned);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify ?? otp;
    if (code.length < OTP_LENGTH || isVerifying) {
      return;
    }

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      (document.activeElement as HTMLElement)?.blur?.();
    }
    inputRef.current?.blur?.();
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const result = await verifyOtp(code);
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        if (result.isNewUser) {
          router.replace('/(auth)/complete-profile');
        } else {
          router.replace('/(customer)');
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        setErrorMessage(result.error || 'Invalid verification code. Please try again.');
      }
    } catch {
      setErrorMessage('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timerSeconds > 0 || isResending) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsResending(true);
    setErrorMessage(null);
    setResendFeedback(null);

    try {
      const res = await requestOtp();
      if (res.success) {
        setTimerSeconds(INITIAL_TIMER_SECONDS);
        setOtp('');
        setResendFeedback('New 6-digit code has been sent!');
        setTimeout(() => setResendFeedback(null), 3500);
        inputRef.current?.focus();
      } else {
        setErrorMessage('Failed to resend code. Please try again.');
      }
    } catch {
      setErrorMessage('Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  // Format timer as 00:SS
  const formattedTimer = `00:${timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}`;

  const desktopFrameHeight = isDesktopOrTablet ? Math.min(windowHeight - 24, 880) : '100%';

  const renderContent = () => (
    <View style={styles.contentWrapper}>
      {/* Top Header & Graphic Section */}
      <View style={styles.topHeaderContainer}>
        {/* Left Side: Brand, Headline, Number */}
        <View style={styles.headerLeftCol}>
          {/* Brand Logo & Wordmark */}
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

          {/* Heading */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleNavy}>Verify Your</Text>
            <Text style={styles.titleTeal}>Mobile Number</Text>
          </View>

          {/* Description */}
          <Text style={styles.descriptionText}>
            We have sent a 6-digit verification code to your mobile number
          </Text>

          {/* Phone Number with Edit Pencil Icon */}
          <View style={styles.phoneRow}>
            <Text style={styles.phoneNumberText}>{displayPhone}</Text>
            <TouchableOpacity
              style={styles.editIconButton}
              onPress={handleBack}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Edit mobile number"
            >
              <Pencil size={15} color="#00D2B4" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Side: 3D Phone & Shield Illustration */}
        <View style={styles.illustrationWrapper} pointerEvents="none">
          <View style={styles.illustrationBackdrop} />
          <Image
            source={require('../../assets/otp_illustration.jpg')}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Verification Code Form Section */}
      <View style={styles.formSection}>
        <Text style={styles.inputLabel}>Enter Verification Code</Text>

        {/* 6 OTP Code Input Boxes */}
        <Pressable
          style={styles.otpBoxesRow}
          onPress={() => inputRef.current?.focus()}
          accessibilityLabel="OTP Code Input"
        >
          {Array.from({ length: OTP_LENGTH }).map((_, index) => {
            const digit = otp[index];
            const isCurrentBox = isFocused && index === otp.length;
            const isFilled = digit !== undefined && digit !== '';
            const hasError = !!errorMessage;

            return (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  isFilled && styles.otpBoxFilled,
                  isCurrentBox && styles.otpBoxActive,
                  hasError && styles.otpBoxError,
                ]}
              >
                {isFilled ? (
                  <Text style={styles.otpDigitText}>{digit}</Text>
                ) : isCurrentBox ? (
                  <View style={styles.cursorBar} />
                ) : (
                  <View style={styles.dotPlaceholder} />
                )}
              </View>
            );
          })}
        </Pressable>

        {/* Hidden underlying TextInput */}
        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={handleOtpChange}
          maxLength={OTP_LENGTH}
          keyboardType="number-pad"
          inputMode="numeric"
          returnKeyType="done"
          onSubmitEditing={() => handleVerify()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          caretHidden
          style={styles.hiddenInput}
          autoComplete={Platform.OS === 'web' ? 'one-time-code' : 'sms-otp'}
          textContentType="oneTimeCode"
        />

        {/* Error or Resend Feedback */}
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : resendFeedback ? (
          <Text style={styles.feedbackText}>{resendFeedback}</Text>
        ) : null}

        {/* Resend Code Section */}
        <View style={styles.resendRow}>
          <Text style={styles.resendPrompt}>Didn't receive the code? </Text>
          {timerSeconds > 0 ? (
            <Text style={styles.timerLink}>
              Resend in {formattedTimer}
            </Text>
          ) : (
            <TouchableOpacity
              onPress={handleResend}
              disabled={isResending}
              activeOpacity={0.7}
              style={styles.resendBtn}
            >
              {isResending ? (
                <ActivityIndicator size="small" color="#00D2B4" style={{ marginRight: 4 }} />
              ) : null}
              <Text style={styles.resendActiveLink}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Action Button */}
        <TouchableOpacity
          style={[
            styles.verifyButtonWrapper,
            (otp.length < OTP_LENGTH || isVerifying) && styles.verifyButtonDisabled,
          ]}
          activeOpacity={0.88}
          onPress={() => handleVerify()}
          disabled={otp.length < OTP_LENGTH || isVerifying}
        >
          <LinearGradient
            colors={['#00E5C4', '#00D2B4', '#00C2A4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.verifyButton}
          >
            {isVerifying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.verifyButtonContent}>
                <Text style={styles.verifyButtonText}>Verify</Text>
                <ArrowRight size={19} color="#FFFFFF" strokeWidth={2.6} style={styles.arrowIcon} />
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const screenBody = (
    <View style={styles.outerContainer}>
      <StatusBar style="dark" />

      {/* Frame Container */}
      <View
        style={[
          styles.appFrame,
          isDesktopOrTablet
            ? [styles.appFrameDesktop, { height: desktopFrameHeight }]
            : { height: '100%', flex: 1 },
        ]}
      >
        {/* Bottom Cityscape & Highway Background Graphic */}
        <View pointerEvents="none" style={styles.bottomGraphicContainer}>
          <Image
            source={require('../../assets/auth_background.png')}
            style={styles.bottomGraphicImage}
            resizeMode="cover"
          />
        </View>

        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
          {/* Top Bar with Back Button */}
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
            style={styles.keyboardContainer}
          >
            {renderContent()}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </View>
  );

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
  safeArea: {
    flex: 1,
    zIndex: 2,
  },
  topBar: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  keyboardContainer: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 22,
    zIndex: 3,
  },

  /* Top Header with Split Columns */
  topHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
    minHeight: 190,
  },
  headerLeftCol: {
    flex: 1,
    paddingRight: 10,
    zIndex: 4,
  },
  brandRow: {
    marginBottom: 6,
  },
  logoImage: {
    width: 68,
    height: 32,
    marginBottom: 2,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitleNavy: {
    fontFamily: FONT.bold,
    fontSize: 21,
    color: '#0E1E38',
    letterSpacing: -0.5,
  },
  brandTitleTeal: {
    fontFamily: FONT.bold,
    fontSize: 21,
    color: '#00D2B4',
    letterSpacing: -0.5,
  },
  titleContainer: {
    marginTop: 8,
    marginBottom: 6,
  },
  titleNavy: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: '#0E1E38',
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  titleTeal: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: '#00D2B4',
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  descriptionText: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 220,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  phoneNumberText: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#0E1E38',
    letterSpacing: 0.3,
  },
  editIconButton: {
    marginLeft: 7,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Top Right 3D Phone & Shield Illustration */
  illustrationWrapper: {
    width: 140,
    height: 180,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -10,
    marginTop: -8,
  },
  illustrationBackdrop: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#E6FAF7',
    top: 15,
    right: 0,
    opacity: 0.85,
  },
  illustrationImage: {
    width: 135,
    height: 165,
    zIndex: 2,
  },

  /* Form & OTP Input Boxes */
  formSection: {
    marginTop: 22,
    zIndex: 5,
  },
  inputLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: '#0E1E38',
    marginBottom: 12,
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: '#CBD5E1',
    backgroundColor: '#FAFCFF',
  },
  otpBoxActive: {
    borderColor: '#00D2B4',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#00D2B4',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  otpBoxError: {
    borderColor: '#EF4444',
    borderWidth: 1.8,
  },
  otpDigitText: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: '#0E1E38',
  },
  cursorBar: {
    width: 2,
    height: 24,
    backgroundColor: '#00D2B4',
    borderRadius: 1,
  },
  dotPlaceholder: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0.01,
    width: '100%',
    height: 56,
    top: 30,
    left: 0,
    zIndex: -1,
  },

  /* Resend & Feedback */
  errorText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#EF4444',
    marginTop: 10,
    textAlign: 'center',
  },
  feedbackText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#059669',
    marginTop: 10,
    textAlign: 'center',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  resendPrompt: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#64748B',
  },
  timerLink: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: '#00D2B4',
    textDecorationLine: 'underline',
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendActiveLink: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#00D2B4',
    textDecorationLine: 'underline',
  },

  /* Verify Button */
  verifyButtonWrapper: {
    marginTop: 32,
    borderRadius: 27,
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 6,
  },
  verifyButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
    opacity: 0.65,
  },
  verifyButton: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  arrowIcon: {
    marginLeft: 8,
  },

  /* Bottom Graphic */
  bottomGraphicContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 320,
    overflow: 'hidden',
    zIndex: 1,
  },
  bottomGraphicImage: {
    width: '100%',
    height: 600,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
