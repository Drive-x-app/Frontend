import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  Camera,
  Bell,
  CarFront,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileText,
  Globe,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { DesktopHeader } from '../../src/components/common/DesktopHeader';
import { DesktopSidebar } from '../../src/components/common/DesktopSidebar';
import { useAuthStore } from '../../src/store/authStore';
import { useBookingStore } from '../../src/store/bookingStore';

type ProfileRowProps = {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  onPress?: () => void;
  destructive?: boolean;
};

function ProfileRow({
  title,
  description,
  icon: Icon,
  onPress,
  destructive = false,
}: ProfileRowProps) {
  const color = destructive ? '#EF4444' : '#102A56';
  return (
    <TouchableOpacity
      style={[styles.profileRow, destructive && styles.destructiveRow]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
    >
      <View style={[styles.rowIcon, destructive && styles.destructiveIcon]}>
        <Icon size={19} color={destructive ? '#EF4444' : '#173A72'} strokeWidth={2} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, destructive && styles.destructiveText]}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <ChevronRight size={19} color={color} strokeWidth={2} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const horizontalPadding =
    width < 360 ? 12 : width < 600 ? 16 : width < 960 ? 28 : width < 1280 ? 32 : 40;
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const resetAuth = useAuthStore((state) => state.reset);
  const userName = useBookingStore((state) => state.userName);
  const setActiveTab = useBookingStore((state) => state.setActiveTab);

  const name = user?.fullName || profile?.fullName || userName || 'Priya Sharma';
  const phone = user?.phoneNumber || '+91 98765 43210';
  const email =
    user?.email ||
    profile?.email ||
    (!user && !profile ? 'priya.sharma@gmail.com' : '');
  const avatar = user?.avatarUrl || profile?.avatarUrl;

  const handleLogout = () => {
    resetAuth();
    setActiveTab('home');
    router.replace('/(auth)/login');
  };

  const content = (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.content,
        { paddingHorizontal: horizontalPadding },
        width >= 600 && width < 960 && styles.tabletContent,
        isDesktop && styles.desktopContent,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSubtitle}>Manage your account and preferences.</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          activeOpacity={0.75}
          onPress={() => router.push('/(customer)/edit-profile')}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <Settings size={15} color="#173A72" strokeWidth={2.2} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.accountCard}>
        <View style={styles.avatarWrap}>
          <Image
            source={avatar ? { uri: avatar } : require('../../assets/avatar_user.jpg')}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.cameraBadge}>
            <Camera size={12} color="#FFFFFF" strokeWidth={2.4} />
          </View>
        </View>
        <View style={styles.accountCopy}>
          <Text style={styles.accountName}>{name}</Text>
          <Text style={styles.accountDetail}>{phone}</Text>
          <Text style={styles.accountDetail} numberOfLines={1}>
            {email || 'Add an email address'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.membershipCard}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="DriverX Member. Enjoy safe, reliable and professional driver services."
      >
        <View style={styles.membershipIcon}>
          <CarFront size={21} color="#0876F9" strokeWidth={2.2} />
        </View>
        <View style={styles.membershipCopy}>
          <Text style={styles.membershipTitle}>DriverX Member</Text>
          <Text style={styles.membershipDescription}>
            Enjoy safe, reliable and professional driver services.
          </Text>
        </View>
        <ChevronRight size={19} color="#173A72" strokeWidth={2} />
      </TouchableOpacity>

      <View style={styles.rows}>
        <ProfileRow
          title="Personal Information"
          description="Name, phone number, email"
          icon={UserRound}
          onPress={() => router.push('/(customer)/edit-profile')}
        />
        <ProfileRow
          title="Saved Locations"
          description="Home, work and other addresses"
          icon={MapPin}
          onPress={() => router.push('/(customer)/saved-locations')}
        />
        <ProfileRow
          title="Payment Methods"
          description="Manage your cards and UPI"
          icon={CreditCard}
        />
        <ProfileRow
          title="Notifications"
          description="Booking alerts, offers and updates"
          icon={Bell}
        />
        <ProfileRow
          title="Security & Privacy"
          description="Change password, manage data"
          icon={ShieldCheck}
        />
        <ProfileRow
          title="App Settings"
          description="Language, theme and preferences"
          icon={Settings}
        />
        <ProfileRow
          title="Help & Support"
          description="FAQs, contact support"
          icon={CircleHelp}
        />
        <ProfileRow
          title="Terms & Policies"
          description="Terms of service, privacy policy"
          icon={FileText}
        />
        <ProfileRow
          title="Log Out"
          description="Sign out from your DriverX account"
          icon={LogOut}
          onPress={handleLogout}
          destructive
        />
      </View>
    </ScrollView>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopPage}>
        <StatusBar style="dark" />
        <DesktopHeader activeTab="profile" />
        <View style={styles.desktopBody}>
          <DesktopSidebar activeTab="settings" />
          <View style={styles.desktopMain}>{content}</View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  desktopPage: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  desktopBody: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopMain: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FFFFFF',
  },
  desktopContent: {
    width: '100%',
    paddingHorizontal: 36,
    paddingTop: 30,
    paddingBottom: 48,
  },
  tabletContent: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingTop: 24,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
  },
  pageTitle: {
    color: '#102A56',
    fontSize: 28,
    lineHeight: 36,
    fontFamily: 'Poppins-Bold',
  },
  pageSubtitle: {
    color: '#7383A1',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Poppins-Regular',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F1F4F9',
    flexShrink: 0,
  },
  editButtonText: {
    color: '#173A72',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
  },
  accountCard: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EDF4',
    borderRadius: 12,
    marginBottom: 8,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E9EEF6',
  },
  cameraBadge: {
    position: 'absolute',
    right: -1,
    bottom: 1,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF4',
  },
  accountCopy: {
    flex: 1,
    marginLeft: 12,
  },
  accountName: {
    color: '#102A56',
    fontSize: 18,
    lineHeight: 27,
    fontFamily: 'Poppins-SemiBold',
  },
  accountDetail: {
    color: '#7383A1',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  membershipCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#EDF6FF',
    marginBottom: 8,
  },
  membershipIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: '#DDEEFF',
  },
  membershipCopy: {
    flex: 1,
    marginHorizontal: 10,
  },
  membershipTitle: {
    color: '#102A56',
    fontSize: 14,
    lineHeight: 21,
    fontFamily: 'Poppins-SemiBold',
  },
  membershipDescription: {
    color: '#7383A1',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'Poppins-Regular',
  },
  rows: {
    gap: 8,
  },
  profileRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8EDF4',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  rowIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#F1F5FB',
  },
  rowCopy: {
    flex: 1,
    marginHorizontal: 10,
  },
  rowTitle: {
    color: '#102A56',
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Poppins-SemiBold',
  },
  rowDescription: {
    color: '#7383A1',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Poppins-Regular',
  },
  destructiveRow: {
    backgroundColor: '#FFF8F8',
    borderColor: '#FCE4E4',
  },
  destructiveIcon: {
    backgroundColor: '#FEECEC',
  },
  destructiveText: {
    color: '#EF4444',
  },
});
