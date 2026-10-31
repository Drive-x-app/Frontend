import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  ShieldCheck,
  Car,
  CreditCard,
  Headphones,
  LucideIcon,
} from 'lucide-react-native';
import { FONT } from '../../theme/typography';

export interface TrustFeaturesBarProps {
  /**
   * Layout variant:
   * - 'mobile': Vertical stack per feature item (standard mobile customer layout)
   * - 'desktop': Horizontal inline feature item inside floating card container
   * Defaults to 'mobile'.
   */
  variant?: 'mobile' | 'desktop';
  style?: StyleProp<ViewStyle>;
}

interface TrustFeatureItem {
  id: string;
  line1: string;
  line2: string;
  Icon: LucideIcon;
}

const TRUST_FEATURES: TrustFeatureItem[] = [
  {
    id: 'verified',
    line1: 'Verified',
    line2: 'Drivers',
    Icon: ShieldCheck,
  },
  {
    id: 'tracking',
    line1: 'Real-time',
    line2: 'Tracking',
    Icon: Car,
  },
  {
    id: 'payments',
    line1: 'Secure',
    line2: 'Payments',
    Icon: CreditCard,
  },
  {
    id: 'support',
    line1: '24/7',
    line2: 'Support',
    Icon: Headphones,
  },
];

export const TrustFeaturesBar: React.FC<TrustFeaturesBarProps> = ({
  variant = 'mobile',
  style,
}) => {
  if (variant === 'desktop') {
    return (
      <View style={[styles.desktopCard, style]}>
        {TRUST_FEATURES.map((item, index) => {
          const IconComponent = item.Icon;
          return (
            <React.Fragment key={item.id}>
              {index > 0 && <View style={styles.desktopDivider} />}
              <View style={styles.desktopItem}>
                <View style={styles.desktopIconCircle}>
                  <IconComponent size={18} color="#00D2B4" strokeWidth={2.2} />
                </View>
                <Text style={styles.desktopLabel}>
                  {item.line1}{'\n'}{item.line2}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    );
  }

  return (
    <View style={[styles.mobileRow, style]}>
      {TRUST_FEATURES.map((item, index) => {
        const IconComponent = item.Icon;
        return (
          <React.Fragment key={item.id}>
            {index > 0 && <View style={styles.mobileDivider} />}
            <View style={styles.mobileItem}>
              <View style={styles.mobileIconBadge}>
                <IconComponent size={20} color="#00D2B4" strokeWidth={2.2} />
              </View>
              <Text style={styles.mobileTitle}>{item.line1}</Text>
              <Text style={styles.mobileTitle}>{item.line2}</Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default TrustFeaturesBar;

const styles = StyleSheet.create({
  // Mobile Layout Styles
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 24,
  },
  mobileItem: {
    alignItems: 'center',
    flex: 1,
  },
  mobileDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#EDF2F7',
  },
  mobileIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E6FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  mobileTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 10.5,
    color: '#0E1E38',
    textAlign: 'center',
    lineHeight: 13.5,
  },

  // Desktop Layout Styles
  desktopCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  desktopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    justifyContent: 'center',
  },
  desktopIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6FAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopLabel: {
    fontFamily: FONT.medium,
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 15,
  },
  desktopDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
});
