import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
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
  AlertCircle,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Compass,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useBookingStore } from '../../src/store/bookingStore';
import { DesktopHeader } from '../../src/components/common/DesktopHeader';
import { DesktopSidebar } from '../../src/components/common/DesktopSidebar';
import { InteractiveMap } from '../../src/components/common/InteractiveMap';
import { FONT } from '../../src/theme/typography';
import { homeApi } from '../../src/services/api/homeApi';

// Coordinated Points in Coimbatore for the active trip
const PICKUP_COORDS = {
  latitude: 11.0168,
  longitude: 76.9558,
  address: '123, Anna Nagar, Coimbatore',
};

const DROP_COORDS = {
  latitude: 11.0088,
  longitude: 76.9515,
  address: 'RS Puram, Coimbatore',
};

// Simulated ongoing route from Anna Nagar through Saibaba Colony towards RS Puram
const ROUTE_POINTS = [
  { latitude: 11.0168, longitude: 76.9558 },
  { latitude: 11.0185, longitude: 76.9535 },
  { latitude: 11.0202, longitude: 76.949 },
  { latitude: 11.0175, longitude: 76.9472 },
  { latitude: 11.0142, longitude: 76.9485 },
  { latitude: 11.0115, longitude: 76.9502 },
  { latitude: 11.0088, longitude: 76.9515 },
];

export default function TripInProgressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isDesktopOrTablet =
    windowWidth > 600 ||
    (Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth > 600);

  // Zustand Store
  const pickupLocationStore = useBookingStore((state) => state.pickupLocation);
  const dropLocationStore = useBookingStore((state) => state.dropLocation);
  const pickupCoordsStore = useBookingStore((state) => state.pickupCoords);
  const dropCoordsStore = useBookingStore((state) => state.dropCoords);
  const selectedDurationId = useBookingStore((state) => state.selectedDurationId);
  const activeBooking = useBookingStore((state) => state.activeBooking);

  // Dynamic Driver & Vehicle Details
  const [driverName] = useState('Ramesh Kumar');
  const [driverRating] = useState(4.9);
  const [driverTrips] = useState(320);
  const [driverVehicle] = useState('White Toyota Etios');
  const [driverPlate] = useState('TN 38 AB 1234');
  const [driverPhone] = useState('+91 98765 43210');

  // Locations
  const pickupLocation = pickupLocationStore || '123, Anna Nagar, Coimbatore';
  const dropLocation = dropLocationStore || 'RS Puram, Coimbatore';

  // Elapsed / Remaining Time State
  const [elapsedMinutes, setElapsedMinutes] = useState(80); // 1h 20m default matching screenshot
  const totalDurationHours = selectedDurationId === '2h' ? 2 : selectedDurationId === '6h' ? 6 : selectedDurationId === 'fullday' ? 12 : 4;
  const totalDurationMinutes = totalDurationHours * 60;
  const remainingMinutes = Math.max(0, totalDurationMinutes - elapsedMinutes);

  // Format Elapsed & Remaining Display
  const formatHourMin = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Live pulsing animation for active tracking indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  // Live seconds ticker for realistic tracking (increases elapsed every 60s)
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMinutes((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Modals state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isEndTripModalOpen, setIsEndTripModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      sender: 'driver',
      text: 'Good day! I have started your trip. Please let me know if you need to adjust AC or music.',
      time: '10:05 AM',
    },
    {
      id: '2',
      sender: 'user',
      text: 'Thank you Ramesh, current temperature is great.',
      time: '10:08 AM',
    },
  ]);

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
    const cleanNumber = driverPhone.replace(/\s+/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      if (Platform.OS === 'web') {
        window.alert(`Calling driver Ramesh Kumar at ${driverPhone}`);
      } else {
        Alert.alert('Calling Driver', `Dialing ${driverPhone}...`);
      }
    });
  };

  const handleCallSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const supportPhone = '+918000012345';
    Linking.openURL(`tel:${supportPhone}`).catch(() => {
      if (Platform.OS === 'web') {
        window.alert('DriverX 24/7 Priority Support: 1800-425-9999');
      } else {
        Alert.alert('DriverX Priority Support', 'Connecting to 24/7 Support Desk...');
      }
    });
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
          text: 'Understood, continuing via the fastest route!',
          time: 'Now',
        },
      ]);
    }, 1400);
  };

  const handleTriggerSos = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setIsSosOpen(true);
  };

  const handleConfirmEndTrip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsEndTripModalOpen(false);

    if (Platform.OS === 'web') {
      window.alert('Trip completed early! Fare has been recalculated based on 1h 20m elapsed.');
    } else {
      Alert.alert(
        'Trip Completed Early',
        'Your trip has been ended successfully. Fare has been adjusted.'
      );
    }
    router.replace('/(customer)/my-bookings');
  };

  // Content for mobile and desktop card
  const renderMainContent = () => (
    <>
      {/* 1. Header Title & Subtitle */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Trip in Progress</Text>
        <Text style={styles.pageSubtitle}>Your ride is currently in progress.</Text>
      </View>

      {/* 2. Map Section with Live Overlays */}
      <View style={styles.mapContainer}>
        <InteractiveMap
          pickupCoords={pickupCoordsStore || PICKUP_COORDS}
          dropCoords={dropCoordsStore || DROP_COORDS}
          routeCoordinates={ROUTE_POINTS}
          style={styles.mapView}
          showControls={false}
        />

        {/* Top-Left Floating Badge: Time Elapsed */}
        <View style={styles.timeElapsedCard}>
          <View style={styles.timeElapsedIconCircle}>
            <Clock size={16} color="#0E1E38" strokeWidth={2.4} />
          </View>
          <View style={styles.timeElapsedTextCol}>
            <Text style={styles.timeElapsedMicroLabel}>Time Elapsed</Text>
            <Text style={styles.timeElapsedMainValue}>{formatHourMin(elapsedMinutes)}</Text>
            <Text style={styles.timeElapsedSubtext}>of {totalDurationHours} hours</Text>
          </View>
        </View>

        {/* Floating Callout at Pickup Location (Bottom-Left) */}
        <View style={styles.pickupCalloutBadge}>
          <View style={[styles.miniPinCircle, { backgroundColor: '#E6FAF6' }]}>
            <MapPin size={12} color="#00D2B4" fill="#00D2B4" strokeWidth={1} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.calloutLabel}>Pickup Location</Text>
            <Text style={styles.calloutAddress} numberOfLines={1}>
              {pickupLocation}
            </Text>
          </View>
        </View>

        {/* Floating Vehicle Tracking Badge (Middle of Route) */}
        <View style={styles.vehicleOnTripBadge}>
          <Animated.View
            style={[
              styles.vehicleGlowAura,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <View style={styles.vehicleWhitePill}>
            <View style={styles.liveGreenDot} />
            <Text style={styles.vehicleStatusTitle}>On Trip</Text>
          </View>
          <Text style={styles.vehicleStatusSubtitle}>Live tracking</Text>
        </View>

        {/* Floating Callout at Drop Location (Top-Right) */}
        <View style={styles.dropCalloutBadge}>
          <View style={[styles.miniPinCircle, { backgroundColor: '#FEE2E2' }]}>
            <MapPin size={12} color="#EF4444" fill="#EF4444" strokeWidth={1} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.calloutLabel}>Drop Location</Text>
            <Text style={styles.calloutAddress} numberOfLines={1}>
              {dropLocation}
            </Text>
          </View>
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
            <Crosshair size={17} color="#0E1E38" strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapControlBtn}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }}
            accessibilityLabel="Toggle map layers"
          >
            <Layers size={17} color="#0E1E38" strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapControlBtn}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }}
            accessibilityLabel="Navigation mode"
          >
            <Navigation size={17} color="#0E1E38" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Driver Profile & Quick Actions Card */}
      <View style={styles.driverInfoCard}>
        {/* Left: Driver Avatar with Online Badge */}
        <View style={styles.avatarWrapper}>
          <Image
            source={require('../../assets/avatar_user.jpg')}
            style={styles.driverAvatar}
          />
          <View style={styles.onlineBadgeDot} />
        </View>

        {/* Middle: Driver Name, Rating, Vehicle Info */}
        <View style={styles.driverMetaColumn}>
          <Text style={styles.driverNameText}>{driverName}</Text>
          <View style={styles.ratingRow}>
            <Star size={13} color="#EAB308" fill="#EAB308" />
            <Text style={styles.ratingText}>
              {driverRating.toFixed(1)} ({driverTrips} trips)
            </Text>
          </View>
          <Text style={styles.vehicleModelText}>{driverVehicle}</Text>
          <Text style={styles.vehiclePlateText}>{driverPlate}</Text>
        </View>

        {/* Right: Actions (Call, Chat, SOS) */}
        <View style={styles.driverActionButtonsRow}>
          {/* Call Button */}
          <TouchableOpacity
            style={styles.driverActionBtnCol}
            activeOpacity={0.75}
            onPress={handleCallDriver}
            accessibilityLabel="Call driver"
          >
            <View style={styles.driverActionCircleBtn}>
              <Phone size={17} color="#0E1E38" strokeWidth={2.2} />
            </View>
            <Text style={styles.driverActionLabel}>Call</Text>
          </TouchableOpacity>

          {/* Chat Button */}
          <TouchableOpacity
            style={styles.driverActionBtnCol}
            activeOpacity={0.75}
            onPress={() => setIsChatOpen(true)}
            accessibilityLabel="Chat with driver"
          >
            <View style={styles.driverActionCircleBtn}>
              <MessageSquare size={17} color="#0E1E38" strokeWidth={2.2} />
            </View>
            <Text style={styles.driverActionLabel}>Chat</Text>
          </TouchableOpacity>

          {/* SOS Button */}
          <TouchableOpacity
            style={styles.driverActionBtnCol}
            activeOpacity={0.75}
            onPress={handleTriggerSos}
            accessibilityLabel="Emergency SOS"
          >
            <View style={[styles.driverActionCircleBtn, styles.sosCircleBtn]}>
              <Text style={styles.sosCircleBtnText}>SOS</Text>
            </View>
            <Text style={[styles.driverActionLabel, { color: '#EF4444', fontWeight: '700' }]}>
              SOS
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Trip Details Timeline Card */}
      <View style={styles.tripDetailsCard}>
        {/* Card Header */}
        <View style={styles.tripDetailsHeader}>
          <Text style={styles.tripDetailsTitle}>Trip Details</Text>
          <View style={styles.durationPillBadge}>
            <Text style={styles.durationPillText}>{totalDurationHours} Hours Booking</Text>
          </View>
        </View>

        {/* Stepper Timeline */}
        <View style={styles.timelineWrapper}>
          {/* Step 1: Pickup Location */}
          <View style={styles.timelineRow}>
            <View style={styles.timelineIndicatorCol}>
              <View style={styles.concentricTealRing}>
                <View style={styles.concentricTealDot} />
              </View>
              <View style={styles.verticalConnectorTeal} />
            </View>
            <View style={styles.timelineContentRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.timelineStepLabel}>Pickup Location</Text>
                <Text style={styles.timelineStepAddress} numberOfLines={1}>
                  {pickupLocation}
                </Text>
              </View>
              <Text style={styles.timelineStepTime}>10:00 AM</Text>
            </View>
          </View>

          {/* Step 2: Trip in Progress (Active) */}
          <View style={styles.timelineRow}>
            <View style={styles.timelineIndicatorCol}>
              <View style={styles.activeSolidTealDot} />
              <View style={styles.verticalConnectorGrey} />
            </View>
            <View style={styles.timelineContentRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.timelineStepLabelActive}>Trip in Progress</Text>
                <Text style={styles.timelineStepSubtext}>Started at 10:05 AM</Text>
              </View>
              <View style={styles.liveTimeBadgeRow}>
                <Text style={styles.timelineLiveTimeText}>11:25 AM</Text>
                <View style={styles.liveDotTeal} />
                <Text style={styles.liveTagText}>Live</Text>
              </View>
            </View>
          </View>

          {/* Step 3: Drop Location */}
          <View style={styles.timelineRow}>
            <View style={styles.timelineIndicatorCol}>
              <View style={styles.hollowGreyRing} />
            </View>
            <View style={styles.timelineContentRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.timelineStepLabel}>Drop Location</Text>
                <Text style={styles.timelineStepAddress} numberOfLines={1}>
                  {dropLocation}
                </Text>
              </View>
              <Text style={styles.timelineStepTime}>-</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 5. Remaining Time & Estimated Drop Metrics Card */}
      <View style={styles.tripMetricsCard}>
        {/* Remaining Time */}
        <View style={styles.tripMetricHalf}>
          <View style={styles.metricIconBadge}>
            <Clock size={16} color="#00D2B4" strokeWidth={2.4} />
          </View>
          <View style={styles.metricTextWrapper}>
            <Text style={styles.metricMicroLabel}>Remaining Time</Text>
            <Text style={styles.metricMainValue}>{formatHourMin(remainingMinutes)}</Text>
          </View>
        </View>

        <View style={styles.metricVerticalDivider} />

        {/* Est. Drop Time */}
        <View style={styles.tripMetricHalf}>
          <View style={styles.metricIconBadge}>
            <MapPin size={16} color="#00D2B4" fill="#00D2B4" strokeWidth={1} />
          </View>
          <View style={styles.metricTextWrapper}>
            <Text style={styles.metricMicroLabel}>Est. Drop Time</Text>
            <Text style={styles.metricMainValue}>2:00 PM</Text>
          </View>
        </View>
      </View>

      {/* 6. End Trip Early Outlined CTA Button */}
      <TouchableOpacity
        style={styles.endTripEarlyButton}
        activeOpacity={0.85}
        onPress={() => setIsEndTripModalOpen(true)}
      >
        <Pause size={15} color="#0E1E38" strokeWidth={2.8} />
        <Text style={styles.endTripEarlyButtonText}>End Trip Early</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
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
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalBackdropDismiss} onPress={() => setIsChatOpen(false)} />
        <View style={styles.chatSheet}>
          {/* Chat Header */}
          <View style={styles.chatHeader}>
            <Image
              source={require('../../assets/avatar_user.jpg')}
              style={styles.chatAvatar}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.chatDriverName}>{driverName}</Text>
              <Text style={styles.chatDriverRole}>Active Trip Driver • {driverPlate}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsChatOpen(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={20} color="#64748B" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Quick Preset Message Chips */}
          <View style={styles.chatChipsRow}>
            {['Stop for fuel?', 'Please turn on AC', 'Running on time?'].map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.chatPresetChip}
                onPress={() => {
                  setChatInput(chip);
                }}
              >
                <Text style={styles.chatPresetChipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Messages List */}
          <ScrollView style={styles.chatMessagesScroll} showsVerticalScrollIndicator={false}>
            {chatMessages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.chatBubbleRow,
                  msg.sender === 'user' ? styles.chatBubbleUserRow : styles.chatBubbleDriverRow,
                ]}
              >
                <View
                  style={[
                    styles.chatBubble,
                    msg.sender === 'user' ? styles.chatBubbleUser : styles.chatBubbleDriver,
                  ]}
                >
                  <Text
                    style={[
                      styles.chatBubbleText,
                      msg.sender === 'user'
                        ? styles.chatBubbleUserText
                        : styles.chatBubbleDriverText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.chatBubbleTime,
                      msg.sender === 'user'
                        ? styles.chatBubbleUserTime
                        : styles.chatBubbleDriverTime,
                    ]}
                  >
                    {msg.time}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Input Row */}
          <View style={styles.chatInputRow}>
            <TextInput
              style={styles.chatTextInput}
              placeholder="Type message to driver..."
              placeholderTextColor="#94A3B8"
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.chatSendBtn, !chatInput.trim() && { opacity: 0.5 }]}
              onPress={handleSendMessage}
              disabled={!chatInput.trim()}
            >
              <Send size={18} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // 24/7 Priority Support Modal
  const renderSupportModal = () => (
    <Modal
      visible={isSupportOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsSupportOpen(false)}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalBackdropDismiss} onPress={() => setIsSupportOpen(false)} />
        <View style={styles.supportCardModal}>
          <View style={styles.supportModalIconCircle}>
            <Headphones size={28} color="#00D2B4" strokeWidth={2.2} />
          </View>
          <Text style={styles.supportModalTitle}>DriverX Priority Support</Text>
          <Text style={styles.supportModalSubtitle}>
            Our team is available 24/7 during your active ride for instant assistance.
          </Text>

          <TouchableOpacity
            style={styles.supportActionCallBtn}
            activeOpacity={0.88}
            onPress={handleCallSupport}
          >
            <Phone size={18} color="#072038" strokeWidth={2.4} />
            <Text style={styles.supportActionCallBtnText}>Call Dedicated Helpdesk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportActionDismissBtn}
            activeOpacity={0.7}
            onPress={() => setIsSupportOpen(false)}
          >
            <Text style={styles.supportActionDismissBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // SOS Emergency Assistance Modal
  const renderSosModal = () => (
    <Modal
      visible={isSosOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsSosOpen(false)}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalBackdropDismiss} onPress={() => setIsSosOpen(false)} />
        <View style={styles.sosCardModal}>
          <View style={styles.sosIconCircleLarge}>
            <AlertTriangle size={32} color="#EF4444" strokeWidth={2.4} />
          </View>
          <Text style={styles.sosModalTitle}>Emergency SOS Assistance</Text>
          <Text style={styles.sosModalSubtitle}>
            If you feel unsafe or require medical/police support, select an option below immediately.
          </Text>

          <TouchableOpacity
            style={styles.sosCallPoliceBtn}
            activeOpacity={0.88}
            onPress={() => {
              Linking.openURL('tel:112');
            }}
          >
            <Phone size={18} color="#FFFFFF" strokeWidth={2.4} />
            <Text style={styles.sosCallPoliceBtnText}>Call Police / Emergency (112)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sosShareLocationBtn}
            activeOpacity={0.8}
            onPress={async () => {
              const liveLink = `https://driverx.app/track/dx-${Date.now().toString().slice(-6)}`;
              const msg = `🚨 EMERGENCY: I am currently on a DriverX trip. Live GPS location: ${liveLink}`;
              if (Platform.OS === 'web') {
                if (navigator.clipboard) {
                  await navigator.clipboard.writeText(msg);
                  window.alert('Emergency location copied to clipboard!');
                }
              } else {
                await Share.share({ message: msg });
              }
            }}
          >
            <MapPin size={17} color="#0E1E38" strokeWidth={2.2} />
            <Text style={styles.sosShareLocationBtnText}>Broadcast Live GPS Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportActionDismissBtn}
            activeOpacity={0.7}
            onPress={() => setIsSosOpen(false)}
          >
            <Text style={styles.supportActionDismissBtnText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // End Trip Early Confirmation Modal
  const renderEndTripEarlyModal = () => (
    <Modal
      visible={isEndTripModalOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsEndTripModalOpen(false)}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalBackdropDismiss} onPress={() => setIsEndTripModalOpen(false)} />
        <View style={styles.endTripModalCard}>
          <View style={styles.endTripIconCircle}>
            <Pause size={26} color="#0E1E38" strokeWidth={2.6} />
          </View>
          <Text style={styles.endTripModalTitle}>End Trip Early?</Text>
          <Text style={styles.endTripModalSubtitle}>
            Your ride has been active for {formatHourMin(elapsedMinutes)} of your {totalDurationHours}-hour rental.
            Ending now will adjust your final fare based on actual completed time.
          </Text>

          <View style={styles.endTripSummaryPill}>
            <Text style={styles.endTripSummaryPillLabel}>Estimated Adjusted Fare</Text>
            <Text style={styles.endTripSummaryPillVal}>₹ {Math.round(450 * (elapsedMinutes / 60))}</Text>
          </View>

          <View style={styles.endTripModalActionsRow}>
            <TouchableOpacity
              style={styles.endTripKeepRidingBtn}
              activeOpacity={0.8}
              onPress={() => setIsEndTripModalOpen(false)}
            >
              <Text style={styles.endTripKeepRidingBtnText}>Keep Riding</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.endTripConfirmBtn}
              activeOpacity={0.88}
              onPress={handleConfirmEndTrip}
            >
              <Text style={styles.endTripConfirmBtnText}>End Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // DESKTOP LAYOUT
  if (isDesktopOrTablet) {
    return (
      <View style={styles.desktopOuterContainer}>
        <StatusBar style="dark" />
        <DesktopHeader activeTab="home" />

        <View style={styles.desktopBodyRow}>
          <DesktopSidebar activeTab="home" />

          <View style={styles.desktopContentArea}>
            <ScrollView
              style={styles.desktopScroll}
              contentContainerStyle={styles.desktopScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.desktopTopBar}>
                <TouchableOpacity
                  style={styles.desktopBackBtn}
                  activeOpacity={0.7}
                  onPress={handleBack}
                >
                  <ArrowLeft size={18} color="#0E1E38" strokeWidth={2.4} />
                  <Text style={styles.desktopBackText}>Back to Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.supportPillHeader}
                  activeOpacity={0.75}
                  onPress={() => setIsSupportOpen(true)}
                >
                  <Headphones size={15} color="#0E1E38" strokeWidth={2.2} />
                  <Text style={styles.supportPillHeaderText}>Support</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.desktopDualColumnLayout}>
                {/* Left Column: Interactive Map & Live Tracking */}
                <View style={styles.desktopLeftMapColumn}>
                  <View style={styles.desktopMapWrapper}>
                    <InteractiveMap
                      pickupCoords={pickupCoordsStore || PICKUP_COORDS}
                      dropCoords={dropCoordsStore || DROP_COORDS}
                      routeCoordinates={ROUTE_POINTS}
                      style={{ flex: 1, minHeight: 480 }}
                      showControls={false}
                    />

                    {/* Elapsed Time Floating Badge */}
                    <View style={styles.timeElapsedCard}>
                      <View style={styles.timeElapsedIconCircle}>
                        <Clock size={16} color="#0E1E38" strokeWidth={2.4} />
                      </View>
                      <View style={styles.timeElapsedTextCol}>
                        <Text style={styles.timeElapsedMicroLabel}>Time Elapsed</Text>
                        <Text style={styles.timeElapsedMainValue}>
                          {formatHourMin(elapsedMinutes)}
                        </Text>
                        <Text style={styles.timeElapsedSubtext}>of {totalDurationHours} hours</Text>
                      </View>
                    </View>

                    {/* Floating Controls */}
                    <View style={styles.mapRightControls}>
                      <TouchableOpacity style={styles.mapControlBtn} activeOpacity={0.8}>
                        <Crosshair size={17} color="#0E1E38" strokeWidth={2.2} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.mapControlBtn} activeOpacity={0.8}>
                        <Layers size={17} color="#0E1E38" strokeWidth={2.2} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.mapControlBtn} activeOpacity={0.8}>
                        <Navigation size={17} color="#0E1E38" strokeWidth={2.2} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Right Column: Driver, Details, Actions */}
                <View style={styles.desktopRightDetailsColumn}>
                  {renderMainContent()}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>

        {renderChatModal()}
        {renderSupportModal()}
        {renderSosModal()}
        {renderEndTripEarlyModal()}
      </View>
    );
  }

  // MOBILE LAYOUT (Matching user screenshot)
  return (
    <SafeAreaView style={styles.mobileSafeContainer} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      {/* Top Mobile Bar: Back Button, Centered DriverX Logo, Right Support Button */}
      <View style={styles.mobileTopBar}>
        <TouchableOpacity
          style={styles.mobileBackBtn}
          activeOpacity={0.7}
          onPress={handleBack}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color="#0E1E38" strokeWidth={2.4} />
        </TouchableOpacity>

        {/* Centered Brand Emblem */}
        <View style={styles.mobileLogoContainer}>
          <Image
            source={require('../../assets/DriveX_Logo.png')}
            style={styles.mobileLogoEmblem}
            resizeMode="contain"
          />
          <View style={styles.mobileBrandTextRow}>
            <Text style={styles.mobileBrandNavy}>Driver</Text>
            <Text style={styles.mobileBrandTeal}>X</Text>
          </View>
        </View>

        {/* Right Support Button Pill */}
        <TouchableOpacity
          style={styles.supportPillHeader}
          activeOpacity={0.75}
          onPress={() => setIsSupportOpen(true)}
          accessibilityLabel="Contact trip support"
        >
          <Headphones size={15} color="#0E1E38" strokeWidth={2.2} />
          <Text style={styles.supportPillHeaderText}>Support</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Main Content */}
      <ScrollView
        style={styles.mobileScroll}
        contentContainerStyle={styles.mobileScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderMainContent()}
      </ScrollView>

      {/* Modals */}
      {renderChatModal()}
      {renderSupportModal()}
      {renderSosModal()}
      {renderEndTripEarlyModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Safe Container
  mobileSafeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mobileScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mobileScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },

  // Top Bar
  mobileTopBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mobileBackBtn: {
    padding: 6,
    marginLeft: -6,
  },
  mobileLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileLogoEmblem: {
    width: 28,
    height: 28,
    marginRight: 6,
  },
  mobileBrandTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileBrandNavy: {
    fontFamily: FONT.bold,
    fontSize: 19,
    color: '#0E1E38',
  },
  mobileBrandTeal: {
    fontFamily: FONT.bold,
    fontSize: 19,
    color: '#00D2B4',
  },
  supportPillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  supportPillHeaderText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#0E1E38',
    marginLeft: 6,
  },

  // Page Title Section
  titleSection: {
    marginTop: 14,
    marginBottom: 14,
  },
  pageTitle: {
    fontFamily: FONT.bold,
    fontSize: 23,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 2,
  },

  // Map Container
  mapContainer: {
    height: 330,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  mapView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Floating Card on Map: Time Elapsed
  timeElapsedCard: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  timeElapsedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  timeElapsedTextCol: {},
  timeElapsedMicroLabel: {
    fontFamily: FONT.medium,
    fontSize: 10.5,
    color: '#64748B',
  },
  timeElapsedMainValue: {
    fontFamily: FONT.bold,
    fontSize: 17,
    color: '#0E1E38',
    lineHeight: 21,
  },
  timeElapsedSubtext: {
    fontFamily: FONT.regular,
    fontSize: 10.5,
    color: '#64748B',
  },

  // Floating Callout at Pickup Location (Bottom-Left)
  pickupCalloutBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    maxWidth: 190,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  miniPinCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  calloutLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#0E1E38',
  },
  calloutAddress: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },

  // Floating Drop Callout (Top-Right under controls)
  dropCalloutBadge: {
    position: 'absolute',
    top: 62,
    right: 56,
    maxWidth: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 9,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  // Vehicle On-Trip Indicator Marker
  vehicleOnTripBadge: {
    position: 'absolute',
    top: '44%',
    left: '42%',
    alignItems: 'center',
    zIndex: 11,
  },
  vehicleGlowAura: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 210, 180, 0.25)',
  },
  vehicleWhitePill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  vehicleStatusTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#0E1E38',
  },
  vehicleStatusSubtitle: {
    fontFamily: FONT.medium,
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },

  // Map Right Controls
  mapRightControls: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'column',
    gap: 8,
    zIndex: 10,
  },
  mapControlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  // Driver Info Card
  driverInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  driverAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
  },
  onlineBadgeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverMetaColumn: {
    flex: 1,
  },
  driverNameText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#0E1E38',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  vehicleModelText: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  vehiclePlateText: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#0E1E38',
  },
  driverActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverActionBtnCol: {
    alignItems: 'center',
  },
  driverActionCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  driverActionLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: '#0E1E38',
    marginTop: 4,
  },
  sosCircleBtn: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  sosCircleBtnText: {
    fontFamily: FONT.bold,
    fontSize: 11.5,
    color: '#EF4444',
  },

  // Trip Details Card
  tripDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  tripDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tripDetailsTitle: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#0E1E38',
  },
  durationPillBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  durationPillText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#2563EB',
  },

  // Timeline / Stepper
  timelineWrapper: {},
  timelineRow: {
    flexDirection: 'row',
    minHeight: 48,
  },
  timelineIndicatorCol: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  concentricTealRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#00D2B4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  concentricTealDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D2B4',
  },
  verticalConnectorTeal: {
    width: 2,
    flex: 1,
    backgroundColor: '#00D2B4',
    marginVertical: 2,
  },
  activeSolidTealDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00D2B4',
    borderWidth: 2,
    borderColor: '#CCFBF1',
  },
  verticalConnectorGrey: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  hollowGreyRing: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  timelineContentRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  timelineStepLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: '#0E1E38',
  },
  timelineStepLabelActive: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#0E1E38',
  },
  timelineStepAddress: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  timelineStepSubtext: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  timelineStepTime: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#64748B',
  },
  liveTimeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineLiveTimeText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: '#0E1E38',
    marginRight: 4,
  },
  liveDotTeal: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginRight: 3,
  },
  liveTagText: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#10B981',
  },

  // Trip Metrics Card (Mint/Teal banner)
  tripMetricsCard: {
    backgroundColor: '#F0FDF9',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 16,
  },
  tripMetricHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E6FAF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  metricTextWrapper: {},
  metricMicroLabel: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#64748B',
  },
  metricMainValue: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#0E1E38',
    marginTop: 1,
  },
  metricVerticalDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#D1FAE5',
    marginHorizontal: 12,
  },

  // End Trip Early Button
  endTripEarlyButton: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: '#0E1E38',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endTripEarlyButtonText: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: '#0E1E38',
    marginLeft: 8,
  },

  // Modals Styling
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(14, 30, 56, 0.55)',
    justifyContent: 'flex-end',
  },
  modalBackdropDismiss: {
    flex: 1,
  },
  chatSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: 20,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  chatDriverName: {
    fontFamily: FONT.bold,
    fontSize: 15,
    color: '#0E1E38',
  },
  chatDriverRole: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#64748B',
  },
  chatChipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  chatPresetChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  chatPresetChipText: {
    fontFamily: FONT.medium,
    fontSize: 11.5,
    color: '#0E1E38',
  },
  chatMessagesScroll: {
    padding: 16,
    maxHeight: 280,
  },
  chatBubbleRow: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  chatBubbleUserRow: {
    justifyContent: 'flex-end',
  },
  chatBubbleDriverRow: {
    justifyContent: 'flex-start',
  },
  chatBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  chatBubbleUser: {
    backgroundColor: '#00D2B4',
    borderBottomRightRadius: 4,
  },
  chatBubbleDriver: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  chatBubbleText: {
    fontFamily: FONT.regular,
    fontSize: 13.5,
  },
  chatBubbleUserText: {
    color: '#072038',
  },
  chatBubbleDriverText: {
    color: '#0E1E38',
  },
  chatBubbleTime: {
    fontFamily: FONT.regular,
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  chatBubbleUserTime: {
    color: 'rgba(7, 32, 56, 0.65)',
  },
  chatBubbleDriverTime: {
    color: '#94A3B8',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  chatTextInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontFamily: FONT.regular,
    fontSize: 13.5,
    color: '#0E1E38',
  },
  chatSendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00D2B4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  // Support & SOS Cards
  supportCardModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 'auto',
    marginTop: 'auto',
    padding: 24,
    alignItems: 'center',
  },
  supportModalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6FAF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  supportModalTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: '#0E1E38',
    marginBottom: 6,
    textAlign: 'center',
  },
  supportModalSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 19,
  },
  supportActionCallBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#00D2B4',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  supportActionCallBtnText: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: '#072038',
    marginLeft: 8,
  },
  supportActionDismissBtn: {
    paddingVertical: 10,
  },
  supportActionDismissBtnText: {
    fontFamily: FONT.medium,
    fontSize: 13.5,
    color: '#64748B',
  },

  // SOS Modal
  sosCardModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 'auto',
    marginTop: 'auto',
    padding: 24,
    alignItems: 'center',
  },
  sosIconCircleLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  sosModalTitle: {
    fontFamily: FONT.bold,
    fontSize: 19,
    color: '#EF4444',
    marginBottom: 6,
    textAlign: 'center',
  },
  sosModalSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 19,
  },
  sosCallPoliceBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#EF4444',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sosCallPoliceBtnText: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  sosShareLocationBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sosShareLocationBtnText: {
    fontFamily: FONT.semiBold,
    fontSize: 13.5,
    color: '#0E1E38',
    marginLeft: 8,
  },

  // End Trip Early Modal
  endTripModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 'auto',
    marginTop: 'auto',
    padding: 24,
    alignItems: 'center',
  },
  endTripIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  endTripModalTitle: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: '#0E1E38',
    marginBottom: 6,
  },
  endTripModalSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  endTripSummaryPill: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  endTripSummaryPillLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#64748B',
  },
  endTripSummaryPillVal: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#0E1E38',
  },
  endTripModalActionsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  endTripKeepRidingBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endTripKeepRidingBtnText: {
    fontFamily: FONT.semiBold,
    fontSize: 13.5,
    color: '#0E1E38',
  },
  endTripConfirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endTripConfirmBtnText: {
    fontFamily: FONT.semiBold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },

  // Desktop Responsive
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
    padding: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  desktopTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  desktopBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  desktopBackText: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: '#0E1E38',
    marginLeft: 8,
  },
  desktopDualColumnLayout: {
    flexDirection: 'row',
    gap: 24,
  },
  desktopLeftMapColumn: {
    flex: 1.15,
  },
  desktopMapWrapper: {
    height: 580,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  desktopRightDetailsColumn: {
    flex: 1,
  },
});
