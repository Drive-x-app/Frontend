import React, { useState, useEffect } from 'react';
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
  Modal,
  Pressable,
  TextInput,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Headphones,
  Clock,
  Phone,
  MessageSquare,
  MapPin,
  Star,
  Crosshair,
  Layers,
  Navigation,
  Send,
  X,
  User,
  ShieldCheck,
  Check,
  AlertCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useBookingStore } from '../../src/store/bookingStore';
import { DesktopHeader } from '../../src/components/common/DesktopHeader';
import { DesktopSidebar } from '../../src/components/common/DesktopSidebar';
import { InteractiveMap } from '../../src/components/common/InteractiveMap';
import { FONT } from '../../src/theme/typography';
import { homeApi } from '../../src/services/api/homeApi';
import { bookingsApi } from '../../src/services/api/bookingsApi';

// Driver and Pickup Coordinates in Coimbatore
const DRIVER_COORDS = {
  latitude: 11.025,
  longitude: 76.945,
  address: 'Driver Location (Near Gandhipuram)',
};

const PICKUP_COORDS = {
  latitude: 11.0168,
  longitude: 76.9558,
  address: '123, Anna Nagar, Coimbatore',
};

const ROUTE_POINTS = [
  { latitude: 11.025, longitude: 76.945 },
  { latitude: 11.023, longitude: 76.948 },
  { latitude: 11.02, longitude: 76.947 },
  { latitude: 11.019, longitude: 76.951 },
  { latitude: 11.0175, longitude: 76.953 },
  { latitude: 11.0168, longitude: 76.9558 },
];

export default function TrackDriverScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktopOrTablet =
    windowWidth > 600 ||
    (Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth > 600);

  const pickupLocationStore = useBookingStore((state) => state.pickupLocation);
  const activeBooking = useBookingStore((state) => state.activeBooking);

  // Dynamic driver & trip state
  const [driverName, setDriverName] = useState('Ramesh Kumar');
  const [driverRating, setDriverRating] = useState(4.8);
  const [driverTrips, setDriverTrips] = useState(320);
  const [driverPhone, setDriverPhone] = useState('+91 98765 43210');
  const [etaMinutes, setEtaMinutes] = useState(5);
  const [etaDistance, setEtaDistance] = useState('2.1 km');
  const [pickupAddress, setPickupAddress] = useState(
    pickupLocationStore || (activeBooking as any)?.pickupAddress || (activeBooking as any)?.pickupLocation || 'Pickup location'
  );

  // Modals state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      sender: 'driver',
      text: 'Hello! I am on my way to your pickup location.',
      time: '09:35 AM',
    },
  ]);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    // If active booking exists from backend, sync with it
    if (activeBooking?.driver) {
      setDriverName(activeBooking.driver.fullName || 'Ramesh Kumar');
      setDriverRating(activeBooking.driver.rating || 4.8);
      setDriverTrips(activeBooking.driver.totalRides || 320);
      setDriverPhone(activeBooking.driver.phoneNumber || '+91 98765 43210');
      if (activeBooking.pickupAddress) {
        setPickupAddress(activeBooking.pickupAddress);
      }
    }
  }, [activeBooking]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(customer)');
    }
  };

  const handleCallDriver = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Linking.openURL(`tel:${driverPhone}`).catch(() => {
      if (Platform.OS === 'web') {
        window.alert(`Call driver: ${driverPhone}`);
      } else {
        Alert.alert('Call Driver', `Driver contact number: ${driverPhone}`);
      }
    });
  };

  const handleShareTrip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const shareMessage = `Track my live DriverX ride: Driver ${driverName} is arriving in ${etaMinutes} mins at ${pickupAddress}. Live Link: https://driverx.com/track/DXB126789`;

    try {
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'DriverX Live Trip Tracking',
            text: shareMessage,
          });
        } else {
          await navigator.clipboard.writeText(shareMessage);
          window.alert('Live trip tracking link copied to clipboard!');
        }
      } else {
        await Share.share({
          message: shareMessage,
          title: 'DriverX Live Trip Tracking',
        });
      }
    } catch {
      // Handled
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const newMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput.trim(),
      time: 'Now',
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Simulate polite driver reply after 1.5s
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'driver',
          text: 'Got it, thank you! Reaching shortly.',
          time: 'Now',
        },
      ]);
    }, 1500);
  };

  const handleCancelBooking = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const executeCancel = async () => {
      try {
        setIsCancelling(true);
        if (activeBooking?.id) {
          await homeApi.cancelActiveBooking(activeBooking.id, 'Cancelled by customer');
        }
        if (Platform.OS === 'web') {
          window.alert('Booking has been cancelled.');
        } else {
          Alert.alert('Booking Cancelled', 'Your booking has been cancelled.');
        }
        router.replace('/(customer)');
      } catch {
        router.replace('/(customer)');
      } finally {
        setIsCancelling(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel this booking?')) {
        executeCancel();
      }
    } else {
      Alert.alert(
        'Cancel Booking',
        'Are you sure you want to cancel this booking? Your driver is already on the way.',
        [
          { text: 'Keep Booking', style: 'cancel' },
          { text: 'Cancel Booking', style: 'destructive', onPress: executeCancel },
        ]
      );
    }
  };

  // Content for mobile and desktop card
  const renderMainContent = () => (
    <>
      {/* 1. Header Title & Subtitle */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Driver is on the way</Text>
        <Text style={styles.pageSubtitle}>
          Your driver will reach the pickup location soon.
        </Text>
      </View>

      {/* 2. Map Section with Overlays & Custom Route */}
      <View style={styles.mapContainer}>
        <InteractiveMap
          pickupCoords={PICKUP_COORDS}
          dropCoords={DRIVER_COORDS}
          routeCoordinates={ROUTE_POINTS}
          style={styles.mapView}
          showControls={false}
        />

        {/* Top-Left Floating Badge: Driver is 5 mins away */}
        <View style={styles.driverEtaOverlayBadge}>
          <View style={styles.driverEtaIconCircle}>
            <User size={18} color="#0E1E38" strokeWidth={2.4} />
          </View>
          <View style={styles.driverEtaTextCol}>
            <Text style={styles.driverEtaTitle}>Driver is {etaMinutes} mins away</Text>
            <Text style={styles.driverEtaSubtitle}>{etaDistance}</Text>
          </View>
        </View>

        {/* Floating Callout at Pickup Location */}
        <View style={styles.pickupCalloutBadge}>
          <Text style={styles.pickupCalloutLabel}>Your Pickup Location</Text>
          <Text style={styles.pickupCalloutAddress} numberOfLines={2}>
            {pickupAddress}
          </Text>
        </View>

        {/* Right Floating Controls */}
        <View style={styles.mapRightControls}>
          <TouchableOpacity
            style={styles.mapControlBtn}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }}
            accessibilityLabel="Recenter map"
          >
            <Crosshair size={18} color="#0E1E38" strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapControlBtn}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }}
            accessibilityLabel="Toggle map layers"
          >
            <Layers size={18} color="#0E1E38" strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapControlBtn}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }}
            accessibilityLabel="Navigation mode"
          >
            <Navigation size={18} color="#0E1E38" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Estimated Arrival & Driver Details Card */}
      <View style={styles.driverCard}>
        {/* Left: ETA */}
        <View style={styles.etaCol}>
          <View style={styles.etaIconRow}>
            <View style={styles.etaClockCircle}>
              <Clock size={18} color="#0E1E38" strokeWidth={2.4} />
            </View>
            <View>
              <Text style={styles.etaMicroLabel}>Estimated Arrival</Text>
              <Text style={styles.etaMinutesBig}>{etaMinutes} mins</Text>
              <Text style={styles.etaDistanceText}>{etaDistance} away</Text>
            </View>
          </View>
        </View>

        <View style={styles.driverCardDivider} />

        {/* Right: Driver Info & Call Button */}
        <View style={styles.driverProfileCol}>
          <Image
            source={require('../../assets/avatar_user.jpg')}
            style={styles.driverAvatar}
          />
          <View style={styles.driverDetailsTextCol}>
            <Text style={styles.driverNameText}>{driverName}</Text>
            <View style={styles.driverRatingRow}>
              <Star size={12} color="#EAB308" fill="#EAB308" />
              <Text style={styles.driverRatingVal}>
                {driverRating.toFixed(1)} ({driverTrips} trips)
              </Text>
            </View>
            <Text style={styles.driverRoleLabel}>Your assigned driver</Text>
          </View>

          <TouchableOpacity
            style={styles.driverCallCircleBtn}
            activeOpacity={0.85}
            onPress={handleCallDriver}
            accessibilityLabel="Call driver"
          >
            <Phone size={18} color="#00D2B4" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Timeline / Trip Milestones Stepper */}
      <View style={styles.timelineCard}>
        {/* Step 1: Driver Assigned (Completed) */}
        <View style={styles.timelineStepRow}>
          <View style={styles.stepperIndicatorCol}>
            <View style={styles.stepperDotTeal} />
            <View style={styles.stepperSolidLine} />
          </View>
          <View style={styles.stepperTextCol}>
            <Text style={styles.stepperStepTitle}>Driver Assigned</Text>
            <Text style={styles.stepperStepTime}>09:32 AM</Text>
          </View>
        </View>

        {/* Step 2: Driver is on the way (Active) */}
        <View style={styles.timelineStepRow}>
          <View style={styles.stepperIndicatorCol}>
            <View style={styles.stepperDotTealActive}>
              <View style={styles.stepperDotInner} />
            </View>
            <View style={styles.stepperDashedLine} />
          </View>
          <View style={styles.stepperTextCol}>
            <Text style={styles.stepperStepTitle}>Driver is on the way</Text>
            <Text style={styles.stepperStepTime}>09:35 AM</Text>
          </View>
        </View>

        {/* Step 3: Driver Arrived (Pending) */}
        <View style={styles.timelineStepRow}>
          <View style={styles.stepperIndicatorCol}>
            <View style={styles.stepperDotGrey} />
            <View style={styles.stepperDashedLine} />
          </View>
          <View style={styles.stepperTextCol}>
            <Text style={styles.stepperStepTitleMuted}>Driver Arrived</Text>
          </View>
        </View>

        {/* Step 4: Trip Started (Pending) */}
        <View style={styles.timelineStepRow}>
          <View style={styles.stepperIndicatorCol}>
            <View style={styles.stepperDotGrey} />
          </View>
          <View style={styles.stepperTextCol}>
            <Text style={styles.stepperStepTitleMuted}>Trip Started</Text>
          </View>
        </View>
      </View>

      {/* 5. Quick Action Buttons: Chat, Call, Share Trip */}
      <View style={styles.quickActionsRow}>
        <TouchableOpacity
          style={styles.quickActionCard}
          activeOpacity={0.8}
          onPress={() => setIsChatOpen(true)}
        >
          <MessageSquare size={20} color="#0E1E38" strokeWidth={2.2} />
          <Text style={styles.quickActionLabel}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          activeOpacity={0.8}
          onPress={handleCallDriver}
        >
          <Phone size={20} color="#0E1E38" strokeWidth={2.2} />
          <Text style={styles.quickActionLabel}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          activeOpacity={0.8}
          onPress={handleShareTrip}
        >
          <MapPin size={20} color="#0E1E38" strokeWidth={2.2} />
          <Text style={styles.quickActionLabel}>Share Trip</Text>
        </TouchableOpacity>
      </View>

      {/* 5b. Transition to Trip in Progress */}
      <TouchableOpacity
        style={styles.tripInProgressBanner}
        activeOpacity={0.88}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          router.push('/(customer)/trip-in-progress');
        }}
      >
        <View style={styles.tripBannerDotLive} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.tripBannerTitle}>Driver Arrived • Trip in Progress</Text>
          <Text style={styles.tripBannerSubtitle}>Tap to switch to live ride tracking</Text>
        </View>
        <Navigation size={16} color="#00D2B4" strokeWidth={2.4} />
      </TouchableOpacity>

      {/* 6. Cancel Booking Outlined Button */}
      <TouchableOpacity
        style={styles.cancelBookingButton}
        activeOpacity={0.85}
        onPress={handleCancelBooking}
        disabled={isCancelling}
      >
        <Text style={styles.cancelBookingButtonText}>
          {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
        </Text>
      </TouchableOpacity>
    </>
  );

  // In-app Driver Chat Modal
  const renderChatModal = () => (
    <Modal
      visible={isChatOpen}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsChatOpen(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setIsChatOpen(false)}>
        <Pressable style={styles.chatModalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.chatHeader}>
            <Image
              source={require('../../assets/avatar_user.jpg')}
              style={styles.chatDriverAvatar}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.chatDriverName}>{driverName}</Text>
              <Text style={styles.chatDriverSub}>Assigned Driver • Online</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsChatOpen(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color="#64748B" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView style={styles.chatMessagesScroll} showsVerticalScrollIndicator={false}>
            {chatMessages.map((msg) => {
              const isMe = msg.sender === 'user';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.chatBubbleRow,
                    isMe ? styles.chatBubbleRowMe : styles.chatBubbleRowDriver,
                  ]}
                >
                  <View
                    style={[
                      styles.chatBubble,
                      isMe ? styles.chatBubbleMe : styles.chatBubbleDriver,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chatBubbleText,
                        isMe ? styles.chatBubbleTextMe : styles.chatBubbleTextDriver,
                      ]}
                    >
                      {msg.text}
                    </Text>
                    <Text
                      style={[
                        styles.chatBubbleTime,
                        isMe ? styles.chatBubbleTimeMe : styles.chatBubbleTimeDriver,
                      ]}
                    >
                      {msg.time}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Quick Pre-filled Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chatQuickChipsScroll}
          >
            {['I am waiting at the gate', 'Please call when you arrive', 'Coming in 2 mins'].map(
              (chip) => (
                <TouchableOpacity
                  key={chip}
                  style={styles.chatChip}
                  onPress={() => setChatInput(chip)}
                >
                  <Text style={styles.chatChipText}>{chip}</Text>
                </TouchableOpacity>
              )
            )}
          </ScrollView>

          {/* Input Row */}
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatTextInput}
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Type a message to driver..."
              placeholderTextColor="#94A3B8"
              onSubmitEditing={handleSendMessage}
            />
            <TouchableOpacity
              style={styles.chatSendBtn}
              activeOpacity={0.8}
              onPress={handleSendMessage}
            >
              <Send size={16} color="#072038" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  // Support Modal
  const renderSupportModal = () => (
    <Modal
      visible={isSupportOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsSupportOpen(false)}
    >
      <Pressable style={styles.modalOverlay} onPress={() => setIsSupportOpen(false)}>
        <Pressable style={styles.supportModalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.supportHeader}>
            <Text style={styles.supportTitle}>DriverX Support</Text>
            <TouchableOpacity onPress={() => setIsSupportOpen(false)}>
              <X size={18} color="#64748B" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <Text style={styles.supportSubtitle}>
            Our 24/7 dedicated support team is here to assist you during your ride.
          </Text>

          <TouchableOpacity
            style={styles.supportActionRow}
            onPress={() => Linking.openURL('tel:18001234567')}
          >
            <Phone size={18} color="#00D2B4" strokeWidth={2.2} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.supportActionTitle}>Call Priority Helpline</Text>
              <Text style={styles.supportActionSub}>Toll-free 1800-123-4567</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportActionRow}
            onPress={() => {
              setIsSupportOpen(false);
              setIsChatOpen(true);
            }}
          >
            <MessageSquare size={18} color="#00D2B4" strokeWidth={2.2} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.supportActionTitle}>Message Assigned Driver</Text>
              <Text style={styles.supportActionSub}>Direct in-app communication</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportDismissBtn}
            onPress={() => setIsSupportOpen(false)}
          >
            <Text style={styles.supportDismissText}>Close</Text>
          </TouchableOpacity>
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
        <DesktopHeader activeTab="bookings" />

        <View style={styles.desktopBodyRow}>
          <DesktopSidebar activeTab="bookings" />

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
                  <Text style={styles.desktopBackText}>Back to Bookings</Text>
                </TouchableOpacity>

                {renderMainContent()}
              </View>
            </ScrollView>
          </View>
        </View>

        {renderChatModal()}
        {renderSupportModal()}
      </View>
    );
  }

  // =========================================================================
  // MOBILE VIEW (Exact Match to Reference Screenshot)
  // =========================================================================
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />

      {/* Top Mobile Bar: Back Button, Centered DriverX Logo, Support Pill */}
      <View style={styles.mobileTopBar}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={handleBack}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color="#0E1E38" strokeWidth={2.4} />
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

        <TouchableOpacity
          style={styles.supportPillBtn}
          activeOpacity={0.8}
          onPress={() => setIsSupportOpen(true)}
          accessibilityLabel="Customer Support"
        >
          <Headphones size={13} color="#0E1E38" strokeWidth={2.2} />
          <Text style={styles.supportPillText}>Support</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.mobileScrollView}
        contentContainerStyle={[styles.mobileScrollContent, { paddingBottom: 28 }]}
        showsVerticalScrollIndicator={false}
      >
        {renderMainContent()}
      </ScrollView>

      {renderChatModal()}
      {renderSupportModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mobileTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  brandCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmblem: {
    width: 44,
    height: 24,
  },
  brandTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -2,
  },
  brandTextNavy: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: '#0E1E38',
    letterSpacing: -0.3,
  },
  brandTextTeal: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: '#00D2B4',
    letterSpacing: -0.3,
  },
  supportPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  supportPillText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: '#0E1E38',
  },
  mobileScrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mobileScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  titleSection: {
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: FONT.bold,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: '#64748B',
    marginTop: 3,
  },

  // Map Container & Overlays
  mapContainer: {
    height: 270,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  mapView: {
    width: '100%',
    height: '100%',
  },
  driverEtaOverlayBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      },
    }),
  },
  driverEtaIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#0E1E38',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  driverEtaTextCol: {},
  driverEtaTitle: {
    fontSize: 12.5,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  driverEtaSubtitle: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: '#64748B',
  },
  pickupCalloutBadge: {
    position: 'absolute',
    bottom: 24,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    maxWidth: 170,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      },
    }),
  },
  pickupCalloutLabel: {
    fontSize: 9.5,
    fontFamily: FONT.bold,
    color: '#64748B',
  },
  pickupCalloutAddress: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: '#0E1E38',
    marginTop: 1,
  },
  mapRightControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 8,
  },
  mapControlBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      },
    }),
  },

  // Driver & ETA Card
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#0E1E38',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 10px rgba(14, 30, 56, 0.04)',
      },
    }),
  },
  etaCol: {
    flex: 1.1,
  },
  etaIconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  etaClockCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaMicroLabel: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: '#64748B',
  },
  etaMinutesBig: {
    fontSize: 22,
    fontFamily: FONT.bold,
    color: '#0E1E38',
    letterSpacing: -0.5,
    marginTop: 1,
  },
  etaDistanceText: {
    fontSize: 11.5,
    fontFamily: FONT.regular,
    color: '#64748B',
  },
  driverCardDivider: {
    width: 1,
    height: 52,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
  driverProfileCol: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  driverDetailsTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  driverNameText: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  driverRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  driverRatingVal: {
    fontSize: 11.5,
    fontFamily: FONT.medium,
    color: '#64748B',
  },
  driverRoleLabel: {
    fontSize: 10.5,
    fontFamily: FONT.regular,
    color: '#94A3B8',
    marginTop: 1,
  },
  driverCallCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6FAF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },

  // Timeline Stepper Card
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 14,
  },
  timelineStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepperIndicatorCol: {
    alignItems: 'center',
    width: 20,
    marginRight: 12,
  },
  stepperDotTeal: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00D2B4',
  },
  stepperDotTealActive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#C7F5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00D2B4',
  },
  stepperDotGrey: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  stepperSolidLine: {
    width: 2,
    height: 32,
    backgroundColor: '#00D2B4',
    marginVertical: 2,
  },
  stepperDashedLine: {
    width: 2,
    height: 32,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  stepperTextCol: {
    flex: 1,
    paddingTop: 0,
    marginBottom: 18,
  },
  stepperStepTitle: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  stepperStepTime: {
    fontSize: 11.5,
    fontFamily: FONT.regular,
    color: '#64748B',
    marginTop: 1,
  },
  stepperStepTitleMuted: {
    fontSize: 13.5,
    fontFamily: FONT.medium,
    color: '#64748B',
  },

  // Quick Actions (Chat, Call, Share Trip)
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#0E1E38',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
      },
      android: {
        elevation: 1.5,
      },
      web: {
        boxShadow: '0 2px 8px rgba(14, 30, 56, 0.04)',
      },
    }),
  },
  quickActionLabel: {
    fontSize: 12.5,
    fontFamily: FONT.bold,
    color: '#0E1E38',
    marginTop: 6,
  },

  // Cancel Booking
  cancelBookingButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#0E1E38',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cancelBookingButtonText: {
    fontSize: 14.5,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },

  // Modals Overlay & Card
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 30, 56, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  chatModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 480,
    height: 520,
    padding: 18,
    display: 'flex',
    flexDirection: 'column',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      },
    }),
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  chatDriverAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  chatDriverName: {
    fontSize: 14.5,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  chatDriverSub: {
    fontSize: 11.5,
    fontFamily: FONT.regular,
    color: '#00D2B4',
  },
  chatMessagesScroll: {
    flex: 1,
    paddingVertical: 12,
  },
  chatBubbleRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  chatBubbleRowDriver: {
    justifyContent: 'flex-start',
  },
  chatBubbleRowMe: {
    justifyContent: 'flex-end',
  },
  chatBubble: {
    maxWidth: '78%',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  chatBubbleDriver: {
    backgroundColor: '#F1F5F9',
    borderTopLeftRadius: 4,
  },
  chatBubbleMe: {
    backgroundColor: '#00D2B4',
    borderTopRightRadius: 4,
  },
  chatBubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  chatBubbleTextDriver: {
    color: '#0E1E38',
    fontFamily: FONT.regular,
  },
  chatBubbleTextMe: {
    color: '#072038',
    fontFamily: FONT.medium,
  },
  chatBubbleTime: {
    fontSize: 10,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  chatBubbleTimeDriver: {
    color: '#94A3B8',
  },
  chatBubbleTimeMe: {
    color: '#005448',
  },
  chatQuickChipsScroll: {
    gap: 8,
    paddingVertical: 8,
  },
  chatChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatChipText: {
    fontSize: 11.5,
    fontFamily: FONT.medium,
    color: '#475569',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13.5,
    fontFamily: FONT.regular,
    color: '#0E1E38',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatSendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#00D2B4',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Support Modal
  supportModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 440,
    padding: 20,
  },
  supportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  supportTitle: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  supportSubtitle: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  supportActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  supportActionTitle: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  supportActionSub: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#64748B',
    marginTop: 2,
  },
  supportDismissBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  supportDismissText: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  tripInProgressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF9',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.2,
    borderColor: '#CCFBF1',
    marginBottom: 16,
  },
  tripBannerDotLive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  tripBannerTitle: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#0E1E38',
  },
  tripBannerSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },

  // Desktop Specific Layout
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
    paddingVertical: 28,
    paddingHorizontal: 36,
    alignItems: 'center',
  },
  desktopMainCard: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(14, 30, 56, 0.05)',
      },
    }),
  },
  desktopBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  desktopBackText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: '#0E1E38',
  },
});
