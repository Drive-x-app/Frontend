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
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  ShieldCheck,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Crown,
  Camera,
  Home as HomeIcon,
  Calendar,
  History,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useBookingStore } from '../../src/store/bookingStore';
import { useAuthStore } from '../../src/store/authStore';
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

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktopOrTablet =
    windowWidth > 600 ||
    (Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth > 600);

  const activeTab = useBookingStore((state) => state.activeTab);
  const setActiveTab = useBookingStore((state) => state.setActiveTab);
  const userNameStore = useBookingStore((state) => state.userName);

  const authUser = useAuthStore((state) => state.user);
  const authReset = useAuthStore((state) => state.reset);

  const displayName = authUser?.fullName || userNameStore || 'Priya Sharma';
  const displayPhone = authUser?.phoneNumber || '+91 98765 43210';
  const displayEmail = authUser?.email || 'priya.sharma@gmail.com';

  const handleTabPress = (tab: 'home' | 'bookings' | 'history' | 'profile') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveTab(tab);
    if (tab === 'home') {
      router.replace('/(customer)');
    } else if (tab === 'bookings') {
      router.replace('/(customer)/my-bookings');
    } else if (tab === 'history') {
      router.replace('/(customer)/trip-history');
    }
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to log out of DriverX?');
      if (confirmed) {
        authReset();
        router.replace('/(customer)');
      }
    } else {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out from your DriverX account?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: () => {
              authReset();
              router.replace('/(customer)');
            },
          },
        ]
      );
    }
  };

  const menuSections = [
    {
      id: 'personal-info',
      icon: <User size={18} color="#0E1E38" strokeWidth={2.2} />,
      title: 'Personal Information',
      subtitle: 'Name, phone number, email',
      action: () => router.push('/(customer)/edit-profile'),
    },
    {
      id: 'saved-locations',
      icon: <MapPin size={18} color="#0E1E38" strokeWidth={2.2} />,
      title: 'Saved Locations',
      subtitle: 'Home, Work and other addresses',
      action: () => router.push('/(customer)/saved-locations'),
    },
    {
      id: 'payment-methods',
      icon: <CreditCard size={18} color="#0E1E38" strokeWidth={2.2} />,
      title: 'Payment Methods',
      subtitle: 'Manage your cards and UPI',
      action: () => {},
    },
    {
      id: 'notifications',
      icon: <Bell size={18} color="#0E1E38" strokeWidth={2.2} />,
      title: 'Notifications',
      subtitle: 'Booking alerts, offers and updates',
      action: () => {},
    },
    {
      id: 'security-privacy',
      icon: <ShieldCheck size={18} color="#0E1E38" strokeWidth={2.2} />,
      title: 'Security & Privacy',
      subtitle: 'Change password, manage data',
      action: () => {},
    },
    {
      id: 'app-settings',
      icon: <Settings size={18} color="#0E1E38" strokeWidth={2.2} />,
      title: 'App Settings',
      subtitle: 'Language, theme and preferences',
      action: () => {},
    },
    {
      id: 'help-support',
      icon: <HelpCircle size={18} color="#0E1E38" strokeWidth={2.2} />,
      title: 'Help & Support',
      subtitle: 'FAQs, contact support',
      action: () => {},
    },
    {
      id: 'terms-policies',
      icon: <FileText size={18} color="#0E1E38" strokeWidth={2.2} />,
      title: 'Terms & Policies',
      subtitle: 'Terms of service, privacy policy',
      action: () => {},
    },
  ];

  // Render the core Profile card content (used in both mobile and desktop)
  const renderProfileContent = () => (
    <>
      {/* 1. Header with Edit Profile Pill */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeftCol}>
          <Text style={styles.pageTitle}>Profile</Text>
          <Text style={styles.pageSubtitle}>Manage your account and preferences.</Text>
        </View>

        <TouchableOpacity
          style={styles.editProfilePill}
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            router.push('/(customer)/edit-profile');
          }}
          accessibilityLabel="Edit profile"
        >
          <Settings size={13} color="#0E1E38" strokeWidth={2.2} />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* 2. User Info Hero Card */}
      <View style={styles.userHeroCard}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          activeOpacity={0.85}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            router.push('/(customer)/edit-profile');
          }}
          accessibilityLabel="Edit profile photo"
        >
          <Image
            source={require('../../assets/avatar_user.jpg')}
            style={styles.avatarImg}
            resizeMode="cover"
          />
          <View style={styles.cameraBadge}>
            <Camera size={11} color="#0E1E38" strokeWidth={2.2} />
          </View>
        </TouchableOpacity>

        <View style={styles.userMetaCol}>
          <Text style={styles.userNameText}>{displayName}</Text>
          <Text style={styles.userPhoneText}>{displayPhone}</Text>
          <Text style={styles.userEmailText}>{displayEmail}</Text>
        </View>
      </View>

      {/* 3. DriverX Club Banner Card */}
      <TouchableOpacity
        style={styles.clubBannerCard}
        activeOpacity={0.85}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }}
      >
        <View style={styles.clubIconWrap}>
          <Crown size={20} color="#0284C7" strokeWidth={2.2} fill="#0284C7" />
        </View>
        <View style={styles.clubTextWrap}>
          <Text style={styles.clubTitle}>DriverX Club</Text>
          <Text style={styles.clubSubtitle}>
            Enjoy safe & reliable professional driver services.
          </Text>
        </View>
        <ChevronRight size={16} color="#0284C7" strokeWidth={2.4} />
      </TouchableOpacity>

      {/* 4. Menu Items List */}
      <View style={styles.menuItemsContainer}>
        {menuSections.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItemCard}
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              item.action();
            }}
          >
            <View style={styles.menuIconCircle}>{item.icon}</View>
            <View style={styles.menuTextColumn}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
            </View>
            <ChevronRight size={16} color="#94A3B8" strokeWidth={2.2} />
          </TouchableOpacity>
        ))}

        {/* 5. Log Out Card */}
        <TouchableOpacity
          style={styles.logoutCard}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <View style={styles.logoutIconCircle}>
            <LogOut size={18} color="#EF4444" strokeWidth={2.2} />
          </View>
          <View style={styles.menuTextColumn}>
            <Text style={styles.logoutTitle}>Log Out</Text>
            <Text style={styles.logoutSubtitle}>Sign out from your DriverX account</Text>
          </View>
          <ChevronRight size={16} color="#EF4444" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
    </>
  );

  // =========================================================================
  // DESKTOP & TABLET VIEW
  // =========================================================================
  if (isDesktopOrTablet) {
    return (
      <View style={styles.desktopOuterContainer}>
        <StatusBar style="dark" />
        {/* Top Header */}
        <DesktopHeader activeTab="profile" />

        <View style={styles.desktopBodyRow}>
          {/* Left Persistent Navigation Sidebar */}
          <DesktopSidebar activeTab="settings" />

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
              <View style={styles.desktopMainCard}>{renderProfileContent()}</View>
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  // =========================================================================
  // MOBILE VIEW (Matching Reference Screenshot)
  // =========================================================================
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <ScrollView
        style={styles.mobileScrollView}
        contentContainerStyle={styles.mobileScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderProfileContent()}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Bottom Navigation Tab Bar with Profile Active */}
      <View
        style={[
          styles.bottomTabBarContainer,
          { paddingBottom: Math.max(insets.bottom, 10) },
        ]}
      >
        <View style={styles.bottomTabBar}>
          {/* Home Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.8}
            onPress={() => handleTabPress('home')}
          >
            <View style={styles.tabActivePill}>
              <HomeIcon size={20} color="#94A3B8" strokeWidth={2.4} />
            </View>
            <Text style={styles.tabLabel}>Home</Text>
          </TouchableOpacity>

          {/* My Bookings Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.8}
            onPress={() => handleTabPress('bookings')}
          >
            <View style={styles.tabActivePill}>
              <Calendar size={20} color="#94A3B8" strokeWidth={2.2} />
            </View>
            <Text style={styles.tabLabel}>My Bookings</Text>
          </TouchableOpacity>

          {/* Trip History Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.8}
            onPress={() => handleTabPress('history')}
          >
            <View style={styles.tabActivePill}>
              <History size={20} color="#94A3B8" strokeWidth={2.4} />
            </View>
            <Text style={styles.tabLabel}>Trip History</Text>
          </TouchableOpacity>

          {/* Profile Tab (ACTIVE) */}
          <TouchableOpacity
            style={styles.tabItem}
            activeOpacity={0.8}
            onPress={() => handleTabPress('profile')}
          >
            <View style={[styles.tabActivePill, styles.tabActivePillSelected]}>
              <User size={20} color="#00D2B4" strokeWidth={2.4} />
            </View>
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  mobileScrollView: {
    flex: 1,
  },
  mobileScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // 1. Header Row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeftCol: {
    gap: 3,
  },
  pageTitle: {
    fontFamily: FONT.bold,
    fontSize: 24,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12.5,
    color: '#64748B',
  },
  editProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  editProfileText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#0E1E38',
  },

  // 2. User Hero Card
  userHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    width: 72,
    height: 72,
    marginRight: 16,
  },
  avatarImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMetaCol: {
    flex: 1,
    justifyContent: 'center',
  },
  userNameText: {
    fontFamily: FONT.bold,
    fontSize: 17,
    color: '#0E1E38',
    letterSpacing: -0.2,
  },
  userPhoneText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  userEmailText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },

  // 3. DriverX Club Banner Card
  clubBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 14,
    marginBottom: 16,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  clubIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clubTextWrap: {
    flex: 1,
  },
  clubTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0369A1',
  },
  clubSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#0284C7',
    marginTop: 2,
    lineHeight: 15,
  },

  // 4. Menu Items
  menuItemsContainer: {
    gap: 8,
  },
  menuItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextColumn: {
    flex: 1,
  },
  menuItemTitle: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    color: '#0E1E38',
  },
  menuItemSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  // 5. Logout Card
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  logoutIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoutTitle: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    color: '#DC2626',
  },
  logoutSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#EF4444',
    marginTop: 2,
  },

  // Bottom Navigation Bar
  bottomTabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 64,
  },
  tabActivePill: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActivePillSelected: {
    backgroundColor: '#E6FAF7',
  },
  tabLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  tabLabelActive: {
    fontFamily: FONT.bold,
    color: '#00D2B4',
  },

  // Desktop Specific Styles
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
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  topRightDots: {
    position: 'absolute',
    top: 24,
    right: 32,
    zIndex: 1,
    opacity: 0.85,
  },
  bottomRightDots: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    zIndex: 1,
    opacity: 0.85,
  },
  dotGridContainer: {
    gap: 8,
  },
  dotGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dotGridDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00D2B4',
    opacity: 0.7,
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
    maxWidth: 760,
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
});
