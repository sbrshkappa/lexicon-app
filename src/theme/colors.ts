// Literary minimalism: warm paper, deep ink, restrained accents.
// Inspired by letterpress, old dictionaries, and fine stationery.

export const colors = {
  // Backgrounds
  paper: '#FAF7F2',           // Warm off-white, main background
  paperDeep: '#F2EDE3',       // Slightly deeper paper (for cards backdrop, table)
  paperEdge: '#E8E1D3',       // Border/edge tone

  // Ink (text)
  ink: '#1A1814',             // Near-black with warmth
  inkSoft: '#4A443C',         // Body text
  inkMuted: '#8B8578',        // Secondary/muted
  inkGhost: '#BCB5A6',        // Disabled / placeholder

  // Accent — deep burgundy evokes antique book bindings
  accent: '#7A2E2E',
  accentDeep: '#5C1F1F',
  accentSoft: '#A95858',

  // Cards
  cardFace: '#FFFDF8',        // Slight cream, not pure white
  cardBack: '#7A2E2E',        // Burgundy back
  cardShadow: 'rgba(26, 24, 20, 0.12)',
  cardBorder: '#E4DCC8',

  // Wild card uses gold accent
  wildFace: '#FFF8E1',
  wildAccent: '#B8860B',

  // Feedback
  success: '#3D6B3D',
  error: '#A03232',
  warning: '#B8860B',

  // Utility
  overlay: 'rgba(26, 24, 20, 0.45)',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
