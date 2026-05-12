import { View, Image, ViewStyle, ImageStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import defaultAvatar from '../../assets/profile/user.png';

interface AvatarProps {
  uri?: string;
  size?: number;
}

const stylesheet = StyleSheet.create(theme => ({
  avatar: {
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceContainer,
    borderWidth: 4,
    borderColor: theme.colors.surfaceContainerLowest,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
}));

export function Avatar({ uri, size = 128 }: AvatarProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  return (
    <View style={[styles.avatar as ViewStyle, { width: size, height: size }]}>
      <Image
        source={uri ? { uri } : defaultAvatar}
        style={styles.image as ImageStyle}
        resizeMode="cover"
      />
    </View>
  );
}
