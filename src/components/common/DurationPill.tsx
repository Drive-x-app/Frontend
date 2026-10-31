import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Clock, Sun, Calendar } from 'lucide-react-native';
import { DurationOption } from '../../store/bookingStore';
import { FONT } from '../../theme/typography';

export interface DurationItem {
  id: string;
  label: string;
  subtitle?: string;
  description?: string;
  hours?: number;
  iconType?: 'clock' | 'sun' | 'calendar' | string;
}

export interface DurationPillProps {
  item: DurationItem | DurationOption;
  isSelected?: boolean;
  onPress?: (id: string) => void;
  variant?: 'mobile' | 'desktop';
  style?: StyleProp<ViewStyle>;
}

export const DurationPill: React.FC<DurationPillProps> = ({
  item,
  isSelected = false,
  onPress,
  variant = 'mobile',
  style,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress(item.id);
    }
  };

  if (variant === 'desktop') {
    const isSun = item.id === 'fullday' || ('iconType' in item && item.iconType === 'sun');
    const subtitle =
      'subtitle' in item && item.subtitle ? item.subtitle : ('description' in item ? item.description : undefined);

    return (
      <TouchableOpacity
        style={[
          styles.desktopDurationCard,
          isSelected && styles.desktopDurationCardSelected,
          style,
        ]}
        activeOpacity={0.75}
        onPress={handlePress}
      >
        <View
          style={[
            styles.desktopDurationIconCircle,
            isSelected && styles.desktopDurationIconCircleSelected,
          ]}
        >
          {isSun ? (
            <Sun size={16} color="#00D2B4" strokeWidth={2.4} />
          ) : (
            <Clock size={16} color="#00D2B4" strokeWidth={2.4} />
          )}
        </View>
        <Text
          style={[
            styles.desktopDurationLabel,
            isSelected && styles.desktopDurationLabelSelected,
          ]}
        >
          {item.label}
        </Text>
        {subtitle ? <Text style={styles.desktopDurationSub}>{subtitle}</Text> : null}
      </TouchableOpacity>
    );
  }

  // Mobile layout
  const renderMobileIcon = () => {
    const iconColor = '#00D2B4';
    const iconSize = 18;
    if (item.id === 'fullday' || ('iconType' in item && item.iconType === 'sun')) {
      return <Sun size={iconSize} color={iconColor} strokeWidth={2.4} />;
    }
    if (item.id === '1week' || ('iconType' in item && item.iconType === 'calendar')) {
      return <Calendar size={iconSize} color={iconColor} strokeWidth={2.2} />;
    }
    return <Clock size={iconSize} color={iconColor} strokeWidth={2.4} />;
  };

  return (
    <TouchableOpacity
      style={[
        styles.durationPill,
        isSelected && styles.durationPillSelected,
        style,
      ]}
      activeOpacity={0.75}
      onPress={handlePress}
    >
      <View
        style={[
          styles.durationIconCircle,
          isSelected && styles.durationIconCircleSelected,
        ]}
      >
        {renderMobileIcon()}
      </View>
      <Text
        style={[
          styles.durationLabel,
          isSelected && styles.durationLabelSelected,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
};

export default DurationPill;

const styles = StyleSheet.create({
  // Mobile styles
  durationPill: {
    width: 64,
    height: 68,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#EBF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  durationPillSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#00D2B4',
    borderWidth: 1.5,
    shadowColor: '#00D2B4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  durationIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationIconCircleSelected: {
    backgroundColor: '#E6FAF6',
  },
  durationLabel: {
    fontFamily: FONT.medium,
    fontSize: 11,
    color: '#64748B',
  },
  durationLabelSelected: {
    fontFamily: FONT.semiBold,
    color: '#0E1E38',
  },

  // Desktop styles
  desktopDurationCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as any) : {}),
  },
  desktopDurationCardSelected: {
    borderColor: '#00D2B4',
    borderWidth: 1.5,
    backgroundColor: '#F0FDFB',
  },
  desktopDurationIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E6FAF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  desktopDurationIconCircleSelected: {
    backgroundColor: '#D1F5EE',
  },
  desktopDurationLabel: {
    fontFamily: FONT.bold,
    fontSize: 12.5,
    color: '#0E1E38',
    textAlign: 'center',
  },
  desktopDurationLabelSelected: {
    color: '#0E1E38',
  },
  desktopDurationSub: {
    fontFamily: FONT.regular,
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 3,
  },
});
