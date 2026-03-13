import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'BookSwap',
  slug: 'bookswap',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#F5E6D3',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.bookswap.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'BookSwap uses your location to show books nearby for swapping.',
      NSCameraUsageDescription: 'BookSwap uses your camera to photograph book covers.',
      NSPhotoLibraryUsageDescription: 'BookSwap uses your photo library to add book covers.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#F5E6D3',
    },
    package: 'com.bookswap.app',
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
    ],
  },
  plugins: ['expo-location', 'expo-image-picker'],
});
