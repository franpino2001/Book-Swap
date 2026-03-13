import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { fetchMarketplaceBooks, type MarketplaceFilters } from '@/lib/api/marketplace';
import { swipe, type NearbyUserBook } from '@/lib/api/swipe';
import { MarketplaceBookCard } from '@/components/MarketplaceBookCard';
import { colors, spacing } from '@/theme';

export function MarketplaceScreen() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [books, setBooks] = useState<NearbyUserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState<string>('');

  const loadBooks = useCallback(async () => {
    if (!user || !profile) return;
    try {
      const filters: MarketplaceFilters = {
        search: search.trim() || undefined,
        condition: conditionFilter || undefined,
      };
      const data = await fetchMarketplaceBooks(
        user.id,
        profile.lat ?? null,
        profile.lng ?? null,
        filters
      );
      setBooks(data);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, profile, search, conditionFilter]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  async function onRefresh() {
    setRefreshing(true);
    await loadBooks();
  }

  async function handleInterested(item: NearbyUserBook) {
    if (!user) return;
    try {
      const { matched, matchId } = await swipe(user.id, item.id, 'right');
      if (matched && matchId) {
        Alert.alert('It\'s a match!', 'You can now chat with this user.');
      }
      setBooks((prev) => prev.filter((b) => b.id !== item.id));
    } catch (err) {
      Alert.alert(t('common.error'), String(err));
    }
  }

  if (!user || !profile) return null;

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('marketplace.title')}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        <View style={styles.conditionRow}>
          {['', 'new', 'good', 'fair', 'poor'].map((c) => (
            <Pressable
              key={c || 'all'}
              style={[
                styles.filterBtn,
                conditionFilter === c && styles.filterBtnActive,
              ]}
              onPress={() => setConditionFilter(c)}
            >
              <Text
                style={[
                  styles.filterText,
                  conditionFilter === c && styles.filterTextActive,
                ]}
              >
                {c || 'All'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MarketplaceBookCard
            item={item}
            onInterested={() => handleInterested(item)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {loading ? t('common.loading') : 'No books found'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filters: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: colors.text,
  },
  filterTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  list: {
    padding: spacing.md,
  },
  btnPressed: {
    opacity: 0.8,
  },
  empty: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
  },
});
