import { Stack } from 'expo-router';
import { colors } from '../../../config/theme';

export default function ExpensesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[50] },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
