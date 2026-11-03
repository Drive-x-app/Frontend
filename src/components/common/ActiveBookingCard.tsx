import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock, Navigation } from 'lucide-react-native';
import { BackendActiveBooking } from '../../services/api/homeApi';
import { FONT } from '../../theme/typography';

interface ActiveBookingCardProps {
  booking: BackendActiveBooking;
  onPress: () => void;
}

export function ActiveBookingCard({ booking, onPress }: ActiveBookingCardProps) {
  const pickupDate = booking.pickupDate
    ? new Date(`${booking.pickupDate}T00:00:00`).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      })
    : 'Today';

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Track active booking, pickup at ${booking.pickupAddress}`}
    >
      <View style={styles.iconWrap}>
        <Navigation size={19} color="#008F7A" strokeWidth={2.3} />
      </View>
      <View style={styles.details}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Active Booking</Text>
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>DEMO TRACKING</Text>
          </View>
        </View>
        <Text style={styles.pickup} numberOfLines={1}>
          {booking.pickupAddress}
        </Text>
        <View style={styles.metaRow}>
          <Clock size={12} color="#64748B" />
          <Text style={styles.metaText}>
            {booking.durationLabel} · {pickupDate} · {booking.pickupTime || 'Flexible time'}
          </Text>
        </View>
      </View>
      <View style={styles.action}>
        <Text style={styles.actionText}>Track</Text>
        <Navigation size={14} color="#FFFFFF" strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF9',
    borderWidth: 1,
    borderColor: '#B9F2E6',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D8F8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: 14,
    color: '#0E1E38',
  },
  demoBadge: {
    backgroundColor: '#D8F8F0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  demoBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 8,
    letterSpacing: 0.3,
    color: '#008F7A',
  },
  pickup: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: '#334155',
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  metaText: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: '#64748B',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#008F7A',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },
});
