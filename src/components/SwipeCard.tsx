import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import type { NearbyUserBook } from '@/lib/api/swipe';
import { distanceKm } from '@/lib/location';
import { colors, spacing } from '@/theme';

interface SwipeCardProps {
  item: NearbyUserBook;
  userLat: number | null;
  userLng: number | null;
}

export function SwipeCard({ item, userLat, userLng }: SwipeCardProps) {
  const coverUrl = item.book?.cover_url;
  const distance =
    userLat != null && userLng != null && item.lat != null && item.lng != null
      ? Math.round(distanceKm(userLat, userLng, item.lat, item.lng))
      : null;

  return (
    <View style={styles.card}>
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
        <Text style={styles.author}>{item.book?.author}</Text>
        <Text style={styles.owner}>
          {item.profile?.display_name || item.profile?.username || 'Unknown'}
        </Text>
        {distance != null && (
          <Text style={styles.distance}>{distance} km away</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  coverContainer: {
    aspectRatio: 3 / 4,
    backgroundColor: colors.surfaceVariant,
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textMuted,
  },
  info: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  author: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  owner: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  distance: {
    fontSize: 12,
    color: colors.primary,
  },
});
