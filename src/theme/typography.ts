import { TextStyle } from 'react-native';

// Font families — loaded in App.tsx via @expo-google-fonts
export const fonts = {
  // Fraunces: distinctive variable serif, gives letter cards literary weight
  serif: 'Fraunces_400Regular',
  serifMedium: 'Fraunces_500Medium',
  serifBold: 'Fraunces_700Bold',
  serifBlack: 'Fraunces_900Black',
  serifItalic: 'Fraunces_400Regular_Italic',

  // Inter: refined UI sans
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
} as const;

export const typography = {
  // Display — the big moments
  display: {
    fontFamily: fonts.serifBlack,
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -1.5,
  } as TextStyle,

  h1: {
    fontFamily: fonts.serifBold,
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: -0.8,
  } as TextStyle,

  h2: {
    fontFamily: fonts.serifMedium,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.4,
  } as TextStyle,

  h3: {
    fontFamily: fonts.serifMedium,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
  } as TextStyle,

  // Body — readable, workhorse
  body: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.1,
  } as TextStyle,

  bodyMedium: {
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.1,
  } as TextStyle,

  small: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
  } as TextStyle,

  // Labels — all caps, tracked out for that editorial feel
  overline: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.6,
    textTransform: 'uppercase' as const,
  } as TextStyle,

  // Button
  button: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
  } as TextStyle,

  // Letter-on-card face
  cardLetter: {
    fontFamily: fonts.serifBlack,
    letterSpacing: -0.5,
  } as TextStyle,

  cardValue: {
    fontFamily: fonts.sansSemi,
    letterSpacing: 0.2,
  } as TextStyle,
};
