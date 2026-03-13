import { supabase } from '@/lib/supabase';
import { distanceKm, DEFAULT_RADIUS_KM } from '@/lib/location';
import type { NearbyUserBook } from './swipe';

export interface MarketplaceFilters {
  category?: string;
  condition?: string;
  radiusKm?: number;
  search?: string;
}

export async function fetchMarketplaceBooks(
  userId: string,
  userLat: number | null,
  userLng: number | null,
  filters: MarketplaceFilters = {},
  limit: number = 50
): Promise<NearbyUserBook[]> {
  const radiusKm = filters.radiusKm ?? DEFAULT_RADIUS_KM;

  let query = supabase
    .from('user_books')
    .select(
      `
      id,
      user_id,
      book_id,
      condition,
      status,
      city,
      country,
      lat,
      lng,
      created_at,
      book:books(id, title, author, cover_url, category, language),
      profile:profiles(id, username, display_name, lat, lng, city)
    `
    )
    .eq('status', 'available')
    .neq('user_id', userId);

  if (filters.condition) {
    query = query.eq('condition', filters.condition);
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit * 2);

  if (error) throw error;

  let results = (data ?? []) as unknown as NearbyUserBook[];

  if (filters.category) {
    results = results.filter((ub) => ub.book?.category === filters.category);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    results = results.filter(
      (ub) =>
        ub.book?.title?.toLowerCase().includes(s) ||
        ub.book?.author?.toLowerCase().includes(s)
    );
  }

  if (userLat != null && userLng != null) {
    results = results.filter((ub) => {
      if (ub.lat != null && ub.lng != null) {
        return distanceKm(userLat, userLng, ub.lat, ub.lng) <= radiusKm;
      }
      return true;
    });
    results.sort((a, b) => {
      const distA = a.lat != null && a.lng != null ? distanceKm(userLat, userLng, a.lat, a.lng) : Infinity;
      const distB = b.lat != null && b.lng != null ? distanceKm(userLat, userLng, b.lat, b.lng) : Infinity;
      return distA - distB;
    });
  }

  return results.slice(0, limit);
}
