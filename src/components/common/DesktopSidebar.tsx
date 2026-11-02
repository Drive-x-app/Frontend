import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Home as HomeIcon,
  Calendar,
  History,
  Settings,
  Headphones,
  Car,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useBookingStore } from '../../store/bookingStore';
import { FONT } from '../../theme/typography';

export type SidebarTab = 'home' | 'bookings' | 'history' | 'settings' | 'help';

export interface DesktopSidebarProps {
  activeTab?: SidebarTab;
  onTabPress?: (tab: SidebarTab) => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab = 'home',
  onTabPress,
}) => {
  const router = useRouter();
  const setActiveTabStore = useBookingStore((state) => state.setActiveTab);

  const handleTabPress = (tab: SidebarTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (onTabPress) {
      onTabPress(tab);
      return;
    }

    if (tab === 'home') {
      setActiveTabStore('home');
      router.push('/(customer)');
    } else if (tab === 'bookings') {
      setActiveTabStore('bookings');
      router.push('/(customer)/my-bookings');
    } else if (tab === 'history') {
      setActiveTabStore('history');
      router.push('/(customer)/trip-history');
    } else if (tab === 'settings') {
      setActiveTabStore('profile');
      router.push('/(customer)/profile');
    } else if (tab === 'help') {
      // Stay or open help
    }
  };

  return (
    <View style={styles.sidebarContainer}>
      {/* Primary Navigation Items */}
      <View style={styles.primaryNavList}>
        {/* Home */}
        <TouchableOpacity
          style={[
            styles.navItem,
            activeTab === 'home' && styles.navItemActive,
          ]}
          activeOpacity={0.7}
          onPress={() => handleTabPress('home')}
        >
          <HomeIcon
            size={20}
            color={activeTab === 'home' ? '#00D2B4' : '#64748B'}
            strokeWidth={activeTab === 'home' ? 2.4 : 2}
          />
          <Text
            style={[
              styles.navItemText,
              activeTab === 'home' && styles.navItemTextActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* My Bookings */}
        <TouchableOpacity
          style={[
            styles.navItem,
            activeTab === 'bookings' && styles.navItemActive,
          ]}
          activeOpacity={0.7}
          onPress={() => handleTabPress('bookings')}
        >
          <Calendar
            size={20}
            color={activeTab === 'bookings' ? '#00D2B4' : '#64748B'}
            strokeWidth={activeTab === 'bookings' ? 2.4 : 2}
          />
          <Text
            style={[
              styles.navItemText,
              activeTab === 'bookings' && styles.navItemTextActive,
            ]}
          >
            My Bookings
          </Text>
        </TouchableOpacity>

        {/* Trip History */}
        <TouchableOpacity
          style={[
            styles.navItem,
            activeTab === 'history' && styles.navItemActive,
          ]}
          activeOpacity={0.7}
          onPress={() => handleTabPress('history')}
        >
          <History
            size={20}
            color={activeTab === 'history' ? '#00D2B4' : '#64748B'}
            strokeWidth={activeTab === 'history' ? 2.4 : 2}
          />
          <Text
            style={[
              styles.navItemText,
              activeTab === 'history' && styles.navItemTextActive,
            ]}
          >
            Trip History
          </Text>
        </TouchableOpacity>

      </View>

      {/* Secondary Items (Settings & Help) */}
      <View style={styles.secondaryNavList}>
        {/* Settings */}
        <TouchableOpacity
          style={[
            styles.navItem,
            activeTab === 'settings' && styles.navItemActive,
          ]}
          activeOpacity={0.7}
          onPress={() => handleTabPress('settings')}
        >
          <Settings
            size={20}
            color={activeTab === 'settings' ? '#00D2B4' : '#64748B'}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.navItemText,
              activeTab === 'settings' && styles.navItemTextActive,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>

        {/* Help & Support */}
        <TouchableOpacity
          style={[
            styles.navItem,
            activeTab === 'help' && styles.navItemActive,
          ]}
          activeOpacity={0.7}
          onPress={() => handleTabPress('help')}
        >
          <Headphones
            size={20}
            color={activeTab === 'help' ? '#00D2B4' : '#64748B'}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.navItemText,
              activeTab === 'help' && styles.navItemTextActive,
            ]}
          >
            Help & Support
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />

      {/* Bottom Promo Card: "Your Ride Our Priority" */}
      <View style={styles.promoCard}>
        <View style={styles.promoTextWrap}>
          <Text style={styles.promoMicroLabel}>Your Ride</Text>
          <Text style={styles.promoMainTitle}>Our Priority</Text>
          <Text style={styles.promoSubtext}>Safe • Reliable • Always</Text>
        </View>
        <View style={styles.promoCarWrap}>
          <View style={styles.promoCarBadge}>
            <Car size={26} color="#00D2B4" strokeWidth={2.2} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#EEF2F6',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 28,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  primaryNavList: {
    gap: 8,
  },
  secondaryNavList: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  navItemActive: {
    backgroundColor: '#E6FAF6',
  },
  navItemText: {
    fontFamily: FONT.medium,
    fontSize: 14.5,
    color: '#64748B',
  },
  navItemTextActive: {
    fontFamily: FONT.semiBold,
    color: '#00A892',
  },
  spacer: {
    flex: 1,
  },
  promoCard: {
    backgroundColor: '#F0FDF9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CCFBEF',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  promoTextWrap: {
    flex: 1,
  },
  promoMicroLabel: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  promoMainTitle: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
    marginBottom: 2,
  },
  promoSubtext: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: '#94A3B8',
  },
  promoCarWrap: {
    marginLeft: 8,
  },
  promoCarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#99F6E0',
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
