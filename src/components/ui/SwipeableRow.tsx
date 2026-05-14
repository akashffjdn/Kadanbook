import { useHaptic } from '@/hooks/useHaptic';
import { memo, useCallback } from 'react';
import { useRef } from 'react';
import { Pressable, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { type SharedValue } from 'react-native-reanimated';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Text } from './Text';

export interface SwipeAction {
  label: string;
  icon?: React.ReactNode;
  color: string;
  onPress: () => void;
}

export interface SwipeableRowProps {
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onPress?: () => void;
  children: React.ReactNode;
}

const ActionButton = memo<{
  action: SwipeAction;
  closeOnPress: () => void;
}>(({ action, closeOnPress }) => {
  const { styles } = useStyles(stylesheet);
  const trigger = useHaptic();
  const handle = useCallback(() => {
    trigger('medium');
    closeOnPress();
    action.onPress();
  }, [action, closeOnPress, trigger]);
  return (
    <Pressable
      onPress={handle}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: action.color },
        pressed && { opacity: 0.85 },
      ]}
    >
      {action.icon ? <View style={{ marginBottom: 4 }}>{action.icon}</View> : null}
      <Text variant="caption" weight="semibold" color="onBrand">
        {action.label}
      </Text>
    </Pressable>
  );
});
ActionButton.displayName = 'ActionButton';

export const SwipeableRow = memo<SwipeableRowProps>(
  ({ leftActions, rightActions, onPress, children }) => {
    const ref = useRef<SwipeableMethods>(null);
    const close = useCallback(() => ref.current?.close(), []);

    const renderRight = (_progress: SharedValue<number>, _drag: SharedValue<number>) => {
      if (!rightActions || rightActions.length === 0) return null;
      return (
        <View style={{ flexDirection: 'row' }}>
          {rightActions.map((a) => (
            <ActionButton key={a.label} action={a} closeOnPress={close} />
          ))}
        </View>
      );
    };
    const renderLeft = (_progress: SharedValue<number>, _drag: SharedValue<number>) => {
      if (!leftActions || leftActions.length === 0) return null;
      return (
        <View style={{ flexDirection: 'row' }}>
          {leftActions.map((a) => (
            <ActionButton key={a.label} action={a} closeOnPress={close} />
          ))}
        </View>
      );
    };

    return (
      <GestureHandlerRootView>
        <ReanimatedSwipeable
          ref={ref}
          renderRightActions={rightActions ? renderRight : undefined}
          renderLeftActions={leftActions ? renderLeft : undefined}
          friction={2}
          rightThreshold={40}
          leftThreshold={40}
          overshootRight={false}
          overshootLeft={false}
        >
          <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
            {children}
          </Pressable>
        </ReanimatedSwipeable>
      </GestureHandlerRootView>
    );
  },
);
SwipeableRow.displayName = 'SwipeableRow';

const stylesheet = createStyleSheet(() => ({
  action: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
}));
