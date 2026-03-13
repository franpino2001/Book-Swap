import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import type { UserBookWithDetails } from '@/lib/api/books';
import { colors, spacing } from '@/theme';

interface BookCardProps {
  item: UserBookWithDetails;
  onPress?: () => void;
  onLongPress?: () => void;
}

const CONDITION_LABELS: Record<string, string> = {
  new: 'new',
  good: 'good',
  fair: 'fair',
  poor: 'poor',
};

export function BookCard({ item, onPress, onLongPress }: BookCardProps) {
  const coverUrl = item.book?.cover_url;
  const conditionKey = item.condition || 'good';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.coverContainer}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.placeholderText}>{item.book?.title?.[0] ?? '?'}</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {item.book?.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {item.book?.author}
        </Text>
        <Text style={styles.condition}>{CONDITION_LABELS[conditionKey] ?? conditionKey}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.9,
  },
  coverContainer: {
    width: 60,
    height: 90,
  },
  cover: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textMuted,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  author: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  condition: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
});
