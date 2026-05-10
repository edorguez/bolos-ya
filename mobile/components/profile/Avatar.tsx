import { View, Image, ViewStyle, ImageStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';

interface AvatarProps {
  uri?: string;
  size?: number;
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    position: 'relative',
  },
  avatar: {
    borderRadius: 9999,
    backgroundColor: theme.colors.surfaceContainer,
    borderWidth: 4,
    borderColor: theme.colors.surfaceContainerLowest,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: theme.colors.midnight,
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export function Avatar({ uri, size = 128 }: AvatarProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  return (
    <View style={styles.container as ViewStyle}>
      <View style={[styles.avatar as ViewStyle, { width: size, height: size }]}>
        {uri ? (
          <Image source={{ uri }} style={styles.image as ImageStyle} resizeMode="cover" />
        ) : null}
      </View>
    </View>
  );
}
