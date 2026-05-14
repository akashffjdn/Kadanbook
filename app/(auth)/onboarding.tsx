import { Button, ProgressBar, Screen, Text } from '@/components/ui';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'expo-router';
import { ArrowRight, BellRing, IndianRupee, NotebookPen } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

const { width } = Dimensions.get('window');

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

/**
 * Onboarding 3-slide carousel.
 * Design refs:
 *  - Headspace (full-bleed illustration top, single CTA)
 *  - Cash App (persistent bottom CTA)
 *  - Linear marketing site (slim progress instead of dot indicators)
 *
 * Slides: kadan write → WhatsApp remind → UPI collect.
 */
export default function OnboardingRoute() {
  const router = useRouter();
  const { t } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const scrollX = useSharedValue(0);
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const slides = [
    {
      icon: NotebookPen,
      tint: theme.colors.brand.primary,
      title: t('onboarding.slide1Title'),
      body: t('onboarding.slide1Body'),
    },
    {
      icon: BellRing,
      tint: theme.colors.semantic.info,
      title: t('onboarding.slide2Title'),
      body: t('onboarding.slide2Body'),
    },
    {
      icon: IndianRupee,
      tint: theme.colors.semantic.success,
      title: t('onboarding.slide3Title'),
      body: t('onboarding.slide3Body'),
    },
  ];

  const goNext = useCallback(() => {
    if (index < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
      setIndex(index + 1);
    } else {
      completeOnboarding();
      router.replace('/(auth)/login');
    }
  }, [index, slides.length, completeOnboarding, router]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(auth)/login');
  };

  return (
    <Screen edges={{ top: true, bottom: true }}>
      <View style={styles.topBar}>
        <Pressable hitSlop={12} onPress={handleSkip}>
          <Text variant="body" color="muted">
            {t('common.skip')}
          </Text>
        </Pressable>
      </View>

      <AnimatedScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumEnd}
        style={{ flex: 1 }}
      >
        {slides.map((s, i) => (
          <Slide key={i} index={i} scrollX={scrollX} slide={s} />
        ))}
      </AnimatedScrollView>

      <View style={styles.bottom}>
        <ProgressBar value={(index + 1) / slides.length} duration={250} />
        <View style={{ marginTop: theme.spacing.lg }}>
          <Button
            label={index === slides.length - 1 ? t('common.getStarted') : t('common.next')}
            onPress={goNext}
            size="xl"
            rightIcon={<ArrowRight size={20} color={theme.colors.text.onBrand} />}
          />
        </View>
      </View>
    </Screen>
  );
}

const Slide = ({
  slide,
  scrollX,
  index,
}: {
  slide: {
    icon: typeof NotebookPen;
    tint: string;
    title: string;
    body: string;
  };
  scrollX: { value: number };
  index: number;
}) => {
  const { styles } = useStyles(stylesheet);
  const Icon = slide.icon;

  const iconStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      transform: [
        { scale: interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], 'clamp') },
        { translateY: interpolate(scrollX.value, inputRange, [40, 0, 40], 'clamp') },
      ],
      opacity: interpolate(scrollX.value, inputRange, [0.2, 1, 0.2], 'clamp'),
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    return {
      transform: [{ translateY: interpolate(scrollX.value, inputRange, [30, 0, 30], 'clamp') }],
      opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], 'clamp'),
    };
  });

  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.illustration}>
        <Animated.View
          style={[styles.iconCircle, { backgroundColor: `${slide.tint}22` }, iconStyle]}
        >
          <View style={styles.iconRing} />
          <View style={[styles.iconInner, { backgroundColor: slide.tint }]}>
            <Icon size={56} color="#FFFFFF" strokeWidth={2.4} />
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.copy, textStyle]}>
        <Text variant="title" weight="bold" align="center" style={{ fontSize: 28 }}>
          {slide.title}
        </Text>
        <Text variant="bodyLarge" color="secondary" align="center" style={styles.body}>
          {slide.body}
        </Text>
      </Animated.View>
    </View>
  );
};

const stylesheet = createStyleSheet((theme) => ({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 24 },
  illustration: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },
  iconCircle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  iconInner: {
    width: 128,
    height: 128,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  copy: { paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing['2xl'] },
  body: { marginTop: theme.spacing.md, maxWidth: 320, alignSelf: 'center' },
  bottom: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
}));
