import { Platform, type TextStyle } from 'react-native';
import { fontSize, fontWeight, letterSpacing, lineHeight } from './tokens';

/**
 * Font family resolver — swaps Inter for Noto Sans Tamil when language is Tamil.
 * Tamil glyphs render +1sp larger than Latin for optical balance.
 */
export const fontFamily = {
  latin: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  tamil: {
    regular: 'NotoSansTamil_400Regular',
    medium: 'NotoSansTamil_500Medium',
    semibold: 'NotoSansTamil_600SemiBold',
    bold: 'NotoSansTamil_700Bold',
  },
} as const;

export const resolveFontFamily = (weight: keyof typeof fontFamily.latin, isTamil = false) =>
  isTamil ? fontFamily.tamil[weight] : fontFamily.latin[weight];

export const typography: Record<string, TextStyle> = {
  displayHero: {
    fontSize: fontSize.displayHero,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.heroNeg,
    lineHeight: fontSize.displayHero * lineHeight.tight,
    fontVariant: ['tabular-nums'],
  },
  display: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.displayNeg,
    lineHeight: fontSize.display * lineHeight.tight,
    fontVariant: ['tabular-nums'],
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.normal,
    lineHeight: fontSize.title * lineHeight.normal,
  },
  subtitle: {
    fontSize: fontSize.subtitle,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.normal,
    lineHeight: fontSize.subtitle * lineHeight.normal,
  },
  bodyLarge: {
    fontSize: fontSize.bodyLarge,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
    lineHeight: fontSize.bodyLarge * lineHeight.relaxed,
  },
  body: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
    lineHeight: fontSize.body * lineHeight.relaxed,
  },
  caption: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.regular,
    letterSpacing: letterSpacing.normal,
    lineHeight: fontSize.caption * lineHeight.normal,
  },
  label: {
    fontSize: fontSize.label,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.label,
    lineHeight: fontSize.label * lineHeight.normal,
    textTransform: 'uppercase',
  },
  monoNumber: {
    fontVariant: ['tabular-nums'],
    fontFamily: Platform.select({
      ios: 'Inter_600SemiBold',
      android: 'Inter_600SemiBold',
      default: 'monospace',
    }),
  },
};

export type TypographyVariant =
  | 'displayHero'
  | 'display'
  | 'title'
  | 'subtitle'
  | 'bodyLarge'
  | 'body'
  | 'caption'
  | 'label'
  | 'monoNumber';
