import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { MapPin, LocateFixed, ChevronDown } from 'lucide-react-native';
import { FONT } from '../../theme/typography';

export interface LocationInputCardProps {
  pickupLocation?: string;
  dropLocation?: string;
  pickupPlaceholder?: string;
  dropPlaceholder?: string;
  onPressPickup?: () => void;
  onPressDrop?: () => void;
  onUseCurrentLocation?: () => void;
  variant?: 'mobile' | 'desktop';
  style?: StyleProp<ViewStyle>;
}

export const LocationInputCard: React.FC<LocationInputCardProps> = ({
  pickupLocation,
  dropLocation,
  pickupPlaceholder = 'Enter pickup location',
  dropPlaceholder,
  onPressPickup,
  onPressDrop,
  onUseCurrentLocation,
  variant = 'mobile',
  style,
}) => {
  if (variant === 'desktop') {
    return (
      <View style={style}>
        {/* Pickup Location Card */}
        <TouchableOpacity
          style={styles.desktopLocationRow}
          activeOpacity={0.85}
          onPress={onPressPickup}
        >
          <View style={[styles.desktopLocationPinBadge, { backgroundColor: '#E6FAF6' }]}>
            <MapPin size={17} color="#00D2B4" fill="#00D2B4" strokeWidth={1} />
          </View>

          <View style={styles.desktopLocationInputWrapper}>
            <Text style={styles.desktopLocationLabel}>Pickup Location</Text>
            <Text
              style={[
                styles.desktopLocationValue,
                !pickupLocation && styles.desktopLocationPlaceholder,
              ]}
              numberOfLines={1}
            >
              {pickupLocation || pickupPlaceholder}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.desktopLocateBtn}
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              onUseCurrentLocation?.();
            }}
            accessibilityLabel="Use current location"
          >
            <LocateFixed size={18} color="#94A3B8" strokeWidth={2} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Drop Location (Optional) Card */}
        <TouchableOpacity
          style={styles.desktopLocationRow}
          activeOpacity={0.85}
          onPress={onPressDrop}
        >
          <View style={[styles.desktopLocationPinBadge, { backgroundColor: '#FEE2E2' }]}>
            <MapPin size={17} color="#EF4444" fill="#EF4444" strokeWidth={1} />
          </View>

          <View style={styles.desktopLocationInputWrapper}>
            <View style={styles.desktopDropLabelRow}>
              <Text style={styles.desktopLocationLabel}>Drop Location</Text>
              <Text style={styles.desktopOptionalLabel}> (Optional)</Text>
            </View>
            <Text
              style={[
                styles.desktopLocationValue,
                !dropLocation && styles.desktopLocationPlaceholder,
              ]}
              numberOfLines={1}
            >
              {dropLocation || dropPlaceholder || 'Select drop location'}
            </Text>
          </View>

          <ChevronDown size={18} color="#94A3B8" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
    );
  }

  // Mobile layout
  return (
    <View style={[styles.locationCard, style]}>
      {/* Pickup Location Row */}
      <TouchableOpacity
        style={styles.locationRow}
        activeOpacity={0.85}
        onPress={onPressPickup}
      >
        <View style={[styles.locationPinBadge, { backgroundColor: '#E6FAF6' }]}>
          <MapPin size={17} color="#00D2B4" fill="#00D2B4" strokeWidth={1} />
        </View>

        <View style={styles.locationInputWrapper} pointerEvents="none">
          <Text style={styles.locationLabel}>Pickup Location</Text>
          <TextInput
            style={styles.locationTextInput}
            placeholder={pickupPlaceholder}
            placeholderTextColor="#94A3B8"
            value={pickupLocation}
            editable={false}
          />
        </View>

        <TouchableOpacity
          style={styles.locateButton}
          activeOpacity={0.7}
          onPress={(e) => {
            e.stopPropagation();
            onUseCurrentLocation?.();
          }}
          accessibilityLabel="Use current location"
        >
          <LocateFixed size={18} color="#94A3B8" strokeWidth={2} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Divider Line */}
      <View style={styles.locationDivider} />

      {/* Drop Location Row */}
      <TouchableOpacity
        style={styles.locationRow}
        activeOpacity={0.85}
        onPress={onPressDrop}
      >
        <View style={[styles.locationPinBadge, { backgroundColor: '#FEE2E2' }]}>
          <MapPin size={17} color="#EF4444" fill="#EF4444" strokeWidth={1} />
        </View>

        <View style={styles.locationInputWrapper} pointerEvents="none">
          <View style={styles.dropLabelRow}>
            <Text style={styles.locationLabel}>Drop Location</Text>
            <Text style={styles.optionalLabel}> (Optional)</Text>
          </View>
          <TextInput
            style={styles.locationTextInput}
            placeholder={dropPlaceholder || 'Enter drop location (optional)'}
            placeholderTextColor="#94A3B8"
            value={dropLocation}
            editable={false}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default LocationInputCard;

const styles = StyleSheet.create({
  // Mobile styles
  locationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
  },
  locationPinBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  locationInputWrapper: {
    flex: 1,
  },
  locationLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 12.5,
    color: '#0E1E38',
    marginBottom: 1,
  },
  dropLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  optionalLabel: {
    fontFamily: FONT.regular,
    fontSize: 11.5,
    color: '#64748B',
  },
  locationTextInput: {
    fontFamily: FONT.medium,
    fontSize: 12.5,
    color: '#0E1E38',
    padding: 0,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
        } as any)
      : {}),
  },
  locateButton: {
    padding: 6,
  },
  locationDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 42,
  },

  // Desktop styles
  desktopLocationRow: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  desktopLocationPinBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  desktopLocationInputWrapper: {
    flex: 1,
  },
  desktopLocationLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#0E1E38',
  },
  desktopLocationValue: {
    fontFamily: FONT.medium,
    fontSize: 13.5,
    color: '#475569',
    marginTop: 2,
  },
  desktopDropLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  desktopOptionalLabel: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: '#94A3B8',
  },
  desktopLocationPlaceholder: {
    color: '#94A3B8',
    fontFamily: FONT.regular,
  },
  desktopLocateBtn: {
    padding: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
});
