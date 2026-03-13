import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NearbyUserBook } from '@/lib/api/swipe';

import { colors, spacing } from '@/theme';

interface MarketplaceBookCardProps {
  item: NearbyUserBook;
  onInterested: () => void;
}

export function MarketplaceBookCard({ item, onInterested }: MarketplaceBookCardProps) {
  const { t } = useTranslation();
  const coverUrl = item.book?.cover_url;

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
        <Text style={styles.author} numberOfLines={1}>
          {item.book?.author}
        </Text>
        <Text style={styles.owner}>
          {item.profile?.display_name || item.profile?.username || 'Unknown'}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={onInterested}
        >
          <Text style={styles.btnText}>{t('marketplace.interested')}</Text>
        </Pressable>
      </View>
    </View>
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
  owner: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
