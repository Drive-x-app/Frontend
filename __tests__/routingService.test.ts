import {
  formatRouteDistance,
  formatRouteDuration,
  getDrivingRoute,
} from '../src/services/location/routingService';

describe('routingService', () => {
  describe('formatRouteDistance', () => {
    it('formats distances under 1000 meters in meters', () => {
      expect(formatRouteDistance(450)).toBe('450 m');
      expect(formatRouteDistance(0)).toBe('0 m');
      expect(formatRouteDistance(999)).toBe('999 m');
    });

    it('formats distances between 1 km and 10 km with one decimal place', () => {
      expect(formatRouteDistance(2450)).toBe('2.5 km');
      expect(formatRouteDistance(1000)).toBe('1.0 km');
      expect(formatRouteDistance(9840)).toBe('9.8 km');
    });

    it('formats distances 10 km and above rounded to nearest whole kilometer', () => {
      expect(formatRouteDistance(12400)).toBe('12 km');
      expect(formatRouteDistance(25800)).toBe('26 km');
    });
  });

  describe('formatRouteDuration', () => {
    it('formats durations under 60 seconds as < 1 min', () => {
      expect(formatRouteDuration(30)).toBe('< 1 min');
      expect(formatRouteDuration(0)).toBe('< 1 min');
    });

    it('formats durations under 60 minutes in minutes', () => {
      expect(formatRouteDuration(60)).toBe('1 min');
      expect(formatRouteDuration(180)).toBe('3 mins');
      expect(formatRouteDuration(1500)).toBe('25 mins');
    });

    it('formats durations 60 minutes and above in hours and minutes', () => {
      expect(formatRouteDuration(3600)).toBe('1 hr');
      expect(formatRouteDuration(7200)).toBe('2 hrs');
      expect(formatRouteDuration(4500)).toBe('1 hr 15 mins');
      expect(formatRouteDuration(7320)).toBe('2 hrs 2 mins');
    });
  });

  describe('getDrivingRoute', () => {
    const originalFetch = (globalThis as any).fetch;

    afterEach(() => {
      (globalThis as any).fetch = originalFetch;
      jest.restoreAllMocks();
    });

    it('returns error when coordinates are invalid or missing', async () => {
      const result = await getDrivingRoute(
        { latitude: NaN, longitude: 76.9558 },
        { latitude: 11.0018, longitude: 76.9634 }
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('INVALID_COORDINATES');
      }
    });

    it('successfully parses OSRM route response into route coordinates and metrics', async () => {
      const mockOsrmResponse = {
        code: 'Ok',
        routes: [
          {
            distance: 2459.7,
            duration: 168.3,
            geometry: {
              type: 'LineString',
              coordinates: [
                [76.9558, 11.0168],
                [76.9582, 11.0094],
                [76.9634, 11.0018],
              ],
            },
          },
        ],
      };

      (globalThis as any).fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockOsrmResponse,
      });

      const result = await getDrivingRoute(
        { latitude: 11.0168, longitude: 76.9558 },
        { latitude: 11.0018, longitude: 76.9634 }
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.distanceMeters).toBe(2459.7);
        expect(result.durationSeconds).toBe(168.3);
        expect(result.distanceKm).toBe(2.46);
        expect(result.formattedDistance).toBe('2.5 km');
        expect(result.formattedDuration).toBe('3 mins');
        expect(result.coordinates).toHaveLength(3);
        expect(result.coordinates[0]).toEqual({ latitude: 11.0168, longitude: 76.9558 });
        expect(result.coordinates[2]).toEqual({ latitude: 11.0018, longitude: 76.9634 });
      }
    });

    it('returns NO_ROUTE error when OSRM returns non-Ok code', async () => {
      (globalThis as any).fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ code: 'NoRoute', routes: [] }),
      });

      const result = await getDrivingRoute(
        { latitude: 11.0168, longitude: 76.9558 },
        { latitude: 11.0018, longitude: 76.9634 }
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('NO_ROUTE');
      }
    });

    it('returns NETWORK_ERROR when fetch fails', async () => {
      (globalThis as any).fetch = jest.fn().mockRejectedValue(new Error('Connection timed out'));

      const result = await getDrivingRoute(
        { latitude: 11.0168, longitude: 76.9558 },
        { latitude: 11.0018, longitude: 76.9634 }
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('NETWORK_ERROR');
      }
    });
  });
});
