import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { setStoredLanguage, type SupportedLanguage, SUPPORTED_LANGUAGES } from '@/i18n/config';
import i18n from '@/i18n/config';
import { colors, spacing } from '@/theme';

export function SettingsScreen() {
  const { t } = useTranslation();
  const currentLang = (i18n.language || 'en') as SupportedLanguage;

  async function setLanguage(lang: SupportedLanguage) {
    await setStoredLanguage(lang);
    i18n.changeLanguage(lang);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('profile.settings')}</Text>
      <Text style={styles.sectionLabel}>{t('profile.language')}</Text>
      <View style={styles.options}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Pressable
            key={lang}
            style={[
              styles.option,
              currentLang === lang && styles.optionActive,
            ]}
            onPress={() => setLanguage(lang)}
          >
            <Text
              style={[
                styles.optionText,
                currentLang === lang && styles.optionTextActive,
              ]}
            >
              {lang === 'en' ? 'English' : 'Español'}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceVariant,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
