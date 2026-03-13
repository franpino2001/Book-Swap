import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { setStoredLanguage, type SupportedLanguage, SUPPORTED_LANGUAGES } from '@/i18n/config';
import i18n from '@/i18n/config';
import { colors, spacing } from '@/theme';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const currentLang = i18n.language as SupportedLanguage;

  async function setLanguage(lang: SupportedLanguage) {
    await setStoredLanguage(lang);
    i18n.changeLanguage(lang);
  }

  return (
    <View style={styles.container}>
      <View style={styles.langRow}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Pressable
            key={lang}
            style={[styles.langBtn, currentLang === lang && styles.langBtnActive]}
            onPress={() => setLanguage(lang)}
          >
            <Text style={[styles.langText, currentLang === lang && styles.langTextActive]}>
              {lang === 'en' ? 'EN' : 'ES'}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.title}>{t('auth.welcome')}</Text>
      <Text style={styles.tagline}>{t('auth.tagline')}</Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>{t('auth.login')}</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate('Signup')}
      >
        <Text style={styles.buttonSecondaryText}>{t('auth.signup')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    position: 'absolute',
    top: spacing.xl,
    right: spacing.xl,
  },
  langBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  langBtnActive: {
    backgroundColor: colors.primaryLight,
  },
  langText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  langTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
});
