import { Stack } from 'expo-router';
import { colors } from '../../../config/theme';

export default function StagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.neutral[50] },
      }}
    />
  );
}
