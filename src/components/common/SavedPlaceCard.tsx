import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  Home as HomeIcon,
  Briefcase,
  Users,
  Star,
} from 'lucide-react-native';
import { SavedPlace } from '../../store/bookingStore';
import { FONT } from '../../theme/typography';

export interface SavedPlaceCardProps {
  place: SavedPlace;
  onPress?: (place: SavedPlace) => void;
  style?: StyleProp<ViewStyle>;
}

export const SavedPlaceCard: React.FC<SavedPlaceCardProps> = ({
  place,
  onPress,
  style,
}) => {
  const renderIcon = (type: SavedPlace['type']) => {
    const iconSize = 18;
    const iconColor = '#00D2B4';
    if (type === 'home') return <HomeIcon size={iconSize} color={iconColor} strokeWidth={2.2} />;
    if (type === 'office') return <Briefcase size={iconSize} color={iconColor} strokeWidth={2.2} />;
    if (type === 'parents') return <Users size={iconSize} color={iconColor} strokeWidth={2.2} />;
    return <Star size={iconSize} color={iconColor} strokeWidth={2.2} />;
  };

  const handlePress = () => {
    if (onPress) {
      onPress(place);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.savedPlaceCard, style]}
      activeOpacity={0.75}
      onPress={handlePress}
    >
      <View style={styles.savedPlaceIconBadge}>
        {renderIcon(place.type)}
      </View>

      <Text style={styles.savedPlaceTitle} numberOfLines={1}>
        {place.title}
      </Text>
      <Text style={styles.savedPlaceAddress} numberOfLines={2}>
        {place.address}
      </Text>
    </TouchableOpacity>
  );
};

export default SavedPlaceCard;

const styles = StyleSheet.create({
  savedPlaceCard: {
    width: 118,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    flexShrink: 0,
  },
  savedPlaceIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  savedPlaceTitle: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#0E1E38',
    marginBottom: 2,
  },
  savedPlaceAddress: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: '#64748B',
    lineHeight: 13,
  },
});
