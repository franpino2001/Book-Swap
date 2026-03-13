import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert, Switch } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { setStoredLanguage, type SupportedLanguage, SUPPORTED_LANGUAGES } from '@/i18n/config';
import i18n from '@/i18n/config';
import { colors, spacing } from '@/theme';

export function OnboardingScreen() {
  const { t } = useTranslation();
  const { user, refetchProfile } = useAuth();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [allowLocation, setAllowLocation] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    if (!username.trim()) {
      Alert.alert(t('common.error'), 'Username is required');
      return;
    }
    if (!user) return;
    setLoading(true);
    try {
      await setStoredLanguage(language);
      i18n.changeLanguage(language);

      let lat: number | null = null;
      let lng: number | null = null;
      if (allowLocation) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        username: username.trim().toLowerCase(),
        display_name: displayName.trim() || username.trim(),
        city: city.trim() || null,
        country: country.trim() || 'Unknown',
        language,
        lat,
        lng,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      await refetchProfile();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('common.error');
      Alert.alert(t('common.error'), String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('onboarding.createProfile')}</Text>
      <Text style={styles.label}>{t('onboarding.chooseLanguage')}</Text>
      <View style={styles.languageRow}>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Pressable
            key={lang}
            style={[
              styles.langButton,
              language === lang && styles.langButtonActive,
            ]}
            onPress={() => setLanguage(lang)}
          >
            <Text style={[styles.langText, language === lang && styles.langTextActive]}>
              {lang === 'en' ? 'English' : 'Español'}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>{t('onboarding.username')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('onboarding.username')}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <Text style={styles.label}>{t('onboarding.displayName')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('onboarding.displayName')}
        value={displayName}
        onChangeText={setDisplayName}
      />
      <Text style={styles.label}>{t('onboarding.city')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('onboarding.city')}
        value={city}
        onChangeText={setCity}
      />
      <Text style={styles.label}>{t('onboarding.country')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('onboarding.country')}
        value={country}
        onChangeText={setCountry}
      />
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{t('onboarding.allowLocation')}</Text>
        <Switch
          value={allowLocation}
          onValueChange={setAllowLocation}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={colors.white}
        />
      </View>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={handleComplete}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? t('common.loading') : t('common.done')}</Text>
      </Pressable>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  switchLabel: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  languageRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  langButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  langText: {
    color: colors.text,
  },
  langTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
