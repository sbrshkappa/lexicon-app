import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme';

const sections: { heading: string; body: string }[] = [
  {
    heading: 'Objective',
    body: "Be the last player standing. Each round, one player goes out by emptying their hand — everyone else collects penalty points for the cards they're left holding. Reach 100 points and you're eliminated.",
  },
  {
    heading: 'Your Hand',
    body: 'Each player starts with 10 cards. Cards show a letter and a point value — rarer letters are worth more. One wild card (the Master) can stand in for any letter.',
  },
  {
    heading: 'On Your Turn',
    body: 'You must do exactly one of three things:\n\n1. Play a word — lay down 1 or more cards from your hand that spell a valid English word.\n\n2. Extend a word — add cards to the front or back of a word already on the table to make a new valid word.\n\n3. Discard & draw — swap one card from your hand with a new card from the deck.',
  },
  {
    heading: 'Wild Card (Master)',
    body: "When you stage the wild card, you'll be asked to assign it a letter. That letter is locked in once the word is played.",
  },
  {
    heading: 'Going Out',
    body: 'The moment a player plays their last card, the round ends. That player scores nothing. Everyone else adds up the point values of their remaining cards — those become penalty points.',
  },
  {
    heading: 'Winning',
    body: 'The last player not eliminated wins. If everyone hits 100 at once, the player with the lowest score wins.',
  },
];

export const HowToPlayScreen: React.FC = () => {
  const navigate = useGameStore((s) => s.navigate);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.Text
          entering={FadeIn.duration(400)}
          style={[typography.overline, styles.overline]}
        >
          Rules
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(80).duration(500).springify()}
          style={[typography.h1, styles.title]}
        >
          How to Play
        </Animated.Text>

        {sections.map((s, i) => (
          <Animated.View
            key={s.heading}
            entering={FadeInDown.delay(160 + i * 80).duration(480).springify()}
            style={styles.section}
          >
            <Text style={[typography.h3, styles.heading]}>{s.heading}</Text>
            <Text style={[typography.body, styles.body]}>{s.body}</Text>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Back" variant="ghost" size="md" onPress={() => navigate('home')} />
        <Button label="New Game" variant="primary" size="lg" onPress={() => navigate('setup')} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  overline: {
    color: colors.inkMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  heading: {
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  body: {
    color: colors.inkSoft,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderTopWidth: 1,
    borderColor: colors.paperEdge,
    gap: spacing.md,
  },
});
