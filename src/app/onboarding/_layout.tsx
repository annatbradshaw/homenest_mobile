import { Stack } from 'expo-router';
import { colors } from '../../config/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
