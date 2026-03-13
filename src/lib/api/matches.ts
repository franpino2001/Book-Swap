import { supabase } from '@/lib/supabase';
import type { Match, Message, Profile } from '@/types/database';

export interface MatchWithOther extends Match {
  other_user: Profile;
  last_message?: Message;
}

export async function fetchMatches(userId: string): Promise<MatchWithOther[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const matches = (data ?? []) as Match[];

  const withDetails: MatchWithOther[] = await Promise.all(
    matches.map(async (m) => {
      const otherId = m.user_a_id === userId ? m.user_b_id : m.user_a_id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherId)
        .single();

      const { data: lastMsg } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', m.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        ...m,
        other_user: profile as Profile,
        last_message: lastMsg as Message | undefined,
      };
    })
  );

  return withDetails;
}

export async function fetchMessages(matchId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(
  matchId: string,
  senderId: string,
  text: string
): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender_id: senderId, text })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

export function subscribeToMessages(
  matchId: string,
  onMessage: (message: Message) => void
): { unsubscribe: () => void } {
  const channel = supabase
    .channel(`messages:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}
