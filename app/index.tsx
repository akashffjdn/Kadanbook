import { LogoMark } from '@/components/brand';
import { Text } from '@/components/ui';
import { useAuthStore, useIsAuthenticated } from '@/store/auth.store';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

/**
 * Splash screen.
 * Design refs:
 *  - Apple Wallet (logo morph from native splash)
 *  - Cash App (instant feel, no spinner)
 *  - CRED (oversized brand mark, premium reveal)
 *
 * Two-tone: brand icon in a glowing circle, app name + Tamil tagline.
 * Auto-routes after 1.8s based on auth state.
 */
export default function SplashRoute() {
  const router = useRouter();
  const { styles } = useStyles(stylesheet);
  const isAuth = useIsAuthenticated();
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);

  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const titleOpacity = useSharedValue(0);
  const taglineY = useSharedValue(16);
  const taglineOpacity = useSharedValue(0);
  const barWidth = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 14, stiffness: 220 });
    logoOpacity.value = withTiming(1, { duration: 380 });

    titleY.value = withDelay(220, withSpring(0, { damping: 18, stiffness: 220 }));
    titleOpacity.value = withDelay(
      220,
      withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }),
    );

    taglineY.value = withDelay(420, withSpring(0, { damping: 18, stiffness: 220 }));
    taglineOpacity.value = withDelay(
      420,
      withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }),
    );

    barWidth.value = withDelay(
      300,
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.cubic) }),
    );

    const t = setTimeout(() => {
      if (isAuth) router.replace('/(tabs)');
      else if (hasOnboarded) router.replace('/(auth)/login');
      else router.replace('/(auth)/onboarding');
    }, 1800);
    return () => clearTimeout(t);
  }, [
    router,
    isAuth,
    hasOnboarded,
    logoScale,
    logoOpacity,
    titleY,
    titleOpacity,
    taglineY,
    taglineOpacity,
    barWidth,
  ]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));
  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOpacity.value,
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: taglineY.value }],
    opacity: taglineOpacity.value,
  }));
  const barStyle = useAnimatedStyle(() => ({ width: `${barWidth.value * 100}%` }));

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Animated.View style={[styles.logoWrap, logoStyle]}>
          <View style={styles.logoGlow} />
          <View style={styles.logoShadow}>
            <LogoMark size={104} radiusRatio={0.28} />
          </View>
        </Animated.View>

        <Animated.View style={[{ marginTop: 28, alignItems: 'center' }, titleStyle]}>
          <Text variant="title" weight="bold" style={{ fontSize: 28 }}>
            KadanBook
          </Text>
        </Animated.View>

        <Animated.View style={[{ marginTop: 8, alignItems: 'center' }, taglineStyle]}>
          <Text variant="body" color="secondary" align="center">
            உங்கள் கடன் புத்தகம், டிஜிட்டலில்
          </Text>
        </Animated.View>
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, barStyle]} />
        </View>
        <Text variant="caption" color="muted" align="center" style={{ marginTop: 12 }}>
          v1.0.0
        </Text>
      </View>
    </View>
  );
}

const stylesheet = createStyleSheet((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg.base,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoWrap: { alignItems: 'center', justifyContent: 'center' },
  logoGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.brand.glow,
    opacity: 0.6,
  },
  logoShadow: {
    shadowColor: theme.colors.brand.primary,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  bottomBar: { width: '60%', alignItems: 'center' },
  barTrack: {
    width: '100%',
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.colors.border.subtle,
    overflow: 'hidden',
  },
  barFill: {
    height: 2,
    backgroundColor: theme.colors.brand.primary,
    borderRadius: 1,
  },
}));
