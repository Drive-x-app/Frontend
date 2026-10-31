import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { GeoCoordinates } from '../../types';

export type LocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'SERVICES_DISABLED'
  | 'TIMEOUT'
  | 'UNAVAILABLE'
  | 'UNKNOWN';

export type LocationResult =
  | {
      success: true;
      coords: GeoCoordinates;
    }
  | {
      success: false;
      error: LocationErrorCode;
      message: string;
    };

/**
 * Checks the current foreground location permission status without prompting.
 */
export async function checkLocationPermission(): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> {
  if (Platform.OS === 'web') {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return { granted: false, canAskAgain: false };
    }
    if (typeof navigator.permissions !== 'undefined' && navigator.permissions.query) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        return {
          granted: status.state === 'granted',
          canAskAgain: status.state !== 'denied',
        };
      } catch {
        // Fallback for browsers not supporting permissions.query for geolocation
        return { granted: false, canAskAgain: true };
      }
    }
    return { granted: false, canAskAgain: true };
  }

  try {
    const permission = await Location.getForegroundPermissionsAsync();
    return {
      granted: permission.status === Location.PermissionStatus.GRANTED,
      canAskAgain: permission.canAskAgain,
    };
  } catch {
    return { granted: false, canAskAgain: true };
  }
}

/**
 * Requests foreground location permission from the user.
 */
export async function requestLocationPermission(): Promise<{ granted: boolean }> {
  if (Platform.OS === 'web') {
    // On web, permission is requested upon calling navigator.geolocation.getCurrentPosition
    const status = await checkLocationPermission();
    return { granted: status.granted };
  }

  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    return { granted: permission.status === Location.PermissionStatus.GRANTED };
  } catch {
    return { granted: false };
  }
}

/**
 * Internal web geolocation retriever using browser navigator.geolocation.
 */
function getWebCurrentPosition(timeoutMs = 10000): Promise<LocationResult> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({
        success: false,
        error: 'UNAVAILABLE',
        message: 'Geolocation is not supported by your browser.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
        });
      },
      (error) => {
        let code: LocationErrorCode = 'UNKNOWN';
        let message = 'Failed to retrieve current location.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            code = 'PERMISSION_DENIED';
            message =
              'Location permission was denied. Please allow location access in your browser settings to use your current location.';
            break;
          case error.POSITION_UNAVAILABLE:
            code = 'UNAVAILABLE';
            message =
              'Location information is currently unavailable. Please check your network or device location settings.';
            break;
          case error.TIMEOUT:
            code = 'TIMEOUT';
            message = 'Location request timed out. Please try again.';
            break;
          default:
            message = error.message || message;
        }

        resolve({ success: false, error: code, message });
      },
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 30000,
      }
    );
  });
}

/**
 * Obtains current GPS coordinates on Native (iOS/Android) or Browser (Web).
 *
 * - Checks if device location services are enabled.
 * - Checks & requests foreground permission without looping prompts.
 * - Employs a 10s timeout to prevent UI freezes.
 * - Returns a typed LocationResult containing GeoCoordinates.
 */
export async function getCurrentLocation(timeoutMs = 10000): Promise<LocationResult> {
  // Web Platform Execution
  if (Platform.OS === 'web') {
    return getWebCurrentPosition(timeoutMs);
  }

  // Native Platform Execution (iOS / Android)
  try {
    // 1. Verify device-level location services are turned on
    const isServicesEnabled = await Location.hasServicesEnabledAsync();
    if (!isServicesEnabled) {
      return {
        success: false,
        error: 'SERVICES_DISABLED',
        message:
          'Location services are disabled on your device. Please turn on GPS in your device settings.',
      };
    }

    // 2. Check current foreground permission
    let permission = await Location.getForegroundPermissionsAsync();

    if (permission.status !== Location.PermissionStatus.GRANTED) {
      if (permission.canAskAgain) {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        return {
          success: false,
          error: 'PERMISSION_DENIED',
          message:
            'Location permission was denied. Please enable location access in your device settings to use your current location.',
        };
      }
    }

    // 3. Acquire current position with Balanced accuracy and timeout protection
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const locationPromise = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('LOCATION_TIMEOUT')), timeoutMs);
    });

    try {
      const position = await Promise.race([locationPromise, timeoutPromise]);

      return {
        success: true,
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      };
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  } catch (err: any) {
    if (err?.message === 'LOCATION_TIMEOUT') {
      return {
        success: false,
        error: 'TIMEOUT',
        message: 'Location request timed out while acquiring GPS. Please try again.',
      };
    }

    return {
      success: false,
      error: 'UNKNOWN',
      message: err?.message || 'An unexpected error occurred while obtaining location.',
    };
  }
}

/**
 * Formats a native LocationGeocodedAddress into a clean, human-readable address string.
 */
export function formatGeocodedAddress(address: Location.LocationGeocodedAddress): string {
  const parts: string[] = [];

  // 1. Street or Placemark Name
  const streetPart = [address.streetNumber, address.street].filter(Boolean).join(' ').trim();
  if (streetPart) {
    parts.push(streetPart);
  } else if (address.name && address.name !== address.street && address.name !== address.city) {
    parts.push(address.name);
  }

  // 2. District / Locality / Subregion
  const districtPart = address.district || address.subregion;
  if (districtPart && !parts.some((p) => p.toLowerCase() === districtPart.toLowerCase())) {
    parts.push(districtPart);
  }

  // 3. City
  if (address.city && !parts.some((p) => p.toLowerCase() === address.city!.toLowerCase())) {
    parts.push(address.city);
  }

  // 4. Postal Code
  if (address.postalCode) {
    parts.push(address.postalCode);
  }

  return parts.length > 0 ? parts.join(', ') : 'Selected location (address unavailable)';
}

/**
 * Converts latitude and longitude coordinates into a human-readable address.
 * Uses native expo-location on iOS/Android, and public OpenStreetMap reverse geocoding on Web.
 * Safely falls back to 'Selected location (address unavailable)' on failure without throwing.
 */
export async function reverseGeocodeLocation(
  coords: Pick<GeoCoordinates, 'latitude' | 'longitude'>,
  timeoutMs = 7000
): Promise<{ address: string; success: boolean }> {
  // Web Reverse Geocoding via Nominatim
  if (Platform.OS === 'web') {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      if (controller) {
        timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      }

      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'DriverX-Mobile/1.0',
        },
        signal: controller?.signal,
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const a = data.address;
          const road = a.road || a.pedestrian || a.suburb;
          const district = a.neighbourhood || a.suburb || a.city_district;
          const city = a.city || a.town || a.county || a.state_district;
          const postcode = a.postcode;

          const parts = [road, district, city, postcode].filter(Boolean);
          const formatted = parts.join(', ');
          if (formatted) {
            return { address: formatted, success: true };
          }
        }
        if (data && data.display_name) {
          const shortName = data.display_name.split(',').slice(0, 3).join(',').trim();
          return { address: shortName, success: true };
        }
      }
    } catch {
      // Fallback on web network or CORS error
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    return { address: 'Selected location (address unavailable)', success: false };
  }

  // Native Reverse Geocoding via expo-location (CLGeocoder / Android Geocoder)
  try {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const geocodePromise = Location.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('GEOCODE_TIMEOUT')), timeoutMs);
    });

    try {
      const results = await Promise.race([geocodePromise, timeoutPromise]);

      if (Array.isArray(results) && results.length > 0) {
        const formatted = formatGeocodedAddress(results[0]);
        return { address: formatted, success: true };
      }

      return { address: 'Selected location (address unavailable)', success: false };
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  } catch {
    return { address: 'Selected location (address unavailable)', success: false };
  }
}

export interface LocationSuggestion {
  id: string;
  primaryText: string;
  secondaryText: string;
  fullAddress: string;
  coords: GeoCoordinates;
}

export interface LocationSearchOptions {
  proximity?: { latitude: number; longitude: number };
  limit?: number;
  signal?: AbortSignal;
  timeoutMs?: number;
}

/**
 * Provider-independent place autocomplete / address search.
 * Currently uses the open-source Photon geocoding service (OSM + Elasticsearch)
 * with location biasing toward the user's current city or selected coordinates.
 *
 * Can be easily swapped to a backend Google Places proxy endpoint without
 * changing component callers.
 */
export async function searchPlaces(
  query: string,
  options: LocationSearchOptions = {}
): Promise<LocationSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) {
    return [];
  }

  const {
    proximity = { latitude: 11.0168, longitude: 76.9558 }, // Default to Coimbatore region
    limit = 5,
    signal,
    timeoutMs = 6000,
  } = options;

  let internalTimeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    const encodedQuery = encodeURIComponent(trimmed);
    const url = `https://photon.komoot.io/api/?q=${encodedQuery}&lat=${proximity.latitude}&lon=${proximity.longitude}&limit=${limit}`;

    // Manage internal timeout if no external abort signal is passed
    let effectiveSignal = signal;
    let abortController: AbortController | null = null;

    if (!effectiveSignal && typeof AbortController !== 'undefined') {
      abortController = new AbortController();
      effectiveSignal = abortController.signal;
      internalTimeoutId = setTimeout(() => abortController?.abort(), timeoutMs);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'DriverX-Mobile/1.0',
      },
      signal: effectiveSignal,
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!data || !Array.isArray(data.features)) {
      return [];
    }

    const suggestions: LocationSuggestion[] = [];

    for (const feature of data.features) {
      const geom = feature?.geometry;
      const props = feature?.properties;

      // Validate GeoJSON Point geometry and coordinates [lon, lat]
      if (
        !geom ||
        geom.type !== 'Point' ||
        !Array.isArray(geom.coordinates) ||
        geom.coordinates.length < 2
      ) {
        continue;
      }

      const lon = Number(geom.coordinates[0]);
      const lat = Number(geom.coordinates[1]);

      // Enforce valid coordinate boundaries
      if (
        Number.isNaN(lat) ||
        Number.isNaN(lon) ||
        lat < -90 ||
        lat > 90 ||
        lon < -180 ||
        lon > 180
      ) {
        continue;
      }

      if (!props) continue;

      const primaryText =
        props.name ||
        props.street ||
        props.district ||
        props.city ||
        props.county ||
        'Location';

      const secondaryParts: string[] = [];
      const candidateParts = [
        props.street && props.street !== primaryText ? props.street : null,
        props.district && props.district !== primaryText ? props.district : null,
        props.city && props.city !== primaryText ? props.city : null,
        props.state && props.state !== primaryText ? props.state : null,
        props.country && props.country !== primaryText ? props.country : null,
        props.postcode,
      ].filter(Boolean) as string[];

      for (const part of candidateParts) {
        if (!secondaryParts.some((p) => p.toLowerCase() === part.toLowerCase())) {
          secondaryParts.push(part);
        }
      }

      const secondaryText = secondaryParts.join(', ');
      const fullAddress = secondaryText
        ? `${primaryText}, ${secondaryText}`
        : primaryText;

      const id = `${props.osm_type || 'P'}-${props.osm_id || Math.random().toString(36).substring(2, 9)}`;

      suggestions.push({
        id,
        primaryText,
        secondaryText,
        fullAddress,
        coords: {
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lon.toFixed(6)),
          address: fullAddress,
        },
      });
    }

    return suggestions;
  } catch {
    return [];
  } finally {
    if (internalTimeoutId) {
      clearTimeout(internalTimeoutId);
    }
  }
}

