import { memo } from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';

export interface DividerProps {
  spacing?: number;
  inset?: number;
}

export const Divider = memo<DividerProps>(({ spacing = 0, inset = 0 }) => {
  const { styles } = useStyles(stylesheet);
  return <View style={[styles.line, { marginVertical: spacing, marginLeft: inset }]} />;
});
Divider.displayName = 'Divider';

const stylesheet = createStyleSheet((theme) => ({
  line: {
    height: 1,
    backgroundColor: theme.colors.border.subtle,
  },
}));
