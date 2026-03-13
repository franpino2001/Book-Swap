import { supabase } from '@/lib/supabase';
import { distanceKm, DEFAULT_RADIUS_KM } from '@/lib/location';
import type { SwipeDirection } from '@/types/database';

export interface NearbyUserBook {
  id: string;
  user_id: string;
  book_id: string;
  condition: string;
  status: string;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  book: {
    id: string;
    title: string;
    author: string;
    cover_url: string | null;
    category: string;
    language: string;
  };
  profile: {
    id: string;
    username: string;
    display_name: string | null;
    lat: number | null;
    lng: number | null;
    city: string | null;
  };
}

export async function fetchNearbyBooks(
  userId: string,
  userLat: number | null,
  userLng: number | null,
  radiusKm: number = DEFAULT_RADIUS_KM,
  limit: number = 50
): Promise<NearbyUserBook[]> {
  const { data: swipedIds } = await supabase
    .from('swipes')
    .select('target_user_book_id')
    .eq('swiper_user_id', userId);

  const excludedIds = new Set((swipedIds ?? []).map((s) => s.target_user_book_id));

  const { data, error } = await supabase
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
    .neq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit * 3);


  if (error) throw error;

  let results = ((data ?? []) as unknown as NearbyUserBook[]).filter((ub) => !excludedIds.has(ub.id));

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

export async function swipe(
  swiperUserId: string,
  targetUserBookId: string,
  direction: SwipeDirection
): Promise<{ matched: boolean; matchId?: string }> {
  const { error } = await supabase.from('swipes').insert({
    swiper_user_id: swiperUserId,
    target_user_book_id: targetUserBookId,
    direction,
  });

  if (error) throw error;

  if (direction !== 'right') {
    return { matched: false };
  }

  const { data: targetUb } = await supabase
    .from('user_books')
    .select('user_id')
    .eq('id', targetUserBookId)
    .single();

  if (!targetUb) return { matched: false };

  const targetOwnerId = targetUb.user_id;

  const { data: swiperBooks } = await supabase
    .from('user_books')
    .select('id')
    .eq('user_id', swiperUserId)
    .eq('status', 'available');

  const swiperBookIds = (swiperBooks ?? []).map((b) => b.id);

  if (swiperBookIds.length === 0) return { matched: false };

  const { data: reciprocalSwipes } = await supabase
    .from('swipes')
    .select('target_user_book_id')
    .eq('swiper_user_id', targetOwnerId)
    .eq('direction', 'right')
    .in('target_user_book_id', swiperBookIds)
    .limit(1);

  if (!reciprocalSwipes || reciprocalSwipes.length === 0) {
    return { matched: false };
  }

  const userAId = swiperUserId < targetOwnerId ? swiperUserId : targetOwnerId;
  const userBId = swiperUserId < targetOwnerId ? targetOwnerId : swiperUserId;

  const { data: existingMatch } = await supabase
    .from('matches')
    .select('id')
    .eq('user_a_id', userAId)
    .eq('user_b_id', userBId)
    .single();

  if (existingMatch) {
    return { matched: true, matchId: existingMatch.id };
  }

  const userABookId =
    userAId === swiperUserId ? reciprocalSwipes[0].target_user_book_id : targetUserBookId;
  const userBBookId =
    userBId === swiperUserId ? targetUserBookId : reciprocalSwipes[0].target_user_book_id;

  const { data: newMatch, error: matchError } = await supabase
    .from('matches')
    .insert({
      user_a_id: userAId,
      user_b_id: userBId,
      user_a_book_id: userABookId,
      user_b_book_id: userBBookId,
    })
    .select('id')
    .single();

  if (matchError) throw matchError;

  return { matched: true, matchId: newMatch?.id };
}
