import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthStack } from '@/navigation/AuthStack';
import { RootNavigator } from '@/navigation/RootNavigator';
import { getStoredLanguage } from '@/i18n/config';
import i18n from '@/i18n/config';

function AppContent() {
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    getStoredLanguage().then((lang) => {
      if (lang) i18n.changeLanguage(lang);
    });
  }, []);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <AuthStack />;
  }

  const needsOnboarding = !profile?.username;
  if (needsOnboarding) {
    return <AuthStack initialRoute="Onboarding" />;
  }

  return <RootNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppContent />
            <StatusBar style="dark" />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
