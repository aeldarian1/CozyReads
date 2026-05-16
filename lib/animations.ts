/**
 * Animation utilities for consistent motion design across the application.
 * Based on Material Design motion principles and modern web standards.
 */

// Animation durations (in milliseconds)
export const DURATIONS = {
  fastest: 100,
  fast: 150,
  normal: 250,
  slow: 400,
  slowest: 600,
} as const;

// Animation easing functions
export const EASINGS = {
  // Standard easing - Use for most animations
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Accelerate - Use when elements leave the screen
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',

  // Decelerate - Use when elements enter the screen
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',

  // Sharp - Use for quick, precise movements
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',

  // Smooth - Use for gentle, flowing movements
  smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',

  // Bounce - Use sparingly for playful effects
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// CSS transition strings for common use cases
export const transitions = {
  // Default transition for most properties
  default: `all ${DURATIONS.normal}ms ${EASINGS.standard}`,

  // Fast transitions for hover effects
  fast: `all ${DURATIONS.fast}ms ${EASINGS.standard}`,

  // Slow transitions for large movements
  slow: `all ${DURATIONS.slow}ms ${EASINGS.smooth}`,

  // Color transitions
  color: `color ${DURATIONS.fast}ms ${EASINGS.standard}, background-color ${DURATIONS.fast}ms ${EASINGS.standard}, border-color ${DURATIONS.fast}ms ${EASINGS.standard}`,

  // Transform transitions
  transform: `transform ${DURATIONS.normal}ms ${EASINGS.smooth}`,

  // Opacity transitions
  opacity: `opacity ${DURATIONS.normal}ms ${EASINGS.standard}`,
} as const;

// Framer Motion variants for common animations
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATIONS.normal / 1000, ease: [0.4, 0, 0.2, 1] },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: DURATIONS.normal / 1000, ease: [0, 0, 0.2, 1] },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: DURATIONS.normal / 1000, ease: [0, 0, 0.2, 1] },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: DURATIONS.normal / 1000, ease: [0.16, 1, 0.3, 1] },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: DURATIONS.normal / 1000, ease: [0, 0, 0.2, 1] },
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: DURATIONS.normal / 1000, ease: [0, 0, 0.2, 1] },
};

export const slideUp = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: { duration: DURATIONS.slow / 1000, ease: [0, 0, 0.2, 1] },
};

export const slideDown = {
  initial: { y: '-100%' },
  animate: { y: 0 },
  exit: { y: '-100%' },
  transition: { duration: DURATIONS.slow / 1000, ease: [0, 0, 0.2, 1] },
};

// Stagger animations for lists
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATIONS.fast / 1000 },
};

// Spring animations for interactive elements
export const spring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

export const gentleSpring = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 25,
};

export const bouncySpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 20,
};

/**
 * CSS keyframes for animations that need to be defined in CSS
 */
export const keyframes = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,

  fadeOut: `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `,

  slideUp: `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,

  slideDown: `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,

  scaleIn: `
    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `,

  spin: `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `,

  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `,

  bounce: `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
        animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
      }
      50% {
        transform: translateY(-25%);
        animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
      }
    }
  `,
};

/**
 * Helper function to create a delay for staggered animations
 */
export function getStaggerDelay(index: number, delayMs: number = 50): number {
  return index * delayMs;
}

/**
 * Helper function to create a spring config with custom values
 */
export function createSpring(stiffness: number = 300, damping: number = 30) {
  return {
    type: 'spring' as const,
    stiffness,
    damping,
  };
}

/**
 * Presets for common animation patterns
 */
export const animationPresets = {
  // Modal/Dialog entrance
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: DURATIONS.normal / 1000, ease: [0, 0, 0.2, 1] },
  },

  // Bottom sheet entrance (mobile)
  bottomSheet: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: { duration: DURATIONS.slow / 1000, ease: [0, 0, 0.2, 1] },
  },

  // Backdrop fade
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: DURATIONS.fast / 1000 },
  },

  // Card hover effect
  cardHover: {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    transition: { duration: DURATIONS.fast / 1000, ease: [0.16, 1, 0.3, 1] },
  },

  // Button press effect
  buttonPress: {
    rest: { scale: 1 },
    pressed: { scale: 0.98 },
    transition: { duration: DURATIONS.fastest / 1000 },
  },
};
