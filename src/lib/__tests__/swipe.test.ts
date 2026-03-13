/**
 * Tests for swipe-related filtering logic extracted from fetchNearbyBooks.
 * Supabase calls are mocked — only the pure filtering/sorting logic is tested.
 */
import { distanceKm, DEFAULT_RADIUS_KM } from '../location';
import type { NearbyUserBook } from '../api/swipe';

function makeBook(overrides: Partial<NearbyUserBook> = {}): NearbyUserBook {
  return {
    id: 'book-1',
    user_id: 'user-2',
    book_id: 'b-1',
    condition: 'good',
    status: 'available',
    city: null,
    country: null,
    lat: null,
    lng: null,
    created_at: new Date().toISOString(),
    book: {
      id: 'b-1',
      title: 'Test Book',
      author: 'Author',
      cover_url: null,
      category: 'fiction',
      language: 'en',
    },
    profile: {
      id: 'user-2',
      username: 'user2',
      display_name: null,
      lat: null,
      lng: null,
      city: null,
    },
    ...overrides,
  };
}

// Mirrors the filtering logic in fetchNearbyBooks
function filterByRadius(
  books: NearbyUserBook[],
  userLat: number,
  userLng: number,
  radiusKm: number
): NearbyUserBook[] {
  return books.filter((ub) => {
    if (ub.lat != null && ub.lng != null) {
      return distanceKm(userLat, userLng, ub.lat, ub.lng) <= radiusKm;
    }
    return true; // no location = always include
  });
}

function sortByDistance(
  books: NearbyUserBook[],
  userLat: number,
  userLng: number
): NearbyUserBook[] {
  return [...books].sort((a, b) => {
    const distA =
      a.lat != null && a.lng != null ? distanceKm(userLat, userLng, a.lat, a.lng) : Infinity;
    const distB =
      b.lat != null && b.lng != null ? distanceKm(userLat, userLng, b.lat, b.lng) : Infinity;
    return distA - distB;
  });
}

describe('nearby books radius filtering', () => {
  const userLat = 40.7128;
  const userLng = -74.006; // NYC

  it('includes books with no location', () => {
    const books = [makeBook({ id: 'b1', lat: null, lng: null })];
    expect(filterByRadius(books, userLat, userLng, 50)).toHaveLength(1);
  });

  it('includes books within radius', () => {
    // ~5km from NYC
    const books = [makeBook({ id: 'b1', lat: 40.758, lng: -73.985 })];
    expect(filterByRadius(books, userLat, userLng, 50)).toHaveLength(1);
  });

  it('excludes books outside radius', () => {
    // LA is ~3940km from NYC
    const books = [makeBook({ id: 'b1', lat: 34.0522, lng: -118.2437 })];
    expect(filterByRadius(books, userLat, userLng, 50)).toHaveLength(0);
  });

  it('filters mixed set correctly', () => {
    const books = [
      makeBook({ id: 'near', lat: 40.758, lng: -73.985 }),   // ~5km
      makeBook({ id: 'far', lat: 34.0522, lng: -118.2437 }), // ~3940km
      makeBook({ id: 'noloc', lat: null, lng: null }),        // no location
    ];
    const result = filterByRadius(books, userLat, userLng, 50);
    expect(result.map((b) => b.id)).toEqual(expect.arrayContaining(['near', 'noloc']));
    expect(result.map((b) => b.id)).not.toContain('far');
  });
});

describe('nearby books distance sorting', () => {
  const userLat = 40.7128;
  const userLng = -74.006; // NYC

  it('sorts closer books first', () => {
    const books = [
      makeBook({ id: 'far', lat: 40.9, lng: -74.2 }),   // further
      makeBook({ id: 'near', lat: 40.72, lng: -74.01 }), // closer
    ];
    const sorted = sortByDistance(books, userLat, userLng);
    expect(sorted[0].id).toBe('near');
    expect(sorted[1].id).toBe('far');
  });

  it('puts books with no location last', () => {
    const books = [
      makeBook({ id: 'noloc', lat: null, lng: null }),
      makeBook({ id: 'near', lat: 40.72, lng: -74.01 }),
    ];
    const sorted = sortByDistance(books, userLat, userLng);
    expect(sorted[0].id).toBe('near');
    expect(sorted[1].id).toBe('noloc');
  });
});

describe('match user ordering', () => {
  // Mirrors the user_a/user_b ordering logic in swipe()
  function orderUsers(swiperUserId: string, targetOwnerId: string) {
    const userAId = swiperUserId < targetOwnerId ? swiperUserId : targetOwnerId;
    const userBId = swiperUserId < targetOwnerId ? targetOwnerId : swiperUserId;
    return { userAId, userBId };
  }

  it('always puts lexicographically smaller id as user_a', () => {
    const { userAId, userBId } = orderUsers('user-b', 'user-a');
    expect(userAId).toBe('user-a');
    expect(userBId).toBe('user-b');
  });

  it('is consistent regardless of swipe direction', () => {
    const r1 = orderUsers('user-a', 'user-b');
    const r2 = orderUsers('user-b', 'user-a');
    expect(r1.userAId).toBe(r2.userAId);
    expect(r1.userBId).toBe(r2.userBId);
  });
});
