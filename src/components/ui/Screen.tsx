import { memo } from 'react';
import { ScrollView, type ScrollViewProps, StatusBar, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

export interface ScreenProps extends ViewProps {
  scrollable?: boolean;
  scrollProps?: ScrollViewProps;
  padded?: boolean;
  edges?: { top?: boolean; bottom?: boolean };
}

/** Universal screen container. Handles safe area, status bar, theme bg. */
export const Screen = memo<ScreenProps>(
  ({
    scrollable = false,
    scrollProps,
    padded = false,
    edges = { top: true, bottom: false },
    children,
    style,
    ...rest
  }) => {
    const insets = useSafeAreaInsets();
    const { styles, theme } = useStyles(stylesheet);

    const paddingTop = edges.top ? insets.top : 0;
    const paddingBottom = edges.bottom ? insets.bottom : 0;

    const innerStyle = [
      styles.container,
      padded && { paddingHorizontal: theme.spacing.base },
      { paddingTop, paddingBottom },
      style,
    ];

    if (scrollable) {
      return (
        <View style={styles.root}>
          <StatusBar barStyle={theme.colors.isDark ? 'light-content' : 'dark-content'} />
          <ScrollView
            {...scrollProps}
            contentContainerStyle={[innerStyle, scrollProps?.contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      );
    }
    return (
      <View {...rest} style={[styles.root, innerStyle]}>
        <StatusBar barStyle={theme.colors.isDark ? 'light-content' : 'dark-content'} />
        {children}
      </View>
    );
  },
);
Screen.displayName = 'Screen';

const stylesheet = createStyleSheet((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg.base,
  },
  container: {
    flexGrow: 1,
  },
}));
