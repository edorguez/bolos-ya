import { View, Text, type ViewStyle, type TextStyle } from 'react-native';
import { StyleSheet } from '../../styles/createStyleSheet';
import { useAppTheme } from '../../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface TipCardProps {
  title: string;
  text: string;
  icon?: string;
}

const stylesheet = StyleSheet.create(theme => ({
  card: {
    backgroundColor: theme.colors.sunburstYellow,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    overflow: 'hidden',
  },
  blurCircle: {
    position: 'absolute',
    right: -theme.spacing.lg,
    bottom: -theme.spacing.lg,
    width: 128,
    height: 128,
    backgroundColor: theme.colors.white + '33',
    borderRadius: 64,
  },
  iconContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    zIndex: 10,
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.pepper,
    letterSpacing: theme.typography.letterSpacing.lg,
  },
  text: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.pepper,
    opacity: 0.8,
    fontWeight: theme.typography.fontWeight.regular,
  },
}));

export function TipCard({ title, text, icon = 'lightbulb' }: TipCardProps) {
  const theme = useAppTheme();
  const styles = stylesheet(theme);
  return (
    <View style={styles.card as ViewStyle}>
      <View style={styles.blurCircle as ViewStyle} />
      <View style={styles.iconContainer as ViewStyle}>
        <MaterialIcons name={icon as any} size={24} color={theme.colors.deepAmber} />
      </View>
      <View style={styles.content as ViewStyle}>
        <Text style={styles.title as TextStyle}>{title}</Text>
        <Text style={styles.text as TextStyle}>{text}</Text>
      </View>
    </View>
  );
}
