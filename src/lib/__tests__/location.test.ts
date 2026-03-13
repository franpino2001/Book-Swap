import { distanceKm } from '../location';

describe('distanceKm', () => {
  it('returns 0 for same point', () => {
    expect(distanceKm(40.7128, -74.006, 40.7128, -74.006)).toBeCloseTo(0, 1);
  });

  it('calculates distance between two cities approximately', () => {
    const nyc = { lat: 40.7128, lng: -74.006 };
    const la = { lat: 34.0522, lng: -118.2437 };
    const d = distanceKm(nyc.lat, nyc.lng, la.lat, la.lng);
    expect(d).toBeGreaterThan(3900);
    expect(d).toBeLessThan(4000);
  });

  it('is symmetric', () => {
    const a = { lat: 52.52, lng: 13.405 };
    const b = { lat: 48.8566, lng: 2.3522 };
    expect(distanceKm(a.lat, a.lng, b.lat, b.lng)).toBe(
      distanceKm(b.lat, b.lng, a.lat, a.lng)
    );
  });
});
