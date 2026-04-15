import { View, Text, Pressable, type ViewStyle, type TextStyle } from 'react-native'
import { StyleSheet } from '../../styles/createStyleSheet'
import { useAppTheme } from '../../styles/theme'
import { MaterialIcons } from '@expo/vector-icons'
import { HorizontalScrollWithIndicators } from '../shared/HorizontalScrollWithIndicators'

export interface SupermarketOption {
  id: string
  name: string
  icon: string
  selected: boolean
}

interface SupermarketCarouselProps {
  supermarkets: SupermarketOption[]
  onSelect: (id: string) => void
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    gap: theme.spacing.xs,
  },
  carousel: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    marginHorizontal: -theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
  },
  carouselContent: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  option: {
    width: 80,
    height: 96,
    backgroundColor: '#ffffff80',
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginVertical: 2,
  },
  optionSelected: {
    borderColor: '#5918af',
    backgroundColor: '#ffffff',
    transform: [{ scale: 1.05 }],
  },
  icon: {
    color: '#94a3b8',
  },
  iconSelected: {
    color: '#5918af',
  },
  name: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#94a3b8',
    textAlign: 'center',
  },
  nameSelected: {
    color: '#5918af',
  },
}))

export function SupermarketCarousel({ supermarkets, onSelect }: SupermarketCarouselProps) {
  const theme = useAppTheme()
  const styles = stylesheet(theme)

  return (
    <View style={[styles.container as ViewStyle, { position: 'relative' }]}>
      <HorizontalScrollWithIndicators
        contentContainerStyle={styles.carouselContent as ViewStyle}
        style={styles.carousel as ViewStyle}
      >
        {supermarkets.map(supermarket => (
          <Pressable
            key={supermarket.id}
            style={[
              styles.option as ViewStyle,
              supermarket.selected && (styles.optionSelected as ViewStyle),
            ]}
            onPress={() => onSelect(supermarket.id)}
          >
            <MaterialIcons
              name={supermarket.icon as any}
              size={24}
              color={supermarket.selected ? '#5918af' : '#94a3b8'}
            />
            <Text
              style={[
                styles.name as TextStyle,
                supermarket.selected && (styles.nameSelected as TextStyle),
              ]}
            >
              {supermarket.name}
            </Text>
          </Pressable>
        ))}
      </HorizontalScrollWithIndicators>
    </View>
  )
}
