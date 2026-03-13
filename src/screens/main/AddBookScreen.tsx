import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { addBook } from '@/lib/api/books';
import { uploadBookCover } from '@/lib/api/storage';
import { supabase } from '@/lib/supabase';
import type { BookCondition } from '@/types/database';
import { colors, spacing } from '@/theme';

const CONDITIONS: BookCondition[] = ['new', 'good', 'fair', 'poor'];

export function AddBookScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [condition, setCondition] = useState<BookCondition>('good');
  const [notes, setNotes] = useState('');
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), 'Permission to access photos is required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled) {
      setCoverUri(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (!title.trim() || !author.trim()) {
      Alert.alert(t('common.error'), 'Title and author are required');
      return;
    }
    if (!user) return;
    setLoading(true);
    try {
      const userBook = await addBook({
        userId: user.id,
        title: title.trim(),
        author: author.trim(),
        condition,
        notes: notes.trim() || undefined,
        city: profile?.city ?? undefined,
        country: profile?.country ?? undefined,
        lat: profile?.lat ?? undefined,
        lng: profile?.lng ?? undefined,
      });

      if (coverUri) {
        const coverUrl = await uploadBookCover(user.id, userBook.id, coverUri);
        await supabase.from('books').update({ cover_url: coverUrl }).eq('id', userBook.book_id);
      }

      navigation.goBack();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('common.error');
      Alert.alert(t('common.error'), String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>{t('book.title')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('book.title')}
        value={title}
        onChangeText={setTitle}
      />
      <Text style={styles.label}>{t('book.author')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('book.author')}
        value={author}
        onChangeText={setAuthor}
      />
      <Text style={styles.label}>{t('book.condition')}</Text>
      <View style={styles.conditionRow}>
        {CONDITIONS.map((c) => (
          <Pressable
            key={c}
            style={[styles.conditionBtn, condition === c && styles.conditionBtnActive]}
            onPress={() => setCondition(c)}
          >
            <Text style={[styles.conditionText, condition === c && styles.conditionTextActive]}>
              {t(`book.${c}`)}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>{t('book.notes')}</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder={t('book.notes')}
        value={notes}
        onChangeText={setNotes}
        multiline
      />
      <Text style={styles.label}>Cover photo</Text>
      <Pressable style={styles.coverBtn} onPress={pickImage}>
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.coverPreview} resizeMode="cover" />
        ) : (
          <Text style={styles.coverPlaceholderText}>Tap to add cover</Text>
        )}
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.saveBtn, pressed && styles.btnPressed]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveBtnText}>{loading ? t('common.loading') : t('common.save')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  conditionBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  conditionBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  conditionText: {
    fontSize: 14,
    color: colors.text,
  },
  conditionTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  coverBtn: {
    width: 120,
    height: 160,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  coverPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  coverPlaceholderText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  btnPressed: {
    opacity: 0.8,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
