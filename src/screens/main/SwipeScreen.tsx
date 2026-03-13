import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useAuth } from '@/context/AuthContext';
import { fetchNearbyBooks, swipe, type NearbyUserBook } from '@/lib/api/swipe';
import { SwipeCard } from '@/components/SwipeCard';
import { colors, spacing } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export function SwipeScreen() {
  const { user, profile } = useAuth();
  const [books, setBooks] = useState<NearbyUserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchedId, setMatchedId] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const data = await fetchNearbyBooks(
        user.id,
        profile.lat ?? null,
        profile.lng ?? null
      );
      setBooks(data);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const translateX = useSharedValue(0);

  const removeTopAndLoad = useCallback(() => {
    translateX.value = 0;
    setBooks((prev) => prev.slice(1));
    setMatchedId(null);
  }, []);

  const handleSwipe = useCallback(
    async (direction: 'left' | 'right') => {
      const top = books[0];
      if (!top || !user) return;

      try {
        const { matched, matchId } = await swipe(user.id, top.id, direction);
        if (matched && matchId) {
          setMatchedId(matchId);
          Alert.alert('It\'s a match!', 'You can now chat with this user.', [
            { text: 'OK', onPress: () => removeTopAndLoad() },
          ]);
        } else {
          removeTopAndLoad();
        }
      } catch (err) {
        Alert.alert('Error', String(err));
        removeTopAndLoad();
      }
    },
    [books, user, removeTopAndLoad]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD || e.velocityX > 500;
      const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD || e.velocityX < -500;

      if (shouldSwipeRight) {
        translateX.value = withSpring(SCREEN_WIDTH, { damping: 15 }, () => {
          runOnJS(handleSwipe)('right');
        });
      } else if (shouldSwipeLeft) {
        translateX.value = withSpring(-SCREEN_WIDTH, { damping: 15 }, () => {
          runOnJS(handleSwipe)('left');
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  if (!user || !profile) return null;

  if (loading && books.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.placeholder}>Loading...</Text>
      </View>
    );
  }

  if (books.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.placeholder}>No more books nearby</Text>
        <Text style={styles.subtext}>Check back later or add more books to your library</Text>
      </View>
    );
  }

  const topBook = books[0];

  return (
    <View style={styles.container}>
      <View style={styles.cardStack}>
        {books.slice(1, 3).map((item, i) => (
          <View
            key={item.id}
            style={[
              styles.cardBehind,
              {
                transform: [
                  { scale: 1 - (i + 1) * 0.05 },
                  { translateY: (i + 1) * 8 },
                ],
              },
            ]}
          >
            <SwipeCard
              item={item}
              userLat={profile.lat}
              userLng={profile.lng}
            />
          </View>
        ))}
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.cardFront, animatedStyle]}>
            <SwipeCard
              item={topBook}
              userLat={profile.lat}
              userLng={profile.lng}
            />
          </Animated.View>
        </GestureDetector>
      </View>
      <View style={styles.buttons}>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnLeft, pressed && styles.btnPressed]}
          onPress={() => handleSwipe('left')}
        >
          <Text style={styles.btnText}>✕</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.btn, styles.btnRight, pressed && styles.btnPressed]}
          onPress={() => handleSwipe('right')}
        >
          <Text style={styles.btnText}>♥</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  placeholder: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  subtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  cardStack: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  cardBehind: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    opacity: 0.9,
  },
  cardFront: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  btn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnLeft: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  btnRight: {
    backgroundColor: colors.primary,
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnText: {
    fontSize: 28,
    color: colors.text,
  },
});
