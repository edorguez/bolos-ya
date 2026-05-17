import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../styles/theme';

interface EmptyCartsStateProps {
  text: string;
  compact?: boolean;
}

export function EmptyCartsState({ text, compact }: EmptyCartsStateProps) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        paddingVertical: compact ? theme.spacing.md : theme.spacing.xxl,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.4,
      }}
    >
      <View style={{ width: 96, height: 96, marginBottom: theme.spacing.md }}>
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: theme.colors.outline + '20',
            borderRadius: theme.borderRadius.md,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons name="folder" size={48} color={theme.colors.outline} />
        </View>
      </View>
      <Text
        style={{
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          color: theme.colors.onSurface,
          marginTop: theme.spacing.md,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
