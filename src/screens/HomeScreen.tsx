import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';
import { colors, typography, spacing, radius } from '../theme';
import { dictionarySize } from '../game/dictionary';

export const HomeScreen: React.FC = () => {
  const navigate = useGameStore((s) => s.navigate);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Animated.Text
            entering={FadeIn.delay(80).duration(500)}
            style={[typography.overline, { color: colors.inkMuted, marginBottom: spacing.md }]}
          >
            Est. 1932 · Word Card Game
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(140).duration(700).springify()}
            style={styles.wordmark}
          >
            Lexo
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(220).duration(700).springify()}
            style={[typography.h3, styles.subtitle]}
          >
            A game of words, wagered one letter at a time.
          </Animated.Text>

          <View style={styles.divider} />

          <Animated.View
            entering={FadeInDown.delay(380).duration(700).springify()}
            style={{ width: '100%' }}
          >
            <Button
              label="New Game"
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => navigate('setup')}
            />
            <View style={{ height: spacing.md }} />
            <Button
              label="How to Play"
              variant="ghost"
              size="md"
              fullWidth
              onPress={() => navigate('how-to-play')}
            />
          </Animated.View>
        </View>

        <Animated.View entering={FadeIn.delay(600).duration(600)} style={styles.footer}>
          <View style={styles.statsRow}>
            <Stat label="Players" value="2–4" />
            <Stat label="Dictionary" value={`${(dictionarySize() / 1000).toFixed(1)}k`} />
            <Stat label="Deck" value="52 cards" />
          </View>
          <Text style={[typography.small, styles.footerNote]}>
            Pass-and-play · offline · device-local
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={[typography.overline, { color: colors.inkMuted }]}>{label}</Text>
    <Text style={[typography.h3, { color: colors.ink, marginTop: 2 }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  wordmark: {
    ...typography.display,
    color: colors.ink,
    fontSize: 72,
    lineHeight: 80,
    letterSpacing: -2,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: spacing.md,
    fontFamily: undefined, // use italic serif feel
    fontStyle: 'italic',
    maxWidth: 360,
  },
  divider: {
    width: 48,
    height: 1,
    backgroundColor: colors.inkMuted,
    opacity: 0.5,
    marginVertical: spacing.xxl,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.paperEdge,
    marginBottom: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  footerNote: {
    color: colors.inkMuted,
    marginTop: spacing.sm,
  },
});
