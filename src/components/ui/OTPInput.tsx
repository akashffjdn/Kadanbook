import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  type NativeSyntheticEvent,
  TextInput,
  type TextInputKeyPressEventData,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

export interface OTPInputHandle {
  shake: () => void;
  clear: () => void;
  focus: () => void;
}

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  error?: boolean;
  success?: boolean;
  autoFocus?: boolean;
}

export const OTPInput = memo(
  forwardRef<OTPInputHandle, OTPInputProps>(
    ({ length = 6, value, onChange, onComplete, error, success, autoFocus }, ref) => {
      const { styles, theme } = useStyles(stylesheet);
      const inputRef = useRef<TextInput>(null);
      const [focused, setFocused] = useState(false);
      const shakeX = useSharedValue(0);

      useImperativeHandle(ref, () => ({
        shake: () => {
          shakeX.value = withSequence(
            withTiming(-8, { duration: 60, easing: Easing.linear }),
            withTiming(8, { duration: 60, easing: Easing.linear }),
            withTiming(-6, { duration: 60, easing: Easing.linear }),
            withTiming(6, { duration: 60, easing: Easing.linear }),
            withTiming(0, { duration: 60, easing: Easing.linear }),
          );
        },
        clear: () => onChange(''),
        focus: () => inputRef.current?.focus(),
      }));

      const animStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

      useEffect(() => {
        if (value.length === length && onComplete) onComplete(value);
      }, [value, length, onComplete]);

      const handleChange = useCallback(
        (raw: string) => {
          const cleaned = raw.replace(/\D/g, '').slice(0, length);
          onChange(cleaned);
        },
        [length, onChange],
      );

      const handleKey = useCallback((_e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
        // delegate to onChange via input itself
      }, []);

      const cells = Array.from({ length });
      const activeIdx = value.length;

      return (
        <Animated.View style={[styles.row, animStyle]}>
          {cells.map((_, i) => {
            const filled = i < value.length;
            const isActive = focused && i === activeIdx;
            const borderColor = error
              ? theme.colors.semantic.danger
              : success
                ? theme.colors.semantic.success
                : isActive
                  ? theme.colors.border.focus
                  : theme.colors.border.subtle;
            const bg = success ? theme.colors.semantic.successBg : theme.colors.bg.surface;
            return (
              <View
                key={i}
                style={[
                  styles.cell,
                  {
                    borderColor,
                    backgroundColor: bg,
                    shadowColor: isActive ? theme.colors.brand.primary : 'transparent',
                  },
                ]}
              >
                {filled && value[i] ? (
                  <Animated.Text style={styles.digit}>{value[i]}</Animated.Text>
                ) : null}
              </View>
            );
          })}
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={handleChange}
            onKeyPress={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={length}
            autoFocus={autoFocus}
            style={styles.hidden}
            caretHidden
          />
        </Animated.View>
      );
    },
  ),
);
OTPInput.displayName = 'OTPInput';

const stylesheet = createStyleSheet((theme) => ({
  row: { flexDirection: 'row', gap: theme.spacing.md, justifyContent: 'center' },
  cell: {
    width: 48,
    height: 56,
    borderRadius: theme.radius.base,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  digit: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  hidden: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
}));
