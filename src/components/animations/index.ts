// HomeNest Animation Components
// Based on brandbook animation specifications

// Entry animations - use for screen/component entrance
export {
  FadeInView,
  FadeInUp,
  FadeInScale,
  SlideInLeft,
  SlideInRight,
  BounceIn,
} from './EntryAnimations';

// Button interactions - use for touchable elements
export {
  AnimatedButton,
  RippleButton,
  BounceButton,
} from './AnimatedButton';

// Celebration - use for task completion, achievements
export { ConfettiCelebration } from './ConfettiCelebration';

// Continuous animations - use for decorative elements, indicators
export {
  FloatingElement,
  FloatingElementSlow,
  BreathingElement,
  PulsingElement,
  SpinningElement,
  SwayingElement,
  WavingElement,
} from './ContinuousAnimations';

// List animations - use for FlatLists and scrollable content
export {
  AnimatedList,
  AnimatedListItem,
  useAnimatedListItem,
  enteringAnimations,
  layoutAnimation,
} from './AnimatedList';

// Loading animations - use for loading states
export {
  NestLoadingAnimation,
  DotsLoadingAnimation,
} from './NestLoadingAnimation';
