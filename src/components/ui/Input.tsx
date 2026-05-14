import { forwardRef, memo, useCallback, useState } from 'react';
import {
  Pressable,
  type TextInput as RNTextInputType,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Text } from './Text';

export interface InputProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: object;
  /** When false, no label is rendered above the input. Default true. */
  showLabel?: boolean;
}

/**
 * Text input field — modern outside-label pattern.
 *
 * Design refs:
 *  - Stripe Checkout (uppercase label above, clean rounded box, brand-color
 *    border on focus)
 *  - Linear / Notion forms (small label, generous input height, subtle border)
 *  - Cash App (icon-prefixed input, helper text below)
 *  - Material 3 outlined (border color transition)
 *
 * Layout:
 *   LABEL *
 *   ┌──────────────────────────┐
 *   │  📞   98765 43210        │
 *   └──────────────────────────┘
 *   helper text or error
 *
 * Required asterisk in brand color. Focused state animates the border to
 * brand color; error state pins it red. Multiline input grows naturally.
 */
export const Input = memo(
  forwardRef<RNTextInputType, InputProps>(
    (
      {
        label,
        error,
        hint,
        required,
        leftIcon,
        rightIcon,
        value,
        onFocus,
        onBlur,
        containerStyle,
        showLabel = true,
        multiline,
        numberOfLines,
        ...rest
      },
      ref,
    ) => {
      const { styles, theme } = useStyles(stylesheet);
      const [focused, setFocused] = useState(false);

      const focusProgress = useDerivedValue(
        () => withTiming(focused ? 1 : 0, { duration: 160 }),
        [focused],
      );

      const borderStyle = useAnimatedStyle(() => ({
        borderColor: error
          ? theme.colors.semantic.danger
          : interpolateColor(
              focusProgress.value,
              [0, 1],
              [theme.colors.border.subtle, theme.colors.border.focus],
            ),
      }));

      const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
        (e) => {
          setFocused(true);
          onFocus?.(e);
        },
        [onFocus],
      );
      const handleBlur = useCallback<NonNullable<TextInputProps['onBlur']>>(
        (e) => {
          setFocused(false);
          onBlur?.(e);
        },
        [onBlur],
      );

      return (
        <View style={[styles.wrap, containerStyle]}>
          {label && showLabel ? (
            <View style={styles.labelRow}>
              <Text
                variant="label"
                color={error ? 'danger' : 'secondary'}
                style={styles.label}
              >
                {label}
              </Text>
              {required ? (
                <Text variant="label" color="brand" style={styles.required}>
                  *
                </Text>
              ) : null}
            </View>
          ) : null}

          <Animated.View
            style={[
              styles.box,
              multiline ? styles.boxMultiline : null,
              borderStyle,
            ]}
          >
            {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
            <TextInput
              ref={ref}
              {...rest}
              value={value}
              onFocus={handleFocus}
              onBlur={handleBlur}
              multiline={multiline}
              numberOfLines={numberOfLines}
              style={[styles.input, multiline ? styles.inputMultiline : null]}
              placeholderTextColor={theme.colors.text.muted}
            />
            {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
          </Animated.View>

          {error ? (
            <Text variant="caption" color="danger" style={styles.helper}>
              {error}
            </Text>
          ) : hint ? (
            <Text variant="caption" color="muted" style={styles.helper}>
              {hint}
            </Text>
          ) : null}
        </View>
      );
    },
  ),
);
Input.displayName = 'Input';

/** Convenience PressableInput for fields that open a sheet/picker. */
export const PressableInputField = memo<{
  label: string;
  value?: string;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  onPress: () => void;
  error?: string;
}>(({ label, value, placeholder, leftIcon, rightIcon, required, onPress, error }) => {
  const { styles, theme } = useStyles(stylesheet);
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text variant="label" color={error ? 'danger' : 'secondary'} style={styles.label}>
          {label}
        </Text>
        {required ? (
          <Text variant="label" color="brand" style={styles.required}>
            *
          </Text>
        ) : null}
      </View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.box,
          { borderColor: error ? theme.colors.semantic.danger : theme.colors.border.subtle },
          pressed && { opacity: theme.opacity.pressed },
        ]}
      >
        {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text variant="bodyLarge" color={value ? 'primary' : 'muted'} numberOfLines={1}>
            {value || placeholder || '—'}
          </Text>
        </View>
        {rightIcon ? <View style={styles.icon}>{rightIcon}</View> : null}
      </Pressable>
      {error ? (
        <Text variant="caption" color="danger" style={styles.helper}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});
PressableInputField.displayName = 'PressableInputField';

const stylesheet = createStyleSheet((theme) => ({
  wrap: { width: '100%' },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
    paddingLeft: 2,
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.6,
  },
  required: {
    fontSize: 11,
    fontWeight: '700',
  },

  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bg.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border.subtle,
    borderRadius: theme.radius.base,
    paddingHorizontal: theme.spacing.base,
    minHeight: 52,
  },
  boxMultiline: {
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.md,
  },

  input: {
    flex: 1,
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 0,
    margin: 0,
    minHeight: 24,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 0,
  },

  icon: { paddingRight: theme.spacing.sm, paddingVertical: theme.spacing.sm },

  helper: { marginTop: 6, paddingLeft: 2 },
}));
