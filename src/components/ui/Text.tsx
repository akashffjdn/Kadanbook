import type { TypographyVariant } from '@/theme/typography';
import { memo } from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?:
    | 'primary'
    | 'secondary'
    | 'muted'
    | 'inverse'
    | 'onBrand'
    | 'brand'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  align?: TextStyle['textAlign'];
  numeric?: boolean;
}

const colorMap = {
  primary: (c: ReturnType<typeof useStyles>['theme']['colors']) => c.text.primary,
  secondary: (c: ReturnType<typeof useStyles>['theme']['colors']) => c.text.secondary,
  muted: (c: ReturnType<typeof useStyles>['theme']['colors']) => c.text.muted,
  inverse: (c: ReturnType<typeof useStyles>['theme']['colors']) => c.text.inverse,
  onBrand: (c: ReturnType<typeof useStyles>['theme']['colors']) => c.text.onBrand,
  brand: (c: ReturnType<typeof useStyles>['theme']['colors']) => c.brand.primary,
  success: (c: ReturnType<typeof useStyles>['theme']['colors']) => c.semantic.success,
  danger: (c: ReturnType<typeof useStyles>['theme']['colors']) => c.semantic.danger,
  warning: (c: ReturnType<typeof useStyles>['theme']['colors']) => c.semantic.warning,
  info: (c: ReturnType<typeof useStyles>['theme']['colors']) => c.semantic.info,
} as const;

const weightMap = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const Text = memo<TextProps>(
  ({ variant = 'body', color = 'primary', weight, align, numeric, style, ...rest }) => {
    const { styles, theme } = useStyles(stylesheet);
    const variantStyle = theme.typography[variant];

    return (
      <RNText
        {...rest}
        style={[
          styles.base,
          variantStyle,
          { color: colorMap[color](theme.colors) },
          weight && { fontWeight: weightMap[weight] },
          align && { textAlign: align },
          numeric && { fontVariant: ['tabular-nums'] },
          style,
        ]}
      />
    );
  },
);
Text.displayName = 'Text';

const stylesheet = createStyleSheet(() => ({
  base: {
    includeFontPadding: false,
  },
}));
