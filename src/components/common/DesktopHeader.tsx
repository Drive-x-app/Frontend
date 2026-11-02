import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
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

  return (
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

        {/* Right: Notifications */}
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
        </View>
      </View>
    </View>
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
    alignItems: 'center',
    zIndex: 40,
  },
  desktopHeaderInner: {
    width: '100%',
    maxWidth: 1360,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  desktopBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  desktopBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  desktopLogoEmblem: {
    width: 42,
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
});
