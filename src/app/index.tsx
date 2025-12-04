import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../stores/AuthContext';
import { LoadingSpinner } from '../components/ui';
import { colors } from '../config/theme';

export default function Index() {
  const { isAuthenticated, isLoading, memberships, user } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Give auth a moment to initialize
    const timer = setTimeout(() => {
      setReady(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !ready) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Loading..." />
      </View>
    );
  }

  // Not authenticated - go to login
  // Check both isAuthenticated and user to be sure
  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Authenticated but no memberships - go to onboarding
  if (memberships.length === 0) {
    return <Redirect href="/onboarding" />;
  }

  // Authenticated with memberships - go to main app
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});
