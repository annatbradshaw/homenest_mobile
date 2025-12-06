import React, { useEffect, useRef } from 'react';
import { StyleSheet, Image, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashProps {
  onAnimationComplete: () => void;
}

export function AnimatedSplash({ onAnimationComplete }: AnimatedSplashProps) {
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Show splash for 2 seconds, then fade out
    const timeout = setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        onAnimationComplete();
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <Image
        source={require('../../assets/splash-icon.png')}
        style={styles.splash}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: '#EEF6FB',
  },
  splash: {
    width: width,
    height: height,
  },
});
