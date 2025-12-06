// Mock expo winter runtime
jest.mock('expo/src/winter/runtime.native', () => ({}));
jest.mock('expo/src/winter/installGlobal', () => ({}));

// Mock expo module
jest.mock('expo', () => ({}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', countryCode: 'US' }],
  locale: 'en-US',
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: () => ({}),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock Reanimated
jest.mock('react-native-reanimated', () => ({
  default: {
    call: () => {},
    createAnimatedComponent: (component) => component,
    Value: jest.fn(),
    event: jest.fn(),
    add: jest.fn(),
    eq: jest.fn(),
    set: jest.fn(),
    cond: jest.fn(),
    interpolate: jest.fn(),
    Extrapolate: { CLAMP: jest.fn() },
    useSharedValue: jest.fn(),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn(),
    withSpring: jest.fn(),
    withDelay: jest.fn(),
    withSequence: jest.fn(),
    withRepeat: jest.fn(),
    cancelAnimation: jest.fn(),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      bezier: jest.fn(),
    },
  },
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((val) => val),
  withSpring: jest.fn((val) => val),
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
  },
}));

// Global fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);
