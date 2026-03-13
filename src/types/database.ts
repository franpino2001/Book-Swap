export type BookCondition = 'new' | 'good' | 'fair' | 'poor';
export type BookStatus = 'available' | 'reserved' | 'traded';
export type SwipeDirection = 'left' | 'right';

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  language: string;
  city: string | null;
  country: string;
  lat: number | null;
  lng: number | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  cover_url: string | null;
  category: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface UserBook {
  id: string;
  user_id: string;
  book_id: string;
  condition: BookCondition;
  status: BookStatus;
  notes: string | null;
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
  book?: Book;
  profile?: Profile;
}

export interface Swipe {
  id: string;
  swiper_user_id: string;
  target_user_book_id: string;
  direction: SwipeDirection;
  created_at: string;
}

export interface Match {
  id: string;
  user_a_id: string;
  user_b_id: string;
  user_a_book_id: string | null;
  user_b_book_id: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  text: string;
  created_at: string;
}
