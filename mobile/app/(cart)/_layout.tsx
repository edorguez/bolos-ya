import { Stack } from 'expo-router'
import { useAppTheme } from '../../styles/theme'

export default function CartLayout() {
  const theme = useAppTheme()

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="[id]" />
    </Stack>
  )
}
