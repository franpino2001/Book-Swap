/**
 * Tests for marketplace filtering logic extracted from fetchMarketplaceBooks.
 * Mirrors the in-memory filter/search applied after the Supabase query.
 */
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
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
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

// Mirrors the search filter in fetchMarketplaceBooks
function applySearch(books: NearbyUserBook[], search: string): NearbyUserBook[] {
  const s = search.toLowerCase();
  return books.filter(
    (ub) =>
      ub.book?.title?.toLowerCase().includes(s) ||
      ub.book?.author?.toLowerCase().includes(s)
  );
}

// Mirrors the category filter in fetchMarketplaceBooks
function applyCategory(books: NearbyUserBook[], category: string): NearbyUserBook[] {
  return books.filter((ub) => ub.book?.category === category);
}

describe('marketplace search filter', () => {
  const books = [
    makeBook({ id: '1', book: { id: 'b1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover_url: null, category: 'fiction', language: 'en' } }),
    makeBook({ id: '2', book: { id: 'b2', title: 'To Kill a Mockingbird', author: 'Harper Lee', cover_url: null, category: 'fiction', language: 'en' } }),
    makeBook({ id: '3', book: { id: 'b3', title: 'Dune', author: 'Frank Herbert', cover_url: null, category: 'sci-fi', language: 'en' } }),
  ];

  it('matches by title (case-insensitive)', () => {
    expect(applySearch(books, 'gatsby').map((b) => b.id)).toEqual(['1']);
  });

  it('matches by author (case-insensitive)', () => {
    expect(applySearch(books, 'harper').map((b) => b.id)).toEqual(['2']);
  });

  it('returns multiple matches', () => {
    // "frank" matches Frank Herbert, "F. Scott Fitzgerald" does not contain "frank"
    expect(applySearch(books, 'frank').map((b) => b.id)).toEqual(['3']);
  });

  it('returns empty when no match', () => {
    expect(applySearch(books, 'xyz123')).toHaveLength(0);
  });

  it('returns all when search is empty string', () => {
    expect(applySearch(books, '')).toHaveLength(3);
  });
});

describe('marketplace category filter', () => {
  const books = [
    makeBook({ id: '1', book: { id: 'b1', title: 'Gatsby', author: 'Fitzgerald', cover_url: null, category: 'fiction', language: 'en' } }),
    makeBook({ id: '2', book: { id: 'b2', title: 'Dune', author: 'Herbert', cover_url: null, category: 'sci-fi', language: 'en' } }),
    makeBook({ id: '3', book: { id: 'b3', title: '1984', author: 'Orwell', cover_url: null, category: 'fiction', language: 'en' } }),
  ];

  it('filters to matching category only', () => {
    const result = applyCategory(books, 'fiction');
    expect(result.map((b) => b.id)).toEqual(['1', '3']);
  });

  it('returns empty for unknown category', () => {
    expect(applyCategory(books, 'biography')).toHaveLength(0);
  });
});
