-- BookSwap initial schema
-- Run this in Supabase SQL Editor or via `supabase db push`

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE book_condition AS ENUM ('new', 'good', 'fair', 'poor');
CREATE TYPE book_status AS ENUM ('available', 'reserved', 'traded');
CREATE TYPE swipe_direction AS ENUM ('left', 'right');

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  city TEXT,
  country TEXT NOT NULL DEFAULT 'Unknown',
  lat NUMERIC,
  lng NUMERIC,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Books (generic book entities, shared across users)
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  cover_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User books (a user's copy of a book)
CREATE TABLE user_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  condition book_condition NOT NULL DEFAULT 'good',
  status book_status NOT NULL DEFAULT 'available',
  notes TEXT,
  city TEXT,
  country TEXT,
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_books_user_id ON user_books(user_id);
CREATE INDEX idx_user_books_status ON user_books(status);
CREATE INDEX idx_user_books_location ON user_books(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Swipes (interest between user and another user's book)
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  swiper_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_book_id UUID NOT NULL REFERENCES user_books(id) ON DELETE CASCADE,
  direction swipe_direction NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(swiper_user_id, target_user_book_id)
);

CREATE INDEX idx_swipes_swiper ON swipes(swiper_user_id);
CREATE INDEX idx_swipes_target ON swipes(target_user_book_id);

-- Matches (successful mutual interest)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_a_book_id UUID REFERENCES user_books(id) ON DELETE SET NULL,
  user_b_book_id UUID REFERENCES user_books(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (user_a_id < user_b_id)
);

CREATE UNIQUE INDEX idx_matches_users ON matches(user_a_id, user_b_id);
CREATE INDEX idx_matches_user_a ON matches(user_a_id);
CREATE INDEX idx_matches_user_b ON matches(user_b_id);

-- Messages (chat between matched users)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_match ON messages(match_id);

-- Storage: Create 'book-covers' bucket via Supabase Dashboard (Storage > New bucket)
-- Make it public. Then add policies in Dashboard or run:
-- CREATE POLICY "Authenticated upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'book-covers');
-- CREATE POLICY "Public read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'book-covers');
