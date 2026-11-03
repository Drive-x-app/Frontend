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
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, Home, Briefcase, Star, MapPin, Cross, GraduationCap, Pencil, Trash2, Plus, X, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { homeApi } from '../../src/services/api/homeApi';
import { useAuthStore } from '../../src/store/authStore';
import { useBookingStore } from '../../src/store/bookingStore';
import { DesktopHeader } from '../../src/components/common/DesktopHeader';
import { DesktopSidebar } from '../../src/components/common/DesktopSidebar';
import { isCustomerDesktop } from '../../src/theme/layout';
import { FONT } from '../../src/theme/typography';

export type SavedLocationType = 'home' | 'work' | 'parents' | 'friends' | 'hospital' | 'college' | 'other';

export interface SavedLocationItem {
  id: string;
  title: string;
  address: string;
  type: SavedLocationType;
  bgColor: string;
  iconColor: string;
}

const TYPE_CONFIG: Record<SavedLocationType, { label: string; bgColor: string; iconColor: string }> = {
  home: { label: 'Home', bgColor: '#EFF6FF', iconColor: '#2563EB' },
  work: { label: 'Work', bgColor: '#E6FAF7', iconColor: '#00D2B4' },
  parents: { label: 'Parents House', bgColor: '#FEF9C3', iconColor: '#EAB308' },
  friends: {
    label: "Friend's Place",
    bgColor: '#F3E8FF',
    iconColor: '#9333EA',
  },
  hospital: { label: 'Hospital', bgColor: '#FEE2E2', iconColor: '#EF4444' },
  college: { label: 'College', bgColor: '#EFF6FF', iconColor: '#2563EB' },
  other: { label: 'Other', bgColor: '#F1F5F9', iconColor: '#64748B' },
};

export default function SavedLocationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const isDesktopOrTablet = isCustomerDesktop(windowWidth);

  const applySavedPlace = useBookingStore((state) => state.applySavedPlace);
  const setBookingSavedPlaces = useBookingStore((state) => state.setSavedPlaces);
  const accountPhoneNumber = useAuthStore((state) => state.user?.phoneNumber);

  const [locations, setLocations] = useState<SavedLocationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SavedLocationItem | null>(null);
  const [modalType, setModalType] = useState<SavedLocationType>('home');
  const [modalTitle, setModalTitle] = useState('');
  const [modalAddress, setModalAddress] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    void loadSavedPlaces();
  }, [accountPhoneNumber]);

  const loadSavedPlaces = async () => {
    if (!accountPhoneNumber) {
      setLocations([]);
      setBookingSavedPlaces([]);
      setIsLoading(false);
      setActionError('Please sign in to view your saved locations.');
      return;
    }

    setIsLoading(true);
    setLocations([]);
    setBookingSavedPlaces([]);
    setActionError(null);
    try {
      const places = await homeApi.getSavedPlaces(accountPhoneNumber);
      setBookingSavedPlaces(
        places.map(({ id, title, address, type }) => ({
          id,
          title,
          address,
          type,
        })),
      );
      setLocations(
        places.map((place) => {
          let type: SavedLocationType = 'other';
          const title = place.title.toLowerCase();
          if (place.type === 'home' || title.includes('home')) type = 'home';
          else if (place.type === 'office' || title.includes('work') || title.includes('office')) type = 'work';
          else if (place.type === 'parents' || title.includes('parent')) type = 'parents';
          else if (title.includes('friend')) type = 'friends';
          else if (title.includes('hospital')) type = 'hospital';
          else if (title.includes('college') || title.includes('school')) type = 'college';

          const config = TYPE_CONFIG[type];
          return {
            id: place.id,
            title: place.title,
            address: place.address,
            type,
            bgColor: config.bgColor,
            iconColor: config.iconColor,
          };
        }),
      );
    } catch (error) {
      setLocations([]);
      setBookingSavedPlaces([]);
      setActionError(error instanceof Error ? `Unable to load saved locations: ${error.message}` : 'Unable to load saved locations.');
    } finally {
      setIsLoading(false);
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
    setActionError(null);
    setValidationError(null);
    setEditingItem(null);
    setModalType('home');
    setModalTitle('');
    setModalAddress('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: SavedLocationItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setActionError(null);
    setValidationError(null);
    setEditingItem(item);
    setModalType(item.type);
    setModalTitle(item.title);
    setModalAddress(item.address.replace(/\n/g, ', '));
    setIsModalOpen(true);
  };

  const handleDeleteLocation = async (item: SavedLocationItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (!accountPhoneNumber) {
      setActionError('Please sign in to delete saved locations.');
      return;
    }

    try {
      await homeApi.deleteSavedPlace(item.id, accountPhoneNumber);
      setLocations((previous) => previous.filter((location) => location.id !== item.id));
      setBookingSavedPlaces((places) => places.filter((place) => place.id !== item.id));
      setActionError(null);
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : `Unable to delete "${item.title}".`);
    }
  };

  const handleSaveModal = async () => {
    if (!modalTitle.trim()) {
      setValidationError('Please enter a location name.');
      return;
    }

    if (!modalAddress.trim()) {
      setValidationError('Please enter an address.');
      return;
    }

    setValidationError(null);
    setActionError(null);
    if (!accountPhoneNumber) {
      setActionError('Please sign in to save locations.');
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const cfg = TYPE_CONFIG[modalType];
    const savedPlaceType = modalType === 'home' ? 'home' : modalType === 'work' ? 'office' : modalType === 'parents' ? 'parents' : 'other';

    try {
      if (editingItem) {
        const updated = await homeApi.updateSavedPlace(editingItem.id, accountPhoneNumber, {
          title: modalTitle.trim(),
          address: modalAddress.trim(),
          type: savedPlaceType,
        });
        setBookingSavedPlaces((places) =>
          places.map((place) =>
            place.id === updated.id
              ? {
                  id: updated.id,
                  title: updated.title,
                  address: updated.address,
                  type: updated.type,
                }
              : place,
          ),
        );
        setLocations((previous) =>
          previous.map((location) =>
            location.id === editingItem.id
              ? {
                  ...location,
                  title: modalTitle.trim(),
                  address: modalAddress.trim(),
                  type: modalType,
                  bgColor: cfg.bgColor,
                  iconColor: cfg.iconColor,
                }
              : location,
          ),
        );
      } else {
        const created = await homeApi.addSavedPlace({
          phoneNumber: accountPhoneNumber,
          title: modalTitle.trim(),
          address: modalAddress.trim(),
          type: savedPlaceType,
        });
        setBookingSavedPlaces((places) => [
          ...places,
          {
            id: created.id,
            title: created.title,
            address: created.address,
            type: created.type,
          },
        ]);
        setLocations((previous) => [
          ...previous,
          {
            id: created.id,
            title: created.title,
            address: created.address,
            type: modalType,
            bgColor: cfg.bgColor,
            iconColor: cfg.iconColor,
          },
        ]);
      }

      setIsModalOpen(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to save this location to your account.');
    } finally {
      setIsSaving(false);
    }
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
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color="#00D2B4" />
          <Text style={styles.emptySubtitle}>Loading your saved locations...</Text>
        </View>
      ) : null}
      {!isLoading &&
        locations.map((item) => (
          <View key={item.id} style={styles.card}>
            {/* Left Icon with tinted background circle */}
            <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>{renderLocationIcon(item.type, item.iconColor)}</View>

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

      {!isLoading && locations.length === 0 && (
        <View style={styles.emptyContainer}>
          <MapPin size={40} color="#94A3B8" strokeWidth={1.8} />
          <Text style={styles.emptyTitle}>No saved locations yet</Text>
          <Text style={styles.emptySubtitle}>Add your favorite destinations to quickly book drivers.</Text>
        </View>
      )}
    </View>
  );

  const renderAddButton = () => (
    <TouchableOpacity style={styles.addButton} activeOpacity={0.85} onPress={handleOpenAddModal} accessibilityLabel="Add New Location">
      <View style={styles.addIconCircle}>
        <Plus size={16} color="#FFFFFF" strokeWidth={3} />
      </View>
      <Text style={styles.addButtonText}>Add New Location</Text>
    </TouchableOpacity>
  );

  const renderModal = () => (
    <Modal visible={isModalOpen} transparent={true} animationType="fade" onRequestClose={() => setIsModalOpen(false)}>
      <Pressable style={styles.modalBackdrop} onPress={() => setIsModalOpen(false)}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalHeaderTitle}>{editingItem ? 'Edit Location' : 'Add New Location'}</Text>
            <TouchableOpacity onPress={() => setIsModalOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color="#64748B" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {/* Location Category Selection */}
          <Text style={styles.inputLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {(Object.keys(TYPE_CONFIG) as SavedLocationType[]).map((typeKey) => {
              const isSelected = modalType === typeKey;
              const cfg = TYPE_CONFIG[typeKey];
              return (
                <TouchableOpacity
                  key={typeKey}
                  style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setModalType(typeKey);
                    if (!editingItem && !modalTitle) {
                      setModalTitle(cfg.label);
                    }
                  }}
                >
                  <View style={[styles.categoryChipIcon, { backgroundColor: cfg.bgColor }]}>{renderLocationIcon(typeKey, cfg.iconColor)}</View>
                  <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>{cfg.label}</Text>
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
              style={[
                styles.textInput,
                { height: 60, textAlignVertical: 'top', overflow: 'hidden' },
              ]}
              value={modalAddress}
              onChangeText={setModalAddress}
              placeholder="Street name, landmark, area, city, pincode"
              placeholderTextColor="#94A3B8"
              multiline
            />
          </View>
          {validationError ? <Text style={{ color: '#DC2626', marginTop: 6 }}>{validationError}</Text> : null}
          {actionError ? <Text style={{ color: '#DC2626', marginTop: 6 }}>{actionError}</Text> : null}

          {/* Modal Actions */}
          <View style={styles.modalActionsRow}>
            <TouchableOpacity style={styles.modalCancelBtn} activeOpacity={0.8} onPress={() => setIsModalOpen(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalSubmitBtn} activeOpacity={0.85} onPress={handleSaveModal} disabled={isSaving}>
              <Text style={styles.modalSubmitText}>{isSaving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Location'}</Text>
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
            <ScrollView style={styles.desktopScroll} contentContainerStyle={styles.desktopScrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.desktopMainCard}>
                {/* Back button row */}
                <TouchableOpacity style={styles.desktopBackRow} activeOpacity={0.8} onPress={handleBack}>
                  <ArrowLeft size={18} color="#0E1E38" strokeWidth={2.4} />
                  <Text style={styles.desktopBackText}>Back</Text>
                </TouchableOpacity>

                {/* Header Title & Subtitle */}
                <View style={styles.titleSection}>
                  <Text style={styles.pageTitle}>Saved Locations</Text>
                  <Text style={styles.pageSubtitle}>Save your frequent locations for quicker bookings.</Text>
                </View>
                {actionError ? <Text style={{ color: '#DC2626', marginBottom: 12 }}>{actionError}</Text> : null}

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
        <TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={handleBack} accessibilityLabel="Go back">
          <ArrowLeft size={22} color="#0E1E38" strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.brandCenter}>
          <Image source={require('../../assets/DriveX_Logo.png')} style={styles.logoEmblem} resizeMode="contain" />
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
          <Text style={styles.pageSubtitle}>Save your frequent locations for quicker bookings.</Text>
        </View>
        {actionError ? <Text style={{ color: '#DC2626', marginBottom: 12 }}>{actionError}</Text> : null}

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
