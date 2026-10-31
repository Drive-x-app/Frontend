import * as Location from 'expo-location';
import {
  getCurrentLocation,
  checkLocationPermission,
  formatGeocodedAddress,
  reverseGeocodeLocation,
  searchPlaces,
} from '../src/services/location/locationService';

// Mock expo-location module
jest.mock('expo-location', () => ({
  hasServicesEnabledAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
  Accuracy: {
    Balanced: 3,
  },
}));

describe('locationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentLocation', () => {
    it('returns SERVICES_DISABLED when location services are turned off on device', async () => {
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(false);

      const result = await getCurrentLocation();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('SERVICES_DISABLED');
        expect(result.message).toContain('Location services are disabled');
      }
    });

    it('returns PERMISSION_DENIED when permission is rejected and cannot ask again', async () => {
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(true);
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
        canAskAgain: false,
      });

      const result = await getCurrentLocation();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('PERMISSION_DENIED');
        expect(result.message).toContain('permission was denied');
      }
      expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    });

    it('requests permission if not granted but canAskAgain is true', async () => {
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(true);
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.UNDETERMINED,
        canAskAgain: true,
      });
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
        coords: {
          latitude: 11.0168,
          longitude: 76.9558,
          altitude: 0,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });

      const result = await getCurrentLocation();

      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.coords.latitude).toBe(11.0168);
        expect(result.coords.longitude).toBe(76.9558);
      }
    });

    it('returns valid coordinates when permission is already granted', async () => {
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(true);
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
        canAskAgain: true,
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
        coords: {
          latitude: 11.0168,
          longitude: 76.9558,
        },
      });

      const result = await getCurrentLocation();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.coords.latitude).toBe(11.0168);
        expect(result.coords.longitude).toBe(76.9558);
      }
    });
  });

  describe('formatGeocodedAddress', () => {
    it('formats a complete placemark into a clean readable string', () => {
      const mockAddress: any = {
        name: 'Brookefields Mall',
        streetNumber: '67',
        street: 'Dr Krishnasamy Rd',
        district: 'RS Puram',
        city: 'Coimbatore',
        postalCode: '641001',
      };

      const formatted = formatGeocodedAddress(mockAddress);
      expect(formatted).toBe('67 Dr Krishnasamy Rd, RS Puram, Coimbatore, 641001');
    });

    it('uses placemark name when street number and street are absent', () => {
      const mockAddress: any = {
        name: 'Coimbatore Railway Station',
        streetNumber: null,
        street: null,
        district: 'Gopalapuram',
        city: 'Coimbatore',
        postalCode: '641018',
      };

      const formatted = formatGeocodedAddress(mockAddress);
      expect(formatted).toBe('Coimbatore Railway Station, Gopalapuram, Coimbatore, 641018');
    });

    it('returns fallback string when address fields are empty', () => {
      const mockAddress: any = {
        name: null,
        streetNumber: null,
        street: null,
        district: null,
        city: null,
        postalCode: null,
      };

      const formatted = formatGeocodedAddress(mockAddress);
      expect(formatted).toBe('Selected location (address unavailable)');
    });
  });

  describe('reverseGeocodeLocation', () => {
    it('returns formatted address on successful reverse geocode', async () => {
      (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
        {
          name: 'VOC Park',
          streetNumber: '12',
          street: 'Park Gate Rd',
          district: 'Gandhipuram',
          city: 'Coimbatore',
          postalCode: '641012',
        },
      ]);

      const result = await reverseGeocodeLocation({
        latitude: 11.0168,
        longitude: 76.9558,
      });

      expect(result.success).toBe(true);
      expect(result.address).toBe('12 Park Gate Rd, Gandhipuram, Coimbatore, 641012');
    });

    it('returns safe fallback when reverse geocoding returns empty array', async () => {
      (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([]);

      const result = await reverseGeocodeLocation({
        latitude: 11.0168,
        longitude: 76.9558,
      });

      expect(result.success).toBe(false);
      expect(result.address).toBe('Selected location (address unavailable)');
    });

    it('returns safe fallback when reverse geocoding throws an error', async () => {
      (Location.reverseGeocodeAsync as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await reverseGeocodeLocation({
        latitude: 11.0168,
        longitude: 76.9558,
      });

      expect(result.success).toBe(false);
      expect(result.address).toBe('Selected location (address unavailable)');
    });
  });

  describe('searchPlaces', () => {
    const originalFetch = (globalThis as any).fetch;

    afterEach(() => {
      (globalThis as any).fetch = originalFetch;
      jest.restoreAllMocks();
    });

    it('returns empty array immediately for query shorter than 3 characters', async () => {
      const mockFetch = jest.fn();
      (globalThis as any).fetch = mockFetch;

      const result = await searchPlaces('ab');
      expect(result).toEqual([]);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('parses valid GeoJSON suggestions from Photon response', async () => {
      const mockResponse = {
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [76.9582, 11.0094], // [lon, lat]
            },
            properties: {
              osm_id: 123456,
              osm_type: 'W',
              name: 'Brookefields Mall',
              street: 'Dr. Krishnasamy Mudaliar Road',
              city: 'Coimbatore',
              state: 'Tamil Nadu',
              country: 'India',
              postcode: '641001',
            },
          },
        ],
      };

      (globalThis as any).fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const results = await searchPlaces('Brookefields', {
        proximity: { latitude: 11.0168, longitude: 76.9558 },
      });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('W-123456');
      expect(results[0].primaryText).toBe('Brookefields Mall');
      expect(results[0].coords.latitude).toBe(11.0094);
      expect(results[0].coords.longitude).toBe(76.9582);
      expect(results[0].fullAddress).toContain('Brookefields Mall');
      expect(results[0].fullAddress).toContain('Coimbatore');
    });

    it('filters out features with invalid or missing coordinates', async () => {
      const mockResponse = {
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: ['invalid', 11.0094],
            },
            properties: { name: 'Invalid Coords Location' },
          },
          {
            type: 'Feature',
            geometry: null,
            properties: { name: 'No Geometry Location' },
          },
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [76.96, 11.0],
            },
            properties: { name: 'Valid Location', city: 'Coimbatore' },
          },
        ],
      };

      (globalThis as any).fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const results = await searchPlaces('Test Location');
      expect(results).toHaveLength(1);
      expect(results[0].primaryText).toBe('Valid Location');
      expect(results[0].coords.latitude).toBe(11.0);
      expect(results[0].coords.longitude).toBe(76.96);
    });

    it('returns empty array safely when fetch fails or throws an exception', async () => {
      (globalThis as any).fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

      const results = await searchPlaces('Gandhipuram');
      expect(results).toEqual([]);
    });
  });
});

