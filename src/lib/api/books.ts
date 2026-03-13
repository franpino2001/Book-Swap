import { supabase } from '@/lib/supabase';
import type { UserBook, Book, BookCondition } from '@/types/database';

export interface UserBookWithDetails extends UserBook {
  book: Book;
}

export async function fetchUserBooks(userId: string): Promise<UserBookWithDetails[]> {
  const { data, error } = await supabase
    .from('user_books')
    .select(
      `
      *,
      book:books(*)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as UserBookWithDetails[];
}

export async function addBook(params: {
  userId: string;
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string;
  category?: string;
  bookLanguage?: string;
  condition: BookCondition;
  notes?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
}): Promise<UserBook> {
  const { data: bookData, error: bookError } = await supabase
    .from('books')
    .insert({
      title: params.title,
      author: params.author,
      isbn: params.isbn ?? null,
      cover_url: params.coverUrl ?? null,
      category: params.category ?? 'general',
      language: params.bookLanguage ?? 'en',
    })
    .select('id')
    .single();

  if (bookError) throw bookError;
  if (!bookData) throw new Error('Failed to create book');

  const { data: userBookData, error: userBookError } = await supabase
    .from('user_books')
    .insert({
      user_id: params.userId,
      book_id: bookData.id,
      condition: params.condition,
      status: 'available',
      notes: params.notes ?? null,
      city: params.city ?? null,
      country: params.country ?? null,
      lat: params.lat ?? null,
      lng: params.lng ?? null,
    })
    .select()
    .single();

  if (userBookError) throw userBookError;
  return userBookData as UserBook;
}

export async function updateUserBook(
  userBookId: string,
  userId: string,
  updates: {
    condition?: BookCondition;
    status?: 'available' | 'reserved' | 'traded';
    notes?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from('user_books')
    .update(updates)
    .eq('id', userBookId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function deleteUserBook(userBookId: string, userId: string): Promise<void> {
  const { data: ub } = await supabase
    .from('user_books')
    .select('book_id')
    .eq('id', userBookId)
    .eq('user_id', userId)
    .single();

  if (!ub) throw new Error('Book not found');

  const { error: ubError } = await supabase
    .from('user_books')
    .delete()
    .eq('id', userBookId)
    .eq('user_id', userId);

  if (ubError) throw ubError;

  const { count } = await supabase
    .from('user_books')
    .select('*', { count: 'exact', head: true })
    .eq('book_id', ub.book_id);

  if (count === 0) {
    await supabase.from('books').delete().eq('id', ub.book_id);
  }
}
