import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  useWindowDimensions,
  Platform,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Home,
  Briefcase,
  Star,
  MapPin,
  Cross,
  GraduationCap,
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { homeApi } from '../../src/services/api/homeApi';
import { useBookingStore } from '../../src/store/bookingStore';
import { DesktopHeader } from '../../src/components/common/DesktopHeader';
import { DesktopSidebar } from '../../src/components/common/DesktopSidebar';
import { FONT } from '../../src/theme/typography';

export type SavedLocationType =
  | 'home'
  | 'work'
  | 'parents'
  | 'friends'
  | 'hospital'
  | 'college'
  | 'other';

export interface SavedLocationItem {
  id: string;
  title: string;
  address: string;
  type: SavedLocationType;
  bgColor: string;
  iconColor: string;
}

const DEFAULT_SAVED_LOCATIONS: SavedLocationItem[] = [
  {
    id: 'loc-1',
    title: 'Home',
    address: '123, Anna Nagar, Coimbatore,\nTamil Nadu - 641040',
    type: 'home',
    bgColor: '#EFF6FF',
    iconColor: '#2563EB',
  },
  {
    id: 'loc-2',
    title: 'Work',
    address: 'KCT Tech Park, Saravanampatti,\nCoimbatore - 641035',
    type: 'work',
    bgColor: '#E6FAF7',
    iconColor: '#00D2B4',
  },
  {
    id: 'loc-3',
    title: 'Parents House',
    address: 'Saibaba Colony, Coimbatore,\nTamil Nadu - 641011',
    type: 'parents',
    bgColor: '#FEF9C3',
    iconColor: '#EAB308',
  },
  {
    id: 'loc-4',
    title: "Friend's Place",
    address: 'RS Puram, Coimbatore,\nTamil Nadu - 641002',
    type: 'friends',
    bgColor: '#F3E8FF',
    iconColor: '#9333EA',
  },
  {
    id: 'loc-5',
    title: 'Hospital',
    address: 'Ganga Hospital, Peelamedu,\nCoimbatore - 641004',
    type: 'hospital',
    bgColor: '#FEE2E2',
    iconColor: '#EF4444',
  },
  {
    id: 'loc-6',
    title: 'College',
    address: 'Kongu Engineering College,\nPerundurai, Erode - 638060',
    type: 'college',
    bgColor: '#EFF6FF',
    iconColor: '#2563EB',
  },
];

const TYPE_CONFIG: Record<
  SavedLocationType,
  { label: string; bgColor: string; iconColor: string }
> = {
  home: { label: 'Home', bgColor: '#EFF6FF', iconColor: '#2563EB' },
  work: { label: 'Work', bgColor: '#E6FAF7', iconColor: '#00D2B4' },
  parents: { label: 'Parents House', bgColor: '#FEF9C3', iconColor: '#EAB308' },
  friends: { label: "Friend's Place", bgColor: '#F3E8FF', iconColor: '#9333EA' },
  hospital: { label: 'Hospital', bgColor: '#FEE2E2', iconColor: '#EF4444' },
  college: { label: 'College', bgColor: '#EFF6FF', iconColor: '#2563EB' },
  other: { label: 'Other', bgColor: '#F1F5F9', iconColor: '#64748B' },
};

export default function SavedLocationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktopOrTablet =
    windowWidth > 600 ||
    (Platform.OS === 'web' && typeof window !== 'undefined' && window.innerWidth > 600);

  const applySavedPlace = useBookingStore((state) => state.applySavedPlace);

  const [locations, setLocations] = useState<SavedLocationItem[]>(DEFAULT_SAVED_LOCATIONS);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SavedLocationItem | null>(null);
  const [modalType, setModalType] = useState<SavedLocationType>('home');
  const [modalTitle, setModalTitle] = useState('');
  const [modalAddress, setModalAddress] = useState('');

  useEffect(() => {
    loadSavedPlaces();
  }, []);

  const loadSavedPlaces = async () => {
    try {
      const places = await homeApi.getSavedPlaces();
      if (places && places.length > 0) {
        const mapped: SavedLocationItem[] = places.map((p, index) => {
          let detectedType: SavedLocationType = 'other';
          const titleLower = p.title.toLowerCase();
          if (p.type === 'home' || titleLower.includes('home')) detectedType = 'home';
          else if (p.type === 'office' || titleLower.includes('work') || titleLower.includes('office'))
            detectedType = 'work';
          else if (p.type === 'parents' || titleLower.includes('parent')) detectedType = 'parents';
          else if (titleLower.includes('friend')) detectedType = 'friends';
          else if (titleLower.includes('hospital')) detectedType = 'hospital';
          else if (titleLower.includes('college') || titleLower.includes('school'))
            detectedType = 'college';

          const cfg = TYPE_CONFIG[detectedType];
          return {
            id: p.id || `place-${index}`,
            title: p.title,
            address: p.address,
            type: detectedType,
            bgColor: cfg.bgColor,
            iconColor: cfg.iconColor,
          };
        });
        setLocations(mapped);
      }
    } catch {
      // Keep default mock locations if offline / fallback
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(customer)');
    }
  };

  const handleOpenAddModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setEditingItem(null);
    setModalType('home');
    setModalTitle('');
    setModalAddress('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: SavedLocationItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setEditingItem(item);
    setModalType(item.type);
    setModalTitle(item.title);
    setModalAddress(item.address.replace(/\n/g, ', '));
    setIsModalOpen(true);
  };

  const handleDeleteLocation = (item: SavedLocationItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const executeDelete = async () => {
      setLocations((prev) => prev.filter((loc) => loc.id !== item.id));
      try {
        await homeApi.deleteSavedPlace(item.id);
      } catch {
        // Handled locally
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete "${item.title}" from saved locations?`)) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Delete Location',
        `Are you sure you want to delete "${item.title}" from your saved locations?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: executeDelete },
        ]
      );
    }
  };

  const handleSaveModal = async () => {
    if (!modalTitle.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter a location name.');
      } else {
        Alert.alert('Required', 'Please enter a location name.');
      }
      return;
    }

    if (!modalAddress.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter an address.');
      } else {
        Alert.alert('Required', 'Please enter an address.');
      }
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const cfg = TYPE_CONFIG[modalType];

    if (editingItem) {
      // Edit existing
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === editingItem.id
            ? {
                ...loc,
                title: modalTitle.trim(),
                address: modalAddress.trim(),
                type: modalType,
                bgColor: cfg.bgColor,
                iconColor: cfg.iconColor,
              }
            : loc
        )
      );

      try {
        await homeApi.updateSavedPlace(editingItem.id, {
          title: modalTitle.trim(),
          address: modalAddress.trim(),
          type: modalType === 'home' ? 'home' : modalType === 'work' ? 'office' : modalType === 'parents' ? 'parents' : 'other',
        });
      } catch {
        // Fallback local update
      }
    } else {
      // Add new
      const newId = `loc-${Date.now()}`;
      const newLoc: SavedLocationItem = {
        id: newId,
        title: modalTitle.trim(),
        address: modalAddress.trim(),
        type: modalType,
        bgColor: cfg.bgColor,
        iconColor: cfg.iconColor,
      };

      setLocations((prev) => [...prev, newLoc]);

      try {
        await homeApi.addSavedPlace({
          title: modalTitle.trim(),
          address: modalAddress.trim(),
          type: modalType === 'home' ? 'home' : modalType === 'work' ? 'office' : modalType === 'parents' ? 'parents' : 'other',
        });
      } catch {
        // Fallback local addition
      }
    }

    setIsModalOpen(false);
  };

  const renderLocationIcon = (type: SavedLocationType, iconColor: string) => {
    switch (type) {
      case 'home':
        return <Home size={20} color={iconColor} strokeWidth={2.2} />;
      case 'work':
        return <Briefcase size={20} color={iconColor} strokeWidth={2.2} />;
      case 'parents':
        return <Star size={20} color={iconColor} fill={iconColor} strokeWidth={1} />;
      case 'friends':
        return <MapPin size={20} color={iconColor} strokeWidth={2.2} />;
      case 'hospital':
        return <Cross size={20} color={iconColor} strokeWidth={2.6} />;
      case 'college':
        return <GraduationCap size={20} color={iconColor} strokeWidth={2.2} />;
      default:
        return <MapPin size={20} color={iconColor} strokeWidth={2.2} />;
    }
  };

  const renderLocationCards = () => (
    <View style={styles.listContainer}>
      {locations.map((item) => (
        <View key={item.id} style={styles.card}>
          {/* Left Icon with tinted background circle */}
          <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
            {renderLocationIcon(item.type, item.iconColor)}
          </View>

          {/* Location Title & Multi-line Address */}
          <View style={styles.detailsCol}>
            <Text style={styles.locationTitle}>{item.title}</Text>
            <Text style={styles.locationAddress} numberOfLines={2}>
              {item.address}
            </Text>
          </View>

          {/* Action Buttons: Edit & Delete */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={() => handleOpenEditModal(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={`Edit ${item.title}`}
            >
              <Pencil size={18} color="#0E1E38" strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.7}
              onPress={() => handleDeleteLocation(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={`Delete ${item.title}`}
            >
              <Trash2 size={18} color="#EF4444" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {locations.length === 0 && (
        <View style={styles.emptyContainer}>
          <MapPin size={40} color="#94A3B8" strokeWidth={1.8} />
          <Text style={styles.emptyTitle}>No saved locations yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your favorite destinations to quickly book drivers.
          </Text>
        </View>
      )}
    </View>
  );

  const renderAddButton = () => (
    <TouchableOpacity
      style={styles.addButton}
      activeOpacity={0.85}
      onPress={handleOpenAddModal}
      accessibilityLabel="Add New Location"
    >
      <View style={styles.addIconCircle}>
        <Plus size={16} color="#FFFFFF" strokeWidth={3} />
      </View>
      <Text style={styles.addButtonText}>Add New Location</Text>
    </TouchableOpacity>
  );

  const renderModal = () => (
    <Modal
      visible={isModalOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsModalOpen(false)}
    >
      <Pressable style={styles.modalBackdrop} onPress={() => setIsModalOpen(false)}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalHeaderTitle}>
              {editingItem ? 'Edit Location' : 'Add New Location'}
            </Text>
            <TouchableOpacity
              onPress={() => setIsModalOpen(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color="#64748B" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Location Category Selection */}
          <Text style={styles.inputLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {(Object.keys(TYPE_CONFIG) as SavedLocationType[]).map((typeKey) => {
              const isSelected = modalType === typeKey;
              const cfg = TYPE_CONFIG[typeKey];
              return (
                <TouchableOpacity
                  key={typeKey}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setModalType(typeKey);
                    if (!editingItem && !modalTitle) {
                      setModalTitle(cfg.label);
                    }
                  }}
                >
                  <View
                    style={[
                      styles.categoryChipIcon,
                      { backgroundColor: cfg.bgColor },
                    ]}
                  >
                    {renderLocationIcon(typeKey, cfg.iconColor)}
                  </View>
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}
                  >
                    {cfg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Location Name */}
          <Text style={styles.inputLabel}>Location Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={modalTitle}
              onChangeText={setModalTitle}
              placeholder="e.g. Home, Work, Gym, Doctor"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Address */}
          <Text style={styles.inputLabel}>Full Address</Text>
          <View style={[styles.inputContainer, { height: 76, alignItems: 'flex-start', paddingTop: 8 }]}>
            <TextInput
              style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
              value={modalAddress}
              onChangeText={setModalAddress}
              placeholder="Street name, landmark, area, city, pincode"
              placeholderTextColor="#94A3B8"
              multiline
            />
          </View>

          {/* Modal Actions */}
          <View style={styles.modalActionsRow}>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              activeOpacity={0.8}
              onPress={() => setIsModalOpen(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSubmitBtn}
              activeOpacity={0.85}
              onPress={handleSaveModal}
            >
              <Text style={styles.modalSubmitText}>
                {editingItem ? 'Save Changes' : 'Add Location'}
              </Text>
            </TouchableOpacity>
          </View>
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
        <DesktopHeader activeTab="profile" />

        <View style={styles.desktopBodyRow}>
          <DesktopSidebar activeTab="settings" />

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
                  <Text style={styles.desktopBackText}>Back</Text>
                </TouchableOpacity>

                {/* Header Title & Subtitle */}
                <View style={styles.titleSection}>
                  <Text style={styles.pageTitle}>Saved Locations</Text>
                  <Text style={styles.pageSubtitle}>
                    Save your frequent locations for quicker bookings.
                  </Text>
                </View>

                {/* Location Cards */}
                {renderLocationCards()}

                {/* Add New Location Button */}
                {renderAddButton()}
              </View>
            </ScrollView>
          </View>
        </View>

        {renderModal()}
      </View>
    );
  }

  // =========================================================================
  // MOBILE VIEW (Exact Match to Screenshot)
  // =========================================================================
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar style="dark" />

      {/* Top Mobile Bar: Back Button & Centered DriverX Logo */}
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

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.mobileScrollView}
        contentContainerStyle={[styles.mobileScrollContent, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Subtitle */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Saved Locations</Text>
          <Text style={styles.pageSubtitle}>
            Save your frequent locations for quicker bookings.
          </Text>
        </View>

        {/* Saved Location Cards List */}
        {renderLocationCards()}

        {/* Add New Location Button */}
        {renderAddButton()}
      </ScrollView>

      {renderModal()}
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
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
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
  mobileScrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mobileScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  titleSection: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontFamily: FONT.bold,
    color: '#0E1E38',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 13.5,
    fontFamily: FONT.regular,
    color: '#64748B',
    marginTop: 4,
  },
  listContainer: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
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
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCol: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  locationTitle: {
    fontSize: 15.5,
    fontFamily: FONT.bold,
    color: '#0E1E38',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 12.5,
    fontFamily: FONT.regular,
    color: '#64748B',
    lineHeight: 17,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  actionBtn: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDFAF7',
    borderRadius: 14,
    height: 48,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#C7F5EC',
  },
  addIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#00D2B4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 14.5,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
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
    paddingHorizontal: 20,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(14, 30, 56, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 460,
    padding: 22,
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
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontFamily: FONT.bold,
    color: '#0E1E38',
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: FONT.medium,
    color: '#475569',
    marginTop: 10,
    marginBottom: 6,
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  categoryChipSelected: {
    borderColor: '#00D2B4',
    backgroundColor: '#EDFAF7',
  },
  categoryChipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 12.5,
    fontFamily: FONT.medium,
    color: '#64748B',
  },
  categoryChipTextSelected: {
    color: '#0E1E38',
    fontFamily: FONT.bold,
  },
  inputContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: '#0E1E38',
    padding: 0,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: '#64748B',
  },
  modalSubmitBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#00D2B4',
  },
  modalSubmitText: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: '#072038',
  },

  // Desktop Layout
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
    paddingHorizontal: 32,
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
