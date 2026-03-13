-- Row Level Security policies for BookSwap

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, users can update own
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Books: anyone can read and insert
CREATE POLICY "Books are viewable by everyone"
ON books FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert books"
ON books FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update books"
ON books FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- User books: users manage own; others can read available
CREATE POLICY "User books: read available or own"
ON user_books FOR SELECT
TO authenticated
USING (
  status = 'available' OR user_id = auth.uid()
);

CREATE POLICY "Users can insert own user_books"
ON user_books FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own user_books"
ON user_books FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own user_books"
ON user_books FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Swipes: users can insert/read own
CREATE POLICY "Users can insert own swipes"
ON swipes FOR INSERT
TO authenticated
WITH CHECK (swiper_user_id = auth.uid());

CREATE POLICY "Users can read own swipes"
ON swipes FOR SELECT
TO authenticated
USING (swiper_user_id = auth.uid());

-- Matches: users can read matches they're part of
CREATE POLICY "Users can read own matches"
ON matches FOR SELECT
TO authenticated
USING (user_a_id = auth.uid() OR user_b_id = auth.uid());

CREATE POLICY "Service role can insert matches"
ON matches FOR INSERT
TO authenticated
WITH CHECK (user_a_id = auth.uid() OR user_b_id = auth.uid());

-- Messages: users can read/write in their matches
CREATE POLICY "Users can read messages in their matches"
ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = match_id
    AND (m.user_a_id = auth.uid() OR m.user_b_id = auth.uid())
  )
);

CREATE POLICY "Users can insert messages in their matches"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = match_id
    AND (m.user_a_id = auth.uid() OR m.user_b_id = auth.uid())
  )
);
