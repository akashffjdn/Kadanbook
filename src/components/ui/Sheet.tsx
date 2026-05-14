import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { forwardRef, memo, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Text } from './Text';

export interface SheetProps {
  snapPoints?: (string | number)[];
  enableDynamicSizing?: boolean;
  title?: string;
  subtitle?: string;
  onChange?: (idx: number) => void;
  scrollable?: boolean;
  children: React.ReactNode;
}

export type SheetRef = BottomSheet;

export const Sheet = memo(
  forwardRef<SheetRef, SheetProps>(
    (
      {
        snapPoints = ['50%', '90%'],
        enableDynamicSizing = false,
        title,
        subtitle,
        onChange,
        scrollable = true,
        children,
      },
      ref,
    ) => {
      const { styles, theme } = useStyles(stylesheet);
      const points = useMemo(() => snapPoints, [snapPoints]);

      const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.55}
            pressBehavior="close"
          />
        ),
        [],
      );

      return (
        <BottomSheet
          ref={ref}
          index={-1}
          snapPoints={points}
          enableDynamicSizing={enableDynamicSizing}
          enablePanDownToClose
          onChange={onChange}
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.bg}
          handleIndicatorStyle={styles.handle}
          // Lift the sheet to keep inputs above the keyboard. `interactive`
          // matches the keyboard animation; `restore` puts it back to the
          // original snap point when keyboard dismisses. Required so
          // text inputs inside sheets stay visible while typing.
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
        >
          {title || subtitle ? (
            <View style={styles.header}>
              {title ? (
                <Text variant="title" weight="bold">
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text variant="body" color="secondary" style={{ marginTop: theme.spacing.xs }}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}
          {/* Always use BottomSheetScrollView — it reliably honors
              contentContainerStyle (BottomSheetView's own flex layout
              swallows padding). For non-scrollable sheets we just disable
              scroll on it. */}
          <BottomSheetScrollView
            contentContainerStyle={styles.scrollContent}
            scrollEnabled={scrollable}
          >
            {children}
          </BottomSheetScrollView>
        </BottomSheet>
      );
    },
  ),
);
Sheet.displayName = 'Sheet';

const stylesheet = createStyleSheet((theme) => ({
  bg: {
    backgroundColor: theme.colors.bg.elevated,
    borderTopLeftRadius: theme.radius['2xl'],
    borderTopRightRadius: theme.radius['2xl'],
  },
  handle: {
    backgroundColor: theme.colors.border.strong,
    width: 36,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.subtle,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
}));
