import { colorFromName, initialsFromName } from '@/utils/colorFromName';
import { memo } from 'react';
import { View } from 'react-native';
import { createStyleSheet, useStyles } from '@/lib/unistyles';
import { Text } from './Text';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  imageUri?: string;
  online?: boolean;
}

const SIZE_MAP: Record<AvatarSize, { box: number; font: number; dot: number }> = {
  xs: { box: 28, font: 11, dot: 8 },
  sm: { box: 36, font: 14, dot: 10 },
  md: { box: 44, font: 16, dot: 12 },
  lg: { box: 64, font: 22, dot: 14 },
  xl: { box: 80, font: 28, dot: 16 },
};

export const Avatar = memo<AvatarProps>(({ name, size = 'md', online }) => {
  const { styles, theme } = useStyles(stylesheet);
  const { box, font, dot } = SIZE_MAP[size];
  const bg = colorFromName(name);

  return (
    <View
      style={[styles.box, { width: box, height: box, borderRadius: box / 2, backgroundColor: bg }]}
    >
      <Text style={{ fontSize: font, color: '#FFFFFF', fontWeight: '700' }}>
        {initialsFromName(name)}
      </Text>
      {online ? (
        <View
          style={[
            styles.onlineDot,
            {
              width: dot,
              height: dot,
              borderRadius: dot / 2,
              borderColor: theme.colors.bg.base,
            },
          ]}
        />
      ) : null}
    </View>
  );
});
Avatar.displayName = 'Avatar';

const stylesheet = createStyleSheet((theme) => ({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  onlineDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: theme.colors.semantic.success,
    borderWidth: 2,
  },
}));
