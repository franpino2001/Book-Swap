import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { fetchUserBooks, deleteUserBook, type UserBookWithDetails } from '@/lib/api/books';
import { BookCard } from '@/components/BookCard';
import { colors, spacing } from '@/theme';

export function LibraryScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [books, setBooks] = useState<UserBookWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBooks = useCallback(async () => {
    if (!user) return;
    try {
      const data = await fetchUserBooks(user.id);
      setBooks(data);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadBooks();
  }

  function handleAddBook() {
    navigation.getParent()?.navigate('AddBook');
  }

  function handleDeleteBook(item: UserBookWithDetails) {
    Alert.alert(
      'Delete book?',
      `Remove "${item.book?.title}" from your library?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            try {
              await deleteUserBook(item.id, user.id);
              await loadBooks();
            } catch (err) {
              Alert.alert(t('common.error'), String(err));
            }
          },
        },
      ]
    );
  }

  if (!user) return null;

  if (loading && books.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.placeholder}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (books.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.placeholder}>{t('library.noBooks')}</Text>
        <Text style={styles.subtext}>{t('library.addFirst')}</Text>
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleAddBook}>
          <Text style={styles.buttonText}>{t('library.addBook')}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookCard
            item={item}
            onLongPress={() => handleDeleteBook(item)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={handleAddBook}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  placeholder: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  subtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabPressed: {
    opacity: 0.9,
  },
  fabText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '300',
  },
});
