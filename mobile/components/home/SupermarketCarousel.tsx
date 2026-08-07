import { View, Text, type ViewStyle, type TextStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { PressableScale } from '../shared/PressableScale';
import { MaterialIcons } from '@expo/vector-icons';
import { HorizontalScrollWithIndicators } from '../shared/HorizontalScrollWithIndicators';

export interface SupermarketOption {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

interface SupermarketCarouselProps {
  supermarkets: SupermarketOption[];
  onSelect: (id: string) => void;
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    gap: theme.spacing.xs,
  },
  carousel: {
    marginHorizontal: -theme.spacing.xs,
  },
  carouselContent: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  option: {
    width: 80,
    height: 96,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
    marginVertical: 2,
  },
  optionSelected: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    boxShadow: theme.shadows.medium,
    color: theme.colors.onSurface,
  },
  icon: {
    color: theme.colors.ash,
  },
  iconSelected: {
    color: theme.colors.midnight,
  },
  name: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.ash,
    textAlign: 'center',
  },
  nameSelected: {
    color: theme.colors.midnight,
  },
}));

export function SupermarketCarousel({ supermarkets, onSelect }: SupermarketCarouselProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);

  return (
    <View style={[styles.container as ViewStyle, { position: 'relative' }]}>
      <HorizontalScrollWithIndicators
        contentContainerStyle={styles.carouselContent as ViewStyle}
        style={styles.carousel as ViewStyle}
      >
        {supermarkets.map(supermarket => (
          <PressableScale
            key={supermarket.id}
            pressedScale={1.05}
            style={[
              styles.option as ViewStyle,
              supermarket.selected && (styles.optionSelected as ViewStyle),
            ]}
            onPress={() => onSelect(supermarket.id)}
          >
            <MaterialIcons
              name={supermarket.icon as keyof typeof MaterialIcons.glyphMap}
              size={24}
              color={supermarket.selected ? theme.colors.midnight : theme.colors.ash}
            />
            <Text
              style={[
                styles.name as TextStyle,
                supermarket.selected && (styles.nameSelected as TextStyle),
              ]}
            >
              {supermarket.name}
            </Text>
          </PressableScale>
        ))}
      </HorizontalScrollWithIndicators>
    </View>
  );
}
