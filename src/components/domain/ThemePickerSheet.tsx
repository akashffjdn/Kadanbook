import { Sheet, type SheetRef, Text } from '@/components/ui';
import { useThemeStore } from '@/store/theme.store';
import { type Palette, palettes, themeMeta } from '@/theme/palettes';
import { Check } from 'lucide-react-native';
import { forwardRef, memo } from 'react';
import { Pressable, View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

/**
 * Theme picker sheet.
 * Showcases the one-variable theme system: tap a swatch → entire app re-skins.
 *
 * Design refs:
 *  - iOS Dark Mode wallpaper picker (large color swatches)
 *  - Notion theme switcher
 *  - Linear preferences (mini app preview tiles)
 */
export const ThemePickerSheet = memo(
  forwardRef<SheetRef>((_, ref) => {
    const { styles, theme } = useStyles(stylesheet);
    const mode = useThemeStore((s) => s.mode);
    const setMode = useThemeStore((s) => s.setMode);

    return (
      <Sheet
        ref={ref}
        snapPoints={['55%']}
        title="Choose theme"
        subtitle="One tap re-skins the whole app instantly"
      >
        <View style={styles.grid}>
          {themeMeta.map((m) => {
            const p = palettes[m.id];
            const active = mode === m.id;
            return (
              <Pressable
                key={m.id}
                onPress={() => {
                  setMode(m.id);
                }}
                style={({ pressed }) => [
                  styles.tile,
                  {
                    borderColor: active ? p.brand.primary : theme.colors.border.subtle,
                    borderWidth: active ? 2 : 1,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Preview palette={p} />
                <View style={styles.tileFooter}>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" weight="semibold">
                      {m.label}
                    </Text>
                    <Text variant="caption" color="secondary">
                      {m.description}
                    </Text>
                  </View>
                  {active ? (
                    <View style={[styles.check, { backgroundColor: p.brand.primary }]}>
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    );
  }),
);
ThemePickerSheet.displayName = 'ThemePickerSheet';

const Preview = ({ palette }: { palette: Palette }) => {
  const { styles } = useStyles(stylesheet);
  return (
    <View style={[styles.preview, { backgroundColor: palette.bg.base }]}>
      <View style={[styles.previewHeader, { backgroundColor: palette.bg.surface }]}>
        <View style={[styles.dot, { backgroundColor: palette.brand.primary }]} />
        <View
          style={[
            styles.bar,
            { backgroundColor: palette.text.secondary, opacity: 0.3, width: '40%' },
          ]}
        />
      </View>
      <View style={{ padding: 8, gap: 6 }}>
        <View
          style={[styles.bar, { backgroundColor: palette.text.primary, width: '70%', height: 6 }]}
        />
        <View
          style={[
            styles.bar,
            { backgroundColor: palette.text.secondary, opacity: 0.6, width: '50%', height: 4 },
          ]}
        />
        <View style={[styles.miniCard, { backgroundColor: palette.bg.surface }]}>
          <View
            style={[
              styles.bar,
              { backgroundColor: palette.brand.primary, width: '60%', height: 6 },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const stylesheet = createStyleSheet((theme) => ({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: theme.colors.bg.surface,
  },
  preview: {
    height: 120,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  bar: { height: 4, borderRadius: 2 },
  miniCard: { padding: 8, borderRadius: 6 },
  tileFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: theme.spacing.md,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
