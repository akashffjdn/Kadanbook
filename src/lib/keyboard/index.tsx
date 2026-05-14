/**
 * Drop-in shim for `react-native-keyboard-controller` (Expo Go incompatible).
 * Uses RN's built-in KeyboardAvoidingView + ScrollView.
 */
import { forwardRef, type PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewProps,
  type ScrollView as RNScrollView,
} from 'react-native';

/** No-op provider — RN's keyboard handling is built in. */
export const KeyboardProvider = ({ children }: PropsWithChildren) => <>{children}</>;

export interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  bottomOffset?: number;
  enabled?: boolean;
}

export const KeyboardAwareScrollView = forwardRef<RNScrollView, KeyboardAwareScrollViewProps>(
  ({ children, bottomOffset, enabled = true, contentContainerStyle, ...rest }, ref) => {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={bottomOffset ?? 0}
        enabled={enabled}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={ref}
          contentContainerStyle={contentContainerStyle}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...rest}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  },
);
KeyboardAwareScrollView.displayName = 'KeyboardAwareScrollView';
