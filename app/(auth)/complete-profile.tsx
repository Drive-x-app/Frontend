import React, { useState } from 'react';
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
  ScrollView,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  User,
  Mail,
  MapPin,
  Globe,
  ChevronDown,
  Info,
  Check,
  X,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../src/store/authStore';
import { FONT } from '../../src/theme/typography';

const POPULAR_CITIES = [
  'Coimbatore',
  'Chennai',
  'Bangalore',
  'Hyderabad',
  'Madurai',
  'Salem',
  'Trichy',
  'Kochi',
  'Mumbai',
  'Delhi NCR',
];

const LANGUAGES = [
  { label: 'English', sub: 'English' },
  { label: 'Tamil', sub: 'தமிழ்' },
  { label: 'Hindi', sub: 'हिन्दी' },
  { label: 'Telugu', sub: 'తెలుగు' },
  { label: 'Kannada', sub: 'ಕನ್ನಡ' },
  { label: 'Malayalam', sub: 'മലയാളം' },
];

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktop = windowWidth >= 960;
  const isDesktopOrTablet = windowWidth > 600;

  // Global Auth Store
  const completeProfile = useAuthStore((state) => state.completeProfile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCity, setSelectedCity] = useState('Coimbatore');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Modals & Active focus
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/otp');
    }
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow media access to upload your profile photo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch {
      // Fallback
    }
  };

  const handleSaveAndContinue = async () => {
    if (!fullName.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setValidationError('Please enter your full name');
      return;
    }

    setValidationError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const result = await completeProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      city: selectedCity,
      preferredLanguage: selectedLanguage,
      avatarUrl: avatarUri || undefined,
    });

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace('/(customer)');
    }
  };

  const showInfoNotice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Alert.alert(
      'Profile Photo Guidelines',
      'A clear, friendly face photo helps your drivers recognize and identify you seamlessly at pickup locations.'
    );
  };

  const isFormValid = fullName.trim().length > 0;
  const desktopFrameHeight = isDesktopOrTablet ? Math.min(windowHeight - 24, 880) : '100%';

  const renderContent = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title & Subtitle */}
      <View style={styles.headerSection}>
        <Text style={styles.titleText}>Complete Your Profile</Text>
        <Text style={styles.subtitleText}>
          Add a few details to get started with DriverX.
        </Text>
      </View>

      {/* Profile Photo Card */}
      <View style={styles.photoCard}>
        {/* Avatar with Camera Badge */}
        <TouchableOpacity
          style={styles.avatarContainer}
          activeOpacity={0.85}
          onPress={pickImage}
          accessibilityLabel="Change profile picture"
        >
          <Image
            source={
              avatarUri
                ? { uri: avatarUri }
                : require('../../assets/avatar_user.jpg')
            }
            style={styles.avatarImage}
            resizeMode="cover"
          />
          <View style={styles.cameraBadge}>
            <Camera size={13} color="#FFFFFF" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>

        {/* Photo Info & Upload Button */}
        <View style={styles.photoInfoCol}>
          <View style={styles.photoTitleRow}>
            <Text style={styles.photoTitle}>Profile Photo</Text>
            <TouchableOpacity
              onPress={showInfoNotice}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Photo information"
            >
              <Info size={16} color="#94A3B8" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <Text style={styles.photoSubtext}>
            Add a clear photo to help us give you a better experience.
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImage}
            activeOpacity={0.75}
          >
            <Camera size={14} color="#0E1E38" strokeWidth={2.2} style={{ marginRight: 6 }} />
            <Text style={styles.uploadButtonText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Form Fields */}
      <View style={styles.formSection}>
        {/* Full Name */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>
            Full Name <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View
            style={[
              styles.inputCard,
              focusedField === 'fullName' && styles.inputCardFocused,
              validationError && !fullName.trim() && styles.inputCardError,
            ]}
          >
            <User size={18} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (validationError) setValidationError(null);
              }}
              onFocus={() => setFocusedField('fullName')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="words"
              selectionColor="#00D2B4"
            />
          </View>
          {validationError && !fullName.trim() ? (
            <Text style={styles.fieldErrorText}>{validationError}</Text>
          ) : null}
        </View>

        {/* Email Address */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          <View
            style={[
              styles.inputCard,
              focusedField === 'email' && styles.inputCardFocused,
            ]}
          >
            <Mail size={18} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email address (optional)"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              selectionColor="#00D2B4"
            />
          </View>
        </View>

        {/* City Dropdown Selector */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>City</Text>
          <TouchableOpacity
            style={styles.inputCard}
            activeOpacity={0.75}
            onPress={() => {
              Keyboard.dismiss();
              setIsCityModalVisible(true);
            }}
          >
            <MapPin size={18} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />
            <Text style={[styles.selectValueText, !selectedCity && styles.placeholderText]}>
              {selectedCity || 'Select your city'}
            </Text>
            <ChevronDown size={18} color="#94A3B8" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Preferred Language Selector */}
        <View style={styles.fieldWrapper}>
          <Text style={styles.fieldLabel}>Preferred Language</Text>
          <TouchableOpacity
            style={styles.inputCard}
            activeOpacity={0.75}
            onPress={() => {
              Keyboard.dismiss();
              setIsLanguageModalVisible(true);
            }}
          >
            <Globe size={18} color="#94A3B8" strokeWidth={2} style={styles.fieldIcon} />
            <Text style={styles.selectValueText}>
              {selectedLanguage}
            </Text>
            <ChevronDown size={18} color="#94A3B8" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Global store error if any */}
      {storeError ? (
        <Text style={styles.globalErrorText}>{storeError}</Text>
      ) : null}

      {/* Save & Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButtonWrapper,
            (!isFormValid || isLoading) && styles.submitButtonDisabled,
          ]}
          activeOpacity={0.88}
          onPress={handleSaveAndContinue}
          disabled={!isFormValid || isLoading}
        >
          <LinearGradient
            colors={['#00E5C4', '#00D2B4', '#00C2A4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitButton}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.submitButtonText}>Save & Continue</Text>
                <ArrowRight size={19} color="#FFFFFF" strokeWidth={2.6} style={styles.buttonIcon} />
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const screenBody = (
    <View style={styles.outerContainer}>
      <StatusBar style="dark" />

      <View
        style={[
          styles.appFrame,
          isDesktopOrTablet
            ? [styles.appFrameDesktop, { height: desktopFrameHeight }]
            : { height: '100%', flex: 1 },
        ]}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
          {/* Top Navigation Bar with Back Button & Centered Logo */}
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

            <View style={styles.centeredLogoRow}>
              <Image
                source={require('../../assets/DriveX_Logo.png')}
                style={styles.topLogoImage}
                resizeMode="contain"
              />
              <View style={styles.brandTitleRow}>
                <Text style={styles.brandTitleNavy}>Driver</Text>
                <Text style={styles.brandTitleTeal}>X</Text>
              </View>
            </View>

            <View style={styles.topBarRightSpacer} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.flexOne}
          >
            {renderContent()}
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* City Selection Modal */}
        <Modal
          visible={isCityModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsCityModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsCityModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select City</Text>
                    <TouchableOpacity
                      onPress={() => setIsCityModalVisible(false)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X size={20} color="#0E1E38" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={POPULAR_CITIES}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => {
                      const isSelected = item === selectedCity;
                      return (
                        <TouchableOpacity
                          style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                          onPress={() => {
                            setSelectedCity(item);
                            setIsCityModalVisible(false);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          }}
                        >
                          <Text
                            style={[
                              styles.modalItemText,
                              isSelected && styles.modalItemTextSelected,
                            ]}
                          >
                            {item}
                          </Text>
                          {isSelected && <Check size={18} color="#00D2B4" strokeWidth={2.5} />}
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Language Selection Modal */}
        <Modal
          visible={isLanguageModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsLanguageModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsLanguageModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Preferred Language</Text>
                    <TouchableOpacity
                      onPress={() => setIsLanguageModalVisible(false)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X size={20} color="#0E1E38" />
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={LANGUAGES}
                    keyExtractor={(item) => item.label}
                    renderItem={({ item }) => {
                      const isSelected = item.label === selectedLanguage;
                      return (
                        <TouchableOpacity
                          style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                          onPress={() => {
                            setSelectedLanguage(item.label);
                            setIsLanguageModalVisible(false);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          }}
                        >
                          <View>
                            <Text
                              style={[
                                styles.modalItemText,
                                isSelected && styles.modalItemTextSelected,
                              ]}
                            >
                              {item.label}
                            </Text>
                            <Text style={styles.modalItemSub}>{item.sub}</Text>
                          </View>
                          {isSelected && <Check size={18} color="#00D2B4" strokeWidth={2.5} />}
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
  },
  flexOne: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  centeredLogoRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLogoImage: {
    width: 52,
    height: 24,
    marginBottom: 1,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitleNavy: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  brandTitleTeal: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: '#00D2B4',
    letterSpacing: -0.4,
  },
  topBarRightSpacer: {
    width: 40,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 10,
  },
  headerSection: {
    marginTop: 4,
    marginBottom: 20,
  },
  titleText: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  subtitleText: {
    fontFamily: FONT.regular,
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 4,
  },

  /* Profile Photo Card */
  photoCard: {
    backgroundColor: '#FAFCFE',
    borderWidth: 1.2,
    borderColor: '#EBF1F7',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarImage: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#E2E8F0',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#00D2B4',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInfoCol: {
    flex: 1,
  },
  photoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  photoTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 14.5,
    color: '#0E1E38',
  },
  photoSubtext: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 10,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E6FAF7',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    fontFamily: FONT.semiBold,
    fontSize: 12.5,
    color: '#0E1E38',
  },

  /* Form Section */
  formSection: {
    marginBottom: 14,
  },
  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: FONT.medium,
    fontSize: 13.5,
    color: '#0E1E38',
    marginBottom: 7,
  },
  requiredStar: {
    color: '#EF4444',
  },
  inputCard: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#DDE4EE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputCardFocused: {
    borderColor: '#00D2B4',
    borderWidth: 1.5,
    shadowColor: '#00D2B4',
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  inputCardError: {
    borderColor: '#EF4444',
  },
  fieldIcon: {
    marginRight: 10,
  },
  textInput: {
    fontFamily: FONT.medium,
    flex: 1,
    height: 48,
    fontSize: 14.5,
    color: '#0E1E38',
    paddingVertical: 0,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
        } as any)
      : {}),
  },
  selectValueText: {
    fontFamily: FONT.medium,
    flex: 1,
    fontSize: 14.5,
    color: '#0E1E38',
  },
  placeholderText: {
    color: '#94A3B8',
  },
  fieldErrorText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#EF4444',
    marginTop: 5,
    marginLeft: 2,
  },
  globalErrorText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 12,
  },

  /* Save & Continue Button */
  buttonContainer: {
    marginTop: 10,
  },
  submitButtonWrapper: {
    borderRadius: 27,
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 2,
    opacity: 0.65,
  },
  submitButton: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginLeft: 8,
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 30, 56, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: FONT.bold,
    fontSize: 17,
    color: '#0E1E38',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderBottomWidth: 0.8,
    borderBottomColor: '#F8FAFC',
  },
  modalItemSelected: {
    backgroundColor: '#F0FDFB',
    borderRadius: 8,
  },
  modalItemText: {
    fontFamily: FONT.medium,
    fontSize: 15,
    color: '#0E1E38',
  },
  modalItemTextSelected: {
    fontFamily: FONT.semiBold,
    color: '#00D2B4',
  },
  modalItemSub: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
});
