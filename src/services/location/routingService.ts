import { GeoCoordinates } from '../../types';

export interface RouteGeometryPoint {
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  success: true;
  coordinates: RouteGeometryPoint[];
  distanceMeters: number;
  durationSeconds: number;
  distanceKm: number;
  formattedDistance: string;
  formattedDuration: string;
}

export interface RouteError {
  success: false;
  code: 'NO_ROUTE' | 'INVALID_COORDINATES' | 'NETWORK_ERROR' | 'TIMEOUT' | 'UNKNOWN';
  message: string;
}

export type RoutingResponse = RouteResult | RouteError;

export interface RoutingOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
}

/**
 * Formats a road distance in meters into a readable string (m or km).
 */
export function formatRouteDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

/**
 * Formats an estimated driving duration in seconds into a clean human-readable string.
 */
export function formatRouteDuration(seconds: number): string {
  if (seconds < 60) {
    return '< 1 min';
  }
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 60) {
    return `${totalMinutes} min${totalMinutes > 1 ? 's' : ''}`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const hourLabel = hours > 1 ? 'hrs' : 'hr';
  if (remainingMinutes === 0) {
    return `${hours} ${hourLabel}`;
  }
  return `${hours} ${hourLabel} ${remainingMinutes} min${remainingMinutes > 1 ? 's' : ''}`;
}

/**
 * Validates coordinate numbers and boundaries.
 */
function isValidCoordinate(coords: GeoCoordinates | null | undefined): boolean {
  if (!coords) return false;
  const lat = Number(coords.latitude);
  const lon = Number(coords.longitude);
  return (
    !Number.isNaN(lat) &&
    !Number.isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Provider-independent driving route calculation between pickup and drop-off points.
 * Currently uses the open-source OSRM driving engine for development.
 *
 * Designed to easily swap to a Google Directions backend proxy for production
 * without modifying UI callers.
 */
export async function getDrivingRoute(
  pickup: GeoCoordinates,
  drop: GeoCoordinates,
  options: RoutingOptions = {}
): Promise<RoutingResponse> {
  if (!isValidCoordinate(pickup) || !isValidCoordinate(drop)) {
    return {
      success: false,
      code: 'INVALID_COORDINATES',
      message: 'Both pickup and drop-off coordinates must be valid numbers.',
    };
  }

  const { timeoutMs = 8000, signal } = options;
  let internalTimeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    // Note: OSRM uses {longitude},{latitude} parameter order
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.longitude},${pickup.latitude};${drop.longitude},${drop.latitude}?overview=full&geometries=geojson`;

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
      return {
        success: false,
        code: 'NETWORK_ERROR',
        message: `Routing server returned status ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !Array.isArray(data.routes) || data.routes.length === 0) {
      return {
        success: false,
        code: 'NO_ROUTE',
        message: 'No driving route found between the selected locations.',
      };
    }

    const route = data.routes[0];
    const rawCoords = route.geometry?.coordinates;

    if (!Array.isArray(rawCoords) || rawCoords.length < 2) {
      return {
        success: false,
        code: 'NO_ROUTE',
        message: 'Routing response contained incomplete route geometry.',
      };
    }

    // Map [longitude, latitude] GeoJSON array to RouteGeometryPoint[]
    const coordinates: RouteGeometryPoint[] = rawCoords.map((c: [number, number]) => ({
      latitude: Number(c[1]),
      longitude: Number(c[0]),
    }));

    const distanceMeters = Number(route.distance);
    const durationSeconds = Number(route.duration);
    const distanceKm = Number((distanceMeters / 1000).toFixed(2));

    return {
      success: true,
      coordinates,
      distanceMeters,
      durationSeconds,
      distanceKm,
      formattedDistance: formatRouteDistance(distanceMeters),
      formattedDuration: formatRouteDuration(durationSeconds),
    };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return {
        success: false,
        code: 'TIMEOUT',
        message: 'Routing request timed out. Please check your network connection.',
      };
    }

    return {
      success: false,
      code: 'NETWORK_ERROR',
      message: err?.message || 'Failed to calculate driving route.',
    };
  } finally {
    if (internalTimeoutId) {
      clearTimeout(internalTimeoutId);
    }
  }
}
