import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Tabs } from 'expo-router';
import { BarChart3, BellRing, Home, User, Users } from 'lucide-react-native';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

/**
 * Bottom tabs.
 *
 * Design refs:
 *  - Google Pay India (icon-only inactive, pill background + label on active)
 *  - Material Design 3 navigation bar (active indicator pill)
 *  - CRED / Revolut (icon-only premium fintech feel)
 *
 * We let React Navigation own the label slot (`title` + `tabBarShowLabel`) so
 * the bar handles vertical layout / clipping properly. The custom `TabIcon`
 * only paints the icon and the active pill behind it.
 *
 * Language-aware labels:
 *  - English: labels under every tab (short words, fits)
 *  - Tamil: icon-only — Tamil words can't fit in 5×~75dp cells
 */
export default function TabsLayout() {
  const { t, i18n } = useTranslation();
  const { styles, theme } = useStyles(stylesheet);
  const showLabels = i18n.language === 'en';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.bar,
        tabBarShowLabel: showLabels,
        tabBarActiveTintColor: theme.colors.brand.primary,
        tabBarInactiveTintColor: theme.colors.text.muted,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        tabBarButton: (props) => <Pressable {...(props as any)} android_ripple={null} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={Home} color={color} focused={focused} compact={!showLabels} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: t('tabs.customers'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={Users} color={color} focused={focused} compact={!showLabels} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t('tabs.reports'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={BarChart3} color={color} focused={focused} compact={!showLabels} />
          ),
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: t('tabs.reminders'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={BellRing} color={color} focused={focused} compact={!showLabels} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon icon={User} color={color} focused={focused} compact={!showLabels} />
          ),
        }}
      />
    </Tabs>
  );
}

interface TabIconProps {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  color: string;
  focused: boolean;
  /** When true (Tamil mode = no label), use a larger pill since the icon
   *  is the only signal */
  compact: boolean;
}

const TabIcon = ({ icon: Icon, color, focused, compact }: TabIconProps) => {
  const { styles, theme } = useStyles(stylesheet);
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(focused ? 1 : 0, theme.motion.spring.default);
  }, [focused, progress, theme]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: 0.6 + progress.value * 0.4 }],
  }));

  const wrap = compact ? styles.iconWrapLarge : styles.iconWrap;

  return (
    <View style={wrap}>
      <Animated.View style={[styles.pill, pillStyle]} />
      <Icon size={compact ? 24 : 20} color={color} strokeWidth={focused ? 2.4 : 2} />
    </View>
  );
};

const stylesheet = createStyleSheet((theme) => ({
  bar: {
    backgroundColor: theme.colors.bg.base,
    borderTopColor: theme.colors.border.subtle,
    borderTopWidth: 1,
    height: 76,
    paddingTop: 6,
    paddingBottom: 10,
  },
  item: { paddingTop: 4 },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWrap: {
    width: 48,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconWrapLarge: {
    width: 56,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 22,
    backgroundColor: theme.colors.brand.glow,
  },
}));
