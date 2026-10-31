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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Filter,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Home as HomeIcon,
  Calendar,
  History,
  User,
  X,
  AlertCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useBookingStore } from '../../src/store/bookingStore';
import { DesktopHeader } from '../../src/components/common/DesktopHeader';
import { DesktopSidebar } from '../../src/components/common/DesktopSidebar';
import { FONT } from '../../src/theme/typography';
import { bookingsApi } from '../../src/services/api/bookingsApi';
import {
  TripHistoryItem,
  TripStatus,
  mapBookingToTripHistoryItem,
} from '../../src/services/trip/tripHistoryData';

type FilterTab = 'All Trips' | 'Completed' | 'Scheduled' | 'Cancelled';

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

export default function TripHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktopOrTablet =
    windowWidth > 600 ||
    (Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth > 600);

  const activeTab = useBookingStore((state) => state.activeTab);
  const setActiveTab = useBookingStore((state) => state.setActiveTab);

  const [trips, setTrips] = useState<TripHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<FilterTab>(() =>
    activeTab === 'bookings' ? 'Scheduled' : 'All Trips'
  );
  const [selectedTripDetails, setSelectedTripDetails] = useState<TripHistoryItem | null>(null);

  const fetchTrips = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const response = await bookingsApi.getBookings({ limit: 50 });
      if (response && Array.isArray(response.items)) {
        const mapped = response.items.map(mapBookingToTripHistoryItem);
        setTrips(mapped);
      } else {
        setTrips([]);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load trip history. Please check your connection.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      setSelectedFilter('Scheduled');
    } else if (activeTab === 'history') {
      setSelectedFilter('All Trips');
    }
  }, [activeTab]);

  const handleTabPress = (tab: 'home' | 'bookings' | 'history' | 'profile') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActiveTab(tab);
    if (tab === 'home') {
      router.replace('/(customer)');
    } else if (tab === 'profile') {
      router.push('/(customer)/profile');
    } else if (tab === 'bookings') {
      router.push('/(customer)/my-bookings');
    } else if (tab === 'history') {
      setSelectedFilter('All Trips');
    }
  };

  const handleFilterSelect = (filter: FilterTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedFilter(filter);
  };

  const handleViewDetails = (trip: TripHistoryItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedTripDetails(trip);
  };

  // Filter trips based on selected tab
  const filteredTrips = trips.filter((trip) => {
    if (selectedFilter === 'All Trips') return true;
    return trip.status === selectedFilter;
  });

  // Group filtered trips by monthSection
  const groupedSections = filteredTrips.reduce((acc, trip) => {
    if (!acc[trip.monthSection]) {
      acc[trip.monthSection] = [];
    }
    acc[trip.monthSection].push(trip);
    return acc;
  }, {} as Record<string, TripHistoryItem[]>);

  const monthKeys = Object.keys(groupedSections);

  const renderStatusBadge = (status: TripStatus) => {
    if (status === 'Completed') {
      return (
        <View style={styles.completedBadge}>
          <Text style={styles.completedBadgeText}>Completed</Text>
        </View>
      );
    }
    if (status === 'Cancelled') {
      return (
        <View style={styles.cancelledBadge}>
          <Text style={styles.cancelledBadgeText}>Cancelled</Text>
        </View>
      );
    }
    return (
      <View style={styles.scheduledBadge}>
        <Text style={styles.scheduledBadgeText}>Scheduled</Text>
      </View>
    );
  };

  const renderTripDetailsModal = () => {
    if (!selectedTripDetails) return null;
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedTripDetails}
        onRequestClose={() => setSelectedTripDetails(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedTripDetails(null)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Trip Details</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedTripDetails(null)}
              >
                <X size={18} color="#0E1E38" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalDateStatusRow}>
                <Text style={styles.modalDateText}>
                  {selectedTripDetails.dateFormatted}
                </Text>
                {renderStatusBadge(selectedTripDetails.status)}
              </View>

              <Text style={styles.modalTimeText}>
                Scheduled: {selectedTripDetails.timeSlot}
              </Text>

              <View style={styles.modalLocationsCard}>
                <View style={styles.modalLocationRow}>
                  <MapPin size={14} color="#00D2B4" fill="#00D2B4" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalLocMicroLabel}>Pickup Location</Text>
                    <Text style={styles.modalLocAddressText}>
                      {selectedTripDetails.pickupAddress}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalLocDivider} />

                <View style={styles.modalLocationRow}>
                  <MapPin size={14} color="#EF4444" fill="#EF4444" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalLocMicroLabel}>Drop Location</Text>
                    <Text style={styles.modalLocAddressText}>
                      {selectedTripDetails.dropAddress}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Driver & Vehicle */}
              <View style={styles.modalDriverCard}>
                <Image
                  source={require('../../assets/avatar_user.jpg')}
                  style={styles.modalDriverAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalDriverName}>
                    {selectedTripDetails.driver.name}
                  </Text>
                  <Text style={styles.modalCarText}>
                    {selectedTripDetails.driver.carModel} •{' '}
                    {selectedTripDetails.driver.plateNumber}
                  </Text>
                </View>
                <View style={styles.modalRatingBox}>
                  <Star size={11} color="#EAB308" fill="#EAB308" />
                  <Text style={styles.modalRatingText}>
                    {selectedTripDetails.driver.rating.toFixed(1)}
                  </Text>
                </View>
              </View>

              {/* Duration & Fare */}
              <View style={styles.modalFareRow}>
                <View>
                  <Text style={styles.modalFareMicroLabel}>Duration</Text>
                  <Text style={styles.modalDurationVal}>
                    {selectedTripDetails.durationLabel}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.modalFareMicroLabel}>Total Fare</Text>
                  <Text style={styles.modalFareVal}>
                    ₹ {selectedTripDetails.fare.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalDismissBtn}
              onPress={() => setSelectedTripDetails(null)}
            >
              <Text style={styles.modalDismissBtnText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  // =========================================================================
  // DESKTOP & TABLET VIEW (Matching Reference Mockup Layout)
  // =========================================================================
  if (isDesktopOrTablet) {
    return (
      <View style={styles.desktopOuterContainer}>
        <StatusBar style="dark" />
        {/* Top Header */}
        <DesktopHeader activeTab={activeTab === 'bookings' ? 'bookings' : 'history'} />

        <View style={styles.desktopBodyRow}>
          {/* Left Persistent Navigation Sidebar */}
          <DesktopSidebar activeTab={activeTab === 'bookings' ? 'bookings' : 'history'} />

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
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => fetchTrips(true)}
                  colors={['#00D2B4']}
                  tintColor="#00D2B4"
                />
              }
            >
              <View style={styles.desktopMainCard}>
                {/* 1. Header Row: Title & subtitle, Filter pill */}
                <View style={styles.dtCardHeaderRow}>
                  <View style={styles.dtTitleColumn}>
                    <Text style={styles.dtPageTitle}>Trip History</Text>
                    <Text style={styles.dtPageSubtitle}>
                      View and manage your past trips.
                    </Text>
                  </View>

                  <View style={styles.dtHeaderRightArea}>
                    <TouchableOpacity
                      style={styles.dtFilterPillButton}
                      activeOpacity={0.8}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        const filters: FilterTab[] = ['All Trips', 'Completed', 'Scheduled', 'Cancelled'];
                        const currentIndex = filters.indexOf(selectedFilter);
                        setSelectedFilter(filters[(currentIndex + 1) % filters.length]);
                      }}
                      accessibilityLabel="Filter trip history"
                    >
                      <Filter size={13} color="#0E1E38" strokeWidth={2.4} />
                      <Text style={styles.dtFilterPillText}>Filter</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 2. Filter Tabs Segmented Bar */}
                <View style={styles.dtFilterTabsContainer}>
                  <View style={styles.dtFilterTabsBar}>
                    {(['All Trips', 'Completed', 'Scheduled', 'Cancelled'] as FilterTab[]).map(
                      (filter) => {
                        const isSelected = selectedFilter === filter;
                        return (
                          <TouchableOpacity
                            key={filter}
                            style={[
                              styles.dtFilterTabOption,
                              isSelected && styles.dtFilterTabOptionActive,
                            ]}
                            activeOpacity={0.8}
                            onPress={() => handleFilterSelect(filter)}
                          >
                            <Text
                              style={[
                                styles.dtFilterTabText,
                                isSelected && styles.dtFilterTabTextActive,
                              ]}
                            >
                              {filter}
                            </Text>
                          </TouchableOpacity>
                        );
                      }
                    )}
                  </View>
                </View>

                {/* 3. Trips List */}
                {isLoading && !isRefreshing ? (
                  <View style={styles.stateCenterContainer}>
                    <ActivityIndicator size="large" color="#00D2B4" />
                    <Text style={styles.loadingText}>Loading your trip history...</Text>
                  </View>
                ) : errorMessage ? (
                  <View style={styles.stateCenterContainer}>
                    <AlertCircle size={44} color="#EF4444" strokeWidth={1.8} />
                    <Text style={styles.errorTitle}>Unable to load trips</Text>
                    <Text style={styles.errorSubtitle}>{errorMessage}</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      activeOpacity={0.8}
                      onPress={() => fetchTrips(false)}
                    >
                      <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                  </View>
                ) : monthKeys.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <History size={48} color="#94A3B8" strokeWidth={1.8} />
                    <Text style={styles.emptyTitle}>No {selectedFilter} trips found</Text>
                    <Text style={styles.emptySubtitle}>
                      Trips under this category will appear here.
                    </Text>
                  </View>
                ) : (
                  monthKeys.map((monthKey) => {
                    const trips = groupedSections[monthKey];
                    return (
                      <View key={monthKey} style={styles.dtMonthGroupContainer}>
                        {/* Month Section Header */}
                        <Text style={styles.dtMonthSectionTitle}>{monthKey}</Text>

                        {/* Trip Cards in Month */}
                        {trips.map((trip) => (
                          <View key={trip.id} style={styles.dtTripCard}>
                            {/* 1. Header Row: Date, Time & Status */}
                            <View style={styles.dtTripCardHeaderRow}>
                              <View style={styles.dtTripDateRow}>
                                <Text style={styles.dtTripDateText}>{trip.dateFormatted}</Text>
                                <Text style={styles.dtTripTimeSlotText}>{trip.timeSlot}</Text>
                              </View>
                              {renderStatusBadge(trip.status)}
                            </View>

                            {/* 2. Middle Row: Locations, Driver & Car Thumbnail */}
                            <View style={styles.dtTripCardMiddleRow}>
                              {/* Left: Pickup & Drop locations timeline */}
                              <View style={styles.dtLocationsColumn}>
                                <View style={styles.dtLocationTimelineRow}>
                                  <View style={styles.pinCircleTeal}>
                                    <MapPin size={11} color="#00D2B4" fill="#00D2B4" />
                                  </View>
                                  <Text style={styles.dtLocationAddressText} numberOfLines={1}>
                                    {trip.pickupAddress}
                                  </Text>
                                </View>

                                <View style={styles.dtDottedConnector}>
                                  <View style={styles.dottedDot} />
                                  <View style={styles.dottedDot} />
                                </View>

                                <View style={styles.dtLocationTimelineRow}>
                                  <View style={styles.pinCircleRed}>
                                    <MapPin size={11} color="#EF4444" fill="#EF4444" />
                                  </View>
                                  <Text style={styles.dtLocationAddressText} numberOfLines={1}>
                                    {trip.dropAddress}
                                  </Text>
                                </View>
                              </View>

                              {/* Middle: Driver Info */}
                              <View style={styles.dtDriverInfoColumn}>
                                <View style={styles.dtDriverAvatarCircle}>
                                  <Image
                                    source={require('../../assets/avatar_user.jpg')}
                                    style={styles.dtDriverAvatarImg}
                                    resizeMode="cover"
                                  />
                                </View>
                                <View style={styles.dtDriverMetaCol}>
                                  <Text style={styles.dtDriverNameText} numberOfLines={1}>
                                    {trip.driver.name}
                                  </Text>
                                  <View style={styles.dtRatingRow}>
                                    <Star size={11} color="#EAB308" fill="#EAB308" />
                                    <Text style={styles.dtRatingText}>
                                      {trip.driver.rating.toFixed(1)}
                                    </Text>
                                  </View>
                                  <Text style={styles.dtCarModelText} numberOfLines={1}>
                                    {trip.driver.carModel}
                                  </Text>
                                  <Text style={styles.dtCarPlateText} numberOfLines={1}>
                                    {trip.driver.plateNumber}
                                  </Text>
                                </View>
                              </View>

                              {/* Right: Car Thumbnail */}
                              <View style={styles.dtCarThumbnailBox}>
                                <Image
                                  source={require('../../assets/car_sedan_thumb.jpg')}
                                  style={styles.dtCarThumbImage}
                                  resizeMode="contain"
                                />
                              </View>
                            </View>

                            <View style={styles.dtCardDivider} />

                            {/* 3. Bottom Row: Duration, Fare & View Details CTA */}
                            <View style={styles.dtTripCardBottomRow}>
                              <View style={styles.dtDurationRow}>
                                <Clock size={15} color="#64748B" strokeWidth={2.2} />
                                <Text style={styles.dtDurationText}>{trip.durationLabel}</Text>
                              </View>

                              <Text style={styles.dtFareAmountText}>
                                ₹ {trip.fare.toLocaleString('en-IN')}
                              </Text>

                              <TouchableOpacity
                                style={styles.dtViewDetailsButton}
                                activeOpacity={0.8}
                                onPress={() => handleViewDetails(trip)}
                              >
                                <Text style={styles.dtViewDetailsText}>View Details</Text>
                                <ChevronRight size={13} color="#0E1E38" strokeWidth={2.4} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    );
                  })
                )}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Modal */}
        {renderTripDetailsModal()}
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
        {/* Top Header: Centered DriverX Logo */}
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

          {/* Placeholder to balance back button */}
          <View style={{ width: 40 }} />
        </View>

        {/* Title Header with Filter Pill Button */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.pageTitle}>Trip History</Text>
            <TouchableOpacity
              style={styles.filterPillButton}
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                const filters: FilterTab[] = ['All Trips', 'Completed', 'Scheduled', 'Cancelled'];
                const currentIndex = filters.indexOf(selectedFilter);
                setSelectedFilter(filters[(currentIndex + 1) % filters.length]);
              }}
              accessibilityLabel="Filter trip history"
            >
              <Filter size={13} color="#0E1E38" strokeWidth={2.4} />
              <Text style={styles.filterPillText}>Filter</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.pageSubtitle}>
            View and manage your past trips.
          </Text>
        </View>

        {/* Filter Tabs Segmented Bar */}
        <View style={styles.filterTabsContainer}>
          <View style={styles.filterTabsBar}>
            {(['All Trips', 'Completed', 'Scheduled', 'Cancelled'] as FilterTab[]).map(
              (filter) => {
                const isSelected = selectedFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterTabOption,
                      isSelected && styles.filterTabOptionActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleFilterSelect(filter)}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        isSelected && styles.filterTabTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>
        </View>

        {/* Scrollable Trips List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchTrips(true)}
              colors={['#00D2B4']}
              tintColor="#00D2B4"
            />
          }
        >
          {isLoading && !isRefreshing ? (
            <View style={styles.stateCenterContainer}>
              <ActivityIndicator size="large" color="#00D2B4" />
              <Text style={styles.loadingText}>Loading your trip history...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.stateCenterContainer}>
              <AlertCircle size={40} color="#EF4444" strokeWidth={1.8} />
              <Text style={styles.errorTitle}>Unable to load trips</Text>
              <Text style={styles.errorSubtitle}>{errorMessage}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                activeOpacity={0.8}
                onPress={() => fetchTrips(false)}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : monthKeys.length === 0 ? (
            <View style={styles.emptyContainer}>
              <History size={40} color="#94A3B8" strokeWidth={1.8} />
              <Text style={styles.emptyTitle}>No {selectedFilter} trips found</Text>
              <Text style={styles.emptySubtitle}>
                Trips under this category will appear here.
              </Text>
            </View>
          ) : (
            monthKeys.map((monthKey) => {
              const trips = groupedSections[monthKey];
              return (
                <View key={monthKey} style={styles.monthGroupContainer}>
                  {/* Month Section Header */}
                  <Text style={styles.monthSectionTitle}>{monthKey}</Text>

                  {/* Trip Cards in Month */}
                  {trips.map((trip) => (
                    <View key={trip.id} style={styles.tripCard}>
                      {/* 1. Header Row: Date, Time & Status */}
                      <View style={styles.tripCardHeaderRow}>
                        <View style={styles.tripDateRow}>
                          <Text style={styles.tripDateText}>
                            {trip.dateFormatted}
                          </Text>
                          <Text style={styles.tripTimeSlotText}>
                            {trip.timeSlot}
                          </Text>
                        </View>
                        {renderStatusBadge(trip.status)}
                      </View>

                      {/* 2. Middle Row: Locations, Driver & Car Thumbnail */}
                      <View style={styles.tripCardMiddleRow}>
                        {/* Left: Pickup & Drop locations timeline */}
                        <View style={styles.locationsColumn}>
                          <View style={styles.locationTimelineRow}>
                            <View style={styles.pinCircleTeal}>
                              <MapPin size={10} color="#00D2B4" fill="#00D2B4" />
                            </View>
                            <Text
                              style={styles.locationAddressText}
                              numberOfLines={1}
                            >
                              {trip.pickupAddress}
                            </Text>
                          </View>

                          <View style={styles.dottedConnectorContainer}>
                            <View style={styles.dottedDot} />
                            <View style={styles.dottedDot} />
                          </View>

                          <View style={styles.locationTimelineRow}>
                            <View style={styles.pinCircleRed}>
                              <MapPin size={10} color="#EF4444" fill="#EF4444" />
                            </View>
                            <Text
                              style={styles.locationAddressText}
                              numberOfLines={1}
                            >
                              {trip.dropAddress}
                            </Text>
                          </View>
                        </View>

                        {/* Middle: Driver Info */}
                        <View style={styles.driverInfoColumn}>
                          <View style={styles.driverAvatarCircle}>
                            <Image
                              source={require('../../assets/avatar_user.jpg')}
                              style={styles.driverAvatarImg}
                              resizeMode="cover"
                            />
                          </View>
                          <View style={styles.driverMetaCol}>
                            <Text style={styles.driverNameText} numberOfLines={1}>
                              {trip.driver.name}
                            </Text>
                            <View style={styles.ratingRow}>
                              <Star
                                size={10}
                                color="#EAB308"
                                fill="#EAB308"
                              />
                              <Text style={styles.ratingText}>
                                {trip.driver.rating.toFixed(1)}
                              </Text>
                            </View>
                            <Text style={styles.carModelText} numberOfLines={1}>
                              {trip.driver.carModel}
                            </Text>
                            <Text style={styles.carPlateText} numberOfLines={1}>
                              {trip.driver.plateNumber}
                            </Text>
                          </View>
                        </View>

                        {/* Right: Car Thumbnail */}
                        <View style={styles.carThumbnailBox}>
                          <Image
                            source={require('../../assets/car_sedan_thumb.jpg')}
                            style={styles.carThumbImage}
                            resizeMode="contain"
                          />
                        </View>
                      </View>

                      {/* Divider Line */}
                      <View style={styles.cardDivider} />

                      {/* 3. Bottom Row: Duration, Fare & View Details CTA */}
                      <View style={styles.tripCardBottomRow}>
                        <View style={styles.durationRow}>
                          <Clock size={14} color="#64748B" strokeWidth={2.2} />
                          <Text style={styles.durationText}>
                            {trip.durationLabel}
                          </Text>
                        </View>

                        <Text style={styles.fareAmountText}>
                          ₹ {trip.fare.toLocaleString('en-IN')}
                        </Text>

                        <TouchableOpacity
                          style={styles.viewDetailsButton}
                          activeOpacity={0.8}
                          onPress={() => handleViewDetails(trip)}
                        >
                          <Text style={styles.viewDetailsText}>
                            View Details
                          </Text>
                          <ChevronRight
                            size={12}
                            color="#0E1E38"
                            strokeWidth={2.4}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              );
            })
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* 4. Bottom Navigation Bar */}
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
              <View
                style={[
                  styles.tabActivePill,
                  activeTab === 'bookings' && styles.tabActivePillSelected,
                ]}
              >
                <Calendar
                  size={20}
                  color={activeTab === 'bookings' ? '#00D2B4' : '#94A3B8'}
                  strokeWidth={2.2}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'bookings' && styles.tabLabelActive,
                ]}
              >
                My Bookings
              </Text>
            </TouchableOpacity>

            {/* Trip History Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.8}
              onPress={() => handleTabPress('history')}
            >
              <View
                style={[
                  styles.tabActivePill,
                  activeTab !== 'bookings' && styles.tabActivePillSelected,
                ]}
              >
                <History
                  size={20}
                  color={activeTab !== 'bookings' ? '#00D2B4' : '#94A3B8'}
                  strokeWidth={2.4}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab !== 'bookings' && styles.tabLabelActive,
                ]}
              >
                Trip History
              </Text>
            </TouchableOpacity>

            {/* Profile Tab */}
            <TouchableOpacity
              style={styles.tabItem}
              activeOpacity={0.8}
              onPress={() => handleTabPress('profile')}
            >
              <View style={styles.tabActivePill}>
                <User size={20} color="#94A3B8" strokeWidth={2.2} />
              </View>
              <Text style={styles.tabLabel}>Profile</Text>
            </TouchableOpacity>
          </View>

          {/* iOS Bottom Home Indicator Bar */}
          <View style={styles.homeIndicatorWrapper}>
            <View style={styles.homeIndicator} />
          </View>
        </View>
      </SafeAreaView>

      {/* Trip Details Modal */}
      {renderTripDetailsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  // =========================================================================
  // DESKTOP SPECIFIC STYLES
  // =========================================================================
  desktopOuterContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    minHeight: '100%',
  },
  desktopBodyRow: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100%',
  },
  desktopContentArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F7FAFC',
  },
  topRightDots: {
    position: 'absolute',
    top: 40,
    right: 28,
    zIndex: 0,
  },
  bottomRightDots: {
    position: 'absolute',
    bottom: 40,
    right: 28,
    zIndex: 0,
  },
  dotGridContainer: {
    flexDirection: 'column',
    gap: 9,
  },
  dotGridRow: {
    flexDirection: 'row',
    gap: 9,
  },
  dotGridDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.25,
    backgroundColor: '#00D2B4',
    opacity: 0.38,
  },
  desktopScroll: {
    flex: 1,
    zIndex: 1,
  },
  desktopScrollContent: {
    paddingHorizontal: 36,
    paddingVertical: 28,
    alignItems: 'center',
  },
  desktopMainCard: {
    width: '100%',
    maxWidth: 960,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#071226',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
  },
  dtCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  dtCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dtBackButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtTitleColumn: {
    gap: 2,
  },
  dtPageTitle: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  dtPageSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#64748B',
  },
  dtHeaderRightArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  dtFilterPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtFilterPillText: {
    fontFamily: FONT.semiBold,
    fontSize: 12.5,
    color: '#0E1E38',
  },
  dtBrandCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dtLogoEmblem: {
    width: 32,
    height: 20,
  },
  brandTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTextNavy: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  brandTextTeal: {
    fontFamily: FONT.bold,
    fontSize: 18,
    color: '#00D2B4',
    letterSpacing: -0.4,
  },

  /* Desktop Filter Segmented Tabs */
  dtFilterTabsContainer: {
    marginBottom: 24,
  },
  dtFilterTabsBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  dtFilterTabOption: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtFilterTabOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#071226',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  dtFilterTabText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#64748B',
  },
  dtFilterTabTextActive: {
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },

  /* Desktop Trip Cards List */
  dtMonthGroupContainer: {
    marginBottom: 24,
  },
  dtMonthSectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    color: '#64748B',
    marginBottom: 12,
  },
  dtTripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    padding: 18,
    marginBottom: 14,
    shadowColor: '#071226',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  dtTripCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  dtTripDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dtTripDateText: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
  },
  dtTripTimeSlotText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#64748B',
  },
  dtTripCardMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    paddingBottom: 14,
  },
  dtLocationsColumn: {
    flex: 1.3,
    gap: 4,
  },
  dtLocationTimelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dtLocationAddressText: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#1E293B',
    flex: 1,
  },
  dtDottedConnector: {
    paddingLeft: 4,
    marginVertical: -1,
    gap: 2,
  },
  dtDriverInfoColumn: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#F1F5F9',
    paddingLeft: 16,
  },
  dtDriverAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  dtDriverAvatarImg: {
    width: '100%',
    height: '100%',
  },
  dtDriverMetaCol: {
    gap: 2,
  },
  dtDriverNameText: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    color: '#0E1E38',
  },
  dtRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dtRatingText: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: '#64748B',
  },
  dtCarModelText: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
  },
  dtCarPlateText: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: '#94A3B8',
  },
  dtCarThumbnailBox: {
    width: 90,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 4,
  },
  dtCarThumbImage: {
    width: '100%',
    height: '100%',
  },
  dtCardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  dtTripCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dtDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dtDurationText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: '#64748B',
  },
  dtFareAmountText: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#0E1E38',
  },
  dtViewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  dtViewDetailsText: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#0E1E38',
  },

  // =========================================================================
  // MOBILE BASE STYLES
  // =========================================================================
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  brandCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmblem: {
    width: 44,
    height: 22,
    marginBottom: -2,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontFamily: FONT.bold,
    fontSize: 22,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  filterPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  filterPillText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#0E1E38',
  },
  filterTabsContainer: {
    paddingHorizontal: 18,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  filterTabsBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  filterTabOption: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  filterTabOptionActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  filterTabText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#64748B',
  },
  filterTabTextActive: {
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#0E1E38',
  },
  emptySubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#64748B',
  },
  monthGroupContainer: {
    marginBottom: 16,
  },
  monthSectionTitle: {
    fontFamily: FONT.bold,
    fontSize: 13.5,
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 2,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  tripCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tripDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tripDateText: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#0E1E38',
  },
  tripTimeSlotText: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: '#64748B',
  },
  completedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  completedBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 10.5,
    color: '#059669',
  },
  scheduledBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  scheduledBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 10.5,
    color: '#2563EB',
  },
  cancelledBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  cancelledBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 10.5,
    color: '#DC2626',
  },
  tripCardMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  locationsColumn: {
    flex: 1,
    paddingRight: 6,
  },
  locationTimelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinCircleTeal: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCircleRed: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationAddressText: {
    fontFamily: FONT.medium,
    fontSize: 11.5,
    color: '#0E1E38',
    flex: 1,
  },
  dottedConnectorContainer: {
    paddingLeft: 7,
    marginVertical: -2,
    gap: 2,
  },
  dottedDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#CBD5E1',
  },
  driverInfoColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 6,
  },
  driverAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  driverAvatarImg: {
    width: '100%',
    height: '100%',
  },
  driverMetaCol: {
    gap: 1,
  },
  driverNameText: {
    fontFamily: FONT.bold,
    fontSize: 11.5,
    color: '#0E1E38',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontFamily: FONT.semiBold,
    fontSize: 10,
    color: '#64748B',
  },
  carModelText: {
    fontFamily: FONT.regular,
    fontSize: 9.5,
    color: '#64748B',
  },
  carPlateText: {
    fontFamily: FONT.medium,
    fontSize: 9.5,
    color: '#94A3B8',
  },
  carThumbnailBox: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carThumbImage: {
    width: '100%',
    height: '100%',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 8,
  },
  tripCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontFamily: FONT.medium,
    fontSize: 11.5,
    color: '#64748B',
  },
  fareAmountText: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: '#0E1E38',
  },
  bottomTabBarContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
  },
  bottomTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabActivePill: {
    width: 40,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActivePillSelected: {
    backgroundColor: '#E6FAF6',
  },
  tabLabel: {
    fontFamily: FONT.medium,
    fontSize: 10.5,
    color: '#94A3B8',
  },
  tabLabelActive: {
    fontFamily: FONT.bold,
    color: '#00D2B4',
  },
  homeIndicatorWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  homeIndicator: {
    width: 134,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000000',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 18, 38, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#0E1E38',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    paddingVertical: 14,
    gap: 12,
  },
  modalDateStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalDateText: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
  },
  modalTimeText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: '#64748B',
  },
  modalLocationsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  modalLocationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  modalLocMicroLabel: {
    fontFamily: FONT.medium,
    fontSize: 10,
    color: '#94A3B8',
  },
  modalLocAddressText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#0E1E38',
    marginTop: 1,
  },
  modalLocDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  modalDriverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
  },
  modalDriverAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  modalDriverName: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#0E1E38',
  },
  modalCarText: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: '#64748B',
  },
  modalRatingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modalRatingText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: '#854D0E',
  },
  modalFareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  modalFareMicroLabel: {
    fontFamily: FONT.medium,
    fontSize: 10.5,
    color: '#64748B',
  },
  modalDurationVal: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#0E1E38',
  },
  modalFareVal: {
    fontFamily: FONT.bold,
    fontSize: 17,
    color: '#0E1E38',
  },
  modalDismissBtn: {
    backgroundColor: '#00D2B4',
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDismissBtnText: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#072038',
  },
  stateCenterContainer: {
    paddingVertical: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  errorTitle: {
    fontFamily: FONT.bold,
    fontSize: 16,
    color: '#0E1E38',
    marginTop: 4,
  },
  errorSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 18,
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: '#00D2B4',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  retryButtonText: {
    fontFamily: FONT.bold,
    fontSize: 13,
    color: '#071226',
  },
});
