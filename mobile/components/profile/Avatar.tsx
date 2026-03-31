import { View, Image, Pressable } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
// @ts-ignore
import MaterialIcons from '@expo/vector-icons/build/MaterialIcons'
import { useAppTheme } from '../../styles/theme'

interface AvatarProps {
  uri?: string
  size?: number
  onEditPress?: () => void
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
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
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
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
}))

export function Avatar({ uri, size = 128, onEditPress }: AvatarProps) {
  const theme = useAppTheme()
  const styles = stylesheet

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { width: size, height: size }]}>
        {uri ? <Image source={{ uri }} style={styles.image} resizeMode="cover" /> : null}
      </View>
      <Pressable style={styles.editButton} onPress={onEditPress}>
        <MaterialIcons name="edit" size={16} color={theme.colors.surfaceContainerLowest} />
      </Pressable>
    </View>
  )
}
