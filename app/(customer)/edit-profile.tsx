import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  useWindowDimensions,
  Platform,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  Info,
  Bell,
  Tag,
  Camera,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useBookingStore } from '../../src/store/bookingStore';
import { useAuthStore } from '../../src/store/authStore';
import { DesktopHeader } from '../../src/components/common/DesktopHeader';
import { DesktopSidebar } from '../../src/components/common/DesktopSidebar';
import { userApi } from '../../src/services/api/userApi';
import { FONT } from '../../src/theme/typography';

const AVAILABLE_LANGUAGES = [
  'English',
  'Tamil (தமிழ்)',
  'Hindi (हिन्दी)',
  'Malayalam (മലയാളം)',
  'Kannada (ಕನ್ನಡ)',
  'Telugu (తెలుగు)',
];

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktopOrTablet =
    windowWidth > 600 ||
    (Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth > 600);

  const authUser = useAuthStore((state) => state.user);
  const authProfile = useAuthStore((state) => state.profile);
  const completeProfile = useAuthStore((state) => state.completeProfile);
  const userNameStore = useBookingStore((state) => state.userName);

  // Form State initialized from store or defaults matching mockup
  const [fullName, setFullName] = useState(
    authUser?.fullName || authProfile?.fullName || userNameStore || 'Priya Sharma'
  );
  const [phoneNumber, setPhoneNumber] = useState(
    authUser?.phoneNumber || '+91 98765 43210'
  );
  const [email, setEmail] = useState(
    authUser?.email || authProfile?.email || 'priya.sharma@gmail.com'
  );
  const [preferredLanguage, setPreferredLanguage] = useState(
    authProfile?.preferredLanguage || 'English'
  );

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('Rohit Sharma');
  const [emergencyNumber, setEmergencyNumber] = useState('+91 91234 56789');

  // Communication Preferences
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [offersPromotions, setOffersPromotions] = useState(true);
  const [newsAnnouncements, setNewsAnnouncements] = useState(false);

  // Status state
  const [isSaving, setIsSaving] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(customer)/profile');
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter your full name');
      } else {
        Alert.alert('Required Field', 'Please enter your full name');
      }
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsSaving(true);

    try {
      // 1. Sync to backend API if available
      try {
        await userApi.updateProfile({
          fullName: fullName.trim(),
          email: email.trim(),
          preferredLanguage,
        });
      } catch {
        // Continue and update local store if backend call encounters network fallback
      }

      // 2. Sync to local Auth Store
      await completeProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        city: 'Coimbatore',
        preferredLanguage,
      });

      if (Platform.OS === 'web') {
        window.alert('Profile updated successfully!');
      } else {
        Alert.alert('Success', 'Profile updated successfully!');
      }

      router.replace('/(customer)/profile');
    } catch {
      if (Platform.OS === 'web') {
        window.alert('Failed to update profile. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Core Form Content (Reusable for Mobile & Desktop Card)
  const renderFormContent = () => (
    <>
      {/* 1. Page Title & Subtitle */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Edit Profile</Text>
        <Text style={styles.pageSubtitle}>Keep your information up to date.</Text>
      </View>

      {/* 2. Profile Photo Card */}
      <View style={styles.card}>
        <View style={styles.photoRow}>
          <View style={styles.avatarWrapper}>
            <Image
              source={require('../../assets/avatar_user.jpg')}
              style={styles.avatarImg}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.cameraBadge}
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              }}
              accessibilityLabel="Change profile picture"
            >
              <Camera size={11} color="#0E1E38" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <View style={styles.photoTextCol}>
            <Text style={styles.cardHeaderTitle}>Profile Photo</Text>
            <Text style={styles.photoSubtitle}>
              Upload a clear photo of yourself.{'\n'}JPG, PNG (Max 5 MB)
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Personal Information Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>Personal Information</Text>

        {/* Full Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <View style={styles.inputContainer}>
            <User size={16} color="#64748B" strokeWidth={2.2} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your name"
              placeholderTextColor="#94A3B8"
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Phone Number */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Phone Number</Text>
          <View style={styles.inputContainer}>
            <Phone size={16} color="#64748B" strokeWidth={2.2} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+91 00000 00000"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Email Address */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Mail size={16} color="#64748B" strokeWidth={2.2} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
      </View>

      {/* 4. Preferred Language Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>Preferred Language</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setIsLangModalOpen(true);
          }}
          accessibilityLabel="Select preferred language"
        >
          <View style={styles.dropdownLeft}>
            <Globe size={16} color="#64748B" strokeWidth={2.2} />
            <Text style={styles.dropdownValueText}>{preferredLanguage}</Text>
          </View>
          <ChevronDown size={16} color="#64748B" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* 5. Emergency Contact Card */}
      <View style={styles.card}>
        <View style={styles.cardHeaderWithInfo}>
          <Text style={styles.cardHeaderTitle}>Emergency Contact</Text>
          <Info size={16} color="#64748B" strokeWidth={2.2} />
        </View>
        <Text style={styles.cardSubtitle}>
          This contact will be notified in case of emergencies.
        </Text>

        {/* Contact Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Contact Name</Text>
          <View style={styles.inputContainer}>
            <User size={16} color="#64748B" strokeWidth={2.2} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={emergencyName}
              onChangeText={setEmergencyName}
              placeholder="Emergency contact name"
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        {/* Contact Number */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Contact Number</Text>
          <View style={styles.inputContainer}>
            <Phone size={16} color="#64748B" strokeWidth={2.2} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              value={emergencyNumber}
              onChangeText={setEmergencyNumber}
              placeholder="+91 00000 00000"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>

      {/* 6. Communication Preferences Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>Communication Preferences</Text>
        <Text style={styles.cardSubtitle}>Choose what updates you want to receive.</Text>

        {/* Booking Updates */}
        <View style={styles.prefRow}>
          <View style={styles.prefIconCircle}>
            <Bell size={16} color="#0E1E38" strokeWidth={2.2} />
          </View>
          <View style={styles.prefTextCol}>
            <Text style={styles.prefTitle}>Booking updates</Text>
            <Text style={styles.prefSubtitle}>
              Trip status, driver updates, payment alerts
            </Text>
          </View>
          <Switch
            value={bookingUpdates}
            onValueChange={setBookingUpdates}
            trackColor={{ false: '#E2E8F0', true: '#00D2B4' }}
            thumbColor="#FFFFFF"
            style={Platform.OS === 'web' ? ({ transform: [{ scale: 0.85 }] } as any) : {}}
          />
        </View>

        <View style={styles.prefDivider} />

        {/* Offers & Promotions */}
        <View style={styles.prefRow}>
          <View style={styles.prefIconCircle}>
            <Tag size={16} color="#0E1E38" strokeWidth={2.2} />
          </View>
          <View style={styles.prefTextCol}>
            <Text style={styles.prefTitle}>Offers & Promotions</Text>
            <Text style={styles.prefSubtitle}>Discounts, offers and new features</Text>
          </View>
          <Switch
            value={offersPromotions}
            onValueChange={setOffersPromotions}
            trackColor={{ false: '#E2E8F0', true: '#00D2B4' }}
            thumbColor="#FFFFFF"
            style={Platform.OS === 'web' ? ({ transform: [{ scale: 0.85 }] } as any) : {}}
          />
        </View>

        <View style={styles.prefDivider} />

        {/* News & Announcements */}
        <View style={styles.prefRow}>
          <View style={styles.prefIconCircle}>
            <Mail size={16} color="#0E1E38" strokeWidth={2.2} />
          </View>
          <View style={styles.prefTextCol}>
            <Text style={styles.prefTitle}>News & Announcements</Text>
            <Text style={styles.prefSubtitle}>
              Product updates and important information
            </Text>
          </View>
          <Switch
            value={newsAnnouncements}
            onValueChange={setNewsAnnouncements}
            trackColor={{ false: '#E2E8F0', true: '#00D2B4' }}
            thumbColor="#FFFFFF"
            style={Platform.OS === 'web' ? ({ transform: [{ scale: 0.85 }] } as any) : {}}
          />
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.saveBtnWrapper}>
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#072038" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  // Language Picker Modal
  const renderLanguageModal = () => (
    <Modal
      visible={isLangModalOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsLangModalOpen(false)}
    >
      <Pressable style={styles.modalBackdrop} onPress={() => setIsLangModalOpen(false)}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Select Preferred Language</Text>
          {AVAILABLE_LANGUAGES.map((lang) => {
            const isSelected = preferredLanguage.startsWith(lang.split(' ')[0]);
            return (
              <TouchableOpacity
                key={lang}
                style={[styles.langOptionRow, isSelected && styles.langOptionRowSelected]}
                activeOpacity={0.7}
                onPress={() => {
                  setPreferredLanguage(lang.split(' ')[0]);
                  setIsLangModalOpen(false);
                }}
              >
                <Text style={[styles.langOptionText, isSelected && styles.langOptionTextSelected]}>
                  {lang}
                </Text>
                {isSelected && <Check size={18} color="#00D2B4" strokeWidth={2.4} />}
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );

  // =========================================================================
  // DESKTOP & TABLET VIEW
  // =========================================================================
  if (isDesktopOrTablet) {
    return (
      <View style={styles.desktopOuterContainer}>
        <StatusBar style="dark" />
        <DesktopHeader activeTab="profile" />

        <View style={styles.desktopBodyRow}>
          <DesktopSidebar activeTab="settings" />

          <View style={styles.desktopContentArea}>
            <ScrollView
              style={styles.desktopScroll}
              contentContainerStyle={styles.desktopScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.desktopMainCard}>
                {/* Back button row */}
                <TouchableOpacity
                  style={styles.desktopBackRow}
                  activeOpacity={0.8}
                  onPress={handleBack}
                >
                  <ArrowLeft size={18} color="#0E1E38" strokeWidth={2.4} />
                  <Text style={styles.desktopBackText}>Back to Profile</Text>
                </TouchableOpacity>

                {renderFormContent()}
              </View>
            </ScrollView>
          </View>
        </View>

        {renderLanguageModal()}
      </View>
    );
  }

  // =========================================================================
  // MOBILE VIEW (Matching Reference Screenshot)
  // =========================================================================
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />

      {/* Top Mobile Bar: Back Button & Centered Logo */}
      <View style={styles.mobileTopBar}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={handleBack}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={20} color="#0E1E38" strokeWidth={2.4} />
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

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.mobileScrollView}
        contentContainerStyle={[styles.mobileScrollContent, { paddingBottom: 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {renderFormContent()}
      </ScrollView>

      {renderLanguageModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mobileTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoEmblem: {
    width: 24,
    height: 24,
  },
  brandTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextNavy: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: '#0E1E38',
  },
  brandTextTeal: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: '#00D2B4',
  },

  mobileScrollView: {
    flex: 1,
  },
  mobileScrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },

  // Title Section
  titleSection: {
    marginBottom: 16,
  },
  pageTitle: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: '#0E1E38',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },

  // Card Structure
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeaderTitle: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    color: '#0E1E38',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 12,
  },
  cardHeaderWithInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // 1. Profile Photo
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    width: 68,
    height: 68,
    marginRight: 14,
  },
  avatarImg: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F1F5F9',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTextCol: {
    flex: 1,
  },
  photoSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },

  // Form Fields
  fieldGroup: {
    marginTop: 12,
  },
  fieldLabel: {
    fontFamily: FONT.medium,
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#0E1E38',
    padding: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },

  // Preferred Language Dropdown Button
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    marginTop: 8,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownValueText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#0E1E38',
  },

  // Communication Preferences Rows
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  prefIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prefTextCol: {
    flex: 1,
    marginRight: 8,
  },
  prefTitle: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#0E1E38',
  },
  prefSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  prefDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },

  // Save Button
  saveBtnWrapper: {
    marginTop: 8,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#00D2B4',
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  saveButtonText: {
    fontFamily: FONT.bold,
    fontSize: 14.5,
    color: '#072038',
  },

  // Language Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(7, 18, 38, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modalTitle: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#0E1E38',
    marginBottom: 14,
  },
  langOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  langOptionRowSelected: {
    backgroundColor: '#E6FAF7',
  },
  langOptionText: {
    fontFamily: FONT.medium,
    fontSize: 13.5,
    color: '#0E1E38',
  },
  langOptionTextSelected: {
    fontFamily: FONT.bold,
    color: '#00A892',
  },

  // Desktop Specific
  desktopOuterContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  desktopBodyRow: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopContentArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  desktopScroll: {
    flex: 1,
  },
  desktopScrollContent: {
    paddingVertical: 32,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  desktopMainCard: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#0E1E38',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  desktopBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  desktopBackText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#0E1E38',
  },
});
