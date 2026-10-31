import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { BackendRecentBooking } from '../../services/api/homeApi';
import { FONT } from '../../theme/typography';

export interface RecentBookingCardProps {
  booking?: BackendRecentBooking | null;
  onPress?: (booking: BackendRecentBooking) => void;
  style?: StyleProp<ViewStyle>;
}

export const RecentBookingCard: React.FC<RecentBookingCardProps> = ({
  booking,
  onPress,
  style,
}) => {
  if (booking) {
    const CardContainer = onPress ? TouchableOpacity : View;
    const containerProps = onPress
      ? {
          activeOpacity: 0.8,
          onPress: () => onPress(booking),
        }
      : {};

    const pickupTitle = booking.pickupAddress?.split(',')[0] || '';
    const dropTitle = booking.dropAddress?.split(',')[0] || '';

    return (
      <CardContainer
        style={[styles.recentBookingCard, style]}
        {...containerProps}
      >
        {/* Left Car Thumbnail */}
        <View style={styles.bookingCarThumbnailWrapper}>
          <Image
            source={require('../../../assets/car_sedan_thumb.jpg')}
            style={styles.bookingCarThumbnail}
            resizeMode="contain"
          />
        </View>

        {/* Middle Booking Details */}
        <View style={styles.bookingMiddleDetails}>
          <Text style={styles.bookingDateText}>{booking.dateTime}</Text>
          <Text style={styles.bookingDurationText}>{booking.durationLabel}</Text>
          <View style={styles.completedBadge}>
            <View style={styles.completedGreenDot} />
            <Text style={styles.completedBadgeText}>{booking.status}</Text>
          </View>
        </View>

        {/* Right Route Timeline */}
        <View style={styles.bookingRouteContainer}>
          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, { backgroundColor: '#00D2B4' }]} />
            <Text style={styles.timelineText} numberOfLines={1}>
              {pickupTitle}
            </Text>
          </View>

          <View style={styles.timelineLine} />

          <View style={styles.timelineRow}>
            <View style={[styles.timelineDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.timelineText} numberOfLines={1}>
              {dropTitle}
            </Text>
          </View>
        </View>

        <ChevronRight
          size={16}
          color="#94A3B8"
          strokeWidth={2.4}
          style={styles.bookingArrow}
        />
      </CardContainer>
    );
  }

  // Fallback / Empty State
  return (
    <View style={[styles.recentBookingCard, style]}>
      <View style={styles.bookingMiddleDetails}>
        <Text style={styles.bookingDateText}>No recent trips</Text>
        <Text style={styles.bookingDurationText}>Book a driver to get started</Text>
      </View>
    </View>
  );
};

export default RecentBookingCard;

const styles = StyleSheet.create({
  recentBookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  bookingCarThumbnailWrapper: {
    width: 58,
    height: 42,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  bookingCarThumbnail: {
    width: '95%',
    height: '95%',
  },
  bookingMiddleDetails: {
    flex: 1.1,
  },
  bookingDateText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: '#0E1E38',
    marginBottom: 2,
  },
  bookingDurationText: {
    fontFamily: FONT.regular,
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  completedGreenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  completedBadgeText: {
    fontFamily: FONT.semiBold,
    fontSize: 10,
    color: '#10B981',
  },
  bookingRouteContainer: {
    flex: 1.3,
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timelineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timelineText: {
    fontFamily: FONT.medium,
    fontSize: 10.5,
    color: '#0E1E38',
  },
  timelineLine: {
    width: 1.5,
    height: 8,
    backgroundColor: '#CBD5E1',
    marginLeft: 2.25,
    marginVertical: 1,
  },
  bookingArrow: {
    marginLeft: 6,
  },
});
