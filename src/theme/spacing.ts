// 4pt grid. Using a named scale keeps spacing coherent across the app.
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

// Card dimensions — used by layout calcs
export const cardSize = {
  width: 56,
  height: 76,
  radius: 8,
};

// A larger "featured" card used on the board
export const boardCardSize = {
  width: 44,
  height: 60,
  radius: 6,
};

// Spring configs for Reanimated — tuned for a tactile, paper-like feel
export const springs = {
  // Snappy but not bouncy — for card movement
  snappy: { damping: 18, stiffness: 220, mass: 0.6 },
  // A little more life — for buttons, reveals
  soft: { damping: 14, stiffness: 160, mass: 0.8 },
  // Bouncier — for celebratory moments
  bouncy: { damping: 10, stiffness: 180, mass: 0.7 },
};

export const timing = {
  quick: 180,
  base: 280,
  slow: 440,
};
