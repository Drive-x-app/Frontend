import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Menu,
  X,
  Search,
  Home as HomeIcon,
  Calendar,
  History,
  Bell,
  ChevronDown,
  ChevronRight,
  User,
  MapPin,
  Clock,
  LogOut,
  ShieldCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useBookingStore } from '../../store/bookingStore';
import { FONT } from '../../theme/typography';

export type DesktopNavTab = 'home' | 'bookings' | 'history' | 'profile' | 'ride' | 'drive' | 'help';

export interface DesktopHeaderProps {
  activeTab?: DesktopNavTab;
  onTabPress?: (tab: DesktopNavTab) => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({
  activeTab = 'home',
  onTabPress,
}) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userName = useBookingStore((state) => state.userName);
  const unreadNotifications = useBookingStore((state) => state.unreadNotifications);
  const markNotificationsAsRead = useBookingStore((state) => state.markNotificationsAsRead);
  const setActiveTabStore = useBookingStore((state) => state.setActiveTab);

  const hasUnreadNotification = unreadNotifications > 0;

  const handleTabPress = (tab: DesktopNavTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onTabPress) {
      onTabPress(tab);
      return;
    }

    if (tab === 'home' || tab === 'ride') {
      setActiveTabStore('home');
      router.push('/(customer)');
    } else if (tab === 'bookings') {
      setActiveTabStore('bookings');
      router.push('/(customer)/my-bookings');
    } else if (tab === 'history') {
      setActiveTabStore('history');
      router.push('/(customer)/trip-history');
    } else if (tab === 'profile') {
      setActiveTabStore('profile');
      router.push('/(customer)/profile');
    }
  };

  const closeMenuAndNavigate = (action: () => void) => {
    setIsMenuOpen(false);
    action();
  };

  return (
    <>
      <View style={styles.desktopHeader}>
        <View style={styles.desktopHeaderInner}>
          {/* Left: DriverX Brand Logo */}
          <View style={styles.desktopBrandContainer}>
            <TouchableOpacity
              style={styles.desktopBrandRow}
              activeOpacity={0.8}
              onPress={() => handleTabPress('home')}
              accessibilityLabel="DriverX Home"
            >
              <Image
                source={require('../../../assets/DriveX_Logo.png')}
                style={styles.desktopLogoEmblem}
                resizeMode="contain"
              />
              <View style={styles.brandTextRow}>
                <Text style={styles.desktopBrandNavy}>Driver</Text>
                <Text style={styles.desktopBrandTeal}>X</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Center: Spacer */}
          <View style={styles.desktopHeaderSpacer} />

          {/* Right: Notifications & User Profile */}
          <View style={styles.desktopHeaderRight}>
            <TouchableOpacity
              style={styles.desktopNotificationBtn}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                markNotificationsAsRead();
              }}
              accessibilityLabel="Notifications"
            >
              <Bell size={20} color="#64748B" strokeWidth={2.2} />
              {hasUnreadNotification && <View style={styles.desktopNotificationDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.desktopProfileBtn}
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setIsMenuOpen(true);
              }}
              accessibilityLabel="User profile"
            >
              <Image
                source={require('../../../assets/avatar_user.jpg')}
                style={styles.desktopAvatarImage}
              />
              <Text style={styles.desktopProfileName}>{userName || 'Priya Sharma'}</Text>
              <ChevronDown size={16} color="#0E1E38" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Left Side Navigation Menu Bar Drawer */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isMenuOpen}
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <Pressable
          style={styles.drawerBackdrop}
          onPress={() => setIsMenuOpen(false)}
        >
          <Pressable
            style={styles.drawerContainer}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Drawer Top Bar: Brand Logo & Close Button */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerBrandRow}>
                <Image
                  source={require('../../../assets/DriveX_Logo.png')}
                  style={styles.drawerLogoEmblem}
                  resizeMode="contain"
                />
                <View style={styles.brandTextRow}>
                  <Text style={styles.desktopBrandNavy}>Driver</Text>
                  <Text style={styles.desktopBrandTeal}>X</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.drawerCloseButton}
                activeOpacity={0.75}
                onPress={() => setIsMenuOpen(false)}
                accessibilityLabel="Close navigation menu"
              >
                <X size={20} color="#475569" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            {/* User Profile Card */}
            <View style={styles.drawerUserCard}>
              <Image
                source={require('../../../assets/avatar_user.jpg')}
                style={styles.drawerUserAvatar}
              />
              <View style={styles.drawerUserInfo}>
                <Text style={styles.drawerUserName} numberOfLines={1}>
                  {userName || 'Priya Sharma'}
                </Text>
                <View style={styles.drawerVerifiedBadge}>
                  <ShieldCheck size={13} color="#00D2B4" strokeWidth={2.4} />
                  <Text style={styles.drawerVerifiedText}>Verified Customer</Text>
                </View>
              </View>
            </View>

            {/* Navigation Pages List */}
            <ScrollView
              style={styles.drawerNavScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.drawerNavScrollContent}
            >
              <Text style={styles.drawerSectionTitle}>PAGES</Text>

              {/* 1. Home */}
              <TouchableOpacity
                style={[
                  styles.drawerNavItem,
                  (activeTab === 'home' || activeTab === 'ride') && styles.drawerNavItemActive,
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  closeMenuAndNavigate(() => handleTabPress('home'))
                }
              >
                <View
                  style={[
                    styles.drawerNavIconWrap,
                    (activeTab === 'home' || activeTab === 'ride') && styles.drawerNavIconWrapActive,
                  ]}
                >
                  <HomeIcon
                    size={20}
                    color={activeTab === 'home' || activeTab === 'ride' ? '#00A892' : '#64748B'}
                    strokeWidth={2.2}
                  />
                </View>
                <View style={styles.drawerNavTextWrap}>
                  <Text
                    style={[
                      styles.drawerNavText,
                      (activeTab === 'home' || activeTab === 'ride') && styles.drawerNavTextActive,
                    ]}
                  >
                    Home
                  </Text>
                  <Text style={styles.drawerNavSubtext}>Map & live booking</Text>
                </View>
                {(activeTab === 'home' || activeTab === 'ride') && (
                  <View style={styles.drawerActivePill} />
                )}
              </TouchableOpacity>

              {/* 2. My Bookings */}
              <TouchableOpacity
                style={[
                  styles.drawerNavItem,
                  activeTab === 'bookings' && styles.drawerNavItemActive,
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  closeMenuAndNavigate(() => handleTabPress('bookings'))
                }
              >
                <View
                  style={[
                    styles.drawerNavIconWrap,
                    activeTab === 'bookings' && styles.drawerNavIconWrapActive,
                  ]}
                >
                  <Calendar
                    size={20}
                    color={activeTab === 'bookings' ? '#00A892' : '#64748B'}
                    strokeWidth={2.2}
                  />
                </View>
                <View style={styles.drawerNavTextWrap}>
                  <Text
                    style={[
                      styles.drawerNavText,
                      activeTab === 'bookings' && styles.drawerNavTextActive,
                    ]}
                  >
                    My Bookings
                  </Text>
                  <Text style={styles.drawerNavSubtext}>Upcoming & active rides</Text>
                </View>
                {activeTab === 'bookings' && <View style={styles.drawerActivePill} />}
              </TouchableOpacity>

              {/* 3. Trip History */}
              <TouchableOpacity
                style={[
                  styles.drawerNavItem,
                  activeTab === 'history' && styles.drawerNavItemActive,
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  closeMenuAndNavigate(() => handleTabPress('history'))
                }
              >
                <View
                  style={[
                    styles.drawerNavIconWrap,
                    activeTab === 'history' && styles.drawerNavIconWrapActive,
                  ]}
                >
                  <History
                    size={20}
                    color={activeTab === 'history' ? '#00A892' : '#64748B'}
                    strokeWidth={2.2}
                  />
                </View>
                <View style={styles.drawerNavTextWrap}>
                  <Text
                    style={[
                      styles.drawerNavText,
                      activeTab === 'history' && styles.drawerNavTextActive,
                    ]}
                  >
                    Trip History
                  </Text>
                  <Text style={styles.drawerNavSubtext}>Past completed trips</Text>
                </View>
                {activeTab === 'history' && <View style={styles.drawerActivePill} />}
              </TouchableOpacity>

              <View style={styles.drawerDivider} />
              <Text style={styles.drawerSectionTitle}>BOOKING SERVICES</Text>

              {/* Book Driver / Select Location */}
              <TouchableOpacity
                style={styles.drawerNavItem}
                activeOpacity={0.7}
                onPress={() =>
                  closeMenuAndNavigate(() => router.push('/(customer)/select-location'))
                }
              >
                <View style={styles.drawerNavIconWrap}>
                  <MapPin size={20} color="#64748B" strokeWidth={2.2} />
                </View>
                <View style={styles.drawerNavTextWrap}>
                  <Text style={styles.drawerNavText}>Select Locations</Text>
                  <Text style={styles.drawerNavSubtext}>Pickup and drop destination</Text>
                </View>
                <ChevronRight size={18} color="#CBD5E1" strokeWidth={2} />
              </TouchableOpacity>

              {/* Rental Packages / Select Duration */}
              <TouchableOpacity
                style={styles.drawerNavItem}
                activeOpacity={0.7}
                onPress={() =>
                  closeMenuAndNavigate(() => router.push('/(customer)/select-duration'))
                }
              >
                <View style={styles.drawerNavIconWrap}>
                  <Clock size={20} color="#64748B" strokeWidth={2.2} />
                </View>
                <View style={styles.drawerNavTextWrap}>
                  <Text style={styles.drawerNavText}>Hourly Packages</Text>
                  <Text style={styles.drawerNavSubtext}>1h, 2h, 4h & full day options</Text>
                </View>
                <ChevronRight size={18} color="#CBD5E1" strokeWidth={2} />
              </TouchableOpacity>

              <View style={styles.drawerDivider} />
              <Text style={styles.drawerSectionTitle}>ACCOUNT</Text>

              {/* Notifications */}
              <TouchableOpacity
                style={styles.drawerNavItem}
                activeOpacity={0.7}
                onPress={() => {
                  markNotificationsAsRead();
                }}
              >
                <View style={styles.drawerNavIconWrap}>
                  <Bell size={20} color="#64748B" strokeWidth={2.2} />
                </View>
                <View style={styles.drawerNavTextWrap}>
                  <Text style={styles.drawerNavText}>Notifications</Text>
                  <Text style={styles.drawerNavSubtext}>Ride alerts and messages</Text>
                </View>
                {hasUnreadNotification && (
                  <View style={styles.drawerBadge}>
                    <Text style={styles.drawerBadgeText}>{unreadNotifications}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Profile & Settings */}
              <TouchableOpacity
                style={[
                  styles.drawerNavItem,
                  activeTab === 'profile' && styles.drawerNavItemActive,
                ]}
                activeOpacity={0.7}
                onPress={() =>
                  closeMenuAndNavigate(() => handleTabPress('profile'))
                }
              >
                <View
                  style={[
                    styles.drawerNavIconWrap,
                    activeTab === 'profile' && styles.drawerNavIconWrapActive,
                  ]}
                >
                  <User
                    size={20}
                    color={activeTab === 'profile' ? '#00A892' : '#64748B'}
                    strokeWidth={2.2}
                  />
                </View>
                <View style={styles.drawerNavTextWrap}>
                  <Text
                    style={[
                      styles.drawerNavText,
                      activeTab === 'profile' && styles.drawerNavTextActive,
                    ]}
                  >
                    Profile & Settings
                  </Text>
                  <Text style={styles.drawerNavSubtext}>Personal info & preferences</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            {/* Drawer Bottom Footer */}
            <View style={styles.drawerFooter}>
              <TouchableOpacity
                style={styles.drawerLogoutBtn}
                activeOpacity={0.7}
                onPress={() =>
                  closeMenuAndNavigate(() => router.push('/(auth)/login'))
                }
              >
                <LogOut size={17} color="#EF4444" strokeWidth={2.2} />
                <Text style={styles.drawerLogoutText}>Sign Out</Text>
              </TouchableOpacity>
              <Text style={styles.drawerVersionText}>DriverX • v1.0.0</Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  desktopHeader: {
    width: '100%',
    height: 74,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
    justifyContent: 'center',
    zIndex: 100,
  },
  desktopHeaderInner: {
    maxWidth: 1760,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  desktopBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  desktopMenuButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.15s ease-in-out',
        } as any)
      : {}),
  },
  desktopBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  desktopLogoEmblem: {
    width: 44,
    height: 28,
  },
  brandTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  desktopHeaderSpacer: {
    flex: 1,
  },
  desktopHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  desktopNotificationBtn: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  desktopNotificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  desktopProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  desktopAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  desktopProfileName: {
    fontFamily: FONT.semiBold,
    fontSize: 14.5,
    color: '#0E1E38',
  },

  /* Left Side Drawer Menu Bar Styles */
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(14, 30, 56, 0.45)',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(3px)',
        } as any)
      : {}),
  },
  drawerContainer: {
    width: 320,
    maxWidth: '85%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#EEF2F6',
    flexDirection: 'column',
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 25,
  },
  drawerHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  drawerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drawerLogoEmblem: {
    width: 38,
    height: 24,
  },
  drawerCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  drawerUserCard: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drawerUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#00D2B4',
  },
  drawerUserInfo: {
    flex: 1,
  },
  drawerUserName: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: '#0E1E38',
    marginBottom: 3,
  },
  drawerVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  drawerVerifiedText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#00A892',
  },
  drawerNavScroll: {
    flex: 1,
  },
  drawerNavScrollContent: {
    paddingVertical: 10,
  },
  drawerSectionTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 6,
  },
  drawerNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 10,
    borderRadius: 12,
    marginBottom: 2,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        } as any)
      : {}),
  },
  drawerNavItemActive: {
    backgroundColor: '#E6FAF7',
  },
  drawerNavIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  drawerNavIconWrapActive: {
    backgroundColor: '#CCFBF1',
  },
  drawerNavTextWrap: {
    flex: 1,
  },
  drawerNavText: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: '#334155',
  },
  drawerNavTextActive: {
    fontFamily: FONT.bold,
    color: '#00897B',
  },
  drawerNavSubtext: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  drawerActivePill: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#00D2B4',
    marginLeft: 8,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
    marginHorizontal: 16,
  },
  drawerBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  drawerBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  drawerFooter: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  drawerLogoutText: {
    fontFamily: FONT.semiBold,
    fontSize: 13.5,
    color: '#EF4444',
  },
  drawerVersionText: {
    fontFamily: FONT.medium,
    fontSize: 11.5,
    color: '#94A3B8',
  },
});
