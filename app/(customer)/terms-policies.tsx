import React from 'react';
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DesktopHeader } from '../../src/components/common/DesktopHeader';
import { DesktopSidebar } from '../../src/components/common/DesktopSidebar';
import { isCustomerDesktop } from '../../src/theme/layout';

const POLICY_SECTIONS = [
  {
    title: 'Using DriverX',
    body: 'DriverX helps you request and manage driver bookings. Use the app only for lawful purposes and provide accurate account and trip information. You are responsible for keeping access to your account and verification codes secure.',
  },
  {
    title: 'Bookings and availability',
    body: 'A booking request is subject to driver availability and confirmation in the app. Review the pickup details, duration, destination (if applicable), and fare shown before confirming. Changes to a trip may affect availability or price.',
  },
  {
    title: 'Payments, cancellations and refunds',
    body: 'The fare and available payment options are shown during booking. Applicable cancellation charges, payment adjustments, and refund timing should be displayed before you confirm or cancel. Contact support if a charge or refund does not look right.',
  },
  {
    title: 'Safety and conduct',
    body: 'Treat drivers and other people respectfully and follow applicable laws and safety instructions. Do not use the service for unsafe or unlawful activity. Report urgent safety concerns to local emergency services first, then contact DriverX support.',
  },
  {
    title: 'Ratings and feedback',
    body: 'After a trip is completed, you may submit one honest 1-to-5-star rating for the assigned driver. Ratings and feedback should reflect your own experience and must not contain abusive, discriminatory, or private information.',
  },
  {
    title: 'Information and privacy',
    body: 'DriverX uses account and contact details, booking information, and pickup, drop-off, or saved-location details to provide and support rides. Information may also be used for service security, troubleshooting, and legally required purposes. Access to information is limited to what is needed to operate the service.',
  },
  {
    title: 'Location and device permissions',
    body: 'If you grant location permission, the app may use your device location to help with pickup and trip features. You can manage permissions in your device settings; some features may not work without them. You can review or update saved locations in Settings.',
  },
  {
    title: 'Account, service changes and support',
    body: 'You may update your profile or sign out in the app. DriverX may update features or these policies as the service changes. Material policy updates should be presented in the app. For questions or privacy requests, use Help & Support in Settings.',
  },
];

export default function TermsPoliciesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = isCustomerDesktop(width);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(customer)/profile');
    }
  };

  const pageContent = (
    <View style={styles.pageContent}>
      <View style={styles.titleRow}>
        <View style={styles.titleIcon}>
          <FileText size={22} color="#00A892" strokeWidth={2} />
        </View>
        <View style={styles.titleCopy}>
          <Text style={styles.pageTitle}>Terms & Policies</Text>
          <Text style={styles.pageSubtitle}>DriverX rider information</Text>
        </View>
      </View>

      <View style={styles.notice}>
        <ShieldCheck size={19} color="#0876F9" strokeWidth={2} />
        <Text style={styles.noticeText}>
          General in-app guidance. Have these policies reviewed and approved for your
          business and local laws before public launch.
        </Text>
      </View>

      <View style={styles.sections}>
        {POLICY_SECTIONS.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionNumber}>{String(index + 1).padStart(2, '0')}</Text>
            <View style={styles.sectionCopy}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionBody}>{section.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.updated}>Last updated: November 3, 2026</Text>
    </View>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopPage}>
        <StatusBar style="dark" />
        <DesktopHeader activeTab="profile" />
        <View style={styles.desktopBody}>
          <DesktopSidebar activeTab="settings" />
          <View style={styles.desktopMain}>
            <View style={styles.desktopTopBar}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Back to Settings"
              >
                <ArrowLeft size={18} color="#173A72" strokeWidth={2.2} />
                <Text style={styles.backText}>Back to Settings</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.desktopContent}
              showsVerticalScrollIndicator={false}
            >
              {pageContent}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mobilePage} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.mobileTopBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Back to Settings"
        >
          <ArrowLeft size={20} color="#173A72" strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.mobileHeaderTitle}>Terms & Policies</Text>
        <View style={styles.backButton} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.mobileContent}
        showsVerticalScrollIndicator={false}
      >
        {pageContent}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mobilePage: {
    flex: 1,
    backgroundColor: '#F3F6FA',
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
  },
  desktopTopBar: {
    minHeight: 64,
    paddingHorizontal: 36,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF5',
  },
  mobileTopBar: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF5',
  },
  backButton: {
    minWidth: 40,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    color: '#173A72',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
  },
  mobileHeaderTitle: {
    color: '#0E1E38',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  mobileContent: {
    flexGrow: 1,
    padding: 18,
    paddingBottom: 36,
  },
  desktopContent: {
    flexGrow: 1,
    paddingHorizontal: 36,
    paddingVertical: 28,
  },
  pageContent: {
    width: '100%',
    flexGrow: 1,
    alignSelf: 'center',
    maxWidth: 1120,
    padding: 24,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EEF5',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
  },
  titleIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6FAF6',
  },
  titleCopy: {
    flex: 1,
  },
  pageTitle: {
    color: '#102A56',
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'Poppins-Bold',
  },
  pageSubtitle: {
    color: '#7383A1',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#F3F8FC',
    marginBottom: 24,
  },
  noticeText: {
    flex: 1,
    color: '#52647B',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  sections: {
    gap: 0,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  sectionNumber: {
    width: 30,
    paddingTop: 1,
    color: '#00A892',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionCopy: {
    flex: 1,
    gap: 5,
  },
  sectionTitle: {
    color: '#0E1E38',
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },
  sectionBody: {
    color: '#52647B',
    fontSize: 13,
    lineHeight: 21,
    fontFamily: 'Poppins-Regular',
  },
  updated: {
    marginTop: 20,
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },
});
