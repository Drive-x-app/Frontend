import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Modal,
  Pressable,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Star,
  ChevronRight,
  Home as HomeIcon,
  History,
  User,
  X,
  AlertCircle,
  CheckCircle2,
  Phone,
  RotateCcw,
  Receipt,
  Navigation,
  Car,
  XCircle,
  ShieldCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useBookingStore } from '../../src/store/bookingStore';
import { useAuthStore } from '../../src/store/authStore';
import { DesktopHeader } from '../../src/components/common/DesktopHeader';
import { DesktopSidebar } from '../../src/components/common/DesktopSidebar';
import { FONT } from '../../src/theme/typography';
import { bookingsApi, BackendBookingItem } from '../../src/services/api/bookingsApi';
import {
  formatMonthSection,
  formatTripDate,
} from '../../src/services/trip/tripHistoryData';

import {
  BookingCategory,
  BookingDisplayItem,
  mapBackendToBookingDisplayItem,
} from '../../src/services/booking/myBookingsData';

export { BookingCategory, BookingDisplayItem, mapBackendToBookingDisplayItem };

const CATEGORIES: BookingCategory[] = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

/**
 * 6x6 decorative dot matrix pattern component matching DriverX desktop aesthetics
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

export default function MyBookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktopOrTablet =
    windowWidth > 600 ||
    (Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth > 600);

  const activeTab = useBookingStore((state) => state.activeTab);
  const setActiveTab = useBookingStore((state) => state.setActiveTab);
  const setPickupLocation = useBookingStore((state) => state.setPickupLocation);
  const setDropLocation = useBookingStore((state) => state.setDropLocation);
  const authUser = useAuthStore((state) => state.user);

  const [bookings, setBookings] = useState<BookingDisplayItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BookingCategory>('Upcoming');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<BookingDisplayItem | null>(null);
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState<BookingDisplayItem | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const response = await bookingsApi.getBookings({
        limit: 50,
        userId: authUser?.id,
      });

      if (response && Array.isArray(response.items)) {
        const mapped = response.items.map(mapBackendToBookingDisplayItem);
        setBookings(mapped);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load your bookings. Please check your connection.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleTabPress = (tab: 'home' | 'bookings' | 'history' | 'profile') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveTab(tab);
    if (tab === 'home') {
      router.replace('/(customer)');
    } else if (tab === 'history') {
      router.push('/(customer)/trip-history');
    } else if (tab === 'profile') {
      router.push('/(customer)/profile');
    }
  };

  const handleCategorySelect = (cat: BookingCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedCategory(cat);
  };

  const handleOpenDetails = (item: BookingDisplayItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedBookingDetails(item);
  };

  const handleCancelBooking = (item: BookingDisplayItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const executeCancel = async () => {
      try {
        setIsCancelling(true);
        await bookingsApi.cancelBooking(item.id, 'Cancelled by customer', authUser?.id);

        // Update state locally with response
        setBookings((prev) =>
          prev.map((b) =>
            b.id === item.id
              ? {
                  ...b,
                  status: 'CANCELLED',
                  category: 'Cancelled',
                  categoryLabel: 'Cancelled',
                }
              : b
          )
        );

        if (selectedBookingDetails && selectedBookingDetails.id === item.id) {
          setSelectedBookingDetails((prev) =>
            prev
              ? {
                  ...prev,
                  status: 'CANCELLED',
                  category: 'Cancelled',
                  categoryLabel: 'Cancelled',
                }
              : null
          );
        }

        if (Platform.OS === 'web') {
          window.alert('Booking cancelled successfully.');
        } else {
          Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully.');
        }
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to cancel booking. Please try again.';
        if (Platform.OS === 'web') {
          window.alert(errorMsg);
        } else {
          Alert.alert('Cancellation Error', errorMsg);
        }
      } finally {
        setIsCancelling(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to cancel booking ${item.bookingRef}?`)) {
        executeCancel();
      }
    } else {
      Alert.alert(
        'Cancel Booking',
        `Are you sure you want to cancel booking ${item.bookingRef}?`,
        [
          { text: 'Keep Booking', style: 'cancel' },
          { text: 'Cancel Booking', style: 'destructive', onPress: executeCancel },
        ]
      );
    }
  };

  const handleRebook = (item: BookingDisplayItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setPickupLocation(item.pickupLocation);
    setDropLocation(item.dropLocation);
    setSelectedBookingDetails(null);
    router.push('/(customer)/select-datetime');
  };

  const handleContactDriver = (phone?: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const target = phone || '+91 98765 43210';
    Linking.openURL(`tel:${target}`).catch(() => {
      Alert.alert('Contact Driver', `Call assigned driver at ${target}`);
    });
  };

  const filteredBookings = bookings.filter((b) => b.category === selectedCategory);

  const renderStatusBadge = (category: BookingCategory, label: string) => {
    if (category === 'Ongoing') {
      return (
        <View style={styles.ongoingBadge}>
          <View style={styles.ongoingPulseDot} />
          <Text style={styles.ongoingBadgeText}>{label}</Text>
        </View>
      );
    }
    if (category === 'Completed') {
      return (
        <View style={styles.completedBadge}>
          <CheckCircle2 size={12} color="#059669" strokeWidth={2.4} />
          <Text style={styles.completedBadgeText}>{label}</Text>
        </View>
      );
    }
    if (category === 'Cancelled') {
      return (
        <View style={styles.cancelledBadge}>
          <XCircle size={12} color="#DC2626" strokeWidth={2.4} />
          <Text style={styles.cancelledBadgeText}>{label}</Text>
        </View>
      );
    }
    // Upcoming
    return (
      <View style={styles.upcomingBadge}>
        <Clock size={12} color="#00A892" strokeWidth={2.4} />
        <Text style={styles.upcomingBadgeText}>{label}</Text>
      </View>
    );
  };

  const renderBookingCard = (item: BookingDisplayItem) => (
    <View key={item.id} style={styles.card}>
      {/* Top Header Row: Reference, Date, Status */}
      <View style={styles.cardTopRow}>
        <View style={styles.refDateCol}>
          <Text style={styles.bookingRefText}>{item.bookingRef}</Text>
          <Text style={styles.bookingDateText}>
            {item.travelDate} • {item.pickupTime}
          </Text>
        </View>
        {renderStatusBadge(item.category, item.categoryLabel)}
      </View>

      <View style={styles.cardDivider} />

      {/* Route & Locations */}
      <View style={styles.locationsContainer}>
        {/* Pickup */}
        <View style={styles.locationItemRow}>
          <View style={styles.pickupDot} />
          <View style={styles.locationTextCol}>
            <Text style={styles.locationMicroLabel}>Pickup Location</Text>
            <Text style={styles.locationAddressText} numberOfLines={2}>
              {item.pickupLocation}
            </Text>
          </View>
        </View>

        {/* Route Connecting Line */}
        <View style={styles.connectingLine} />

        {/* Drop */}
        <View style={styles.locationItemRow}>
          <View style={styles.dropSquare} />
          <View style={styles.locationTextCol}>
            <Text style={styles.locationMicroLabel}>Drop-off Location</Text>
            <Text style={styles.locationAddressText} numberOfLines={2}>
              {item.dropLocation}
            </Text>
          </View>
        </View>
      </View>

      {/* Driver info if assigned or Ongoing */}
      {item.driverName && (
        <View style={styles.cardDriverRow}>
          <Image
            source={require('../../assets/avatar_user.jpg')}
            style={styles.cardDriverAvatar}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.cardDriverName}>{item.driverName}</Text>
            <Text style={styles.cardDriverCar}>
              {item.driverVehicle} • {item.driverPlate}
            </Text>
          </View>
          <View style={styles.ratingBox}>
            <Star size={11} color="#EAB308" fill="#EAB308" />
            <Text style={styles.ratingText}>
              {item.driverRating?.toFixed(1) || '4.8'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.cardDivider} />

      {/* Bottom Summary & Actions */}
      <View style={styles.cardBottomRow}>
        <View style={styles.durationFareCol}>
          <View style={styles.durationPill}>
            <Clock size={12} color="#00D2B4" strokeWidth={2.4} />
            <Text style={styles.durationPillText}>{item.durationLabel}</Text>
          </View>
          <Text style={styles.fareAmountText}>
            ₹ {item.fare.toLocaleString('en-IN')}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsBtnGroup}>
          {item.category === 'Upcoming' && (
            <TouchableOpacity
              style={styles.cancelActionBtn}
              activeOpacity={0.8}
              onPress={() => handleCancelBooking(item)}
              disabled={isCancelling}
            >
              <Text style={styles.cancelActionText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {item.category === 'Ongoing' && (
            <TouchableOpacity
              style={styles.contactDriverBtn}
              activeOpacity={0.8}
              onPress={() => handleContactDriver(item.driverPhone)}
            >
              <Phone size={13} color="#00D2B4" strokeWidth={2.4} />
              <Text style={styles.contactDriverText}>Call Driver</Text>
            </TouchableOpacity>
          )}

          {(item.category === 'Completed' || item.category === 'Cancelled') && (
            <TouchableOpacity
              style={styles.rebookBtn}
              activeOpacity={0.8}
              onPress={() => handleRebook(item)}
            >
              <RotateCcw size={13} color="#00D2B4" strokeWidth={2.4} />
              <Text style={styles.rebookText}>Rebook</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.viewDetailsBtn}
            activeOpacity={0.8}
            onPress={() => handleOpenDetails(item)}
          >
            <Text style={styles.viewDetailsText}>Details</Text>
            <ChevronRight size={13} color="#0E1E38" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderBookingDetailsModal = () => {
    if (!selectedBookingDetails) return null;
    const b = selectedBookingDetails;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedBookingDetails}
        onRequestClose={() => setSelectedBookingDetails(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedBookingDetails(null)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Booking Details</Text>
                <Text style={styles.modalRefText}>{b.bookingRef}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedBookingDetails(null)}
              >
                <X size={18} color="#0E1E38" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollBody}
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalStatusRow}>
                <View style={styles.modalDateTimeCol}>
                  <Text style={styles.modalDateBigText}>{b.travelDate}</Text>
                  <Text style={styles.modalTimeSubText}>
                    Pickup Time: {b.pickupTime}
                  </Text>
                </View>
                {renderStatusBadge(b.category, b.categoryLabel)}
              </View>

              {/* Route Card */}
              <View style={styles.modalRouteCard}>
                <View style={styles.modalRouteRow}>
                  <MapPin size={15} color="#00D2B4" fill="#00D2B4" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.locationMicroLabel}>Pickup Location</Text>
                    <Text style={styles.modalAddressText}>{b.pickupLocation}</Text>
                  </View>
                </View>

                <View style={styles.modalRouteDivider} />

                <View style={styles.modalRouteRow}>
                  <MapPin size={15} color="#EF4444" fill="#EF4444" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.locationMicroLabel}>Drop-off Location</Text>
                    <Text style={styles.modalAddressText}>{b.dropLocation}</Text>
                  </View>
                </View>
              </View>

              {/* Driver Details if assigned */}
              {b.driverName ? (
                <View style={styles.modalDriverCard}>
                  <Image
                    source={require('../../assets/avatar_user.jpg')}
                    style={styles.modalDriverAvatar}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.modalDriverName}>{b.driverName}</Text>
                    <Text style={styles.modalDriverSub}>
                      {b.driverVehicle} • {b.driverPlate}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalDriverCallBtn}
                    onPress={() => handleContactDriver(b.driverPhone)}
                  >
                    <Phone size={14} color="#00D2B4" strokeWidth={2.4} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.modalUnassignedBox}>
                  <ShieldCheck size={16} color="#00D2B4" strokeWidth={2.2} />
                  <Text style={styles.modalUnassignedText}>
                    Driver assignment is guaranteed and details will be shared 30 minutes prior to pickup.
                  </Text>
                </View>
              )}

              {/* Booking & Fare Details */}
              <View style={styles.modalInfoGrid}>
                <View style={styles.modalInfoCol}>
                  <Text style={styles.modalInfoMicro}>Selected Duration</Text>
                  <Text style={styles.modalInfoVal}>{b.durationLabel}</Text>
                </View>

                <View style={styles.modalInfoCol}>
                  <Text style={styles.modalInfoMicro}>Payment Method</Text>
                  <Text style={styles.modalInfoVal}>
                    {b.paymentMethod} ({b.paymentStatus})
                  </Text>
                </View>

                <View style={styles.modalInfoCol}>
                  <Text style={styles.modalInfoMicro}>Total Fare</Text>
                  <Text style={styles.modalFareHuge}>
                    ₹ {b.fare.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {/* Modal Actions */}
              <View style={styles.modalActionsRow}>
                {b.category === 'Upcoming' && (
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    activeOpacity={0.8}
                    onPress={() => handleCancelBooking(b)}
                    disabled={isCancelling}
                  >
                    <Text style={styles.modalCancelText}>
                      {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                    </Text>
                  </TouchableOpacity>
                )}

                {b.category === 'Ongoing' && (
                  <TouchableOpacity
                    style={styles.modalRebookBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedBookingDetails(null);
                      router.push('/(customer)/trip-in-progress');
                    }}
                  >
                    <Navigation size={14} color="#072038" strokeWidth={2.4} />
                    <Text style={styles.modalRebookText}>Track Trip in Progress</Text>
                  </TouchableOpacity>
                )}

                {(b.category === 'Completed' || b.category === 'Cancelled') && (
                  <TouchableOpacity
                    style={styles.modalRebookBtn}
                    activeOpacity={0.85}
                    onPress={() => handleRebook(b)}
                  >
                    <RotateCcw size={14} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.modalRebookText}>Book Again</Text>
                  </TouchableOpacity>
                )}

                {b.category === 'Completed' && (
                  <TouchableOpacity
                    style={styles.modalReceiptBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      setSelectedBookingDetails(null);
                      setSelectedReceiptBooking(b);
                    }}
                  >
                    <Receipt size={14} color="#0E1E38" strokeWidth={2.2} />
                    <Text style={styles.modalReceiptText}>Receipt</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  const renderReceiptModal = () => {
    if (!selectedReceiptBooking) return null;
    const b = selectedReceiptBooking;
    const baseFare = Math.round(b.fare / 1.05);
    const gstTax = b.fare - baseFare;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedReceiptBooking}
        onRequestClose={() => setSelectedReceiptBooking(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedReceiptBooking(null)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Trip Invoice / Receipt</Text>
                <Text style={styles.modalRefText}>{b.bookingRef}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedReceiptBooking(null)}
              >
                <X size={18} color="#0E1E38" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            <View style={styles.receiptBody}>
              <View style={styles.receiptLineItem}>
                <Text style={styles.receiptItemLabel}>
                  Driver Hire ({b.durationLabel})
                </Text>
                <Text style={styles.receiptItemVal}>₹ {baseFare}</Text>
              </View>

              <View style={styles.receiptLineItem}>
                <Text style={styles.receiptItemLabel}>GST Taxes (5%)</Text>
                <Text style={styles.receiptItemVal}>₹ {gstTax}</Text>
              </View>

              <View style={styles.receiptDivider} />

              <View style={styles.receiptTotalRow}>
                <Text style={styles.receiptTotalLabel}>Total Paid</Text>
                <Text style={styles.receiptTotalVal}>₹ {b.fare}</Text>
              </View>

              <View style={styles.receiptMetaRow}>
                <Text style={styles.receiptMetaText}>Paid via {b.paymentMethod}</Text>
                <Text style={styles.receiptMetaText}>Status: Completed</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalDismissBtn}
              onPress={() => setSelectedReceiptBooking(null)}
            >
              <Text style={styles.modalDismissBtnText}>Close Receipt</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

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
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => fetchBookings(true)}
                  colors={['#00D2B4']}
                  tintColor="#00D2B4"
                />
              }
            >
              <View style={styles.desktopMainCard}>
                {/* Header Row */}
                <View style={styles.dtCardHeaderRow}>
                  <View style={styles.dtTitleColumn}>
                    <Text style={styles.dtPageTitle}>My Bookings</Text>
                    <Text style={styles.dtPageSubtitle}>
                      View, manage, and track your active, scheduled, and past rides.
                    </Text>
                  </View>
                </View>

                {/* Categories Segmented Bar */}
                <View style={styles.categoryTabsBar}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    const count = bookings.filter((b) => b.category === cat).length;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryTabOption,
                          isSelected && styles.categoryTabOptionActive,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => handleCategorySelect(cat)}
                      >
                        <Text
                          style={[
                            styles.categoryTabText,
                            isSelected && styles.categoryTabTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                        {count > 0 && (
                          <View
                            style={[
                              styles.categoryBadgeCount,
                              isSelected && styles.categoryBadgeCountActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.categoryBadgeCountText,
                                isSelected && styles.categoryBadgeCountTextActive,
                              ]}
                            >
                              {count}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Content List */}
                {isLoading && !isRefreshing ? (
                  <View style={styles.stateCenterContainer}>
                    <ActivityIndicator size="large" color="#00D2B4" />
                    <Text style={styles.stateLoadingText}>Loading your bookings...</Text>
                  </View>
                ) : errorMessage ? (
                  <View style={styles.stateCenterContainer}>
                    <AlertCircle size={36} color="#EF4444" strokeWidth={1.8} />
                    <Text style={styles.stateErrorTitle}>Failed to load bookings</Text>
                    <Text style={styles.stateErrorSubtitle}>{errorMessage}</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      activeOpacity={0.8}
                      onPress={() => fetchBookings()}
                    >
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : filteredBookings.length === 0 ? (
                  <View style={styles.stateCenterContainer}>
                    <Calendar size={42} color="#94A3B8" strokeWidth={1.6} />
                    <Text style={styles.emptyTitle}>
                      No {selectedCategory.toLowerCase()} bookings
                    </Text>
                    <Text style={styles.emptySubtitle}>
                      {selectedCategory === 'Upcoming'
                        ? 'You have no scheduled bookings. Book a professional driver anytime.'
                        : selectedCategory === 'Ongoing'
                        ? 'You have no trips currently in progress.'
                        : selectedCategory === 'Completed'
                        ? 'You have not completed any bookings yet.'
                        : 'No cancelled bookings.'}
                    </Text>
                    <TouchableOpacity
                      style={styles.bookDriverBtn}
                      activeOpacity={0.85}
                      onPress={() => router.push('/(customer)/select-location')}
                    >
                      <Text style={styles.bookDriverBtnText}>Book a Driver</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.cardsList}>
                    {filteredBookings.map(renderBookingCard)}
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>

        {renderBookingDetailsModal()}
        {renderReceiptModal()}
      </View>
    );
  }

  // =========================================================================
  // MOBILE APP VIEW
  // =========================================================================
  return (
    <View style={styles.outerContainer}>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Top Header */}
        <View style={styles.topHeaderBar}>
          <TouchableOpacity
            style={styles.backButtonCircle}
            activeOpacity={0.8}
            onPress={() => router.replace('/(customer)')}
            accessibilityLabel="Go back to Home"
          >
            <ArrowLeft size={19} color="#0E1E38" strokeWidth={2.4} />
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

        {/* Title Header */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>My Bookings</Text>
          <Text style={styles.pageSubtitle}>
            Manage your upcoming, active, and past rides.
          </Text>
        </View>

        {/* Categories Horizontal Tabs */}
        <View style={styles.categoryTabsBar}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = bookings.filter((b) => b.category === cat).length;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryTabOption,
                  isSelected && styles.categoryTabOptionActive,
                ]}
                activeOpacity={0.8}
                onPress={() => handleCategorySelect(cat)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    isSelected && styles.categoryTabTextActive,
                  ]}
                >
                  {cat}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.categoryBadgeCount,
                      isSelected && styles.categoryBadgeCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBadgeCountText,
                        isSelected && styles.categoryBadgeCountTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Scrollable Bookings List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchBookings(true)}
              colors={['#00D2B4']}
              tintColor="#00D2B4"
            />
          }
        >
          {isLoading && !isRefreshing ? (
            <View style={styles.stateCenterContainer}>
              <ActivityIndicator size="large" color="#00D2B4" />
              <Text style={styles.stateLoadingText}>Loading your bookings...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.stateCenterContainer}>
              <AlertCircle size={36} color="#EF4444" strokeWidth={1.8} />
              <Text style={styles.stateErrorTitle}>Failed to load bookings</Text>
              <Text style={styles.stateErrorSubtitle}>{errorMessage}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.8}
                onPress={() => fetchBookings()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredBookings.length === 0 ? (
            <View style={styles.stateCenterContainer}>
              <Calendar size={42} color="#94A3B8" strokeWidth={1.6} />
              <Text style={styles.emptyTitle}>
                No {selectedCategory.toLowerCase()} bookings
              </Text>
              <Text style={styles.emptySubtitle}>
                {selectedCategory === 'Upcoming'
                  ? 'You have no scheduled bookings. Book a professional driver anytime.'
                  : selectedCategory === 'Ongoing'
                  ? 'You have no trips currently in progress.'
                  : selectedCategory === 'Completed'
                  ? 'You have not completed any bookings yet.'
                  : 'No cancelled bookings.'}
              </Text>
              <TouchableOpacity
                style={styles.bookDriverBtn}
                activeOpacity={0.85}
                onPress={() => router.push('/(customer)/select-location')}
              >
                <Text style={styles.bookDriverBtnText}>Book a Driver</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cardsList}>
              {filteredBookings.map(renderBookingCard)}
            </View>
          )}
        </ScrollView>

        {/* Bottom Navigation Bar */}
        <SafeAreaView edges={['bottom']} style={styles.bottomNavContainer}>
          <View style={styles.bottomNav}>
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

            {/* My Bookings Tab (Active) */}
            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.8}
              onPress={() => handleTabPress('bookings')}
            >
              <View style={[styles.tabActivePill, styles.tabActivePillSelected]}>
                <Calendar size={20} color="#00D2B4" strokeWidth={2.2} />
              </View>
              <Text style={[styles.tabLabel, styles.tabLabelActive]}>
                My Bookings
              </Text>
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

            {/* Profile Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.8}
              onPress={() => handleTabPress('profile')}
            >
              <View style={styles.tabActivePill}>
                <User size={20} color="#94A3B8" strokeWidth={2.4} />
              </View>
              <Text style={styles.tabLabel}>Profile</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaView>

      {renderBookingDetailsModal()}
      {renderReceiptModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  backButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  },
  brandTextTeal: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: '#00D2B4',
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
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
  categoryTabsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  categoryTabOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 5,
  },
  categoryTabOptionActive: {
    backgroundColor: '#0E1E38',
    borderColor: '#0E1E38',
  },
  categoryTabText: {
    fontSize: 12.5,
    fontFamily: FONT.medium,
    color: '#64748B',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontFamily: FONT.bold,
  },
  categoryBadgeCount: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  categoryBadgeCountActive: {
    backgroundColor: '#00D2B4',
  },
  categoryBadgeCountText: {
    fontSize: 10.5,
    fontFamily: FONT.bold,
    color: '#475569',
  },
  categoryBadgeCountTextActive: {
    color: '#072038',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  cardsList: {
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
        boxShadow: '0 2px 10px rgba(14, 30, 56, 0.05)',
      },
    }),
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  refDateCol: {
    flex: 1,
  },
  bookingRefText: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: '#0E1E38',
    letterSpacing: 0.2,
  },
  bookingDateText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#64748B',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  locationsContainer: {
    position: 'relative',
  },
  locationItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00D2B4',
    marginTop: 4,
    marginRight: 10,
  },
  dropSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#EF4444',
    marginTop: 4,
    marginRight: 10,
  },
  connectingLine: {
    position: 'absolute',
    left: 4.5,
    top: 14,
    bottom: 14,
    width: 1,
    backgroundColor: '#CBD5E1',
  },
  locationTextCol: {
    flex: 1,
    marginBottom: 8,
  },
  locationMicroLabel: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  locationAddressText: {
    fontSize: 13,
    fontFamily: FONT.medium,
    color: '#1E293B',
    marginTop: 1,
    lineHeight: 18,
  },
  cardDriverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
  },
  cardDriverAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  cardDriverName: {
    fontSize: 13,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  cardDriverCar: {
    fontSize: 11.5,
    fontFamily: FONT.regular,
    color: '#64748B',
    marginTop: 1,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: FONT.bold,
    color: '#854D0E',
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationFareCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FAF7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  durationPillText: {
    fontSize: 11.5,
    fontFamily: FONT.bold,
    color: '#00A892',
  },
  fareAmountText: {
    fontSize: 15,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  actionsBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  cancelActionText: {
    fontSize: 12,
    fontFamily: FONT.bold,
    color: '#DC2626',
  },
  contactDriverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E6FAF7',
    gap: 4,
  },
  contactDriverText: {
    fontSize: 12,
    fontFamily: FONT.bold,
    color: '#00A892',
  },
  rebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#E6FAF7',
    gap: 4,
  },
  rebookText: {
    fontSize: 12,
    fontFamily: FONT.bold,
    color: '#00A892',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },

  // Status Badges
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FAF7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  upcomingBadgeText: {
    fontSize: 11.5,
    fontFamily: FONT.bold,
    color: '#00A892',
  },
  ongoingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 5,
  },
  ongoingPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
  },
  ongoingBadgeText: {
    fontSize: 11.5,
    fontFamily: FONT.bold,
    color: '#B45309',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  completedBadgeText: {
    fontSize: 11.5,
    fontFamily: FONT.bold,
    color: '#059669',
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  cancelledBadgeText: {
    fontSize: 11.5,
    fontFamily: FONT.bold,
    color: '#DC2626',
  },

  // States
  stateCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  stateLoadingText: {
    fontSize: 13.5,
    fontFamily: FONT.medium,
    color: '#64748B',
    marginTop: 12,
  },
  stateErrorTitle: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: '#0E1E38',
    marginTop: 10,
  },
  stateErrorSubtitle: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  retryButton: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#00D2B4',
  },
  retryButtonText: {
    fontSize: 13,
    fontFamily: FONT.bold,
    color: '#072038',
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: '#0E1E38',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  bookDriverBtn: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#00D2B4',
  },
  bookDriverBtnText: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: '#072038',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 30, 56, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    padding: 20,
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
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      },
    }),
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  modalRefText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScrollBody: {
    flexGrow: 0,
  },
  modalStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalDateTimeCol: {
    flex: 1,
  },
  modalDateBigText: {
    fontSize: 15,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  modalTimeSubText: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#64748B',
    marginTop: 2,
  },
  modalRouteCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  modalRouteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  modalAddressText: {
    fontSize: 13,
    fontFamily: FONT.medium,
    color: '#0E1E38',
    marginTop: 1,
  },
  modalRouteDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  modalDriverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  modalDriverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalDriverName: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  modalDriverSub: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#64748B',
    marginTop: 1,
  },
  modalDriverCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6FAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalUnassignedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6FAF7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  modalUnassignedText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONT.regular,
    color: '#007A6A',
    lineHeight: 16,
  },
  modalInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  modalInfoCol: {
    alignItems: 'flex-start',
  },
  modalInfoMicro: {
    fontSize: 11,
    fontFamily: FONT.medium,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  modalInfoVal: {
    fontSize: 13,
    fontFamily: FONT.bold,
    color: '#0E1E38',
    marginTop: 2,
  },
  modalFareHuge: {
    fontSize: 16,
    fontFamily: FONT.bold,
    color: '#00A892',
    marginTop: 2,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },
  modalCancelText: {
    fontSize: 13,
    fontFamily: FONT.bold,
    color: '#DC2626',
  },
  modalRebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#00D2B4',
    gap: 6,
  },
  modalRebookText: {
    fontSize: 13,
    fontFamily: FONT.bold,
    color: '#072038',
  },
  modalReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  modalReceiptText: {
    fontSize: 13,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },

  // Receipt Modal Styles
  receiptBody: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  receiptLineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptItemLabel: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: '#475569',
  },
  receiptItemVal: {
    fontSize: 13,
    fontFamily: FONT.medium,
    color: '#0E1E38',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  receiptTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptTotalLabel: {
    fontSize: 15,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  receiptTotalVal: {
    fontSize: 17,
    fontFamily: FONT.bold,
    color: '#00A892',
  },
  receiptMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  receiptMetaText: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: '#94A3B8',
  },
  modalDismissBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#0E1E38',
    alignItems: 'center',
  },
  modalDismissBtnText: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: '#FFFFFF',
  },

  // Bottom Nav (Mobile)
  bottomNavContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabActivePill: {
    width: 36,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActivePillSelected: {
    backgroundColor: '#EDFAF7',
  },
  tabLabel: {
    fontSize: 10.5,
    fontFamily: FONT.medium,
    color: '#94A3B8',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#00D2B4',
    fontFamily: FONT.bold,
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
    position: 'relative',
  },
  topRightDots: {
    position: 'absolute',
    top: 24,
    right: 28,
    zIndex: 1,
  },
  bottomRightDots: {
    position: 'absolute',
    bottom: 24,
    right: 28,
    zIndex: 1,
  },
  dotGridContainer: {
    flexDirection: 'column',
    gap: 7,
  },
  dotGridRow: {
    flexDirection: 'row',
    gap: 7,
  },
  dotGridDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: '#CBD5E1',
    opacity: 0.75,
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
    maxWidth: 900,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 24px rgba(14, 30, 56, 0.06)',
      },
    }),
  },
  dtCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dtTitleColumn: {
    flex: 1,
  },
  dtPageTitle: {
    fontSize: 26,
    fontFamily: FONT.bold,
    color: '#0E1E38',
    letterSpacing: -0.5,
  },
  dtPageSubtitle: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: '#64748B',
    marginTop: 4,
  },
});
